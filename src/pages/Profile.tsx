import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useProfile, useUpdateProfile, useUpdateSchoolInfo } from '@/hooks/useProfile';
import type { SchoolInfo, AdminContact, HelpfulStaff, ScheduleBlock } from '@/types/app';

function emptyContact(): AdminContact { return { name: '', extension: null }; }
function emptyBlock(): ScheduleBlock { return { period: '', start_time: '', end_time: '' }; }
function emptySchoolInfo(): SchoolInfo {
  return {
    school_name: null, school_year: null,
    grade: null, subject: null, grades_covered: [],
    principal: null, assistant_principal: null,
    school_counselor: null, school_psychologist: null,
    helpful_staff: [],
    schedule: [],
    emergency_procedures: null, health_concerns: null,
    bathroom_rules: null, behavior_management: null,
    nurses_office: null, special_instructions: null,
    notes: null,
  };
}

export default function Profile() {
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === 'true';

  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const updateSchoolInfo = useUpdateSchoolInfo();

  const [displayName, setDisplayName] = useState('');
  const [info, setInfo] = useState<SchoolInfo>(emptySchoolInfo());
  const [staffInput, setStaffInput] = useState({ name: '', role: '' });
  const [blockInput, setBlockInput] = useState<ScheduleBlock>(emptyBlock());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? '');
    setInfo({
      ...emptySchoolInfo(),
      ...profile.school_info,
      schedule: profile.school_info?.schedule ?? [],
    });
  }, [profile]);

  function setField<K extends keyof SchoolInfo>(key: K, value: SchoolInfo[K]) {
    setInfo(prev => ({ ...prev, [key]: value }));
  }

  function setContact(
    key: 'principal' | 'assistant_principal' | 'school_counselor' | 'school_psychologist',
    field: keyof AdminContact,
    value: string,
  ) {
    setInfo(prev => {
      const existing = prev[key] ?? emptyContact();
      return { ...prev, [key]: { ...existing, [field]: value || null } };
    });
  }

  function addStaff() {
    if (!staffInput.name.trim()) return;
    const member: HelpfulStaff = { name: staffInput.name.trim(), role: staffInput.role.trim() };
    setInfo(prev => ({ ...prev, helpful_staff: [...prev.helpful_staff, member] }));
    setStaffInput({ name: '', role: '' });
  }

  function removeStaff(i: number) {
    setInfo(prev => ({ ...prev, helpful_staff: prev.helpful_staff.filter((_, idx) => idx !== i) }));
  }

  function addBlock() {
    if (!blockInput.period.trim()) return;
    const block: ScheduleBlock = {
      period: blockInput.period.trim(),
      start_time: blockInput.start_time.trim(),
      end_time: blockInput.end_time.trim(),
    };
    setInfo(prev => ({ ...prev, schedule: [...prev.schedule, block] }));
    setBlockInput(emptyBlock());
  }

  function removeBlock(i: number) {
    setInfo(prev => ({ ...prev, schedule: prev.schedule.filter((_, idx) => idx !== i) }));
  }

  function moveBlock(i: number, dir: -1 | 1) {
    setInfo(prev => {
      const arr = [...prev.schedule];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return prev;
      const tmp = arr[i]!;
      arr[i] = arr[j]!;
      arr[j] = tmp;
      return { ...prev, schedule: arr };
    });
  }

  async function handleSave() {
    // Normalize empty strings to null
    const normalized: SchoolInfo = {
      ...info,
      school_name: info.school_name || null,
      school_year: info.school_year || null,
      grade: info.grade || null,
      subject: info.subject || null,
      emergency_procedures: info.emergency_procedures || null,
      health_concerns: info.health_concerns || null,
      bathroom_rules: info.bathroom_rules || null,
      behavior_management: info.behavior_management || null,
      nurses_office: info.nurses_office || null,
      special_instructions: info.special_instructions || null,
      notes: info.notes || null,
      principal: info.principal?.name ? info.principal : null,
      assistant_principal: info.assistant_principal?.name ? info.assistant_principal : null,
      school_counselor: info.school_counselor?.name ? info.school_counselor : null,
      school_psychologist: info.school_psychologist?.name ? info.school_psychologist : null,
    };

    await Promise.all([
      updateProfile.mutateAsync({ display_name: displayName || null }),
      updateSchoolInfo.mutateAsync(normalized),
    ]);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm font-sans text-ink-faint">Loading…</p>
      </div>
    );
  }

  const isSaving = updateProfile.isPending || updateSchoolInfo.isPending;
  const contact = (key: 'principal' | 'assistant_principal' | 'school_counselor' | 'school_psychologist') =>
    info[key] ?? emptyContact();

  return (
    <div className="space-y-10 max-w-2xl">
      <div>
        <h1 className="font-display text-display-lg text-ink">Profile</h1>
        <p className="font-sans text-sm text-ink-soft mt-1">
          Your school info pre-fills every new plan. The agent confirms it at the start of each session.
        </p>
      </div>

      {/* Onboarding welcome banner */}
      {isOnboarding && (
        <div className="rounded-md border border-sage/40 bg-sage/10 px-5 py-4 flex gap-3 items-start">
          <svg
            width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
            className="text-sage shrink-0 mt-0.5" aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div>
            <p className="font-sans text-sm font-semibold text-ink">Account confirmed — welcome!</p>
            <p className="font-sans text-sm text-ink-soft mt-0.5 leading-relaxed">
              Fill in your school info below. You only need to do this once — it automatically
              pre-fills every sub plan you create.
            </p>
          </div>
        </div>
      )}

      {/* Personal */}
      <Card>
        <h2 className="font-display text-display-md text-ink mb-6 rule-ornament">Personal</h2>
        <div className="space-y-4">
          <Field label="Display name">
            <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Jane Smith" />
          </Field>
        </div>
      </Card>

      {/* School info */}
      <Card>
        <h2 className="font-display text-display-md text-ink mb-6 rule-ornament">School</h2>
        <div className="space-y-4">
          <Field label="School name">
            <Input value={info.school_name ?? ''} onChange={e => setField('school_name', e.target.value)} placeholder="Lakewood Elementary School" />
          </Field>
          <Field label="School year">
            <Input value={info.school_year ?? ''} onChange={e => setField('school_year', e.target.value)} placeholder="2025-2026" className="max-w-[160px]" />
          </Field>
          <div className="flex gap-4">
            <Field label="Primary grade" className="flex-1">
              <Input value={info.grade ?? ''} onChange={e => setField('grade', e.target.value)} placeholder="e.g. 3 or K" />
            </Field>
            <Field label="Primary subject" className="flex-1">
              <Input value={info.subject ?? ''} onChange={e => setField('subject', e.target.value)} placeholder="e.g. Math" />
            </Field>
          </div>
          <Field label="All grades covered (for specialists)" hint="Comma-separated, e.g. 2, 3, 4">
            <Input
              value={info.grades_covered.join(', ')}
              onChange={e => setField('grades_covered', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="2, 3, 4"
            />
          </Field>
        </div>
      </Card>

      {/* Admin contacts */}
      <Card>
        <h2 className="font-display text-display-md text-ink mb-6 rule-ornament">Administration</h2>
        <div className="space-y-5">
          {(
            [
              ['principal', 'Principal'],
              ['assistant_principal', 'Assistant Principal'],
              ['school_counselor', 'School Counselor'],
              ['school_psychologist', 'School Psychologist'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex gap-3">
              <Field label={label} className="flex-1">
                <Input
                  value={contact(key).name}
                  onChange={e => setContact(key, 'name', e.target.value)}
                  placeholder="Full name"
                />
              </Field>
              <Field label="Extension" className="w-32">
                <Input
                  value={contact(key).extension ?? ''}
                  onChange={e => setContact(key, 'extension', e.target.value)}
                  placeholder="ext. or number"
                />
              </Field>
            </div>
          ))}
        </div>
      </Card>

      {/* Helpful staff */}
      <Card>
        <h2 className="font-display text-display-md text-ink mb-2 rule-ornament">Helpful Staff</h2>
        <p className="text-sm font-sans text-ink-soft mb-5">
          Neighboring teachers, coaches, or support staff the sub can go to for help.
        </p>
        {info.helpful_staff.length > 0 && (
          <div className="space-y-2 mb-4">
            {info.helpful_staff.map((s, i) => (
              <div key={i} className="flex items-center justify-between gap-3 bg-paper border border-rule rounded-md px-3 py-2">
                <span className="text-sm font-sans text-ink">
                  <span className="font-semibold">{s.name}</span>
                  {s.role && <span className="text-ink-soft"> — {s.role}</span>}
                </span>
                <button
                  onClick={() => removeStaff(i)}
                  className="text-ink-faint hover:text-ink transition-colors text-xs font-sans shrink-0"
                  type="button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-3 items-end">
          <Field label="Name" className="flex-1">
            <Input
              value={staffInput.name}
              onChange={e => setStaffInput(p => ({ ...p, name: e.target.value }))}
              placeholder="Full name"
            />
          </Field>
          <Field label="Role / location" className="flex-1">
            <Input
              value={staffInput.role}
              onChange={e => setStaffInput(p => ({ ...p, role: e.target.value }))}
              placeholder="Classroom across the hall (1st grade)"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addStaff(); } }}
            />
          </Field>
          <Button type="button" variant="outline" onClick={addStaff} className="shrink-0">Add</Button>
        </div>
      </Card>

      {/* Daily schedule */}
      <Card>
        <h2 className="font-display text-display-md text-ink mb-2 rule-ornament">Daily Schedule</h2>
        <p className="text-sm font-sans text-ink-soft mb-5">
          Your typical block schedule. The agent uses these times to pre-build your plan —
          you just fill in what to teach for each block.
        </p>

        {info.schedule.length > 0 && (
          <div className="space-y-1.5 mb-4">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_80px_80px_auto] gap-2 px-3 pb-1">
              <span className="text-xs font-sans font-semibold uppercase tracking-widest text-ink-faint">Block / Period</span>
              <span className="text-xs font-sans font-semibold uppercase tracking-widest text-ink-faint">Start</span>
              <span className="text-xs font-sans font-semibold uppercase tracking-widest text-ink-faint">End</span>
              <span className="sr-only">Actions</span>
            </div>
            {info.schedule.map((block, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_80px_80px_auto] gap-2 items-center bg-paper border border-rule rounded-md px-3 py-2"
              >
                <span className="text-sm font-sans text-ink font-medium truncate">{block.period}</span>
                <span className="text-sm font-sans text-ink-soft">{block.start_time || '—'}</span>
                <span className="text-sm font-sans text-ink-soft">{block.end_time || '—'}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveBlock(i, -1)}
                    disabled={i === 0}
                    className="text-ink-faint hover:text-ink transition-colors disabled:opacity-30 px-1"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBlock(i, 1)}
                    disabled={i === info.schedule.length - 1}
                    className="text-ink-faint hover:text-ink transition-colors disabled:opacity-30 px-1"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBlock(i)}
                    className="text-ink-faint hover:text-ink transition-colors text-xs font-sans ml-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add block form */}
        <div className="flex gap-2 items-end flex-wrap">
          <Field label="Block / Period name" className="flex-1 min-w-[140px]">
            <Input
              value={blockInput.period}
              onChange={e => setBlockInput(p => ({ ...p, period: e.target.value }))}
              placeholder="e.g. Reading Block, Period 2, Lunch"
            />
          </Field>
          <Field label="Start" className="w-[88px]">
            <Input
              value={blockInput.start_time}
              onChange={e => setBlockInput(p => ({ ...p, start_time: e.target.value }))}
              placeholder="8:15"
            />
          </Field>
          <Field label="End" className="w-[88px]">
            <Input
              value={blockInput.end_time}
              onChange={e => setBlockInput(p => ({ ...p, end_time: e.target.value }))}
              placeholder="9:00"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addBlock(); } }}
            />
          </Field>
          <Button type="button" variant="outline" onClick={addBlock} className="shrink-0">
            Add block
          </Button>
        </div>
      </Card>

      {/* Classroom logistics */}
      <Card>
        <h2 className="font-display text-display-md text-ink mb-6 rule-ornament">Classroom Logistics</h2>
        <div className="space-y-5">
          <Field label="Emergency procedures">
            <Textarea value={info.emergency_procedures ?? ''} onChange={v => setField('emergency_procedures', v)} placeholder="Where the emergency folder is, evacuation route, assembly location, attendance protocol…" />
          </Field>
          <Field label="Health concerns">
            <Textarea value={info.health_concerns ?? ''} onChange={v => setField('health_concerns', v)} placeholder="Minor injuries (band-aid location), when to call the nurse, student health notes…" />
          </Field>
          <Field label="Nurse's office">
            <Textarea value={info.nurses_office ?? ''} onChange={v => setField('nurses_office', v)} placeholder="Pass requirement, nurse phone number location…" />
          </Field>
          <Field label="Bathroom rules">
            <Textarea value={info.bathroom_rules ?? ''} onChange={v => setField('bathroom_rules', v)} placeholder="Which bathroom, when students may go, emergency exceptions…" />
          </Field>
          <Field label="Behavior / PBIS system">
            <Textarea value={info.behavior_management ?? ''} onChange={v => setField('behavior_management', v)} placeholder="Dojo points, clip chart, break procedures, office support number…" />
          </Field>
          <Field label="Special instructions">
            <Textarea value={info.special_instructions ?? ''} onChange={v => setField('special_instructions', v)} placeholder="Dismissal notes, duty assignments, class lists, anything else…" />
          </Field>
        </div>
      </Card>

      {/* Notes */}
      <Card>
        <h2 className="font-display text-display-md text-ink mb-2 rule-ornament">Notes</h2>
        <p className="text-sm font-sans text-ink-soft mb-5">
          Anything that doesn&rsquo;t fit neatly elsewhere — class quirks, helpful context,
          reminders to yourself. The agent will include this when building plans.
        </p>
        <Textarea
          value={info.notes ?? ''}
          onChange={v => setField('notes', v)}
          placeholder="e.g. The class goldfish is named Mr. Bubbles and needs feeding at noon. Room 12 door sticks — pull hard. Students know the quiet signal (hand raised)."
          rows={5}
        />
      </Card>

      {/* Save */}
      <div className="flex items-center gap-4 pb-12">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save profile'}
        </Button>
        {saved && (
          <span className="text-sm font-sans text-sage">Saved successfully.</span>
        )}
        {(updateProfile.isError || updateSchoolInfo.isError) && (
          <span className="text-sm font-sans text-terracotta">Something went wrong. Please try again.</span>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-sans font-semibold uppercase tracking-widest text-ink-faint mb-1.5">
        {label}
      </label>
      {hint && <p className="text-xs font-sans text-ink-faint mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm font-sans text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta resize-y"
    />
  );
}
