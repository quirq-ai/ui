"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { Check, CircleHelp, Map as MapIcon, Palette, Route, Settings, TriangleAlert, UserMinus, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RuntimeLogo } from "@/components/ui/runtime-logo";
import { Kbd } from "@/components/ui/kbd";
import { copyText } from "@/components/ui/copy-button";
import { formatBytes, formatCompact, formatFixed } from "@/lib/format";
import { CONNECTORS, FILE_TREE, GALILEO_SOURCES, INVITES, MEMBERS, PEOPLE, PROJECTS, type PersonId } from "@/lib/fixtures";
import { Modal } from "./modal";
import { ModalPanel } from "./modal-panel";
import { Overlay } from "./overlay-core";
import { ConnectProviderBody, type ConnectMethod, type ConnectPhase } from "./connect-provider";
import { MemberRow, SettingsGroup, SettingsPanel } from "./settings-dialog";
import { DesignEditorPanel, type BarPosition, type DesignAccent, type DesignPart } from "./design-editor";
import { AtlasBody, ManualBody, ToursBody, type AtlasLayer, type AtlasRow, type TourStopView, type TourSummary } from "./drift-dialogs";
import { DangerZone, DangerZoneRow } from "./confirm";
import { ConfirmDialog } from "./confirm-dialog";
import { DemoSection, DemoStatus, Example, Stage } from "./demo-kit";
import { useTimers } from "./demo-hooks";
import { Reopenable } from "./demo-reopen";

/* ============================================================================ data */

const GITHUB = CONNECTORS.find((c) => c.toolkit === "github")!;
const DEVICE = { code: "8F2C-91DA", url: "https://github.com/login/device", urlLabel: "Open github.com/login/device" };

const TOKEN_HINT = (
  <>
    Create one in GitHub under Settings, Developer settings. Scopes: <code className="font-mono text-ink-dim">repo</code>,{" "}
    <code className="font-mono text-ink-dim">read:org</code>.
  </>
);
const DEVICE_INTRO = "This starts a device-code sign-in. You get a short code to enter at github.com/login/device, then this dialog finishes on its own.";
const CONNECT_DESC = "Choose how this space authenticates with GitHub.";
const REJECTED: ConnectPhase = {
  kind: "error",
  title: "GitHub rejected the token",
  detail: "Use a personal access token that starts with ghp_ or github_pat_ and has the repo and read:org scopes.",
};
const CONNECTED: ConnectPhase = {
  kind: "success",
  account: GITHUB.account ?? "@ada-moreno",
  detail: `Assigned issues and review requests poll every ${GITHUB.pollEvery}.`,
};


type OrgPerson = { id: string; personId: PersonId; role: "Owner" | "Collaborator"; message?: string };

const OWNER_MEMBERS: OrgPerson[] = MEMBERS.map((m) => ({ id: m.personId, personId: m.personId, role: m.role === "owner" ? "Owner" : "Collaborator" }));
const OWNER_REQUESTS: OrgPerson[] = INVITES.map((inv, i) => {
  const personId = (Object.values(PEOPLE).find((p) => p.email === inv.email)?.id ?? "jonah") as PersonId;
  return {
    id: inv.id,
    personId,
    role: "Collaborator",
    message: i === 0 ? "Contractor on the billing pilot this month." : "Research partner for the verification study.",
  };
});
const MEMBER_VIEW: OrgPerson[] = [
  { id: "kenji", personId: "kenji", role: "Owner" },
  { id: "ada", personId: "ada", role: "Collaborator" },
  { id: "mira", personId: "mira", role: "Collaborator" },
  { id: "lena", personId: "lena", role: "Collaborator" },
];

