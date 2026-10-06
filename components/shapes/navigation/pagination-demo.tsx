"use client";

import { useState } from "react";
import { RuntimeTag } from "@/components/ui/runtime-logo";
import { SESSIONS, PROJECT_BY_ID } from "@/lib/fixtures";
import { formatCurrency, formatTokens } from "@/lib/format";
import { Caption, DemoCell, DemoGrid, DemoStack, Readout } from "./demo-kit";
import { logoFor, RESEARCH_POSTS } from "./demo-data";
import { Pagination, PrevNextPager, TablePager, type PagerLink } from "./pagination";

const post = (slug: string): PagerLink => {
  const p = RESEARCH_POSTS.find((x) => x.slug === slug) ?? RESEARCH_POSTS[0];
  return { title: p.title, href: `/research/${p.slug}` };
};

export function PaginationDemo() {
  const [page, setPage] = useState(4);
  const [tablePage, setTablePage] = useState(1);
  const [size, setSize] = useState(5);
  const [mobilePage, setMobilePage] = useState(2);
  const [mobileSize, setMobileSize] = useState(10);
  const mobileCount = Math.ceil(SESSIONS.length / mobileSize);
  const [opened, setOpened] = useState<string | null>(null);

  const pageCount = Math.max(1, Math.ceil(SESSIONS.length / size));
  const safePage = Math.min(tablePage, pageCount);
  const rows = SESSIONS.slice((safePage - 1) * size, safePage * size);

  return (
    <DemoStack>
      <DemoCell label="Numbers with ellipsis · active page · summary" note="Labels hide under 640px.">
        <div className="rounded-[14px] border border-hair-soft bg-[#0f0f11] px-3 py-4">
          <Pagination page={page} pageCount={12} onPageChange={setPage} showSummary aria-label="Activity pages" />
        </div>
      </DemoCell>

      <DemoGrid>
        <DemoCell label="Disabled start · first page">
          <div className="rounded-[14px] border border-hair-soft bg-[#0f0f11] px-3 py-4">
            <Pagination page={1} pageCount={12} onPageChange={() => undefined} aria-label="First page example" />
          </div>
        </DemoCell>
        <DemoCell label="Disabled end · last page">
          <div className="rounded-[14px] border border-hair-soft bg-[#0f0f11] px-3 py-4">
            <Pagination page={12} pageCount={12} onPageChange={() => undefined} aria-label="Last page example" />
          </div>
        </DemoCell>
      </DemoGrid>

      <DemoCell label="Table pager · rows per page · page without refetch" note="Token and cost figures are mock.">
        <div className="overflow-hidden rounded-[14px] border border-hair-soft bg-[#0f0f11]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-[13px]">
              <caption className="sr-only">Sessions, page {safePage} of {pageCount}</caption>
              <thead>
                <tr className="border-b border-hair-soft font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                  <th scope="col" className="px-4 py-2.5 font-normal">Session</th>
                  <th scope="col" className="px-4 py-2.5 font-normal">Runtime</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-normal">Tokens</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-normal">Cost · mock</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="border-b border-hair-soft last:border-b-0">
                    <td className="max-w-[300px] px-4 py-2.5">
                      <span className="block truncate text-ink">{s.title}</span>
                      <span className="font-mono text-[11px] text-ink-faint">
                        {PROJECT_BY_ID[s.projectId]?.displayName} · {s.id}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <RuntimeTag id={logoFor(s.runtime)} />
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[12px] tabular-nums text-ink-dim">{formatTokens(s.tokens)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[12px] tabular-nums text-ink-dim">{formatCurrency(s.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-hair-soft px-4 py-3">
            <TablePager
              page={safePage}
              pageCount={pageCount}
              pageSize={size}
              onPageChange={setTablePage}
              onPageSizeChange={(n) => {
                setSize(n);
                setTablePage(1);
              }}
              summary={`${SESSIONS.length} sessions`}
            />
          </div>
        </div>
      </DemoCell>

      <DemoGrid>
        <DemoCell label="Table pager · compact mobile">
          <div className="max-w-[340px] rounded-[14px] border border-hair-soft bg-[#0f0f11] px-3 py-3">
            <TablePager
              compact
              page={Math.min(mobilePage, mobileCount)}
              pageCount={mobileCount}
              pageSize={mobileSize}
              onPageChange={setMobilePage}
              onPageSizeChange={(n) => {
                setMobileSize(n);
                setMobilePage(1);
              }}
            />
          </div>
        </DemoCell>
        <DemoCell label="Prev / next · previous only">
          <PrevNextPager aria-label="More research" previous={post("the-company-dashboard")} onNavigate={(l) => setOpened(l.title)} />
        </DemoCell>
      </DemoGrid>

      <DemoCell label="Prev / next article cards · both · next only" note="Hover: the border brightens and the chevron nudges.">
        <PrevNextPager aria-label="More research" previous={post("the-company-dashboard")} next={post("agent-context-evidence")} onNavigate={(l) => setOpened(l.title)} />
        <PrevNextPager aria-label="More research, first note" next={post("what-counts-as-a-unit-of-work")} onNavigate={(l) => setOpened(l.title)} />
        {opened ? <Readout label="Opening">{opened}</Readout> : <Caption>Pick a card to open it</Caption>}
      </DemoCell>
    </DemoStack>
  );
}
