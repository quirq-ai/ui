// Shared UI primitives. Import from "@/components/ui".
// Client components (CopyButton, CopyField, Segmented, TabChips, Switch) carry their own
// "use client" boundary and are re-exported by name, so this barrel is safe to import from
// server components.

export * from "./tones";
export * from "./button";
export * from "./badge";
export * from "./status";
export * from "./panel";
export * from "./kbd";
export * from "./avatar";
export * from "./loaders";
export * from "./tooltip";
export * from "./runtime-logo";
export {
  Field,
  Fieldset,
  Input,
  Textarea,
  Select,
  SearchInput,
  Checkbox,
  Radio,
  type FieldProps,
  type FieldsetProps,
  type ControlSize,
  type InputProps,
  type TextareaProps,
  type SelectProps,
  type SearchInputProps,
  type CheckboxProps,
  type RadioProps,
} from "./field";

/* client components */
export { Switch, type SwitchProps } from "./switch";
export { CopyButton, CopyField, copyText, type CopyButtonProps, type CopyFieldProps } from "./copy-button";
export {
  Segmented,
  TabChips,
  type SegmentedOption,
  type SegmentedProps,
  type TabChipItem,
  type TabChipsProps,
} from "./segmented";
