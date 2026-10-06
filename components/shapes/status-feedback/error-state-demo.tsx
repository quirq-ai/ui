"use client";

import { useEffect, useRef, useState } from "react";
import { Ban, Bug, FileWarning, FolderGit2, Globe, Map as MapIcon, RotateCw, ServerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status";
import { formatBytes } from "@/lib/format";
import { FILE_SAMPLES, GALILEO_SOURCES, PROJECTS, SPACES } from "@/lib/fixtures";
import { Caption, DemoGroup, DemoStack, Specimen } from "./parts";
import { ErrorPanel, type ErrorPanelState } from "./error-state";
import { ViewBoundary } from "./error-boundary";
import { MarkerTag } from "./badges";

const LOAD_DETAIL = "GET /api/xo-projects → 500 Internal Server Error\nrequest_id req_7f3a9c21\nat 09:29:58 UTC · space research-lab";

/* The failure the demo feeds the boundary. A view that throws while rendering lands in the same
   fallback; simulating keeps the dev console quiet. */
const SIMULATED = new TypeError("Cannot read properties of undefined (reading 'tabs')");

/* A tiny "Browser" view. */
function BrowserView() {
  return (
    <ul className="divide-y divide-hair-soft">
      {GALILEO_SOURCES.slice(0, 4).map((s) => (
        <li key={s.name} className="flex min-w-0 items-center gap-2.5 px-3 py-2 text-[12px]">
          <StatusDot status={s.up ? "up" : "down"} size="xs" />
          <span className="min-w-0 flex-1 truncate font-mono text-ink">{s.url}</span>
          <span className="shrink-0 text-ink-faint">{s.checkedAgo}</span>
        </li>
      ))}
    </ul>
  );
}

/** One recovery action: busy while it works, then a reset so the demo can run again. */
function RecoverButton({
  state,
  onChange,
  label,
  busy,
  ms,
  variant = "secondary",
}: {
  state: ErrorPanelState;
  onChange: (s: ErrorPanelState) => void;
  label: string;
  busy: string;
  ms: number;
  variant?: "primary" | "secondary";
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  if (state === "recovered") {
    return (
      <Button size="sm" variant="subtle" onClick={() => onChange("error")}>
        Reset demo
      </Button>
    );
  }
  return (
    <Button
      size="sm"
      variant={variant}
      loading={state === "retrying"}
      loadingLabel={busy}
      onClick={() => {
        onChange("retrying");
        timer.current = setTimeout(() => onChange("recovered"), ms);
      }}
    >
      {label}
    </Button>
  );
}

export function ErrorStateDemo() {
  const [load, setLoad] = useState<ErrorPanelState>("error");
  const [crash, setCrash] = useState(false);
  const [mapState, setMapState] = useState<ErrorPanelState>("error");
  const [preview, setPreview] = useState<ErrorPanelState>("error");
  const [spaceDown, setSpaceDown] = useState<ErrorPanelState>("error");
  const [channels, setChannels] = useState<ErrorPanelState>("error");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

  const stopped = SPACES.find((s) => s.status === "Stopped");
  const csv = FILE_SAMPLES.csv;

  return (
    <DemoStack>
      <DemoGroup title="Load error · retrying · recovered" hint="Try again retries; the panel says when it worked.">
        <div className="grid gap-3">
          <ErrorPanel
            icon={<FolderGit2 />}
            headingLevel="h4"
            title="Couldn't load projects"
            cause="The Space API answered 500 while listing the projects folder."
            detail={LOAD_DETAIL}
            detailOpen
            reassurance="Your projects are unchanged on disk."
            state={load}
            recovered={{ title: "Projects loaded", body: `${PROJECTS.length} projects, read on the second try.` }}
            actions={
              load === "recovered" ? (
                <Button size="sm" variant="subtle" onClick={() => setLoad("error")}>
                  Reset demo
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  leadingIcon={<RotateCw />}
                  loading={load === "retrying"}
                  loadingLabel="Trying again…"
                  onClick={() => {
                    setLoad("retrying");
                    later(() => setLoad("recovered"), 1200);
                  }}
                >
                  Try again
                </Button>
              )
            }
          >
            {load === "recovered" ? (
              <ul className="divide-y divide-hair-soft rounded-[10px] border border-hair-soft">
                {PROJECTS.slice(0, 3).map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-3 py-2 text-[12px]">
                    <span className="truncate font-mono text-ink">{p.displayName}</span>
                    <span className="shrink-0 text-ink-faint">{p.lastActive}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </ErrorPanel>
          <div className="grid gap-3 md:grid-cols-3">
            <Specimen label="error">
              <ErrorPanel layout="inline" headingLevel="h4" title="Couldn't load projects" cause="The Space API answered 500." />
            </Specimen>
            <Specimen label="retrying">
              <ErrorPanel
                layout="inline"
                headingLevel="h4"
                state="retrying"
                title="Couldn't load projects"
                cause="Trying again…"
                actions={
                  <Button size="sm" variant="secondary" loading loadingLabel="Trying again…">
                    Try again
                  </Button>
                }
              />
            </Specimen>
            <Specimen label="recovered">
              <ErrorPanel layout="inline" headingLevel="h4" state="recovered" title="Couldn't load projects" recovered={{ title: "Projects loaded", body: "Read on the second try." }} />
            </Specimen>
          </div>
        </div>
      </DemoGroup>

      <DemoGroup title="View crash boundary" hint="One view fails; the rest of the dashboard keeps working.">
        <div className="overflow-hidden rounded-[14px] border border-hair-soft bg-[#0f0f11]">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-b border-hair-soft px-3 py-2">
            <span className="inline-flex items-center gap-2 text-[12.5px] text-ink">
              <Globe aria-hidden="true" className="size-4 text-ink-dim" /> Browser
            </span>
            <Button size="sm" variant="danger" leadingIcon={<Bug />} onClick={() => setCrash(true)} aria-disabled={crash || undefined} id="es-crash-trigger">
              {crash ? "Crashed" : "Simulate a crash"}
            </Button>
          </div>
          <ViewBoundary
              name="Browser"
              headingLevel="h4"
              simulateError={crash ? SIMULATED : null}
              onReset={() => {
                setCrash(false);
                // the restart button leaves with the fallback; hand focus back to the toolbar
                requestAnimationFrame(() => document.getElementById("es-crash-trigger")?.focus());
              }}
            >
              <BrowserView />
            </ViewBoundary>
        </div>
      </DemoGroup>

      <DemoGroup title="Map, preview, space and feature failures">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid place-items-center rounded-[14px] border border-hair-soft bg-[#0b1020] p-4">
            <ErrorPanel
              tone="coral"
              headingLevel="h4"
              icon={<MapIcon />}
              title={mapState === "recovered" ? "Map loaded" : "The map couldn't load."}
              cause="space.json stopped at line 214. The file may still be writing."
              reassurance="Nothing on disk was changed."
              state={mapState}
              recovered={{ title: "Map loaded", body: "31 bodies charted." }}
              actions={
                mapState === "recovered" ? (
                  <Button size="sm" variant="subtle" onClick={() => setMapState("error")}>
                    Reset demo
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={mapState === "retrying"}
                    loadingLabel="Loading…"
                    onClick={() => {
                      setMapState("retrying");
                      later(() => setMapState("recovered"), 1000);
                    }}
                  >
                    Try again
                  </Button>
                )
              }
            />
          </div>
          <div className="flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-hair-soft bg-[#0f0f11]">
            <div className="flex min-w-0 items-center justify-between gap-3 border-b border-hair-soft px-3 py-2 text-[12px]">
              <span className="min-w-0 truncate font-mono text-ink">{csv.path}</span>
              <span className="shrink-0 text-ink-faint">{formatBytes(csv.size)}</span>
            </div>
            <ErrorPanel
              layout="page"
              headingLevel="h4"
              icon={<FileWarning />}
              title="Preview unavailable"
              cause="The viewer stopped while reading this file."
              reassurance="Your original file is unchanged."
              detail="CsvViewer: row 31 has 9 fields, expected 8"
              state={preview}
              recovered={{ title: "Preview ready", body: "The file finished writing; every row has 8 fields now." }}
              actions={
                preview === "recovered" ? (
                  <Button size="sm" variant="subtle" onClick={() => setPreview("error")}>
                    Reset demo
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={preview === "retrying"}
                    loadingLabel="Reading…"
                    onClick={() => {
                      setPreview("retrying");
                      later(() => setPreview("recovered"), 900);
                    }}
                  >
                    Try again
                  </Button>
                )
              }
            />
          </div>
          <ErrorPanel
            icon={<ServerOff />}
            headingLevel="h4"
            title="Space is down"
            cause={`${stopped?.name ?? "This space"} is stopped, so its logs and files cannot be read.`}
            reassurance="Files stay on disk while the space is stopped."
            state={spaceDown}
            recovered={{ title: `${stopped?.name ?? "The space"} is running`, body: "Logs and files are readable again." }}
            actions={<RecoverButton state={spaceDown} onChange={setSpaceDown} label="Start space" busy="Starting…" ms={1400} variant="primary" />}
          />
          <ErrorPanel
            icon={<Ban />}
            headingLevel="h4"
            title="Channels not supported"
            cause="Codex sessions cannot post to channels yet. Switch this space to Claude Code or OpenClaw to use channels."
            reassurance="Your sessions keep running without channels."
            state={channels}
            recovered={{ title: "Channels on", body: "This space now runs Claude Code, which can post to channels." }}
            actions={
              <>
                <RecoverButton state={channels} onChange={setChannels} label="Switch to Claude Code" busy="Switching…" ms={1000} />
                {channels === "recovered" ? null : <MarkerTag kind="not-supported" />}
              </>
            }
          />
        </div>
        <Caption className="mt-3">Every panel: what failed · why · data is intact · one way forward</Caption>
      </DemoGroup>
    </DemoStack>
  );
}
