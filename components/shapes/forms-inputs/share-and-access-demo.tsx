"use client";

import { CURRENT_USER, INVITES, MEMBERS, PEOPLE, PEOPLE_LIST, PROJECTS, PROJECT_BY_ID, SPACE_BY_ID } from "@/lib/fixtures";
import { formatList } from "@/lib/format";
import { DemoCell, DemoGrid, DemoRule } from "./_kit";
import { EmailSearch } from "./search-field";
import { InlineShareForm, InviteLink, PeopleAccessList, ShareComposer, ShareDialog, SharedProjectDetail, type AccessPerson } from "./share-and-access";

const XO_SPACE = PROJECT_BY_ID["xo-space"];
const OPS = SPACE_BY_ID["ws_7f3a9c21e4b0"];

const SHAREABLE = PROJECTS.filter((p) => p.spaceId === "ws_2b81d0e4").map((p) => ({
  id: p.id,
  name: p.displayName,
  slug: p.github?.repo ?? `local/${p.id}`,
  sharedWith: p.peers.length,
}));

const PEOPLE_WITH_ACCESS: AccessPerson[] = [
  ...MEMBERS.map((m) => ({
    id: m.personId,
    name: m.name,
    email: m.email,
    role: m.role,
    state: "active" as const,
    you: m.personId === CURRENT_USER.id,
    meta: `Last active ${m.lastActive}`,
  })),
  ...INVITES.map((inv) => {
    const person = PEOPLE_LIST.find((p) => p.email === inv.email);
    return { id: inv.id, name: person?.name ?? inv.email, email: inv.email, role: inv.role, state: "pending" as const, meta: `Requested ${inv.sent}` };
  }),
];

const COMMITS = [
  { hash: "a1b2c3d", message: "Show Unavailable when the Space API is down", author: PEOPLE.kenji.name, ago: "35m ago" },
  { hash: "9f8e7d6", message: "Clarify the project review checklist", author: PEOPLE.lena.name, ago: "2h ago" },
];

const peerNames = XO_SPACE.peers.map((id) => PEOPLE[id].name);

const INVITE_URL = "https://swarm.example.com/join/inv_7c2e";
const INVITE_NOTE = "Joins as a collaborator · expires in 7 days";

export function ShareAndAccessDemo() {
  return (
    <div>
      <DemoGrid>
        <DemoCell label="Inline form" note="Inside a manage card">
          <div className="rounded-[12px] border border-hair bg-s2 p-4">
            <p className="text-[13.5px] font-medium text-ink">{XO_SPACE.displayName}</p>
            <p className="mb-3 text-[12px] text-ink-dim">{XO_SPACE.description}</p>
            <InlineShareForm projectName={XO_SPACE.displayName} defaultValue={OPS.id} />
          </div>
        </DemoCell>
        <DemoCell label="States · sharing, invalid id, shared">
          <div className="flex flex-col gap-4 rounded-[12px] border border-hair bg-s2 p-4">
            <InlineShareForm projectName={XO_SPACE.displayName} defaultValue="ws_c40e19aa" sharing separator={false} />
            <InlineShareForm projectName={XO_SPACE.displayName} defaultValue="ws 7f3a 9c21" validateOnMount />
            <InlineShareForm projectName={XO_SPACE.displayName} defaultValue={OPS.id} defaultSharedWith={OPS.id} />
          </div>
        </DemoCell>

        <DemoCell label="Two-step composer" note="Pick, then recipient">
          <ShareComposer projects={SHAREABLE} />
        </DemoCell>
        <DemoCell label="Dialog · members list · copy invite" note="Esc closes, focus returns">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 rounded-[12px] border border-hair bg-s2 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[13px] text-ink">{OPS.name}</p>
                <p className="text-[12px] text-ink-dim">Hosted space · {OPS.members.length} people</p>
              </div>
              <ShareDialog triggerLabel={`Share ${OPS.name}`} title={`Share ${OPS.name}`} description="People you add can open the space and its projects.">
                <EmailSearch
                  lookup={(email) => {
                    const p = PEOPLE_LIST.find((x) => x.email === email);
                    return p ? { name: p.name, email: p.email } : null;
                  }}
                  existing={MEMBERS.map((m) => m.email)}
                />
                <div className="scroll-thin max-h-[320px] overflow-y-auto pr-1">
                  <PeopleAccessList people={PEOPLE_WITH_ACCESS} />
                </div>
                <InviteLink url={INVITE_URL} note={INVITE_NOTE} />
              </ShareDialog>
            </div>
            <PeopleAccessList people={PEOPLE_WITH_ACCESS.slice(0, 2).concat(PEOPLE_WITH_ACCESS.slice(-1))} />
            <InviteLink url={INVITE_URL} note={INVITE_NOTE} />
          </div>
        </DemoCell>

        <DemoCell label="Shared detail" note="Apply commits, or copy the command" className="md:col-span-2">
          <SharedProjectDetail
            name={XO_SPACE.displayName}
            repo={XO_SPACE.github?.url.replace("https://", "") ?? XO_SPACE.id}
            branch={XO_SPACE.github?.defaultBranch ?? "main"}
            sharedWith={XO_SPACE.peers.length}
            checked="1m ago"
            commits={COMMITS}
            localPath={`~/xo-projects/${XO_SPACE.id}`}
            members={`Members: ${formatList(peerNames)}`}
            flash
          />
        </DemoCell>
      </DemoGrid>

      <DemoRule />

      <DemoGrid cols={3}>
        <DemoCell label="State · loading members">
          <PeopleAccessList people={[]} loading />
        </DemoCell>
        <DemoCell label="State · no members yet">
          <PeopleAccessList people={[]} />
        </DemoCell>
        <DemoCell label="State · detail loading">
          <SharedProjectDetail name="" repo="" branch="main" sharedWith={0} checked="" commits={[]} localPath="" loading />
        </DemoCell>
      </DemoGrid>
    </div>
  );
}
