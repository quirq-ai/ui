"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CircleCheck, CreditCard, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StateChip, StatusDot, type StateOf } from "@/components/ui/status";
import { formatCurrency } from "@/lib/format";
import { BILLING_OVERDUE, BILLING_RESULTS, GALILEO, GALILEO_SOURCES, SPACES, type SpaceStatus } from "@/lib/fixtures";
import { Caption, DemoGroup, DemoStack } from "./parts";
import { FullPageNotice, PageFrame, ResultCard } from "./full-page-notice";
import { AutoRefreshLine, useAutoRefresh, useCountdown } from "./full-page-notice-live";

const host = (name: string) => `http://${name}.localhost:${GALILEO.port}/`;

const SPACE_KEY: Record<SpaceStatus, StateOf<"space">> = {
  Creating: "creating",
  Starting: "starting",
  Running: "running",
  Stopping: "stopping",
  Stopped: "stopped",
};

/* the galileo Sources page both 404s link to, with a way back */
function SourcesPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="subtle" leadingIcon={<ArrowLeft />} onClick={onBack}>
          Back
        </Button>
        <h4 className="text-[13px] font-semibold text-ink">Sources</h4>
      </div>
      <ul className="divide-y divide-hair-soft rounded-[10px] border border-hair-soft">
        {GALILEO_SOURCES.slice(0, 6).map((s) => (
          <li key={s.name} className="flex min-w-0 items-center gap-2.5 px-3 py-2 text-[12px]">
            <StatusDot status={s.up ? "up" : "down"} label={s.up ? "Up" : "Down"} />
            <span className="min-w-0 flex-1 truncate font-mono text-ink">{s.name}</span>
            <span className="shrink-0 text-ink-faint">{s.type === "port" ? `port ${s.port}` : s.path}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* galileo: missing route, with a Sources page to navigate to and back from */
function MissingRoute() {
  const [view, setView] = useState<"missing" | "sources">("missing");
  return (
    <PageFrame url={view === "missing" ? `${GALILEO.origin}/s/` : `${GALILEO.origin}/__xo/sources`} status={view === "missing" ? "404" : "200"}>
      {view === "missing" ? (
        <FullPageNotice
          align="center"
          headingLevel="h4"
          eyebrow="404 · galileo"
          title="Nothing here"
          actions={
            <Button size="sm" variant="link" onClick={() => setView("sources")}>
              Go to the Sources page
            </Button>
          }
        >
          galileo shows sources at <code className="font-mono text-ink">/s/&lt;name&gt;/</code>.
        </FullPageNotice>
      ) : (
        <SourcesPage onBack={() => setView("missing")} />
      )}
    </PageFrame>
  );
}

/* galileo: waiting page that tries again every 2 s until the app answers */
function WaitingPage() {
  // the attempt during which the app was started; the next attempt finds it answering
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const { attempt, reset } = useAutoRefresh(2000);
  const appUp = startedAt !== null;
  const answeredAt = startedAt !== null && attempt > startedAt ? startedAt + 1 : null;

  const answered = answeredAt !== null;
  return (
    <PageFrame url={host("web")} status={answered ? "200" : "502"}>
      {answered ? (
        <div className="flex h-full min-h-[300px] flex-col justify-between p-5">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-grn">web · Vite dev server</p>
            <h4 className="mt-2 text-[20px] font-semibold tracking-[-0.015em] text-ink">Acme dashboard</h4>
            <p className="mt-1 text-[12.5px] text-ink-dim">The app answered on attempt {answeredAt} and replaced the waiting page.</p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="self-start"
            onClick={() => {
              setStartedAt(null);
              reset();
            }}
          >
            Stop the app again
          </Button>
        </div>
      ) : (
        <FullPageNotice
          align="center"
          headingLevel="h4"
          eyebrow="502 · waiting"
          title="Waiting for web"
          actions={
            <Button size="sm" variant="secondary" onClick={() => setStartedAt(attempt)} disabled={appUp}>
              {appUp ? "Starting…" : "Start the app"}
            </Button>
          }
          footer={<AutoRefreshLine attempt={attempt} status={appUp ? "busy" : "down"} />}
        >
          Nothing answers on port 5173 yet (ECONNREFUSED). galileo starts nothing: start the app, and this page tries again every 2 seconds.
        </FullPageNotice>
      )}
    </PageFrame>
  );
}

/* galileo: no source by that name */
function UnknownSource() {
  const [view, setView] = useState<"missing" | "sources">("missing");
  const names = GALILEO_SOURCES.map((s) => s.name);
  return (
    <PageFrame url={view === "missing" ? host("wiki") : `${GALILEO.origin}/__xo/sources`} status={view === "missing" ? "404" : "200"}>
      {view === "missing" ? (
        <FullPageNotice
          align="start"
          headingLevel="h4"
          eyebrow="404 · no bridge"
          title="No source called “wiki”"
          actions={
            <Button size="sm" variant="link" onClick={() => setView("sources")}>
              Add one on the Sources page
            </Button>
          }
        >
          <p>Sources on this galileo:</p>
          <ul className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-[12px] sm:grid-cols-3">
            {names.map((n) => (
              <li key={n} className="flex items-center gap-2 text-ink">
                <span aria-hidden="true" className="size-1 rounded-full bg-ink-faint" />
                {n}
              </li>
            ))}
          </ul>
        </FullPageNotice>
      ) : (
        <SourcesPage onBack={() => setView("missing")} />
      )}
    </PageFrame>
  );
}

/* space dashboard: no data source, Retry re-reads the dataset */
function NoDataSource() {
  const [checking, setChecking] = useState(false);
  const [tries, setTries] = useState(1);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (t.current) clearTimeout(t.current);
    },
    [],
  );
  return (
    <PageFrame url="http://localhost:5002/#/overview" status="no data">
      <FullPageNotice
        headingLevel="h4"
        eyebrow="No data source"
        tone="org"
        title="The Space dashboard reads its map from a local file."
        command="cd xo-space && ./cowork-api.sh start"
        commandLabel="Start the space server"
        actions={
          <Button
            size="sm"
            variant="secondary"
            loading={checking}
            loadingLabel="Reading…"
            onClick={() => {
              setChecking(true);
              t.current = setTimeout(() => {
                setChecking(false);
                setTries((n) => n + 1);
              }, 900);
            }}
          >
            Retry
          </Button>
        }
        footer={
          <span aria-live="polite">
            Read {tries} {tries === 1 ? "time" : "times"} · /xo/space.json still missing
          </span>
        }
      >
        This page loads <code className="font-mono text-ink">/xo/space.json</code>, which the space server writes. Start the space server, then retry:
      </FullPageNotice>
    </PageFrame>
  );
}

/* checkout result with a redirect countdown */
function SubscriptionResult() {
  const { left, done, restart, finish } = useCountdown(5);
  const r = BILLING_RESULTS.subscriptionStarted;
  return (
    <PageFrame url="https://xo.example.com/subscription/success" status={done ? "redirect" : `${left}s`}>
      <div className="grid min-h-[300px] place-items-center p-5">
        {done ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <Caption>redirected · Spaces</Caption>
            <p className="text-[13px] text-ink-dim">The countdown ended and opened your spaces.</p>
            <Button size="sm" variant="secondary" onClick={restart}>
              Replay
            </Button>
          </div>
        ) : (
          <ResultCard
            tone="success"
            headingLevel="h4"
            icon={<CircleCheck />}
            title={r.title}
            countdown={
              <span aria-live="polite" className="tabular-nums">
                Opening your spaces in {left}s…
              </span>
            }
            actions={
              <Button size="sm" variant="primary" onClick={finish}>
                Open spaces now
              </Button>
            }
          >
            {r.body}
          </ResultCard>
        )}
      </div>
    </PageFrame>
  );
}

