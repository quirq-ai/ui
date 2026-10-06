"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChartNoAxesColumn,
  FilterX,
  FolderGit2,
  Inbox,
  MessageCircleDashed,
  Network,
  Pin,
  Plus,
  Radio,
  ScrollText,
  ServerOff,
  TriangleAlert,
  Unplug,
  Users,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Input, SearchInput } from "@/components/ui/field";
import { TabChips } from "@/components/ui/segmented";
import { Switch } from "@/components/ui/switch";
import { CURRENT_SPACE, ORBIT_CATEGORIES, PROJECTS, QUIRQ_UNAVAILABLE_NOTE, SPACES } from "@/lib/fixtures";
import { Caption, DemoGroup, DemoStack, Specimen } from "./parts";
import { EmptyLine, EmptyState, OfflineState, TwoUpEmpty } from "./empty-state";

type Pane = "empty" | "manage" | "start";

/* https://host/owner/name(.git) or git@host:owner/name(.git) */
const GIT_ORIGIN = /^(https:\/\/[\w.-]+\/[\w.-]+\/[\w.-]+?(\.git)?|git@[\w.-]+:[\w.-]+\/[\w.-]+?(\.git)?)\/?$/;
const repoName = (url: string) => url.trim().replace(/\/$/, "").replace(/\.git$/, "").split(/[/:]/).pop() ?? url;

