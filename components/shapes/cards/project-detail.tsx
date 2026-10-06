// Project detail header: identity (folder tile, title, badge, description), Owner, Shared
// with and Created tiles, and a manifest list. Pane and phone block layouts; loading, gone
// and error states. Share opens a panel the parent renders. Server-safe.
import type { ReactNode } from "react";
import { CircleAlert, FolderOpen, FolderX, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loaders";

export type ProjectDetailState = "ready" | "loading" | "gone" | "error";

export type ProjectDetailHeaderProps = {
  name: string;
  badge?: string;
  description?: string;
  ownerName: string | null;
  /** People with access besides the owner; null when the access list could not be read (reads Unavailable). */
  sharedWith: string[] | null;
  /** "Created 25d ago" value: "25d ago". */
  created: string;
  manifest: { term: string; value: ReactNode }[];
  variant?: "pane" | "phone";
  state?: ProjectDetailState;
  errorMessage?: string;
  /** Only owners can share; shared users see a read-only header. */
  canShare?: boolean;
  shareOpen?: boolean;
  onShare?: () => void;
  /** Rendered under the header while shareOpen. */
  sharePanel?: ReactNode;
  shareButtonId?: string;
  onBack?: () => void;
  className?: string;
};

function Tile({ term, children, phone }: { term: string; children: ReactNode; phone: boolean }) {
  return (
    <div
      className={cn(
        "min-w-0",
        phone
          ? "flex items-center justify-between gap-3 border-b border-hair-soft py-2.5 last:border-b-0"
          : "flex items-center justify-between gap-3 rounded-[12px] border border-hair px-3 py-2.5 @xl:block @xl:rounded-[16px] @xl:p-3",
      )}
    >
      <dt className="shrink-0 truncate text-[12px] text-ink-dim">{term}</dt>
      <dd className={cn("flex min-w-0 items-center gap-2 text-[13px] text-ink", !phone && "@xl:mt-2 @xl:h-6")}>{children}</dd>
    </div>
  );
}

/** Header block for one project, in a pane or a phone layout. */
export function ProjectDetailHeader({
  name,
  badge,
  description,
  ownerName,
  sharedWith,
  created,
  manifest,
  variant = "pane",
  state = "ready",
  errorMessage,
  canShare = true,
  shareOpen = false,
  onShare,
  sharePanel,
  shareButtonId,
  onBack,
  className,
}: ProjectDetailHeaderProps) {
  const phone = variant === "phone";
  const loading = state === "loading";

  if (state === "gone") {
    return (
      <section className={cn("flex min-w-0 flex-col items-center gap-3 rounded-[14px] border border-dashed border-hair-strong bg-s1/70 p-8 text-center", className)}>
        <FolderX aria-hidden="true" className="size-7 text-ink-faint" />
        <h4 className="text-[15px] font-medium text-ink">This project is no longer here</h4>
        <p className="max-w-[40ch] text-[12.5px] leading-[1.55] text-ink-dim">
          The project {name} was removed from this space, or it is no longer shared with you.
        </p>
        {onBack ? (
          <Button size="sm" onClick={onBack}>
            Back to projects
          </Button>
        ) : null}
      </section>
    );
  }

  return (
    <section
      aria-busy={loading || undefined}
      aria-label={loading ? "Loading project" : `Project ${name}`}
      className={cn("@container flex min-w-0 flex-col gap-4 rounded-[14px] border border-hair bg-s1 text-ink", phone ? "p-4" : "p-4 sm:p-5", className)}
    >
      <header className={cn("flex items-start gap-3", phone && "flex-col")}>
        <span aria-hidden="true" className={cn("grid shrink-0 place-items-center rounded-[12px] bg-s3 text-ink-dim", phone ? "size-12" : "size-9")}>
          <FolderOpen className={phone ? "size-5" : "size-4"} />
        </span>
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="flex flex-col gap-2 pt-1">
              <Skeleton width={140} height={16} />
              <Skeleton width="70%" height={11} />
            </div>
          ) : (
            <>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h4 className={cn("truncate font-semibold", phone ? "text-[20px]" : "text-[16px]")}>{name}</h4>
                {badge ? <Badge size="xs">{badge}</Badge> : null}
              </div>
              {description ? <p className="mt-0.5 text-[12.5px] leading-[1.5] text-ink-dim">{description}</p> : null}
            </>
          )}
        </div>
        {canShare && !loading ? (
          <Button
            id={shareButtonId}
            size="sm"
            leadingIcon={<Users />}
            onClick={onShare}
            aria-expanded={shareOpen}
            className={cn(phone && "w-full", shareOpen && "border-blu/60! text-blu!")}
          >
            Share
          </Button>
        ) : null}
      </header>

      {shareOpen && sharePanel ? sharePanel : null}

      {state === "error" ? (
        <p role="alert" className="flex items-start gap-2 rounded-[12px] border border-red/40 bg-red/[0.06] p-3 text-[12px] text-[#ff7a70]">
          <CircleAlert aria-hidden="true" className="mt-px size-4 shrink-0" />
          {errorMessage ?? "Some project details could not be loaded."}
        </p>
      ) : null}

      <dl className={cn(phone ? "flex flex-col rounded-[12px] border border-hair px-3" : "grid grid-cols-1 gap-2 @xl:grid-cols-3 @xl:gap-3")}>
        <Tile term="Owner" phone={phone}>
          {loading ? (
            <Skeleton width={96} height={14} />
          ) : ownerName ? (
            <>
              <Avatar name={ownerName} size="xs" decorative />
              <span className="truncate">{ownerName}</span>
            </>
          ) : (
            <span className="text-ink-faint">No owner set</span>
          )}
        </Tile>
        <Tile term="Shared with" phone={phone}>
          {loading ? (
            <Skeleton width={64} height={22} radius={999} />
          ) : sharedWith === null ? (
            <span className="text-ink-faint">Unavailable</span>
          ) : sharedWith.length ? (
            <AvatarGroup names={sharedWith} size="xs" max={4} />
          ) : (
            <span className="text-ink-dim">Only the owner</span>
          )}
        </Tile>
        <Tile term="Created" phone={phone}>
          {loading ? <Skeleton width={70} height={14} /> : <span className="truncate font-mono text-[12px] tabular-nums">{created}</span>}
        </Tile>
      </dl>

      {manifest.length ? (
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Manifest</p>
          <dl className={cn("grid gap-x-6 gap-y-2 text-[12.5px]", phone ? "grid-cols-1" : "sm:grid-cols-2")}>
            {manifest.map((m) => (
              <div key={m.term} className="flex min-w-0 items-baseline justify-between gap-3 border-b border-hair-soft pb-2">
                <dt className="shrink-0 text-ink-faint">{m.term}</dt>
                <dd className="min-w-0 truncate text-right text-ink">{loading ? <Skeleton width={80} height={11} className="ml-auto" /> : m.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </section>
  );
}
