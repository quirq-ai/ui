"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { RuntimeLogo, XOMark } from "@/components/ui/runtime-logo";
import { StateChip } from "@/components/ui/status";
import { CURRENT_USER, PEOPLE_LIST, PROJECTS, RUNTIMES, SPACES, type RuntimeId, type SpaceStatus } from "@/lib/fixtures";
import { cn } from "@/lib/cn";
import { DemoCell, DemoGrid, DemoRule, FOCUS_LOOK } from "./_kit";
import { EmailSearch, FacetedFilter, FilterSearch, HighlightMatch } from "./search-field";

const logoFor = (id: RuntimeId) => (id === "gemini_cli" ? "gemini" : id);

const spaceState: Record<SpaceStatus, "creating" | "starting" | "running" | "stopping" | "stopped"> = {
  Creating: "creating",
  Starting: "starting",
  Running: "running",
  Stopping: "stopping",
  Stopped: "stopped",
};

function TopbarDemo() {
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-hair bg-s1 px-3 py-2.5 sm:gap-5 sm:px-4">
      <div className="flex shrink-0 items-center gap-2.5">
        <XOMark height={14} />
        <span className="hidden text-[13px] font-medium text-ink sm:inline">Space dashboard</span>
      </div>
      <FilterSearch
        shape="topbar"
        bindShortcut
        placeholder="Search projects"
        aria-label="Search projects"
        className="mx-auto max-w-[420px]"
      />
      <Avatar name={CURRENT_USER.name} size="sm" status="up" />
    </div>
  );
}

function ProjectFilterDemo() {
  const [query, setQuery] = useState("space");
  const q = query.trim().toLowerCase();
  const matches = PROJECTS.filter((p) => !q || p.displayName.includes(q) || p.category.toLowerCase().includes(q));
  return (
    <div className="flex flex-col gap-3">
      <FilterSearch
        defaultValue="space"
        onDebouncedChange={setQuery}
        placeholder="Filter projects…"
        aria-label="Filter projects"
        meta={q ? `${matches.length} of ${PROJECTS.length}` : undefined}
        className="max-w-[300px]"
      />
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border border-hair-soft bg-hair-soft sm:grid-cols-3" aria-label="Projects">
        {PROJECTS.map((p) => {
          const hit = !q || matches.includes(p);
          return (
            <li
              key={p.id}
              aria-hidden={hit ? undefined : true}
              className={cn("flex min-w-0 items-center gap-2 bg-[#0b0b0c] px-3 py-2.5 transition-opacity duration-200", hit ? "opacity-100" : "opacity-[0.12]")}
            >
              <span className="size-1.5 shrink-0 rounded-full" style={{ background: `var(--${p.color})` }} aria-hidden="true" />
              <span className="min-w-0 truncate font-mono text-[12px] text-ink-dim">
                <HighlightMatch text={p.displayName} query={q} />
              </span>
            </li>
          );
        })}
      </ul>
      <p className="text-[11.5px] text-ink-faint">Non-matches stay in place at 12% so the layout never jumps.</p>
    </div>
  );
}

