"use client";

import { useRef, useState, type ReactNode } from "react";
import { GALILEO, GALILEO_SOURCES } from "@/lib/fixtures";
import { Segmented } from "@/components/ui";
import { DemoSection, DemoStack, Hint, Specimen } from "./_kit";
import {
  AppIframePane,
  BridgeReadout,
  BrowserNewTab,
  BrowserTabStrip,
  BrowserToolbar,
  SourceFrame,
  TelescopeBar,
  type AppPaneState,
  type BrowserTabInfo,
} from "./embedded-frame";
import { MiniSources, MiniSpaceDashboard } from "./mini-apps";

const noop = () => {};

/* ----------------------------------------------------------------------------- mock pages (light apps) */

const PLANS = [
  { name: "Free", month: 0, note: "For one person" },
  { name: "Team", month: 8, note: "Per member" },
  { name: "Business", month: 16, note: "Per member, SSO" },
];

function AcmeSite({ path, onNavigate, onOpenSource }: { path: string; onNavigate: (p: string) => void; onOpenSource?: (name: string) => void }) {
  const [yearly, setYearly] = useState(false);
  const link = "rounded-[4px]! text-[13px] text-[#3b4150] underline-offset-4 hover:text-[#16181d] hover:underline";
  return (
    <div className="min-h-full bg-white">
      <nav aria-label="Acme Notes" className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-[#e6e8ee] px-5 py-3">
        <button type="button" onClick={() => onNavigate("/")} className="flex items-center gap-2 rounded-[4px]! text-[14px] font-semibold text-[#16181d]">
          <span aria-hidden="true" className="size-4 rounded-[4px] bg-[#2e9bff]" />
          Acme Notes
        </button>
        <button type="button" onClick={() => onNavigate("/")} aria-current={path === "/" ? "page" : undefined} className={link}>
          Home
        </button>
        <button type="button" onClick={() => onNavigate("/pricing")} aria-current={path === "/pricing" ? "page" : undefined} className={link}>
          Pricing
        </button>
        {onOpenSource ? (
          <button type="button" onClick={() => onOpenSource("docs")} className={link}>
            Docs →
          </button>
        ) : null}
      </nav>
      {path === "/pricing" ? (
        <div className="px-5 py-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#16181d]">Pricing</h1>
              <p className="text-[12.5px] text-[#5b6170]">Illustrative prices for a fictional app.</p>
            </div>
            <div role="group" aria-label="Billing period" className="inline-flex rounded-full border border-[#dfe2e8] p-0.5 text-[12px]">
              {["Monthly", "Yearly"].map((label) => {
                const on = (label === "Yearly") === yearly;
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setYearly(label === "Yearly")}
                    className={on ? "rounded-full! bg-[#16181d] px-3 py-1 text-white" : "rounded-full! px-3 py-1 text-[#3b4150]"}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {PLANS.map((p) => (
              <li key={p.name} className="rounded-[12px] border border-[#e6e8ee] bg-[#fafbfc] p-4">
                <p className="text-[13px] font-semibold text-[#16181d]">{p.name}</p>
                <p className="mt-1 text-[22px] font-semibold tabular-nums text-[#16181d]">
                  ${yearly ? p.month * 10 : p.month}
                  <span className="text-[12px] font-normal text-[#5b6170]"> / {yearly ? "year" : "month"}</span>
                </p>
                <p className="text-[12px] text-[#5b6170]">{p.note}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : path === "/" ? (
        <div className="px-5 py-8">
          <h1 className="max-w-[420px] text-[24px] font-semibold leading-tight tracking-[-0.02em] text-[#16181d]">Notes that keep up with your team.</h1>
          <p className="mt-2 max-w-[420px] text-[13px] text-[#5b6170]">A fictional app served by Vite on port 4173, reached through galileo at its own origin.</p>
          <button type="button" onClick={() => onNavigate("/pricing")} className="mt-4 rounded-full! bg-[#16181d] px-4 py-1.5 text-[12.5px] font-medium text-white">
            See pricing
          </button>
        </div>
      ) : (
        <div className="px-5 py-8">
          <h1 className="text-[18px] font-semibold text-[#16181d]">Page not found</h1>
          <p className="mt-1 text-[13px] text-[#5b6170]">Acme Notes has no page at {path}.</p>
        </div>
      )}
    </div>
  );
}

function DocsSite() {
  return (
    <div className="grid min-h-full bg-white sm:grid-cols-[160px_minmax(0,1fr)]">
      <nav aria-label="Docs" className="border-b border-[#e6e8ee] bg-[#fafbfc] p-4 text-[12.5px] sm:border-b-0 sm:border-r">
        <p className="mb-2 font-semibold text-[#16181d]">Acme Docs</p>
        <ul className="flex flex-col gap-1.5 text-[#3b4150]">
          <li className="font-medium text-[#16181d]">Getting started</li>
          <li>Sharing notes</li>
          <li>Keyboard shortcuts</li>
        </ul>
      </nav>
      <article className="p-5">
        <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-[#16181d]">Getting started</h1>
        <p className="mt-2 max-w-[52ch] text-[13px] leading-relaxed text-[#3b4150]">
          Create a notebook, invite your team and pin the notes everyone needs. This docs server runs on port 3001.
        </p>
      </article>
    </div>
  );
}

const NOTES = [
  ["2026-09-30 standup.md", "2.1 KB", "Wed 30 Sep"],
  ["verification-reading.md", "8.4 KB", "Tue 29 Sep"],
  ["snapshots", "12 files", "Mon 28 Sep"],
  ["quirq-method-v0.md", "5.0 KB", "Fri 25 Sep"],
  ["interview-notes.md", "3.3 KB", "Thu 24 Sep"],
];

function FilesListing({ name, path }: { name: string; path: string }) {
  return (
    <div className="min-h-full bg-white p-5">
      <h1 className="font-mono text-[14px] text-[#16181d]">
        {name}
        {path}
      </h1>
      <p className="mt-1 text-[12px] text-[#5b6170]">A listing galileo makes for a folder source. Read only.</p>
      <table className="mt-3 w-full text-left text-[12.5px]">
        <thead>
          <tr className="text-[11px] uppercase tracking-[0.08em] text-[#7a8090]">
            <th scope="col" className="py-1.5 font-medium">Name</th>
            <th scope="col" className="py-1.5 text-right font-medium">Size</th>
            <th scope="col" className="py-1.5 text-right font-medium">Modified</th>
          </tr>
        </thead>
        <tbody>
          {NOTES.map(([n, size, mod]) => (
            <tr key={n} className="border-t border-[#eef0f4]">
              <td className="py-1.5 font-mono text-[#2e6fd8]">{n}</td>
              <td className="py-1.5 text-right tabular-nums text-[#5b6170]">{size}</td>
              <td className="py-1.5 text-right text-[#5b6170]">{mod}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DownPage({ name, detail, onRetry }: { name: string; detail: string; onRetry: () => void }) {
  return (
    <div className="grid h-full place-items-center bg-[#0b0b0c] p-6 text-center">
      <div>
        <p className="text-[15px] font-semibold text-ink">{name} is not answering</p>
        <p className="mt-1 text-[12.5px] text-ink-dim">{detail}. galileo keeps checking and the dot turns green when it answers.</p>
        <button type="button" onClick={onRetry} className="mt-3 h-7 rounded-[8px]! border border-hair bg-s2 px-3 text-[12px] text-ink hover:bg-s3">
          Try again
        </button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- telescope */

/** On the Sources page: the frame left behind is still mounted, and one click returns to it. */
function KeptAliveNote({ name, path, onBack }: { name: string; path: string; onBack: () => void }) {
  return (
    <p className="mt-2 inline-flex flex-wrap items-center gap-2 rounded-[8px] border border-hair bg-s1 px-2.5 py-1.5 text-[12px] text-ink-dim">
      <span className="font-mono text-ink">{name}</span> stays loaded while you are here.
      <button type="button" onClick={onBack} className="rounded-[4px]! text-ink underline underline-offset-4">
        Back to {path}
      </button>
    </p>
  );
}

type Route = { view: "sources" } | { view: "source"; name: string; path: string } | { view: "missing"; path: string };

function pageTitle(name: string, path: string): string {
  if (name === "acme") return path === "/pricing" ? "Pricing · Acme Notes" : path === "/" ? "Acme Notes" : "Not found · Acme Notes";
  if (name === "docs") return "Getting started · Acme Docs";
  const src = GALILEO_SOURCES.find((s) => s.name === name);
  if (src?.type === "files") return `${name}${path}`;
  return name;
}

function address(route: Route): string {
  if (route.view === "sources") return "localhost:4100/sources";
  if (route.view === "missing") return `localhost:4100${route.path}`;
  return `localhost:4100/s/${route.name}${route.path}`;
}

function tabTitle(route: Route): string {
  if (route.view === "sources") return "Sources · galileo";
  if (route.view === "missing") return "galileo";
  return `${pageTitle(route.name, route.path)} · ${route.name} · galileo`;
}

const ROUTES: { label: string; route: Route }[] = [
  { label: "/sources", route: { view: "sources" } },
  { label: "/s/acme/pricing", route: { view: "source", name: "acme", path: "/pricing" } },
  { label: "/s/notes/", route: { view: "source", name: "notes", path: "/" } },
  { label: "/s/storybook/", route: { view: "source", name: "storybook", path: "/" } },
  { label: "/settings", route: { view: "missing", path: "/settings" } },
];

function LiveTelescope() {
  const [route, setRoute] = useState<Route>({ view: "source", name: "acme", path: "/pricing" });
  const [alive, setAlive] = useState<{ name: string; path: string } | null>({ name: "acme", path: "/pricing" });
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function go(next: Route) {
    setRoute(next);
    setNote(null);
    if (next.view === "source") {
      if (!alive || alive.name !== next.name) {
        setLoading(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setLoading(false), 600);
      }
      setAlive({ name: next.name, path: next.path });
    }
  }

  function reload() {
    setReloadKey((k) => k + 1);
    setLoading(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setLoading(false), 700);
  }

  const current = route.view === "source" ? route.name : null;
  const source = alive ? GALILEO_SOURCES.find((s) => s.name === alive.name) : null;

  function page(name: string, path: string): ReactNode {
    const src = GALILEO_SOURCES.find((s) => s.name === name);
    if (!src || !src.up) return <DownPage name={name} detail={src?.detail ?? "Unknown source"} onRetry={reload} />;
    if (name === "acme") return <AcmeSite path={path} onNavigate={(p) => go({ view: "source", name, path: p })} onOpenSource={(n) => go({ view: "source", name: n, path: "/" })} />;
    if (name === "docs") return <DocsSite />;
    if (name === "space") return <MiniSpaceDashboard />;
    if (src.type === "files") return <FilesListing name={name} path={path} />;
    return <AcmeSite path={path} onNavigate={(p) => go({ view: "source", name, path: p })} />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Go to</span>
        {ROUTES.map((r) => (
          <button
            key={r.label}
            type="button"
            onClick={() => go(r.route)}
            aria-pressed={address(route) === address(r.route)}
            className="h-6 rounded-full! border border-hair px-2.5 font-mono text-[11px] text-ink-dim transition-colors hover:text-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-black"
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-[14px] border border-hair bg-[#0e0e10]">
        {/* the browser tab this telescope page lives in: title and address */}
        <div className="flex min-w-0 items-center gap-3 border-b border-hair-soft bg-[#141416] px-3 py-1.5">
          <span className="max-w-[45%] truncate rounded-t-[6px] text-[11.5px] text-ink">{tabTitle(route)}</span>
          <span className="min-w-0 flex-1 truncate rounded-full bg-black/40 px-3 py-0.5 font-mono text-[11px] text-ink-faint">{address(route)}</span>
        </div>
        <TelescopeBar
          sources={GALILEO_SOURCES}
          current={current}
          path={route.view === "source" ? route.path : "/"}
          onSelectSource={(name) => (name ? go({ view: "source", name, path: "/" }) : go({ view: "sources" }))}
          onNavigate={(p) => current && go({ view: "source", name: current, path: p })}
          onReload={reload}
          onPopOut={() => setNote(`Opens ${source?.url.replace(/\/$/, "")}${alive?.path ?? "/"} in a tab of its own. Off in the catalog.`)}
          loading={loading}
        />
        <div className="relative flex h-[380px] flex-col">
          {route.view === "sources" ? (
            <div className="scroll-thin h-full overflow-y-auto bg-[#0e0e10]">
              <div className="px-4 pt-4">
                <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-ink">Sources</h2>
                <p className="mt-1 max-w-[60ch] text-[12.5px] leading-relaxed text-ink-dim">
                  What galileo inspects: apps on ports of this machine, and files or folders on it. Each source gets an address of its own
                  at {GALILEO.pattern} and opens here, under the bar.
                </p>
                {alive ? <KeptAliveNote name={alive.name} path={alive.path} onBack={() => go({ view: "source", name: alive.name, path: alive.path })} /> : null}
              </div>
              <MiniSources onOpen={(name) => go({ view: "source", name, path: "/" })} />
            </div>
          ) : null}
          {route.view === "missing" ? (
            <div className="grid h-full place-items-center bg-[#0e0e10] p-6 text-center">
              <div>
                <p className="text-[15px] font-semibold text-ink">Nothing at {route.path}</p>
                <p className="mt-1 text-[12.5px] text-ink-dim">galileo has a Sources page and one page per source.</p>
                <button type="button" onClick={() => go({ view: "sources" })} className="mt-3 rounded-[4px]! text-[12.5px] text-ink underline underline-offset-4">
                  Go to Sources
                </button>
              </div>
            </div>
          ) : null}
          {alive ? (
            <SourceFrame
              key={`${alive.name}-${reloadKey}`}
              title={pageTitle(alive.name, alive.path)}
              hidden={route.view !== "source"}
              loading={loading}
              backing={source?.up && alive.name !== "space" ? "white" : "dark"}
            >
              {page(alive.name, alive.path)}
            </SourceFrame>
          ) : null}
        </div>
        {route.view === "source" ? (
          <BridgeReadout path={route.path} title={pageTitle(route.name, route.path)} note="polls every 300 ms" />
        ) : (
          <BridgeReadout path={alive?.path ?? "none"} title={alive ? "kept alive, hidden" : "no frame"} />
        )}
      </div>
      <Hint>
        Pick a source from the switcher, type a path and press Enter, or follow the in-frame links. Leave for Sources and come back: the
        pricing toggle keeps its state because the frame is hidden, not destroyed.
      </Hint>
      {note ? (
        <p role="status" className="text-[12px] text-ink-dim">
          {note}
        </p>
      ) : null}
    </div>
  );
}

/** Sources over a hidden acme frame: Back shows the same frame, its pricing toggle unchanged. */
function KeptAliveSpecimen() {
  const [onSources, setOnSources] = useState(true);
  return (
    <div className="flex h-[280px] flex-col overflow-hidden rounded-[12px] border border-hair bg-[#0e0e10]">
      <TelescopeBar
        sources={GALILEO_SOURCES}
        current={onSources ? null : "acme"}
        path="/pricing"
        onSelectSource={(name) => {
          if (name === null || name === "acme") setOnSources(name === null);
        }}
        onNavigate={noop}
      />
      {onSources ? (
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">
          <div className="px-4 pt-3">
            <h3 className="text-[15px] font-semibold text-ink">Sources</h3>
            <KeptAliveNote name="acme" path="/pricing" onBack={() => setOnSources(false)} />
          </div>
          <MiniSources />
        </div>
      ) : null}
      <SourceFrame title={pageTitle("acme", "/pricing")} hidden={onSources}>
        <AcmeSite path="/pricing" onNavigate={noop} />
      </SourceFrame>
      <BridgeReadout path="/pricing" title={onSources ? "kept alive, hidden" : pageTitle("acme", "/pricing")} />
    </div>
  );
}

/* ----------------------------------------------------------------------------- swarm app pane */

function LivePane({ appName, initial }: { appName: string; initial: AppPaneState }) {
  const [state, setState] = useState<AppPaneState>(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function remint() {
    setState("minting");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("ready"), 800);
  }
  return (
    <div className="h-[280px] overflow-hidden rounded-[10px] border border-hair bg-[#0e0e10]">
      <AppIframePane appName={appName} state={state} onReload={remint} onOpenExternal={() => {}}>
        <MiniSpaceDashboard />
      </AppIframePane>
    </div>
  );
}

/* ----------------------------------------------------------------------------- browser */

type Tab = { id: string; history: string[]; index: number; loading: boolean };

const SHORTCUTS = GALILEO_SOURCES.filter((s) => s.up && s.type === "port").map((s) => ({ label: s.name, url: s.url }));

function hostOf(url: string): string {
  return url.replace(/^https?:\/\//, "").split("/")[0];
}

function LiveBrowser() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: "t1", history: [], index: -1, loading: false }]);
  const [active, setActive] = useState("t1");
  const [count, setCount] = useState(1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const tab = tabs.find((t) => t.id === active) ?? tabs[0];
  const url = tab.index >= 0 ? tab.history[tab.index] : null;

  function update(id: string, fn: (t: Tab) => Tab) {
    setTabs((ts) => ts.map((t) => (t.id === id ? fn(t) : t)));
  }
  function settle(id: string) {
    timers.current.push(setTimeout(() => update(id, (t) => ({ ...t, loading: false })), 650));
  }
  function open(next: string) {
    const id = tab.id;
    update(id, (t) => ({ ...t, history: [...t.history.slice(0, t.index + 1), next], index: t.index + 1, loading: true }));
    settle(id);
  }
  function submit(input: string): boolean {
    if (!input || /\s/.test(input)) return false;
    open(/^https?:\/\//.test(input) ? input : `http://${input}`);
    return true;
  }

  const infos: BrowserTabInfo[] = tabs.map((t) => {
    const u = t.index >= 0 ? t.history[t.index] : null;
    return { id: t.id, title: u ? hostOf(u) : "New tab", loading: t.loading };
  });

  function view(u: string): ReactNode {
    const host = hostOf(u);
    const name = host.split(".")[0];
    const src = GALILEO_SOURCES.find((s) => hostOf(s.url) === host);
    if (!src) {
      return (
        <div className="grid h-full place-items-center bg-[#0b0b0c] p-6 text-center">
          <div>
            <p className="text-[14px] font-medium text-ink">Could not reach {host}</p>
            <p className="mt-1 text-[12px] text-ink-dim">Nothing answered at that address from this space.</p>
          </div>
        </div>
      );
    }
    if (name === "acme") return <AcmeSite path="/" onNavigate={(p) => open(`${src.url.replace(/\/$/, "")}${p}`)} />;
    if (name === "docs") return <DocsSite />;
    return <MiniSpaceDashboard />;
  }

  return (
    <div className="flex h-[400px] flex-col overflow-hidden rounded-[14px] border border-hair bg-[#0e0e10]">
      <BrowserTabStrip
        tabs={infos}
        active={tab.id}
        onSelect={setActive}
        onNew={() => {
          const id = `t${count + 1}`;
          setCount((c) => c + 1);
          setTabs((ts) => [...ts, { id, history: [], index: -1, loading: false }]);
          setActive(id);
        }}
        onClose={(id) => {
          const rest = tabs.filter((t) => t.id !== id);
          const next = rest.length ? rest : [{ id: `t${count + 1}`, history: [], index: -1, loading: false }];
          if (!rest.length) setCount((c) => c + 1);
          setTabs(next);
          if (id === active) setActive(next[next.length - 1].id);
        }}
      />
      <BrowserToolbar
        url={url}
        canBack={tab.index > -1}
        canForward={tab.index < tab.history.length - 1}
        loading={tab.loading}
        onBack={() => update(tab.id, (t) => ({ ...t, index: t.index - 1 }))}
        onForward={() => update(tab.id, (t) => ({ ...t, index: t.index + 1 }))}
        onReload={() => {
          update(tab.id, (t) => ({ ...t, loading: true }));
          settle(tab.id);
        }}
        onSubmit={submit}
        onOpenExternal={() => {}}
      />
      {url ? (
        <SourceFrame key={`${tab.id}-${tab.index}`} title={`Page: ${url}`} loading={tab.loading} backing={hostOf(url).startsWith("space") ? "dark" : "white"}>
          {view(url)}
        </SourceFrame>
      ) : (
        <div className="min-h-0 flex-1">
          <BrowserNewTab shortcuts={SHORTCUTS} onOpen={open} />
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------------- demo */

export function EmbeddedFrameDemo() {
  const [paneApp, setPaneApp] = useState<"Space" | "Cowork">("Space");
  return (
    <DemoStack>
      <DemoSection title="telescope · source, Sources and missing views">
        <LiveTelescope />
      </DemoSection>

      <DemoSection title="Bar states">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Specimen label="First load · switcher disabled" note="before the sources API answers">
            <div className="overflow-hidden rounded-[12px] border border-hair">
              <TelescopeBar sources={GALILEO_SOURCES} current={null} path="/" onSelectSource={noop} onNavigate={noop} disabled />
            </div>
          </Specimen>
          <Specimen label="Narrow · under 640 px">
            <div className="max-w-[360px] overflow-hidden rounded-[12px] border border-hair">
              <TelescopeBar sources={GALILEO_SOURCES} current="storybook" path="/?path=/story/button" onSelectSource={noop} onNavigate={noop} />
            </div>
          </Specimen>
        </div>
      </DemoSection>

      <DemoSection title="Frame states">
        <div className="grid gap-6 lg:grid-cols-2">
          <Specimen label="Loading · switching source" note="veil until the frame fires load">
            <div className="flex h-[280px] flex-col overflow-hidden rounded-[12px] border border-hair bg-[#0e0e10]">
              <TelescopeBar sources={GALILEO_SOURCES} current="docs" path="/" onSelectSource={noop} onNavigate={noop} loading />
              <SourceFrame title={pageTitle("docs", "/")} loading>
                <DocsSite />
              </SourceFrame>
            </div>
          </Specimen>
          <Specimen label="Kept alive · Sources showing" note="frame hidden, not destroyed">
            <KeptAliveSpecimen />
          </Specimen>
        </div>
      </DemoSection>

      <DemoSection
        title="iframe pane · swarm"
        aside={
          <Segmented<"Space" | "Cowork">
            aria-label="App"
            size="sm"
            value={paneApp}
            onChange={setPaneApp}
            options={[
              { value: "Space", label: "Space" },
              { value: "Cowork", label: "Cowork" },
            ]}
          />
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Specimen label="Minting URL">
            <div className="h-[280px] overflow-hidden rounded-[10px] border border-hair bg-[#0e0e10]">
              <AppIframePane appName={paneApp} state="minting" />
            </div>
          </Specimen>
          <Specimen label="Not running">
            <div className="h-[280px] overflow-hidden rounded-[10px] border border-hair bg-[#0e0e10]">
              <AppIframePane appName={paneApp} state="not_running" />
            </div>
          </Specimen>
          <Specimen label="Loaded · reload remints">
            <LivePane key={paneApp} appName={paneApp} initial="ready" />
          </Specimen>
        </div>
      </DemoSection>

      <DemoSection title="Browser · new tab">
        <LiveBrowser />
        <Hint className="mt-3">Open a shortcut or type an address and press Enter. Back returns to the new tab; the + adds another tab.</Hint>
      </DemoSection>
    </DemoStack>
  );
}
