type ModelIconProps = {
  size: number;
};

export function ModelIcon({ size }: ModelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="rgba(255,255,255,0.85)"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="pointer-events-none shrink-0"
    >
      <circle cx="12" cy="3" r="1" fill="rgba(255,255,255,0.85)" stroke="none" />
      <line x1="12" y1="4" x2="12" y2="6.5" />
      <rect x="4.5" y="6.5" width="15" height="12" rx="4" />
      <circle cx="9.5" cy="12.5" r="1.4" fill="rgba(255,255,255,0.85)" stroke="none" />
      <circle cx="14.5" cy="12.5" r="1.4" fill="rgba(255,255,255,0.85)" stroke="none" />
    </svg>
  );
}

/** Map ring diameter to icon size: 64→20, 52→18, 44→15 */
export function iconSizeForRing(ringDiameter: number): number {
  if (ringDiameter >= 64) return 20;
  if (ringDiameter <= 44) return 15;
  return 18;
}
