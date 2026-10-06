"use client";

// Share and access: InlineShareForm (Space ID, Share, Cancel; validation, Sharing…, the
// success line, and Share stays off for an ID already shared), ShareComposer (two steps:
// pick a project, then a recipient), PeopleAccessList (people with role, Revoke, and
// Approve or Deny for requests; loading and empty states), SharedProjectDetail (commits
// fetched from origin with Apply and the equivalent git command; skeleton and flash ring)
// and ShareDialog (a native modal dialog: Esc closes it and focus returns to the trigger).
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Check, CircleAlert, FolderGit2, GitBranch, GitCommitHorizontal, Link2, Share2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton, CopyField } from "@/components/ui/copy-button";
import { Skeleton } from "@/components/ui/loaders";
import { StateChip } from "@/components/ui/status";
import { pluralize } from "@/lib/format";
import { useTimers } from "./_timers";
import { FormStyles } from "./_styles";

const SPACE_ID = /^\S{1,100}$/;
const SPACE_ID_ERROR = "Enter a Space ID without spaces (up to 100 characters).";

const idInput =
  "h-[38px] w-full min-w-0 rounded-[8px]! border border-hair bg-black/60 px-3 font-mono text-[12.5px] text-ink placeholder:text-ink-faint " +
  "transition-colors hover:border-hair-strong focus:border-white/30 aria-invalid:border-red/60 disabled:opacity-50";

/* ============================================================================ InlineShareForm */

export type InlineShareFormProps = {
  projectName: string;
  onShare?: (spaceId: string) => void;
  onCancel?: () => void;
  defaultValue?: string;
  /** Show the validation error for defaultValue right away. */
  validateOnMount?: boolean;
  /** Hold the Sharing… look. */
  sharing?: boolean;
  /** Start in the shared state, as right after sharing with this Space ID. */
  defaultSharedWith?: string | null;
  delayMs?: number;
  /** Top hairline that separates it from the manage card above. */
  separator?: boolean;
  className?: string;
};

/** "Space ID [ws_…] [Share] [Cancel]" inside a project's manage card. */
export function InlineShareForm({
  projectName,
  onShare,
  onCancel,
  defaultValue = "",
  validateOnMount = false,
  sharing: forceSharing = false,
  defaultSharedWith = null,
  delayMs = 900,
  separator = true,
  className,
}: InlineShareFormProps) {
  const uid = useId();
  const later = useTimers();
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(() => (validateOnMount && !SPACE_ID.test(defaultValue.trim()) ? SPACE_ID_ERROR : null));
  const [busy, setBusy] = useState(false);
  const [sharedWith, setSharedWith] = useState<string | null>(defaultSharedWith);
  const sharing = busy || forceSharing;
  const sameAsShared = sharedWith !== null && value.trim() === sharedWith;

  function submit(e: FormEvent) {
    e.preventDefault();
    const id = value.trim();
    if (!SPACE_ID.test(id)) {
      setError(SPACE_ID_ERROR);
      return;
    }
    setError(null);
    setBusy(true);
    later(() => {
      setBusy(false);
      setSharedWith(id);
      onShare?.(id);
    }, delayMs);
  }

  return (
    <form noValidate onSubmit={submit} aria-busy={sharing || undefined} className={cn("flex max-w-[640px] flex-col gap-2", separator && "border-t border-hair-soft pt-3.5", className)}>
      <label htmlFor={`${uid}-id`} className="text-[12px] font-medium text-ink-dim">
        Share {projectName} with a space
      </label>
      <div className="flex flex-wrap gap-2">
        <div className="min-w-0 flex-1 basis-[220px]">
          <input
            id={`${uid}-id`}
            className={idInput}
            placeholder="Space ID, such as ws_7f3a9c21e4b0"
            autoComplete="off"
            spellCheck={false}
            value={value}
            disabled={sharing}
            aria-invalid={error ? true : undefined}
            aria-describedby={`${uid}-msg`}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
          />
        </div>
        <Button type="submit" variant="primary" size="sm" className="h-[38px]" disabled={!value.trim() || sameAsShared} loading={sharing} loadingLabel="Sharing…">
          Share
        </Button>
        <Button
          variant="subtle"
          size="sm"
          className="h-[38px]"
          disabled={sharing}
          onClick={() => {
            setValue("");
            setError(null);
            onCancel?.();
          }}
        >
          Cancel
        </Button>
      </div>
      <p id={`${uid}-msg`} role={error ? "alert" : "status"} className={cn("min-h-[18px] text-[12px]", error ? "text-[#ff7a70]" : sharedWith ? "text-grn" : "text-ink-faint")}>
        {error ? (
          <span className="inline-flex items-center gap-1.5">
            <CircleAlert aria-hidden="true" className="size-3.5" />
            {error}
          </span>
        ) : sharedWith ? (
          <span className="inline-flex items-center gap-1.5">
            <Check aria-hidden="true" className="size-3.5" />
            <span>
              Shared with <span className="font-mono">{sharedWith}</span>.
            </span>
          </span>
        ) : sharing ? (
          "Sharing…"
        ) : (
          "Find the Space ID in the other space's settings."
        )}
      </p>
    </form>
  );
}

