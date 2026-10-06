"use client";

import { useState, type ReactNode } from "react";
import { Folder } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { CURRENT_SPACE, ORGANIZATIONS, SESSION_BY_ID, SPACE_BY_ID } from "@/lib/fixtures";
import { DemoCell, DemoGrid, DemoStack, Readout } from "./demo-kit";
import { Breadcrumb, HudCrumb, RuntimeIdBadge, SpaceCrumb, XOHomeCrumb } from "./breadcrumb";

const SESSION = SESSION_BY_ID["df1a1a5b"];
const ORG = ORGANIZATIONS[1];
const OPS = SPACE_BY_ID["ws_7f3a9c21e4b0"];

/** A small folder tree for the galileo files source "notes". */
const FOLDERS: Record<string, string[]> = {
  notes: ["drafts", "reading", "meetings"],
  "notes/drafts": ["2026", "archive"],
  "notes/drafts/2026": ["q4-plan.md", "verification-notes.md"],
  "notes/reading": ["snapshot-methods.md"],
  "notes/meetings": ["2026-10-01.md"],
  "notes/drafts/archive": [],
};

function Panel({ children }: { children: ReactNode }) {
  return <div className="flex min-h-[64px] flex-wrap items-center gap-3 rounded-[12px] border border-hair-soft bg-[#0f0f11] px-4 py-3">{children}</div>;
}

