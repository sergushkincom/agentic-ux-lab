import { isDedicatedPreview } from "./preview-kind";

const SANS =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

/**
 * A drawn miniature of each prototype, so the index reads as a set of
 * objects rather than a list of titles. Tokens keep the light and dark
 * themes in step. The usage widget stays dark, the way that experiment is built.
 */
export function ExperimentPreview({ slug }: { slug: string }) {
  if (!isDedicatedPreview(slug)) {
    return (
      <Stage>
        <Plate />
      </Stage>
    );
  }

  switch (slug) {
    case "workflow-canvas":
      return (
        <Stage>
          <WorkflowCanvas />
        </Stage>
      );
    case "usage-widget":
      return (
        <Stage ink>
          <UsageWidget />
        </Stage>
      );
    case "translation-trust":
      return (
        <Stage>
          <TranslationTrust />
        </Stage>
      );
    case "knowledge-atlas":
      return (
        <Stage>
          <KnowledgeAtlas />
        </Stage>
      );
    case "keyword-tracker":
      return (
        <Stage>
          <KeywordTracker />
        </Stage>
      );
    case "permission-rings":
      return (
        <Stage>
          <PermissionRings />
        </Stage>
      );
    default: {
      const _exhaustive: never = slug;
      return _exhaustive;
    }
  }
}

function Stage({ ink = false, children }: { ink?: boolean; children: React.ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className={ink ? "specimen-stage specimen-stage--ink" : "specimen-stage"}
    >
      {children}
    </div>
  );
}

function Frame({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <svg
      viewBox="0 0 640 400"
      className="block h-full w-full"
      aria-hidden="true"
      focusable="false"
      data-preview={id}
      style={{ fontFamily: SANS }}
    >
      {children}
    </svg>
  );
}

function Plate() {
  return (
    <Frame id="plate">
      <rect x="156" y="78" width="328" height="244" rx="18" fill="var(--surface)" stroke="var(--border)" />
      <rect x="188" y="122" width="180" height="12" rx="6" fill="var(--surface-strong)" />
      <rect x="188" y="150" width="264" height="12" rx="6" fill="var(--surface-strong)" />
      <rect x="188" y="178" width="220" height="12" rx="6" fill="var(--surface-strong)" />
      <rect x="188" y="206" width="140" height="12" rx="6" fill="var(--border)" />
    </Frame>
  );
}

function WorkflowCanvas() {
  return (
    <Frame id="workflow-canvas">
      <defs>
        <pattern id="wf-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1.05" fill="var(--fg-muted)" opacity="0.45" />
        </pattern>
        <filter id="wf-shadow" x="-20%" y="-30%" width="140%" height="170%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodOpacity="0.16" />
        </filter>
      </defs>
      <rect width="640" height="400" fill="url(#wf-dots)" />
      <line x1="320" y1="108" x2="320" y2="132" stroke="var(--fg-muted)" strokeWidth="1.5" opacity="0.55" />
      <line x1="320" y1="218" x2="320" y2="242" stroke="var(--fg-muted)" strokeWidth="1.5" opacity="0.55" />

      <g filter="url(#wf-shadow)">
        <rect
          x="168"
          y="22"
          width="304"
          height="86"
          rx="16"
          fill="color-mix(in srgb, var(--accent) 10%, var(--surface))"
          stroke="var(--border)"
        />
        <rect x="168" y="132" width="304" height="86" rx="16" fill="var(--surface)" stroke="var(--border)" />
        <rect
          x="168"
          y="242"
          width="304"
          height="136"
          rx="16"
          fill="var(--surface)"
          stroke="var(--accent)"
          strokeWidth="1.5"
        />
      </g>

      <text x="188" y="52" fill="var(--fg-muted)" fontSize="13" fontWeight="500">
        Trigger
      </text>
      <text x="188" y="78" fill="var(--fg)" fontSize="18" fontWeight="560">
        Ticket arrives
      </text>

      <text x="188" y="162" fill="var(--fg-muted)" fontSize="13" fontWeight="500">
        Condition
      </text>
      <text x="188" y="188" fill="var(--fg)" fontSize="18" fontWeight="560">
        Channel is email
      </text>

      <text x="188" y="272" fill="var(--fg-muted)" fontSize="13" fontWeight="500">
        AI step
      </text>
      <text x="448" y="276" fill="var(--accent)" fontSize="22" fontWeight="620" textAnchor="end">
        62%
      </text>
      <text x="188" y="300" fill="var(--fg)" fontSize="16" fontWeight="560">
        Waiting for you
      </text>

      <rect x="188" y="322" width="132" height="32" rx="16" fill="var(--surface-strong)" stroke="var(--border)" />
      <text x="254" y="343" fill="var(--fg)" fontSize="13" fontWeight="500" textAnchor="middle">
        Billing dispute
      </text>
      <rect x="328" y="322" width="112" height="32" rx="16" fill="var(--surface-strong)" stroke="var(--border)" />
      <text x="384" y="343" fill="var(--fg)" fontSize="13" fontWeight="500" textAnchor="middle">
        Integration
      </text>

      <circle cx="320" cy="108" r="3.5" fill="var(--surface)" stroke="var(--fg-muted)" />
      <circle cx="320" cy="218" r="3.5" fill="var(--surface)" stroke="var(--fg-muted)" />
    </Frame>
  );
}