const SPACE_PROJECTS = PROJECTS.filter((p) => ["xo-space", "xo-swarm", "galileo", "research-notes", "space-drift"].includes(p.id));
const sizeOf = (files: number) => files * 1480;
const ATLAS_BODIES: AtlasRow[] = SPACE_PROJECTS.map((p, i) => ({
  id: p.id,
  name: p.displayName,
  meta: [
    p.github ? "repository" : "folder",
    formatBytes(sizeOf(p.files)),
    `×${formatFixed(1 + p.openSessions * 0.06 + (p.lane === "Live agent" ? 0.02 : 0), 2)}`,
    `L ${formatCompact(p.files * 17)} bytes/day`,
    p.github ? "git history" : "snapshot",
    `${120 + i * 50} units`,
  ],
  actions: [
    { id: "land", label: "Land" },
    { id: "fly", label: "Fly by" },
  ],
}));
const HEAVIEST = [...SPACE_PROJECTS]
  .sort((a, b) => b.files - a.files)
  .slice(0, 3)
  .map((p) => p.displayName);

const pick = (path: string) => {
  const walk = (n: typeof FILE_TREE): typeof FILE_TREE | null =>
    n.path === path ? n : (n.children ?? []).reduce<typeof FILE_TREE | null>((hit, c) => hit ?? walk(c), null);
  return walk(FILE_TREE);
};
const SURFACE_PATHS = ["space_ui/components/", "space_ui/lib/status.ts", "engine/sessions.py", "docs/vocabulary.md", "README.md"];
const ATLAS_FILES = SURFACE_PATHS.map((path, i) => {
  const n = pick(path)!;
  return {
    id: path,
    name: path.replace(/\/$/, ""),
    meta: [n.type, formatBytes(n.size), n.git ?? "unchanged", `${12 + i * 9} units`],
  };
});

const TOURS: TourSummary[] = [
  { id: "map", title: "Start with the map", stops: 4, blurb: "space root to the busiest project" },
  { id: "session", title: "Follow a session", stops: 5, blurb: "what df1a1a5b touched, in order" },
];
const TOUR_STOPS: Record<string, { id: string; label: string; place: string; missing?: boolean }[]> = {
  map: [
    { id: "m1", label: "research-lab", place: "space root" },
    { id: "m2", label: "xo-space", place: "project" },
    { id: "m3", label: "README.md", place: "xo-space" },
    { id: "m4", label: "space_ui/lib/legacy-status.ts", place: "xo-space", missing: true },
  ],
  session: [
    { id: "s1", label: "df1a1a5b", place: "session" },
    { id: "s2", label: "status-pill.tsx", place: "xo-space" },
    { id: "s3", label: "status.ts", place: "xo-space" },
    { id: "s4", label: "session-list.tsx", place: "xo-space" },
    { id: "s5", label: "status.test.ts", place: "xo-space" },
  ],
};

const MANUAL_CONTROLS = [
  { action: "Thrust / reverse", keys: ["W", "S"] },
  { action: "Steer left / right", keys: ["A", "D"] },
  { action: "Rise / descend", keys: ["R", "F"] },
  { action: "Boost", keys: ["shift"] },
  { action: "Brake", keys: ["space"] },
  { action: "Land / lift off", keys: ["L"] },
  { action: "Choose a destination", keys: ["M"] },
  { action: "Guided tours", keys: ["T"] },
  { action: "Fire a probe", keys: ["Q"] },
  { action: "Pause / resume", keys: ["esc"] },
];
const MANUAL_RULES = [
  "In space, projects are planets and grouping folders are constellations. Size gives each body its mass; recent changes add gravity and light that fade over time. Cross a landing ring slowly, then press L to land.",
  "On a surface, folders and files are the ground you fly over. E opens a file nearby. The map reads metadata only, uploads nothing and never writes to your projects folder.",
];

/* ============================================================================ flows */

