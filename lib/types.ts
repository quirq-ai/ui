import type { ComponentType } from "react";

/** One shape in the catalog: a reusable quirq UI building block and its live demo. */
export type Shape = {
  /** kebab-case, unique across the whole catalog; used as the page anchor */
  id: string;
  name: string;
  /** what the user gets from it, one sentence */
  purpose: string;
  /** product surfaces it appears in: landing, space, swarm, galileo, telescope, client, drift, visualizer */
  seenIn: string[];
  variants?: string[];
  states?: string[];
  /** renders every listed variant and state with fixture data */
  Demo: ComponentType;
  /** demo needs the full row instead of a half-width cell */
  wide?: boolean;
};

export type Category = {
  id: string;
  title: string;
  blurb: string;
  shapes: Shape[];
};
