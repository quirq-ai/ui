"use client";

import { useState } from "react";
import { SearchInput } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/status";
import { PROJECT_BY_ID, PEOPLE } from "@/lib/fixtures";
import { pluralize } from "@/lib/format";
import { OrbitMap } from "./orbit-map";
import { ORBIT_ALL, ORBIT_ALL_EVENTS, ORBIT_DATE, ORBIT_LAB, ORBIT_LAB_EVENTS, ORBIT_LAB_NAME } from "./orbit-map-data";
import { DemoCell } from "./parts";

export function OrbitMapDemo() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [opened, setOpened] = useState<string | null>("xo-space");
  const project = opened ? PROJECT_BY_ID[opened] : null;

  return (
    <div className="space-y-9">
      <DemoCell caption="Variant · overview · interactive" note="Click a hub to focus its category, or a project to open it">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            size="sm"
            placeholder="Filter projects…"
            aria-label="Filter projects on the map"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-[280px]"
          />
          <p className="text-[12px] text-ink-faint" aria-live="polite">
            {query.trim() ? `Muting nodes that do not match “${query.trim()}”` : "Type to mute what does not match"}
          </p>
        </div>
        <OrbitMap
          categories={ORBIT_ALL}
          kicker={["All projects", ORBIT_DATE]}
          eventCount={ORBIT_ALL_EVENTS}
          query={query}
          category={category}
          onCategoryChange={setCategory}
          onOpenProject={setOpened}
        />
        {project ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[12px] border border-hair bg-s1 px-4 py-3 text-[12.5px]" role="status">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">Opened</span>
            <span className="font-medium text-ink">{project.displayName}</span>
            <Badge tone={project.color}>
              {project.category}
            </Badge>
            <span className="text-ink-dim">{pluralize(project.sessions, "session")}</span>
            <span className="flex items-center gap-1.5 text-ink-dim">
              <StatusDot status={project.openSessions ? "up" : "idle"} size="xs" halo={false} />
              {project.openSessions ? `${project.openSessions} live` : `Last active ${project.lastActive}`}
            </span>
            <span className="text-ink-faint">Owner {PEOPLE[project.owner].name}</span>
          </div>
        ) : null}
      </DemoCell>

      <DemoCell caption="Variant · category focus" note="Engineering, with the category panel; All categories goes back">
        <OrbitMap categories={ORBIT_ALL} kicker={["All projects", ORBIT_DATE]} eventCount={ORBIT_ALL_EVENTS} defaultCategory="Engineering" />
      </DemoCell>

      <div className="grid gap-x-6 gap-y-9 xl:grid-cols-2">
        <DemoCell caption="State · search muting" note="Filter: gal · compact tile, names show on a match">
          <OrbitMap
            categories={ORBIT_ALL}
            kicker={["All projects", ORBIT_DATE]}
            eventCount={ORBIT_ALL_EVENTS}
            query="gal"
            compact
            minWidth={340}
          />
        </DemoCell>
        <DemoCell caption={`Variant · empty categories · ${ORBIT_LAB_NAME}`} note="Ops, Documentation and Marketing hold no projects here">
          <OrbitMap
            categories={ORBIT_LAB}
            kicker={[`Space · ${ORBIT_LAB_NAME}`, ORBIT_DATE]}
            eventCount={ORBIT_LAB_EVENTS}
            compact
            minWidth={340}
          />
        </DemoCell>
        <DemoCell caption="Variant · category focus · single project" note="One project sits centered over its hub">
          <OrbitMap
            categories={ORBIT_ALL}
            kicker={["All projects", ORBIT_DATE]}
            eventCount={ORBIT_ALL_EVENTS}
            defaultCategory="Documentation"
            hidePanel
            compact
            minWidth={340}
          />
        </DemoCell>
        <DemoCell caption="State · hover" note="Halo tints to the category color, label to ink">
          <OrbitMap
            categories={ORBIT_ALL}
            kicker={["All projects", ORBIT_DATE]}
            eventCount={ORBIT_ALL_EVENTS}
            defaultCategory="Research"
            hoverProject="research-notes"
            hidePanel
            compact
            minWidth={340}
          />
        </DemoCell>
      </div>
    </div>
  );
}
