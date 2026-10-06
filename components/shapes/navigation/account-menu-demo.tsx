"use client";

import { useState } from "react";
import { AvatarGroup } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/loaders";
import { CURRENT_SPACE, CURRENT_USER, PEOPLE, PEOPLE_LIST } from "@/lib/fixtures";
import { DemoCell, DemoGrid, DemoStack, Readout } from "./demo-kit";
import { AccountMenu, THEME_LABEL, type AccountAction, type ThemeChoice } from "./account-menu";

const USER = { name: CURRENT_USER.name, email: CURRENT_USER.email };
const ACTION_WORDS: Record<AccountAction, string> = { account: "Opened Your account", billing: "Opened Billing", "sign-out": "Signed out" };

/** Dim sidebar rows above the footer, for context. */
function ContextRows() {
  return (
    <ul aria-hidden="true" className="flex flex-col gap-1 p-3">
      {["Dashboard", "Usage", "research-lab", "ops-copilot"].map((l) => (
        <li key={l} className="flex h-8 items-center gap-2.5 px-2 text-[13px] text-ink-faint">
          <span className="size-4 rounded-[4px] bg-white/[0.07]" />
          {l}
        </li>
      ))}
    </ul>
  );
}

export function AccountMenuDemo() {
  const [theme, setTheme] = useState<ThemeChoice>("dark");
  const [last, setLast] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(true);

  const onSelect = (a: AccountAction) => {
    setLast(ACTION_WORDS[a]);
    if (a === "sign-out") setSignedIn(false);
  };

  const members = CURRENT_SPACE.members.map((id) => PEOPLE[id].name);

  return (
    <DemoStack>
      <DemoCell label="Top-right avatar · click opens" note="↓ opens with focus on the first item; Theme cycles without closing.">
        <div className="min-h-[300px] rounded-[14px] border border-hair-soft bg-[#0a0a0c]">
          <header className="flex items-center justify-between gap-3 border-b border-hair-soft px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="truncate text-[13.5px] font-medium text-ink">{CURRENT_SPACE.name}</span>
              <span className="hidden text-[12px] text-ink-faint sm:inline">Shared with</span>
              <AvatarGroup names={members} max={3} size="sm" className="max-sm:hidden" />
            </div>
            <AccountMenu
              user={signedIn ? USER : null}
              variant="avatar"
              theme={theme}
              onThemeChange={setTheme}
              onSelect={onSelect}
              onSignIn={() => {
                setSignedIn(true);
                setLast("Signed in");
              }}
            />
          </header>
          <div className="flex flex-col gap-3 px-4 py-4">
            <p className="max-w-[52ch] text-[13px] leading-relaxed text-ink-dim">
              {CURRENT_SPACE.description} The avatar at the top right opens the account menu.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Readout label="Theme">{THEME_LABEL[theme]}</Readout>
              {last ? <Readout label="Last">{last}</Readout> : null}
            </div>
          </div>
        </div>
      </DemoCell>

      <DemoGrid>
        <DemoCell label="Sidebar footer · expanded" note="Opens upward from the footer.">
          <div className="flex min-h-[300px] flex-col justify-between rounded-[14px] border border-hair-soft bg-[#0b0b0c]">
            <ContextRows />
            <div className="border-t border-hair-soft p-2">
              <AccountMenu user={USER} variant="sidebar" theme={theme} onThemeChange={setTheme} onSelect={onSelect} />
            </div>
          </div>
        </DemoCell>

        <DemoCell label="Collapsed · avatar only" note="Opens to the right of the rail.">
          <div className="flex min-h-[300px] rounded-[14px] border border-hair-soft bg-[#0a0a0c]">
            <div className="flex w-14 flex-col items-center justify-between border-r border-hair bg-[#0b0b0c] py-3">
              <div aria-hidden="true" className="flex flex-col items-center gap-3 pt-1">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="size-4 rounded-[4px] bg-white/[0.07]" />
                ))}
              </div>
              <AccountMenu user={USER} variant="collapsed" theme={theme} onThemeChange={setTheme} onSelect={onSelect} />
            </div>
            <div className="dots flex-1 rounded-r-[13px]" />
          </div>
        </DemoCell>

        <DemoCell label="Open">
          <div className="flex min-h-[300px] flex-col justify-end rounded-[14px] border border-hair-soft bg-[#0b0b0c]">
            <div className="border-t border-hair-soft p-2">
              <AccountMenu user={USER} variant="sidebar" theme={theme} onThemeChange={setTheme} onSelect={onSelect} pinnedOpen />
            </div>
          </div>
        </DemoCell>

        <div className="flex min-w-0 flex-col gap-8">
          <DemoCell label="Signed out">
            <div className="flex flex-col gap-3 rounded-[14px] border border-hair-soft bg-[#0b0b0c] p-3">
              <AccountMenu user={null} variant="sidebar" theme={theme} onThemeChange={setTheme} />
              <div className="flex items-center gap-3">
                <AccountMenu user={null} variant="avatar" theme={theme} onThemeChange={setTheme} />
                <AccountMenu user={null} variant="collapsed" theme={theme} onThemeChange={setTheme} />
              </div>
            </div>
          </DemoCell>
          <DemoCell label="Avatar loading">
            <div className="flex flex-col gap-3 rounded-[14px] border border-hair-soft bg-[#0b0b0c] p-3">
              <AccountMenu user={USER} loading variant="sidebar" theme={theme} onThemeChange={setTheme} />
              <div className="flex items-center gap-3">
                <AccountMenu user={USER} loading variant="avatar" theme={theme} onThemeChange={setTheme} />
                <AccountMenu user={USER} loading variant="collapsed" theme={theme} onThemeChange={setTheme} />
              </div>
            </div>
          </DemoCell>
          <DemoCell label="Shared with · max 3 · max 5 · not shared · loading">
            <div className="flex flex-wrap items-center gap-5 rounded-[14px] border border-hair-soft bg-[#0b0b0c] p-3">
              <AvatarGroup names={PEOPLE_LIST.map((p) => p.name)} max={3} size="sm" />
              <AvatarGroup names={PEOPLE_LIST.map((p) => p.name)} max={5} size="sm" />
              <span className="text-[12px] text-ink-faint">Not shared</span>
              <span role="status" aria-label="Loading people">
                <Skeleton width={72} height={24} radius={999} />
              </span>
            </div>
          </DemoCell>
        </div>
      </DemoGrid>
    </DemoStack>
  );
}
