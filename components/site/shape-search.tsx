"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SURFACES, type SurfaceKey } from "@/lib/surfaces";

export type ShapeRow = {
  id: string;
  name: string;
  purpose: string;
  categoryId: string;
  categoryTitle: string;
  surfaces: SurfaceKey[];
};

/** Filterable list of every shape, by text and by product surface. */
export function ShapeSearch({ rows }: { rows: ShapeRow[] }) {
  const [q, setQ] = useState("");
  const [surface, setSurface] = useState<SurfaceKey | "all">("all");

  const hits = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (surface === "all" || r.surfaces.includes(surface)) &&
        (!needle || `${r.name} ${r.purpose} ${r.id} ${r.categoryTitle}`.toLowerCase().includes(needle)),
    );
  }, [rows, q, surface]);

  const groups = useMemo(() => {
    const m = new Map<string, ShapeRow[]>();
    for (const r of hits) m.set(r.categoryTitle, [...(m.get(r.categoryTitle) ?? []), r]);
    return [...m.entries()];
  }, [hits]);

  return (
    <div>
      <div className="sticky top-16 z-10 -mx-2 flex flex-col gap-3 bg-black/85 px-2 py-4 backdrop-blur-xl md:flex-row md:items-center">
        <label className="flex flex-1 items-center gap-2.5 rounded-xl border border-hair bg-s1 px-3.5 py-2.5 focus-within:border-hair-strong">
          <Search size={15} className="text-ink-faint" aria-hidden="true" />
          <span className="sr-only">Search shapes</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${rows.length} shapes: table, toast, phone, graph…`}
            className="w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-faint focus-visible:outline-none"
          />
          <span className="font-mono text-[11px] tabular-nums text-ink-faint">{hits.length}</span>
        </label>
        <div role="group" aria-label="Filter by product" className="flex flex-wrap gap-1.5">
          {(["all", ...Object.keys(SURFACES)] as (SurfaceKey | "all")[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={surface === k}
              onClick={() => setSurface(k)}
              className={
                surface === k
                  ? "rounded-full bg-ink px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-black"
                  : "rounded-full border border-hair px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-dim hover:text-ink"
              }
            >
              {k === "all" ? "All" : SURFACES[k].label}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="py-16 text-center text-ink-dim">No shape matches “{q}”.</p>
      ) : (
        <div className="mt-6 space-y-10">
          {groups.map(([title, list]) => (
            <section key={title} aria-label={title}>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">{title}</h2>
              <ul className="mt-3 grid gap-px overflow-hidden rounded-2xl border border-hair-soft bg-[var(--hair-soft)] sm:grid-cols-2 lg:grid-cols-3">
                {list.map((r) => (
                  <li key={r.id} className="bg-black">
                    <Link href={`/shapes/${r.categoryId}#${r.id}`} className="flex h-full flex-col gap-1 p-4 transition-colors hover:bg-s1">
                      <span className="text-[14.5px] font-[560]">{r.name}</span>
                      <span className="text-[13px] leading-snug text-ink-dim">{r.purpose}</span>
                      <span className="mt-1.5 flex gap-1" aria-label="Seen in">
                        {r.surfaces.map((s) => (
                          <span key={s} title={SURFACES[s].label} className="h-1.5 w-1.5 rounded-full" style={{ background: SURFACES[s].color }} />
                        ))}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