export function BreadcrumbDemo() {
  const [agentPath, setAgentPath] = useState(["Agents", "Sessions", "xo-space"]);
  const [folder, setFolder] = useState(["notes", "drafts", "2026"]);
  const [nav, setNav] = useState("xo-space session df1a1a5b");
  const [orgLoaded, setOrgLoaded] = useState(false);

  const folderKey = folder.join("/");
  const children = FOLDERS[folderKey] ?? [];

  return (
    <DemoStack>
      <DemoGrid>
        <DemoCell label="App header · click a crumb to go up">
          <Panel>
            <Breadcrumb
              aria-label="Agents breadcrumb"
              items={agentPath.map((label, i) => ({
                label,
                href: `#/agents/${agentPath.slice(1, i + 1).join("/").toLowerCase()}`,
                onSelect: () => {
                  setAgentPath(agentPath.slice(0, i + 1));
                  setNav(label);
                },
                badge: i === 2 ? <RuntimeIdBadge id={SESSION.id} tone="cyn" /> : undefined,
              }))}
            />
          </Panel>
          <div className="flex flex-wrap items-center gap-3">
            <Readout label="At">{nav}</Readout>
            {agentPath.length < 3 ? (
              <button
                type="button"
                onClick={() => {
                  setAgentPath(["Agents", "Sessions", "xo-space"]);
                  setNav("xo-space session df1a1a5b");
                }}
                className="rounded-[6px]! font-mono text-[11px] text-ink-dim underline decoration-hair-strong underline-offset-4 hover:text-ink"
              >
                Open the session again
              </button>
            ) : null}
          </div>
        </DemoCell>

        <DemoCell label="Space path with runtime badge" note="claude_code orange, openclaw red.">
          <Panel>
            <Breadcrumb
              aria-label="Space breadcrumb"
              items={[
                { label: null, icon: <XOHomeCrumb />, href: "#/", "aria-label": "Home" },
                { label: "Spaces", href: "#/spaces" },
                { label: CURRENT_SPACE.name, badge: <RuntimeIdBadge id={CURRENT_SPACE.runtime} tone="org" /> },
              ]}
            />
          </Panel>
          <Panel>
            <Breadcrumb
              aria-label="Hosted space breadcrumb"
              items={[
                { label: null, icon: <XOHomeCrumb />, href: "#/", "aria-label": "Home" },
                { label: "Spaces", href: "#/spaces" },
                { label: OPS.name, badge: <RuntimeIdBadge id={OPS.runtime} tone="red" /> },
              ]}
            />
          </Panel>
          <Panel>
            <Breadcrumb aria-label="Home breadcrumb" items={[{ label: null, icon: <XOHomeCrumb alone />, "aria-label": "Home" }]} />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Home only · full-opacity mark</span>
          </Panel>
        </DemoCell>

        <DemoCell label="Org path with copy · name loading" note="Copy shows a check for 1.6s.">
          <Panel>
            <Breadcrumb
              aria-label="Org breadcrumb"
              items={[
                { label: null, icon: <XOHomeCrumb />, href: "#/", "aria-label": "Home" },
                { label: "Org", href: "#/org" },
                { label: ORG.name },
              ]}
              trailing={<CopyButton text={ORG.name} size="sm" aria-label="Copy organization name" announce="Organization name copied" />}
            />
          </Panel>
          <Panel>
            <Breadcrumb
              aria-label="Org breadcrumb, loading"
              items={[
                { label: null, icon: <XOHomeCrumb />, href: "#/", "aria-label": "Home" },
                { label: "Org", href: "#/org" },
                {
                  label: orgLoaded ? (
                    ORGANIZATIONS[2].name
                  ) : (
                    <>
                      <span aria-hidden="true">…</span>
                      <span className="sr-only">Loading organization name</span>
                    </>
                  ),
                },
              ]}
            />
            <button
              type="button"
              onClick={() => setOrgLoaded((v) => !v)}
              className="ml-auto rounded-[6px]! font-mono text-[11px] text-ink-dim underline decoration-hair-strong underline-offset-4 hover:text-ink"
            >
              {orgLoaded ? "Reset" : "Finish loading"}
            </button>
          </Panel>
        </DemoCell>

        <DemoCell label="Folder crumbs · galileo files source" note="Open a folder, or click a crumb to go up.">
          <div className="rounded-[12px] border border-hair-soft bg-[#0f0f11] px-3 py-3">
            <Breadcrumb
              variant="folder"
              separator="slash"
              aria-label="Folder"
              items={folder.map((f, i) => ({ label: f, href: `#/${folder.slice(0, i + 1).join("/")}`, onSelect: () => setFolder(folder.slice(0, i + 1)) }))}
            />
            <ul className="mt-2 border-t border-hair-soft pt-2">
              {children.length === 0 ? (
                <li className="px-1.5 py-1 text-[12.5px] text-ink-faint">This folder is empty.</li>
              ) : (
                children.map((c) => {
                  const isFolder = !c.includes(".");
                  return (
                    <li key={c}>
                      {isFolder ? (
                        <button
                          type="button"
                          onClick={() => setFolder([...folder, c])}
                          className="flex w-full items-center gap-2 rounded-[6px]! px-1.5 py-1 text-left font-mono text-[12.5px] text-ink hover:bg-s2"
                        >
                          <Folder aria-hidden="true" className="size-3.5 text-ink-faint" />
                          {c}/
                        </button>
                      ) : (
                        <span className="flex items-center gap-2 px-1.5 py-1 font-mono text-[12.5px] text-ink-dim">{c}</span>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
          <div className="rounded-[12px] border border-hair-soft bg-[#0f0f11] px-3 py-2.5">
            <Breadcrumb
              variant="folder"
              separator="slash"
              aria-label="Long folder path"
              items={["~", "projects", "galileo", "sample-app", "public", "assets", "screenshots-before-and-after"].map((f) => ({ label: f, href: "#" }))}
            />
          </div>
        </DemoCell>
      </DemoGrid>

      <DemoGrid>
        <DemoCell label="Space crumb with status dot" note="Hover the mark for its status.">
          <div className="flex flex-col gap-2.5">
            <Panel>
              <SpaceCrumb name={CURRENT_SPACE.name} host={CURRENT_SPACE.host} status="up" mode="mock" />
            </Panel>
            <Panel>
              <SpaceCrumb name={OPS.name} host={OPS.host} status="up" mode="live" />
            </Panel>
            <Panel>
              <SpaceCrumb name="billing-sandbox" host="billing-sandbox.spaces.example.com" status="down" mode="live" />
            </Panel>
            <Panel>
              <SpaceCrumb name="demo-pilot" host="demo-pilot.spaces.example.com" status="checking" mode="live" />
            </Panel>
          </div>
        </DemoCell>

        <div className="flex min-w-0 flex-col gap-8">
          <DemoCell label="HUD layer crumb · live pip">
            <div className="dots flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-[12px] border border-hair-soft bg-[#05060a] p-4">
              <HudCrumb segments={["Space", "Research", CURRENT_SPACE.name]} />
              <HudCrumb segments={["Surface", "Engineering", "xo-space"]} />
              <HudCrumb segments={["Space", "Ops", "ops-runbooks"]} live={false} />
            </div>
          </DemoCell>
          <DemoCell label="States · hover · copied · compact" note="Static samples.">
            <div inert className="flex flex-col gap-2.5">
              <Panel>
                <Breadcrumb
                  aria-label="Hover sample"
                  hoverIndex={1}
                  items={[
                    { label: null, icon: <XOHomeCrumb />, href: "#/", "aria-label": "Home" },
                    { label: "Spaces", href: "#/spaces" },
                    { label: CURRENT_SPACE.name },
                  ]}
                />
                <span className="ml-auto font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Spaces hovered</span>
              </Panel>
              <Panel>
                <SpaceCrumb name={OPS.name} host={OPS.host} status="up" mode="live" copied />
              </Panel>
              <Panel>
                <SpaceCrumb name={CURRENT_SPACE.name} host={CURRENT_SPACE.host} status="up" mode="mock" compact />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Compact on phones · mark only</span>
              </Panel>
            </div>
          </DemoCell>
        </div>
      </DemoGrid>
    </DemoStack>
  );
}
