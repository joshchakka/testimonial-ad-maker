import { useFileUpload } from "@/hooks/use-file-upload";
import {
  MonitorSmartphone,
  X,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCcw,
  Check,
  Pencil,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AccentTheme } from "./types";

interface AppScreenshotSlotProps {
  screenshotImage: string | null;
  accentTheme: AccentTheme;
  borderThickness: number;
  onScreenshotChange: (dataUrl: string | null) => void;
  /** Orientation hint for sizing */
  variant?: "square" | "vertical" | "landscape";
  /** When true, hide editor-only chrome like crop controls and approval feedback */
  isExporting?: boolean;
}

interface CropState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

interface ApprovedCrop {
  /** The visible rect relative to the container, in px */
  x: number;
  y: number;
  width: number;
  height: number;
}

const DEFAULT_CROP: CropState = { scale: 1, offsetX: 0, offsetY: 0 };
const DEFAULT_CONTAINER_SIZE = { width: 0, height: 0 };
const SCREENSHOT_FRAME_RADIUS = 18;

function getContainedRect(
  containerWidth: number,
  containerHeight: number,
  naturalSize: { w: number; h: number }
): ApprovedCrop {
  const imageAspect = naturalSize.w / naturalSize.h;
  const containerAspect = containerWidth / containerHeight;

  if (imageAspect > containerAspect) {
    const width = containerWidth;
    const height = containerWidth / imageAspect;
    return {
      x: 0,
      y: (containerHeight - height) / 2,
      width,
      height,
    };
  }

  const height = containerHeight;
  const width = containerHeight * imageAspect;
  return {
    x: (containerWidth - width) / 2,
    y: 0,
    width,
    height,
  };
}

function getScaledRect(baseRect: ApprovedCrop, crop: CropState): ApprovedCrop {
  const width = baseRect.width * crop.scale;
  const height = baseRect.height * crop.scale;

  return {
    x: baseRect.x + crop.offsetX - (width - baseRect.width) / 2,
    y: baseRect.y + crop.offsetY - (height - baseRect.height) / 2,
    width,
    height,
  };
}

function getVisibleBounds(
  rect: ApprovedCrop,
  containerWidth: number,
  containerHeight: number
): ApprovedCrop | null {
  const left = Math.max(0, rect.x);
  const top = Math.max(0, rect.y);
  const right = Math.min(containerWidth, rect.x + rect.width);
  const bottom = Math.min(containerHeight, rect.y + rect.height);
  const width = Math.max(0, right - left);
  const height = Math.max(0, bottom - top);

  if (width <= 0 || height <= 0) return null;

  return {
    x: left,
    y: top,
    width,
    height,
  };
}

function getInteractionScale(element: HTMLDivElement | null): number {
  if (!element || element.clientWidth === 0) return 1;
  return element.getBoundingClientRect().width / element.clientWidth || 1;
}

