import type { AccentTheme } from "./types";

interface CanvasBackgroundProps {
  accentTheme: AccentTheme;
}

export function CanvasBackground({ accentTheme }: CanvasBackgroundProps) {
  return (
    <>
      {/* Base background */}
      <div className="absolute inset-0 bg-[#0D1117]" />

      {/* Gradient bloom */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${accentTheme.gradientColor}, transparent 70%)`,
        }}
      />

      {/* Secondary subtle bloom */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 40% 40% at 30% 70%, ${accentTheme.gradientColor.replace("0.15", "0.08")}, transparent 60%)`,
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />
    </>
  );
}
