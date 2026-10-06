"use client";

import { KnowledgeGraph, satelliteTally } from "./knowledge-graph";
import { CATEGORY_GRAPH, FILE_GRAPH, FILE_GRAPH_CLOSED, HARNESS_GRAPH, PROJECT_SATELLITES, XO_SPACE_SATELLITES } from "./knowledge-graph-data";
import { DemoCell } from "./parts";

export function KnowledgeGraphDemo() {
  return (
    <div className="space-y-9">
      <DemoCell
        caption="Variant · project categories · interactive"
        note="Mock data. Click a project to see its steps orbit it; billing-api has a blocked one."
      >
        <KnowledgeGraph
          {...CATEGORY_GRAPH}
          satellites={PROJECT_SATELLITES}
          leafLabels="always"
          ariaLabel="Projects grouped by category around all projects"
          hint={
            <>
              <b className="font-medium text-ink-dim">Click</b> a node to focus its neighborhood · <b className="font-medium text-ink-dim">Drag</b> to pan ·{" "}
              <b className="font-medium text-ink-dim">Pinch or ⌘ scroll</b> to zoom · Arrow keys move between nodes
            </>
          }
        />
      </DemoCell>

      <div className="grid gap-x-6 gap-y-9 xl:grid-cols-2">
        <DemoCell caption="Variant · sessions by harness" note="Counts are all time; leaves are the 24 recent sessions">
          <KnowledgeGraph
            {...HARNESS_GRAPH}
            className="h-[360px]"
            ariaLabel="Recent sessions grouped by agent runtime"
          />
        </DemoCell>
        <DemoCell caption="Variant · file graph" note="Double-click a cluster to open or close it">
          <KnowledgeGraph
            {...FILE_GRAPH}
            defaultClosed={FILE_GRAPH_CLOSED}
            className="h-[360px]"
            ariaLabel="xo-space files grouped by folder"
          />
        </DemoCell>
        <DemoCell
          caption="State · focused"
          note={`xo-space · ${satelliteTally(XO_SPACE_SATELLITES.items)}`}
        >
          <KnowledgeGraph
            {...CATEGORY_GRAPH}
            satellites={[XO_SPACE_SATELLITES]}
            defaultFocusId="p:xo-space"
            leafLabels="always"
            compact
            className="h-[360px]"
            ariaLabel="Projects graph focused on xo-space"
          />
        </DemoCell>
        <DemoCell caption="State · settling" note="Frozen mid-settle; the status fades once the layout rests">
          <KnowledgeGraph
            {...HARNESS_GRAPH}
            settleProgress={0.1}
            compact
            className="h-[360px]"
            ariaLabel="Sessions graph while its layout settles"
          />
        </DemoCell>
      </div>
    </div>
  );
}
