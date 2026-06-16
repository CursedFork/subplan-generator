-- =====================================================================
-- Roster schema — classes + students
-- Migration: 20260616000000_roster_schema.sql
--
-- Shared data model for Seating Chart Maker and Group Mate Maker.
-- A "class" is a named group of students owned by one user.
-- A "student" belongs to exactly one class; per-student attributes
-- are stored as JSONB so both tools can evolve their fields
-- independently without schema migrations.
-- =====================================================================

-- =====================================================================
-- classes
-- =====================================================================
create table public.classes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  grade      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index classes_user_id_idx on public.classes(user_id);

alter table public.classes enable row level security;

create policy "classes_select_own"
  on public.classes for select using (auth.uid() = user_id);
create policy "classes_insert_own"
  on public.classes for insert with check (auth.uid() = user_id);
create policy "classes_update_own"
  on public.classes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "classes_delete_own"
  on public.classes for delete using (auth.uid() = user_id);

-- Reuse the existing helper — defined in 20260524000000_initial_schema.sql.
create trigger classes_set_updated_at
  before update on public.classes
  for each row execute function public.set_updated_at();

-- =====================================================================
-- students
-- =====================================================================
-- Ownership flows through classes (student → class → user), so RLS
-- checks auth.uid() via a subquery rather than a direct user_id column.
-- This avoids denormalizing user_id onto every student row and keeps
-- the ownership source of truth in classes.
-- =====================================================================
create table public.students (
  id         uuid primary key default gen_random_uuid(),
  class_id   uuid not null references public.classes(id) on delete cascade,
  name       text not null,
  -- Flexible per-student data. Both tools read/write their own keys:
  --   Seating Chart: seating_preference, cannot_sit_near (uuid[])
  --   Group Mate:    reading_level, group_leader, iep, notes
  -- Unknown keys are ignored, so tools don't interfere with each other.
  attributes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index students_class_id_idx on public.students(class_id);

alter table public.students enable row level security;

create policy "students_select_own"
  on public.students for select
  using (
    exists (
      select 1 from public.classes
      where id = students.class_id and user_id = auth.uid()
    )
  );

create policy "students_insert_own"
  on public.students for insert
  with check (
    exists (
      select 1 from public.classes
      where id = class_id and user_id = auth.uid()
    )
  );

create policy "students_update_own"
  on public.students for update
  using (
    exists (
      select 1 from public.classes
      where id = students.class_id and user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.classes
      where id = students.class_id and user_id = auth.uid()
    )
  );

create policy "students_delete_own"
  on public.students for delete
  using (
    exists (
      select 1 from public.classes
      where id = students.class_id and user_id = auth.uid()
    )
  );

-- =====================================================================
-- Comments
-- =====================================================================
comment on table public.classes is
  'A named class roster owned by one teacher. Shared by Seating Chart and Group Mate tools.';
comment on table public.students is
  'A student in a class. Attributes JSONB holds tool-specific fields (seating prefs, reading level, IEP, etc.).';
comment on column public.students.attributes is
  'Flexible per-student data. Keys used: seating_preference (text), cannot_sit_near (uuid[]), reading_level (text), group_leader (bool), iep (bool), notes (text).';
