import type { Category, Shape } from "./types";
import { CATEGORY_META } from "./category-meta";
import { shapes as brandMarks } from "@/components/shapes/brand-marks";
import { shapes as layout } from "@/components/shapes/layout";
import { shapes as actions } from "@/components/shapes/actions";
import { shapes as navigation } from "@/components/shapes/navigation";
import { shapes as formsInputs } from "@/components/shapes/forms-inputs";
import { shapes as statusFeedback } from "@/components/shapes/status-feedback";
import { shapes as overlays } from "@/components/shapes/overlays";
import { shapes as cards } from "@/components/shapes/cards";
import { shapes as listsTables } from "@/components/shapes/lists-tables";
import { shapes as dataDisplay } from "@/components/shapes/data-display";
import { shapes as metricsCharts } from "@/components/shapes/metrics-charts";
import { shapes as timelinesActivity } from "@/components/shapes/timelines-activity";
import { shapes as graphsTrees } from "@/components/shapes/graphs-trees";
import { shapes as chatThreads } from "@/components/shapes/chat-threads";
import { shapes as mediaFiles } from "@/components/shapes/media-files";
import { shapes as appFrames } from "@/components/shapes/app-frames";

const SHAPES: Record<string, Shape[]> = {
  "brand-marks": brandMarks,
  "layout": layout,
  "actions": actions,
  "navigation": navigation,
  "forms-inputs": formsInputs,
  "status-feedback": statusFeedback,
  "overlays": overlays,
  "cards": cards,
  "lists-tables": listsTables,
  "data-display": dataDisplay,
  "metrics-charts": metricsCharts,
  "timelines-activity": timelinesActivity,
  "graphs-trees": graphsTrees,
  "chat-threads": chatThreads,
  "media-files": mediaFiles,
  "app-frames": appFrames,
};

export const CATEGORIES: Category[] = CATEGORY_META.map((m) => ({ ...m, shapes: SHAPES[m.id] ?? [] }));

export const ALL_SHAPES = CATEGORIES.flatMap((c) => c.shapes.map((s) => ({ ...s, categoryId: c.id, categoryTitle: c.title })));

export function getCategory(id: string) {
  return CATEGORIES.find((c) => c.id === id);
}

export function shapeHref(id: string) {
  const hit = ALL_SHAPES.find((s) => s.id === id);
  return hit ? `/shapes/${hit.categoryId}#${id}` : "/shapes";
}