const USAGE_ROWS = [
  { name: "Opus", status: "18m early", tone: "#FF9F0A", used: 0.73, meta: "5h 73%" },
  { name: "Sonnet", status: "3h 4m left", tone: "#34C759", used: 0.21, meta: "5h 21%" },
  { name: "Haiku", status: "1h 36m left", tone: "#34C759", used: 0.52, meta: "5h 52%" },
] as const;

const USAGE_SPARK = [
  0.12, 0.15, 0.18, 0.22, 0.28, 0.35, 0.42, 0.48, 0.55, 0.58, 0.62, 0.65, 0.68, 0.7, 0.71,
  0.72, 0.73, 0.73, 0.74, 0.74, 0.73, 0.73, 0.73, 0.73,
];

function UsageWidget() {
  const chart = chartPoints(USAGE_SPARK, 108, 534, 248, 286);
  const fill = `${chart} 534,286 108,286`;

  return (
    <Frame id="usage-widget">
      <defs>
        <filter id="usage-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="32" />
        </filter>
        <filter id="usage-shadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#000000" floodOpacity="0.38" />
        </filter>
      </defs>
      <rect width="640" height="400" fill="#08090c" />
      <g filter="url(#usage-blur)">
        <circle cx="110" cy="60" r="120" fill="#1e3a8a" opacity="0.7" />
        <circle cx="540" cy="48" r="100" fill="#0e7490" opacity="0.55" />
        <circle cx="300" cy="390" r="140" fill="#6d28d9" opacity="0.45" />
        <circle cx="590" cy="340" r="70" fill="#b45309" opacity="0.4" />
      </g>

      <g filter="url(#usage-shadow)">
        <rect x="72" y="22" width="496" height="356" rx="26" fill="rgba(32,32,36,0.86)" stroke="rgba(255,255,255,0.12)" />
      </g>

      {USAGE_ROWS.map((row, index) => {
        const cy = 64 + index * 58;
        return (
          <g key={row.name}>
            <MiniRing cx={118} cy={cy} used={row.used} color={row.tone} />
            <text x="150" y={cy - 10} fill="rgba(255,255,255,0.92)" fontSize="16" fontWeight="560">
              {row.name}
            </text>
            <text x="150" y={cy + 12} fill={row.tone} fontSize="14" fontWeight="500">
              {row.status}
            </text>
            <text
              x="540"
              y={cy - 2}
              fill="rgba(255,255,255,0.42)"
              fontSize="12"
              textAnchor="end"
            >
              {row.meta}
            </text>
            {index < USAGE_ROWS.length - 1 ? (
              <line
                x1="108"
                x2="540"
                y1={cy + 30}
                y2={cy + 30}
                stroke="rgba(255,255,255,0.1)"
              />
            ) : null}
          </g>
        );
      })}

      <text x="108" y="232" fill="rgba(255,255,255,0.42)" fontSize="12">
        Last 24 hours
      </text>
      <polygon points={fill} fill="#FF9F0A" opacity="0.18" />
      <polyline
        points={chart}
        fill="none"
        stroke="#FF9F0A"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      <text x="108" y="316" fill="rgba(255,255,255,0.45)" fontSize="12">
        Effort
      </text>
      <rect x="392" y="298" width="148" height="26" rx="8" fill="rgba(255,255,255,0.08)" />
      <text x="416" y="315" fill="rgba(255,255,255,0.7)" fontSize="12" textAnchor="middle">
        Low
      </text>
      <text x="458" y="315" fill="rgba(255,255,255,0.7)" fontSize="12" textAnchor="middle">
        Medium
      </text>
      <rect x="492" y="301" width="44" height="20" rx="6" fill="rgba(255,255,255,0.2)" />
      <text x="514" y="315" fill="rgba(255,255,255,0.95)" fontSize="12" textAnchor="middle">
        High
      </text>

      <text x="108" y="350" fill="rgba(255,255,255,0.45)" fontSize="13">
        Medium effort would last past the reset.
      </text>
    </Frame>
  );
}

