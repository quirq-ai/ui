"use client";

// Live demo for the activity feed shape: the space activity view with filters, refresh and
// cursor pagination, the open sessions disclosure in every state, feed states, the XO Swarm
// project sections, the visualizer drawer event lists and the signals panel.
import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, CircleCheck, Clock, FileText } from "lucide-react";
import { NOW_ISO } from "@/lib/fixtures";
import { formatDateTime } from "@/lib/format";
import { Badge, Panel, SearchInput, Segmented, Select } from "@/components/ui";
import { ActivityFeed } from "./activity-feed";
import { LiveSessionsDisclosure } from "./live-sessions";
import { IconEventList, SignalsPanel } from "./event-list";
import {
  EventTimelineRows,
  OpenSessionRows,
  PartialErrorBanner,
  ProjectSectionCard,
  ProjectSectionsHeader,
  SectionEmpty,
  SectionErrorPanel,
  SectionLoadingPanel,
  StatTiles,
  StepGroups,
  stepSummary,
} from "./project-sections";
import {
  DRAWER_EVENTS,
  DRAWER_OPEN,
  FEED_EVENTS,
  LIVE_SESSIONS,
  PROJECT_NAME,
  SECTIONS_PROJECT,
  SECTION_EVENTS,
  SECTION_SESSIONS,
  SECTION_STATS,
  SECTION_STEPS,
  SIGNALS_BILLING,
  SIGNALS_EMPTY,
  SIGNALS_SPACE,
} from "./activity-data";
import { Caption, DemoCell, DemoGroup } from "./shared";

const PAGE = 8;
const UPDATED = `Updated ${formatDateTime(NOW_ISO)}`;

/** Timers that are cleared on unmount, so a fast click-away never sets state late. */
function useTimers() {
  const ids = useRef<number[]>([]);
  useEffect(() => {
    const list = ids.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);
  return (fn: () => void, ms: number) => {
    ids.current.push(window.setTimeout(fn, ms));
  };
}

/* ----------------------------------------------------------------------------- space activity */

function SpaceActivity() {
  const later = useTimers();
  const [loaded, setLoaded] = useState(PAGE);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [project, setProject] = useState("");
  const [query, setQuery] = useState("");

  const loadedEvents = useMemo(() => FEED_EVENTS.slice(0, loaded), [loaded]);
  const shown = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return loadedEvents.filter(
      (e) =>
        (!project || e.subjectId === project) &&
        words.every((w) => [e.label, e.detail, e.subjectLabel, e.runtime, e.sessionId, e.actor].join(" ").toLowerCase().includes(w)),
    );
  }, [loadedEvents, project, query]);

  const options = useMemo(() => {
    const ids = new Set(FEED_EVENTS.map((e) => e.subjectId).filter((x): x is string => Boolean(x)));
    return [...ids].map((id) => ({ id, label: PROJECT_NAME[id] ?? id })).sort((a, b) => a.label.localeCompare(b.label, "en-US"));
  }, []);

  const live = LIVE_SESSIONS.filter((s) => !project || s.projectId === project);

  function refresh() {
    setRefreshing(true);
    later(() => setRefreshing(false), 1200);
  }
  function loadOlder() {
    setLoadingOlder(true);
    later(() => {
      setLoaded((n) => Math.min(FEED_EVENTS.length, n + PAGE));
      setLoadingOlder(false);
    }, 700);
  }

  return (
    <ActivityFeed
      title="Activity"
      titleAs="h4"
      events={shown}
      loadedCount={loadedEvents.length}
      status={refreshing ? "refreshing" : "ready"}
      onRefresh={refresh}
      onSelectSubject={(id) => setProject(id)}
      hasMore={loaded < FEED_EVENTS.length}
      loadingOlder={loadingOlder}
      onLoadOlder={loadOlder}
      updatedLabel={UPDATED}
      emptyMessage={query || project ? "No loaded events match this selection." : undefined}
      retention="Recent space events · search covers loaded events"
      controls={
        <>
          <label htmlFor="ta-feed-project" className="text-[12px] text-ink-dim">
            Project
          </label>
          <Select id="ta-feed-project" size="sm" value={project} onChange={(e) => setProject(e.target.value)} className="w-[180px]! max-w-full">
            <option value="">All projects</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </Select>
          <SearchInput
            size="sm"
            shape="field"
            placeholder="Search activity…"
            aria-label="Search loaded activity"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-[220px]! max-w-full"
          />
        </>
      }
      live={<LiveSessionsDisclosure sessions={live} checking={refreshing} showProject={!project} />}
    />
  );
}

