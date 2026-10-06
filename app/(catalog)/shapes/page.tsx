import type { Metadata } from "next";
import { Eyebrow } from "@/components/brand/mark";
import { ShapeSearch, type ShapeRow } from "@/components/site/shape-search";
import { ALL_SHAPES } from "@/lib/registry";
import { groupSeenIn } from "@/lib/surfaces";

export const metadata: Metadata = { title: "All shapes" };

export default function ShapesIndex() {
  const rows: ShapeRow[] = ALL_SHAPES.map((s) => ({
    id: s.id,
    name: s.name,
    purpose: s.purpose,
    categoryId: s.categoryId,
    categoryTitle: s.categoryTitle,
    surfaces: groupSeenIn(s.seenIn).map((g) => g.key),
  }));
  return (
    <div className="mx-auto max-w-[var(--max)] px-[clamp(20px,5vw,44px)] pt-10">
      <Eyebrow rule>Index · {rows.length} shapes</Eyebrow>
      <h1 className="mt-5 text-[clamp(32px,4.4vw,52px)] font-[660] leading-[1.08] tracking-[-0.028em]">
        Every shape. <span className="text-ink-dim">Find one by name or by product.</span>
      </h1>
      <div className="mt-8">
        <ShapeSearch rows={rows} />
      </div>
    </div>
  );
}
