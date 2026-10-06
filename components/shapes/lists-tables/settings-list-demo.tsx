"use client";

// Live demo for the settings-list shape: models (OAuth subscriptions and API keys, tap to
// expand a key row), channels, data sources (provider connect rows in every state), the
// setup checklist with and without Channels, and loading skeleton rows.
import { useEffect, useRef, useState } from "react";
import { Bell, Cpu, Database, KeyRound, MessageSquare } from "lucide-react";
import { CONNECTORS, CURRENT_USER, SECRETS, SPACE_BY_ID, type Connector } from "@/lib/fixtures";
import { RuntimeLogo, type LogoId } from "@/components/ui/runtime-logo";
import { StateChip } from "@/components/ui/status";
import { ConnectAccessory, GroupedList, GroupedRow, KeyRow, ProviderRow, RowTile, SetupChecklist, type ChecklistItem, type ProviderState } from "./settings-list";
import { DemoBlock } from "./demo-kit";

const LOGO: Record<string, LogoId> = {
  github: "github",
  linear: "linear",
  slack: "slack",
  gmail: "gmail",
  notion: "notion",
  googledrive: "google-drive",
  whatsapp: "whatsapp",
  vercel: "vercel",
};

const connector = (toolkit: string) => CONNECTORS.find((c) => c.toolkit === toolkit) as Connector;

function useTimers() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };
}

/* ------------------------------------------------------------------------------ models */

type OAuthState = "connected" | "available" | "connecting" | "unsupported";

function ModelsGroup() {
  const later = useTimers();
  const [oauth, setOauth] = useState<Record<string, OAuthState>>({ claude: "connected", openai: "available", google: "unsupported" });
  const [keys, setKeys] = useState(() =>
    SECRETS.filter((s) => ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GEMINI_API_KEY"].includes(s.name)).map((s) => ({
      name: s.name,
      label: s.name === "ANTHROPIC_API_KEY" ? "Anthropic" : s.name === "OPENAI_API_KEY" ? "OpenAI" : "Gemini",
      logo: (s.name === "ANTHROPIC_API_KEY" ? "anthropic" : s.name === "OPENAI_API_KEY" ? "openai" : "gemini") as LogoId,
      connected: s.status === "Set",
      masked: s.masked,
    })),
  );

  function connect(id: string) {
    setOauth((o) => ({ ...o, [id]: "connecting" }));
    later(() => setOauth((o) => ({ ...o, [id]: "connected" })), 1100);
  }

  return (
    <div className="flex flex-col gap-6">
      <GroupedList caption="OAuth subscriptions" footer="Use a subscription you already pay for. Tokens it spends are usage, never quirqs.">
        <GroupedRow
          icon={
            <RowTile>
              <RuntimeLogo id="claude_code" size={16} decorative />
            </RowTile>
          }
          title="Claude"
          subtitle="Claude subscription"
          accessory={<ConnectAccessory name="Claude" state={oauth.claude} onConnect={() => connect("claude")} />}
        />
        <GroupedRow
          icon={
            <RowTile>
              <RuntimeLogo id="openai" size={16} decorative />
            </RowTile>
          }
          title="OpenAI"
          subtitle="ChatGPT subscription"
          accessory={<ConnectAccessory name="OpenAI" state={oauth.openai} onConnect={() => connect("openai")} />}
        />
        <GroupedRow
          icon={
            <RowTile>
              <RuntimeLogo id="gemini" size={15} decorative />
            </RowTile>
          }
          title="Google AI"
          subtitle="Gemini subscription"
          disabled
          accessory={<ConnectAccessory name="Google AI" state={oauth.google} />}
        />
      </GroupedList>

      <GroupedList caption="API keys" footer="Tap a row to paste a key. Keys are masked and stay in this space.">
        {keys.map((k) => (
          <KeyRow
            key={k.name}
            icon={
              <RowTile>
                <RuntimeLogo id={k.logo} size={15} decorative />
              </RowTile>
            }
            label={k.label}
            connected={k.connected}
            masked={k.masked}
            placeholder={k.logo === "anthropic" ? "sk-ant-…" : k.logo === "openai" ? "sk-…" : "AIza…"}
            onSave={(v) =>
              new Promise<void>((resolve) =>
                later(() => {
                  setKeys((list) => list.map((x) => (x.name === k.name ? { ...x, connected: true, masked: `${v.slice(0, 3)}…${v.slice(-4)}` } : x)));
                  resolve();
                }, 900),
              )
            }
          />
        ))}
      </GroupedList>
    </div>
  );
}

/* ------------------------------------------------------------------------------ channels */

const CHANNELS = ["slack", "whatsapp", "gmail"].map(connector);

function ChannelsGroup() {
  const active = CHANNELS.filter((c) => c.status === "On in this space").length;
  return (
    <div className="flex flex-col gap-6">
      <GroupedList>
        <GroupedRow
          icon={
            <RowTile tone="blu">
              <MessageSquare />
            </RowTile>
          }
          title="Active channels"
          subtitle="Where this space can message you"
          value={`${active}/${CHANNELS.length}`}
          valueTone="faint"
        />
      </GroupedList>
      <GroupedList caption="Notification channels" footer="Slack sign-in expired. Sign in again to resume alerts.">
        {CHANNELS.map((c) => (
          <GroupedRow
            key={c.toolkit}
            icon={
              <RowTile>
                <RuntimeLogo id={LOGO[c.toolkit]} size={15} decorative />
              </RowTile>
            }
            title={c.displayName}
            subtitle={c.account ?? c.description}
            busy={c.status === "Checking…"}
            accessory={
              c.status === "Needs attention" ? (
                <StateChip kind="connector" state="needs_attention" />
              ) : c.status === "Off in this space" ? (
                <StateChip kind="connector" state="off" />
              ) : c.status === "Checking…" ? (
                <span className="text-[12.5px] text-ink-faint">Checking…</span>
              ) : (
                "chevron"
              )
            }
          />
        ))}
      </GroupedList>
    </div>
  );
}

