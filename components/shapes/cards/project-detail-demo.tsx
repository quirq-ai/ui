"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { MEMBERS, PEOPLE, PROJECT_BY_ID, SESSIONS, minutesAgo } from "@/lib/fixtures";
import { formatDate, formatNumber } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { ProjectDetailHeader } from "./project-detail";
import { DemoSection, DemoStack, Specimen } from "./_demo";

const galileo = PROJECT_BY_ID["galileo"];
const owner = PEOPLE[galileo.owner].name;
const peers = galileo.peers.map((id) => PEOPLE[id].name);
const created = formatDate(minutesAgo(25 * 1440), { withYear: true, weekday: false });

const MANIFEST = [
  { term: "Path", value: <code className="font-mono text-[12px]">~/projects/{galileo.id}</code> },
  { term: "Stage", value: `${galileo.stage} · ${galileo.lane}` },
  { term: "Branch", value: <code className="font-mono text-[12px]">{galileo.branch}</code> },
  { term: "GitHub", value: <code className="font-mono text-[12px]">{galileo.github?.repo ?? "Not linked"}</code> },
  { term: "Sessions", value: `${formatNumber(SESSIONS.filter((s) => s.projectId === galileo.id).length)} recorded` },
  { term: "Files", value: formatNumber(galileo.files) },
];

function SharePanel({ onClose }: { onClose: () => void }) {
  const people = [galileo.owner, ...galileo.peers];
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }
  return (
    <div ref={ref} tabIndex={-1} role="region" aria-label="Share galileo" onKeyDown={onKey} className="rounded-[12px] border border-blu/30 bg-blu/[0.04] p-3.5 outline-none">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <p className="text-[12.5px] font-medium text-ink">People with access</p>
        <CopyButton text={`http://localhost:5002/projects/${galileo.id}`} variant="labelled" size="sm" label="Copy link" aria-label="Copy project link" announce="Project link copied" />
      </div>
      <ul className="flex flex-col divide-y divide-hair-soft">
        {people.map((id) => {
          const m = MEMBERS.find((x) => x.personId === id);
          return (
            <li key={id} className="flex items-center gap-2.5 py-2">
              <Avatar name={PEOPLE[id].name} size="sm" decorative />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] text-ink">{PEOPLE[id].name}</span>
                <span className="block truncate font-mono text-[11px] text-ink-faint">{PEOPLE[id].email}</span>
              </span>
              <span className="text-[11.5px] capitalize text-ink-dim">{id === galileo.owner ? "Owner" : m?.role ?? "collaborator"}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 flex justify-end">
        <Button size="sm" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}

export function ProjectDetailDemo() {
  const [share, setShare] = useState(false);
  const [phoneShare, setPhoneShare] = useState(false);
  const [back, setBack] = useState(false);

  const close = (setter: (v: boolean) => void, id: string) => () => {
    setter(false);
    document.getElementById(id)?.focus();
  };

  return (
    <DemoStack>
      <DemoSection title="Pane · owner can share">
        <ProjectDetailHeader
          name={galileo.displayName}
          badge="Scaffolded"
          description={galileo.description}
          ownerName={owner}
          sharedWith={peers}
          created={created}
          manifest={MANIFEST}
          shareOpen={share}
          shareButtonId="pd-share"
          onShare={() => setShare((v) => !v)}
          sharePanel={<SharePanel onClose={close(setShare, "pd-share")} />}
        />
        <p className="mt-2 text-[12px] text-ink-faint">Share opens the access list. Escape or Done closes it and returns focus to Share.</p>
      </DemoSection>

      <DemoSection title="Read-only, phone block, loading, gone, error">
        <div className="grid gap-5 md:grid-cols-2">
          <Specimen label="Pane · read-only (shared user)">
            <ProjectDetailHeader
              name={PROJECT_BY_ID["xo-swarm"].displayName}
              badge="Shared with you"
              description={PROJECT_BY_ID["xo-swarm"].description}
              ownerName={PEOPLE[PROJECT_BY_ID["xo-swarm"].owner].name}
              sharedWith={PROJECT_BY_ID["xo-swarm"].peers.map((id) => PEOPLE[id].name)}
              created={formatDate(minutesAgo(40 * 1440), { withYear: true, weekday: false })}
              manifest={[]}
              canShare={false}
            />
          </Specimen>
          <Specimen label="Phone block">
            <div className="mx-auto w-full max-w-[360px] rounded-[30px] border border-hair-strong bg-black p-2.5 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
              <ProjectDetailHeader
                variant="phone"
                className="rounded-[22px]"
                name={galileo.displayName}
                description={galileo.description}
                ownerName={owner}
                sharedWith={peers}
                created={created}
                manifest={MANIFEST.slice(0, 3)}
                shareOpen={phoneShare}
                shareButtonId="pd-phone-share"
                onShare={() => setPhoneShare((v) => !v)}
                sharePanel={<SharePanel onClose={close(setPhoneShare, "pd-phone-share")} />}
              />
            </div>
          </Specimen>
          <Specimen label="Loading">
            <ProjectDetailHeader name="" ownerName={null} sharedWith={[]} created="" manifest={MANIFEST.slice(0, 2)} state="loading" />
          </Specimen>
          <Specimen label="Gone">
            <ProjectDetailHeader name="archive" ownerName={null} sharedWith={[]} created="" manifest={[]} state="gone" onBack={() => setBack(true)} />
            <p role="status" className="min-h-5 font-mono text-[11px] text-ink-faint">
              {back ? "Back to projects. Sample action." : ""}
            </p>
          </Specimen>
          <Specimen label="Error · partial details">
            <ProjectDetailHeader
              name={PROJECT_BY_ID["billing-api"].displayName}
              description={PROJECT_BY_ID["billing-api"].description}
              ownerName={PEOPLE[PROJECT_BY_ID["billing-api"].owner].name}
              sharedWith={null}
              created={formatDate(minutesAgo(19 * 1440), { withYear: true, weekday: false })}
              manifest={[]}
              state="error"
              errorMessage="Sharing details could not be loaded: the space billing-sandbox is stopped."
              canShare={false}
            />
          </Specimen>
        </div>
      </DemoSection>
    </DemoStack>
  );
}
