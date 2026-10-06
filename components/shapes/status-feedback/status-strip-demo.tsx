"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Building2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/field";
import { Spinner } from "@/components/ui/loaders";
import { StatusDot } from "@/components/ui/status";
import { BILLING, CURRENT_SPACE, GALILEO, GALILEO_SOURCES, SPACES, SUBSCRIPTION_STATE_META } from "@/lib/fixtures";
import { DemoGroup, DemoStack, Specimen } from "./parts";
import { DismissedSlot } from "./dismissed-slot";
import { AlertBanner, AnnouncementBar, DevBuildBanner, InlineAlert, ProvingGroundsStrip, StatusLine, UsageReportingStatus } from "./status-strip";

const PARTNERS = [
  { pair: "quirq × Nevermined", what: "settlement rails for verified agent work" },
  { pair: "quirq × Shodai", what: "agents transacting under a signed agreement, settled in quirqs, disputes included" },
  { pair: "quirq × Nirvana", what: "agent task management on bare metal" },
];

function StripTag({ tone, children }: { tone: "grn" | "org" | "neutral"; children: string }) {
  const cls = tone === "grn" ? "border-grn/30 bg-grn/10 text-grn" : tone === "org" ? "border-org/30 bg-org/10 text-org" : "border-hair bg-white/[0.04] text-ink-dim";
  return <span className={`inline-flex h-[22px] shrink-0 items-center rounded-[6px] border px-2 font-mono text-[10px] uppercase tracking-[0.1em] ${cls}`}>{children}</span>;
}

type Reach = "error" | "retrying" | "recovered" | "dismissed";

