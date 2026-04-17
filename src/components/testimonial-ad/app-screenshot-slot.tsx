import { useFileUpload } from "@/hooks/use-file-upload";
import { MonitorSmartphone, X } from "lucide-react";
import type { AccentTheme } from "./types";

interface AppScreenshotSlotProps {
  screenshotImage: string | null;
  accentTheme: AccentTheme;
  onScreenshotChange: (dataUrl: string | null) => void;
  /** Orientation hint for sizing */
  variant?: "square" | "vertical" | "landscape";
}

export function AppScreenshotSlot({
  screenshotImage,
  accentTheme,
  onScreenshotChange,
  variant = "square",
}: AppScreenshotSlotProps) {
  const { inputRef, triggerUpload, handleChange } = useFileUpload((url) =>
    onScreenshotChange(url)
  );

  const dimensions = {
    square: { width: 360, height: 240 },
    vertical: { width: "100%" as const, height: 420 },
    landscape: { width: "100%" as const, height: "100%" as const },
  };

  const dim = dimensions[variant];

  return (
    <div
      className="relative cursor-pointer group"
      onClick={triggerUpload}
      title="Click to upload app screenshot"
      style={{
        width: dim.width,
        height: dim.height,
      }}
    >
      <div
        className="w-full h-full rounded-2xl overflow-hidden transition-all border border-white/[0.08] relative"
        style={{
          background: screenshotImage
            ? "transparent"
            : `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, ${accentTheme.gradientColor} 100%)`,
          boxShadow: screenshotImage
            ? `0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)`
            : `0 4px 24px rgba(0,0,0,0.3)`,
        }}
      >
        {screenshotImage ? (
          <img
            src={screenshotImage}
            alt="App screenshot"
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110"
              style={{
                background: `${accentTheme.color}15`,
                border: `1px dashed ${accentTheme.color}40`,
              }}
            >
              <MonitorSmartphone
                className="w-7 h-7 transition-colors"
                style={{ color: `${accentTheme.color}90` }}
              />
            </div>
            <div className="text-center">
              <p
                className="text-[13px] font-medium text-white/40 group-hover:text-white/60 transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                App Screenshot
              </p>
              <p
                className="text-[11px] text-white/20 mt-1"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Click to upload
              </p>
            </div>
          </div>
        )}

        {/* Subtle inner shadow overlay for depth when image is present */}
        {screenshotImage && (
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              boxShadow: "inset 0 0 40px rgba(0,0,0,0.15)",
            }}
          />
        )}
      </div>

      {/* Remove button */}
      {screenshotImage && (
        <button
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            onScreenshotChange(null);
          }}
          title="Remove screenshot"
        >
          <X className="w-3.5 h-3.5 text-white/70" />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
