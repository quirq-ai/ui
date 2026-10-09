import Link from "next/link";
import { Mark } from "@/components/brand/mark";
import { site } from "@/lib/site";

export function SiteNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-hair-soft bg-black/75 px-[clamp(20px,4vw,44px)] backdrop-blur-xl"
    >
      <Link href="/" aria-label={`${site.name} home`} className="flex items-center gap-2.5">
        <Mark size={26} />
        <span className="font-round text-[19px] font-semibold tracking-[0.01em]">{site.name}</span>
        {site.tag && (
          <span className="rounded-md border border-hair px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-dim">
            {site.tag}
          </span>
        )}
      </Link>
      <div className="flex items-center gap-6 font-mono text-[11.5px] uppercase tracking-[0.13em]">
        {site.nav.map((l) => (
          <Link key={l.href} href={l.href} className="text-ink-dim transition-colors hover:text-ink">
            {l.label}
          </Link>
        ))}
        <a href={site.repo} target="_blank" rel="noopener" className="text-ink-dim transition-colors hover:text-ink">
          GitHub ↗
        </a>
      </div>
    </nav>
  );
}
