import type { Shape } from "@/lib/types";
import { groupSeenIn } from "@/lib/surfaces";
import { cn } from "@/lib/cn";

/** One catalog entry: heading, purpose, where it ships, its spec, and the live demo. */
export function ShapeFrame({ shape, index }: { shape: Shape; index: string }) {
  const surfaces = groupSeenIn(shape.seenIn);
  const Demo = shape.Demo;
  return (
    <article id={shape.id} aria-labelledby={`${shape.id}-title`} className="scroll-mt-24 border-t border-hair-soft pt-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[680px]">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            <span className="tabular-nums">{index}</span>
            <a href={`#${shape.id}`} className="hover:text-ink" aria-label={`Link to ${shape.name}`}>
              #{shape.id}
            </a>
          </div>
          <h2 id={`${shape.id}-title`} className="mt-2 text-[clamp(22px,2.4vw,28px)] font-[640] leading-tight tracking-[-0.02em]">
            {shape.name}
          </h2>
          <p className="mt-1.5 text-[15px] text-ink-dim">{shape.purpose}</p>
        </div>
        {surfaces.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 md:max-w-[420px] md:justify-end" aria-label="Seen in">
            {surfaces.map((s) => (
              <li
                key={s.key}
                title={s.refs.join(" · ")}
                className="inline-flex items-center gap-1.5 rounded-full border border-hair px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-dim"
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} aria-hidden="true" />
                {s.label}
              </li>
            ))}
          </ul>
        )}
      </header>

      {(shape.variants?.length || shape.states?.length) ? (
        <dl className="mt-4 grid gap-x-8 gap-y-2 text-[12.5px] md:grid-cols-2">
          {shape.variants?.length ? <SpecRow term="Variants" items={shape.variants} /> : null}
          {shape.states?.length ? <SpecRow term="States" items={shape.states} /> : null}
        </dl>
      ) : null}

      <div className={cn("relative mt-6 overflow-hidden rounded-[18px] border border-hair-soft bg-[#070708]")}>
        <div className="dots pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative p-[clamp(16px,3vw,32px)]">
          <Demo />
        </div>
      </div>
    </article>
  );
}

function SpecRow({ term, items }: { term: string; items: string[] }) {
  return (
    <div className="flex gap-3">
      <dt className="w-[68px] shrink-0 pt-0.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">{term}</dt>
      <dd className="flex flex-wrap content-start items-start gap-1.5">
        {items.map((v) => (
          <span key={v} className="rounded-md border border-hair-soft bg-s1 px-2 py-0.5 text-ink-dim">
            {v}
          </span>
        ))}
      </dd>
    </div>
  );
}
