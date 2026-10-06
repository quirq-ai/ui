// Demo: usage dashboard and heatmap. Populated (range control, refresh, summary strip, KPI
// row, token trend, top models, daily cost and the 16-week heatmap), a static refreshing
// snapshot, and an empty window for a space that is still starting.
import { NOW_ISO, SPACE_BY_ID, USAGE_BY_MODEL, USAGE_DAILY, type Space } from "@/lib/fixtures";
import { StateChip } from "@/components/ui/status";
import { DemoCell } from "./chart-kit";
import { UsageDashboard } from "./usage-dashboard";

const SPACE_STATE = { Creating: "creating", Starting: "starting", Running: "running", Stopping: "stopping", Stopped: "stopped" } as const satisfies Record<
  Space["status"],
  string
>;

export function UsageDashboardDemo() {
  const lab = SPACE_BY_ID["ws_2b81d0e4"];
  const pilot = SPACE_BY_ID["ws_e5d7b302"];
  const today = NOW_ISO.slice(0, 10);
  const models = USAGE_BY_MODEL.map((m) => ({ id: m.model, label: m.label, share: m.share, color: `var(--${m.color})` }));
  const heat = USAGE_DAILY.map((d) => ({ date: d.date, value: d.tokens }));

  return (
    <div className="flex flex-col gap-10">
      <DemoCell caption="Populated · range and refresh are live · hover charts and heatmap days">
        <UsageDashboard
          spaceName={lab.name}
          spaceStatus={<StateChip kind="space" state={SPACE_STATE[lab.status]} prefix="Local space" />}
          days={USAGE_DAILY}
          models={models}
          heatmap={{ values: heat, today }}
          provenance="mock"
        />
      </DemoCell>
      <DemoCell caption="Refreshing · values hold their frame while the window reloads">
        <UsageDashboard spaceName={lab.name} days={USAGE_DAILY} models={models} heatmap={{ values: heat, today }} provenance="mock" refreshing compact />
      </DemoCell>
      <DemoCell caption={`Empty window · ${pilot.name} has not reported telemetry · Unavailable, never 0`}>
        <UsageDashboard
          spaceName={pilot.name}
          spaceStatus={<StateChip kind="space" state={SPACE_STATE[pilot.status]} prefix="Hosted space" />}
          days={[]}
          models={models}
          heatmap={{ values: [], today }}
          provenance="mock"
          emptyNote="No telemetry source has reported for this space yet."
        />
      </DemoCell>
    </div>
  );
}
