"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LandingConfig } from "@/lib/landing/schema";

const DEVICES = {
  desktop: { label: "Desktop", icon: "🖥", width: 1440 },
  tablet: { label: "Tablet", icon: "▭", width: 820 },
  mobile: { label: "Mobile", icon: "📱", width: 390 },
} as const;

type Device = keyof typeof DEVICES;

export const PREVIEW_MESSAGE = "fecap-landing-preview";
export const PREVIEW_READY = "fecap-landing-preview-ready";

/**
 * Preview = iframe que renderiza os MESMOS componentes da landing pública, recebendo o
 * rascunho por postMessage. O iframe tem a largura real do dispositivo (media queries
 * de verdade) e é reduzido com scale para caber no painel.
 */
export function LandingPreview({ config, focusSectionId }: { config: LandingConfig; focusSectionId: string | null }) {
  const [device, setDevice] = useState<Device>("desktop");
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [ready, setReady] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const latest = useRef({ config, focusSectionId });
  latest.current = { config, focusSectionId };

  const send = useCallback(() => {
    frame.current?.contentWindow?.postMessage({ type: PREVIEW_MESSAGE, ...latest.current }, window.location.origin);
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== PREVIEW_READY) return;
      setReady(true);
      send();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [send]);

  // Atualiza o preview a cada edição (com um pequeno debounce para digitação).
  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(send, 120);
    return () => window.clearTimeout(timer);
  }, [config, focusSectionId, ready, send]);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => setBox({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const deviceWidth = DEVICES[device].width;
  const scale = box.width > 0 ? Math.min(1, box.width / deviceWidth) : 1;

  return (
    <div className="adm-preview">
      <div className="adm-preview-bar">
        <div className="adm-segmented" role="group" aria-label="Tamanho do preview">
          {(Object.keys(DEVICES) as Device[]).map((key) => (
            <button type="button" aria-pressed={device === key} onClick={() => setDevice(key)} key={key}>
              <span aria-hidden="true">{DEVICES[key].icon}</span> {DEVICES[key].label}
            </button>
          ))}
        </div>
        <span className="adm-preview-note">
          {deviceWidth}px · {Math.round(scale * 100)}%
        </span>
      </div>

      <div className="adm-preview-stage" ref={stage}>
        <iframe
          ref={frame}
          title="Preview da landing page"
          src="/admin/landing-page/preview"
          style={{
            width: deviceWidth,
            height: box.height > 0 ? box.height / scale : "100%",
            transform: `scale(${scale})`,
            marginLeft: Math.max(0, (box.width - deviceWidth * scale) / 2),
          }}
        />
        {!ready && <p className="adm-preview-loading">Carregando preview…</p>}
      </div>
    </div>
  );
}