export function EmptyStateDemo() {
  const [query, setQuery] = useState("kepler");
  const [category, setCategory] = useState("all");
  const [pane, setPane] = useState<Pane>("empty");
  const [parked, setParked] = useState(false);
  const [repo, setRepo] = useState("");
  const [cloned, setCloned] = useState<string | null>(null);
  const gitOk = GIT_ORIGIN.test(repo.trim());
  const [retrying, setRetrying] = useState(false);
  const [attempts, setAttempts] = useState(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const q = query.trim().toLowerCase();
  const rows = PROJECTS.filter((p) => (category === "all" || p.category === category) && (!q || p.displayName.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)));
  const filtered = Boolean(q) || category !== "all";
  const stopped = SPACES.find((s) => s.status === "Stopped");

  const retry = () => {
    setRetrying(true);
    timer.current = setTimeout(() => {
      setRetrying(false);
      setAttempts((n) => n + 1);
    }, 1100);
  };

  return (
    <DemoStack>
      <DemoGroup title="Filters left nothing" hint="Type or pick a category; Clear filters brings the list back.">
        <div className="rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
          <div className="flex flex-col gap-3">
            <SearchInput size="sm" shape="field" aria-label="Filter projects" placeholder="Filter projects…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <TabChips
              size="sm"
              scroll
              aria-label="Category"
              value={category}
              onChange={setCategory}
              items={[{ id: "all", label: "All", count: PROJECTS.length }, ...ORBIT_CATEGORIES.map((c) => ({ id: c.id, label: c.id, count: PROJECTS.filter((p) => p.category === c.id).length }))]}
            />
          </div>
          <p className="sr-only" role="status">
            {rows.length === 0 ? "No projects match the filters" : `${rows.length} of ${PROJECTS.length} projects shown`}
          </p>
          <div className="mt-3">
            {rows.length === 0 ? (
              <EmptyState
                variant="placeholder"
                size="sm"
                icon={<FilterX />}
                title={q ? `No projects match “${query.trim()}”` : "No projects in this category"}
                description={`Try another name, or clear the filters to see all ${PROJECTS.length} projects.`}
                headingLevel="h4"
                actions={
                  <Button
                    size="sm"
                    onClick={() => {
                      setQuery("");
                      setCategory("all");
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <ul className="max-h-[248px] divide-y divide-hair-soft overflow-y-auto scroll-thin rounded-[10px] border border-hair-soft">
                {rows.map((p) => (
                  <li key={p.id} className="flex min-w-0 items-center gap-3 px-3 py-2.5">
                    <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full" style={{ background: `var(--${p.color})` }} />
                    <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-ink">{p.displayName}</span>
                    <span className="hidden shrink-0 text-[11.5px] text-ink-faint sm:inline">{p.category}</span>
                    <span className="shrink-0 text-[11.5px] text-ink-faint">{p.lastActive}</span>
                  </li>
                ))}
                {filtered ? (
                  <li className="flex items-center justify-between gap-3 px-3 py-2">
                    <Caption>
                      {rows.length} of {PROJECTS.length}
                    </Caption>
                    <Button
                      size="sm"
                      variant="subtle"
                      onClick={() => {
                        setQuery("");
                        setCategory("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  </li>
                ) : null}
              </ul>
            )}
          </div>
        </div>
      </DemoGroup>

      <DemoGroup title="Dashed card" hint="Actions navigate to the next step; Back returns.">
        <div className="grid gap-3 lg:grid-cols-[1.3fr_1fr]">
          <div className="min-h-[268px]">
            {pane === "empty" ? (
              <EmptyState
                icon={<FolderGit2 />}
                headingLevel="h4"
                title="No projects yet"
                description={`Clone a Git repository into ${CURRENT_SPACE.name} to get started.`}
                actions={
                  <>
                    <Button size="sm" variant="secondary" onClick={() => setPane("manage")}>
                      Manage projects
                    </Button>
                    <Button size="sm" variant="subtle" onClick={() => setPane("start")}>
                      Getting started
                    </Button>
                  </>
                }
              />
            ) : (
              <div className="flex h-full flex-col gap-3 rounded-[12px] border border-hair bg-s2 p-5">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="subtle" leadingIcon={<ArrowLeft />} onClick={() => setPane("empty")}>
                    Back
                  </Button>
                  <span className="text-[13px] font-semibold text-ink">{pane === "manage" ? "Manage projects" : "Getting started"}</span>
                </div>
                {pane === "manage" ? (
                  <form
                    className="flex flex-col gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (gitOk) setCloned(repoName(repo));
                    }}
                  >
                    <p className="text-[12.5px] text-ink-dim">Paste a Git URL. The project lands in the projects folder of {CURRENT_SPACE.name}.</p>
                    <div className="flex flex-wrap gap-2">
                      <Input
                        size="sm"
                        mono
                        aria-label="Repository URL"
                        aria-describedby="es-clone-hint"
                        placeholder="https://github.com/example/galileo.git"
                        value={repo}
                        onChange={(e) => {
                          setRepo(e.target.value);
                          setCloned(null);
                        }}
                        className="min-w-0 flex-1 basis-[200px]"
                      />
                      <Button type="submit" size="sm" variant="secondary" disabled={!gitOk}>
                        Clone
                      </Button>
                    </div>
                    <p id="es-clone-hint" role="status" className={cloned ? "text-[11.5px] text-grn" : "text-[11.5px] text-ink-faint"}>
                      {cloned ? `Cloning ${cloned} into ${CURRENT_SPACE.name}. Mock action: nothing is fetched.` : "Clone stays off until the URL looks like a Git origin."}
                    </p>
                  </form>
                ) : (
                  <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-[12.5px] text-ink-dim marker:font-mono marker:text-ink-faint">
                    <li>Clone a repository into the space.</li>
                    <li>Open it with Claude Code, Codex or OpenClaw.</li>
                    <li>Watch the session on the timeline.</li>
                  </ol>
                )}
              </div>
            )}
          </div>
          <div className="grid gap-3">
            <EmptyState size="sm" align="start" headingLevel="h4" icon={<Pin />} title="Keep your frequent projects here" description="Pin a project from its menu and it stays at the top." />
            <EmptyState size="sm" align="start" headingLevel="h4" icon={<Radio />} title="No projects are live" description="A project goes live while a session runs in it." />
          </div>
        </div>
      </DemoGroup>

      <DemoGroup title="Small and inline">
        <div className="grid gap-3 md:grid-cols-3">
          <EmptyState size="sm" headingLevel="h4" icon={<Network />} title="No session sources selected" description="Pick Claude Code, Codex or OpenClaw above." />
          <EmptyState size="sm" headingLevel="h4" icon={<Wrench />} title="No tool calls recorded" description="This session answered without tools." />
          <EmptyState size="sm" headingLevel="h4" icon={<Users />} title="No sub-agents spawned" description="Sub-agents appear here when a runtime starts one." />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Specimen label="inline line">
            <div className="flex flex-col gap-2.5">
              <EmptyLine icon={<Unplug />}>No tool telemetry.</EmptyLine>
              <EmptyLine icon={<Inbox />}>No recent space events.</EmptyLine>
              <EmptyLine>No secrets added.</EmptyLine>
              <EmptyLine>No jobs yet</EmptyLine>
              <EmptyLine>No ports yet. Add one by its number, such as 5173.</EmptyLine>
              <EmptyLine>This folder is empty.</EmptyLine>
              <EmptyLine className="text-ink-dim">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">quirqs</span> Unavailable · {QUIRQ_UNAVAILABLE_NOTE}
              </EmptyLine>
            </div>
          </Specimen>
          <Specimen label="chart empty">
            <div className="relative h-[168px] overflow-hidden rounded-[10px] border border-hair-soft bg-black/30">
              <svg aria-hidden="true" className="absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 300 160">
                {[32, 64, 96, 128].map((y) => (
                  <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="var(--hair)" strokeDasharray="3 4" />
                ))}
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <EmptyLine icon={<ChartNoAxesColumn />} className="rounded-full border border-hair bg-[#0f0f11] px-3 py-1.5">
                  No usage data for this window.
                </EmptyLine>
              </div>
            </div>
          </Specimen>
        </div>
      </DemoGroup>

      <DemoGroup title="Placeholder well · error tone">
        <div className="grid gap-3 md:grid-cols-2">
          <EmptyState
            variant="placeholder"
            headingLevel="h4"
            icon={<ScrollText />}
            title="Logs unavailable"
            description={`${stopped?.name ?? "This space"} is stopped. Start the space to view logs.`}
            actions={
              <Button size="sm" variant="secondary">
                Start space
              </Button>
            }
          />
          <EmptyState
            variant="placeholder"
            headingLevel="h4"
            tone="error"
            icon={<TriangleAlert />}
            title="Space is down"
            description="The Space API stopped answering 4m ago. Your files stay on disk."
            actions={
              <Button size="sm" variant="danger">
                Restart space
              </Button>
            }
          />
          <EmptyState variant="placeholder" size="sm" headingLevel="h4" icon={<MessageCircleDashed />} title="Create and manage issues" description="Send a message to start a session with the agent." />
          <EmptyState variant="placeholder" size="sm" headingLevel="h4" icon={<ServerOff />} title="No spaces found." description="Create a space, or switch to Org spaces." />
        </div>
      </DemoGroup>

      <DemoGroup title="Two-up onboarding" hint="Share is disabled while sharing is parked.">
        <div className="mb-3 flex justify-end">
          <Switch size="sm" label="Sharing parked" checked={parked} onCheckedChange={setParked} />
        </div>
        <TwoUpEmpty
          items={[
            {
              key: "share",
              icon: <Plus />,
              title: "Share one of your projects",
              description: parked
                ? "Sharing is parked: sign in to XO (or set XO_API_KEY) to share projects."
                : "Pick any project with a git origin and paste the other space's id.",
              action: (
                <Button size="sm" variant="secondary" leadingIcon={<Plus />} disabled={parked}>
                  Share a project
                </Button>
              ),
            },
            {
              key: "receive",
              icon: <Inbox />,
              title: "Receive a project",
              description: "Send the owner your invite. Shared projects arrive here and clone on their own.",
              action: <CopyButton text={`xo invite ${CURRENT_SPACE.id}`} variant="pill" label="Copy invite" aria-label="Copy invite" announce="Invite copied" />,
            },
          ]}
        />
      </DemoGroup>

      <DemoGroup title="Offline">
        <div className="relative overflow-hidden rounded-[14px] border border-hair-soft bg-black/50">
          <div className="dots pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
          <OfflineState
            className="relative"
            headingLevel="h4"
            icon={<Network />}
            eyebrow="xo-space is offline"
            title="xo-space is unreachable"
            description="Start the data source, then refresh the map."
            action={
              <div className="flex flex-col items-center gap-2">
                <Button variant="primary" onClick={retry} loading={retrying} loadingLabel="Retrying…">
                  Retry connection
                </Button>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint" aria-live="polite">
                  attempt {attempts} · still offline
                </span>
              </div>
            }
          />
        </div>
      </DemoGroup>
    </DemoStack>
  );
}
