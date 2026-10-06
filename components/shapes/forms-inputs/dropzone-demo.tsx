"use client";

import { CURRENT_SPACE, PROJECT_BY_ID } from "@/lib/fixtures";
import { DemoCell, DemoGrid, DemoRule } from "./_kit";
import { FileDropzone, type StagedFile } from "./dropzone";

const STAGED: StagedFile[] = [
  { id: "f1", name: "quirq-whitepaper-v3.pdf", size: Math.round(2.4 * 1024 * 1024) },
  { id: "f2", name: "ledger-2026-09.csv", size: 18 * 1024 },
];
const NOTES = PROJECT_BY_ID["research-notes"];

export function DropzoneDemo() {
  return (
    <div>
      <DemoGrid>
        <DemoCell label="Space files · staged" note="Drop, browse, remove, upload">
          <FileDropzone
            destination={CURRENT_SPACE.name}
            title={`Add files to ${CURRENT_SPACE.name}`}
            initialFiles={[...STAGED, { id: "f3", name: "board-recording.mov", size: 318 * 1024 * 1024 }]}
          />
        </DemoCell>
        <DemoCell label="Knowledge base" note="One file; a new one replaces it">
          <FileDropzone
            destination={NOTES.displayName}
            title={`Knowledge for ${NOTES.displayName}`}
            multiple={false}
            accept=".pdf,.md,.txt"
            hint="One PDF, Markdown or text file · up to 10 MB"
            maxBytes={10 * 1024 * 1024}
          />
        </DemoCell>
      </DemoGrid>

      <DemoRule />

      <DemoGrid cols={3}>
        <DemoCell label="State · drag-over">
          <FileDropzone destination={CURRENT_SPACE.name} forceDragOver />
        </DemoCell>
        <DemoCell label="State · uploading">
          <FileDropzone destination={CURRENT_SPACE.name} initialFiles={STAGED} forcePhase="uploading" forceProgress={62} />
        </DemoCell>
        <DemoCell label="State · done">
          <FileDropzone destination={CURRENT_SPACE.name} initialFiles={STAGED} defaultDone />
        </DemoCell>
      </DemoGrid>
    </div>
  );
}