/* ------------------------------------------------------------------------------ data sources */

const SOURCE_STATE: Record<string, ProviderState> = {
  "On in this space": "connected",
  "Not connected": "needs_auth",
  Unavailable: "error",
  "Sign-in pending": "loading",
};

function DataSourcesGroup() {
  const later = useTimers();
  const [states, setStates] = useState<Record<string, ProviderState>>(() =>
    Object.fromEntries(["github", "googledrive", "notion", "vercel"].map((t) => [t, SOURCE_STATE[connector(t).status] ?? "needs_auth"])),
  );
  const set = (t: string, s: ProviderState) => setStates((m) => ({ ...m, [t]: s }));
  return (
    <GroupedList caption="Data sources" footer="Sources feed files and issues into this space's data layer.">
      {["github", "googledrive", "notion", "vercel"].map((t) => {
        const c = connector(t);
        return (
          <ProviderRow
            key={t}
            icon={<RuntimeLogo id={LOGO[t]} size={20} decorative />}
            name={c.displayName}
            label={c.description}
            account={c.account}
            state={states[t]}
            detail={c.note}
            onConnect={() => {
              set(t, "loading");
              later(() => set(t, "connected"), 1200);
            }}
            onDisconnect={() => set(t, "needs_auth")}
            onRetry={() => {
              set(t, "loading");
              later(() => set(t, "error"), 1200);
            }}
          />
        );
      })}
    </GroupedList>
  );
}

/* ------------------------------------------------------------------------------ checklist */

function checklist(withChannels: boolean, done: Record<string, boolean>): ChecklistItem[] {
  const items: ChecklistItem[] = [
    { id: "models", icon: <Cpu />, label: "Model connected", description: "Pick the runtime that powers this space.", done: Boolean(done.models) },
    { id: "data", icon: <Database />, label: "Data synced", description: "Connect knowledge sources for retrieval.", done: Boolean(done.data) },
  ];
  if (withChannels) items.push({ id: "channels", icon: <Bell />, label: "Channels", description: "Hook up channels like Slack or WhatsApp.", done: Boolean(done.channels) });
  items.push({ id: "secrets", icon: <KeyRound />, label: "Secrets", description: "Add API keys this space needs to run.", done: Boolean(done.secrets) });
  return items;
}

/** A setup checklist whose rows report which setup section they would open. */
function ChecklistDemo(props: { title?: string; description?: string; items: ChecklistItem[] }) {
  const [note, setNote] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <SetupChecklist {...props} onOpen={(i) => setNote(`Open setup → ${i.label}`)} />
      <p role="status" className="min-h-[16px] font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
        {note}
      </p>
    </div>
  );
}

const LOCAL_SPACE = SPACE_BY_ID["ws_2b81d0e4"];

/* ------------------------------------------------------------------------------ connection row */

/** A single provider connection row outside a group, as the client's Data sources page shows it. */
function ConnectionRowDemo() {
  const later = useTimers();
  const drive = connector("googledrive");
  const [state, setState] = useState<ProviderState>("needs_auth");
  return (
    <div className="@container max-w-[420px] overflow-hidden rounded-[14px] border border-hair bg-s1">
      <ProviderRow
        as="div"
        icon={<RuntimeLogo id="google-drive" size={20} decorative />}
        name={drive.displayName}
        label={drive.description}
        account={CURRENT_USER.email}
        state={state}
        onConnect={() => {
          setState("loading");
          later(() => setState("connected"), 1200);
        }}
        onDisconnect={() => setState("needs_auth")}
      />
    </div>
  );
}

/* ------------------------------------------------------------------------------ demo */

export function SettingsListDemo() {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
      <DemoBlock label="Models · tap a key row to expand" aside="connected · unsupported · saving">
        <ModelsGroup />
      </DemoBlock>
      <div className="flex min-w-0 flex-col gap-10">
        <DemoBlock label="Channels · 1 row busy">
          <ChannelsGroup />
        </DemoBlock>
        <DemoBlock label="Connection row · stacks when narrow · full-width Connect">
          <ConnectionRowDemo />
        </DemoBlock>
      </div>
      <DemoBlock label="Data sources · provider rows" aside="connected · needs auth · loading · error" className="lg:col-span-2">
        <DataSourcesGroup />
      </DemoBlock>
      <DemoBlock label="Checklist · 0 / 4 · not configured">
        <ChecklistDemo items={checklist(true, {})} />
      </DemoBlock>
      <div className="flex min-w-0 flex-col gap-10">
        <DemoBlock label="Checklist · without Channels · done rows">
          <ChecklistDemo
            title={`Setup checklist · ${LOCAL_SPACE?.name ?? "research-lab"}`}
            description="Claude Code spaces have no Channels step."
            items={checklist(false, { models: true, secrets: true })}
          />
        </DemoBlock>
        <DemoBlock label="Loading · skeleton rows">
          <GroupedList caption="API keys" loadingRows={3} />
        </DemoBlock>
      </div>
    </div>
  );
}
