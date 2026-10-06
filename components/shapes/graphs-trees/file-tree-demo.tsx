"use client";

import { useState } from "react";
import { FileExplorer } from "./file-explorer";
import { FileTreePreview } from "./file-tree-preview";
import { GrowthTree } from "./growth-tree";
import { DEMO_KIT_TREE, LANDING_TREE, PREVIEWS, PROJECTS_FOLDER, XO_SPACE_TREE } from "./file-tree-data";
import { DemoCell } from "./parts";

export function FileTreeDemo() {
  const [openedFromTree, setOpenedFromTree] = useState<string | null>(null);
  const [openedFromPane, setOpenedFromPane] = useState<string | null>(null);

  return (
    <div className="space-y-9">
      <DemoCell caption="Variant · growth tree" note="Click a branch to grow it · drag the canvas to pan">
        <GrowthTree
          root={PROJECTS_FOLDER}
          defaultOpen={["", "/xo-space", "/xo-space/space_ui", "/billing-api"]}
          height={520}
          onOpenFile={(project, path) => setOpenedFromTree(`${project}/${path}`)}
        />
        <p className="text-[12px] text-ink-faint" role="status">
          {openedFromTree ? (
            <>
              Selected <span className="font-mono text-ink-dim">{openedFromTree}</span> to preview
            </>
          ) : (
            "Pick a file in a card to select it for preview"
          )}
        </p>
      </DemoCell>

      <DemoCell caption="Variant · two-pane explorer" note="Hover a row for Copy path · folders open in place">
        <FileExplorer project="xo-space" root={XO_SPACE_TREE} onOpenFile={setOpenedFromPane} selectedPath={openedFromPane} />
      </DemoCell>

      <DemoCell caption="Variant · tree + preview" note="Arrow keys walk the tree · README opens by default">
        <FileTreePreview project="xo-space" root={XO_SPACE_TREE} previews={PREVIEWS} defaultOpen={["space_ui/", "space_ui/lib/", "reports/"]} />
      </DemoCell>

      <div className="grid gap-x-6 gap-y-9 xl:grid-cols-2">
        <DemoCell caption="State · loading · growth tree">
          <GrowthTree root={PROJECTS_FOLDER} loading height={220} />
        </DemoCell>
        <DemoCell caption="State · filter with no match">
          <GrowthTree root={PROJECTS_FOLDER} defaultQuery="kubernetes" height={150} />
        </DemoCell>
        <DemoCell caption="State · loading · two-pane">
          <FileExplorer project="galileo" root={null} state="loading" />
        </DemoCell>
        <DemoCell caption="State · unavailable">
          <FileExplorer project="billing-api" root={null} state="unavailable" unavailableReason="The Space API is unreachable. Start the space to browse its files." />
        </DemoCell>
        <DemoCell caption="State · empty · project has no files">
          <FileExplorer project="landing" root={LANDING_TREE} />
        </DemoCell>
        <DemoCell caption="State · empty · folder with no files" note="Subfolders only">
          <FileExplorer project="xo-space" root={XO_SPACE_TREE} defaultPath="space_ui/" />
        </DemoCell>
        <DemoCell caption="Variant · files only" note="No subfolders, so one pane">
          <FileExplorer project="demo-kit" root={DEMO_KIT_TREE} projectsFolder={null} />
        </DemoCell>
        <DemoCell caption="State · tree loading">
          <FileTreePreview project="xo-space" root={XO_SPACE_TREE} previews={PREVIEWS} defaultSelected={null} treeLoading />
        </DemoCell>
        <DemoCell caption="State · preview loading">
          <FileTreePreview
            project="xo-space"
            root={XO_SPACE_TREE}
            previews={PREVIEWS}
            defaultSelected="space_ui/lib/status.ts"
            previewState="loading"
            defaultPane="preview"
          />
        </DemoCell>
        <DemoCell caption="State · preview error">
          <FileTreePreview
            project="xo-space"
            root={XO_SPACE_TREE}
            previews={PREVIEWS}
            defaultSelected="package.json"
            previewState="error"
            defaultPane="preview"
          />
        </DemoCell>
        <DemoCell caption="State · unsupported file">
          <FileTreePreview
            project="xo-space"
            root={XO_SPACE_TREE}
            previews={PREVIEWS}
            defaultOpen={["engine/"]}
            defaultSelected="engine/sessions.py"
            defaultPane="preview"
          />
        </DemoCell>
        <DemoCell caption="State · no selection">
          <FileTreePreview project="xo-space" root={XO_SPACE_TREE} previews={PREVIEWS} defaultSelected={null} defaultPane="preview" />
        </DemoCell>
      </div>
    </div>
  );
}