function FacetedDemo() {
  const [text, setText] = useState("");
  const [runtimes, setRuntimes] = useState<string[]>(["claude_code", "codex"]);
  const [deploy, setDeploy] = useState<string[]>([]);
  const q = text.trim().toLowerCase();

  const runtimeOptions = useMemo(
    () =>
      RUNTIMES.filter((r) => r.installed).map((r) => ({
        value: r.id,
        label: r.label,
        // Counts are rows of this table (spaces), so they add up to what the filter shows.
        count: SPACES.filter((s) => s.runtime === r.id).length,
        icon: <RuntimeLogo id={logoFor(r.id)} size={14} decorative />,
      })),
    [],
  );
  const deployOptions = [
    { value: "hosted", label: "Hosted", count: SPACES.filter((s) => s.deployment === "hosted").length },
    { value: "local", label: "Local", count: SPACES.filter((s) => s.deployment === "local").length },
  ];

  const rows = SPACES.filter(
    (s) =>
      (!q || s.name.includes(q) || s.id.includes(q)) &&
      (runtimes.length === 0 || runtimes.includes(s.runtime)) &&
      (deploy.length === 0 || deploy.includes(s.deployment)),
  );

  return (
    <div className="flex min-h-[360px] flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <FilterSearch
          shape="field"
          size="sm"
          shortcut=""
          onDebouncedChange={setText}
          placeholder="Filter spaces…"
          aria-label="Filter spaces"
          className="w-full sm:w-[200px]"
        />
        <FacetedFilter title="Runtime" options={runtimeOptions} value={runtimes} onChange={setRuntimes} defaultOpen />
        <FacetedFilter title="Deployment" options={deployOptions} value={deploy} onChange={setDeploy} />
        {runtimes.length + deploy.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              setRuntimes([]);
              setDeploy([]);
            }}
            className="h-8 rounded-[8px]! px-2.5 text-[12.5px] text-ink-dim transition-colors hover:bg-s2 hover:text-ink"
          >
            Reset
          </button>
        ) : null}
      </div>
      <div className="overflow-x-auto rounded-[12px] border border-hair-soft">
        <table className="w-full min-w-[420px] text-left text-[12.5px]">
          <thead>
            <tr className="border-b border-hair-soft font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              <th scope="col" className="px-3 py-2 font-normal">Space</th>
              <th scope="col" className="px-3 py-2 font-normal">Runtime</th>
              <th scope="col" className="px-3 py-2 font-normal">State</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-8 text-center text-ink-faint">
                  No spaces match these filters.
                </td>
              </tr>
            ) : (
              rows.map((s) => (
                <tr key={s.id} className="border-b border-hair-soft last:border-0 hover:bg-white/[0.02]">
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-ink">{s.name}</span>
                    <span className="ml-2 text-[11.5px] text-ink-faint">{s.deployment === "local" ? "Local" : "Hosted"}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-ink-dim">
                      <RuntimeLogo id={logoFor(s.runtime)} size={13} decorative />
                      {RUNTIMES.find((r) => r.id === s.runtime)?.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <StateChip kind="space" state={spaceState[s.status]} variant="plain" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SearchFieldDemo() {
  return (
    <div>
      <DemoCell label="Topbar" note="Press / anywhere on this page to focus it">
        <TopbarDemo />
      </DemoCell>

      <DemoRule />

      <DemoGrid>
        <DemoCell label="Faceted popover with counts" note="Arrow keys, Enter, Esc">
          <FacetedDemo />
        </DemoCell>
        <DemoCell label="Page filter · muting non-matches" note="Debounced 180 ms">
          <ProjectFilterDemo />
        </DemoCell>
        <DemoCell label="Email search" note="Try kenji@example.com or sam@example.com">
          <EmailSearch
            lookup={(email) => {
              const p = PEOPLE_LIST.find((x) => x.email === email);
              return p ? { name: p.name, email: p.email, detail: p.title } : null;
            }}
            existing={[CURRENT_USER.email]}
            defaultValue="kenji@example.com"
          />
        </DemoCell>
        <DemoCell label="States">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="w-[74px] shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">Idle</span>
              <FilterSearch placeholder="Search activity…" aria-label="Search activity, idle example" />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-[74px] shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">Focus</span>
              <FilterSearch placeholder="Search activity…" aria-label="Search activity, focus example" shortcut="" className={cn(FOCUS_LOOK, "border-white/25 bg-s2")} />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-[74px] shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">Filled</span>
              <FilterSearch defaultValue="aurora" aria-label="Search activity, filled example" />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-[74px] shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">Searching</span>
              <FilterSearch defaultValue="galileo" busy aria-label="Search sessions, searching example" />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-[74px] shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">Disabled</span>
              <FilterSearch placeholder="Search loaded sessions…" disabled aria-label="Search loaded sessions, disabled example" />
            </div>
          </div>
        </DemoCell>
      </DemoGrid>
    </div>
  );
}
