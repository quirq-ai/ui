import { Mark } from "@/components/brand/mark";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-hair-soft">
      <div className="spec-bar absolute inset-x-0 top-0 h-px opacity-50" aria-hidden="true" />
      <div className="mx-auto flex max-w-[var(--max)] flex-col gap-4 px-[clamp(20px,5vw,44px)] py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-[13px] text-ink-dim">
          <Mark size={20} className="text-ink" />
          {site.description}
        </div>
        <a href={site.url} target="_blank" rel="noopener" className="font-mono text-[11px] uppercase tracking-[0.13em] text-ink-faint hover:text-ink">
          {site.url.replace(/^https?:\/\//, "")} ↗
        </a>
      </div>
    </footer>
  );
}
