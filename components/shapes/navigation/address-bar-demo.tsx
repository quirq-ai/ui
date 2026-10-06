"use client";

import { useRef, useState } from "react";
import { GALILEO_SOURCES } from "@/lib/fixtures";
import { Caption, DemoCell, DemoGrid, DemoStack, Readout, Surface } from "./demo-kit";
import { BrowserTabStrip, BrowserToolbar, FramedPage, PathField, TelescopeBar, type BrowserTabInfo } from "./address-bar";

/* ------------------------------------------------------------------ telescope */

/** Inside the catalog frame the menu has less room than a full-width bar. */
const DEMO_MENU_WIDTH = "min(420px, calc(100vw - 88px))";

function TelescopeDemo() {
  const [current, setCurrent] = useState<string | null>("acme");
  const [paths, setPaths] = useState<Record<string, string>>({ acme: "/pricing", notes: "/drafts/plan.md" });
  const [reloading, setReloading] = useState(false);
  const src = GALILEO_SOURCES.find((s) => s.name === current) ?? null;
  const path = current ? paths[current] ?? "/" : "";
  const url = src ? `${src.url.replace(/\/$/, "")}${path}` : null;

  return (
    <>
      <Surface clip={false}>
        <TelescopeBar
          className="overflow-visible rounded-t-[13px]"
          sources={GALILEO_SOURCES}
          current={current}
          path={path}
          openHref={url ?? undefined}
          reloading={reloading}
          onPick={setCurrent}
          menuWidth={DEMO_MENU_WIDTH}
          onSources={() => setCurrent(null)}
          onReload={() => {
            setReloading(true);
            window.setTimeout(() => setReloading(false), 900);
          }}
          onNavigate={(p) => {
            if (!current || !p.startsWith("/")) return false;
            setPaths((all) => ({ ...all, [current]: p }));
            return true;
          }}
        />
        {src ? (
          <FramedPage className="rounded-b-[13px]">
            {src.up ? (
              <>
                <p className="text-[12px] text-[#5b6475]">{src.detail}</p>
                <p className="mt-1 text-[20px] font-bold tracking-[-0.01em]">{src.name === "acme" ? "Acme Notes" : src.name}</p>
                <p className="mt-1 font-mono text-[12.5px] text-[#5b6475]">{path}</p>
              </>
            ) : (
              <>
                <p className="text-[15px] font-semibold">{src.name} is not answering</p>
                <p className="mt-1 text-[13px] text-[#5b6475]">{src.detail}. Start it, then reload.</p>
              </>
            )}
          </FramedPage>
        ) : (
          <div className="rounded-b-[13px] px-5 py-5">
            <p className="text-[20px] font-semibold tracking-[-0.02em]">Sources</p>
            <p className="mt-1 max-w-[56ch] text-[13px] text-ink-dim">Apps on ports of this machine, and files or folders on it. Pick one in the switcher to open it here.</p>
          </div>
        )}
      </Surface>
      <Readout label="Address">{url ?? "http://localhost:4100/sources"}</Readout>
    </>
  );
}

/* ------------------------------------------------------------------ in-app browser */

type Tab = { id: string; history: string[]; pos: number; loading: boolean; loaded: boolean };

function titleFor(url: string | null): string {
  if (!url) return "New tab";
  try {
    const u = new URL(url);
    const p = u.pathname === "/" ? "" : u.pathname;
    return `${u.hostname.replace(".localhost", "")}${p}`;
  } catch {
    return url;
  }
}

/** Accepts http(s) addresses and bare hosts such as localhost:3000 or acme.localhost:4100/about. */
function normalize(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  if (/^https?:\/\/[^\s/]+(\/\S*)?$/i.test(s)) return s;
  if (/^([a-z0-9-]+\.)*localhost(:\d{2,5})?(\/\S*)?$/i.test(s) || /^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d{2,5})?(\/\S*)?$/i.test(s)) return `http://${s}`;
  return null;
}

const START: Tab[] = [
  { id: "t1", history: ["http://acme.localhost:4100/", "http://acme.localhost:4100/pricing"], pos: 1, loading: false, loaded: true },
  { id: "t2", history: ["http://docs.localhost:4100/getting-started"], pos: 0, loading: false, loaded: false },
  { id: "t3", history: ["http://space.localhost:4100/"], pos: 0, loading: true, loaded: true },
];

