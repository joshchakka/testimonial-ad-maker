import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  ACCENT_THEMES,
  DEFAULT_TESTIMONIAL,
  type AccentTheme,
  type AdFormat,
  type TestimonialData,
} from "./types";
import { TestimonialCanvas } from "./testimonial-canvas";
import { ControlsToolbar } from "./controls-toolbar";

export function TestimonialAdEditor() {
  const [format, setFormat] = useState<AdFormat>("1x1");
  const [accentTheme, setAccentTheme] = useState<AccentTheme>(
    ACCENT_THEMES[0]
  );
  const [data, setData] = useState<TestimonialData>(DEFAULT_TESTIMONIAL);
  const [isExporting, setIsExporting] = useState(false);
  const [scale, setScale] = useState(0.5);
  const canvasRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const canvasWidth = format === "16x9" ? 1920 : 1080;
  const canvasHeight = format === "9x16" ? 1920 : 1080;

  // Responsive scale calculation
  useEffect(() => {
    const calculateScale = () => {
      if (!mainRef.current) return;
      const container = mainRef.current;
      const availableWidth = container.clientWidth - 48; // padding
      const availableHeight = container.clientHeight - 48;
      const scaleX = availableWidth / canvasWidth;
      const scaleY = availableHeight / canvasHeight;
      setScale(Math.min(scaleX, scaleY, 1));
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, [canvasWidth, canvasHeight]);

  const handleDataChange = useCallback((partial: Partial<TestimonialData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleExport = useCallback(async () => {
    if (!canvasRef.current || isExporting) return;

    setIsExporting(true);
    try {
      const dataUrl = await toPng(canvasRef.current, {
        width: format === "16x9" ? 1920 : 1080,
        height: format === "9x16" ? 1920 : 1080,
        pixelRatio: 1,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `testimonial-${format}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  }, [format, isExporting]);

  return (
    <div className="h-screen bg-[#080B10] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-3 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1
              className="text-sm font-semibold text-white/90 tracking-wide"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Testimonial Ad Builder
            </h1>
            <p className="text-[11px] text-white/30 mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {canvasWidth}×{canvasHeight}px • {format === "1x1" ? "Square" : format === "9x16" ? "Vertical" : "Landscape"}
            </p>
          </div>
          <ControlsToolbar
            format={format}
            accentTheme={accentTheme}
            onFormatChange={setFormat}
            onAccentChange={setAccentTheme}
            onExport={handleExport}
            isExporting={isExporting}
          />
        </div>
      </header>

      {/* Canvas Area */}
      <main ref={mainRef} className="flex-1 flex items-center justify-center p-6 overflow-hidden min-h-0">
        <div
          className="transition-all duration-500 ease-out"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <TestimonialCanvas
            data={data}
            format={format}
            accentTheme={accentTheme}
            onDataChange={handleDataChange}
            canvasRef={canvasRef as React.RefObject<HTMLDivElement>}
          />
        </div>
      </main>
    </div>
  );
}