function ConnectFlow({
  initialMethod = "token",
  initialPhase = { kind: "idle" },
  initialToken = "",
  frozen = false,
  onFinish,
}: {
  initialMethod?: ConnectMethod;
  initialPhase?: ConnectPhase;
  initialToken?: string;
  frozen?: boolean;
  onFinish?: () => void;
}) {
  const idPrefix = useId();
  const schedule = useTimers();
  const [method, setMethod] = useState<ConnectMethod>(initialMethod);
  const [phase, setPhase] = useState<ConnectPhase>(initialPhase);
  const [token, setToken] = useState(initialToken);

  const reset = () => {
    setPhase({ kind: "idle" });
    setToken("");
    onFinish?.();
  };

  return (
    <ConnectProviderBody
      provider="GitHub"
      idPrefix={idPrefix}
      method={method}
      onMethodChange={(m) => {
        setMethod(m);
        setPhase({ kind: "idle" });
      }}
      phase={phase}
      token={token}
      onTokenChange={(v) => {
        setToken(v);
        if (phase.kind === "error") setPhase({ kind: "idle" });
      }}
      tokenPlaceholder="ghp_… or github_pat_…"
      tokenHint={TOKEN_HINT}
      deviceIntro={DEVICE_INTRO}
      onSubmitToken={() => {
        if (frozen) return;
        setPhase({ kind: "busy" });
        schedule(() => {
          const ok = /^(ghp_|github_pat_)\w{8,}/.test(token.trim());
          setPhase(ok ? CONNECTED : REJECTED);
        }, 1300);
      }}
      onStartDevice={() => {
        if (frozen) return;
        setPhase({ kind: "busy" });
        schedule(() => setPhase({ kind: "awaiting", ...DEVICE }), 900);
        schedule(() => setPhase({ kind: "success", account: GITHUB.account ?? "@ada-moreno", detail: "Approved on github.com. This demo approves after a few seconds." }), 5200);
      }}
      onCancel={reset}
      onDone={reset}
    />
  );
}

