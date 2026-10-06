// Plain CSS for the few rules Tailwind would need bracketed arbitrary variants for (":has()"
// focus rings on field shells, number and search input chrome, rich text lists). React 19
// hoists and dedupes this <style> by href, so every component can render it safely.
// Kept out of Tailwind on purpose: bracketed variants get re-scanned from compressed build
// caches and can produce invalid selectors.
const CSS = `
.fi-ring:has(input:focus-visible),
.fi-ring:has(textarea:focus-visible),
.fi-ring:has([role="textbox"]:focus-visible) {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
  border-color: rgba(255, 255, 255, 0.3);
}
.fi-ring-any:has(:focus-visible) {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}
.fi-num { appearance: textfield; -moz-appearance: textfield; }
.fi-num::-webkit-inner-spin-button,
.fi-num::-webkit-outer-spin-button { -webkit-appearance: none; appearance: none; margin: 0; }
.fi-time::-webkit-calendar-picker-indicator { display: none; }
.fi-rte b, .fi-rte strong { font-weight: 600; }
.fi-rte ul { list-style: disc; margin-left: 1.25rem; }
.fi-rte ol { list-style: decimal; margin-left: 1.25rem; }
.fi-rte li { margin: 2px 0; }
.fi-rows > * { padding: 14px 16px; }
.fi-range {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  min-width: 0;
  border-radius: 999px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.18);
}
.fi-range:focus-visible { outline: none !important; }
.fi-range::-moz-range-track { background: transparent; }
.fi-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: var(--fi-thumb, var(--blu));
  border: 3px solid #000;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.25);
  transition: transform 0.15s var(--ease), box-shadow 0.15s var(--ease);
}
.fi-range::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: var(--fi-thumb, var(--blu));
  border: 3px solid #000;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.25);
}
.fi-range:active::-webkit-slider-thumb,
.fi-range[data-dragging]::-webkit-slider-thumb {
  transform: scale(1.12);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.4), 0 0 0 7px color-mix(in srgb, var(--fi-thumb, var(--blu)) 24%, transparent);
}
.fi-range:focus-visible::-webkit-slider-thumb,
.fi-range[data-focus]::-webkit-slider-thumb { outline: 2px solid var(--ink); outline-offset: 2px; }
.fi-range:focus-visible::-moz-range-thumb,
.fi-range[data-focus]::-moz-range-thumb { outline: 2px solid var(--ink); outline-offset: 2px; }
.fi-range:disabled { cursor: not-allowed; opacity: 0.45; }
`;

/** Renders the category stylesheet once per document. */
export function FormStyles() {
  return (
    <style href="quirq-forms-inputs" precedence="medium">
      {CSS}
    </style>
  );
}
