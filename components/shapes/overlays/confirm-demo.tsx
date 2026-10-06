"use client";

import { useEffect, useId, useRef, useState } from "react";
import { RefreshCw, RotateCcw, Trash2, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StateChip } from "@/components/ui/status";
import { Segmented } from "@/components/ui/segmented";
import { Avatar } from "@/components/ui/avatar";
import { PEOPLE, SPACES, type Space, type SpaceStatus } from "@/lib/fixtures";
import { ConfirmPanel, DangerZone, DangerZoneRow, InlineConfirm, RemovalPanel, TypeToConfirm, type AccessReview, type ConfirmState } from "./confirm";
import { ConfirmDialog } from "./confirm-dialog";
import { ModalNotice } from "./modal-panel";
import { DemoSection, DemoStatus, Example, Stage } from "./demo-kit";
import { useTimers } from "./demo-hooks";
import { FocusScope, Reopenable } from "./demo-reopen";

const SPACE_STATE: Record<SpaceStatus, "creating" | "starting" | "running" | "stopping" | "stopped"> = {
  Creating: "creating",
  Starting: "starting",
  Running: "running",
  Stopping: "stopping",
  Stopped: "stopped",
};

const BLOCKED_REASON = "Cannot delete while the space is starting. Wait for the current operation to finish.";
const short = (id: string) => (id.length > 10 ? `${id.slice(0, 7)}…${id.slice(-4)}` : id);
const OPS = SPACES.find((s) => s.name === "ops-copilot")!;
const PILOT = SPACES.find((s) => s.name === "demo-pilot")!;

/* ----------------------------------------------------------------------------- flows */

function StaticConfirm({ space, initial = "idle", onDone }: { space: Space; initial?: ConfirmState; onDone: () => void }) {
  const schedule = useTimers();
  const [state, setState] = useState<ConfirmState>(space.status === "Starting" ? "blocked" : initial);
  return (
    <ConfirmPanel
      titleAs="h3"
      title="Delete space"
      description={`Delete ${space.name}? This cannot be undone.`}
      confirmLabel="Delete space"
      state={state}
      blockedReason={BLOCKED_REASON}
      onCancel={onDone}
      onConfirm={() => {
        if (state !== "idle") return;
        setState("checking");
        schedule(onDone, 1000);
      }}
    />
  );
}

function SpaceList() {
  const schedule = useTimers();
  const boxRef = useRef<HTMLDivElement>(null);
  // Row index to focus once a deleted row is gone (its Delete button cannot take focus back).
  const focusRow = useRef<number | null>(null);
  const [spaces, setSpaces] = useState<Space[]>(SPACES);
  const [target, setTarget] = useState<Space | null>(null);
  const [state, setState] = useState<ConfirmState>("idle");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (focusRow.current === null || target) return;
    const buttons = boxRef.current?.querySelectorAll<HTMLButtonElement>("button[data-delete]");
    const next = buttons?.[Math.min(focusRow.current, buttons.length - 1)] ?? boxRef.current?.querySelector<HTMLButtonElement>("button");
    focusRow.current = null;
    next?.focus();
  }, [spaces, target]);

  return (
    <div ref={boxRef} className="flex flex-col gap-3">
      <ul className="divide-y divide-hair-soft overflow-hidden rounded-[12px] border border-hair-soft bg-[#0f0f11]">
        {spaces.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
            <div className="min-w-0 flex-1 basis-[180px]">
              <p className="text-[13.5px] font-medium text-ink">{s.name}</p>
              <p className="truncate font-mono text-[11.5px] text-ink-faint">{s.host}</p>
            </div>
            <StateChip kind="space" state={SPACE_STATE[s.status]} prefix={s.deployment === "hosted" ? "Hosted" : "Local"} />
            <Button
              size="sm"
              variant="danger"
              leadingIcon={<Trash2 />}
              data-delete
              aria-label={`Delete ${s.name}`}
              onClick={() => {
                setTarget(s);
                setState(s.status === "Starting" ? "blocked" : "idle");
              }}
            >
              Delete
            </Button>
          </li>
        ))}
        {spaces.length === 0 ? <li className="px-4 py-6 text-center text-[12.5px] text-ink-faint">No spaces left in this demo.</li> : null}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <DemoStatus>{status}</DemoStatus>
        {spaces.length < SPACES.length ? (
          <Button
            size="sm"
            variant="subtle"
            leadingIcon={<RotateCcw />}
            onClick={() => {
              setSpaces(SPACES);
              setStatus("Spaces restored.");
            }}
          >
            Restore spaces
          </Button>
        ) : null}
      </div>
      <ConfirmDialog
        open={target !== null}
        onCancel={() => setTarget(null)}
        title="Delete space"
        description={`Delete ${target?.name ?? "this space"}? This cannot be undone.`}
        confirmLabel="Delete space"
        state={state}
        blockedReason={BLOCKED_REASON}
        onConfirm={() => {
          if (!target || state !== "idle") return;
          const name = target.name;
          setState("checking");
          schedule(() => {
            focusRow.current = spaces.findIndex((x) => x.id === target.id);
            setSpaces((xs) => xs.filter((x) => x.id !== target.id));
            setTarget(null);
            setStatus(`${name} deleted. Demo only: nothing was removed.`);
          }, 1100);
        }}
      />
    </div>
  );
}

