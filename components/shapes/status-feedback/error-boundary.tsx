"use client";

// ViewBoundary: a crash boundary around one view (a bulkhead). When the view throws while
// rendering, the rest of the app keeps working and the view shows an ErrorPanel that names
// it, reassures, and offers "Start <view> again".
import { Component, type ReactNode } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorPanel } from "./error-state";

export type ViewBoundaryProps = {
  /** View name as people see it: "Browser", "Graph". */
  name: string;
  children: ReactNode;
  /** Called before the view remounts, to clear whatever made it fail. */
  onReset?: () => void;
  /** Show the fallback as if the view had thrown this error (demos, tests). Cleared through onReset. */
  simulateError?: Error | null;
  /** Custom fallback; defaults to an ErrorPanel. */
  fallback?: (props: { error: Error; reset: () => void }) => ReactNode;
  /** Heading level of the default fallback's title. */
  headingLevel?: "h3" | "h4";
};

type State = { error: Error | null };

export class ViewBoundary extends Component<ViewBoundaryProps, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  reset = () => {
    this.props.onReset?.();
    this.setState({ error: null });
  };

  render() {
    const error = this.state.error ?? this.props.simulateError ?? null;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback({ error, reset: this.reset });
    const { name, headingLevel } = this.props;
    // role=alert: the view vanished under the person, so the fallback is announced
    return (
      <div role="alert">
        <ErrorPanel
          layout="page"
          headingLevel={headingLevel}
          icon={<TriangleAlert />}
          title={`${name} stopped working`}
          cause="Something in this view failed while drawing it. The rest of the space dashboard still works."
          detail={`${error.name}: ${error.message}`}
          reassurance="Your files, sessions and other views are unchanged."
          actions={
            <Button variant="secondary" size="sm" leadingIcon={<RotateCcw />} onClick={this.reset}>
              Start {name} again
            </Button>
          }
        />
      </div>
    );
  }
}
