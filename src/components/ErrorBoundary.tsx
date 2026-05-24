import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // TODO: wire to Sentry in a later increment
    console.error('[ErrorBoundary]', error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-paper flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <h1 className="font-display text-display-md text-ink mb-4">
              Something didn&rsquo;t quite work.
            </h1>
            <p className="font-sans text-base text-ink-soft mb-8">
              Try reloading the page. If this keeps happening, let us know at{' '}
              {/* TODO(domain): replace with real support email */}
              <a
                href="mailto:support@subplan.example"
                className="text-terracotta underline underline-offset-2"
              >
                support@subplan.example
              </a>
              .
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center h-11 px-5 rounded-md border border-terracotta text-terracotta font-sans font-semibold text-sm tracking-wide hover:bg-terracotta hover:text-paper transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
