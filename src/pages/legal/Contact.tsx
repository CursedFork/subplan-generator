import { Mail } from 'lucide-react';
import { LegalPage } from './LegalPage';

export default function Contact() {
  return (
    <LegalPage title="Contact">
      <section>
        <p>
          Teacher's Pet is built and run by a working substitute teacher — so email is read
          by the person who actually fixes things.
        </p>
      </section>

      <section>
        <h2>Support</h2>
        <p>
          Something broken, confusing, or missing? Billing question? Feature idea?
        </p>
        <p className="mt-3">
          <a
            href="mailto:support@teacherspet.app"
            className="inline-flex items-center gap-2 text-terracotta font-semibold hover:underline"
          >
            <Mail className="w-4 h-4" />
            support@teacherspet.app
          </a>
        </p>
        <p className="mt-3">
          We aim to reply within one school day. If your sub plan is due tomorrow morning and
          something is broken, put <strong>URGENT</strong> in the subject line.
        </p>
      </section>

      <section>
        <h2>Privacy and data requests</h2>
        <p>
          To request account deletion or a copy of your data, email the address above from
          the email you signed up with.
        </p>
      </section>
    </LegalPage>
  );
}
