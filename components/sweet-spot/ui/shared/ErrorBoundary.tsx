// components/sweet-spot/ui/shared/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SweetSpot Error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-black p-5">
          <div className="max-w-md rounded-2xl border border-white/10 bg-black/80 p-7 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Oups, quelque chose s'est mal passé
            </h2>
            <p className="mb-6 text-white/70">
              Une erreur inattendue s'est produite. Essaye de rafraîchir la page.
            </p>
            <button
              onClick={this.handleReset}
              className="rounded-full bg-white px-8 py-3.5 font-semibold text-black transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Rafraîchir la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
