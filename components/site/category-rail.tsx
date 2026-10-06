import Link from "next/link";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/cn";

/** Sticky catalog index: every category, with the current one opened to its shapes. */
export function CategoryRail({ categories, current }: { categories: Category[]; current?: string }) {
  return (
    <nav aria-label="Categories" className="scroll-thin sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-10 pr-2">
      <ol className="space-y-0.5">
        {categories.map((c, i) => {
          const on = c.id === current;
          return (
            <li key={c.id}>
              <Link
                href={`/shapes/${c.id}`}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "flex items-baseline gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors",
                  on ? "bg-s2 text-ink" : "text-ink-dim hover:bg-s1 hover:text-ink",
                )}
              >
                <span className="w-5 shrink-0 font-mono text-[10.5px] tabular-nums text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1">{c.title}</span>
                <span className="font-mono text-[10.5px] tabular-nums text-ink-faint">{c.shapes.length}</span>
              </Link>
              {on && c.shapes.length > 0 && (
                <ol className="mb-2 ml-[30px] mt-1 space-y-0.5 border-l border-hair-soft pl-3">
                  {c.shapes.map((s) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="block py-0.5 text-[12.5px] text-ink-faint hover:text-ink">
                        {s.name}
                      </a>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