export function AppScreenshotSlot({
  screenshotImage,
  accentTheme,
  borderThickness,
  onScreenshotChange,
  variant = "square",
  isExporting = false,
}: AppScreenshotSlotProps) {
  const { inputRef, triggerUpload, handleChange } = useFileUpload((url) =>
    onScreenshotChange(url)
  );

  const [crop, setCrop] = useState<CropState>(DEFAULT_CROP);
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [showApprovedFeedback, setShowApprovedFeedback] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [containerSize, setContainerSize] = useState(DEFAULT_CONTAINER_SIZE);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    ox: number;
    oy: number;
    interactionScale: number;
  } | null>(null);
  const approvalTimeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const dimensions = {
    square: { width: "100%" as const, height: "100%" as const },
    vertical: { width: "100%" as const, height: "auto" as const, maxHeight: "100%" as const, aspectRatio: "3 / 4" },
    landscape: { width: "100%" as const, height: "100%" as const },
  };

  const dim = dimensions[variant];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const next = {
        width: container.clientWidth,
        height: container.clientHeight,
      };

      setContainerSize((prev) =>
        prev.width === next.width && prev.height === next.height ? prev : next
      );
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Load natural image dimensions
  useEffect(() => {
    if (approvalTimeoutRef.current !== null) {
      window.clearTimeout(approvalTimeoutRef.current);
      approvalTimeoutRef.current = null;
    }
    setCrop(DEFAULT_CROP);
    setIsApproved(false);
    setShowApprovedFeedback(false);

    if (!screenshotImage) {
      setNaturalSize(null);
      return;
    }
    const img = new Image();
    img.onload = () => setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = screenshotImage;
  }, [screenshotImage]);

  useEffect(
    () => () => {
      if (approvalTimeoutRef.current !== null) {
        window.clearTimeout(approvalTimeoutRef.current);
      }
    },
    []
  );

  const baseImageRect = useMemo(() => {
    if (!naturalSize || containerSize.width === 0 || containerSize.height === 0) {
      return null;
    }

    return getContainedRect(containerSize.width, containerSize.height, naturalSize);
  }, [naturalSize, containerSize.height, containerSize.width]);

  const scaledImageRect = useMemo(() => {
    if (!baseImageRect) return null;
    return getScaledRect(baseImageRect, crop);
  }, [baseImageRect, crop]);

  const visibleBounds = useMemo(() => {
    if (!scaledImageRect) return null;

    return getVisibleBounds(
      scaledImageRect,
      containerSize.width,
      containerSize.height
    );
  }, [scaledImageRect, containerSize.height, containerSize.width]);

  const handleZoomIn = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isApproved) return;
    setCrop((prev) => ({ ...prev, scale: Math.min(prev.scale + 0.15, 3) }));
  }, [isApproved]);

  const handleZoomOut = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isApproved) return;
    setCrop((prev) => ({ ...prev, scale: Math.max(prev.scale - 0.15, 0.2) }));
  }, [isApproved]);

  const handleReset = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCrop(DEFAULT_CROP);
    setIsApproved(false);
    setShowApprovedFeedback(false);
  }, []);

  const handleApprove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (visibleBounds) {
        setIsApproved(true);
        // Show badge + dim overlay briefly then fade away
        setShowApprovedFeedback(true);
        if (approvalTimeoutRef.current !== null) {
          window.clearTimeout(approvalTimeoutRef.current);
        }
        approvalTimeoutRef.current = window.setTimeout(() => {
          setShowApprovedFeedback(false);
          approvalTimeoutRef.current = null;
        }, 1200);
      }
    },
    [visibleBounds]
  );

  const handleEditCrop = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsApproved(false);
    setShowApprovedFeedback(false);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!screenshotImage || isApproved) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        ox: crop.offsetX,
        oy: crop.offsetY,
        interactionScale: getInteractionScale(containerRef.current),
      };

      const handleMouseMove = (ev: MouseEvent) => {
        const start = dragStartRef.current;
        if (!start) return;
        const dx = (ev.clientX - start.x) / start.interactionScale;
        const dy = (ev.clientY - start.y) / start.interactionScale;
        setCrop((prev) => ({
          ...prev,
          offsetX: start.ox + dx,
          offsetY: start.oy + dy,
        }));
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        dragStartRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [screenshotImage, crop.offsetX, crop.offsetY, isApproved]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!screenshotImage || isApproved) return;
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setCrop((prev) => ({
        ...prev,
        scale: Math.min(Math.max(prev.scale + delta, 0.2), 3),
      }));
    },
    [screenshotImage, isApproved]
  );

  return (
    <div
      ref={containerRef}
      className="relative group"
      style={{
        width: dim.width,
        height: dim.height,
        ...("aspectRatio" in dim ? { aspectRatio: dim.aspectRatio } : {}),
        ...("maxHeight" in dim ? { maxHeight: dim.maxHeight } : {}),
        borderRadius: 16,
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        setShowControls(false);
      }}
    >

      <div
        className="w-full h-full rounded-2xl transition-all relative overflow-hidden"
        style={{
          background: screenshotImage
            ? "transparent"
            : `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, ${accentTheme.gradientColor} 100%)`,
          boxShadow: screenshotImage
            ? "none"
            : `0 4px 24px rgba(0,0,0,0.3)`,
          border: screenshotImage
            ? "none"
            : `1px solid rgba(255,255,255,0.08)`,
          cursor: screenshotImage
            ? isApproved
              ? "default"
              : isDragging
              ? "grabbing"
              : "grab"
            : "pointer",
        }}
        onClick={undefined}
        onMouseDown={screenshotImage ? handleMouseDown : undefined}
        onWheel={screenshotImage ? handleWheel : undefined}
      >
        {screenshotImage ? (
          <div className="w-full h-full relative">
            {scaledImageRect && visibleBounds && (
              <div
                className="absolute pointer-events-none z-[15] overflow-hidden"
                style={{
                  left: visibleBounds.x,
                  top: visibleBounds.y,
                  width: visibleBounds.width,
                  height: visibleBounds.height,
                  borderRadius: SCREENSHOT_FRAME_RADIUS,
                  transition: isDragging ? "none" : "all 0.15s ease-out",
                }}
              >
                <img
                  src={screenshotImage}
                  alt="App screenshot"
                  className="absolute select-none pointer-events-none"
                  draggable={false}
                  style={{
                    left: scaledImageRect.x - visibleBounds.x,
                    top: scaledImageRect.y - visibleBounds.y,
                    width: scaledImageRect.width,
                    height: scaledImageRect.height,
                    maxWidth: "none",
                    userSelect: "none",
                  }}
                />

                {!isApproved && (
                  <div
                    className="absolute inset-0"
                    style={{
                      boxShadow: "inset 0 0 40px rgba(0,0,0,0.15)",
                    }}
                  />
                )}

                {/* Border rendered as inset box-shadow to avoid overflow clipping */}
                {borderThickness > 0 && (
                  <div
                    className="absolute inset-0 pointer-events-none z-[18]"
                    style={{
                      borderRadius: SCREENSHOT_FRAME_RADIUS,
                      boxShadow: `inset 0 0 0 ${borderThickness}px ${accentTheme.color}`,
                    }}
                  />
                )}
              </div>
            )}

            {/* Approved crop overlay: dim area outside + badge — fades after 1.2s */}
            {isApproved && visibleBounds && !isExporting && (
              <>
                {/* Dim overlay + badge — only visible briefly after approval */}
                <div
                  className="absolute inset-0 pointer-events-none z-[14]"
                  style={{
                    opacity: showApprovedFeedback ? 1 : 0,
                    transition: "opacity 0.6s ease-out",
                  }}
                >
                  {/* Top */}
                  <div
                    className="absolute"
                    style={{
                      left: 0,
                      top: 0,
                      width: "100%",
                      height: visibleBounds.y,
                      background: "rgba(0,0,0,0.55)",
                    }}
                  />
                  {/* Bottom */}
                  <div
                    className="absolute"
                    style={{
                      left: 0,
                      top: visibleBounds.y + visibleBounds.height,
                      width: "100%",
                      height: `calc(100% - ${visibleBounds.y + visibleBounds.height}px)`,
                      background: "rgba(0,0,0,0.55)",
                    }}
                  />
                  {/* Left */}
                  <div
                    className="absolute"
                    style={{
                      left: 0,
                      top: visibleBounds.y,
                      width: visibleBounds.x,
                      height: visibleBounds.height,
                      background: "rgba(0,0,0,0.55)",
                    }}
                  />
                  {/* Right */}
                  <div
                    className="absolute"
                    style={{
                      left: visibleBounds.x + visibleBounds.width,
                      top: visibleBounds.y,
                      width: `calc(100% - ${visibleBounds.x + visibleBounds.width}px)`,
                      height: visibleBounds.height,
                      background: "rgba(0,0,0,0.55)",
                    }}
                  />
                  {/* Approved badge */}
                  <div
                    className={`absolute z-[16] flex items-center ${variant === "vertical" ? "gap-2 px-3.5 py-1.5" : "gap-1.5 px-2.5 py-1"} rounded-full`}
                    style={{
                      left: visibleBounds.x + visibleBounds.width / 2,
                      top: visibleBounds.y - 8,
                      transform: "translate(-50%, -100%)",
                      background: accentTheme.color,
                      boxShadow: `0 2px 12px ${accentTheme.glowColor}`,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: variant === "vertical" ? 14 : 10,
                      color: "#fff",
                      fontWeight: 600,
                      letterSpacing: "0.02em",
                    }}
                  >
                    <Check className={variant === "vertical" ? "w-4 h-4" : "w-3 h-3"} />
                    Crop Approved
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div
            className={`w-full h-full flex flex-col items-center justify-center cursor-pointer ${variant === "vertical" ? "gap-6" : "gap-4"}`}
            onClick={triggerUpload}
          >
            <div
              className={`${variant === "vertical" ? "w-24 h-24 rounded-3xl" : "w-16 h-16 rounded-2xl"} flex items-center justify-center transition-all group-hover:scale-110`}
              style={{
                background: `${accentTheme.color}15`,
                border: `1px dashed ${accentTheme.color}40`,
              }}
            >
              <MonitorSmartphone
                className={`${variant === "vertical" ? "w-11 h-11" : "w-7 h-7"} transition-colors`}
                style={{ color: `${accentTheme.color}90` }}
              />
            </div>
            <div className="text-center">
              <p
                className={`${variant === "vertical" ? "text-[18px]" : "text-[13px]"} font-medium text-white/40 group-hover:text-white/60 transition-colors`}
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                App Screenshot
              </p>
              <p
                className={`${variant === "vertical" ? "text-[14px] mt-2" : "text-[11px] mt-1"} text-white/20`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Click to upload
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Outer glow for border — rendered outside overflow-hidden container so it's not clipped */}
      {screenshotImage && visibleBounds && borderThickness > 0 && (
        <div
          className="absolute pointer-events-none z-[14]"
          style={{
            left: visibleBounds.x,
            top: visibleBounds.y,
            width: visibleBounds.width,
            height: visibleBounds.height,
            borderRadius: SCREENSHOT_FRAME_RADIUS,
            boxShadow: `0 0 ${14 + borderThickness * 2}px ${accentTheme.glowColor}, 0 0 ${34 + borderThickness * 4}px ${accentTheme.glowColor}55`,
            transition: isDragging ? "none" : "all 0.15s ease-out",
          }}
        />
      )}

      {/* Crop/Resize Controls */}
      {screenshotImage && showControls && !isDragging && !isExporting && (
        <div
          className={`absolute ${variant === "vertical" ? "bottom-5" : "bottom-3"} left-1/2 -translate-x-1/2 flex items-center ${variant === "vertical" ? "gap-2 px-3 py-2.5 rounded-xl" : "gap-1.5 px-2 py-1.5 rounded-lg"} z-20 transition-opacity`}
          style={{
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {!isApproved && (
            <>
              <button
                className={`flex items-center justify-center ${variant === "vertical" ? "w-9 h-9" : "w-7 h-7"} rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors`}
                onClick={handleZoomOut}
                title="Zoom out"
              >
                <ZoomOut className={variant === "vertical" ? "w-5 h-5" : "w-3.5 h-3.5"} />
              </button>

              <div
                className={`${variant === "vertical" ? "text-[13px] min-w-[48px]" : "text-[10px] min-w-[40px]"} text-white/50 text-center select-none`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {Math.round(crop.scale * 100)}%
              </div>

              <button
                className={`flex items-center justify-center ${variant === "vertical" ? "w-9 h-9" : "w-7 h-7"} rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors`}
                onClick={handleZoomIn}
                title="Zoom in"
              >
                <ZoomIn className={variant === "vertical" ? "w-5 h-5" : "w-3.5 h-3.5"} />
              </button>

              <div className={`w-px ${variant === "vertical" ? "h-5" : "h-4"} bg-white/10 mx-0.5`} />

              <div
                className={`flex items-center gap-1 ${variant === "vertical" ? "text-[13px]" : "text-[10px]"} text-white/40 select-none px-1`}
                title="Drag image to reposition"
              >
                <Move className={variant === "vertical" ? "w-4 h-4" : "w-3 h-3"} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>Drag</span>
              </div>

              <div className={`w-px ${variant === "vertical" ? "h-5" : "h-4"} bg-white/10 mx-0.5`} />
            </>
          )}

          {/* Approve / Edit Crop button */}
          {!isApproved ? (
            <button
              className={`flex items-center justify-center gap-1 ${variant === "vertical" ? "h-9 px-3.5 text-[13px]" : "h-7 px-2.5 text-[10px]"} rounded-md text-white/90 hover:text-white transition-all font-medium`}
              style={{
                background: `${accentTheme.color}30`,
                border: `1px solid ${accentTheme.color}50`,
                fontFamily: "'JetBrains Mono', monospace",
              }}
              onClick={handleApprove}
              title="Approve current crop"
            >
              <Check className={variant === "vertical" ? "w-4 h-4" : "w-3 h-3"} />
              Approve
            </button>
          ) : (
            <button
              className={`flex items-center justify-center gap-1 ${variant === "vertical" ? "h-9 px-3.5 text-[13px]" : "h-7 px-2.5 text-[10px]"} rounded-md text-white/90 hover:text-white transition-all font-medium`}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
              onClick={handleEditCrop}
              title="Edit crop"
            >
              <Pencil className={variant === "vertical" ? "w-4 h-4" : "w-3 h-3"} />
              Edit Crop
            </button>
          )}

          <div className={`w-px ${variant === "vertical" ? "h-5" : "h-4"} bg-white/10 mx-0.5`} />

          <button
            className={`flex items-center justify-center ${variant === "vertical" ? "w-9 h-9" : "w-7 h-7"} rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors`}
            onClick={handleReset}
            title="Reset position & zoom"
          >
            <RotateCcw className={variant === "vertical" ? "w-5 h-5" : "w-3.5 h-3.5"} />
          </button>

          <button
            className={`flex items-center justify-center ${variant === "vertical" ? "w-9 h-9" : "w-7 h-7"} rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors`}
            onClick={(e) => {
              e.stopPropagation();
              triggerUpload();
            }}
            title="Replace image"
          >
            <MonitorSmartphone className={variant === "vertical" ? "w-5 h-5" : "w-3.5 h-3.5"} />
          </button>
        </div>
      )}

      {/* Remove button */}
      {screenshotImage && !isExporting && (
        <button
          className={`absolute ${variant === "vertical" ? "-top-3 -right-3 w-8 h-8" : "-top-2 -right-2 w-6 h-6"} rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm`}
          onClick={(e) => {
            e.stopPropagation();
            setCrop(DEFAULT_CROP);
            setIsApproved(false);
            setShowApprovedFeedback(false);
            onScreenshotChange(null);
          }}
          title="Remove screenshot"
        >
          <X className={`${variant === "vertical" ? "w-5 h-5" : "w-3.5 h-3.5"} text-white/70`} />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleChange(e);
          setCrop(DEFAULT_CROP);
          setIsApproved(false);
          setShowApprovedFeedback(false);
        }}
      />
    </div>
  );
}