function BrowserDemo() {
  const [tabs, setTabs] = useState<Tab[]>(START);
  const [active, setActive] = useState("t1");
  const nextId = useRef(4);
  const newTab = (): Tab => ({ id: `t${nextId.current++}`, history: [], pos: -1, loading: false, loaded: true });
  const tab = tabs.find((t) => t.id === active) ?? tabs[0];
  const url = tab ? tab.history[tab.pos] ?? null : null;

  const patch = (id: string, fn: (t: Tab) => Tab) => setTabs((all) => all.map((t) => (t.id === id ? fn(t) : t)));
  const finishLoading = (id: string) => window.setTimeout(() => patch(id, (t) => ({ ...t, loading: false })), 650);

  const show = (id: string) => {
    setActive(id);
    patch(id, (t) => ({ ...t, loaded: true }));
  };
  const close = (id: string) => {
    const i = tabs.findIndex((t) => t.id === id);
    const rest = tabs.filter((t) => t.id !== id);
    if (rest.length === 0) {
      const fresh = newTab();
      setTabs([fresh]);
      setActive(fresh.id);
      return;
    }
    setTabs(rest);
    if (id === active) setActive(rest[Math.max(0, i - 1)].id);
  };

  const info: BrowserTabInfo[] = tabs.map((t) => ({ id: t.id, title: titleFor(t.history[t.pos] ?? null), url: t.history[t.pos] ?? null, loading: t.loading, loaded: t.loaded }));

  return (
    <>
      <Surface clip={false}>
        <BrowserTabStrip
          className="rounded-t-[13px]"
          tabs={info}
          activeId={active}
          max={8}
          panelId="nav-demo-browser-view"
          onShow={show}
          onClose={close}
          onNew={() => {
            const fresh = newTab();
            setTabs((all) => [...all, fresh]);
            setActive(fresh.id);
          }}
        />
        <BrowserToolbar
          url={url}
          canBack={tab.pos > 0}
          canForward={tab.pos < tab.history.length - 1}
          loading={tab.loading}
          onBack={() => patch(tab.id, (t) => ({ ...t, pos: t.pos - 1 }))}
          onForward={() => patch(tab.id, (t) => ({ ...t, pos: t.pos + 1 }))}
          onReload={() => {
            patch(tab.id, (t) => ({ ...t, loading: true }));
            finishLoading(tab.id);
          }}
          onNavigate={(input) => {
            const next = normalize(input);
            if (!next) return false;
            patch(tab.id, (t) => ({ ...t, history: [...t.history.slice(0, t.pos + 1), next], pos: t.pos + 1, loading: true }));
            finishLoading(tab.id);
            return true;
          }}
        />
        <div id="nav-demo-browser-view" role="tabpanel" aria-label={titleFor(url)} className="overflow-hidden rounded-b-[13px]">
          {url ? (
            <FramedPage>
              <p className="font-mono text-[11.5px] text-[#5b6475]">{url}</p>
              <p className="mt-1 text-[18px] font-bold tracking-[-0.01em]">{tab.loading ? "Loading…" : titleFor(url)}</p>
            </FramedPage>
          ) : (
            <div className="flex min-h-[120px] items-center justify-center px-5 text-[13px] text-ink-dim">Type an address above, like localhost:3000</div>
          )}
        </div>
      </Surface>
      <Caption>Try “not a url” and press Enter to see the invalid state; Esc puts the address back. Delete closes the focused tab.</Caption>
    </>
  );
}

const FULL: BrowserTabInfo[] = ["acme", "docs", "space", "notes", "brief", "shots", "storybook", "billing"].map((n, i) => ({
  id: n,
  title: n,
  url: `http://${n}.localhost:4100/`,
  // Every other tab is unloaded to save memory; the dashed icon marks it until it is shown.
  loaded: i % 2 === 0,
}));

export function AddressBarDemo() {
  return (
    <DemoStack>
      <DemoCell label="Telescope bar · on a source" note="Switch sources, type a path and press Enter, or Esc to revert.">
        <TelescopeDemo />
      </DemoCell>

      <DemoCell label="On Sources · path disabled, reload and open disabled, Sources current">
        <Surface>
          <TelescopeBar sources={GALILEO_SOURCES} current={null} path="" onPick={() => undefined} onNavigate={() => false} onReload={() => undefined} onSources={() => undefined} />
        </Surface>
      </DemoCell>

      <DemoCell label="Disabled before sources load · nothing current yet">
        <Surface>
          <TelescopeBar sources={null} current={null} path="" onPick={() => undefined} onNavigate={() => false} onReload={() => undefined} onSources={() => undefined} />
        </Surface>
      </DemoCell>

      <DemoGrid>
        <DemoCell label="Mobile · brand text and Sources pill hidden">
          <Surface className="max-w-[380px]">
            <TelescopeBar
              sources={GALILEO_SOURCES}
              current="notes"
              path="/drafts/plan.md"
              onPick={() => undefined}
              onNavigate={() => true}
              onReload={() => undefined}
              onSources={() => undefined}
            />
          </Surface>
        </DemoCell>
        <DemoCell label="Invalid address" note="Enter was refused; the typed text stays for fixing.">
          <Surface clip={false} className="min-h-[96px] bg-[#0d0d0f] p-1.5">
            <div className="flex items-center gap-1">
              <PathField
                value="http://acme.localhost:4100/pricing"
                aria-label="Address, invalid sample"
                placeholder="localhost:3000 or https://…"
                invalidMessage="Enter an http(s) address, like localhost:3000"
                defaultDraft="not a url"
                defaultInvalid
                onNavigate={() => false}
              />
            </div>
          </Surface>
        </DemoCell>
      </DemoGrid>

      <DemoCell label="Tab strip · full 8/8 · unloaded tabs" note="New tab is disabled at the limit; the count turns red.">
        <Surface>
          <BrowserTabStrip tabs={FULL} activeId="acme" max={8} onShow={() => undefined} onClose={() => undefined} onNew={() => undefined} />
        </Surface>
      </DemoCell>

      <DemoCell label="In-app browser · tab strip 3/8 · toolbar" note="Middle-click closes a tab. docs is unloaded until shown; space is loading.">
        <BrowserDemo />
      </DemoCell>
    </DemoStack>
  );
}
