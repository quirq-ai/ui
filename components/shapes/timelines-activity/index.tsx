// Timelines and activity: feeds, steppers and swimlanes over time.
// Reusable components live beside their demos:
//   activity-feed.tsx    ActivityFeed, ActivityEventList, ActivityEventRow, ActivityFeedEmpty
//   live-sessions.tsx    LiveSessionsDisclosure
//   project-sections.tsx ProjectSectionsHeader, ProjectSectionCard, OpenSessionRows, StatTiles,
//                        StepGroups, EventTimelineRows, SectionEmpty, SectionLoadingPanel,
//                        PartialErrorBanner, SectionErrorPanel, MonoChip
//   event-list.tsx       IconEventList, SignalsPanel
//   pipeline-stepper.tsx PipelineStepper, RailDot, OperatingStateStepper, StageFlow, LoopChips, CycleStepper
//   swimlanes.tsx        TimelineSwimlanes, PlaybackScrubber (client)
import type { Shape } from "@/lib/types";
import { ActivityFeedDemo } from "./activity-feed-demo";
import { PipelineStepperDemo } from "./pipeline-stepper-demo";
import { SwimlanesDemo } from "./swimlanes-demo";

export const shapes: Shape[] = [
  {
    id: "activity-feed",
    name: "Activity feed",
    purpose: "Newest-first events, live sessions and signals.",
    seenIn: [
      "space-ui:activity-event-feed",
      "space-ui:live-sessions-disclosure",
      "swarm:project-dashboard-sections",
      "client:activity-timeline",
      "viz:activity-event-list",
      "viz:signals-panel",
    ],
    variants: ["workspace", "open sessions", "project sections", "signals", "event list", "narrow: time under body", "sharing activity"],
    states: ["empty", "refreshing", "loading", "checking", "unavailable", "partial errors", "error", "error tone", "fallback signal"],
    Demo: ActivityFeedDemo,
  },
  {
    id: "pipeline-stepper",
    name: "Pipeline and stage stepper",
    purpose: "Steps from start to done.",
    seenIn: ["landing:deploy-pipeline-stepper", "viz:operating-state-stepper", "viz:improvement-loop"],
    variants: ["deploy pipeline", "operating state", "improvement loop", "short loop", "quirq loop"],
    states: ["done", "active", "pending", "failed", "skipped", "reached", "not reached"],
    Demo: PipelineStepperDemo,
  },
  {
    id: "swimlanes",
    name: "Timeline swimlanes and scrubber",
    purpose: "Scrub project growth across months.",
    seenIn: ["landing:timeline-swimlanes", "space-ui:timeline-swimlanes", "space-ui:playback-scrubber"],
    variants: ["by file", "by project"],
    states: ["playing", "trace", "zoomed", "scrubbed position", "no matching projects", "no projects mapped"],
    Demo: SwimlanesDemo,
  },
];
