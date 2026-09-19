import { ImageResponse } from "next/og";
import { getPublishedLanding } from "@/lib/landing/queries";

export const alt = "FECAP Cases 2026 — Direções";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Arte padrão de compartilhamento (1200 × 630). Ela é usada automaticamente
 * quando não há uma imagem personalizada no CMS e também pode ser aberta em
 * /opengraph-image para conferir o resultado.
 */
export default async function OpenGraphImage() {
  const { config } = await getPublishedLanding();
  const { event, seo } = config;
  const title = seo.ogTitle || seo.title || event.name;
  const description = seo.ogDescription || seo.description;
  const dates = `${event.startDate.split("-").reverse().join(".")} — ${event.endDate.split("-").reverse().join(".")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          padding: "72px 80px",
          color: "white",
          background: "linear-gradient(125deg, #ff4b23 0%, #e23918 52%, #073775 52%, #062f68 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ position: "absolute", top: -90, right: -120, width: 540, height: 220, background: "#c8ff00", transform: "rotate(-18deg)" }} />
        <div style={{ position: "absolute", bottom: -110, left: -80, width: 600, height: 190, background: "#392bfa", transform: "rotate(-15deg)" }} />
        <div style={{ zIndex: 1, display: "flex", width: "100%", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 25, fontWeight: 800, letterSpacing: 4 }}>
            <span style={{ display: "flex", padding: "10px 16px", color: "#073775", background: "#c8ff00", fontSize: 20 }}>FECAP</span>
            CASES 2026
          </div>
          <div style={{ display: "flex", maxWidth: 750, flexDirection: "column" }}>
            <span style={{ color: "#c8ff00", fontSize: 26, fontWeight: 800, letterSpacing: 4 }}>DIREÇÕES</span>
            <span style={{ marginTop: 16, fontSize: 62, lineHeight: 1, fontWeight: 900, letterSpacing: -3 }}>{title}</span>
            <span style={{ marginTop: 22, maxWidth: 650, color: "rgba(255,255,255,.9)", fontSize: 25, lineHeight: 1.3 }}>{description}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 21, fontWeight: 700, letterSpacing: 2 }}>
            <span>{event.location}</span>
            <span>{dates}</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