function PaymentResults() {
  const [view, setView] = useState<"failed" | "added" | "billing">("failed");
  const failed = BILLING_RESULTS.paymentFailed;
  const added = BILLING_RESULTS.paymentMethodAdded;
  const url = { failed: "https://xo.example.com/payment-method/failure", added: "https://xo.example.com/payment-method/success", billing: "https://xo.example.com/billing" }[view];
  return (
    <PageFrame url={url} status={view === "failed" ? "failed" : "200"}>
      <div className="grid min-h-[300px] place-items-center gap-4 p-5">
        {view === "failed" ? (
          <ResultCard
            tone="attention"
            headingLevel="h4"
            icon={<TriangleAlert />}
            title={failed.title}
            actions={
              <>
                <Button size="sm" variant="primary" leadingIcon={<CreditCard />} onClick={() => setView("added")}>
                  Try another card
                </Button>
                <Button size="sm" variant="subtle" leadingIcon={<ArrowLeft />} onClick={() => setView("billing")}>
                  Back to billing
                </Button>
              </>
            }
          >
            {failed.body}
          </ResultCard>
        ) : view === "added" ? (
          <ResultCard
            tone="success"
            headingLevel="h4"
            icon={<CreditCard />}
            title={added.title}
            actions={
              <Button size="sm" variant="secondary" onClick={() => setView("billing")}>
                Go to billing
              </Button>
            }
          >
            {added.body}
          </ResultCard>
        ) : (
          <div className="flex w-full max-w-[400px] flex-col gap-3 rounded-[16px] border border-hair bg-s1 p-5">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-[15px] font-semibold text-ink">Billing</h4>
              <StateChip kind="subscription" state="payment_overdue" />
            </div>
            <p className="text-[12.5px] text-ink-dim">
              {BILLING_OVERDUE.plan} plan · {formatCurrency(BILLING_OVERDUE.amountDue)} due. Illustrative amounts.
            </p>
            <Button size="sm" variant="subtle" className="self-start" onClick={() => setView("failed")}>
              Show the failure again
            </Button>
          </div>
        )}
      </div>
    </PageFrame>
  );
}