/** The first read failed: "Activity unavailable". Refresh retries and, here, recovers. */
function UnavailableFeed() {
  const later = useTimers();
  const [status, setStatus] = useState<"unavailable" | "loading" | "ready">("unavailable");
  function retry() {
    setStatus("loading");
    later(() => setStatus("ready"), 900);
  }
  return (
    <ActivityFeed
      title="Activity"
      titleAs="h4"
      events={status === "ready" ? FEW : []}
      status={status}
      warning={status === "unavailable" ? "Could not load activity. Try Refresh." : undefined}
      onRefresh={retry}
    />
  );
}

/* ----------------------------------------------------------------------------- swarm project sections */

type SectionsState = "loaded" | "loading" | "partial" | "error" | "empty";

const SECTION_STATES: { value: SectionsState; label: string }[] = [
  { value: "loaded", label: "Loaded" },
  { value: "loading", label: "Loading" },
  { value: "partial", label: "Partial errors" },
  { value: "error", label: "Error" },
  { value: "empty", label: "Empty" },
];

const PARTIAL_ERRORS = [
  "stats.json: the watcher has not written rolling totals yet.",
  "activity.json: the read timed out after 12s.",
];

function ProjectSections() {
  const later = useTimers();
  const [state, setState] = useState<SectionsState>("loaded");
  const [busy, setBusy] = useState(false);
  const shown: SectionsState = busy ? "loading" : state;
  const empty = shown === "empty";
  const partial = shown === "partial";

  function refresh() {
    setBusy(true);
    later(() => setBusy(false), 900);
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Caption>State</Caption>
        <div className="scroll-thin max-w-full overflow-x-auto pb-1">
          <Segmented aria-label="Project sections state" size="sm" options={SECTION_STATES} value={state} onChange={setState} className="w-max max-w-none!" />
        </div>
      </div>
      <ProjectSectionsHeader title={SECTIONS_PROJECT.title} titleAs="h4" path={SECTIONS_PROJECT.path} busy={shown === "loading"} onRefresh={refresh} />
      {shown === "loading" ? (
        <SectionLoadingPanel />
      ) : shown === "error" ? (
        <SectionErrorPanel message="This XO project does not exist in the space's projects root." onRetry={refresh} />
      ) : (
        <>
          {partial ? <PartialErrorBanner errors={PARTIAL_ERRORS} /> : null}
          <ProjectSectionCard icon={Activity} title="Activity" titleAs="h5">
            {partial ? (
              <SectionEmpty primary="Open sessions unavailable" secondary="activity.json could not be read. Try Refresh to check again." />
            ) : empty || SECTION_SESSIONS.length === 0 ? (
              <SectionEmpty
                primary="No active sessions"
                secondary={empty ? "Nothing has run in this project yet." : `Last activity ${SECTIONS_PROJECT.lastActive}`}
              />
            ) : (
              <OpenSessionRows sessions={SECTION_SESSIONS} />
            )}
          </ProjectSectionCard>
          <ProjectSectionCard
            icon={Clock}
            title="Stats"
            titleAs="h5"
            subtitle={empty || partial ? undefined : <Badge mono size="xs">Mock</Badge>}
          >
            {empty || partial ? (
              <SectionEmpty primary="No stats yet" secondary="The watcher has not populated rolling totals for this project." />
            ) : (
              <StatTiles stats={SECTION_STATS} />
            )}
          </ProjectSectionCard>
          <div className="grid gap-4 lg:grid-cols-2">
            <ProjectSectionCard icon={CircleCheck} title="Steps" titleAs="h5" subtitle={empty ? undefined : stepSummary(SECTION_STEPS)}>
              {empty ? (
                <SectionEmpty primary="No steps tracked" secondary="Each agent session's steps appear here once it writes them." />
              ) : (
                <StepGroups groups={SECTION_STEPS} />
              )}
            </ProjectSectionCard>
            <ProjectSectionCard icon={FileText} title="Timeline" titleAs="h5" subtitle={empty ? undefined : `${SECTION_EVENTS.length} events`}>
              {empty ? (
                <SectionEmpty
                  primary="No events recorded"
                  secondary="Sessions, step changes, file edits and sync events land here once the watcher runs."
                />
              ) : (
                <EventTimelineRows events={SECTION_EVENTS} max={6} />
              )}
            </ProjectSectionCard>
          </div>
        </>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------------- demo */

const FEW = FEED_EVENTS.slice(0, 3);
const TONED = FEED_EVENTS.filter((e) => (e.tone ?? "default") !== "default").slice(0, 3);

export function ActivityFeedDemo() {
  return (
    <div className="flex min-w-0 flex-col gap-12">
      <DemoGroup title="Space activity" note={"Variant \u201cworkspace\u201d · cursor pagination · Mock data"}>
        <SpaceActivity />
      </DemoGroup>

      <DemoGroup title="Open sessions" note="Live sessions disclosure, every summary state">
        <div className="grid gap-x-5 gap-y-6 md:grid-cols-2">
          <DemoCell caption="Open · 4 open sessions">
            <LiveSessionsDisclosure sessions={LIVE_SESSIONS} defaultOpen className="mb-0" />
          </DemoCell>
          <div className="flex min-w-0 flex-col gap-6">
            <DemoCell caption="Checking">
              <LiveSessionsDisclosure sessions={null} checking className="mb-0" />
            </DemoCell>
            <DemoCell caption="Refreshing">
              <LiveSessionsDisclosure sessions={LIVE_SESSIONS.slice(0, 2)} checking className="mb-0" />
            </DemoCell>
            <DemoCell caption="Unavailable · no accent marker">
              <LiveSessionsDisclosure sessions={null} defaultOpen className="mb-0" />
            </DemoCell>
            <DemoCell caption="Empty selection">
              <LiveSessionsDisclosure sessions={[]} defaultOpen className="mb-0" />
            </DemoCell>
          </div>
        </div>
      </DemoGroup>

      <DemoGroup title="Feed states" note="Refreshing, error tones, empty, loading, unavailable and the narrow layout">
        <div className="grid gap-x-6 gap-y-8 lg:grid-cols-2">
          <DemoCell caption="Refreshing">
            <ActivityFeed title="Activity" events={FEW} loadedCount={FEED_EVENTS.length} status="refreshing" titleAs="h4" />
          </DemoCell>
          <DemoCell caption="Error and warn tones · conflicts, failures, blocked">
            <ActivityFeed title="Activity" events={TONED} titleAs="h4" />
          </DemoCell>
          <DemoCell caption="Empty · space activity">
            <ActivityFeed title="Activity" events={[]} titleAs="h4" retention="Recent space events · search covers loaded events" />
          </DemoCell>
          <DemoCell caption="Empty · sharing activity">
            <ActivityFeed
              title="Sharing activity"
              events={[]}
              titleAs="h4"
              retention="Latest 50 events · cleared when the server restarts"
              emptyMessage="No sharing events have been recorded since this server started."
            />
          </DemoCell>
          <div className="flex min-w-0 flex-col gap-8">
            <DemoCell caption="Loading">
              <ActivityFeed title="Activity" events={[]} status="loading" titleAs="h4" />
            </DemoCell>
            <DemoCell caption="Unavailable · Refresh retries the read">
              <UnavailableFeed />
            </DemoCell>
          </div>
          <DemoCell caption="Narrow · time moves under the body">
            <div className="max-w-[360px]">
              <ActivityFeed title="Activity" events={FEW} titleAs="h4" />
            </div>
          </DemoCell>
        </div>
      </DemoGroup>

      <DemoGroup title="Project sections" note="XO Swarm project dashboard · switch the state or press refresh">
        <ProjectSections />
      </DemoGroup>

      <DemoGroup title="Event list and signals" note="Projects visualizer drawer and dashboard · Mock data">
        <div className="flex flex-col gap-6">
          <DemoCell caption="Signals · this space · good, warn, neutral">
            <SignalsPanel signals={SIGNALS_SPACE} />
          </DemoCell>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <DemoCell caption="Event list · open sessions and recent events">
              <Panel variant="soft" padding="md" className="flex flex-col gap-6">
                <IconEventList label="Open sessions" count={DRAWER_OPEN.length} items={DRAWER_OPEN} />
                <IconEventList label="Recent events" count={DRAWER_EVENTS.length} items={DRAWER_EVENTS} />
              </Panel>
            </DemoCell>
            <div className="flex min-w-0 flex-col gap-6">
              <DemoCell caption="Signals · billing-api · warn only">
                <SignalsPanel signals={SIGNALS_BILLING} />
              </DemoCell>
              <DemoCell caption="Signals · demo-kit · fallback row">
                <SignalsPanel signals={SIGNALS_EMPTY} />
              </DemoCell>
              <DemoCell caption="Event list · empty">
                <Panel variant="soft" padding="md">
                  <IconEventList label="Recent events" count={0} items={[]} />
                </Panel>
              </DemoCell>
            </div>
          </div>
        </div>
      </DemoGroup>

      <p className="m-0 text-[12px] text-ink-faint">
        Mock data for the shapes catalog. Relative times are computed against Fri 2 Oct, 09:30 UTC.
      </p>
    </div>
  );
}
