import type { AccentTheme, BackgroundMode } from "./types";

interface CanvasBackgroundProps {
  accentTheme: AccentTheme;
  backgroundMode: BackgroundMode;
}

export function CanvasBackground({ accentTheme, backgroundMode }: CanvasBackgroundProps) {
  const isDark = backgroundMode === "dark";

  // For light mode, use a softer gradient with higher opacity for subtlety
  const gradientColor = isDark
    ? accentTheme.gradientColor
    : accentTheme.gradientColor.replace("0.15", "0.08");
  const secondaryGradient = isDark
    ? accentTheme.gradientColor.replace("0.15", "0.08")
    : accentTheme.gradientColor.replace("0.15", "0.04");

  return (
    <>
      {/* Base background */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: isDark ? "#0D1117" : "#FFFFFF" }}
      />

      {/* Gradient bloom */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${gradientColor}, transparent 70%)`,
        }}
      />

      {/* Secondary subtle bloom */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 40% 40% at 30% 70%, ${secondaryGradient}, transparent 60%)`,
        }}
      />
    </>
  );
}
