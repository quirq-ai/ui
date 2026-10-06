import { cn } from "@/lib/cn";

/** quirq mark: the q glyph inside a ring. Paths from landing/public/brand/mark.svg. */
export function Mark({ size = 24, className, title }: { size?: number; className?: string; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 83.2314 83.2314"
      fill="none"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("shrink-0", className)}
    >
      <path
        d="M55.1524 64.7202V35.7154C55.1524 26.6552 48.2204 19.9057 38.7954 19.9057C29.5528 19.9057 22.4992 27.0809 22.4992 35.7154C22.4992 45.1405 28.9447 51.7076 38.3089 51.7076C41.3493 51.7076 44.268 50.6131 46.5178 48.8497V64.7202H55.1524ZM38.7954 43.5595C34.3565 43.5595 31.1337 40.0327 31.1337 35.7762C31.1337 31.5198 34.3565 28.0538 38.7954 28.0538C43.2343 28.0538 46.5178 31.5198 46.5178 35.7762C46.5178 40.0327 43.2343 43.5595 38.7954 43.5595Z"
        fill="currentColor"
      />
      <circle cx="41.6157" cy="41.6157" r="39.1157" stroke="currentColor" strokeWidth="5" />
    </svg>
  );
}

/** quirq wordmark (Chillax vector). Paths from landing/public/brand/wordmark.svg. */
export function Wordmark({ height = 22, className, title = "quirq" }: { height?: number; className?: string; title?: string }) {
  return (
    <svg
      height={height}
      width={(height * 307.188) / 159.121}
      viewBox="0 0 307.188 159.121"
      fill="currentColor"
      role="img"
      aria-label={title}
      className={cn("shrink-0", className)}
    >
      <path d="M69.4786 146.731V88.7917C69.4786 70.6932 55.6315 57.2105 36.8043 57.2105C18.3414 57.2105 4.25137 71.5435 4.25137 88.7917C4.25137 107.619 17.1268 120.737 35.8325 120.737C41.9058 120.737 47.7362 118.551 52.2305 115.028V146.731H69.4786ZM36.8043 104.461C27.9372 104.461 21.4995 97.4158 21.4995 88.9131C21.4995 80.4105 27.9372 73.4869 36.8043 73.4869C45.6713 73.4869 52.2305 80.4105 52.2305 88.9131C52.2305 97.4158 45.6713 104.461 36.8043 104.461Z" />
      <path d="M113.571 103.975C104.704 103.975 100.331 96.0797 100.331 86.8482V58.9111H83.0827V88.7917C83.0827 106.404 93.5288 120.616 113.571 120.616C133.734 120.616 144.18 106.404 144.18 88.7917V58.9111H126.932V86.7268C126.932 96.0797 122.438 103.975 113.571 103.975Z" />
      <path d="M168.959 49.9225C174.79 49.9225 179.527 45.1853 179.527 39.2335C179.527 33.4031 174.79 28.5445 168.959 28.5445C163.129 28.5445 158.27 33.4031 158.27 39.2335C158.27 45.1853 163.129 49.9225 168.959 49.9225ZM160.335 58.911V119.037H177.583V58.911H160.335Z" />
      <path d="M211.715 119.037V85.1477C211.715 77.9812 215.845 73.6084 222.647 73.6084C225.805 73.6084 229.328 74.4587 232.243 76.1592V59.3969C229.207 58.0607 224.955 57.332 221.068 57.332C203.213 57.332 194.467 69.1142 194.467 84.5403V119.037H211.715Z" />
      <path d="M300.021 146.731V88.7917C300.021 70.6932 286.174 57.2105 267.347 57.2105C248.884 57.2105 234.794 71.5435 234.794 88.7917C234.794 107.619 247.669 120.737 266.375 120.737C272.449 120.737 278.279 118.551 282.773 115.028V146.731H300.021ZM267.347 104.461C258.48 104.461 252.042 97.4158 252.042 88.9131C252.042 80.4105 258.48 73.4869 267.347 73.4869C276.214 73.4869 282.773 80.4105 282.773 88.9131C282.773 97.4158 276.214 104.461 267.347 104.461Z" />
    </svg>
  );
}

/** Mark plus the rounded "quirq" logotype, as the landing nav sets it. */
export function Lockup({ label = "quirq", size = 26, className }: { label?: string; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Mark size={size} />
      <span className="font-round text-[19px] font-semibold tracking-[0.01em]">{label}</span>
    </span>
  );
}

/** Mono kicker with the spectrum chip, deck slide style. */
export function Eyebrow({ children, rule = false, className }: { children: React.ReactNode; rule?: boolean; className?: string }) {
  return (
    <div className={cn("eyebrow", rule && "rule", className)}>
      <span className="chip" aria-hidden="true" />
      <span className="lbl">{children}</span>
    </div>
  );
}