/* galileo sample app: 404 with a way back */
function AcmeNotFound() {
  const [view, setView] = useState<"404" | "home">("404");
  return (
    <PageFrame url={view === "404" ? `${host("acme")}notes/missing` : host("acme")} status={view === "404" ? "404" : "200"} light>
      <div className="flex min-h-[300px] flex-col">
        <div className="border-b border-[#e7e4dc] px-6 py-3 text-[13px] font-semibold text-[#1c1c1a]">Acme Notes</div>
        <div className="flex flex-1 flex-col justify-center gap-3 px-6 py-6">
          {view === "404" ? (
            <>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#77736a]">404</p>
              <h4 className="text-[24px] font-semibold tracking-[-0.02em]">Page not found</h4>
              <button type="button" onClick={() => setView("home")} className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-[#3355d6] underline-offset-4 hover:underline">
                <ArrowLeft aria-hidden="true" className="size-3.5" /> Back to Acme Notes
              </button>
            </>
          ) : (
            <>
              <blockquote className="border-l-4 border-[#3355d6] pl-5 text-[20px] leading-snug text-[#1c1c1a]">
                Your notes should outlive the app you wrote them in.
              </blockquote>
              <button type="button" onClick={() => setView("404")} className="inline-flex w-fit text-[12.5px] text-[#3355d6] underline-offset-4 hover:underline">
                Open a missing page
              </button>
            </>
          )}
        </div>
        <p className="border-t border-[#e7e4dc] px-6 py-4 text-center text-[12.5px] text-[#77736a]">Acme Notes is a sample app for the XO toolbar demo.</p>
      </div>
    </PageFrame>
  );
}

/* xo-client not found, with a way back to the spaces list */
function ClientNotFound() {
  const [view, setView] = useState<"404" | "spaces">("404");
  return (
    <PageFrame url={view === "404" ? "http://localhost:3000/spaces/ws_000000" : "http://localhost:3000/spaces"} status={view === "404" ? "404" : "200"}>
      {view === "404" ? (
        <FullPageNotice
          size="lg"
          headingLevel="h4"
          eyebrow="404"
          title="This space is not here."
          actions={
            <Button size="sm" variant="primary" leadingIcon={<ArrowLeft />} onClick={() => setView("spaces")}>
              Back to spaces
            </Button>
          }
        >
          The link points to a space that was deleted or that you have no access to. Ask its owner for a new invite.
        </FullPageNotice>
      ) : (
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-[13px] font-semibold text-ink">Spaces</h4>
            <Button size="sm" variant="subtle" onClick={() => setView("404")}>
              Open the broken link again
            </Button>
          </div>
          <ul className="divide-y divide-hair-soft rounded-[10px] border border-hair-soft">
            {SPACES.map((sp) => (
              <li key={sp.id} className="flex min-w-0 items-center justify-between gap-3 px-3 py-2">
                <span className="min-w-0 truncate font-mono text-[12px] text-ink">{sp.name}</span>
                <StateChip kind="space" state={SPACE_KEY[sp.status]} variant="plain" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </PageFrame>
  );
}

export function FullPageNoticeDemo() {
  return (
    <DemoStack>
      <DemoGroup title="galileo pages" hint="Missing route, waiting for a source (auto-refresh every 2 s) and an unknown source.">
        <div className="grid gap-4 lg:grid-cols-2">
          <MissingRoute />
          <WaitingPage />
          <UnknownSource />
          <NoDataSource />
        </div>
      </DemoGroup>
      <DemoGroup title="Subscription results" hint="Sentence case, no exclamation marks. The success page counts down before it redirects.">
        <div className="grid gap-4 lg:grid-cols-2">
          <SubscriptionResult />
          <PaymentResults />
        </div>
      </DemoGroup>
      <DemoGroup title="404">
        <div className="grid gap-4 lg:grid-cols-2">
          <AcmeNotFound />
          <ClientNotFound />
        </div>
      </DemoGroup>
    </DemoStack>
  );
}
