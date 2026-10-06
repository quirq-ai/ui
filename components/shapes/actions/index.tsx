// Buttons and actions: pill CTAs, app buttons, icon buttons, copy and shortcuts.
// Reusable pieces live beside their demos and are re-exported at the bottom for sample apps.
import type { Shape } from "@/lib/types";
import { PillCtaDemo } from "./pill-cta-demo";
import { ButtonSetDemo } from "./button-set-demo";
import { IconButtonDemo } from "./icon-button-demo";
import { CopyButtonDemo } from "./copy-button-demo";
import { KbdDemo } from "./kbd-demo";

export const shapes: Shape[] = [
  {
    id: "pill-cta",
    name: "White pill CTA",
    purpose: "Primary call to action; one per page.",
    seenIn: ["landing:pill-button", "landing:ms-cta-block", "galileo:primary-button"],
    variants: ["primary", "ghost", "green mono Create agent", "nav mono Get started", "lime Add", "Machine Speed square mono"],
    states: ["hover lift -2px", "focus ring", "disabled .6"],
    Demo: PillCtaDemo,
  },
  {
    id: "button-set",
    name: "Button set",
    purpose: "App actions: primary, outline, ghost, danger, text.",
    seenIn: ["space-ui:button-set", "client:buttons", "viz:button-family"],
    variants: ["primary", "outline", "ghost", "danger", "warning restart", "text", "iOS 48px pill"],
    states: ["hover", "focus", "disabled", "busy"],
    Demo: ButtonSetDemo,
  },
  {
    id: "icon-button",
    name: "Icon button",
    purpose: "Compact icon actions named by tooltip.",
    seenIn: ["space-ui:icon-button", "galileo:icon-button", "client:glass-back-button"],
    variants: ["pin", "reload", "open external", "trash", "close", "glass back"],
    states: ["hover", "pressed", "disabled .35"],
    Demo: IconButtonDemo,
  },
  {
    id: "copy-button",
    name: "Copy button",
    purpose: "One-click copy with visible result.",
    seenIn: ["landing:command-copy", "space-ui:copy-button", "swarm:copy-to-clipboard", "client:copy-to-clipboard-button"],
    variants: ["install command pill", "Space ID", "device code", "copy invite"],
    states: ["idle", "copied 1.5s", "error"],
    Demo: CopyButtonDemo,
  },
  {
    id: "kbd",
    name: "Keyboard hint",
    purpose: "Teach shortcuts inline.",
    seenIn: ["space-ui:kbd-hint", "viz:kbd-keycap"],
    variants: ["⌘K", "/", "Esc ↑↓↵", "WASD cluster", "in-button chip"],
    states: ["fades on focus", "pressed"],
    Demo: KbdDemo,
  },
];

export { PillCta, PillCtaLink, pillCtaClasses, CtaBlock, AdvisorCard } from "./pill-cta";
export type {
  PillCtaProps,
  PillCtaLinkProps,
  PillCtaLookProps,
  PillCtaVariant,
  PillCtaSize,
  PillCtaPreview,
  CtaBlockProps,
  AdvisorCardProps,
} from "./pill-cta";
export { ActionButton, useBusyAction } from "./button-set";
export { actionButtonClasses } from "./button-look";
export type { ActionButtonProps } from "./button-set";
export type { ActionVariant, ActionSize, ActionPreview, ActionButtonLookProps } from "./button-look";
export { IconAction, IconActionLink, iconActionClasses, ReloadGlyph, OpenExternalGlyph } from "./icon-action";
export type {
  IconActionProps,
  IconActionLinkProps,
  IconActionLookProps,
  IconActionVariant,
  IconActionSize,
  IconActionPreview,
  IconPressedTone,
} from "./icon-action";
export { CopyAction, InstallCommand, CopyId, DeviceCode, CopyToast, useCopyAction, COPY_RESET_MS, COPY_ERROR_MESSAGE } from "./copy-actions";
export type {
  CopyActionProps,
  CopyActionVariant,
  InstallCommandProps,
  CopyIdProps,
  DeviceCodeProps,
  CopyToastProps,
  CopyStatus,
  Copier,
  UseCopyActionOptions,
} from "./copy-actions";
export { ShortcutTrigger, HintBar, Keycap, KeyCluster, KbdButton, ControlsGrid, platformKeys } from "./keyboard-hints";
export type { ShortcutTriggerProps, Hint, KeycapSize, KeyClusterProps, KbdButtonProps, KbdButtonVariant, ControlRow, Platform } from "./keyboard-hints";