/* ============================================================================ ShareComposer */

export type ShareableProject = { id: string; name: string; slug: string; sharedWith: number; color?: string };

export type ShareComposerProps = {
  projects: ShareableProject[];
  onShare?: (projectId: string, spaceId: string) => void;
  delayMs?: number;
  className?: string;
};

/** Two steps: pick a project, then the recipient space. */
export function ShareComposer({ projects, onShare, delayMs = 900, className }: ShareComposerProps) {
  const uid = useId();
  const later = useTimers();
  const [q, setQ] = useState("");
  const [pick, setPick] = useState<string | null>(null);
  const [recipient, setRecipient] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const query = q.trim().toLowerCase();
  const shown = projects.filter((p) => !query || p.name.toLowerCase().includes(query) || p.slug.includes(query));
  const picked = projects.find((p) => p.id === pick) ?? null;

  return (
    <form
      noValidate
      aria-labelledby={`${uid}-t`}
      aria-busy={busy || undefined}
      className={cn("flex flex-col gap-4 rounded-[12px] border border-hair-strong bg-s3 p-4 sm:p-5", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (!picked) return;
        const id = recipient.trim();
        if (!SPACE_ID.test(id)) return setError(SPACE_ID_ERROR);
        setError(null);
        setBusy(true);
        later(() => {
          setBusy(false);
          setDone(`${picked.name} is shared with ${id}.`);
          onShare?.(picked.id, id);
        }, delayMs);
      }}
    >
      <FormStyles />
      <h4 id={`${uid}-t`} className="text-[14px] font-semibold text-ink">
        Share a project
      </h4>
      <fieldset className="@container flex min-w-0 flex-col gap-2.5">
        <legend className="mb-2.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">1 · Project</legend>
        <input
          type="text"
          aria-label="Filter projects"
          placeholder="Filter projects…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && q) {
              e.preventDefault();
              setQ("");
            }
          }}
          className="h-8 w-full max-w-[260px] rounded-full! border border-hair bg-s1 px-3.5 text-[12.5px] text-ink placeholder:text-ink-faint transition-colors focus:border-white/30"
        />
        {shown.length === 0 ? (
          <p className="rounded-[9px] border border-dashed border-hair-strong px-3 py-3 text-[12.5px] text-ink-dim">No project matches &ldquo;{q.trim()}&rdquo;.</p>
        ) : (
          <div
            className="scroll-thin grid max-h-[208px] gap-1.5 overflow-y-auto pb-4 @lg:grid-cols-2"
            // A soft fade at the bottom says the list scrolls when it holds more than fits.
            style={shown.length > 3 ? { maskImage: "linear-gradient(to bottom, #000 calc(100% - 22px), transparent)" } : undefined}
          >
            {shown.map((p) => {
              const on = pick === p.id;
              return (
                <label
                  key={p.id}
                  className={cn(
                    "fi-ring-any flex cursor-pointer items-center gap-2.5 rounded-[9px] border bg-black px-3 py-2 transition-colors",
                    on ? "border-white/45" : "border-hair hover:border-hair-strong",
                  )}
                >
                  <input type="radio" name={`${uid}-pick`} value={p.id} checked={on} onChange={() => setPick(p.id)} className="sr-only" />
                  <span aria-hidden="true" className={cn("inline-flex size-3.5 shrink-0 items-center justify-center rounded-full border", on ? "border-ink shadow-[0_0_0_3px_rgba(244,243,240,0.14)]" : "border-hair-strong")}>
                    {on ? <span className="size-1.5 rounded-full bg-ink" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] text-ink">{p.name}</span>
                    <span className="block truncate font-mono text-[11px] text-ink-faint">{p.slug}</span>
                  </span>
                  {p.sharedWith > 0 ? <Badge size="xs">shared with {p.sharedWith}</Badge> : null}
                </label>
              );
            })}
          </div>
        )}
      </fieldset>
      <div className="flex min-w-0 flex-col gap-2.5">
        <label htmlFor={`${uid}-to`} className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">
          2 · Recipient
        </label>
        <div className="flex flex-wrap gap-2">
          <div className="min-w-0 flex-1 basis-[200px]">
            <input
              id={`${uid}-to`}
              className={idInput}
              placeholder="Recipient Space ID"
              autoComplete="off"
              spellCheck={false}
              value={recipient}
              disabled={busy}
              aria-invalid={error ? true : undefined}
              onChange={(e) => {
                setRecipient(e.target.value);
                setDone(null);
              }}
            />
          </div>
          <Button type="submit" variant="primary" size="sm" className="h-[38px]" disabled={!picked || !recipient.trim()} loading={busy} loadingLabel="Sharing…">
            {picked ? `Share ${picked.name}` : "Share"}
          </Button>
        </div>
        <p role={error ? "alert" : "status"} className={cn("text-[12px]", error ? "text-[#ff7a70]" : done ? "text-grn" : "text-ink-faint")}>
          {error ?? done ?? (picked ? "Members of that space can open it and pull new commits." : "Pick a project first.")}
        </p>
      </div>
    </form>
  );
}

