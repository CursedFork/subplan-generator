import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useProfile, useUpdateProfile, useUpdateSchoolInfo } from '@/hooks/useProfile';
import type { SchoolInfo, AdminContact, HelpfulStaff } from '@/types/app';

function emptyContact(): AdminContact { return { name: '', extension: null }; }
function emptySchoolInfo(): SchoolInfo {
  return {
    school_name: null, school_year: null,
    grade: null, subject: null, grades_covered: [],
    principal: null, assistant_principal: null,
    school_counselor: null, school_psychologist: null,
    helpful_staff: [],
    emergency_procedures: null, health_concerns: null,
    bathroom_rules: null, behavior_management: null,
    nurses_office: null, special_instructions: null,
  };
}

export default function Profile() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const updateSchoolInfo = useUpdateSchoolInfo();

  const [displayName, setDisplayName] = useState('');
  const [info, setInfo] = useState<SchoolInfo>(emptySchoolInfo());
  const [staffInput, setStaffInput] = useState({ name: '', role: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? '');
    setInfo({
      ...emptySchoolInfo(),
      ...profile.school_info,
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

      {/* Personal */}
      <Card>
        <h2 className="font-display text-display-md text-ink mb-6 rule-ornament">Personal</h2>
        <div className="space-y-4">
          <Field label="Display name">
            <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Andrea Kozikowski" />
          </Field>
        </div>
      </Card>

      {/* School info */}
      <Card>
        <h2 className="font-display text-display-md text-ink mb-6 rule-ornament">School</h2>
        <div className="space-y-4">
          <Field label="School name">
            <Input value={info.school_name ?? ''} onChange={e => setField('school_name', e.target.value)} placeholder="Thunder Hill Elementary School" />
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
                  placeholder="54493"
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
              placeholder="Kelly Kennon"
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

function Textarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm font-sans text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta resize-y"
    />
  );
}
