// Panels: Panel (glass for featured surfaces, soft panel for everything else, plus card,
// inset, outline and dashed) and PanelHeader (mono kicker, title, description, actions).
// Server-safe. Radii: glass 20, soft 18, card 14, inset 12, dashed 12.
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type PanelVariant = "glass" | "soft" | "card" | "inset" | "outline" | "dashed";
export type PanelPadding = "none" | "sm" | "md" | "lg";
export type PanelElement = "div" | "section" | "article" | "aside" | "header" | "footer" | "li" | "figure" | "form" | "nav";

const variantCls: Record<PanelVariant, string> = {
  /* gradient glass, radius 20, hair-strong border, 6px blur (the .glass utility) */
  glass: "glass",
  /* flat soft panel: the default container on the ground */
  soft: "rounded-[18px] border border-hair-soft bg-[#0f0f11]",
  /* app card on s2 with a hairline */
  card: "rounded-[14px] border border-hair bg-s2",
  /* sunken well inside another panel */
  inset: "rounded-[12px] border border-hair-soft bg-black/45",
  /* hairline only, no fill */
  outline: "rounded-[14px] border border-hair bg-transparent",
  /* empty states and drop targets */
  dashed: "rounded-[12px] border border-dashed border-hair-strong bg-s1/70",
};

const padCls: Record<PanelPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-7",
};

export type PanelProps = HTMLAttributes<HTMLElement> & {
  variant?: PanelVariant;
  padding?: PanelPadding;
  /** Element to render; pick the one that matches the content (section, article, li…). */
  as?: PanelElement;
};

/** Base container. Not a link: cards without destinations never look clickable. */
export function Panel({ variant = "soft", padding = "md", as: Tag = "div", className, children, ...rest }: PanelProps) {
  return (
    <Tag className={cn("relative min-w-0 text-ink", variantCls[variant], padCls[padding], className)} {...rest}>
      {children}
    </Tag>
  );
}

export type PanelHeaderProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  /** Mono uppercase line above the title ("CONNECTORS", "02 · MANAGE"). */
  kicker?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Buttons or chips on the right; they wrap under the title on narrow screens. */
  actions?: ReactNode;
  /** Leading icon tile or logo. */
  icon?: ReactNode;
  /** Heading level for the title. */
  titleAs?: "h2" | "h3" | "h4" | "p";
  /** Hairline under the header, for headers that sit on a panel edge. */
  divider?: boolean;
  /** Id for the title, so a Panel can use aria-labelledby. */
  titleId?: string;
};

/** Panel head: kicker, title, description and actions. */
export function PanelHeader({
  kicker,
  title,
  description,
  actions,
  icon,
  titleAs: Title = "h3",
  divider = false,
  titleId,
  className,
  ...rest
}: PanelHeaderProps) {
  return (
    <header
      className={cn("flex flex-wrap items-start justify-between gap-x-4 gap-y-3", divider && "border-b border-hair-soft pb-4", className)}
      {...rest}
    >
      <div className="flex min-w-0 flex-1 basis-[240px] items-start gap-3">
        {icon ? <div className="shrink-0">{icon}</div> : null}
        <div className="min-w-0">
          {kicker ? (
            <p className="mb-1.5 font-mono text-[10.5px] uppercase leading-none tracking-[0.18em] text-ink-faint">{kicker}</p>
          ) : null}
          <Title id={titleId} className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink">
            {title}
          </Title>
          {description ? <p className="mt-1 max-w-[62ch] text-[12.5px] leading-relaxed text-ink-dim">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
