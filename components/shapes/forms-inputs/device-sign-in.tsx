"use client";

// Device code and QR sign-in: DeviceCodeCard (the large letter-spaced code is the anchor;
// copy, open the verify page, then a waiting line until the provider confirms; a centered
// card or an inline row), PairingQr (deterministic QR-style art from a seed, no network) and
// QrPairing (idle, connecting, QR with an expiry ring, success, error with Retry).
import type { ReactNode } from "react";
import { CircleCheck, CircleAlert, QrCode, RefreshCw } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, ButtonLink } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Spinner } from "@/components/ui/loaders";
import { mulberry32 } from "@/lib/fixtures";

/* ============================================================================ DeviceCodeCard */

export type DeviceCodeState = "waiting_code" | "shown" | "connected";

export type DeviceCodeCardProps = {
  provider: string;
  logo?: ReactNode;
  /** The one-time code; null while it is being fetched. */
  code: string | null;
  state: DeviceCodeState;
  /** Where the code is entered. */
  verifyUrl: string;
  /** Short form shown in copy: "github.com/login/device". */
  verifyLabel: string;
  /** Link (external page) or a button that calls onOpen. */
  openAs?: "link" | "button";
  onOpen?: () => void;
  /** After connecting: "ada-moreno". */
  account?: string;
  /** Countdown text: "Expires in 14m". */
  expires?: string;
  layout?: "card" | "inline";
  className?: string;
};

