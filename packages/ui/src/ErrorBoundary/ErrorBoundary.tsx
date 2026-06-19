import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "../Button/Button";
import styles from "./ErrorBoundary.module.css";

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback. Receives the caught error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Called when an error is caught — e.g. to report to a monitoring service. */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Generic React error boundary. Catches render-time errors in its subtree and
 * shows a recoverable fallback instead of a blank screen. Brand-agnostic — the
 * default fallback is styled entirely from design tokens.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  private reset = (): void => this.setState({ error: null });

  render(): ReactNode {
    const { error } = this.state;
    if (error) {
      if (this.props.fallback) return this.props.fallback(error, this.reset);
      return (
        <div role="alert" className={styles.fallback}>
          <h2 className={styles.title}>Something went wrong</h2>
          <p className={styles.message}>{error.message}</p>
          <Button variant="outline" onClick={this.reset}>
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