function SettingsFlow({
  viewer,
  org,
  initialSection = "members",
  initialBusy = null,
  frozen = false,
  titleAs = "h2",
  titleId,
  onClose,
}: {
  viewer: "owner" | "member";
  org: string;
  initialSection?: "members" | "danger";
  initialBusy?: string | null;
  frozen?: boolean;
  titleAs?: "h2" | "h3";
  titleId?: string;
  onClose?: () => void;
}) {
  const schedule = useTimers();
  const [section, setSection] = useState<string>(initialSection);
  const [members, setMembers] = useState<OrgPerson[]>(viewer === "owner" ? OWNER_MEMBERS : MEMBER_VIEW);
  const [requests, setRequests] = useState<OrgPerson[]>(viewer === "owner" ? OWNER_REQUESTS : []);
  const [busy, setBusy] = useState<string | null>(initialBusy);
  const [status, setStatus] = useState("");
  const [confirming, setConfirming] = useState(false);
  const isOwner = viewer === "owner";
  const groupAs = titleAs === "h3" ? "h4" : "h3";

  const run = (key: string, apply: () => void, done: string) => {
    if (frozen || busy) return;
    setBusy(key);
    setStatus("");
    schedule(() => {
      apply();
      setBusy(null);
      setStatus(done);
    }, 1100);
  };

  const busyIcon = (key: string, icon: ReactNode) => (busy === key ? undefined : icon);

  const membersSection = (
    <div className="flex flex-col gap-6">
      {isOwner ? (
        <SettingsGroup
          titleAs={groupAs}
          title={`Join requests${requests.length ? ` (${requests.length})` : ""}`}
          description="Approving starts that person's space in this organization, which takes a moment."
        >
          {requests.length === 0 ? (
            <p className="text-[12.5px] text-ink-faint">No pending requests.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {requests.map((r) => {
                const p = PEOPLE[r.personId];
                return (
                  <MemberRow
                    key={r.id}
                    name={p.name}
                    email={p.email}
                    role="Request pending"
                    message={r.message}
                    actions={
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          leadingIcon={busyIcon(`approve-${r.id}`, <Check />)}
                          loading={busy === `approve-${r.id}`}
                          loadingLabel="Approving…"
                          disabled={busy !== null && busy !== `approve-${r.id}`}
                          onClick={() =>
                            run(
                              `approve-${r.id}`,
                              () => {
                                setRequests((xs) => xs.filter((x) => x.id !== r.id));
                                setMembers((xs) => [...xs, { ...r, message: undefined }]);
                              },
                              `${p.name} joined`,
                            )
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="subtle"
                          leadingIcon={<X />}
                          loading={busy === `deny-${r.id}`}
                          disabled={busy !== null && busy !== `deny-${r.id}`}
                          onClick={() => run(`deny-${r.id}`, () => setRequests((xs) => xs.filter((x) => x.id !== r.id)), "Request denied")}
                        >
                          Deny
                        </Button>
                      </>
                    }
                  />
                );
              })}
            </ul>
          )}
        </SettingsGroup>
      ) : null}
      <SettingsGroup
        titleAs={groupAs}
        title={`Members (${members.length})`}
        description={isOwner ? "Approve who joins, and manage who stays." : "The people you share this organization with."}
      >
        <ul className="flex flex-col gap-2">
          {members.map((m) => {
            const p = PEOPLE[m.personId];
            const key = `remove-${m.id}`;
            return (
              <MemberRow
                key={m.id}
                name={p.name}
                email={p.email}
                role={m.role}
                self={m.personId === "ada"}
                actions={
                  isOwner && m.role !== "Owner" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      leadingIcon={<UserMinus />}
                      loading={busy === key}
                      loadingLabel="Removing…"
                      disabled={busy !== null && busy !== key}
                      onClick={() => run(key, () => setMembers((xs) => xs.filter((x) => x.id !== m.id)), `${p.name} removed`)}
                    >
                      Remove
                    </Button>
                  ) : null
                }
              />
            );
          })}
        </ul>
      </SettingsGroup>
    </div>
  );

  const dangerSection = (
    <DangerZone titleAs={groupAs}>
      {isOwner ? (
        <DangerZoneRow
          title="Delete organization"
          description="Deleting removes the organization and its spaces. Remove everyone else first."
          action={
            <Button variant="danger" size="sm" disabled={busy !== null} onClick={() => setConfirming(true)}>
              Delete organization
            </Button>
          }
        />
      ) : (
        <DangerZoneRow
          title="Leave organization"
          description="Leaving removes your space in this organization. Your local spaces keep working."
          action={
            <Button variant="danger" size="sm" leadingIcon={<UserMinus />} disabled={busy !== null} onClick={() => setConfirming(true)}>
              Leave organization
            </Button>
          }
        />
      )}
    </DangerZone>
  );

  return (
    <>
      <SettingsPanel
        heading={org}
        titleId={titleId}
        titleAs={titleAs}
        onClose={onClose}
        locked={busy !== null}
        active={section}
        onSectionChange={setSection}
        sections={[
          { id: "members", label: "Members", icon: <Users />, count: isOwner ? requests.length : undefined },
          { id: "danger", label: "Danger zone", icon: <TriangleAlert />, danger: true },
        ]}
      >
        {section === "members" ? membersSection : dangerSection}
        <DemoStatus className="mt-4">{status}</DemoStatus>
      </SettingsPanel>
      <ConfirmDialog
        open={confirming}
        onCancel={() => setConfirming(false)}
        title={isOwner ? "Delete organization" : "Leave organization"}
        description={
          isOwner
            ? `Delete ${org}? Its spaces stop and cannot be restored. This cannot be undone.`
            : `Leave ${org}? Your space in this organization is removed.`
        }
        confirmLabel={isOwner ? "Delete organization" : "Leave organization"}
        state={isOwner && members.length > 1 ? "blocked" : "idle"}
        blockedReason={`Remove the other ${members.length - 1} members first.`}
        onConfirm={() => {
          setConfirming(false);
          setStatus("Demo only: nothing was deleted.");
        }}
      />
    </>
  );
}

