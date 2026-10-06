"use client";

// Demo for the timeline swimlanes shape: the full timeline (by file and by project, play,
// scrub, trace, zoom and drag) and labelled snapshots of each state.
import { useEffect, useRef, useState } from "react";
import { Panel } from "@/components/ui";
import { PlaybackScrubber, TimelineSwimlanes, windowTicks, type SwimWindow } from "./swimlanes";
import { FILE_LANES, PROJECT_LANES, SWIM_MILESTONES, SWIM_RANGE } from "./swimlanes-data";
import { DemoCell, DemoGroup, dayMonthYear, monthYear, numberWord } from "./shared";

const MONTH_MS = 30.44 * 86_400_000;
const MONTHS = Math.round((SWIM_RANGE.end - SWIM_RANGE.start) / MONTH_MS);
const TITLE = `${numberWord(MONTHS)} months, ${numberWord(FILE_LANES.length).toLowerCase()} departments.`;
const NOUNS = { file: "department", project: "project" };

const YEAR_2026: SwimWindow = { start: Date.UTC(2026, 0, 1), end: SWIM_RANGE.end };
const TRACE_LANES = FILE_LANES.filter((l) => l.id === "Engineering" || l.id === "Ops");

/** The scrubber alone, shown in its playing state. The snapshot holds still until someone uses
    it (no motion on load); after Pause, Play really advances to the end and stops. */
function PlayingScrubber() {
  const [playing, setPlaying] = useState(true);
  const [armed, setArmed] = useState(false);
  const [value, setValueState] = useState(640);
  const valueRef = useRef(640);
  const setValue = (v: number) => {
    valueRef.current = v;
    setValueState(v);
  };

  useEffect(() => {
    if (!playing || !armed) return;
    let raf = 0;
    const step = () => {
      const next = Math.min(1000, valueRef.current + 1000 / 480);
      valueRef.current = next;
      setValueState(next);
      if (next >= 1000) {
        setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, armed]);

  const t = SWIM_RANGE.start + (value / 1000) * (SWIM_RANGE.end - SWIM_RANGE.start);
  return (
    <PlaybackScrubber
      playing={playing}
      onTogglePlay={() => {
        setArmed(true);
        if (!playing && value >= 1000) setValue(0);
        setPlaying((p) => !p);
      }}
      value={value}
      onScrub={(v) => {
        setPlaying(false);
        setValue(v);
      }}
      readout={monthYear(t)}
      valueText={dayMonthYear(t)}
      ticks={windowTicks(SWIM_RANGE)}
    >
      <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">{playing ? "Playing" : "Paused"}</span>
    </PlaybackScrubber>
  );
}

export function SwimlanesDemo() {
  return (
    <div className="flex min-w-0 flex-col gap-12">
      <DemoGroup title="Timeline" note="By file and by project · Play, scrub, trace, zoom and drag · Mock data">
        <Panel variant="soft" padding="md">
          <TimelineSwimlanes
            title={TITLE}
            description="Scrub through the space as it grew. Select a dot or use Trace to follow one project; a department name traces the whole lane."
            fileLanes={FILE_LANES}
            projectLanes={PROJECT_LANES}
            range={SWIM_RANGE}
            milestones={SWIM_MILESTONES}
            laneNoun={NOUNS}
          />
        </Panel>
      </DemoGroup>

      <DemoGroup title="States" note="Playing, trace, zoomed, and the two empty plots">
        <div className="grid gap-x-6 gap-y-8 lg:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-8">
            <DemoCell caption="Playing · label reads Pause · snapshot until used">
              <Panel variant="soft" padding="md">
                <PlayingScrubber />
              </Panel>
            </DemoCell>

            <DemoCell caption="Trace · xo-space · everything else dims">
              <Panel variant="soft" padding="md">
                <TimelineSwimlanes
                  fileLanes={TRACE_LANES}
                  range={SWIM_RANGE}
                  laneNoun={NOUNS}
                  defaultTrace="xo-space"
                  filterable={false}
                  hideHint
                  laneHeight={52}
                />
              </Panel>
            </DemoCell>

            <DemoCell caption="No matching projects · filtered">
              <Panel variant="soft" padding="md">
                <TimelineSwimlanes
                  fileLanes={FILE_LANES}
                  projectLanes={PROJECT_LANES}
                  range={SWIM_RANGE}
                  laneNoun={NOUNS}
                  defaultMode="project"
                  defaultFilter="atlas"
                  hideHint
                  laneHeight={44}
                />
              </Panel>
            </DemoCell>
          </div>

          <div className="flex min-w-0 flex-col gap-8">
            <DemoCell caption="Zoomed to 2026 · paused at a scrubbed date · by project">
              <Panel variant="soft" padding="md">
                <TimelineSwimlanes
                  fileLanes={FILE_LANES}
                  projectLanes={PROJECT_LANES}
                  range={SWIM_RANGE}
                  milestones={SWIM_MILESTONES}
                  laneNoun={NOUNS}
                  defaultMode="project"
                  defaultWindow={YEAR_2026}
                  defaultNow={Date.UTC(2026, 5, 18)}
                  filterable={false}
                  hideHint
                  laneHeight={46}
                />
              </Panel>
            </DemoCell>

            <DemoCell caption="No projects mapped">
              <Panel variant="soft" padding="md">
                <TimelineSwimlanes fileLanes={[]} range={SWIM_RANGE} laneNoun={NOUNS} filterable={false} hideHint laneHeight={44} />
              </Panel>
            </DemoCell>
          </div>
        </div>
      </DemoGroup>
    </div>
  );
}
