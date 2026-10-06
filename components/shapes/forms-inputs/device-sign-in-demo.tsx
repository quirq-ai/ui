"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RuntimeLogo } from "@/components/ui/runtime-logo";
import { CURRENT_USER, DEVICE_SIGN_IN } from "@/lib/fixtures";
import { DemoCell, DemoGrid, DemoRule } from "./_kit";
import { DeviceCodeCard, QrPairing, type DeviceCodeState, type QrState } from "./device-sign-in";
import { useTimers } from "./_timers";

const GITHUB = { url: "https://github.com/login/device", label: "github.com/login/device" };

function ChatGptRow() {
  const later = useTimers();
  const [state, setState] = useState<DeviceCodeState>("waiting_code");
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (state !== "waiting_code") return;
    const t = setTimeout(() => setState("shown"), 1200);
    return () => clearTimeout(t);
  }, [state, round]);

  return (
    <div className="flex flex-col gap-3">
      <DeviceCodeCard
        layout="inline"
        provider="ChatGPT"
        logo={<RuntimeLogo id="openai" size={14} decorative />}
        code={state === "waiting_code" ? null : "K7QF-2M9D"}
        state={state}
        verifyUrl="#"
        verifyLabel="ChatGPT sign-in"
        openAs="button"
        onOpen={() => later(() => setState("connected"), 2200)}
        account={CURRENT_USER.email}
      />
      <div>
        <Button
          size="sm"
          variant="subtle"
          leadingIcon={<RotateCcw aria-hidden="true" />}
          onClick={() => {
            setState("waiting_code");
            setRound((r) => r + 1);
          }}
        >
          Start over
        </Button>
      </div>
    </div>
  );
}

function WhatsAppPairing() {
  const later = useTimers();
  const [state, setState] = useState<QrState>("qr");
  // Seconds since the QR first showed; every 20 a new code (seed) replaces the old one.
  const [elapsed, setElapsed] = useState(0);
  const seed = 4100 + Math.floor(elapsed / 20);
  const left = 20 - (elapsed % 20);

  useEffect(() => {
    if (state !== "qr") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  const connect = () => {
    setState("connecting");
    later(() => {
      setElapsed(0);
      setState("qr");
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-3">
      <QrPairing state={state} seed={seed} secondsLeft={left} onConnect={connect} onRetry={connect} linked="Linked to Ada's phone. Messages arrive in Inbox." />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11.5px] text-ink-faint">Simulate</span>
        <Button size="sm" variant="secondary" disabled={state !== "qr"} onClick={() => setState("success")}>
          Phone scans
        </Button>
        <Button size="sm" variant="secondary" disabled={state !== "qr"} onClick={() => setState("error")}>
          Connection drops
        </Button>
        <Button size="sm" variant="subtle" disabled={state === "idle"} onClick={() => setState("idle")}>
          Reset
        </Button>
      </div>
    </div>
  );
}

export function DeviceSignInDemo() {
  const gh = <RuntimeLogo id="github" size={18} decorative />;
  return (
    <div>
      <DemoCell label="GitHub · centered card · waiting, shown, connected">
        <div className="grid gap-4 md:grid-cols-3">
          <DeviceCodeCard provider="GitHub" logo={gh} code={null} state="waiting_code" verifyUrl={GITHUB.url} verifyLabel={GITHUB.label} />
          <DeviceCodeCard
            provider="GitHub"
            logo={gh}
            code={DEVICE_SIGN_IN.code}
            state="shown"
            verifyUrl={GITHUB.url}
            verifyLabel={GITHUB.label}
            expires={`Expires in ${DEVICE_SIGN_IN.expiresIn}`}
          />
          <DeviceCodeCard provider="GitHub" logo={gh} code={DEVICE_SIGN_IN.code} state="connected" verifyUrl={GITHUB.url} verifyLabel={GITHUB.label} account={CURRENT_USER.handle} />
        </div>
      </DemoCell>

      <DemoRule />

      <DemoGrid>
        <DemoCell label="ChatGPT · inline row" note="Code arrives, Open, then connected">
          <ChatGptRow />
        </DemoCell>
        <DemoCell label="WhatsApp QR" note="Idle, connecting, QR, success, error">
          <WhatsAppPairing />
        </DemoCell>
        <DemoCell label="WhatsApp QR · error">
          <QrPairing state="error" seed={7} />
        </DemoCell>
        <DemoCell label="Local space · device link">
          <DeviceCodeCard
            layout="inline"
            provider="your account"
            code={DEVICE_SIGN_IN.code}
            state="shown"
            verifyUrl={DEVICE_SIGN_IN.verifyUrl}
            verifyLabel={DEVICE_SIGN_IN.verifyUrl.replace("http://", "")}
            account={DEVICE_SIGN_IN.account}
          />
        </DemoCell>
      </DemoGrid>
    </div>
  );
}
