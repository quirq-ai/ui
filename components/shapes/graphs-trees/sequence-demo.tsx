"use client";

import { DecisionTree, SequenceDiagram } from "./sequence-diagram";
import {
  CSP_DESCRIPTION,
  CSP_EDGES,
  CSP_NODES,
  CSP_TRACES,
  DOWN_MESSAGES,
  FILES_DESCRIPTION,
  FILES_EDGES,
  FILES_NODES,
  FILES_TRACES,
  HISTORY_MESSAGES,
  HISTORY_PARTICIPANTS,
  OPEN_MESSAGES,
  OPEN_PARTICIPANTS,
  SORT_DESCRIPTION,
  SORT_EDGES,
  SORT_NODES,
  SORT_TRACES,
} from "./sequence-data";
import { DemoCell } from "./parts";

export function SequenceDiagramDemo() {
  return (
    <div className="space-y-10">
      <DemoCell caption="Variant · sequence · opening a source" note="Hover a step or an arrow · arrow keys step through">
        <SequenceDiagram participants={OPEN_PARTICIPANTS} messages={OPEN_MESSAGES} ariaLabel="Opening a source through galileo" />
      </DemoCell>

      <DemoCell caption="Variant · sequence · router history · state: step highlighted" note="Step 03 is pinned; click it again to clear">
        <SequenceDiagram
          participants={HISTORY_PARTICIPANTS}
          messages={HISTORY_MESSAGES}
          ariaLabel="How telescope keeps the tab's history"
          defaultActive={2}
          colWidth={250}
        />
      </DemoCell>

      <DemoCell caption="State · static · the app is down" note="No hover or stepping; for docs and print">
        <SequenceDiagram participants={OPEN_PARTICIPANTS.slice(1)} messages={DOWN_MESSAGES} ariaLabel="A port source whose app does not answer" static colWidth={230} />
      </DemoCell>

      <DemoCell caption="Variant · decision tree · request sorting" note="Pick a request to trace, then step with the arrow keys">
        <DecisionTree
          nodes={SORT_NODES}
          edges={SORT_EDGES}
          root="req"
          traces={SORT_TRACES}
          defaultTrace="down"
          ariaLabel="How galileo sorts a request by Host, then path"
          description={SORT_DESCRIPTION}
        />
      </DemoCell>

      <DemoCell caption="Variant · decision tree · files source" note="Read only: anything but GET or HEAD is refused">
        <DecisionTree
          nodes={FILES_NODES}
          edges={FILES_EDGES}
          root="req"
          traces={FILES_TRACES}
          ariaLabel="How a files source answers a request"
          description={FILES_DESCRIPTION}
          nodeWidth={120}
          gapX={20}
        />
      </DemoCell>

      <DemoCell caption="Variant · decision tree · CSP loosening" note="Loosened just enough for one same-origin script">
        <DecisionTree
          nodes={CSP_NODES}
          edges={CSP_EDGES}
          root="policy"
          traces={CSP_TRACES}
          defaultTrace="inline"
          ariaLabel="How galileo loosens a page's script policy for the bridge"
          description={CSP_DESCRIPTION}
          gapX={24}
        />
      </DemoCell>
    </div>
  );
}
