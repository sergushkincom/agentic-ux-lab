const REPO = "https://github.com/sergushkincom/agentic-ux-lab";

const LINKS = [
  { label: "GitHub", href: REPO },
  { label: "README", href: `${REPO}#readme` },
];

const link =
  "rounded-sm underline-offset-2 hover:text-[var(--fg)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

/** Who made this and where the code is. One thin row under the lab, never over it. */
export function SiteFooter() {
  return (
    <footer className="flex h-[var(--footer-h)] shrink-0 items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface)] px-4 text-xs text-[var(--fg-muted)]">
      <p className="truncate max-sm:hidden">MIT licensed · Design experiments</p>
      <nav
        aria-label="About this project"
        className="flex items-center gap-3 max-sm:w-full max-sm:justify-between"
      >
        {LINKS.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className={link}>
            {l.label}
          </a>
        ))}
        <a href="https://sergushkin.com" target="_blank" rel="noreferrer" className={link}>
          Built by <span className="text-[var(--fg)]">Denys Sergushkin</span>
          <span aria-hidden="true"> ↗</span>
        </a>
      </nav>
    </footer>
  );
}