/** One-time code for a provider: copy it, open the verify page, wait for the provider. */
export function DeviceCodeCard({
  provider,
  logo,
  code,
  state,
  verifyUrl,
  verifyLabel,
  openAs = "link",
  onOpen,
  account,
  expires,
  layout = "card",
  className,
}: DeviceCodeCardProps) {
  const open =
    openAs === "link" ? (
      <ButtonLink href={verifyUrl} external size="sm" variant="secondary" onClick={onOpen}>
        Open {verifyLabel}
      </ButtonLink>
    ) : (
      <Button size="sm" variant="secondary" onClick={onOpen}>
        Open {provider} sign-in
      </Button>
    );

  const waiting = (
    <p role="status" className="inline-flex items-start gap-2 text-[12.5px] leading-snug text-ink-dim">
      <Spinner size="xs" label={null} className="mt-[3px]" />
      {state === "waiting_code" ? "Waiting for code…" : layout === "inline" ? "Waiting for you to enter the code…" : `Waiting for you to authorize the app on ${provider}…`}
    </p>
  );

  if (layout === "inline") {
    return (
      <div className={cn("flex min-w-0 flex-col gap-3 rounded-[12px] border border-hair bg-s2 p-4", className)}>
        <div className="flex items-center gap-2.5">
          {logo ? <span className="inline-flex size-7 items-center justify-center rounded-[8px] border border-hair bg-s3">{logo}</span> : null}
          <p className="text-[13.5px] font-medium text-ink">Connect {provider}</p>
          {state === "connected" ? (
            <span className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-grn">
              <CircleCheck aria-hidden="true" className="size-3.5" /> Connected
            </span>
          ) : null}
        </div>
        {state === "connected" ? (
          <p className="text-[12.5px] text-ink-dim">
            Signed in as <span className="font-mono text-ink">{account}</span>. Sessions can now use your {provider} plan.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12.5px] text-ink-dim">Your code</span>
              {code ? (
                <span className="inline-flex h-8 items-center gap-1 rounded-[8px] border border-hair-strong bg-black/50 pl-3 pr-1">
                  <span className="font-mono text-[15px] font-semibold tracking-[0.16em] text-ink">{code}</span>
                  <CopyButton text={code} size="sm" aria-label="Copy code" announce="Code copied" />
                </span>
              ) : (
                <span className="skeleton h-8 w-[132px] rounded-[8px]!" aria-hidden="true" />
              )}
              {code ? open : null}
            </div>
            {waiting}
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex min-w-0 flex-col items-center gap-4 rounded-[14px] border border-hair bg-s2 px-5 py-6 text-center", className)}>
      {logo ? <span className="inline-flex size-10 items-center justify-center rounded-[11px] border border-hair bg-s3">{logo}</span> : null}
      {state === "connected" ? (
        <>
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-grn/12 text-grn">
            <CircleCheck aria-hidden="true" className="size-6" />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-ink">Connected to {provider}</p>
            <p className="mt-1 text-[12.5px] text-ink-dim">
              Signed in as <span className="font-mono text-ink">{account}</span>.
            </p>
          </div>
        </>
      ) : (
        <>
          <p className="max-w-[30ch] text-[13px] text-ink-dim">
            Enter this code at <code className="font-mono text-ink">{verifyLabel}</code>.
          </p>
          <div className="flex min-h-[52px] items-center gap-2">
            {code ? (
              <>
                <output className="whitespace-nowrap font-mono text-[clamp(22px,2.2vw,28px)] font-semibold leading-none tracking-[0.14em] text-ink" aria-label={`Code ${code.split("").join(" ")}`}>
                  {code}
                </output>
                <CopyButton text={code} aria-label="Copy code" announce="Code copied" />
              </>
            ) : (
              <span className="skeleton h-9 w-[200px] rounded-[8px]!" aria-hidden="true" />
            )}
          </div>
          {code ? open : null}
          {waiting}
          {expires && code ? <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">{expires}</p> : null}
        </>
      )}
    </div>
  );
}

/* ============================================================================ PairingQr */

/** QR-style art from a seed: three finder squares and a seeded module field. Decorative stand-in, never a real code. */
export function PairingQr({ seed, size = 168, label = "Pairing QR code, illustrative" }: { seed: number; size?: number; label?: string }) {
  const n = 25;
  const rnd = mulberry32(seed);
  const finder = (x: number, y: number) => {
    const inBox = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
    return inBox(0, 0) || inBox(n - 7, 0) || inBox(0, n - 7);
  };
  const cells: string[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const on = rnd() > 0.52;
      if (!finder(x, y) && on) cells.push(`M${x} ${y}h1v1h-1z`);
    }
  }
  const finders = [
    [0, 0],
    [n - 7, 0],
    [0, n - 7],
  ];
  return (
    <svg role="img" aria-label={label} viewBox={`-2 -2 ${n + 4} ${n + 4}`} width={size} height={size} className="shrink-0 rounded-[10px] bg-white" shapeRendering="crispEdges">
      <path d={cells.join("")} fill="#0b0b0c" />
      {finders.map(([fx, fy]) => (
        <g key={`${fx}-${fy}`}>
          <rect x={fx} y={fy} width={7} height={7} fill="#0b0b0c" />
          <rect x={fx + 1} y={fy + 1} width={5} height={5} fill="#ffffff" />
          <rect x={fx + 2} y={fy + 2} width={3} height={3} fill="#0b0b0c" />
        </g>
      ))}
    </svg>
  );
}

/* ============================================================================ QrPairing */

export type QrState = "idle" | "connecting" | "qr" | "success" | "error";

export type QrPairingProps = {
  state: QrState;
  /** QR seed; a new seed is a new code. */
  seed: number;
  /** Seconds left on the current code (QR state). */
  secondsLeft?: number;
  /** Lifetime of one code in seconds. */
  lifetime?: number;
  onConnect?: () => void;
  onRetry?: () => void;
  /** Linked device line for success. */
  linked?: ReactNode;
  className?: string;
};

/** WhatsApp-style pairing: scan from the phone's Linked Devices. Codes rotate every 20 seconds. */
export function QrPairing({ state, seed, secondsLeft = 20, lifetime = 20, onConnect, onRetry, linked, className }: QrPairingProps) {
  const r = 9;
  const c = 2 * Math.PI * r;
  return (
    <div className={cn("flex min-w-0 flex-col gap-4 rounded-[14px] border border-hair bg-s2 p-5", className)}>
      {state === "idle" ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-[13px] text-ink-dim">Link a phone so the agent can read and send WhatsApp messages in this space.</p>
          <Button size="sm" variant="primary" leadingIcon={<QrCode aria-hidden="true" />} onClick={onConnect}>
            Connect WhatsApp
          </Button>
        </div>
      ) : state === "connecting" ? (
        <div role="status" className="flex min-h-[168px] flex-col items-center justify-center gap-3 text-[12.5px] text-ink-dim">
          <Spinner size="lg" label={null} />
          Starting a pairing session…
        </div>
      ) : state === "qr" ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <PairingQr seed={seed} />
          <div className="flex min-w-0 flex-col gap-3">
            <p className="text-[13px] leading-relaxed text-ink">
              Open WhatsApp on your phone, go to Linked Devices › Link a Device, then scan this code.
            </p>
            <div className="flex items-center gap-2.5">
              <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden="true" className="-rotate-90">
                <circle cx="12" cy="12" r={r} fill="none" stroke="var(--s4)" strokeWidth="2.5" />
                <circle
                  cx="12"
                  cy="12"
                  r={r}
                  fill="none"
                  stroke="var(--grn)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={c}
                  strokeDashoffset={c * (1 - secondsLeft / lifetime)}
                  className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                />
              </svg>
              <p className="text-[12px] text-ink-dim">
                <span className="font-mono tabular-nums text-ink">{secondsLeft}s</span> left. QR code expires every {lifetime} seconds. A new one will appear automatically.
              </p>
            </div>
          </div>
        </div>
      ) : state === "success" ? (
        <div role="status" className="flex items-start gap-3">
          <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-grn" />
          <div>
            <p className="text-[13.5px] font-medium text-grn">WhatsApp connected</p>
            <p className="mt-0.5 text-[12.5px] text-ink-dim">{linked ?? "Linked to this space. Messages arrive in Inbox."}</p>
          </div>
        </div>
      ) : (
        <div role="alert" className="flex flex-col items-start gap-3">
          <p className="inline-flex items-center gap-2 text-[13px] text-[#ff7a70]">
            <CircleAlert aria-hidden="true" className="size-4" />
            Connection lost. Please retry.
          </p>
          <Button size="sm" variant="secondary" leadingIcon={<RefreshCw aria-hidden="true" />} onClick={onRetry}>
            Retry WhatsApp
          </Button>
        </div>
      )}
    </div>
  );
}
