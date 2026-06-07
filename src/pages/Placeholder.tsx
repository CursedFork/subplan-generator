interface Props {
  title: string;
}

export default function Placeholder({ title }: Props) {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-16">
      <div className="text-center max-w-sm">
        <h1 className="font-display text-display-md text-ink mb-3">{title}</h1>
        <p className="font-sans text-base text-ink-soft">This page is coming soon.</p>
        <a
          href="/"
          className="mt-6 inline-block font-sans text-sm text-terracotta hover:underline underline-offset-2"
        >
          &larr; Back to home
        </a>
      </div>
    </div>
  );
}
