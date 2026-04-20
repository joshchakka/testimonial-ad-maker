import { Download, Square, Smartphone, Monitor, Sun, Moon, Minus, Plus, Type } from "lucide-react";
import type { AccentTheme, AdFormat, BackgroundMode } from "./types";
import { ACCENT_THEMES } from "./types";
import { cn } from "@/lib/utils";

interface ControlsToolbarProps {
  format: AdFormat;
  accentTheme: AccentTheme;
  backgroundMode: BackgroundMode;
  quoteFontSize: number;
  borderThickness: number;
  onFormatChange: (format: AdFormat) => void;
  onAccentChange: (theme: AccentTheme) => void;
  onBackgroundModeChange: (mode: BackgroundMode) => void;
  onQuoteFontSizeChange: (size: number) => void;
  onBorderThicknessChange: (size: number) => void;
  onExport: () => void;
  isExporting: boolean;
}

export function ControlsToolbar({
  format,
  accentTheme,
  backgroundMode,
  quoteFontSize,
  borderThickness,
  onFormatChange,
  onAccentChange,
  onBackgroundModeChange,
  onQuoteFontSizeChange,
  onBorderThicknessChange,
  onExport,
  isExporting,
}: ControlsToolbarProps) {
  const MIN_FONT_SIZE = 16;
  const MAX_FONT_SIZE = 48;
  const FONT_STEP = 2;
  const MIN_BORDER_THICKNESS = 0;
  const MAX_BORDER_THICKNESS = 12;
  const BORDER_STEP = 1;
  return (
    <div className="flex flex-nowrap items-center justify-end gap-3">
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
          onClick={() => onFormatChange("16x9")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all",
            format === "16x9"
              ? "bg-white/10 text-white shadow-sm"
              : "text-white/50 hover:text-white/70"
          )}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>16×9</span>
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

      {/* Background Mode Toggle */}
      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
        <button
          onClick={() => onBackgroundModeChange("dark")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all",
            backgroundMode === "dark"
              ? "bg-white/10 text-white shadow-sm"
              : "text-white/50 hover:text-white/70"
          )}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Dark</span>
        </button>
        <button
          onClick={() => onBackgroundModeChange("light")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all",
            backgroundMode === "light"
              ? "bg-white/10 text-white shadow-sm"
              : "text-white/50 hover:text-white/70"
          )}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Light</span>
        </button>
      </div>

      {/* Accent Color Picker */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-white/30 font-medium mr-0.5">
          Accent
        </span>
        {ACCENT_THEMES.map((theme) => (
          <button
            key={theme.name}
            onClick={() => onAccentChange(theme)}
            className={cn(
              "w-6 h-6 rounded-full transition-all border-2",
              accentTheme.name === theme.name
                ? "border-white scale-110"
                : "border-transparent hover:scale-110 hover:border-white/30"
            )}
            style={{ backgroundColor: theme.color }}
            title={theme.name}
          />
        ))}
      </div>

      {/* Quote Font Size */}
      <div className="flex items-center gap-1.5 bg-white/5 rounded-lg p-1 border border-white/10">
        <Type className="w-3.5 h-3.5 text-white/40 ml-2" />
        <button
          onClick={() =>
            onQuoteFontSizeChange(
              Math.max(MIN_FONT_SIZE, quoteFontSize - FONT_STEP)
            )
          }
          disabled={quoteFontSize <= MIN_FONT_SIZE}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-md text-xs font-medium transition-all",
            quoteFontSize <= MIN_FONT_SIZE
              ? "text-white/20 cursor-not-allowed"
              : "text-white/60 hover:text-white hover:bg-white/10"
          )}
        >
          <Minus className="w-3 h-3" />
        </button>
        <span
          className="text-[11px] text-white/70 font-mono w-8 text-center tabular-nums"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {quoteFontSize}
        </span>
        <button
          onClick={() =>
            onQuoteFontSizeChange(
              Math.min(MAX_FONT_SIZE, quoteFontSize + FONT_STEP)
            )
          }
          disabled={quoteFontSize >= MAX_FONT_SIZE}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-md text-xs font-medium transition-all",
            quoteFontSize >= MAX_FONT_SIZE
              ? "text-white/20 cursor-not-allowed"
              : "text-white/60 hover:text-white hover:bg-white/10"
          )}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Screenshot Border Thickness */}
      <div className="flex items-center gap-1.5 bg-white/5 rounded-lg p-1 border border-white/10">
        <span className="text-[11px] text-white/40 font-medium ml-2">
          Border
        </span>
        <button
          onClick={() =>
            onBorderThicknessChange(
              Math.max(MIN_BORDER_THICKNESS, borderThickness - BORDER_STEP)
            )
          }
          disabled={borderThickness <= MIN_BORDER_THICKNESS}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-md text-xs font-medium transition-all",
            borderThickness <= MIN_BORDER_THICKNESS
              ? "text-white/20 cursor-not-allowed"
              : "text-white/60 hover:text-white hover:bg-white/10"
          )}
        >
          <Minus className="w-3 h-3" />
        </button>
        <span
          className="text-[11px] text-white/70 font-mono w-8 text-center tabular-nums"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {borderThickness}
        </span>
        <button
          onClick={() =>
            onBorderThicknessChange(
              Math.min(MAX_BORDER_THICKNESS, borderThickness + BORDER_STEP)
            )
          }
          disabled={borderThickness >= MAX_BORDER_THICKNESS}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-md text-xs font-medium transition-all",
            borderThickness >= MAX_BORDER_THICKNESS
              ? "text-white/20 cursor-not-allowed"
              : "text-white/60 hover:text-white hover:bg-white/10"
          )}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Export Button */}
      <button
        onClick={onExport}
        disabled={isExporting}
        className="group flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-white transition-all hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
