// SettingsPanel: a dialog with a side nav (organization settings). The nav is a column
// beside the content when the panel is wide and becomes a row of top tabs when it is
// narrow (a container query, so it adapts inside any column). MemberRow and SettingsGroup
// build the Members section. Hook-free.
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Count } from "@/components/ui/badge";

export type SettingsNavItem = {
  id: string;
  label: string;
  icon: ReactNode;
  /** Pending count shown at the end of the nav row. */
  count?: number;
  danger?: boolean;
};

export type SettingsPanelProps = {
  heading: string;
  subheading?: string;
  sections: SettingsNavItem[];
  active: string;
  onSectionChange?: (id: string) => void;
  children: ReactNode;
  titleId?: string;
  titleAs?: "h2" | "h3";
  onClose?: () => void;
  /** Lock the nav while an action runs. */
  locked?: boolean;
  className?: string;
};

/** Settings dialog surface: nav (side or top) plus a scrolling section. */
export function SettingsPanel({
  heading,
  subheading = "Settings",
  sections,
  active,
  onSectionChange,
  children,
  titleId,
  titleAs: Title = "h2",
  onClose,
  locked = false,
  className,
}: SettingsPanelProps) {
  return (
    <div
      className={cn(
        "@container relative flex h-[min(560px,calc(100dvh-32px))] w-[min(820px,100%)] min-w-0 max-w-full overflow-hidden rounded-[16px] border border-hair-strong bg-[#0f0f11] text-ink",
        "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.75)]",
        className,
      )}
    >
      <div className="flex min-h-0 w-full flex-col @[620px]:flex-row">
        <nav
          aria-label={`${heading} settings`}
          className="flex shrink-0 flex-col gap-3 border-b border-hair-soft bg-white/[0.02] p-3 @[620px]:w-52 @[620px]:border-b-0 @[620px]:border-r"
        >
          <div className="min-w-0 px-2 pt-1 pr-10 @[620px]:pr-2">
            <Title id={titleId} className="truncate text-[15px] font-semibold tracking-[-0.01em]">
              {heading}
            </Title>
            <p className="text-[12px] text-ink-faint">{subheading}</p>
          </div>
          <ul className="scroll-thin flex gap-1 overflow-x-auto @[620px]:flex-col @[620px]:overflow-visible">
            {sections.map((s) => {
              const current = s.id === active;
              return (
                <li key={s.id} className="shrink-0">
                  <button
                    type="button"
                    aria-current={current ? "true" : undefined}
                    disabled={locked && !current}
                    onClick={() => onSectionChange?.(s.id)}
                    className={cn(
                      "flex w-full items-center gap-2 whitespace-nowrap rounded-[8px]! px-2.5 py-1.5 text-[13px] transition-colors [&_svg]:size-4",
                      "disabled:opacity-50",
                      current ? "bg-white/[0.08] font-medium text-ink" : "text-ink-dim hover:bg-white/[0.05] hover:text-ink",
                      s.danger && (current ? "text-[#ff8a80]" : "text-[#ff8a80]/80 hover:text-[#ff8a80]"),
                    )}
                  >
                    <span aria-hidden="true" className="inline-flex">
                      {s.icon}
                    </span>
                    {s.label}
                    {s.count ? <Count value={s.count} tone="ink" label="pending" className="ml-auto" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="scroll-thin min-h-0 min-w-0 flex-1 overflow-y-auto p-4 @[620px]:p-6">{children}</div>
      </div>
      {onClose ? (
        <IconButton aria-label="Close settings" size="sm" onClick={onClose} className="absolute right-3 top-3">
          <X />
        </IconButton>
      ) : null}
    </div>
  );
}

/** Titled block inside a settings section. */
export function SettingsGroup({
  title,
  titleAs: Title = "h3",
  description,
  children,
  className,
}: {
  title: ReactNode;
  /** One level under the dialog title: h3 under an h2, h4 under an h3. */
  titleAs?: "h3" | "h4";
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div>
        <Title className="text-[13.5px] font-semibold text-ink">{title}</Title>
        {description ? <p className="mt-0.5 text-[12px] leading-relaxed text-ink-dim">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export type MemberRowProps = {
  name: string;
  email: string;
  /** "Owner", "Collaborator", "Request pending". */
  role?: string;
  self?: boolean;
  /** Optional note from a join request. */
  message?: string;
  actions?: ReactNode;
  className?: string;
};

/** Person row: avatar, name, email and role, actions on the right (wrapping under on narrow). */
export function MemberRow({ name, email, role, self, message, actions, className }: MemberRowProps) {
  return (
    <li className={cn("flex flex-wrap items-center gap-3 rounded-[10px] border border-hair-soft bg-white/[0.02] p-3", className)}>
      <Avatar name={name} size="md" decorative />
      <div className="min-w-0 flex-1 basis-[160px]">
        <p className="truncate text-[13px] font-medium text-ink">
          {name}
          {self ? <span className="font-normal text-ink-faint"> (you)</span> : null}
        </p>
        <p className="flex flex-wrap gap-x-1 text-[12px] text-ink-faint">
          <span className="min-w-0 [overflow-wrap:anywhere]">{email}</span>
          {role ? <span className="whitespace-nowrap">· {role}</span> : null}
        </p>
        {message ? <p className="mt-1 text-[12px] italic text-ink-dim">&ldquo;{message}&rdquo;</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </li>
  );
}
