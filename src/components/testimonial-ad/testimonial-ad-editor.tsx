import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  ACCENT_THEMES,
  DEFAULT_TESTIMONIAL,
  type AccentTheme,
  type AdFormat,
  type BackgroundMode,
  type TestimonialData,
} from "./types";
import { TestimonialCanvas } from "./testimonial-canvas";
import { ControlsToolbar } from "./controls-toolbar";

export function TestimonialAdEditor() {
  const [format, setFormat] = useState<AdFormat>("1x1");
  const [accentTheme, setAccentTheme] = useState<AccentTheme>(
    ACCENT_THEMES[0]
  );
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("dark");
  const [data, setData] = useState<TestimonialData>(DEFAULT_TESTIMONIAL);
  const [isExporting, setIsExporting] = useState(false);
  const [scale, setScale] = useState(0.5);
  const canvasRef = useRef<HTMLDivElement>(null);
  const scaleWrapperRef = useRef<HTMLDivElement>(null);
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
    if (!canvasRef.current || !scaleWrapperRef.current || isExporting) return;

    setIsExporting(true);

    // Temporarily remove the scale transform so html-to-image captures at full resolution
    const wrapper = scaleWrapperRef.current;
    const main = mainRef.current;
    const prevTransform = wrapper.style.transform;
    const prevTransformOrigin = wrapper.style.transformOrigin;
    const prevTransition = wrapper.style.transition;
    const prevMainOverflow = main ? main.style.overflow : "";
    
    wrapper.style.transition = "none";
    wrapper.style.transform = "none";
    wrapper.style.transformOrigin = "top left";
    if (main) main.style.overflow = "visible";

    // Wait for frames for the DOM to settle
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => setTimeout(r, 100));

    try {
      // Run toPng multiple times - first call can be buggy with fonts/images, subsequent ones are reliable
      // This is a known workaround for html-to-image rendering issues
      for (let i = 0; i < 2; i++) {
        await toPng(canvasRef.current, {
          width: canvasWidth,
          height: canvasHeight,
          pixelRatio: 1,
          cacheBust: true,
          skipAutoScale: true,
          includeQueryParams: true,
        });
      }

      // Final pass — this one will be accurate
      const dataUrl = await toPng(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        pixelRatio: 1,
        cacheBust: true,
        skipAutoScale: true,
        includeQueryParams: true,
      });

      const link = document.createElement("a");
      link.download = `testimonial-${format}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      // Restore the scale transform
      wrapper.style.transform = prevTransform;
      wrapper.style.transformOrigin = prevTransformOrigin;
      wrapper.style.transition = prevTransition;
      if (main) main.style.overflow = prevMainOverflow;
      setIsExporting(false);
    }
  }, [format, isExporting, canvasWidth, canvasHeight]);

  return (
    <div className="h-screen bg-[#080B10] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-3 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1
              className="text-sm font-semibold text-white/90 tracking-wide"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
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
            backgroundMode={backgroundMode}
            onFormatChange={setFormat}
            onAccentChange={setAccentTheme}
            onBackgroundModeChange={setBackgroundMode}
            onExport={handleExport}
            isExporting={isExporting}
          />
        </div>
      </header>

      {/* Canvas Area */}
      <main ref={mainRef} className="flex-1 flex items-center justify-center p-6 overflow-hidden min-h-0">
        <div
          ref={scaleWrapperRef}
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
            backgroundMode={backgroundMode}
            onDataChange={handleDataChange}
            canvasRef={canvasRef as React.RefObject<HTMLDivElement>}
            isExporting={isExporting}
          />
        </div>
      </main>
    </div>
  );
}
