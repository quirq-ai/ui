/**
 * Pure, deterministic formatters for the shapes catalog.
 *
 * Every number formatter pins the "en-US" locale. Every date formatter reads UTC
 * fields directly (no host time zone, no Intl date data), so server and client
 * render the same string and hydration never mismatches.
 *
 * A missing measurement (null, undefined or NaN) always renders as "Unavailable",
 * never as zero.
 */

export const UNAVAILABLE = "Unavailable";

export type Maybe<T> = T | null | undefined;

function missing(n: Maybe<number>): n is null | undefined {
  return n === null || n === undefined || Number.isNaN(n);
}

const nf = new Map<string, Intl.NumberFormat>();
function numberFormat(min: number, max: number): Intl.NumberFormat {
  const key = `${min}:${max}`;
  let f = nf.get(key);
  if (!f) {
    f = new Intl.NumberFormat("en-US", { minimumFractionDigits: min, maximumFractionDigits: max });
    nf.set(key, f);
  }
  return f;
}

/* ------------------------------------------------------------------ numbers */

/** 1204331 -> "1,204,331"; 3.14159 with digits 2 -> "3.14". */
export function formatNumber(n: Maybe<number>, digits = 0): string {
  if (missing(n)) return UNAVAILABLE;
  return numberFormat(0, digits).format(n);
}

/** Fixed fraction digits: 0.5 with digits 2 -> "0.50". */
export function formatFixed(n: Maybe<number>, digits = 1): string {
  if (missing(n)) return UNAVAILABLE;
  return numberFormat(digits, digits).format(n);
}

const COMPACT_STEPS: [number, string][] = [
  [1e12, "T"],
  [1e9, "B"],
  [1e6, "M"],
  [1e3, "K"],
];

/**
 * Short magnitude: 1204331 -> "1.2M", 18400000 -> "18.4M", 312500 -> "313K", 940 -> "940".
 * One decimal under 100 of a unit, none above; trailing ".0" is dropped.
 */
export function formatCompact(n: Maybe<number>): string {
  if (missing(n)) return UNAVAILABLE;
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  for (const [step, suffix] of COMPACT_STEPS) {
    if (abs >= step * 0.9995) {
      const v = abs / step;
      const digits = v < 99.95 ? 1 : 0;
      const text = numberFormat(0, digits).format(v);
      // 999.96K rounds to "1,000K": promote to the next unit instead
      if (text === "1,000" && suffix !== "T") {
        const next = COMPACT_STEPS[COMPACT_STEPS.findIndex(([s]) => s === step) - 1];
        return `${sign}1${next[1]}`;
      }
      return `${sign}${text}${suffix}`;
    }
  }
  return `${sign}${numberFormat(0, abs < 10 ? 1 : 0).format(abs)}`;
}

/** Token meter: 1204331 -> "1.2M tokens"; withUnit false -> "1.2M". Tokens are never quirqs. */
export function formatTokens(n: Maybe<number>, withUnit = true): string {
  if (missing(n)) return UNAVAILABLE;
  const v = formatCompact(n);
  return withUnit ? `${v} ${plural(n, "token")}` : v;
}

const usd = new Map<number, Intl.NumberFormat>();
/** USD: 4.18 -> "$4.18", 6830 -> "$6,830.00"; digits 0 -> "$6,830". Small values keep cents. */
export function formatCurrency(n: Maybe<number>, digits = 2): string {
  if (missing(n)) return UNAVAILABLE;
  let f = usd.get(digits);
  if (!f) {
    f = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    usd.set(digits, f);
  }
  return f.format(n);
}

/** Ratio in, percent out: 0.85 -> "85%", 0.0825 with digits 1 -> "8.3%". */
export function formatPercent(ratio: Maybe<number>, digits = 0): string {
  if (missing(ratio)) return UNAVAILABLE;
  return `${numberFormat(0, digits).format(ratio * 100)}%`;
}

/** One shared format for QER-style ratios: 5.56 -> "5.6x". */
export function formatRatio(n: Maybe<number>, digits = 1): string {
  if (missing(n)) return UNAVAILABLE;
  return `${numberFormat(digits, digits).format(n)}x`;
}

/** quirq count with the lowercase unit: 34 -> "34 quirqs", 1 -> "1 quirq". */
export function formatQuirqs(n: Maybe<number>, digits = 0): string {
  if (missing(n)) return UNAVAILABLE;
  return `${formatNumber(n, digits)} ${plural(n, "quirq")}`;
}

/* --------------------------------------------------------------- durations */

/**
 * Seconds in, short duration out.
 * 41.2 -> "41.2s", 260 -> "4m 20s", 720 -> "12m", 4320 -> "1h 12m", 7200 -> "2h", 190800 -> "2d 5h".
 */
export function formatDuration(seconds: Maybe<number>): string {
  if (missing(seconds)) return UNAVAILABLE;
  const s = Math.max(0, seconds);
  if (s < 60) return Number.isInteger(s) ? `${s}s` : `${numberFormat(0, 1).format(s)}s`;
  const total = Math.round(s);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  if (d > 0) return h > 0 ? `${d}d ${h}h` : `${d}d`;
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  if (m < 10 && sec > 0) return `${m}m ${sec}s`;
  return `${m}m`;
}