function DesignFlow({ titleAs, titleId, onClose }: { titleAs?: "h2" | "h3"; titleId?: string; onClose?: () => void }) {
  const idPrefix = useId();
  const schedule = useTimers();
  const [accent, setAccent] = useState<DesignAccent>("lime");
  const [position, setPosition] = useState<BarPosition>("top");
  const [parts, setParts] = useState<DesignPart[]>([
    { id: "sources", label: "Sources", on: true },
    { id: "status", label: "Source status", on: true },
    { id: "search", label: "Search", on: false },
  ]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("Saved. acme has its own design.");
  const [own, setOwn] = useState(true);

  const saveSoon = () => {
    setSaving(true);
    setOwn(true);
    setStatus("Saving…");
    schedule(() => {
      setSaving(false);
      setStatus("Saved. acme has its own design.");
    }, 650);
  };

  return (
    <DesignEditorPanel
      app="acme"
      file=".gateway/toolbars/acme.json"
      describe={own ? "acme has its own design." : "acme uses the default design. A change here gives acme its own."}
      idPrefix={idPrefix}
      titleAs={titleAs}
      titleId={titleId}
      accent={accent}
      onAccentChange={(a) => {
        setAccent(a);
        saveSoon();
      }}
      position={position}
      onPositionChange={(p) => {
        setPosition(p);
        saveSoon();
      }}
      parts={parts}
      onPartToggle={(id) => {
        setParts((xs) => xs.map((x) => (x.id === id ? { ...x, on: !x.on } : x)));
        saveSoon();
      }}
      sources={GALILEO_SOURCES.filter((s) => s.type === "port" && s.name !== "acme")
        .slice(0, 3)
        .map((s) => ({ name: s.name, up: s.up }))}
      status={status}
      saving={saving}
      resetLabel="Use the default design"
      canReset={own}
      onReset={() => {
        setAccent("lime");
        setPosition("top");
        setParts((xs) => xs.map((x) => ({ ...x, on: x.id !== "search" })));
        setOwn(false);
        setStatus("acme uses the default design again.");
      }}
      onDone={onClose}
      onClose={onClose}
    />
  );
}

function AtlasFlow({
  initialLayer = "space",
  initialSurveying = null,
  initialQueued = [],
  frozen = false,
}: {
  initialLayer?: AtlasLayer;
  initialSurveying?: string | null;
  initialQueued?: string[];
  frozen?: boolean;
}) {
  const idPrefix = useId();
  const schedule = useTimers();
  const [layer, setLayer] = useState<AtlasLayer>(initialLayer);
  const [query, setQuery] = useState("");
  const [surveying, setSurveying] = useState<string | null>(initialSurveying);
  const [queued, setQueued] = useState<string[]>(initialQueued);
  const [note, setNote] = useState("");

  const rows: AtlasRow[] =
    layer === "space"
      ? ATLAS_BODIES
      : ATLAS_FILES.map((f) => ({
          ...f,
          actions: [
            { id: "open", label: "Open" },
            { id: "queue", label: queued.includes(f.id) ? "Queued" : "Queue", done: queued.includes(f.id) },
          ],
        }));

  return (
    <>
      <AtlasBody
        idPrefix={idPrefix}
        layer={layer}
        onLayerChange={(l) => {
          setLayer(l);
          setQuery("");
        }}
        intro={layer === "space" ? "Choose a project to land on or fly by. Search for a file across the space." : "You are on xo-space. Open a file nearby, or queue several to open in turn."}
        ranking={layer === "space" ? { label: "Heaviest", items: HEAVIEST } : { label: "Busiest", items: ["space_ui", "engine", "docs"] }}
        rows={rows}
        query={query}
        onQueryChange={setQuery}
        surveying={surveying}
        queued={queued.length}
        onAction={(rowId, action) => {
          if (frozen) return;
          const name = rows.find((r) => r.id === rowId)?.name ?? rowId;
          if (action === "land") {
            setSurveying(name);
            setNote("");
            schedule(() => {
              setSurveying(null);
              setLayer("surface");
              setNote(`Landed on ${name}.`);
            }, 1400);
          } else if (action === "fly") setNote(`Route planned past ${name}. Routes are simulated.`);
          else if (action === "queue") setQueued((q) => [...q, rowId]);
          else setNote(`Opened ${name} in the viewer.`);
        }}
        footnote="Routes are simulated. Your files stay exactly where they are."
      />
      <DemoStatus className="mt-3">{note}</DemoStatus>
    </>
  );
}

function ToursFlow({
  initialTour = "map",
  initialStop = 2,
  initialExport = false,
  frozen = false,
}: {
  initialTour?: string | null;
  initialStop?: number;
  initialExport?: boolean;
  frozen?: boolean;
}) {
  const idPrefix = useId();
  const [tour, setTour] = useState<string | null>(initialTour);
  const [stop, setStop] = useState(initialStop);
  const [running, setRunning] = useState(false);
  const [exportJson, setExportJson] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const raw = tour ? TOUR_STOPS[tour] : [];
  const json = JSON.stringify({ tour, stops: raw.map((s) => `${s.place}/${s.label}`) }, null, 2);
  const shownJson = initialExport && exportJson === null ? json : exportJson;

  const stops: TourStopView[] = raw.map((s, i) => ({
    id: s.id,
    label: s.label,
    place: s.place,
    state: s.missing ? "missing" : i === stop ? "current" : i < stop ? "visited" : "upcoming",
  }));
  const go = (dir: 1 | -1) => {
    let i = stop + dir;
    while (raw[i]?.missing) i += dir;
    if (i >= 0 && i < raw.length) setStop(i);
    else setMessage(dir === 1 ? "The next stop is missing from this space, so the tour ends here." : "");
  };

  const status = tour
    ? stop >= 0
      ? `Stop ${stop + 1} of ${raw.length} · ${raw[stop].label} in ${raw[stop].place}${running ? " · flying" : ""}`
      : `${TOURS.find((t) => t.id === tour)?.title}: ready to start`
    : "Choose a tour, or make a route from the atlas.";

  return (
    <>
      <ToursBody
        idPrefix={idPrefix}
        tours={TOURS}
        activeTour={tour}
        onTourSelect={(id) => {
          setTour(id);
          setStop(-1);
          setRunning(false);
          setMessage("");
          setExportJson(null);
        }}
        stops={stops}
        status={status}
        running={running}
        onPrevious={() => go(-1)}
        onNext={() => (stop < 0 ? setStop(0) : go(1))}
        onResume={() => {
          if (stop < 0) setStop(0);
          setRunning(true);
          setMessage("Steering or L pauses the tour.");
        }}
        onExit={() => {
          setTour(null);
          setStop(-1);
          setRunning(false);
          setMessage("Tour exited.");
        }}
        onExport={async () => {
          if (frozen) return;
          const ok = await copyText(json);
          if (ok) {
            setExportJson(null);
            setMessage("Route JSON copied.");
          } else setExportJson(json);
        }}
        exportJson={shownJson}
        footnote="Steering or L pauses a tour. T resumes it after landing or lift-off. Tours never write to your folder."
      />
      <DemoStatus className="mt-3">{message}</DemoStatus>
    </>
  );
}

/* ============================================================================ demo */

type LiveId = "connect" | "settings" | "design" | "atlas" | "tours" | "manual";

const LIVE: { id: LiveId; label: string; icon: ReactNode }[] = [
  { id: "connect", label: "Connect GitHub", icon: <RuntimeLogo id="github" size={14} decorative /> },
  { id: "settings", label: "Organization settings", icon: <Settings /> },
  { id: "design", label: "Design editor", icon: <Palette /> },
  { id: "atlas", label: "Atlas", icon: <MapIcon /> },
  { id: "tours", label: "Tours", icon: <Route /> },
];

const LIVE_NAMES: Record<LiveId, string> = {
  connect: "Connect GitHub",
  settings: "Organization settings",
  design: "Design editor",
  atlas: "Atlas",
  tours: "Tours",
  manual: "Flight manual",
};

const githubTile = <RuntimeLogo id="github" size={18} tile decorative />;

export function ModalDemo() {
  const [open, setOpen] = useState<LiveId | null>(null);
  const [last, setLast] = useState("");
  const settingsId = useId();
  const designId = useId();

  const close = () => {
    if (open) setLast(`Closed ${LIVE_NAMES[open]}. Focus is back on the button that opened it.`);
    setOpen(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (open || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target as HTMLElement;
    if (t.closest("input, textarea, select, [contenteditable='true']")) return;
    if (e.key === "h" || e.key === "H") {
      e.preventDefault();
      setOpen("manual");
    }
  };

  return (
    <div className="flex flex-col gap-10" onKeyDown={onKeyDown}>
      <DemoSection title="Live · Esc closes, focus returns">
        <div className="flex flex-col gap-3 rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
          <div className="flex flex-wrap gap-2">
            {LIVE.map((l) => (
              <Button key={l.id} size="sm" leadingIcon={l.icon} onClick={() => setOpen(l.id)}>
                {l.label}
              </Button>
            ))}
            <Button size="sm" leadingIcon={<CircleHelp />} onClick={() => setOpen("manual")} aria-keyshortcuts="H">
              Flight manual
              <Kbd size="xs" subtle>
                H
              </Kbd>
            </Button>
          </div>
          <DemoStatus>{last || "Open any dialog. Press H while a button here has focus to open the flight manual."}</DemoStatus>
        </div>
      </DemoSection>

      <DemoSection title="Connect provider">
        <div className="grid gap-5 lg:grid-cols-2">
          <Example caption="Variant · connect provider, token" note="Try a token that starts with ghp_">
            <Stage minHeight={400}>
              <Reopenable label="Connect GitHub">
                {(close) => (
                  <ModalPanel titleAs="h3" title="Connect GitHub" description={CONNECT_DESC} icon={githubTile} onClose={close}>
                    <ConnectFlow onFinish={close} />
                  </ModalPanel>
                )}
              </Reopenable>
            </Stage>
          </Example>
          <Example caption="Variant · connect provider, device code">
            <Stage minHeight={400}>
              <Reopenable label="Connect GitHub">
                {(close) => (
                  <ModalPanel titleAs="h3" title="Connect GitHub" description={CONNECT_DESC} icon={githubTile} onClose={close}>
                    <ConnectFlow initialMethod="device" initialPhase={{ kind: "awaiting", ...DEVICE }} frozen onFinish={close} />
                  </ModalPanel>
                )}
              </Reopenable>
            </Stage>
          </Example>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <Example caption="State · busy" note="Close hidden while it connects">
            <Stage minHeight={380} innerClassName="sm:p-3!">
              <ModalPanel titleAs="h3" title="Connect GitHub" description={CONNECT_DESC} icon={githubTile} hideClose>
                <ConnectFlow initialPhase={{ kind: "busy" }} initialToken="ghp_demo00000000" frozen />
              </ModalPanel>
            </Stage>
          </Example>
          <Example caption="State · error">
            <Stage minHeight={380} innerClassName="sm:p-3!">
              <Reopenable label="Connect GitHub">
                {(close) => (
                  <ModalPanel titleAs="h3" title="Connect GitHub" description={CONNECT_DESC} icon={githubTile} onClose={close}>
                    <ConnectFlow initialToken="token-from-notes" initialPhase={REJECTED} onFinish={close} />
                  </ModalPanel>
                )}
              </Reopenable>
            </Stage>
          </Example>
          <Example caption="State · success">
            <Stage minHeight={380} innerClassName="sm:p-3!">
              <Reopenable label="Connect GitHub">
                {(close) => (
                  <ModalPanel titleAs="h3" title="Connect GitHub" icon={githubTile} onClose={close}>
                    <ConnectFlow initialPhase={CONNECTED} onFinish={close} />
                  </ModalPanel>
                )}
              </Reopenable>
            </Stage>
          </Example>
        </div>
      </DemoSection>

      <DemoSection title="Settings with side nav">
        <div className="flex flex-col gap-5">
          <Example caption="Variant · owner · state · busy per action" note="Approving Jonah locks the dialog until it finishes">
            <Stage minHeight={600}>
              <Reopenable label="Settings">
                {(close) => (
                  <SettingsFlow viewer="owner" org="Acme Robotics" titleAs="h3" initialBusy={`approve-${INVITES[0].id}`} frozen onClose={close} />
                )}
              </Reopenable>
            </Stage>
          </Example>
          <div className="grid gap-5 lg:grid-cols-2">
            <Example caption="Variant · member · narrow, nav as top tabs">
              <Stage minHeight={600}>
                <Reopenable label="Settings">
                  {(close) => <SettingsFlow viewer="member" org="Northwind Studio" titleAs="h3" onClose={close} />}
                </Reopenable>
              </Stage>
            </Example>
            <Example caption="Variant · manual" note="Opened by H or the help button">
              <Stage minHeight={600} backdrop="space">
                <Reopenable label="Flight manual">
                  {(close) => (
                    <ModalPanel titleAs="h3" tone="deep" display kicker="Field notes / 001" title="A pilot's guide." onClose={close}>
                      <ManualBody
                        headingAs="h4"
                        controls={MANUAL_CONTROLS.slice(0, 6)}
                        ruleTitle="One space. Two kinds of flight."
                        rules={MANUAL_RULES.slice(0, 1)}
                        onReady={close}
                      />
                    </ModalPanel>
                  )}
                </Reopenable>
              </Stage>
            </Example>
          </div>
        </div>
      </DemoSection>

      <DemoSection title="Design editor">
        <Example caption="Variant · design editor" note="Changes save as you make them">
          <Stage minHeight={560}>
            <Reopenable label="Design editor">{(close) => <DesignFlow titleAs="h3" onClose={close} />}</Reopenable>
          </Stage>
        </Example>
      </DemoSection>

      <DemoSection title="Atlas and tours">
        <div className="grid gap-5 lg:grid-cols-2">
          <Example caption="Variant · atlas, space layer" note="Mock sizes">
            <Stage backdrop="space" minHeight={640}>
              <Reopenable label="Atlas">
                {(close) => (
                  <ModalPanel titleAs="h3" tone="deep" display kicker="Space atlas" title="Explore the system." onClose={close}>
                    <AtlasFlow />
                  </ModalPanel>
                )}
              </Reopenable>
            </Stage>
          </Example>
          <Example caption="State · surveying · files queued" note="Actions wait for the survey">
            <Stage backdrop="space" minHeight={640}>
              <Reopenable label="Atlas">
                {(close) => (
                  <ModalPanel titleAs="h3" tone="deep" display kicker="Space atlas" title="Explore the system." onClose={close}>
                    <AtlasFlow initialLayer="surface" initialSurveying="xo-space" initialQueued={["space_ui/lib/status.ts", "README.md"]} frozen />
                  </ModalPanel>
                )}
              </Reopenable>
            </Stage>
          </Example>
          <Example caption="Variant · tours · current and missing stops">
            <Stage backdrop="space" minHeight={640}>
              <Reopenable label="Tours">
                {(close) => (
                  <ModalPanel titleAs="h3" tone="deep" display kicker="Routes through your work" title="Guided tours." onClose={close}>
                    <ToursFlow />
                  </ModalPanel>
                )}
              </Reopenable>
            </Stage>
          </Example>
          <Example caption="State · tours · JSON export fallback">
            <Stage backdrop="space" minHeight={640}>
              <Reopenable label="Tours">
                {(close) => (
                  <ModalPanel titleAs="h3" tone="deep" display kicker="Routes through your work" title="Guided tours." onClose={close}>
                    <ToursFlow initialTour="session" initialStop={1} initialExport frozen />
                  </ModalPanel>
                )}
              </Reopenable>
            </Stage>
          </Example>
        </div>
      </DemoSection>

      {/* live layers */}
      <Modal
        open={open === "connect"}
        onClose={close}
        title="Connect GitHub"
        description="Choose how this space authenticates with GitHub."
        icon={githubTile}
      >
        <ConnectFlow onFinish={close} />
      </Modal>
      <Overlay open={open === "settings"} onClose={close} aria-labelledby={settingsId} className="w-[min(820px,100%)]">
        <SettingsFlow viewer="owner" org="Acme Robotics" titleId={settingsId} onClose={close} />
      </Overlay>
      <Overlay open={open === "design"} onClose={close} aria-labelledby={designId} className="w-[min(1040px,100%)]">
        <DesignFlow titleId={designId} onClose={close} />
      </Overlay>
      <Modal open={open === "atlas"} onClose={close} tone="deep" display kicker="Space atlas" title="Explore the system." size="md">
        <AtlasFlow />
      </Modal>
      <Modal open={open === "tours"} onClose={close} tone="deep" display kicker="Routes through your work" title="Guided tours." size="md">
        <ToursFlow initialTour={null} initialStop={-1} />
      </Modal>
      <Modal open={open === "manual"} onClose={close} tone="deep" display kicker="Field notes / 001" title="A pilot's guide." size="md">
        <ManualBody
          controls={MANUAL_CONTROLS}
          sample={{
            label: "Play the sample mission",
            text: "Fly a training course in a fictional space. Objectives advance as you play.",
            onPlay: () => {
              setOpen(null);
              setLast("Sample mission started (demo).");
            },
          }}
          ruleTitle="One space. Two kinds of flight."
          rules={MANUAL_RULES}
          onReady={close}
        />
      </Modal>
    </div>
  );
}
