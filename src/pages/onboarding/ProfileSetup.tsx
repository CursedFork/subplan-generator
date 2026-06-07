import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { Logo } from '@/components/logo/Logo';
import { useProfile, useSaveOnboardingStep, useCompleteOnboarding } from '@/hooks/useProfile';
import { templates } from '@/templates';

// ── Grade chip options ──────────────────────────────────────────────────────
const GRADE_OPTIONS = [
  { value: 'K', label: 'K' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '6', label: '6' },
  { value: '7', label: '7' },
  { value: '8', label: '8' },
  { value: '9', label: '9' },
  { value: '10', label: '10' },
  { value: '11', label: '11' },
  { value: '12', label: '12' },
];

const SUBJECT_OPTIONS = [
  { value: 'Math', label: 'Math' },
  { value: 'ELA / Reading', label: 'ELA / Reading' },
  { value: 'Science', label: 'Science' },
  { value: 'Social Studies', label: 'Social Studies' },
  { value: 'Writing', label: 'Writing' },
  { value: 'Art', label: 'Art' },
  { value: 'Music', label: 'Music' },
  { value: 'PE', label: 'PE' },
  { value: 'World Languages', label: 'World Languages' },
  { value: 'Special Education', label: 'Special Education' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Other', label: 'Other' },
];

// ── Field wrapper ───────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-sans font-semibold uppercase tracking-widest text-ink-faint">
        {label}
      </label>
      {hint && <p className="text-xs font-sans text-ink-faint">{hint}</p>}
      {children}
    </div>
  );
}

