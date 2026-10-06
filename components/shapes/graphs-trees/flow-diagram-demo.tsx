"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { BlueprintCanvas, FlowDiagram, PipelineStrip, RouteMap, RuntimeTree } from "./flow-diagram";
import {
  BLUEPRINT_DESCRIPTION,
  BLUEPRINT_EDGES,
  BLUEPRINT_NODES,
  DRAFT_DESCRIPTION,
  DRAFT_EDGES,
  DRAFT_NODES,
  PRODUCT_MAP,
  PRODUCT_MAP_DESCRIPTION,
  ROUTE_GROUPS,
  ROUTING,
  ROUTING_DESCRIPTION,
  RUNTIME_CAPABILITIES_CHIPS,
  WATCHER_PIPELINE,
  WORK_MAP,
  WORK_MAP_DESCRIPTION,
} from "./flow-diagram-data";
import { DemoCell } from "./parts";

const ROLE_LEGEND = [
  { style: "solid" as const, label: "Role" },
  { style: "dashed" as const, label: "Intended, not validated" },
];

export function FlowDiagramDemo() {
  const [running, setRunning] = useState(true);
  const [deployed, setDeployed] = useState(true);
  const [watcherOn, setWatcherOn] = useState(true);

  return (
    <div className="space-y-10">
      <DemoCell caption="Variant · blueprint canvas" note="Illustrative Machine Speed workflow · hover or focus a node">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Switch size="sm" label="Running" checked={running} onCheckedChange={setRunning} />
          <Switch size="sm" label="Deployed" checked={deployed} onCheckedChange={setDeployed} />
        </div>
        <BlueprintCanvas
          name="order-recovery"
          running={running}
          deployed={deployed}
          nodes={BLUEPRINT_NODES}
          edges={BLUEPRINT_EDGES}
          description={BLUEPRINT_DESCRIPTION}
          caption={
            <>
              One blueprint of many: model-agnostic, routed by <b className="font-semibold text-blu">XO</b> to whatever does the job best today
            </>
          }
        />
      </DemoCell>

      <DemoCell caption="State · draft · paused" note="Not deployed and not running: no flow on the edges">
        <BlueprintCanvas
          name="invoice-reminders"
          running={false}
          deployed={false}
          nodes={DRAFT_NODES}
          edges={DRAFT_EDGES}
          width={668}
          height={190}
          description={DRAFT_DESCRIPTION}
          caption="Illustrative draft · deploy it to start listening"
        />
      </DemoCell>

      <DemoCell caption="Variant · product map" note="Arrows are roles, not ownership or feature parity">
        <FlowDiagram
          {...PRODUCT_MAP}
          legend={ROLE_LEGEND}
          ariaLabel="XO product map"
          description={PRODUCT_MAP_DESCRIPTION}
          caption="Study, test and improve also feeds back into hosted spaces"
        />
      </DemoCell>

      <DemoCell caption="Variant · work map" note="Conceptual, not containment">
        <FlowDiagram
          {...WORK_MAP}
          legend={[
            { style: "solid", label: "Relationship" },
            { style: "dashed", label: "Can relate, not always" },
          ]}
          ariaLabel="Work map: spaces, projects, agents, sessions and jobs"
          description={WORK_MAP_DESCRIPTION}
          caption="A job run need not create a session"
        />
      </DemoCell>

      <DemoCell caption="Variant · request routing" note="galileo · one port, one origin per source">
        <FlowDiagram
          {...ROUTING}
          legend={[
            { style: "solid", label: "Request" },
            { style: "dotted", label: "The bridge, postMessage only" },
          ]}
          ariaLabel="How galileo routes a request"
          description={ROUTING_DESCRIPTION}
          caption="galileo starts nothing and writes nothing but its own list"
        />
      </DemoCell>

      <DemoCell caption="Variant · pipeline strip" note="Space dashboard · Technical details">
        <Switch size="sm" label="Watcher" description="Reads every native session store once a second" checked={watcherOn} onCheckedChange={setWatcherOn} />
        <PipelineStrip steps={WATCHER_PIPELINE(!watcherOn)} ariaLabel="Where session data flows" />
      </DemoCell>

      <DemoCell caption="State · watcher paused" note="The process step reads Paused">
        <PipelineStrip steps={WATCHER_PIPELINE(true)} ariaLabel="Where session data flows while the watcher is paused" />
      </DemoCell>

      <div className="grid gap-x-6 gap-y-10 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <DemoCell caption="Variant · runtime tree" note="Filled tile and empty slots">
          <RuntimeTree
            title="Universal runtime"
            body="Use any model, harness or framework within your space."
            capabilities={RUNTIME_CAPABILITIES_CHIPS}
            tiles={[["claude_code", "codex", "openclaw", "cursor"], null, null]}
          />
        </DemoCell>
        <DemoCell caption="Variant · route map" note="galileo reference">
          <RouteMap title="Where a request goes" groups={ROUTE_GROUPS} />
        </DemoCell>
      </div>
    </div>
  );
}
