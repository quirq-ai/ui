// Demo: Avatars and group. Single (sizes, presence, runtime), group (max 3 on cards, max 5 in
// the project pane, empty "Not shared"), agent blob and the loading skeleton pill. Hover a
// stack to read every name.
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StateChip } from "@/components/ui/status";
import { MEMBERS, INVITES, PEOPLE, PEOPLE_LIST, PROJECT_BY_ID, RUNTIMES, type PersonId } from "@/lib/fixtures";
import type { LogoId } from "@/components/ui/runtime-logo";
import { Caption, Cell } from "./demo-kit";
import { AgentBlob, PeopleStack, PersonRow } from "./avatars";

const names = (ids: PersonId[]) => ids.map((id) => PEOPLE[id].name);
const xoSpace = PROJECT_BY_ID["xo-space"];
const galileo = PROJECT_BY_ID["galileo"];
const everyone = PEOPLE_LIST.map((p) => p.name);

const RUNTIME_LOGO: Record<string, LogoId> = { claude_code: "claude_code", codex: "codex", openclaw: "openclaw", cursor: "cursor", hermes: "hermes", gemini_cli: "gemini" };

export function AvatarsDemo() {
  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-2">
        <Cell label="Variant · single (xs to xl)">
          <div className="flex flex-wrap items-end gap-4 rounded-[14px] border border-hair bg-s1 p-4">
            {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <Avatar name="Ada Moreno" size={s} />
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">{s}</span>
              </div>
            ))}
          </div>
        </Cell>
        <Cell label="Single · presence and runtime">
          <div className="flex flex-wrap items-center gap-4 rounded-[14px] border border-hair bg-s1 p-4">
            <Avatar name="Kenji Sato" size="lg" status="up" />
            <Avatar name="Lena Fischer" size="lg" status="warn" />
            <Avatar name="Tomás Ruiz" size="lg" status="idle" />
            <Avatar name="Mira Okafor" size="lg" status="busy" />
            <span aria-hidden="true" className="h-8 w-px bg-hair" />
            <Avatar name="Claude Code" runtime="claude_code" size="lg" status="busy" />
            <Avatar name="Codex" runtime="codex" size="lg" />
            <Avatar name="OpenClaw" runtime="openclaw" size="lg" status="up" />
          </div>
        </Cell>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Cell label="Variant · group, max 3 (cards; hover for every name)">
          <div className="rounded-[14px] border border-hair bg-s2 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono text-[13px] text-ink">{xoSpace.displayName}</p>
                <p className="mt-0.5 text-[12px] text-ink-faint">{xoSpace.category} · {xoSpace.lastActive}</p>
              </div>
              <PeopleStack names={names([xoSpace.owner, ...xoSpace.peers, "mira"])} max={3} />
            </div>
          </div>
        </Cell>
        <Cell label="Group, max 5 (project pane)">
          <div className="rounded-[14px] border border-hair bg-s2 p-4">
            <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Shared with</p>
            <PeopleStack names={everyone} max={5} size="md" />
          </div>
        </Cell>
        <Cell label="Group · empty">
          <div className="rounded-[14px] border border-hair bg-s2 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate font-mono text-[13px] text-ink">{galileo.displayName}</p>
              <PeopleStack names={[]} />
            </div>
          </div>
        </Cell>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Cell label="Variant · agent blob">
          <div className="flex flex-wrap items-center gap-5 rounded-[14px] border border-hair bg-s1 p-4">
            {RUNTIMES.filter((r) => r.installed).map((r) => (
              <div key={r.id} className="flex flex-col items-center gap-2">
                <AgentBlob name={`${r.label} agent`} runtime={RUNTIME_LOGO[r.id]} tone={r.color} size={48} status={r.inUse ? "busy" : undefined} />
                <span className="text-[11.5px] text-ink-dim">{r.label}</span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-2">
              <AgentBlob name="Release Bot" size={48} />
              <span className="text-[11.5px] text-ink-dim">Release Bot</span>
            </div>
          </div>
        </Cell>
        <Cell label="State · loading">
          <div className="space-y-3 rounded-[14px] border border-hair bg-s1 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12.5px] text-ink-dim">Card stack</span>
              <PeopleStack names={[]} loading />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12.5px] text-ink-dim">Pane stack</span>
              <PeopleStack names={[]} loading max={5} size="md" />
            </div>
          </div>
        </Cell>
      </div>

      <div className="space-y-3">
        <Caption>Single in context · members and pending requests</Caption>
        <ul className="divide-y divide-hair-soft rounded-[14px] border border-hair bg-s1">
          {MEMBERS.slice(0, 3).map((m) => (
            <li key={m.personId} className="px-4 py-3">
              <PersonRow
                name={m.name}
                detail={`${m.email} · active ${m.lastActive}`}
                trailing={
                  <Badge mono size="xs" tone={m.role === "owner" ? "blu" : "neutral"}>
                    {m.role}
                  </Badge>
                }
              />
            </li>
          ))}
          {INVITES.map((inv) => (
            <li key={inv.id} className="px-4 py-3">
              <PersonRow name={inv.email} detail={`Invited by ${PEOPLE[inv.invitedBy].name} · ${inv.sent}`} trailing={<StateChip kind="membership" state="request_pending" />} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
