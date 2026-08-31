"use client";

/**
 * macOS Sequoia–style abstract wallpaper — CSS-only, no image assets.
 * Fixed full-viewport layer: base, colour field, streaks, grain.
 */
export function Wallpaper() {
  return (
    <div className="wallpaper" aria-hidden="true">
      {/* 1. Base ground */}
      <div className="wallpaper__base" />

      {/* 2. Colour field — four blurred radial gradients */}
      <div className="wallpaper__field">
        <div className="wallpaper__blob wallpaper__blob--indigo" />
        <div className="wallpaper__blob wallpaper__blob--teal" />
        <div className="wallpaper__blob wallpaper__blob--violet" />
        <div className="wallpaper__blob wallpaper__blob--amber" />
      </div>

      {/* 3. Directional streak layer */}
      <div className="wallpaper__streak" />

      {/* 4. Film grain */}
      <div className="wallpaper__grain" />
    </div>
  );
}
