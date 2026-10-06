import Link from "next/link";
import { Mark } from "@/components/brand/mark";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-hair-soft">
      <div className="spec-bar absolute inset-x-0 top-0 h-px opacity-50" aria-hidden="true" />
      <div className="mx-auto flex max-w-[var(--max)] flex-col gap-6 px-[clamp(20px,5vw,44px)] py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-ink-dim">
          <Mark size={22} className="text-ink" />
          <span className="text-[13px]">
            quirq shapes · the UI building blocks of XO Space, XO Swarm and galileo
          </span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.13em] text-ink-faint">
          <Link href="/shapes" className="hover:text-ink">Shapes</Link>
          <a href="https://github.com/quirq-ai/ui" target="_blank" rel="noopener" className="hover:text-ink">GitHub ↗</a>
          <a href="https://quirq.ai" target="_blank" rel="noopener" className="hover:text-ink">quirq.ai ↗</a>
        </div>
      </div>
    </footer>
  );
}