// ── Main wizard ─────────────────────────────────────────────────────────────
export default function ProfileSetup() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();
  const saveStep = useSaveOnboardingStep();
  const completeOnboarding = useCompleteOnboarding();

  const [step, setStep] = useState(1);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Step 1 state
  const [displayName, setDisplayName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolLevel, setSchoolLevel] = useState('');

  // Step 2 state
  const [gradeLevels, setGradeLevels] = useState<string[]>([]);
  const [primaryGrade, setPrimaryGrade] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [otherSubject, setOtherSubject] = useState('');

  // Step 3 state
  const [classroomNotes, setClassroomNotes] = useState('');
  const [defaultTemplateId, setDefaultTemplateId] = useState('standard-day');

  // Pre-fill from existing profile on mount
  useEffect(() => {
    if (!profile) return;
    if (profile.onboarding_completed_at) {
      void navigate('/dashboard', { replace: true });
      return;
    }
    // Restore saved step
    if (profile.onboarding_step > 0) setStep(Math.min(profile.onboarding_step + 1, 3));
    setDisplayName(profile.display_name ?? '');
    setSchoolName(profile.school ?? '');
    setSchoolLevel(profile.school_level ?? '');
    setGradeLevels(profile.grade_levels ?? []);
    setPrimaryGrade(profile.primary_grade ?? '');
    setSubjects(profile.subjects ?? []);
    setClassroomNotes(profile.classroom_notes ?? '');
    setDefaultTemplateId(profile.default_template_id ?? 'standard-day');
  }, [profile, navigate]);

  // Auto-fill primaryGrade when only one grade is selected
  useEffect(() => {
    if (gradeLevels.length === 1) {
      setPrimaryGrade(gradeLevels[0] ?? '');
    }
  }, [gradeLevels]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-rule border-t-terracotta animate-spin" aria-label="Loading…" />
      </div>
    );
  }

  const totalSteps = 3;

  // ── Step 1 validation ────────────────────────────────────────────────────
  const step1Valid = displayName.trim().length > 0;
  // ── Step 2 validation ────────────────────────────────────────────────────
  const step2Valid = gradeLevels.length > 0 && primaryGrade.length > 0 && subjects.length > 0;
  // ── Step 3 has no required fields ────────────────────────────────────────
  const step3Valid = true;

  const canAdvance = step === 1 ? step1Valid : step === 2 ? step2Valid : step3Valid;

  const effectiveSubjects = subjects.includes('Other') && otherSubject.trim()
    ? [...subjects.filter((s) => s !== 'Other'), otherSubject.trim()]
    : subjects;

  async function handleNext() {
    setSaveError(null);
    try {
      if (step === 1) {
        await saveStep.mutateAsync({
          onboarding_step: 1,
          display_name: displayName.trim() || null,
          school: schoolName.trim() || null,
          school_level: schoolLevel || null,
        });
        setStep(2);
      } else if (step === 2) {
        await saveStep.mutateAsync({
          onboarding_step: 2,
          grade_levels: gradeLevels,
          primary_grade: primaryGrade || null,
          subjects: effectiveSubjects,
        });
        setStep(3);
      } else {
        // Step 3 — finish
        await completeOnboarding.mutateAsync({
          classroom_notes: classroomNotes.trim() || null,
          default_template_id: defaultTemplateId || null,
        });
        void navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  async function handleBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  const isSaving = saveStep.isPending || completeOnboarding.isPending;

  return (
    <div className="min-h-screen bg-paper theme-aware flex flex-col">
      {/* Header */}
      <header className="border-b border-rule bg-paper px-6 py-4 flex items-center justify-between">
        <Link to="/" aria-label="Teacher's Pet home">
          <Logo />
        </Link>
        <Link
          to="/dashboard"
          className="font-sans text-xs text-ink-faint hover:text-ink transition-colors"
        >
          Skip for now
        </Link>
      </header>

      <div className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Step indicator */}
          <p className="font-sans text-sm text-ink-faint mb-2">Step {step} of {totalSteps}</p>

          {/* Progress dots */}
          <div className="flex gap-1.5 mb-8">
            {Array.from({ length: totalSteps }, (_, i) => (
              <span
                key={i}
                className={[
                  'h-1 rounded-full transition-all duration-200',
                  i + 1 <= step ? 'bg-terracotta' : 'bg-rule',
                  i + 1 === step ? 'w-8' : 'w-4',
                ].join(' ')}
              />
            ))}
          </div>

          {/* ── Step 1 ──────────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-display-lg text-ink rule-ornament">About you</h1>
                <p className="font-sans text-sm text-ink-soft mt-4">
                  We&rsquo;ll use this to personalize every sub plan you create.
                </p>
              </div>

              <Field label="Your name" hint="What should we call you?">
                <Input
                  placeholder="e.g. Ms. Rivera"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoFocus
                />
              </Field>

              <Field label="School name" hint="Optional — helps pre-fill your plans.">
                <Input
                  placeholder="e.g. Lakewood Elementary School"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </Field>

              <Field label="School level" hint="Helps us format your plan for the right audience.">
                <Select
                  value={schoolLevel}
                  onChange={(e) => setSchoolLevel(e.target.value)}
                  placeholder="Select a level"
                >
                  <option value="elementary">Elementary (K–5)</option>
                  <option value="middle">Middle (6–8)</option>
                  <option value="high">High (9–12)</option>
                  <option value="k8">K–8</option>
                  <option value="k12">K–12</option>
                  <option value="other">Other</option>
                </Select>
              </Field>
            </div>
          )}

          {/* ── Step 2 ──────────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-display-lg text-ink rule-ornament">What you teach</h1>
                <p className="font-sans text-sm text-ink-soft mt-4">
                  We&rsquo;ll pre-fill new plans with your most common setup.
                </p>
              </div>

              <Field label="Grade levels you teach" hint="Select all that apply.">
                <ChipGroup
                  options={GRADE_OPTIONS}
                  value={gradeLevels}
                  onChange={setGradeLevels}
                  className="mt-1"
                />
              </Field>

              <Field label="Which grade do you teach most often?" hint="We'll use this to pre-fill new plans.">
                <Select
                  value={primaryGrade}
                  onChange={(e) => setPrimaryGrade(e.target.value)}
                  disabled={gradeLevels.length === 1}
                  placeholder="Select a grade"
                >
                  {(gradeLevels.length > 0 ? gradeLevels : GRADE_OPTIONS.map((o) => o.value)).map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Subjects taught" hint="Select all that apply.">
                <ChipGroup
                  options={SUBJECT_OPTIONS}
                  value={subjects}
                  onChange={setSubjects}
                  className="mt-1"
                />
                {subjects.includes('Other') && (
                  <Input
                    className="mt-2"
                    placeholder="What subject? (e.g. Drama, Health)"
                    value={otherSubject}
                    onChange={(e) => setOtherSubject(e.target.value)}
                  />
                )}
              </Field>
            </div>
          )}

          {/* ── Step 3 ──────────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-display-lg text-ink rule-ornament">Preferences</h1>
                <p className="font-sans text-sm text-ink-soft mt-4">
                  Almost there — these are optional but help make every plan feel like yours.
                </p>
              </div>

              <Field
                label="Anything we should know about your classroom?"
                hint="Shown to your sub at the top of every plan."
              >
                <textarea
                  rows={4}
                  placeholder="e.g. Students sit in table groups. Marcus is in row 2 and uses a fidget tool. The intercom code is 99."
                  value={classroomNotes}
                  onChange={(e) => setClassroomNotes(e.target.value)}
                  className="w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm font-sans text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta resize-y theme-aware"
                />
              </Field>

              <Field label="Default template" hint="We'll start new plans with this template.">
                <Select
                  value={defaultTemplateId}
                  onChange={(e) => setDefaultTemplateId(e.target.value)}
                >
                  {Object.entries(templates).map(([id, tmpl]) => (
                    <option key={id} value={id}>{tmpl.name}</option>
                  ))}
                </Select>
              </Field>
            </div>
          )}

          {/* Error */}
          {saveError && (
            <p className="mt-4 text-sm font-sans text-terracotta" role="alert">{saveError}</p>
          )}

          {/* Buttons */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {step > 1 && (
                <Button type="button" variant="ghost" onClick={() => void handleBack()} disabled={isSaving}>
                  Back
                </Button>
              )}
              <Button
                type="button"
                onClick={() => void handleNext()}
                disabled={!canAdvance || isSaving}
              >
                {isSaving
                  ? 'Saving…'
                  : step === totalSteps
                  ? 'Finish'
                  : 'Next'}
              </Button>
            </div>

            <Link
              to="/dashboard"
              className="font-sans text-xs text-ink-faint hover:text-ink transition-colors"
            >
              Skip for now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

