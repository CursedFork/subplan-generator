import { LegalPage } from './LegalPage';

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" effectiveDate="July 5, 2026">
      <section>
        <h2>The short version</h2>
        <ul>
          <li>We collect only what the Service needs to work.</li>
          <li>We never sell your data. There are no ads.</li>
          <li>Your plans and classroom information are private to your account.</li>
          <li>Your content is not used to train AI models.</li>
          <li>Delete your account and your data is deleted.</li>
        </ul>
      </section>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li><strong>Account information:</strong> your email address and password (stored hashed — we cannot read it).</li>
          <li><strong>Profile information:</strong> your name, school, grade levels, subjects, and classroom details you choose to save (schedules, procedures, contacts, notes).</li>
          <li><strong>Plan content:</strong> the substitute plans and materials you create, including conversation history with the planning assistant.</li>
          <li><strong>Roster information:</strong> if you use the seating or grouping tools, student names and the attributes you record about them.</li>
          <li><strong>Billing:</strong> handled entirely by Stripe. We store your subscription status and Stripe customer ID — never card numbers.</li>
        </ul>
      </section>

      <section>
        <h2>How we use it</h2>
        <p>
          Only to operate the Service: generating your plans, pre-filling your templates,
          showing your saved information back to you, processing payments, and sending
          essential account emails (confirmation, password reset, billing notices). We do not
          send marketing email without your consent, and we do not sell or share your data
          with advertisers.
        </p>
      </section>

      <section>
        <h2>Student information</h2>
        <p>
          Classroom notes, health flags, and roster attributes may reference students. This
          data exists solely to generate your materials, is visible only to your account, and
          is never used for any other purpose. We recommend using first names or initials and
          entering only what a substitute genuinely needs. We process this information on your
          behalf as a school-authorized tool; you remain responsible for following your
          district's data policies.
        </p>
      </section>

      <section>
        <h2>Who processes your data</h2>
        <p>We use three service providers, each bound by their own privacy commitments:</p>
        <ul>
          <li><strong>Supabase</strong> — database and authentication hosting (data encrypted in transit and at rest).</li>
          <li><strong>Anthropic</strong> — AI plan generation. The content you provide during plan creation is sent to Anthropic's API to generate your plan. Per Anthropic's API terms, this data is not used to train their models.</li>
          <li><strong>Stripe</strong> — payment processing.</li>
        </ul>
      </section>

      <section>
        <h2>Security</h2>
        <p>
          Data is encrypted in transit (TLS) and at rest. Every database query is scoped to
          your account with row-level security — one user's data is never visible to another.
          AI processing happens server-side; API keys are never exposed to your browser.
        </p>
      </section>

      <section>
        <h2>Retention and deletion</h2>
        <p>
          Your data is retained while your account is active. Attachments on finalized plans
          are automatically deleted 90 days after finalization. To delete your account and
          all associated data, email us — deletion completes within 30 days.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          If we make material changes to this policy, we will notify you by email or in-app
          before the changes take effect.
        </p>
      </section>
    </LegalPage>
  );
}
