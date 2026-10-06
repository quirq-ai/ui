import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/brand/mark";
import { CategoryRail } from "@/components/site/category-rail";
import { ShapeFrame } from "@/components/site/shape-frame";
import { CATEGORIES, getCategory } from "@/lib/registry";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const c = getCategory(category);
  return c ? { title: c.title, description: c.blurb } : {};
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) notFound();
  const i = CATEGORIES.indexOf(c);
  const num = String(i + 1).padStart(2, "0");
  const prev = CATEGORIES[i - 1];
  const next = CATEGORIES[i + 1];

  return (
    <div className="mx-auto grid max-w-[1320px] gap-10 px-[clamp(20px,4vw,44px)] pt-10 lg:grid-cols-[230px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <CategoryRail categories={CATEGORIES} current={c.id} />
      </aside>
      <div className="min-w-0">
        <header className="pb-10">
          <Eyebrow rule>
            {num} · {c.shapes.length} shapes
          </Eyebrow>
          <h1 className="mt-5 text-[clamp(32px,4.4vw,52px)] font-[660] leading-[1.08] tracking-[-0.028em]">
            {c.title}
            <span className="text-ink-dim">.</span>
          </h1>
          <p className="mt-4 max-w-[640px] text-[clamp(15px,1.6vw,17px)] text-ink-dim">{c.blurb}</p>
          <nav aria-label="Jump to a category" className="mt-6 lg:hidden">
            <CategoryJump current={c.id} />
          </nav>
        </header>

        <div className="space-y-16">
          {c.shapes.map((s, k) => (
            <ShapeFrame key={s.id} shape={s} index={`${num}.${String(k + 1).padStart(2, "0")}`} />
          ))}
          {c.shapes.length === 0 && (
            <p className="rounded-2xl border border-dashed border-hair p-10 text-center text-ink-dim">Shapes for this category are being built.</p>
          )}
        </div>

        <nav aria-label="Categories" className="mt-20 grid gap-3 border-t border-hair-soft pt-8 sm:grid-cols-2">
          {prev ? (
            <Link href={`/shapes/${prev.id}`} className="group rounded-2xl border border-hair-soft p-5 transition-colors hover:border-hair-strong">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">← Previous</span>
              <span className="mt-1 block text-[17px] font-[600]">{prev.title}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/shapes/${next.id}`} className="group rounded-2xl border border-hair-soft p-5 text-right transition-colors hover:border-hair-strong">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">Next →</span>
              <span className="mt-1 block text-[17px] font-[600]">{next.title}</span>
            </Link>
          ) : (
            <Link href="/shapes" className="rounded-2xl border border-hair-soft p-5 text-right transition-colors hover:border-hair-strong">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">Done →</span>
              <span className="mt-1 block text-[17px] font-[600]">Back to the index</span>
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}

function CategoryJump({ current }: { current: string }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {CATEGORIES.map((c) => (
        <Link
          key={c.id}
          href={`/shapes/${c.id}`}
          aria-current={c.id === current ? "page" : undefined}
          className={
            c.id === current
              ? "rounded-full bg-ink px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-black"
              : "rounded-full border border-hair px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-dim hover:text-ink"
          }
        >
          {c.title}
        </Link>
      ))}
    </span>
  );
}