/* ============================================================================ PeopleAccessList */

export type AccessPerson = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "collaborator";
  state: "active" | "pending";
  you?: boolean;
  /** "Last active 4m ago", "Requested 5h ago". */
  meta?: string;
};

export type PeopleAccessListProps = {
  people: AccessPerson[];
  onRevoke?: (id: string) => void;
  onApprove?: (id: string) => void;
  onDeny?: (id: string) => void;
  loading?: boolean;
  emptyMessage?: ReactNode;
  className?: string;
};

/** Who has access: role, Revoke, and Approve or Deny for join requests. */
export function PeopleAccessList({ people, onRevoke, onApprove, onDeny, loading = false, emptyMessage = "No people have access yet.", className }: PeopleAccessListProps) {
  const later = useTimers();
  const [working, setWorking] = useState<{ id: string; verb: string } | null>(null);
  const [gone, setGone] = useState<string[]>([]);
  const [approved, setApproved] = useState<string[]>([]);

  if (loading) {
    return (
      <ul aria-busy="true" aria-label="Loading people" className={cn("flex flex-col gap-2", className)}>
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-center gap-3 rounded-[10px] border border-hair-soft p-3">
            <Skeleton width={32} height={32} radius={999} />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton width={110} height={10} />
              <Skeleton width={160} height={8} />
            </div>
            <Skeleton width={64} height={26} radius={8} />
          </li>
        ))}
      </ul>
    );
  }

  const list = people.filter((p) => !gone.includes(p.id));
  if (list.length === 0) {
    return <p className={cn("rounded-[10px] border border-dashed border-hair-strong px-4 py-6 text-center text-[12.5px] text-ink-dim", className)}>{emptyMessage}</p>;
  }

  function act(id: string, verb: string, done: () => void) {
    setWorking({ id, verb });
    later(() => {
      setWorking(null);
      done();
    }, 800);
  }

  return (
    <ul aria-label="People with access" className={cn("flex flex-col gap-2", className)}>
      {list.map((p) => {
        const isWorking = working?.id === p.id;
        const pending = p.state === "pending" && !approved.includes(p.id);
        return (
          <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-[10px] border border-hair p-3 transition-colors hover:bg-white/[0.025]">
            <Avatar name={p.name} size="md" decorative />
            <div className="min-w-0 flex-1 basis-[150px]">
              <p className="flex flex-wrap items-center gap-x-1.5 text-[13px] text-ink">
                <span className="truncate font-medium">{p.name}</span>
                {p.you ? <span className="text-ink-faint">(you)</span> : null}
              </p>
              <p className="truncate font-mono text-[11.5px] text-ink-dim">{p.email}</p>
              {p.meta ? <p className="text-[11px] text-ink-faint">{p.meta}</p> : null}
            </div>
            {pending ? (
              <>
                <StateChip kind="membership" state="request_pending" />
                <div className="flex gap-1.5">
                  <Button size="sm" variant="secondary" disabled={isWorking} loading={isWorking && working?.verb === "approve"} loadingLabel="Approving…" onClick={() => act(p.id, "approve", () => { setApproved((a) => [...a, p.id]); onApprove?.(p.id); })}>
                    Approve
                  </Button>
                  <Button size="sm" variant="subtle" disabled={isWorking} loading={isWorking && working?.verb === "deny"} loadingLabel="Denying…" onClick={() => act(p.id, "deny", () => { setGone((g) => [...g, p.id]); onDeny?.(p.id); })}>
                    Deny
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Badge tone={p.role === "owner" ? "neutral" : "grn"} size="md">
                  {p.role === "owner" ? "Owner" : "Collaborator"}
                </Badge>
                {p.role !== "owner" ? (
                  <Button
                    size="sm"
                    variant="danger"
                    loading={isWorking}
                    loadingLabel="Revoking…"
                    onClick={() =>
                      act(p.id, "revoke", () => {
                        setGone((g) => [...g, p.id]);
                        onRevoke?.(p.id);
                      })
                    }
                  >
                    Revoke
                  </Button>
                ) : null}
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ============================================================================ SharedProjectDetail */

export type FetchedCommit = { hash: string; message: string; author: string; ago: string };

export type SharedProjectDetailProps = {
  name: string;
  repo: string;
  branch: string;
  sharedWith: number;
  checked: string;
  commits: FetchedCommit[];
  /** Local checkout path, for the equivalent git command. */
  localPath: string;
  /** Members line, or a note such as "not shared yet: share it below". */
  members?: ReactNode;
  loading?: boolean;
  /** Ring that fades after 1.6 s, when opened from Inbox. */
  flash?: boolean;
  onApply?: () => void;
  onOpenInList?: () => void;
  className?: string;
};

/** A shared project: what changed upstream, one click to apply it, and the git command it runs. */
export function SharedProjectDetail({
  name,
  repo,
  branch,
  sharedWith,
  checked,
  commits,
  localPath,
  members,
  loading = false,
  flash = false,
  onApply,
  onOpenInList,
  className,
}: SharedProjectDetailProps) {
  const later = useTimers();
  const [phase, setPhase] = useState<"pending" | "applying" | "applied">(commits.length ? "pending" : "applied");
  const [ring, setRing] = useState(flash);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setRing(false), 1600);
    return () => clearTimeout(t);
  }, [flash]);

  if (loading) {
    return (
      <div aria-busy="true" aria-label="Loading project" className={cn("flex flex-col gap-3.5 rounded-[12px] border border-hair-soft bg-s2 px-5 py-[18px]", className)}>
        <Skeleton width={160} height={14} />
        <Skeleton width={260} height={10} />
        <div className="flex gap-2">
          <Skeleton width={64} height={20} radius={6} />
          <Skeleton width={92} height={20} radius={6} />
        </div>
        <Skeleton lines={3} height={10} />
      </div>
    );
  }

  const command = `git -C ${localPath} merge --ff-only origin/${branch}`;

  return (
    <section
      aria-label={`${name} sharing`}
      className={cn(
        "flex min-w-0 flex-col gap-3.5 rounded-[12px] border border-hair-soft bg-s2 px-5 py-[18px] transition-shadow duration-700",
        ring ? "shadow-[0_0_0_2px_var(--blu)]" : "shadow-[0_0_0_0_transparent]",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <FolderGit2 aria-hidden="true" className="size-4 text-ink-dim" />
            {name}
          </h4>
          <p className="mt-0.5 truncate font-mono text-[11.5px] text-ink-dim">{repo}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge size="sm" icon={<GitBranch />} className="font-mono">
              {branch}
            </Badge>
            <Badge size="sm" tone="blu">
              shared with {sharedWith}
            </Badge>
            <span className="text-[11.5px] text-ink-faint">checked {checked}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="primary"
            disabled={phase !== "pending"}
            loading={phase === "applying"}
            loadingLabel="Applying…"
            onClick={() => {
              setPhase("applying");
              later(() => {
                setPhase("applied");
                onApply?.();
              }, 1100);
            }}
          >
            {phase === "applied" ? "Up to date" : `Apply ${pluralize(commits.length, "commit")}`}
          </Button>
          <Button size="sm" variant="secondary" onClick={onOpenInList}>
            Open in list
          </Button>
        </div>
      </div>
      {members ? <p className="text-[12px] text-ink-dim">{members}</p> : null}
      {phase === "applied" ? (
        <p role="status" className="flex items-center gap-1.5 rounded-[10px] border border-grn/25 bg-grn/[0.05] px-3 py-2.5 text-[12.5px] text-ink">
          <Check aria-hidden="true" className="size-3.5 text-grn" />
          {commits.length ? `Applied ${pluralize(commits.length, "commit")}. Your copy matches origin/${branch}.` : `Your copy matches origin/${branch}.`}
        </p>
      ) : (
        <>
          <p className="text-[12.5px] text-ink-dim">
            <span className="text-ink">
              {pluralize(commits.length, "new commit")} fetched from origin/{branch}:
            </span>{" "}
            They are not in your local copy yet.
          </p>
          <ul className="flex flex-col divide-y divide-hair-soft rounded-[10px] border border-hair-soft">
            {commits.map((c) => (
              <li key={c.hash} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5">
                <GitCommitHorizontal aria-hidden="true" className="size-3.5 shrink-0 text-ink-faint" />
                <code className="font-mono text-[11.5px] text-blu">{c.hash}</code>
                <span className="min-w-0 flex-1 basis-[180px] truncate text-[12.5px] text-ink">{c.message}</span>
                <Badge size="xs" tone="blu">
                  new
                </Badge>
                <span className="w-full pl-[26px] text-[11.5px] text-ink-faint sm:w-auto sm:pl-0">
                  {c.author} · {c.ago}
                </span>
              </li>
            ))}
          </ul>
          <CopyField value={command} prompt="$" label="Apply command" />
        </>
      )}
    </section>
  );
}

/* ============================================================================ InviteLink */

export type InviteLinkProps = {
  /** The invite URL to copy. Fixture or placeholder links only. */
  url: string;
  /** Who it is for and how long it lasts: "Joins ops-copilot as a collaborator · expires in 7 days". */
  note?: ReactNode;
  className?: string;
};

/** "Copy invite": a link people can open to ask for access, with a one-click copy. */
export function InviteLink({ url, note, className }: InviteLinkProps) {
  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 rounded-[10px] border border-dashed border-hair-strong px-3 py-2.5", className)}>
      <Link2 aria-hidden="true" className="size-4 shrink-0 text-ink-faint" />
      <div className="min-w-0 flex-1 basis-[180px]">
        <p className="truncate font-mono text-[12px] text-ink" title={url}>
          {url}
        </p>
        {note ? <p className="text-[11.5px] text-ink-faint">{note}</p> : null}
      </div>
      <CopyButton text={url} variant="labelled" size="sm" label="Copy invite" copiedLabel="Invite copied" aria-label="Copy invite link" announce="Invite link copied" />
    </div>
  );
}

/* ============================================================================ ShareDialog */

export type ShareDialogProps = {
  /** Trigger label: "Share ops-copilot". */
  triggerLabel: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Native modal dialog. Esc and the close button dismiss it; focus returns to the trigger. */
export function ShareDialog({ triggerLabel, title, description, children, className }: ShareDialogProps) {
  const uid = useId();
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        leadingIcon={<Share2 aria-hidden="true" />}
        aria-haspopup="dialog"
        onClick={(e) => {
          opener.current = e.currentTarget;
          ref.current?.showModal();
        }}
        className={className}
      >
        {triggerLabel}
      </Button>
      <dialog
        ref={ref}
        aria-labelledby={`${uid}-t`}
        onClose={() => opener.current?.focus()}
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
        className="m-auto w-[min(520px,calc(100vw-32px))] max-w-none rounded-[18px] border border-hair-strong bg-s2 p-0 text-ink shadow-[0_24px_64px_rgba(0,0,0,0.7)] backdrop:bg-black/60"
      >
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h3 id={`${uid}-t`} className="text-[16px] font-semibold text-ink">
                {title}
              </h3>
              {description ? <p className="mt-1 text-[12.5px] text-ink-dim">{description}</p> : null}
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => ref.current?.close()}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-[8px]! text-ink-dim transition-colors hover:bg-s3 hover:text-ink"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
          {children}
        </div>
      </dialog>
    </>
  );
}
