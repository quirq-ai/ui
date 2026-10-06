// Orbit map datasets from the shared fixtures: every project by category, and the
// research-lab space alone (three categories empty, drawn as dim stubs).
import { ACTIVITY, ORBIT_CATEGORIES, PROJECTS, SPACE_BY_ID, type ActivityEvent, type Project } from "@/lib/fixtures";
import { formatDate } from "@/lib/format";
import { NOW_ISO } from "@/lib/fixtures";
import type { OrbitCategoryData, OrbitProject, OrbitSatellite } from "./orbit-map";
import { tagOf } from "./project-meta";

function eventLabel(e: ActivityEvent): string {
  if (e.type === "file.edited") return `Edited ${e.detail.split("/").pop()}`;
  return e.label;
}

function toOrbitProject(p: Project): OrbitProject {
  const latest = ACTIVITY.find((e) => e.projectId === p.id);
  const satellites: OrbitSatellite[] = [];
  if (p.sessions) satellites.push({ label: `${p.sessions} ${p.sessions === 1 ? "session" : "sessions"}`, kind: "sessions" });
  if (p.openSessions) satellites.push({ label: `${p.openSessions} live`, kind: "live" });
  if (latest) satellites.push({ label: eventLabel(latest), kind: "event" });
  if (!satellites.length) satellites.push({ label: "Project context", kind: "setup" });
  return {
    id: p.id,
    name: p.displayName,
    glyph: tagOf(p.id).slice(0, 1),
    sessions: p.sessions,
    live: p.openSessions,
    lastActive: p.lastActive,
    satellites,
  };
}

function build(projects: Project[]): OrbitCategoryData[] {
  return ORBIT_CATEGORIES.map((c) => {
    const members = projects.filter((p) => p.category === c.id);
    return {
      id: c.id,
      name: c.id,
      color: `var(--${c.color})`,
      blurb: c.blurb,
      events: ACTIVITY.filter((e) => members.some((m) => m.id === e.projectId)).length,
      projects: members.map(toOrbitProject),
    };
  });
}

export const ORBIT_ALL = build(PROJECTS);
export const ORBIT_ALL_EVENTS = ACTIVITY.filter((e) => e.projectId).length;

const LAB = SPACE_BY_ID["ws_2b81d0e4"];
export const ORBIT_LAB = build(PROJECTS.filter((p) => p.spaceId === LAB.id));
export const ORBIT_LAB_NAME = LAB.name;
export const ORBIT_LAB_EVENTS = ACTIVITY.filter((e) => e.projectId && PROJECTS.find((p) => p.id === e.projectId)?.spaceId === LAB.id).length;

export const ORBIT_DATE = formatDate(NOW_ISO, { withYear: true, weekday: false });
