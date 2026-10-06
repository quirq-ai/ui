// TermCard: teaches one term with its definition, a correct use, the wording to avoid
// (struck through) and, for collisions, the existing wording and the v1 convention.
// Server-safe: CopyButton carries its own client boundary.
import { ArrowRight, Check, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import type { Tone } from "@/components/ui/tones";

export type TermGroup = "product" | "work" | "setup" | "collision";

export const TERM_GROUPS: Record<TermGroup, { label: string; tone: Tone }> = {
  product: { label: "Product name", tone: "blu" },
  work: { label: "Everyday work", tone: "grn" },
  setup: { label: "Setup", tone: "neutral" },
  collision: { label: "Collision", tone: "org" },
};

export type Term = {
  id: string;
  term: string;
  group: TermGroup;
  definition: string;
  /** A correct sentence using the term. */
  use?: string;
  /** Wrong wordings, shown struck through. */
  avoid?: string[];
  /** "Keep distinct from" line. */
  keepDistinct?: string;
  /** Collision resolution: existing wording to the v1 convention. */
  collision?: { existing: string; convention: string };
};

export type TermCardProps = {
  term: Term;
  headingAs?: "h3" | "h4" | "h5";
  className?: string;
};

/** One vocabulary term: definition, use, avoid and collision rows, with a copy button. */
export function TermCard({ term: t, headingAs: H = "h3", className }: TermCardProps) {
  const group = TERM_GROUPS[t.group];
  return (
    <article aria-labelledby={`term-${t.id}`} className={cn("flex min-w-0 flex-col rounded-[14px] border border-hair bg-s1 p-4", className)}>
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Badge tone={group.tone} mono size="xs">
            {group.label}
          </Badge>
          <H id={`term-${t.id}`} className="mt-2 font-mono text-[15.5px] font-medium tracking-[-0.01em] text-ink [overflow-wrap:anywhere]">
            {t.term}
          </H>
        </div>
        <CopyButton text={t.term} size="sm" aria-label={`Copy term ${t.term}`} announce={`Term ${t.term} copied`} className="-mr-1 -mt-0.5 text-ink-faint" />
      </header>

      <p className="mt-2 text-[13px] leading-[1.6] text-ink-dim">{t.definition}</p>

      {t.use || (t.avoid && t.avoid.length) || t.keepDistinct ? (
        <dl className="mt-3.5 space-y-2 border-t border-hair-soft pt-3 text-[12.5px] leading-[1.55]">
          {t.use ? (
            <div className="flex gap-2.5">
              <dt className="flex w-[52px] shrink-0 items-center gap-1 self-start pt-[2px] font-mono text-[10px] uppercase tracking-[0.12em] text-grn">
                <Check aria-hidden="true" className="size-3" strokeWidth={2.5} />
                Use
              </dt>
              <dd className="min-w-0 text-ink">{t.use}</dd>
            </div>
          ) : null}
          {t.avoid && t.avoid.length ? (
            <div className="flex gap-2.5">
              <dt className="flex w-[52px] shrink-0 items-center gap-1 self-start pt-[2px] font-mono text-[10px] uppercase tracking-[0.12em] text-red">
                <X aria-hidden="true" className="size-3" strokeWidth={2.5} />
                Avoid
              </dt>
              <dd className="min-w-0">
                <ul className="space-y-1">
                  {t.avoid.map((a) => (
                    <li key={a} className="text-ink-faint">
                      <s className="decoration-red/70 decoration-[1.5px]">{a}</s>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ) : null}
          {t.keepDistinct ? (
            <div className="pt-1">
              <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">Keep distinct from</dt>
              <dd className="mt-0.5 min-w-0 text-ink-dim">{t.keepDistinct}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {t.collision ? (
        <div className="mt-3.5 rounded-[10px] border border-org/25 bg-org/[0.05] px-3 py-2.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-org">Existing wording, then v1 convention</p>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
            <s className="text-ink-faint decoration-red/70 decoration-[1.5px]">{t.collision.existing}</s>
            <ArrowRight aria-hidden="true" className="size-3.5 shrink-0 text-ink-faint" />
            <span className="sr-only">becomes</span>
            <span className="font-medium text-ink">{t.collision.convention}</span>
          </p>
        </div>
      ) : null}
    </article>
  );
}