type Access = { id: string; personId: "kenji" | "lena" | "tomas"; ref: string; role: string; kind: "space" | "roster" };
const ACCESS: Access[] = [
  { id: "a1", personId: "kenji", ref: "ws_7f3a9c21e4b0", role: "Collaborator", kind: "space" },
  { id: "a2", personId: "lena", ref: "ws_c40e19aa", role: "Collaborator", kind: "space" },
  { id: "a3", personId: "tomas", ref: "user_tomas", role: "Local roster · member", kind: "roster" },
];

function AccessList() {
  const schedule = useTimers();
  const [asking, setAsking] = useState<string | null>("a1");
  // What takes focus after a click swaps a button for its confirm, or back: never on first paint.
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [gone, setGone] = useState<string[]>([]);
  const [status, setStatus] = useState("");

  return (
    <div className="flex flex-col gap-3">
      <FocusScope>
        <ul className="divide-y divide-hair-soft rounded-[12px] border border-hair-soft bg-[#0f0f11]">
          <li className="flex items-center gap-3 px-4 py-3">
            <Avatar name="Ada Moreno" size="sm" decorative />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-ink">Ada Moreno</p>
              <p className="text-[11.5px] text-ink-faint">Owner · You</p>
            </div>
          </li>
          {ACCESS.map((a) => {
            const p = PEOPLE[a.personId];
            const removed = gone.includes(a.id);
            const roster = a.kind === "roster";
            return (
              <li key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
                <Avatar name={p.name} size="sm" decorative />
                <div className="min-w-0 flex-1 basis-[150px]">
                  <p className="text-[13px] font-medium text-ink">{p.name}</p>
                  <p className="truncate text-[11.5px] text-ink-faint">
                    <code className="font-mono">{a.ref}</code> · {a.role}
                    {removed ? (roster ? " · Removed" : " · Revoked") : ""}
                  </p>
                </div>
                {removed ? null : asking === a.id ? (
                  <InlineConfirm
                    question={roster ? "Remove this user from the local roster?" : "Revoke access for this user?"}
                    confirmLabel={roster ? "Confirm removal" : "Confirm revoke"}
                    busy={busy === a.id}
                    autoFocus={focusKey === "confirm"}
                    onCancel={() => {
                      setAsking(null);
                      setFocusKey(`trigger:${a.id}`);
                    }}
                    onConfirm={() => {
                      setBusy(a.id);
                      schedule(() => {
                        setBusy(null);
                        setAsking(null);
                        setGone((g) => [...g, a.id]);
                        setStatus(roster ? `${p.name} removed from the local roster.` : `Access revoked for ${p.name}.`);
                      }, 900);
                    }}
                  />
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    leadingIcon={<UserMinus />}
                    disabled={busy !== null}
                    autoFocus={focusKey === `trigger:${a.id}`}
                    onClick={() => {
                      setAsking(a.id);
                      setFocusKey("confirm");
                    }}
                  >
                    {roster ? "Remove collaborator" : "Revoke access"}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </FocusScope>
      <DemoStatus>{status}</DemoStatus>
    </div>
  );
}

function SharingPills() {
  const schedule = useTimers();
  const [asking, setAsking] = useState<string | null>("ws_7f3a9c21e4b0");
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [gone, setGone] = useState<string[]>([]);
  const ids = ["ws_7f3a9c21e4b0", "ws_c40e19aa", "ws_e5d7b302"];
  return (
    <FocusScope>
      <ul className="divide-y divide-hair-soft rounded-[12px] border border-hair-soft bg-[#0f0f11]">
        {ids.map((id) => {
          const space = SPACES.find((s) => s.id === id)!;
          const removed = gone.includes(id);
          return (
            <li key={id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3">
              <div className="min-w-0">
                <p className="font-mono text-[12px] text-ink">{short(id)}</p>
                <p className="text-[11.5px] text-ink-faint">
                  {space.name} · {removed ? "revoked" : "can read and write"}
                </p>
              </div>
              {removed ? (
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">Revoked</span>
              ) : asking === id ? (
                <InlineConfirm
                  variant="pill"
                  question={`revoke ${short(id)}?`}
                  confirmLabel="Confirm"
                  busy={busy === id}
                  autoFocus={focusKey === "confirm"}
                  onCancel={() => {
                    setAsking(null);
                    setFocusKey(`trigger:${id}`);
                  }}
                  onConfirm={() => {
                    setBusy(id);
                    schedule(() => {
                      setBusy(null);
                      setAsking(null);
                      setGone((g) => [...g, id]);
                    }, 800);
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAsking(id);
                    setFocusKey("confirm");
                  }}
                  disabled={busy !== null}
                  autoFocus={focusKey === `trigger:${id}`}
                  aria-label={`Revoke ${space.name}`}
                  className="inline-flex h-6 items-center rounded-full! border border-hair-strong px-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-dim transition-colors hover:border-red/50 hover:text-[#ff8a80] disabled:opacity-50"
                >
                  Revoke
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </FocusScope>
  );
}

type Scenario = "checking" | "unverified" | "blocked" | "ready" | "failed";

function RemovalFlow() {
  const id = useId();
  const schedule = useTimers();
  const [scenario, setScenario] = useState<Scenario>("blocked");
  const [revoked, setRevoked] = useState(false);
  const [asking, setAsking] = useState(false);
  const [focusKey, setFocusKey] = useState<"confirm" | "trigger" | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [value, setValue] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [removed, setRemoved] = useState(false);

  const choose = (s: Scenario) => {
    setScenario(s);
    setFocusKey(null);
    setRevoked(s === "ready" || s === "failed");
    setAsking(false);
    setValue("");
    setRemoved(false);
  };

  const access: AccessReview =
    scenario === "checking"
      ? { status: "checking" }
      : scenario === "unverified"
        ? { status: "unverified" }
        : {
            status: "checked",
            members: [{ id: "kenji", name: "Kenji Sato", ref: short("ws_7f3a9c21e4b0"), role: "Collaborator", revoked }],
            blockers: revoked ? [] : ["Kenji Sato still has access through a shared space. Revoke access before removing this project."],
          };
  const blocked = access.status !== "checked" || access.blockers.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Access review</span>
        <div className="scroll-thin max-w-full overflow-x-auto">
          <Segmented<Scenario>
            aria-label="Access review state"
            size="sm"
            value={scenario}
            onChange={choose}
            options={[
              { value: "checking", label: "Checking" },
              { value: "unverified", label: "Not verified" },
              { value: "blocked", label: "Blocked" },
              { value: "ready", label: "Checked" },
              { value: "failed", label: "Failed" },
            ]}
            className="w-max max-w-none!"
          />
        </div>
      </div>
      {removed ? (
        <ModalNotice tone="success" title="billing-api removed from this space">
          Demo only: nothing was deleted. Remote repositories and backups remain.
          <div className="mt-2">
            <Button size="sm" variant="secondary" leadingIcon={<RotateCcw />} onClick={() => choose("blocked")}>
              Restore demo
            </Button>
          </div>
        </ModalNotice>
      ) : (
        <FocusScope>
          <RemovalPanel
            titleId={`${id}-title`}
            title="Remove project"
            subject="billing-api"
            description="Delete this project folder and all its files from this space. Remote repositories and backups remain."
            access={access}
            error={scenario === "failed" ? "Removal could not be confirmed. Refresh the project list before retrying." : undefined}
            renderMemberAction={(m) =>
              m.revoked ? null : asking ? (
                <InlineConfirm
                  question="Revoke access for this user?"
                  confirmLabel="Confirm revoke"
                  busy={revoking}
                  autoFocus={focusKey === "confirm"}
                  onCancel={() => {
                    setAsking(false);
                    setFocusKey("trigger");
                  }}
                  onConfirm={() => {
                    setRevoking(true);
                    schedule(() => {
                      setRevoking(false);
                      setAsking(false);
                      setRevoked(true);
                    }, 900);
                  }}
                />
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  leadingIcon={<UserMinus />}
                  autoFocus={focusKey === "trigger"}
                  onClick={() => {
                    setAsking(true);
                    setFocusKey("confirm");
                  }}
                >
                  Revoke access
                </Button>
              )
            }
          >
            <TypeToConfirm
              id={`${id}-confirm`}
              name="billing-api"
              value={value}
              onValueChange={setValue}
              confirmLabel="Delete local project"
              busy={deleting}
              blocked={blocked}
              onConfirm={() => {
                setDeleting(true);
                schedule(() => {
                  setDeleting(false);
                  setRemoved(true);
                }, 1200);
              }}
              secondary={
                <Button
                  size="sm"
                  variant="secondary"
                  leadingIcon={<RefreshCw />}
                  disabled={deleting || scenario === "checking"}
                  onClick={() => {
                    const next: Scenario = revoked ? "ready" : "blocked";
                    setFocusKey(null);
                    setScenario("checking");
                    schedule(() => setScenario(next), 900);
                  }}
                >
                  Check access again
                </Button>
              }
            />
          </RemovalPanel>
        </FocusScope>
      )}
    </div>
  );
}

function DangerZoneDemo({ viewer }: { viewer: "owner" | "member" }) {
  const [asking, setAsking] = useState<null | "org" | "space">(null);
  const [status, setStatus] = useState("");
  const owner = viewer === "owner";
  return (
    <div className="flex flex-col gap-3">
      <DangerZone>
        {owner ? (
          <>
            <DangerZoneRow
              title="Delete space"
              description={`Stops ${OPS.name} and removes its hosted files. Local copies stay where they are.`}
              action={
                <Button variant="danger" size="sm" leadingIcon={<Trash2 />} onClick={() => setAsking("space")}>
                  Delete space
                </Button>
              }
            />
            <DangerZoneRow
              title="Delete organization"
              description="Deleting removes Acme Robotics and its spaces. Remove everyone else first."
              action={
                <Button variant="danger" size="sm" onClick={() => setAsking("org")}>
                  Delete organization
                </Button>
              }
            />
          </>
        ) : (
          <DangerZoneRow
            title="Leave organization"
            description="Leaving removes your space in Northwind Studio. Your local spaces keep working."
            action={
              <Button variant="danger" size="sm" leadingIcon={<UserMinus />} onClick={() => setAsking("org")}>
                Leave organization
              </Button>
            }
          />
        )}
      </DangerZone>
      <DemoStatus>{status}</DemoStatus>
      <ConfirmDialog
        open={asking !== null}
        onCancel={() => setAsking(null)}
        title={asking === "space" ? "Delete space" : owner ? "Delete organization" : "Leave organization"}
        description={
          asking === "space"
            ? `Delete ${OPS.name}? This cannot be undone.`
            : owner
              ? "Delete Acme Robotics? Its spaces stop and cannot be restored."
              : "Leave Northwind Studio? Your space in this organization is removed."
        }
        confirmLabel={asking === "space" ? "Delete space" : owner ? "Delete organization" : "Leave organization"}
        state={asking === "org" && owner ? "blocked" : "idle"}
        blockedReason="Remove the other 4 members first."
        onConfirm={() => {
          setAsking(null);
          setStatus("Demo only: nothing was changed.");
        }}
      />
    </div>
  );
}

/* ----------------------------------------------------------------------------- demo */

export function ConfirmDemo() {
  return (
    <div className="flex flex-col gap-10">
      <DemoSection title="Alert dialog">
        <div className="grid gap-5 lg:grid-cols-3">
          <Example caption="Variant · alert dialog">
            <Stage minHeight={260} innerClassName="sm:p-4!">
              <Reopenable label="Delete space">{(close) => <StaticConfirm space={OPS} onDone={close} />}</Reopenable>
            </Stage>
          </Example>
          <Example caption="State · checking">
            <Stage minHeight={260} innerClassName="sm:p-4!">
              <ConfirmPanel
                titleAs="h3"
                title="Delete space"
                description={`Delete ${OPS.name}? This cannot be undone.`}
                confirmLabel="Delete space"
                state="checking"
              />
            </Stage>
          </Example>
          <Example caption="State · blocked" note={`${PILOT.name} is Starting`}>
            <Stage minHeight={260} innerClassName="sm:p-4!">
              <Reopenable label="Delete space">{(close) => <StaticConfirm space={PILOT} onDone={close} />}</Reopenable>
            </Stage>
          </Example>
        </div>
        <Example caption="Live · confirm or cancel" note="Escape cancels; the backdrop does not" className="mt-5">
          <SpaceList />
        </Example>
      </DemoSection>

      <DemoSection title="Inline confirm">
        <div className="grid gap-5 lg:grid-cols-2">
          <Example caption="Variant · inline confirm, row" note="Right-aligned on wide screens">
            <AccessList />
          </Example>
          <Example caption="Variant · inline confirm, pills" note="Sharing members">
            <SharingPills />
          </Example>
        </div>
      </DemoSection>

      <DemoSection title="Type name · access review">
        <Example caption="Variant · type name" note="Pick an access state, then type billing-api">
          <RemovalFlow />
        </Example>
      </DemoSection>

      <DemoSection title="Danger zone panel">
        <div className="grid gap-5 lg:grid-cols-2">
          <Example caption="Variant · danger zone, owner">
            <DangerZoneDemo viewer="owner" />
          </Example>
          <Example caption="Variant · danger zone, member">
            <DangerZoneDemo viewer="member" />
          </Example>
        </div>
      </DemoSection>
    </div>
  );
}
