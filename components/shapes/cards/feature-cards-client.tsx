"use client";

// Interactive feature cards: InstallCard (glass card with a copyable install command and
// non-interactive launcher tiles) and the org gate trio OrgCreateCard, OrgJoinCard and
// OrgPendingCard. Busy and error states are props so the parent owns the flow.
import { useState, type FormEvent, type ReactNode } from "react";
import { Building2, Clock, Search, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { copyText } from "@/components/ui/copy-button";
import { Field, Input, Radio } from "@/components/ui/field";
import { RuntimeLogo, type LogoId } from "@/components/ui/runtime-logo";
import { pluralize } from "@/lib/format";
import { useLater } from "./_hooks";

/* ----------------------------------------------------------------------------- InstallCard */

export type InstallCardProps = {
  title?: string;
  command: string;
  /** Launchers shown as tiles. They are not links until destinations exist. */
  launchers: { id: LogoId; label: string }[];
  /** Pin the copied look for static previews. */
  previewState?: "copied";
  className?: string;
};

/** Glass install card: one command pill that copies (Copied for 1.5 s) and launcher tiles. */
export function InstallCard({ title = "Get started", command, launchers, previewState, className }: InstallCardProps) {
  const [live, setState] = useState<"idle" | "copied" | "error">("idle");
  const state = previewState ?? live;
  const later = useLater();

  async function copy() {
    const ok = await copyText(command);
    setState(ok ? "copied" : "error");
    later(() => setState("idle"), 1500);
  }

  return (
    <div className={cn("glass flex min-w-0 flex-col p-[30px] pb-[34px] text-ink", className)}>
      <h4 className="mb-6 text-[clamp(22px,2.4vw,30px)] font-bold tracking-[-0.02em]">{title}</h4>
      <p className="mb-3 font-mono text-[11.5px] font-semibold uppercase tracking-[0.16em] text-white/50">Run in your shell</p>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy the install command: ${command}`}
        data-state={state}
        className={cn(
          // wraps on phones instead of clipping the command; radius 26 still reads as a pill on one line
          "w-full rounded-[26px]! border px-5 py-[15px] text-center font-mono text-[clamp(12.5px,1.3vw,15px)] font-bold [overflow-wrap:anywhere] transition-colors duration-150",
          state === "copied" ? "border-grn/60 bg-grn/[0.08] text-grn" : state === "error" ? "border-red/50 text-ink" : "border-[#d9d9d9] text-ink hover:bg-white/5",
        )}
      >
        {state === "copied" ? "Copied" : command}
      </button>
      <p role="status" className={cn("text-[12px] text-[#ff7a70]", state === "error" ? "mt-2" : "sr-only")}>
        {state === "copied" ? "Install command copied to clipboard" : state === "error" ? "Could not copy. Select the command and copy it yourself." : ""}
      </p>
      <p className="mb-3 mt-7 font-mono text-[11.5px] font-semibold uppercase tracking-[0.16em] text-white/50">Or launch from</p>
      <ul className="flex flex-wrap gap-3.5">
        {launchers.map((l) => (
          <li
            key={l.id}
            title={l.label}
            className="grid size-[58px] place-items-center rounded-[8px] border border-[rgba(217,217,217,0.5)]"
          >
            <RuntimeLogo id={l.id} size={30} label={l.label} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ----------------------------------------------------------------------------- Org gate */

function GateShell({ icon, title, description, children, className }: { icon: ReactNode; title: string; description: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <section className={cn("flex h-full min-w-0 flex-col gap-4 rounded-[14px] border border-hair bg-s1 p-5 text-ink", className)}>
      <header>
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className="grid size-8 place-items-center rounded-[8px] bg-s3 text-ink-dim [&_svg]:size-4">
            {icon}
          </span>
          <h4 className="flex-1 text-[15px] font-semibold">{title}</h4>
        </div>
        <p className="mt-2 text-[12.5px] leading-[1.55] text-ink-dim">{description}</p>
      </header>
      {children}
    </section>
  );
}

function ErrorBox({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-[10px] border border-dashed border-red/45 bg-red/[0.05] px-3.5 py-3 text-[12.5px] leading-[1.5] text-[#ff7a70]">
      {children}
    </p>
  );
}

const AGENTS = [
  { id: "claude_code", label: "Claude Code" },
  { id: "codex", label: "Codex" },
] as const;

export type OrgCreateCardProps = {
  creating?: boolean;
  error?: string | null;
  onCreate?: (name: string, agent: string) => void;
  idPrefix: string;
};

/** Create an organization: name, default agent, one submit. */
export function OrgCreateCard({ creating = false, error, onCreate, idPrefix }: OrgCreateCardProps) {
  const [name, setName] = useState("");
  const [agent, setAgent] = useState<string>("claude_code");
  function submit(e: FormEvent) {
    e.preventDefault();
    onCreate?.(name.trim(), agent);
  }
  return (
    <GateShell icon={<Building2 />} title="Create an organization" description="Start an org space for your team. You become its owner.">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field id={`${idPrefix}-name`} label="Organization name" error={error ?? undefined}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Robotics" disabled={creating} autoComplete="off" />
        </Field>
        <fieldset className="min-w-0">
          <legend className="mb-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-dim">Default agent</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {AGENTS.map((a) => (
              <Radio
                key={a.id}
                card
                name={`${idPrefix}-agent`}
                value={a.id}
                checked={agent === a.id}
                onChange={() => setAgent(a.id)}
                disabled={creating}
                label={
                  <span className="inline-flex items-center gap-2">
                    <RuntimeLogo id={a.id} size={14} decorative />
                    {a.label}
                  </span>
                }
              />
            ))}
          </div>
        </fieldset>
        <Button type="submit" variant="secondary" loading={creating} loadingLabel="Creating…" block>
          Create organization
        </Button>
      </form>
    </GateShell>
  );
}

export type OrgResult = { id: string; name: string; members: number };

export type OrgJoinCardProps = {
  searching?: boolean;
  results?: OrgResult[] | null;
  /** Query that matched nothing, shown in a dashed error box. */
  noMatch?: string | null;
  sendingId?: string | null;
  onSearch?: (query: string) => void;
  onRequest?: (org: OrgResult) => void;
  idPrefix: string;
};

/** Join an organization: search, then request access to one result. */
export function OrgJoinCard({ searching = false, results, noMatch, sendingId, onSearch, onRequest, idPrefix }: OrgJoinCardProps) {
  const [q, setQ] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    onSearch?.(q.trim());
  }
  return (
    <GateShell icon={<Search />} title="Join an organization" description="Find your team's org and ask an owner for access.">
      <form onSubmit={submit} className="flex gap-2" role="search">
        <label htmlFor={`${idPrefix}-q`} className="sr-only">
          Organization name
        </label>
        <Input id={`${idPrefix}-q`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name" disabled={searching} autoComplete="off" />
        <Button type="submit" loading={searching} loadingLabel="Searching…">
          Search
        </Button>
      </form>
      {noMatch ? <ErrorBox>No organizations match &ldquo;{noMatch}&rdquo;. Check the spelling or ask an owner for an invite.</ErrorBox> : null}
      {results && results.length > 0 ? (
        <ul className="flex flex-col gap-2" aria-label="Search results">
          {results.map((o) => (
            <li key={o.id} className="flex items-center gap-3 rounded-[10px] border border-hair p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-ink">{o.name}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-ink-dim">
                  <Users aria-hidden="true" className="size-3.5" />
                  {pluralize(o.members, "member")}
                </p>
              </div>
              <Button size="sm" loading={sendingId === o.id} loadingLabel="Sending…" disabled={Boolean(sendingId) && sendingId !== o.id} onClick={() => onRequest?.(o)}>
                Request to join
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </GateShell>
  );
}

export type OrgPendingCardProps = { orgName: string; cancelling?: boolean; onCancel?: () => void };

/** The request is waiting for an owner. */
export function OrgPendingCard({ orgName, cancelling = false, onCancel }: OrgPendingCardProps) {
  return (
    <GateShell
      icon={<Clock />}
      title="Request pending"
      description={
        <>
          You asked to join <strong className="font-semibold text-ink">{orgName}</strong>. You&apos;ll get access once an owner approves it.
        </>
      }
      className="border-org/30"
    >
      <div className="mt-auto">
        <Button variant="subtle" size="sm" loading={cancelling} loadingLabel="Cancelling…" onClick={onCancel}>
          Cancel request
        </Button>
      </div>
    </GateShell>
  );
}