export function StatusStripDemo() {
  const [reach, setReach] = useState<Reach>("error");
  const [announce, setAnnounce] = useState(true);
  const [form, setForm] = useState({ name: "notes", location: "" });
  const [formError, setFormError] = useState<{ field: "name" | "location"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [added, setAdded] = useState<string | null>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ops = SPACES[0];

  useEffect(
    () => () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    },
    [],
  );

  const retry = () => {
    setReach("retrying");
    if (retryTimer.current) clearTimeout(retryTimer.current);
    retryTimer.current = setTimeout(() => setReach("recovered"), 1200);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const location = form.location.trim();
    let err: { field: "name" | "location"; text: string } | null = null;
    if (!name) err = { field: "name", text: "Name your source, such as notes." };
    else if (!/^[a-z0-9-]+$/.test(name)) err = { field: "name", text: "Use a to z, 0 to 9 and dashes in the name." };
    else if (GALILEO_SOURCES.some((s) => s.name === name)) err = { field: "name", text: `A source called ${name} already exists.` };
    else if (!location) err = { field: "location", text: "Add a port, such as 5173, or a path, such as ~/notes." };
    setFormError(err);
    setAdded(err ? null : name);
    // move focus to the field that needs fixing; the alert below names the problem
    if (err) (formRef.current?.elements.namedItem(err.field) as HTMLInputElement | null)?.focus();
  };

  return (
    <DemoStack>
      <DemoGroup title="Destructive · retry" hint="error, retrying, recovered, dismissed.">
        <div className="grid gap-3">
          {reach === "error" || reach === "retrying" ? (
            <AlertBanner
              tone="error"
              role="alert"
              icon={<WifiOff aria-hidden="true" className="size-4" />}
              title="xo-space is unreachable"
              actions={
                <Button size="sm" onClick={retry} loading={reach === "retrying"} loadingLabel="Retrying…">
                  Retry
                </Button>
              }
            >
              The request never reached the server (stopped or restarting; the footer pill tracks it). Not a telemetry source problem.
            </AlertBanner>
          ) : reach === "recovered" ? (
            <AlertBanner tone="good" role="status" title="Reconnected" onDismiss={() => setReach("dismissed")} dismissLabel="Dismiss reconnected notice">
              Space API answered in 842 ms. Nothing was lost while it was away.
            </AlertBanner>
          ) : (
            <DismissedSlot label="Banner dismissed" action="Show the outage again" onRestore={() => setReach("error")} />
          )}
          <AlertBanner tone="error" title="Could not save the theme.">
            Try again. Your previous theme is still applied.
          </AlertBanner>
        </div>
      </DemoGroup>

      <DemoGroup title="Setup status" hint="With and without an action.">
        <div className="grid gap-3 md:grid-cols-2">
          <AlertBanner tone="good" inline title="Settings applied">
            Space, Agent and Theme are live.
          </AlertBanner>
          <AlertBanner
            tone="warn"
            inline
            title="Unsaved changes"
            actions={
              <Button size="sm" variant="secondary">
                Review changes
              </Button>
            }
          >
            Space, Agent
          </AlertBanner>
          <AlertBanner
            tone="info"
            title="Apply changes"
            actions={
              <Button size="sm" variant="primary" trailingIcon={<ArrowRight />}>
                Apply changes
              </Button>
            }
          >
            Restart the server to use your saved settings.
          </AlertBanner>
          <AlertBanner tone="busy" role="status" title="Restarting space…">
            The page will reconnect automatically.
          </AlertBanner>
        </div>
      </DemoGroup>

      <DemoGroup title="Amber stale, trial and billing">
        <div className="grid gap-3 md:grid-cols-2">
          <AlertBanner tone="warn" title="Updating the volume will restart the space.">
            Any unsaved work may be lost.
          </AlertBanner>
          <AlertBanner
            tone="warn"
            title="Telemetry is 3h old"
            actions={
              <Button size="sm" variant="secondary">
                Refresh
              </Button>
            }
          >
            Last read at 06:30. Usage figures below are stale, not zero.
          </AlertBanner>
          <AlertBanner
            tone="info"
            title={`Trial active · ends ${BILLING.trialEnds}`}
            actions={
              <Button size="sm" variant="secondary">
                Add payment method
              </Button>
            }
          >
            {BILLING.trialDaysLeft} days left on the Managed plan. Add a payment method to keep hosted spaces running.
          </AlertBanner>
          <AlertBanner
            tone="warn"
            icon={<Building2 aria-hidden="true" className="size-4" />}
            title="Your organization does not have an active business plan"
            actions={
              <Button size="sm" variant="secondary">
                Subscribe personally
              </Button>
            }
          >
            You can subscribe personally to stay unblocked.
          </AlertBanner>
          <AlertBanner tone="error" title="Payment needs attention">
            {SUBSCRIPTION_STATE_META["Payment overdue"].blurb.replace("Payment needs attention. ", "")}
          </AlertBanner>
          <AlertBanner tone="neutral" icon={<Building2 aria-hidden="true" className="size-4" />} title="Subscription managed by your organization">
            Acme Robotics pays for hosted spaces. Ask an owner to change the plan.
          </AlertBanner>
        </div>
      </DemoGroup>

      <DemoGroup title="Announcement bar and dev build" hint="Dismiss the announcement with its close button.">
        <div className="overflow-hidden rounded-[14px] border border-hair-soft bg-black/50">
          {announce ? (
            <AnnouncementBar
              onDismiss={() => setAnnounce(false)}
              action={
                <a href="#status-strip" className="inline-flex items-center gap-1 text-ink underline-offset-4 hover:underline">
                  Invite your team <ArrowRight aria-hidden="true" className="size-3.5" />
                </a>
              }
            >
              Org spaces are live. Invite your team from the scope switcher.
            </AnnouncementBar>
          ) : (
            <DismissedSlot label="Announcement dismissed" variant="bar" onRestore={() => setAnnounce(true)} />
          )}
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-[12.5px] text-ink-dim">
            <span className="font-mono text-ink">XO Swarm</span>
            <span>Spaces · Projects · Usage</span>
          </div>
          <DevBuildBanner />
          <div className="bg-[#fbfaf7] px-6 py-4 text-[13px] text-[#3a3a36]">Acme Notes · sample app served by galileo on port 4173</div>
        </div>
      </DemoGroup>

      <DemoGroup title="Space status line">
        <div className="grid gap-2.5">
          <StatusLine
            lead={<StripTag tone="grn">sharing on</StripTag>}
            items={["last check 1m ago", "every minute", "watching main"]}
            trailing={
              <>
                <span className="text-ink-faint">your id</span>
                <code className="rounded-[6px] border border-hair-soft bg-black/40 px-1.5 py-0.5 font-mono text-[11px] text-ink">{CURRENT_SPACE.id}</code>
                <CopyButton text={CURRENT_SPACE.id} variant="pill" size="sm" aria-label="Copy space ID" announce="Space ID copied" />
                <CopyButton text={`xo invite ${CURRENT_SPACE.id}`} variant="labelled" size="sm" label="Copy invite" aria-label="Copy invite" announce="Invite copied" />
              </>
            }
          />
          <StatusLine lead={<StripTag tone="org">sharing parked</StripTag>} items={["sign in to XO (or set XO_API_KEY) to share projects"]} />
          <StatusLine
            lead={
              <span className="inline-flex items-center gap-2 text-ink-dim">
                <Spinner size="xs" label={null} /> checking…
              </span>
            }
            items={["reading the git origin of 11 projects"]}
          />
          <StatusLine
            items={[
              <span key="n" className="inline-flex items-center gap-2 font-mono text-ink">
                <StatusDot status="up" />
                {ops.name}
              </span>,
              "Running",
              "API: Up",
              `Stops in ${ops.stopsIn}`,
              `${ops.provider} · ${ops.region}`,
            ]}
          />
        </div>
      </DemoGroup>

      <DemoGroup title="Usage reporting status">
        <div className="grid gap-3 md:grid-cols-2">
          <UsageReportingStatus state="on" link={
              <a href="#status-strip" className="inline-flex items-center gap-1 text-ink underline-offset-4 hover:underline">
                What leaves your machine <ArrowRight aria-hidden="true" className="size-3.5" />
              </a>
            }>
            Daily totals: tokens, cost, sessions and tools. Prompts, responses and files stay local. Last sent 2026-10-01.
          </UsageReportingStatus>
          <UsageReportingStatus state="blocked">XO_API_KEY was rejected. Nothing is sent until you set a valid key.</UsageReportingStatus>
          <UsageReportingStatus state="pending">Checking the key. The first daily total goes out after midnight UTC.</UsageReportingStatus>
          <UsageReportingStatus state="off">No XO_API_KEY. Nothing is sent.</UsageReportingStatus>
        </div>
      </DemoGroup>

      <DemoGroup title="galileo inline alert" hint="Errors show under the form and clear on the next valid submit.">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <Specimen label={`add a source · ${GALILEO.origin}`}>
            <form ref={formRef} onSubmit={submit} noValidate aria-label="Add a source" className="flex flex-wrap items-end gap-2">
              <label className="flex min-w-[120px] flex-1 flex-col gap-1 text-[11.5px] text-ink-dim">
                Name
                <Input
                  name="name"
                  size="sm"
                  mono
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  aria-invalid={formError?.field === "name" || undefined}
                  aria-describedby={formError?.field === "name" ? "sf-src-error" : undefined}
                />
              </label>
              <label className="flex min-w-[140px] flex-[1.4] flex-col gap-1 text-[11.5px] text-ink-dim">
                Port or path
                <Input
                  name="location"
                  size="sm"
                  mono
                  placeholder="5173 or ~/notes"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  aria-invalid={formError?.field === "location" || undefined}
                  aria-describedby={formError?.field === "location" ? "sf-src-error" : undefined}
                />
              </label>
              <Button type="submit" size="sm" variant="secondary" className="h-8">
                Add
              </Button>
              {formError ? <InlineAlert id="sf-src-error">{formError.text}</InlineAlert> : null}
              {added ? (
                <p role="status" className="m-0 basis-full text-[13px] text-grn">
                  Added {added} · Opens at {added}.localhost:{GALILEO.port}
                </p>
              ) : null}
            </form>
          </Specimen>
          <Specimen label="load error · fallback">
            <div className="flex flex-col gap-2">
              <InlineAlert live={false}>Couldn&apos;t read the sources: galileo answered 500</InlineAlert>
              <InlineAlert live={false}>No such source</InlineAlert>
              <InlineAlert live={false}>Only galileo&apos;s own pages may use this</InlineAlert>
            </div>
          </Specimen>
        </div>
      </DemoGroup>

      <DemoGroup title="Proving grounds dashed strip">
        <ProvingGroundsStrip
          title="We're testing work environment efficiency."
          body="No longer is AI token spend the only metric for businesses. Let's prove it."
          partners={PARTNERS}
        />
      </DemoGroup>
    </DemoStack>
  );
}