/** Milliseconds for latency: 842 -> "842 ms", 3412 -> "3.41 s". */
export function formatLatency(ms: Maybe<number>): string {
  if (missing(ms)) return UNAVAILABLE;
  if (ms < 1000) return `${formatNumber(ms)} ms`;
  return `${numberFormat(2, 2).format(ms / 1000)} s`;
}

/* ------------------------------------------------------------------- bytes */

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"];

/** Binary units: 512 -> "512 B", 1536 -> "1.5 KB", 5033164 -> "4.8 MB". */
export function formatBytes(n: Maybe<number>, digits = 1): string {
  if (missing(n)) return UNAVAILABLE;
  let v = Math.abs(n);
  let i = 0;
  while (v >= 1024 && i < BYTE_UNITS.length - 1) {
    v /= 1024;
    i++;
  }
  const text = i === 0 ? formatNumber(v) : numberFormat(0, v < 10 ? digits : 0).format(v);
  return `${n < 0 ? "-" : ""}${text} ${BYTE_UNITS[i]}`;
}

/* ------------------------------------------------------------------- dates */

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toDate(input: string | number | Date): Date | null {
  const d = input instanceof Date ? input : new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** "2026-10-02T09:02:00Z" -> "Fri 2 Oct"; withYear -> "Fri 2 Oct 2026". UTC. */
export function formatDate(input: Maybe<string | number | Date>, opts: { withYear?: boolean; weekday?: boolean } = {}): string {
  if (input === null || input === undefined) return UNAVAILABLE;
  const d = toDate(input);
  if (!d) return UNAVAILABLE;
  const { withYear = false, weekday = true } = opts;
  const parts = [
    weekday ? WEEKDAYS[d.getUTCDay()] : null,
    String(d.getUTCDate()),
    MONTHS[d.getUTCMonth()],
    withYear ? String(d.getUTCFullYear()) : null,
  ];
  return parts.filter(Boolean).join(" ");
}

/** "2026-10-02" -> "2 Oct" (short axis label, no weekday). UTC. */
export function formatDayLabel(input: Maybe<string | number | Date>): string {
  return formatDate(input, { weekday: false });
}

/** "2026-06-01" -> "June 2026". UTC. */
export function formatMonth(input: Maybe<string | number | Date>): string {
  if (input === null || input === undefined) return UNAVAILABLE;
  const d = toDate(input);
  if (!d) return UNAVAILABLE;
  return `${MONTHS_LONG[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "2026-10-02T09:02:14Z" -> "09:02"; withSeconds -> "09:02:14". 24-hour UTC. */
export function formatTime(input: Maybe<string | number | Date>, withSeconds = false): string {
  if (input === null || input === undefined) return UNAVAILABLE;
  const d = toDate(input);
  if (!d) return UNAVAILABLE;
  const hm = `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
  return withSeconds ? `${hm}:${pad2(d.getUTCSeconds())}` : hm;
}

/** "2026-10-03T02:00:00Z" -> "Sat 3 Oct, 02:00". UTC. */
export function formatDateTime(input: Maybe<string | number | Date>): string {
  if (input === null || input === undefined) return UNAVAILABLE;
  const d = toDate(input);
  if (!d) return UNAVAILABLE;
  return `${formatDate(d)}, ${formatTime(d)}`;
}

/** Minutes after midnight -> "09:30". Handy for swimlane axes. */
export function formatClock(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
}

/**
 * Relative time against an explicit "now" (never the wall clock).
 * Past: "just now", "4m ago", "3h ago", "2d ago", then "Fri 18 Sep".
 * Future: "in 12m", "in 23h 40m", "in 2d".
 */
export function formatRelative(input: Maybe<string | number | Date>, now: string | number | Date): string {
  if (input === null || input === undefined) return UNAVAILABLE;
  const d = toDate(input);
  const n = toDate(now);
  if (!d || !n) return UNAVAILABLE;
  const diffMin = Math.round((n.getTime() - d.getTime()) / 60000);
  if (diffMin < 0) {
    const ahead = -diffMin;
    if (ahead < 60) return `in ${ahead}m`;
    if (ahead < 1440) {
      const h = Math.floor(ahead / 60);
      const m = ahead % 60;
      return m ? `in ${h}h ${m}m` : `in ${h}h`;
    }
    return `in ${Math.round(ahead / 1440)}d`;
  }
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
  if (diffMin < 1440 * 7) return `${Math.floor(diffMin / 1440)}d ago`;
  return formatDate(d);
}

/* ----------------------------------------------------------------- plurals */

/** Word only: plural(1, "session") -> "session"; plural(3, "session") -> "sessions"; irregulars via third arg. */
export function plural(count: number, singular: string, pluralForm?: string): string {
  return Math.abs(count) === 1 ? singular : (pluralForm ?? `${singular}s`);
}

/** Count and word: pluralize(1204, "message") -> "1,204 messages". */
export function pluralize(count: Maybe<number>, singular: string, pluralForm?: string): string {
  if (missing(count)) return UNAVAILABLE;
  return `${formatNumber(count)} ${plural(count, singular, pluralForm)}`;
}

/** Inline list: ["a"] -> "a", ["a","b"] -> "a and b", ["a","b","c"] -> "a, b and c". */
export function formatList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Name -> initials: "Tomás Ruiz" -> "TR". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}
