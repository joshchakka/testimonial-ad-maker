import { Download, Square, Smartphone } from "lucide-react";
import type { AccentTheme, AdFormat } from "./types";
import { ACCENT_THEMES } from "./types";
import { cn } from "@/lib/utils";

interface ControlsToolbarProps {
  format: AdFormat;
  accentTheme: AccentTheme;
  onFormatChange: (format: AdFormat) => void;
  onAccentChange: (theme: AccentTheme) => void;
  onExport: () => void;
  isExporting: boolean;
}

export function ControlsToolbar({
  format,
  accentTheme,
  onFormatChange,
  onAccentChange,
  onExport,
  isExporting,
}: ControlsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-4">
      {/* Format Toggle */}
      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
        <button
          onClick={() => onFormatChange("1x1")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all",
            format === "1x1"
              ? "bg-white/10 text-white shadow-sm"
              : "text-white/50 hover:text-white/70"
          )}
        >
          <Square className="w-3.5 h-3.5" />
          <span>1×1</span>
        </button>
        <button
          onClick={() => onFormatChange("9x16")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all",
            format === "9x16"
              ? "bg-white/10 text-white shadow-sm"
              : "text-white/50 hover:text-white/70"
          )}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>9×16</span>
        </button>
      </div>

      {/* Accent Color Picker */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-white/30 font-medium mr-1">
          Accent
        </span>
        {ACCENT_THEMES.map((theme) => (
          <button
            key={theme.name}
            onClick={() => onAccentChange(theme)}
            className={cn(
              "w-7 h-7 rounded-full transition-all border-2",
              accentTheme.name === theme.name
                ? "border-white scale-110"
                : "border-transparent hover:scale-110 hover:border-white/30"
            )}
            style={{ backgroundColor: theme.color }}
            title={theme.name}
          />
        ))}
      </div>

      {/* Export Button */}
      <button
        onClick={onExport}
        disabled={isExporting}
        className="group flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: `linear-gradient(135deg, ${accentTheme.color}, ${accentTheme.color}cc)`,
          boxShadow: `0 4px 20px ${accentTheme.glowColor}`,
        }}
      >
        <Download className="w-4 h-4 group-hover:animate-bounce" />
        {isExporting ? "Exporting..." : "Export PNG"}
      </button>
    </div>
  );
}