function MiniRing({ cx, cy, used, color }: { cx: number; cy: number; used: number; color: string }) {
  const r = 16;
  const circumference = 2 * Math.PI * r;
  const dash = Math.max(used, 0.04) * circumference;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="4.5" />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference - dash}`}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <g transform={`translate(${cx - 6.5} ${cy - 6.5}) scale(${13 / 24})`} stroke="rgba(255,255,255,0.85)" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="3" r="1" fill="rgba(255,255,255,0.85)" stroke="none" />
        <line x1="12" y1="4" x2="12" y2="6.5" />
        <rect x="4.5" y="6.5" width="15" height="12" rx="4" />
        <circle cx="9.5" cy="12.5" r="1.4" fill="rgba(255,255,255,0.85)" stroke="none" />
        <circle cx="14.5" cy="12.5" r="1.4" fill="rgba(255,255,255,0.85)" stroke="none" />
      </g>
    </g>
  );
}

function chartPoints(data: readonly number[], x0: number, x1: number, yTop: number, yBottom: number): string {
  return data
    .map((value, index) => {
      const x = x0 + (index / (data.length - 1)) * (x1 - x0);
      const y = yBottom - value * (yBottom - yTop);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function TranslationTrust() {
  return (
    <Frame id="translation-trust">
      <rect x="48" y="28" width="544" height="344" rx="20" fill="var(--surface)" stroke="var(--border)" />
      <text x="76" y="68" fill="var(--fg)" fontSize="16" fontWeight="600">
        What they would read
      </text>
      <text x="564" y="68" fill="var(--accent)" fontSize="14" fontWeight="500" textAnchor="end">
        Show original
      </text>
      <line x1="76" x2="564" y1="88" y2="88" stroke="var(--border)" />

      <text x="76" y="122" fontSize="14">
        <tspan fill="var(--fg)" fontWeight="620">
          1
        </tspan>
        <tspan fill="var(--fg-muted)"> softened</tspan>
        <tspan fill="var(--fg)" fontWeight="620">
          {"  "}1
        </tspan>
        <tspan fill="var(--fg-muted)"> left out</tspan>
        <tspan fill="var(--fg)" fontWeight="620">
          {"  "}1
        </tspan>
        <tspan fill="var(--fg-muted)"> unsure</tspan>
      </text>

      <text x="76" y="176" fill="var(--fg)" fontSize="17">
        a little later than planned
      </text>
      <line
        x1="76"
        x2="292"
        y1="184"
        y2="184"
        stroke="var(--fg-muted)"
        strokeWidth="1.25"
        strokeDasharray="1.5 3.5"
        strokeLinecap="round"
      />

      <rect
        x="76"
        y="206"
        width="92"
        height="30"
        rx="8"
        fill="none"
        stroke="var(--fg-muted)"
        strokeDasharray="3 3"
      />
      <text x="122" y="226" fill="var(--fg-muted)" fontSize="14" textAnchor="middle">
        Left out
      </text>

      <text x="76" y="278" fill="var(--fg)" fontSize="17">
        contact us if Friday is essential
      </text>
      <line x1="76" x2="352" y1="286" y2="286" stroke="var(--accent)" strokeWidth="1.25" />

      <line x1="76" x2="564" y1="314" y2="314" stroke="var(--border)" />
      <text x="76" y="342" fill="var(--fg-muted)" fontSize="12" fontWeight="560">
        Original
      </text>
      <text x="140" y="342" fill="var(--fg)" fontSize="14">
        The parts will be late.
      </text>
    </Frame>
  );
}

function KnowledgeAtlas() {
  return (
    <Frame id="knowledge-atlas">
      <text x="40" y="40" fill="var(--fg-muted)" fontSize="13" fontWeight="560">
        Meetings
      </text>
      <text x="372" y="40" fill="var(--fg-muted)" fontSize="13" fontWeight="560">
        Design work
      </text>
      <text x="40" y="262" fill="var(--fg-muted)" fontSize="13" fontWeight="560">
        Unsorted
      </text>

      <Note x={36} y={54} title="Monday sync" width={196} />
      <Note x={58} y={142} title="1:1 notes" width={188} />

      <Note x={368} y={54} title="Palette" width={210} />
      <Note x={392} y={142} title="Type scale" width={196} />

      <rect
        x="36"
        y="278"
        width="200"
        height="78"
        rx="12"
        fill="none"
        stroke="var(--fg-muted)"
        strokeDasharray="4 4"
        opacity="0.7"
      />
      <Note x={292} y={278} title="Studio visit" width={210} accent />
    </Frame>
  );
}

function Note({
  x,
  y,
  title,
  width,
  accent = false,
}: {
  x: number;
  y: number;
  title: string;
  width: number;
  accent?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height="78"
        rx="12"
        fill="var(--surface)"
        stroke={accent ? "var(--accent)" : "var(--border)"}
        strokeWidth={accent ? 1.5 : 1}
      />
      <text x={x + 16} y={y + 32} fill="var(--fg)" fontSize="15" fontWeight="560">
        {title}
      </text>
      <rect x={x + 16} y={y + 44} width={width - 52} height="8" rx="4" fill="var(--surface-strong)" />
      <rect x={x + 16} y={y + 58} width={Math.max(48, width - 96)} height="8" rx="4" fill="var(--border)" />
    </g>
  );
}

const KEYWORD_DAYS = ["Thu", "Fri", "Sat", "Sun", "Mon"] as const;

const KEYWORD_ROWS = [
  { label: "cleanser", ranks: [15, 14, 12, 11, 9] },
  { label: "serum", ranks: [48, 36, 27, 18, 11] },
  { label: "cream", ranks: [4, 4, 6, 8, 7] },
] as const;

function KeywordTracker() {
  const cellW = 64;
  const cellH = 64;
  const gap = 10;
  const originX = 186;
  const originY = 88;

  return (
    <Frame id="keyword-tracker">
      <rect x="28" y="22" width="584" height="356" rx="18" fill="var(--surface)" stroke="var(--border)" />
      <text x="52" y="64" fill="var(--fg-muted)" fontSize="13" fontWeight="560">
        Keyword
      </text>
      {KEYWORD_DAYS.map((day, index) => (
        <text
          key={day}
          x={originX + index * (cellW + gap) + cellW / 2}
          y="64"
          fill="var(--fg-muted)"
          fontSize="13"
          fontWeight="560"
          textAnchor="middle"
        >
          {day}
        </text>
      ))}
      {KEYWORD_ROWS.map((row, rowIndex) => {
        const y = originY + rowIndex * (cellH + 14);
        return (
          <g key={row.label}>
            <text x="52" y={y + 38} fill="var(--fg)" fontSize="16" fontWeight="520">
              {row.label}
            </text>
            {row.ranks.map((rank, column) => {
              const x = originX + column * (cellW + gap);
              return (
                <g key={`${row.label}-${column}`}>
                  <rect x={x} y={y} width={cellW} height={cellH} rx="9" fill={rankFill(rank)} />
                  <text
                    x={x + cellW / 2}
                    y={y + cellH / 2}
                    fill="var(--fg)"
                    fontSize="15"
                    fontWeight="560"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {rank}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </Frame>
  );
}

/** Lower rank reads as a stronger cell, so the table is the chart. */
function rankFill(rank: number): string {
  const strength = Math.round((1 - Math.min(rank, 50) / 50) * 46);
  return `color-mix(in srgb, var(--accent) ${strength}%, var(--surface-strong))`;
}

const RING_CENTER = { x: 228, y: 214 };

function PermissionRings() {
  return (
    <Frame id="permission-rings">
      <circle
        cx={RING_CENTER.x}
        cy={RING_CENTER.y}
        r="132"
        fill="none"
        stroke="var(--fg-muted)"
        strokeWidth="12"
        opacity="0.35"
      />
      <circle
        cx={RING_CENTER.x}
        cy={RING_CENTER.y}
        r="86"
        fill="none"
        stroke="color-mix(in srgb, var(--accent) 55%, var(--fg-muted))"
        strokeWidth="12"
      />
      <circle
        cx={RING_CENTER.x}
        cy={RING_CENTER.y}
        r="42"
        fill="color-mix(in srgb, var(--accent) 16%, var(--surface))"
        stroke="var(--accent)"
        strokeWidth="12"
      />

      <RingDots count={8} radius={132} selected={2} />
      <RingDots count={5} radius={86} />
      <RingDots count={3} radius={42} />

      <Legend swatch="var(--accent)" label="Any time" y={128} />
      <Legend
        swatch="color-mix(in srgb, var(--accent) 55%, var(--fg-muted))"
        label="Open hours"
        y={172}
      />
      <Legend swatch="var(--fg-muted)" label="Ask first" y={216} muted />

      <text x="430" y="286" fill="var(--fg)" fontSize="14" fontWeight="560">
        Asks you first
      </text>
      <text x="430" y="308" fill="var(--fg-muted)" fontSize="13">
        One person, on the outer ring
      </text>
    </Frame>
  );
}

function RingDots({ count, radius, selected }: { count: number; radius: number; selected?: number }) {
  return (
    <g>
      {Array.from({ length: count }, (_, index) => {
        const angle = (-Math.PI / 2 + (Math.PI * 2 * index) / count);
        const cx = RING_CENTER.x + Math.cos(angle) * radius;
        const cy = RING_CENTER.y + Math.sin(angle) * radius;
        const isSelected = index === selected;
        return (
          <circle
            key={index}
            cx={cx}
            cy={cy}
            r={isSelected ? 8 : 5.5}
            fill="var(--surface)"
            stroke={isSelected ? "var(--accent)" : "var(--fg)"}
            strokeWidth={isSelected ? 2.5 : 1.5}
          />
        );
      })}
    </g>
  );
}

function Legend({
  swatch,
  label,
  y,
  muted = false,
}: {
  swatch: string;
  label: string;
  y: number;
  muted?: boolean;
}) {
  return (
    <g>
      <rect x="430" y={y - 10} width="18" height="6" rx="3" fill={swatch} opacity={muted ? 0.55 : 1} />
      <text x="458" y={y} fill="var(--fg)" fontSize="14" fontWeight="500">
        {label}
      </text>
    </g>
  );
}
