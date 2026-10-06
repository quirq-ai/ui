// forms-inputs: fields, pickers, toggles and the flows for adding, sharing and signing in.
// Reusable components live in the shape files (text-fields.tsx, search-field.tsx, …);
// the *-demo.tsx files feed them fixture data and show every variant and state.
import type { Shape } from "@/lib/types";
import { TextFieldsDemo } from "./text-fields-demo";
import { SearchFieldDemo } from "./search-field-demo";
import { TogglesDemo } from "./toggles-demo";
import { PickersDemo } from "./pickers-demo";
import { EntryFormDemo } from "./entry-form-demo";
import { SettingsFormDemo } from "./settings-form-demo";
import { WizardDemo } from "./wizard-demo";
import { SecretsEditorDemo } from "./secrets-editor-demo";
import { DeviceSignInDemo } from "./device-sign-in-demo";
import { DropzoneDemo } from "./dropzone-demo";
import { ShareAndAccessDemo } from "./share-and-access-demo";
import { RangeSliderDemo } from "./range-slider-demo";
import { BudgetSetterDemo } from "./budget-setter-demo";

export const shapes: Shape[] = [
  {
    id: "text-fields",
    name: "Text fields",
    purpose: "Typed entry including secrets, numbers and rich text.",
    seenIn: [
      "space-ui:text-field-family",
      "client:form-fields",
      "client:readonly-env-field",
      "swarm:secret-input-reveal",
      "swarm:number-stepper",
      "swarm:rich-text-editor",
    ],
    variants: ["mono", "password reveal", "read-only env", "number stepper", "rich text", "inline in sentence"],
    states: ["focus", "invalid", "disabled"],
    Demo: TextFieldsDemo,
  },
  {
    id: "search-field",
    name: "Search and faceted filter",
    purpose: "Find and filter with a visible shortcut.",
    seenIn: ["space-ui:contextual-page-search", "viz:search-with-kbd", "swarm:search-filter-input", "swarm:faceted-filter"],
    variants: ["topbar", "page filter", "faceted popover with counts", "email search"],
    states: ["focus", "muting non-matches"],
    Demo: SearchFieldDemo,
  },
  {
    id: "toggles",
    name: "Switches, checkboxes, radio cards",
    purpose: "Binary and choice settings.",
    seenIn: [
      "space-ui:switch-and-checkbox",
      "space-ui:source-checkbox-group",
      "swarm:toggle-switch",
      "swarm:radio-card-choice",
      "client:switch-toggle-row",
      "viz:toggle-switch",
    ],
    variants: ["switch row", "source checkbox group", "radio card", "ON/OFF toggle"],
    states: ["on/off", "disabled", "busy"],
    Demo: TogglesDemo,
  },
  {
    id: "pickers",
    name: "Select, period and date pickers",
    purpose: "Choose a project, window or date.",
    seenIn: ["space-ui:date-picker-calendar", "swarm:period-range-picker", "client:usage-header-period-picker", "client:project-picker-select"],
    variants: ["project picker", "Last 7/15/30/Custom", "2-month range", "job calendar with run dots"],
    states: ["placeholder", "today", "selected", "future disabled"],
    Demo: PickersDemo,
  },
  {
    id: "entry-form",
    name: "Add and create forms",
    purpose: "Create a space, source, project or app with inline validation.",
    seenIn: [
      "galileo:add-source-form",
      "client:add-app-form-card",
      "space-ui:add-project-form",
      "swarm:space-create-form",
      "swarm:template-deploy-form",
      "swarm:provider-channel-builder",
      "landing:contact-form",
    ],
    variants: ["create space", "add source", "add app", "clone project", "provider/channel builder", "contact", "template deploy"],
    states: ["submitting", "error", "success toast"],
    Demo: EntryFormDemo,
  },
  {
    id: "settings-form",
    name: "Settings form with preview",
    purpose: "Branding, theme and folder settings with live preview.",
    seenIn: ["space-ui:branding-editor-preview", "space-ui:theme-picker-swatches", "space-ui:path-settings-form"],
    variants: ["branding", "theme swatches", "folder paths with apply command"],
    states: ["Unsaved changes", "Saved", "Pending restart"],
    Demo: SettingsFormDemo,
  },
  {
    id: "wizard",
    name: "Wizard and numbered stepper",
    purpose: "Gate a multi-step flow.",
    seenIn: ["swarm:step-flow", "client:numbered-stepper", "space-ui:job-editor-wizard"],
    variants: ["two-step sign-in", "job editor presets", "Step 2 of 7 progress"],
    states: ["active", "disabled", "done", "error"],
    Demo: WizardDemo,
  },
  {
    id: "secrets-editor",
    name: "Secrets editor",
    purpose: "Write-only env values for a space.",
    seenIn: ["swarm:secrets-manager", "client:env-paste-composer", "client:expandable-credential-row", "space-ui:secrets-list", "space-ui:api-key-panel"],
    variants: ["iOS grouped", "setup card", "expandable credential row", "BYO key panel"],
    states: ["saving", "empty", "configured / not set"],
    Demo: SecretsEditorDemo,
  },
  {
    id: "device-sign-in",
    name: "Device code and QR sign-in",
    purpose: "One-time code or QR for a provider.",
    seenIn: ["swarm:device-code-display", "swarm:whatsapp-qr-pairing", "client:device-code-display"],
    variants: ["GitHub", "ChatGPT", "WhatsApp QR"],
    states: ["waiting", "shown", "connected"],
    Demo: DeviceSignInDemo,
  },
  {
    id: "dropzone",
    name: "File dropzone",
    purpose: "Add files to a space with staging and progress.",
    seenIn: ["swarm:file-dropzone", "client:file-dropzone-uploader"],
    variants: ["space files", "knowledge base"],
    states: ["drag-over", "staged", "uploading"],
    Demo: DropzoneDemo,
  },
  {
    id: "share-and-access",
    name: "Share and access",
    purpose: "Share a project to another space; manage members.",
    seenIn: ["space-ui:inline-share-form", "space-ui:share-composer", "space-ui:sharing-detail-panel", "swarm:people-access-list", "client:share-dialog"],
    variants: ["inline form", "two-step composer", "dialog", "members list", "shared detail"],
    states: ["sharing", "invalid id", "shared"],
    Demo: ShareAndAccessDemo,
  },
  {
    id: "range-slider",
    name: "Range slider",
    purpose: "Set a bounded number by dragging, with a live mono readout.",
    seenIn: ["landing:range-slider-field", "landing:ms-calculator-panel"],
    variants: ["primary field (hours 1 to 40; rate $25 to $400, step 5)", "inline lever (label left, 170px slider, 60px % output)"],
    states: ["idle", "dragging", "focus", "disabled"],
    Demo: RangeSliderDemo,
  },
  {
    id: "budget-setter",
    name: "Budget B setter",
    purpose: "Let the owner set potential quirqs before the work runs.",
    seenIn: ["viz:quirq-mint-flow (B → Q)", "landing:mint-rule-card"],
    variants: ["inline on a work item", "field in a new task form"],
    states: ["unset", "set", "locked once work starts"],
    Demo: BudgetSetterDemo,
  },
];
