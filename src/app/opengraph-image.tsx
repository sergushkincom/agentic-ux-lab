import { ImageResponse } from "next/og";

/**
 * Link preview for the whole site (every route inherits it).
 * `next/og` cannot read CSS variables, so the colours are copied from the
 * light theme in `src/app/tokens.css` (`--bg`, `--fg`, `--fg-muted`, `--accent`).
 */
const paper = "#fafafa";
const ink = "#1d1d1f";
const muted = "#6e6e73";
const accent = "#0066cc";

export const alt = "Agentic UX Lab — interaction problems in AI and enterprise software, built rather than described.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const padX = 96;
const padY = 84;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: size.width,
          height: size.height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: paper,
          padding: `${padY}px ${padX}px`,
        }}
      >
        <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: accent }}>
          Design lab · one experiment at a time
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-2px",
              color: ink,
            }}
          >
            Agentic UX Lab
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              width: size.width - padX * 2,
              fontSize: 34,
              fontWeight: 700,
              lineHeight: 1.35,
              color: muted,
            }}
          >
            Interaction problems in AI and enterprise software, built rather than described.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24, fontWeight: 700, color: muted }}>
          agentic-ux-lab.vercel.app
        </div>
      </div>
    ),
    { ...size },
  );
}
