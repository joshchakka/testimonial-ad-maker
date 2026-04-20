import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  ACCENT_THEMES,
  DEFAULT_TESTIMONIAL,
  type AccentTheme,
  type AdFormat,
  type BackgroundMode,
  type TestimonialData,
  type VerticalLayoutVariant,
} from "./types";
import { TestimonialCanvas } from "./testimonial-canvas";
import { ControlsToolbar } from "./controls-toolbar";
import { useTestimonialPersistence } from "@/hooks/use-testimonial-persistence";
import { supabaseConfigured } from "@/lib/supabase";
import { Cloud, CloudOff, Loader2, Plus, Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Pre-fetch Google Fonts CSS to avoid CORS SecurityError when html-to-image
// tries to read cssRules from cross-origin stylesheets.
let _fontEmbedCSSCache: string | null = null;
async function getFontEmbedCSS(): Promise<string> {
  if (_fontEmbedCSSCache !== null) return _fontEmbedCSSCache;
  try {
    const fontUrls = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map((link) => (link as HTMLLinkElement).href)
      .filter((href) => href.includes("fonts.googleapis.com"));

    const cssTexts = await Promise.all(
      fontUrls.map(async (url) => {
        try {
          const res = await fetch(url, { mode: "cors" });
          return res.ok ? await res.text() : "";
        } catch {
          return "";
        }
      })
    );
    _fontEmbedCSSCache = cssTexts.join("\n");
  } catch {
    _fontEmbedCSSCache = "";
  }
  return _fontEmbedCSSCache;
}

export function TestimonialAdEditor() {
  const [format, setFormat] = useState<AdFormat>("1x1");
  const [accentTheme, setAccentTheme] = useState<AccentTheme>(
    ACCENT_THEMES[0]
  );
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("dark");
  const [verticalLayoutVariant, setVerticalLayoutVariant] = useState<VerticalLayoutVariant>("image-top");
  const [data, setData] = useState<TestimonialData>(DEFAULT_TESTIMONIAL);
  const [isExporting, setIsExporting] = useState(false);
  const [scale, setScale] = useState(0.5);
  const [showTestimonialList, setShowTestimonialList] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const scaleWrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    testimonials,
    activeId,
    isLoading,
    isSaving,
    save,
    createNew,
    deleteById,
    setActiveId,
  } = useTestimonialPersistence();

  const canvasWidth = format === "16x9" ? 1920 : 1080;
  const canvasHeight = format === "9x16" ? 1920 : 1080;

  // When active testimonial changes, load its data into local state
  useEffect(() => {
    if (!activeId || testimonials.length === 0) return;
    const active = testimonials.find((t) => t.id === activeId);
    if (active) {
      setData(active.data);
      setFormat(active.format);
      setAccentTheme(active.accentTheme);
      setBackgroundMode(active.backgroundMode);
    }
  }, [activeId, testimonials]);

  // Auto-create a testimonial if none exist after loading completes
  useEffect(() => {
    if (!isLoading && testimonials.length === 0 && !activeId && supabaseConfigured) {
      createNew();
    }
  }, [isLoading, testimonials.length, activeId, createNew]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowTestimonialList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Responsive scale calculation — uses ResizeObserver to avoid layout thrashing
  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;

    let rafId: number | null = null;

    const calculateScale = () => {
      rafId = null;
      const availableWidth = container.clientWidth - 48; // padding
      const availableHeight = container.clientHeight - 48;
      if (availableWidth <= 0 || availableHeight <= 0) return;
      const scaleX = availableWidth / canvasWidth;
      const scaleY = availableHeight / canvasHeight;
      const next = Math.min(scaleX, scaleY, 1);
      setScale((prev) => {
        // Only update if the difference is meaningful to avoid re-render loops
        if (Math.abs(prev - next) < 0.001) return prev;
        return next;
      });
    };

    // Initial calculation
    calculateScale();

    const ro = new ResizeObserver(() => {
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(calculateScale);
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, [canvasWidth, canvasHeight]);

  // Auto-save on state changes (debounced inside the hook)
  const handleDataChange = useCallback(
    (partial: Partial<TestimonialData>) => {
      setData((prev) => {
        const next = { ...prev, ...partial };
        // Trigger save with latest data
        save(next, format, accentTheme, backgroundMode);
        return next;
      });
    },
    [save, format, accentTheme, backgroundMode]
  );

  // Save when format, accent, or background changes
  const handleFormatChange = useCallback(
    (newFormat: AdFormat) => {
      setFormat(newFormat);
      save(data, newFormat, accentTheme, backgroundMode);
    },
    [save, data, accentTheme, backgroundMode]
  );

  const handleAccentChange = useCallback(
    (newTheme: AccentTheme) => {
      setAccentTheme(newTheme);
      save(data, format, newTheme, backgroundMode);
    },
    [save, data, format, backgroundMode]
  );

  const handleBackgroundModeChange = useCallback(
    (newMode: BackgroundMode) => {
      setBackgroundMode(newMode);
      save(data, format, accentTheme, newMode);
    },
    [save, data, format, accentTheme]
  );

  const handleQuoteFontSizeChange = useCallback(
    (size: number) => {
      handleDataChange({
        quoteFontSize: { ...data.quoteFontSize, [format]: size },
      });
    },
    [handleDataChange, data.quoteFontSize, format]
  );

  const handleBorderThicknessChange = useCallback(
    (size: number) => {
      handleDataChange({
        borderThickness: { ...data.borderThickness, [format]: size },
      });
    },
    [handleDataChange, data.borderThickness, format]
  );

  const handleCreateNew = useCallback(async () => {
    await createNew();
    setShowTestimonialList(false);
  }, [createNew]);

  const handleDelete = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (testimonials.length <= 1) return; // Don't delete the last one
      await deleteById(id);
    },
    [deleteById, testimonials.length]
  );

  const handleSelectTestimonial = useCallback(
    (id: string) => {
      setActiveId(id);
      setShowTestimonialList(false);
    },
    [setActiveId]
  );

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
      // Pre-fetch font CSS to avoid CORS SecurityError when html-to-image
      // tries to read cssRules from cross-origin Google Fonts stylesheets
      const fontEmbedCSS = await getFontEmbedCSS();

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
          fontEmbedCSS,
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
        fontEmbedCSS,
      });

      // Build filename with client name and company
      const slugify = (str: string) =>
        str
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

      // Extract company from clientRole (e.g. "CTO, JustLiv" → "JustLiv")
      const roleParts = data.clientRole.split(",");
      const company = roleParts.length > 1 ? roleParts.slice(1).join(",").trim() : roleParts[0].trim();
      const nameSlug = slugify(data.clientName);
      const companySlug = slugify(company);
      const clientSlug = nameSlug && companySlug ? `${nameSlug}-${companySlug}` : nameSlug || companySlug || "client";

      const link = document.createElement("a");
      link.download = `testimonial-${format}-${clientSlug}-${Date.now()}.png`;
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

  if (isLoading) {
    return (
      <div className="h-screen bg-[#080B10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
          <p className="text-sm text-white/40" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Loading testimonials…
          </p>
        </div>
      </div>
    );
  }

  const activeTestimonial = testimonials.find((t) => t.id === activeId);

  return (
    <div className="h-screen bg-[#080B10] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-3 border-b border-white/5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-shrink-0">
            <div>
              <h1
                className="text-sm font-semibold text-white/90 tracking-wide"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                Testimonial Ad Builder
              </h1>
              <p className="text-[11px] text-white/30 mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {canvasWidth}×{canvasHeight}px • {format === "1x1" ? "Square" : format === "9x16" ? `Vertical (${verticalLayoutVariant === "quote-top" ? "Quote Top" : "Image Top"})` : "Landscape"}
              </p>
            </div>

            {/* Testimonial Selector */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowTestimonialList(!showTestimonialList)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 hover:bg-white/10 hover:text-white/90 transition-all"
              >
                <span className="max-w-[160px] truncate">
                  {activeTestimonial ? activeTestimonial.data.clientName || "Untitled" : "Select…"}
                </span>
                <ChevronDown className={cn("w-3 h-3 transition-transform", showTestimonialList && "rotate-180")} />
              </button>

              {showTestimonialList && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-[#12161D] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
                  <div className="p-1.5 border-b border-white/5">
                    <button
                      onClick={handleCreateNew}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New Testimonial
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {testimonials.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleSelectTestimonial(t.id)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2.5 mx-1.5 rounded-md cursor-pointer transition-all group",
                          t.id === activeId
                            ? "bg-white/10 text-white"
                            : "text-white/60 hover:bg-white/5 hover:text-white/80"
                        )}
                      >
                        <div className="flex-1 min-w-0 mr-2">
                          <p className="text-xs font-medium truncate">
                            {t.data.clientName || "Untitled"}
                          </p>
                          <p className="text-[10px] text-white/30 truncate mt-0.5">
                            {t.data.quote.slice(0, 60)}…
                          </p>
                        </div>
                        {testimonials.length > 1 && (
                          <button
                            onClick={(e) => handleDelete(t.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Save Status Indicator */}
            <div className="flex items-center gap-1.5">
              {isSaving ? (
                <>
                  <Loader2 className="w-3 h-3 text-white/30 animate-spin" />
                  <span className="text-[10px] text-white/30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    Saving…
                  </span>
                </>
              ) : activeId ? (
                <>
                  <Cloud className="w-3 h-3 text-emerald-400/60" />
                  <span className="text-[10px] text-emerald-400/60" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    Saved
                  </span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3 h-3 text-white/20" />
                  <span className="text-[10px] text-white/20" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    Offline
                  </span>
                </>
              )}
            </div>
          </div>
          <ControlsToolbar
            format={format}
            accentTheme={accentTheme}
            backgroundMode={backgroundMode}
            quoteFontSize={data.quoteFontSize[format]}
            borderThickness={data.borderThickness[format]}
            verticalLayoutVariant={verticalLayoutVariant}
            onFormatChange={handleFormatChange}
            onAccentChange={handleAccentChange}
            onBackgroundModeChange={handleBackgroundModeChange}
            onQuoteFontSizeChange={handleQuoteFontSizeChange}
            onBorderThicknessChange={handleBorderThicknessChange}
            onVerticalLayoutVariantChange={setVerticalLayoutVariant}
            onExport={handleExport}
            isExporting={isExporting}
          />
        </div>
      </header>

      {/* Canvas Area */}
      <main ref={mainRef} className="flex-1 flex items-center justify-center p-6 overflow-hidden min-h-0 relative">
        <div
          ref={scaleWrapperRef}
          className="transition-transform duration-500 ease-out absolute"
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
            verticalLayoutVariant={verticalLayoutVariant}
            onDataChange={handleDataChange}
            canvasRef={canvasRef as React.RefObject<HTMLDivElement>}
            isExporting={isExporting}
          />
        </div>
      </main>
    </div>
  );
}
