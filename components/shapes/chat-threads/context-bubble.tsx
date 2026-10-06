// Context-tagged messages from the legacy swarm chat: every agent reply carries the context
// that answered it (XO, ClickUp, GitHub Copilot, Claude Code, ChatGPT, Perplexity, Devin,
// DevOps, Vibe, HR, Assistant) as a toned icon and label, optional issue and ID badges, and a deep link.
// Tones map the legacy Tailwind hues onto the quirq spectrum. Server-safe.
import type { ComponentType, ReactNode } from "react";
import { Bot, ExternalLink, GitPullRequest, Lightbulb, ListTodo, MessageCircle, Search, Server, Sparkles, Terminal, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/loaders";
import { XOMark } from "@/components/ui/runtime-logo";
import { toneText, toneSoft, type Tone } from "@/components/ui/tones";
import { renderInline } from "./prose";

export type ChatContextId =
  | "xo"
  | "click-up"
  | "github-copilot"
  | "claude-code"
  | "openai"
  | "perplexity"
  | "devin"
  | "devops"
  | "prototype"
  | "hr"
  | "assistant";

type IconProps = { className?: string; "aria-hidden"?: boolean | "true" | "false" };
type IconCmp = ComponentType<IconProps>;

function XOGlyph({ className }: IconProps) {
  return <XOMark mono height={9} title={null} className={className} />;
}

export const CONTEXT_CONFIG: Record<ChatContextId, { label: string; tone: Exclude<Tone, "neutral">; icon: IconCmp; action: string }> = {
  xo: { label: "XO", tone: "grn", icon: XOGlyph, action: "Open link" },
  "click-up": { label: "ClickUp", tone: "blu", icon: ListTodo, action: "View in ClickUp" },
  "github-copilot": { label: "GitHub Copilot", tone: "pur", icon: GitPullRequest, action: "View on GitHub" },
  "claude-code": { label: "Claude Code", tone: "org", icon: Terminal, action: "View on GitHub" },
  openai: { label: "ChatGPT", tone: "cyn", icon: MessageCircle, action: "Open link" },
  perplexity: { label: "Perplexity", tone: "cyn", icon: Search, action: "Open link" },
  devin: { label: "Devin", tone: "blu", icon: Bot, action: "Open link" },
  devops: { label: "DevOps", tone: "grn", icon: Server, action: "Open link" },
  prototype: { label: "Vibe", tone: "grn", icon: Lightbulb, action: "Open link" },
  hr: { label: "HR", tone: "grn", icon: Users, action: "Open link" },
  assistant: { label: "Assistant", tone: "grn", icon: Sparkles, action: "Open link" },
};

export const CONTEXT_IDS = Object.keys(CONTEXT_CONFIG) as ChatContextId[];

/** Context as a chip: toned icon plus label. */
export function ContextChip({ context, className }: { context: ChatContextId; className?: string }) {
  const c = CONTEXT_CONFIG[context];
  const Icon = c.icon;
  return (
    <span
      className={cn(
        "inline-flex h-[22px] w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[6px] border px-2 text-[11.5px] font-medium leading-none",
        toneSoft[c.tone],
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3 shrink-0" />
      {c.label}
    </span>
  );
}

export type ContextMessageProps = {
  context: ChatContextId;
  role: "user" | "assistant";
  /** thinking: no text yet, spinner and "Thinking…"; answered: the reply. */
  status?: "thinking" | "answered";
  text?: string;
  /** Display time, already formatted ("09:14"). */
  time: string;
  /** Person's name for the avatar on their side. */
  userName?: string;
  issueNo?: number;
  recordId?: string;
  /** Deep link for the action button. */
  url?: string;
  className?: string;
};

/** One legacy context message: person card on the right, context card on the left. */
export function ContextMessage({
  context,
  role,
  status = "answered",
  text = "",
  time,
  userName = "You",
  issueNo,
  recordId,
  url,
  className,
}: ContextMessageProps) {
  const c = CONTEXT_CONFIG[context];
  const Icon = c.icon;
  const isUser = role === "user";
  const thinking = status === "thinking" && !isUser;
  return (
    <div className={cn("flex w-full min-w-0 gap-3", isUser ? "justify-end" : "justify-start", className)}>
      <div
        className={cn(
          "min-w-0 max-w-[88%] rounded-[12px] border p-3.5 sm:max-w-[80%] sm:p-4",
          isUser ? "order-1 border-hair bg-white/[0.03]" : "border-hair bg-s2",
        )}
        aria-busy={thinking || undefined}
      >
        {!isUser ? (
          <div className={cn("mb-2 flex items-center gap-2 text-[11.5px] font-medium", toneText[c.tone])}>
            <Icon aria-hidden="true" className="size-3.5 shrink-0" />
            <span>{c.label}</span>
          </div>
        ) : null}
        {thinking ? (
          <p role="status" className="flex items-center gap-2 text-[13px] text-ink-dim">
            <Spinner size="sm" label={null} />
            Thinking…
          </p>
        ) : (
          <p className="whitespace-pre-wrap break-words text-[13px] leading-[1.6] text-ink/90">{renderInline(text)}</p>
        )}
        {!isUser && !thinking && (issueNo || recordId || url) ? (
          <div className="mt-3 flex flex-col items-start gap-2">
            {issueNo || recordId ? (
              <div className="flex flex-wrap gap-1.5">
                {issueNo ? <Badge size="md">Issue #{issueNo}</Badge> : null}
                {recordId ? <Badge size="md" className="font-mono">ID: {recordId}</Badge> : null}
              </div>
            ) : null}
            {url ? <ContextAction tone={c.tone} href={url} label={c.action} /> : null}
          </div>
        ) : null}
        <p className={cn("mt-2 font-mono text-[10.5px] tabular-nums", isUser ? "text-grn/80" : "text-ink-faint")}>{time}</p>
      </div>
      {isUser ? (
        <div className="order-2 self-start">
          <Avatar name={userName} size="md" />
        </div>
      ) : null}
    </div>
  );
}

function ContextAction({ tone, href, label }: { tone: Exclude<Tone, "neutral">; href: string; label: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-[8px]! border border-hair bg-transparent px-2.5 text-[12px] font-medium transition-colors hover:bg-white/[0.05]",
        toneText[tone],
      )}
    >
      <ExternalLink aria-hidden="true" className="size-3" />
      {label}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
