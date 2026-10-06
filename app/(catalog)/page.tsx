import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Eyebrow, Mark } from "@/components/brand/mark";
import { CATEGORIES, ALL_SHAPES } from "@/lib/registry";
import { SURFACES, groupSeenIn, type SurfaceKey } from "@/lib/surfaces";

export default function Home() {
  const perSurface = new Map<SurfaceKey, number>();
  for (const s of ALL_SHAPES) for (const g of groupSeenIn(s.seenIn)) perSurface.set(g.key, (perSurface.get(g.key) ?? 0) + 1);

  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 h-[620px] w-[1100px] -translate-x-1/2 opacity-[0.22] blur-[90px]"
          style={{ background: "conic-gradient(from 180deg at 50% 50%, #ff453a, #ff9f0a, #ffd60a, #30d158, #2fd2ff, #2e9bff, #bf5af2, #ff453a)" }}
        />
        <div className="relative mx-auto max-w-[var(--max)] px-[clamp(20px,5vw,44px)] pb-20 pt-[clamp(72px,12vh,128px)]">
          <Eyebrow rule>quirq shapes · design system</Eyebrow>
          <h1 className="mt-6 max-w-[920px] text-[clamp(40px,6vw,76px)] font-[620] leading-[1.02] tracking-[-0.035em]">
            Every shape quirq is made of.{" "}
            <span className="text-ink-dim">Live, in one Next.js app.</span>
          </h1>
          <p className="mt-6 max-w-[640px] text-[clamp(15px,1.7vw,18px)] text-ink-dim">
            {ALL_SHAPES.length} UI building blocks read from six products, from the{" "}
            <b className="font-[500] text-ink">status dot</b> to the{" "}
            <b className="font-[500] text-ink">phone frame</b>, each demoed with real XO data. A sample app
            built from them comes next.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/shapes"
              className="inline-flex items-center gap-2.5 rounded-full border border-ink bg-ink px-7 py-3.5 text-[16px] font-semibold tracking-[-0.01em] text-black transition-[transform,background] duration-300 hover:-translate-y-0.5 hover:bg-[#e8e8e6]"
            >
              Browse the shapes <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link
              href={`/shapes/${CATEGORIES[0].id}`}
              className="inline-flex items-center gap-2.5 rounded-full border border-white/40 px-7 py-3.5 text-[16px] font-semibold tracking-[-0.01em] text-ink transition-[transform,background,border-color] duration-300 hover:-translate-y-0.5 hover:border-white/75 hover:bg-white/5"
            >
              Start with {CATEGORIES[0].title.toLowerCase()}
            </Link>
          </div>

          <dl className="mt-16 grid max-w-[760px] grid-cols-2 gap-px overflow-hidden rounded-2xl border border-hair-soft bg-[var(--hair-soft)] sm:grid-cols-4">
            {[
              [String(ALL_SHAPES.length), "shapes"],
              [String(CATEGORIES.length), "categories"],
              ["6", "products read"],
              ["463", "raw shapes merged"],
            ].map(([v, l]) => (
              <div key={l} className="bg-black px-5 py-4">
                <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">{l}</dt>
                <dd className="mt-1 text-[28px] font-[620] tabular-nums tracking-[-0.02em]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* categories */}
      <section aria-labelledby="cats" className="mx-auto max-w-[var(--max)] px-[clamp(20px,5vw,44px)] py-16">
        <Eyebrow rule>Categories</Eyebrow>
        <h2 id="cats" className="mt-5 text-[clamp(28px,3.6vw,44px)] font-[660] leading-[1.1] tracking-[-0.028em]">
          From foundations to frames. <span className="text-ink-dim">Sixteen shelves, ordered small to large.</span>
        </h2>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-[20px] border border-hair-soft bg-[var(--hair-soft)] sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <li key={c.id} className="bg-black">
              <Link href={`/shapes/${c.id}`} className="group flex h-full flex-col p-5 transition-colors hover:bg-s1">
                <span className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
                  <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span className="tabular-nums">{c.shapes.length}</span>
                </span>
                <span className="mt-3 text-[17px] font-[600] tracking-[-0.01em]">{c.title}</span>
                <span className="mt-1.5 text-[13px] leading-snug text-ink-dim">{c.blurb}</span>
                <span className="mt-auto pt-4 text-[12.5px] text-ink-faint transition-colors group-hover:text-ink">
                  {c.shapes.slice(0, 3).map((s) => s.name).join(" · ")}
                  {c.shapes.length > 3 ? " …" : ""}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* surfaces */}
      <section aria-labelledby="surfaces" className="mx-auto max-w-[var(--max)] px-[clamp(20px,5vw,44px)] py-16">
        <Eyebrow rule>Read from</Eyebrow>
        <h2 id="surfaces" className="mt-5 text-[clamp(28px,3.6vw,44px)] font-[660] leading-[1.1] tracking-[-0.028em]">
          Six products, one vocabulary.{" "}
          <span className="text-ink-dim">Each shape names the screens it came from.</span>
        </h2>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(SURFACES) as SurfaceKey[]).map((k) => (
            <li key={k} className="glass flex items-center gap-4 p-5">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: SURFACES[k].color, boxShadow: `0 0 0 3px color-mix(in srgb, ${SURFACES[k].color} 22%, transparent)` }} aria-hidden="true" />
              <span className="flex-1">
                <span className="block text-[15.5px] font-[600]">{SURFACES[k].label}</span>
                <span className="block font-mono text-[11px] text-ink-faint">{SURFACES[k].repo}</span>
              </span>
              <span className="text-right">
                <span className="block text-[22px] font-[620] tabular-nums">{perSurface.get(k) ?? 0}</span>
                <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">shapes</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* sample */}
      <section aria-labelledby="sample" className="mx-auto max-w-[var(--max)] px-[clamp(20px,5vw,44px)] py-16">
        <div className="glass relative overflow-hidden p-[clamp(24px,5vw,56px)]">
          <div className="spec-bar absolute inset-x-0 top-0 h-[2px] opacity-80" aria-hidden="true" />
          <Mark size={40} />
          <h2 id="sample" className="mt-6 max-w-[720px] text-[clamp(28px,3.6vw,44px)] font-[660] leading-[1.1] tracking-[-0.028em]">
            Next: an app built from them.{" "}
            <span className="text-ink-dim">A space dashboard for XO, made only from these shapes.</span>
          </h2>
          <p className="mt-4 max-w-[600px] text-ink-dim">
            Overview, projects, sessions, inbox, chat, setup, telescope and the phone: every screen will list the shapes it uses and link back here.
          </p>
          <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-hair px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-dim">
            <span className="h-1.5 w-1.5 rounded-full bg-org" aria-hidden="true" />
            In progress
          </span>
        </div>
      </section>
    </>
  );
}
