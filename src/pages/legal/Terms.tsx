import { LegalPage } from './LegalPage';

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" effectiveDate="July 5, 2026">
      <section>
        <h2>1. What Teacher's Pet is</h2>
        <p>
          Teacher's Pet ("the Service") helps K-12 teachers create substitute teacher plans and
          related classroom materials. The Service is operated by Andrew Kozikowski ("we," "us").
          By creating an account, you agree to these terms.
        </p>
      </section>

      <section>
        <h2>2. Your account</h2>
        <p>
          You must provide a valid email address and keep your password secure. You are
          responsible for activity under your account. You must be at least 18 years old.
          Accounts are for individual teachers — one account per person.
        </p>
      </section>

      <section>
        <h2>3. Subscriptions and billing</h2>
        <ul>
          <li>New accounts include a limited number of free plans so you can try the Service.</li>
          <li>Paid subscriptions are billed monthly or annually through Stripe. We never see or store your card number.</li>
          <li>You can cancel any time from the Billing page. You keep access until the end of your paid period. We do not offer prorated refunds, except where required by law.</li>
          <li>Prices may change; we will notify you by email at least 30 days before a change affects your renewal.</li>
        </ul>
      </section>

      <section>
        <h2>4. AI-generated content — review before use</h2>
        <p>
          Plans and materials are generated with the help of artificial intelligence based on
          the information you provide. <strong>You are responsible for reviewing every plan
          before giving it to a substitute.</strong> This especially includes emergency
          procedures, health information, contact names and extensions, and anything else a
          substitute would rely on for student safety. The Service is a drafting tool, not a
          replacement for your professional judgment.
        </p>
      </section>

      <section>
        <h2>5. Your content</h2>
        <p>
          You own the plans and materials you create. You grant us only the rights needed to
          operate the Service — storing your content, processing it to generate plans, and
          displaying it back to you. We do not sell your content or use it to train AI models.
        </p>
      </section>

      <section>
        <h2>6. Student information</h2>
        <p>
          The Service lets you store classroom information that may reference students (for
          example, health notes or seating needs). Enter only what a substitute genuinely
          needs, follow your school district's policies on student data, and prefer first
          names or initials where possible. You are responsible for ensuring your use of the
          Service complies with your district's rules and applicable law, including FERPA.
        </p>
      </section>

      <section>
        <h2>7. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service to create content that is harmful, discriminatory, or violates school policy;</li>
          <li>Share your account or resell access;</li>
          <li>Attempt to access other users' data or disrupt the Service;</li>
          <li>Use automated tools to scrape or bulk-generate content.</li>
        </ul>
      </section>

      <section>
        <h2>8. Termination</h2>
        <p>
          You can delete your account at any time by contacting us. We may suspend or terminate
          accounts that violate these terms. If we terminate your account without cause, we
          will refund the unused portion of any prepaid period.
        </p>
      </section>

      <section>
        <h2>9. Disclaimers and limitation of liability</h2>
        <p>
          The Service is provided "as is." To the fullest extent permitted by law, we disclaim
          all warranties and our total liability for any claim related to the Service is
          limited to the amount you paid us in the twelve months before the claim arose. We
          are not liable for indirect, incidental, or consequential damages.
        </p>
      </section>

      <section>
        <h2>10. Changes and governing law</h2>
        <p>
          We may update these terms; material changes will be announced by email or in-app at
          least 14 days before taking effect. These terms are governed by the laws of the
          State of Maryland, USA.
        </p>
      </section>
    </LegalPage>
  );
}
