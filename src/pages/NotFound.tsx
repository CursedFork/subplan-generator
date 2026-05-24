import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <p className="font-sans text-xs uppercase tracking-widest text-ink-faint mb-4">404</p>
        <h1 className="font-display text-display-lg text-ink mb-4">Page not found.</h1>
        <p className="font-sans text-base text-ink-soft leading-relaxed mb-8">
          The page you&rsquo;re looking for doesn&rsquo;t exist. It may have moved, or the link
          may be broken.
        </p>
        <Button asChild>
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
