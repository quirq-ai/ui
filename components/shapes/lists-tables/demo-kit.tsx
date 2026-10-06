// Small server-safe helpers shared by the lists-tables demos and components: the mono
// demo caption, a labelled demo block, the provenance qualifier that rides under mock or
// illustrative numbers, and the fixture runtime id to logo id mapping.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { RuntimeId as FixtureRuntimeId } from "@/lib/fixtures";
import type { LogoId } from "@/components/ui/runtime-logo";

/** Mono uppercase caption that names a variant or state inside a demo. */
export function DemoCaption({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint", className)}>{children}</p>;
}

/** A captioned slot in a demo grid. */
export function DemoBlock({
  label,
  children,
  className,
  aside,
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
  /** Small note at the right of the caption row. */
  aside?: ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2.5", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <DemoCaption>{label}</DemoCaption>
        {aside ? <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">{aside}</span> : null}
      </div>
      {children}
    </div>
  );
}

/** "Illustrative, not a measurement" style qualifier for mock and illustrative numbers. */
export function ProvenanceNote({
  kind = "mock",
  children,
  className,
}: {
  kind?: "mock" | "illustrative";
  children?: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em]",
        kind === "illustrative" ? "text-org/90" : "text-ink-faint",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("inline-block size-[5px] rounded-full", kind === "illustrative" ? "bg-org" : "bg-ink-faint")}
      />
      <span>{kind === "illustrative" ? "Illustrative, not a measurement" : "Mock data"}</span>
      {children ? <span className="basis-full pl-[13px] normal-case tracking-[0.04em] opacity-90">{children}</span> : null}
    </p>
  );
}

/** Fixture runtime ids use gemini_cli; the logo set calls it gemini. */
export function logoFor(runtime: FixtureRuntimeId): LogoId {
  return runtime === "gemini_cli" ? "gemini" : runtime;
}
