"use client";

// Account menu: who is signed in, plus Your account, Billing, a Theme item that cycles
// Light, Dark and System without closing, and Sign out. Three triggers: the sidebar footer
// row, the collapsed sidebar avatar and the top-right avatar. Signed out shows Sign in;
// loading shows a skeleton matched to the trigger.
import { ChevronsUpDown, CreditCard, LogIn, LogOut, Monitor, Moon, Sun, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/loaders";
import { cn } from "@/lib/cn";
import { DropdownMenu, MenuHeader, MenuItem, MenuSeparator } from "./menu";

export type AccountUser = { name: string; email: string };
export type ThemeChoice = "light" | "dark" | "system";
export type AccountAction = "account" | "billing" | "sign-out";

export const THEME_ORDER: ThemeChoice[] = ["light", "dark", "system"];
export const THEME_LABEL: Record<ThemeChoice, string> = { light: "Light", dark: "Dark", system: "System" };

/** Next theme in the Light, Dark, System cycle. */
export function nextTheme(t: ThemeChoice): ThemeChoice {
  return THEME_ORDER[(THEME_ORDER.indexOf(t) + 1) % THEME_ORDER.length];
}

export function ThemeIcon({ theme }: { theme: ThemeChoice }) {
  return theme === "dark" ? <Moon /> : theme === "system" ? <Monitor /> : <Sun />;
}

export type AccountMenuProps = {
  /** null when signed out. */
  user: AccountUser | null;
  /** Session still resolving: show a skeleton in the trigger's shape. */
  loading?: boolean;
  /** sidebar: footer row with name and email; collapsed: avatar in an icon rail; avatar: top-right header avatar. */
  variant?: "sidebar" | "collapsed" | "avatar";
  theme: ThemeChoice;
  onThemeChange: (t: ThemeChoice) => void;
  onSelect?: (action: AccountAction) => void;
  onSignIn?: () => void;
  defaultOpen?: boolean;
  /** Keep the menu open (state samples): selecting and outside clicks do not close it. */
  pinnedOpen?: boolean;
  className?: string;
};

/** Signed-in identity and account actions in one menu. */
export function AccountMenu({
  user,
  loading = false,
  variant = "sidebar",
  theme,
  onThemeChange,
  onSelect,
  onSignIn,
  defaultOpen,
  pinnedOpen = false,
  className,
}: AccountMenuProps) {
  if (loading) {
    return variant === "sidebar" ? (
      <div className={cn("flex h-12 w-full items-center gap-2.5 px-2", className)} role="status" aria-label="Loading account">
        <Skeleton width={24} height={24} radius={999} />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton height={9} width="58%" radius={4} />
          <Skeleton height={8} width="82%" radius={4} />
        </div>
      </div>
    ) : (
      <span role="status" aria-label="Loading account" className={cn("inline-flex p-0.5", className)}>
        <Skeleton width={variant === "avatar" ? 32 : 24} height={variant === "avatar" ? 32 : 24} radius={999} />
      </span>
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={onSignIn}
        aria-label={variant === "collapsed" ? "Sign in" : undefined}
        className={cn(
          "inline-flex items-center gap-2 border border-hair bg-s2 text-[13px] font-medium text-ink transition-colors hover:border-hair-strong hover:bg-s3 [&_svg]:size-4",
          variant === "sidebar" ? "h-10 w-full justify-start rounded-[8px]! px-2.5" : variant === "collapsed" ? "size-9 justify-center rounded-full!" : "h-8 rounded-full! px-3.5",
          className,
        )}
      >
        <LogIn aria-hidden="true" className="text-ink-dim" />
        {variant === "collapsed" ? null : "Sign in"}
      </button>
    );
  }

  return (
    <DropdownMenu
      aria-label="Account"
      defaultOpen={defaultOpen}
      open={pinnedOpen ? true : undefined}
      side={variant === "sidebar" ? "top" : variant === "collapsed" ? "right" : "bottom"}
      align={variant === "avatar" ? "end" : variant === "collapsed" ? "end" : "start"}
      block={variant === "sidebar"}
      width={variant === "sidebar" ? "100%" : 240}
      className={className}
      trigger={(props, { open }) =>
        variant === "sidebar" ? (
          <button
            {...props}
            aria-label={`Account: ${user.name}`}
            className={cn(
              "flex h-12 w-full min-w-0 items-center gap-2.5 rounded-[8px]! px-2 text-left transition-colors hover:bg-white/[0.05]",
              open && "bg-white/[0.07]",
            )}
          >
            <Avatar name={user.name} size="sm" decorative />
            <span className="grid min-w-0 flex-1 leading-tight">
              <span className="truncate text-[13px] font-semibold text-ink">{user.name}</span>
              <span className="truncate text-[11.5px] text-ink-faint">{user.email}</span>
            </span>
            <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0 text-ink-faint" />
          </button>
        ) : (
          <button
            {...props}
            aria-label={`Account: ${user.name}`}
            className={cn(
              "inline-flex rounded-full! p-0.5 transition-shadow",
              open ? "shadow-[0_0_0_2px_var(--hair-strong)]" : "hover:shadow-[0_0_0_2px_var(--hair)]",
            )}
          >
            <Avatar name={user.name} size={variant === "collapsed" ? "sm" : "md"} decorative />
          </button>
        )
      }
    >
      <MenuHeader className="flex items-center gap-2.5">
        <Avatar name={user.name} size="md" decorative />
        <span className="grid min-w-0 leading-tight">
          <span className="truncate text-[13px] font-semibold text-ink">{user.name}</span>
          <span className="truncate text-[11.5px] text-ink-dim">{user.email}</span>
        </span>
      </MenuHeader>
      <MenuSeparator />
      <MenuItem icon={<UserRound />} onSelect={() => onSelect?.("account")}>
        Your account
      </MenuItem>
      <MenuItem icon={<CreditCard />} onSelect={() => onSelect?.("billing")}>
        Billing
      </MenuItem>
      <MenuItem
        icon={<ThemeIcon theme={theme} />}
        keepOpen
        hint={THEME_LABEL[theme]}
        description={`Switch to ${THEME_LABEL[nextTheme(theme)].toLowerCase()}`}
        onSelect={() => onThemeChange(nextTheme(theme))}
      >
        Theme
      </MenuItem>
      <MenuSeparator />
      <MenuItem icon={<LogOut />} onSelect={() => onSelect?.("sign-out")}>
        Sign out
      </MenuItem>
    </DropdownMenu>
  );
}
