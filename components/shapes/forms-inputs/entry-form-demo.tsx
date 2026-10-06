"use client";

import { Cpu, Send, Workflow } from "lucide-react";
import { RuntimeLogo } from "@/components/ui/runtime-logo";
import { CURRENT_USER, GALILEO, GALILEO_SOURCES, RUNTIMES, SPACES } from "@/lib/fixtures";
import { DemoCell, DemoGrid, DemoRule } from "./_kit";
import {
  AddAppForm,
  AddSourceForm,
  CloneProjectForm,
  ContactForm,
  CreateSpaceForm,
  TemplateDeployForm,
  type BuilderOption,
} from "./entry-form";
import { FormToast } from "./form-toast";

const SOURCE_NAMES = GALILEO_SOURCES.map((s) => s.name);
const SPACE_NAMES = SPACES.map((s) => s.name);

const PROVIDERS: BuilderOption[] = [
  {
    id: "anthropic",
    label: "Anthropic",
    icon: <RuntimeLogo id="anthropic" size={14} decorative />,
    fields: [{ key: "key", label: "Anthropic API key", placeholder: "sk-ant-…" }],
  },
  {
    id: "openai",
    label: "OpenAI",
    icon: <RuntimeLogo id="openai" size={14} decorative />,
    fields: [{ key: "key", label: "OpenAI API key", placeholder: "sk-…" }],
  },
  { id: "openrouter", label: "OpenRouter", fields: [{ key: "key", label: "OpenRouter API key", placeholder: "sk-or-…" }] },
];

const CHANNELS: BuilderOption[] = [
  {
    id: "telegram",
    label: "Telegram",
    icon: <Send aria-hidden="true" className="size-3.5" />,
    fields: [{ key: "token", label: "Bot token", placeholder: "Enter bot token…", help: "In Telegram, message BotFather and send /newbot to create a bot." }],
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: <RuntimeLogo id="whatsapp" size={14} decorative />,
    fields: [],
    note: "You pair a phone with a QR code once the space is running.",
  },
  {
    id: "slack",
    label: "Slack",
    icon: <RuntimeLogo id="slack" size={14} decorative />,
    fields: [
      { key: "bot", label: "Bot token", placeholder: "xoxb-…" },
      { key: "app", label: "App token", placeholder: "xapp-…", help: "Needs the connections:write scope." },
    ],
  },
];

const RUNTIME_OPTIONS = RUNTIMES.filter((r) => r.id !== "cursor").map((r) => ({ value: r.id, label: r.label }));

const cpu = <Cpu aria-hidden="true" className="size-4 text-ink-dim" />;
const SIZES = [
  { value: "small", title: "Small", description: "2 vCPU · 4 GB memory", icon: cpu },
  { value: "medium", title: "Medium", description: "4 vCPU · 8 GB memory", icon: cpu },
  { value: "large", title: "Large", description: "8 vCPU · 16 GB memory · on Enterprise", icon: cpu, disabled: true },
];

export function EntryFormDemo() {
  return (
    <div>
      <DemoCell label="Add source · galileo" note="Try 70000, 4100, https://example.com, Web_App or ~/out/report.html">
        <AddSourceForm existing={SOURCE_NAMES} gatewayPort={GALILEO.port} />
      </DemoCell>

      <DemoGrid cols={3} className="mt-9">
        <DemoCell label="State · error">
          <AddSourceForm existing={SOURCE_NAMES} defaultName="web" defaultLocation="70000" validateOnMount />
        </DemoCell>
        <DemoCell label="State · submitting">
          <AddSourceForm existing={SOURCE_NAMES} defaultName="drafts" defaultLocation="~/drafts" submitting />
        </DemoCell>
        <DemoCell label="Name suggested from path">
          <AddSourceForm existing={SOURCE_NAMES} defaultName="report" defaultLocation="~/out/report.html" />
        </DemoCell>
      </DemoGrid>

      <DemoRule />

      <DemoGrid>
        <DemoCell label="Clone project" note="Locks while cloning, then toasts">
          <CloneProjectForm projectsFolder="~/xo-projects" outcome="warning" defaultUrl="https://github.com/fictional-workspace/xo-docs.git" />
        </DemoCell>
        <DemoCell label="Add app · success toast">
          <div className="flex flex-col gap-4">
            <AddAppForm gatewayPort={GALILEO.port} />
            <FormToast tone="success" title="Added docs" description={`Opens at docs.localhost:${GALILEO.port}`} />
            <FormToast tone="error" title="Couldn't add storybook" description="Nothing answered on port 6006. Start the dev server, then add it again." />
          </div>
        </DemoCell>
        <DemoCell label="Create space · provider and channel builder" note="Create as is to see the errors">
          <CreateSpaceForm
            runtimes={RUNTIME_OPTIONS}
            providers={PROVIDERS}
            channels={CHANNELS}
            existingNames={SPACE_NAMES}
            defaultName="new"
            defaultChannels={["telegram"]}
          />
        </DemoCell>
        <DemoCell label="Template deploy" note="n8n template">
          <TemplateDeployForm
            template={{
              name: "n8n",
              description: "Workflow automation in its own space, with persistent storage.",
              icon: <Workflow aria-hidden="true" className="size-4 text-org" />,
            }}
            sizes={SIZES}
            defaultName="space-07"
            hostPattern="{name}.spaces.example.com"
            existingNames={SPACE_NAMES}
            resultFields={[{ label: "Sign-in email", value: CURRENT_USER.email }]}
          />
        </DemoCell>
      </DemoGrid>

      <DemoRule />

      <DemoCell label="Contact · desktop 2-col, mobile stacked" note="Required fields validate on Send">
        <ContactForm
          targets={["Our cloud", "Your cloud", "On-prem", "Air-gapped"]}
          aside={
            <>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">Talk to the team</p>
              <p>
                Evaluating for a team? Ask for the deployment guide and a walkthrough of the unit-of-work ledger with your own numbers.
              </p>
              <dl className="flex flex-col gap-2.5 border-t border-hair-soft pt-4 text-[13px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-faint">Inbox</dt>
                  <dd className="font-mono text-ink">team@example.com</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-faint">Site</dt>
                  <dd className="font-mono text-ink">quirq.ai</dd>
                </div>
              </dl>
            </>
          }
        />
      </DemoCell>
    </div>
  );
}
