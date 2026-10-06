// Demo: Hours-back calculator (Machine Speed). The full quirq skin starts below target (blue,
// 9.6 hours from the illustrative defaults); the compact Machine Speed skin starts at the
// target (green). Drag the sliders, or focus one and use the arrow keys; the result is
// announced politely. The answer is hours, not quirqs.
import { HOURS_BACK_DEFAULTS } from "@/lib/fixtures";
import { DemoCell } from "./chart-kit";
import { HoursBackCalculator } from "./calculator";

export function CalculatorDemo() {
  return (
    <div className="flex flex-col gap-10">
      <DemoCell caption={`Full · below target, blue · ${HOURS_BACK_DEFAULTS.hoursPerWeek} hrs × ${Math.round(HOURS_BACK_DEFAULTS.automationShare * 100)}% = ${HOURS_BACK_DEFAULTS.resultHours} hours`}>
        <HoursBackCalculator variant="full" provenance={HOURS_BACK_DEFAULTS.provenance} />
      </DemoCell>
      <DemoCell caption="Compact · Machine Speed skin · target hit, green">
        <HoursBackCalculator variant="compact" defaults={{ hours: 18 }} methodHref="#calculator" provenance={HOURS_BACK_DEFAULTS.provenance} />
      </DemoCell>
    </div>
  );
}
