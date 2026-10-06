import { Caption, DemoSection } from "./kit";
import { DaylightPlate, DaylightScene, type DaylightSceneId } from "./daylight";

/* The three writings variants; captions come from DAYLIGHT_CAPTION. */
const PLATES: DaylightSceneId[] = ["trailhead", "morning", "hammock"];

const NOTES = [
  { num: "01", title: "The orientation tax", desc: "What a coding agent's first day on the job costs, and why the space is the lever.", date: "Jul 26, 2026", read: "5 min", scene: "trailhead" as const },
  { num: "04", title: "Read the manual", desc: "We found an agent that reads the docs first, and the reading paid its way.", date: "Jul 3, 2026", read: "4 min", scene: "hammock" as const },
];

export function DaylightPlateDemo() {
  return (
    <div className="space-y-10">
      <DemoSection title="Plates" note="Daylight photograph · 4% grain · no overlay · mono caption">
        <div className="grid gap-5 md:grid-cols-3">
          {PLATES.map((scene) => (
            <div key={scene} className="space-y-2.5">
              <Caption>{scene}</Caption>
              <DaylightPlate scene={scene} />
            </div>
          ))}
        </div>
      </DemoSection>

      <DemoSection title="In a writing card" note="The plate leads, the card carries the words · static, no link">
        <div className="grid gap-5 md:grid-cols-2">
          {NOTES.map((n) => (
            <article key={n.num} className="flex flex-col overflow-hidden rounded-[14px] border border-hair-soft bg-[#0f0f11]">
              <DaylightScene scene={n.scene} uid={`dl-card-${n.num}`} aspect="16 / 9.6" alt={null} />
              <div className="flex flex-1 flex-col gap-2.5 p-5">
                <div className="flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.15em] text-ink-faint">
                  <span className="text-ink-dim">Thoughts</span>
                  <span>{n.num}</span>
                </div>
                <h4 className="text-[18px] font-semibold leading-[1.3] tracking-[-0.015em]">{n.title}</h4>
                <p className="flex-1 text-[13.5px] leading-[1.55] text-ink-dim">{n.desc}</p>
                <div className="flex items-center justify-between pt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
                  <span>{n.date}</span>
                  <span>{n.read} read</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </DemoSection>
    </div>
  );
}
