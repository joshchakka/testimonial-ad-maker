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
import { useCallback, useEffect, useRef, useState } from "react";
import type { AccentTheme } from "./types";

interface AppScreenshotSlotProps {
  screenshotImage: string | null;
  accentTheme: AccentTheme;
  onScreenshotChange: (dataUrl: string | null) => void;
  /** Orientation hint for sizing */
  variant?: "square" | "vertical" | "landscape";
  /** When true, hide all editor chrome (crop overlays, badges, borders) */
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

export function AppScreenshotSlot({
  screenshotImage,
  accentTheme,
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
  const [approvedCrop, setApprovedCrop] = useState<ApprovedCrop | null>(null);
  const [showApprovedFeedback, setShowApprovedFeedback] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const dimensions = {
    square: { width: 360, height: 240 },
    vertical: { width: "100%" as const, height: 780 },
    landscape: { width: "100%" as const, height: "100%" as const },
  };

  const dim = dimensions[variant];

  // Compute the visible image bounds within the container
  const computeVisibleBounds = useCallback((): ApprovedCrop | null => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img || !naturalSize) return null;

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    const { w: natW, h: natH } = naturalSize;

    let renderedW: number;
    let renderedH: number;

    if (crop.scale <= 1) {
      const imgAspect = natW / natH;
      const contAspect = containerW / containerH;
      if (imgAspect > contAspect) {
        renderedW = containerW;
        renderedH = containerW / imgAspect;
      } else {
        renderedH = containerH;
        renderedW = containerH * imgAspect;
      }
    } else {
      const imgAspect = natW / natH;
      const contAspect = containerW / containerH;
      if (imgAspect > contAspect) {
        renderedH = containerH;
        renderedW = containerH * imgAspect;
      } else {
        renderedW = containerW;
        renderedH = containerW / imgAspect;
      }
    }

    const scaledW = renderedW * crop.scale;
    const scaledH = renderedH * crop.scale;
    const imgLeft = (containerW - scaledW) / 2 + crop.offsetX;
    const imgTop = (containerH - scaledH) / 2 + crop.offsetY;

    const visLeft = Math.max(0, imgLeft);
    const visTop = Math.max(0, imgTop);
    const visRight = Math.min(containerW, imgLeft + scaledW);
    const visBottom = Math.min(containerH, imgTop + scaledH);

    const visW = Math.max(0, visRight - visLeft);
    const visH = Math.max(0, visBottom - visTop);

    if (visW <= 0 || visH <= 0) return null;

    return { x: visLeft, y: visTop, width: visW, height: visH };
  }, [crop, naturalSize]);

  // Load natural image dimensions
  useEffect(() => {
    if (!screenshotImage) {
      setNaturalSize(null);
      return;
    }
    const img = new Image();
    img.onload = () => setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = screenshotImage;
  }, [screenshotImage]);

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
    setApprovedCrop(null);
    setShowApprovedFeedback(false);
  }, []);

  const handleApprove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const bounds = computeVisibleBounds();
      if (bounds) {
        setApprovedCrop(bounds);
        setIsApproved(true);
        // Show badge + dim overlay briefly then fade away
        setShowApprovedFeedback(true);
        setTimeout(() => setShowApprovedFeedback(false), 1200);
      }
    },
    [computeVisibleBounds]
  );

  const handleEditCrop = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsApproved(false);
    setApprovedCrop(null);
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
      };

      const handleMouseMove = (ev: MouseEvent) => {
        const start = dragStartRef.current;
        if (!start) return;
        const dx = ev.clientX - start.x;
        const dy = ev.clientY - start.y;
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
        borderRadius: 16,
        boxShadow: screenshotImage
          ? `0 0 0 2px ${accentTheme.color}, 0 0 24px ${accentTheme.glowColor}, 0 0 48px ${accentTheme.glowColor}50`
          : undefined,
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
          <div
            className="w-full h-full overflow-hidden relative"
            style={{ background: "#0D1117" }}
          >
            <img
              ref={imgRef}
              src={screenshotImage}
              alt="App screenshot"
              className="absolute inset-0 w-full h-full select-none pointer-events-none"
              draggable={false}
              style={{
                objectFit: crop.scale <= 1 ? "contain" : "cover",
                transform: `scale(${crop.scale}) translate(${crop.offsetX / crop.scale}px, ${crop.offsetY / crop.scale}px)`,
                transformOrigin: "center center",
                transition: isDragging ? "none" : "transform 0.15s ease-out",
              }}
            />

            {/* Approved crop overlay: dim area outside + badge — fades after 1.2s */}
            {isApproved && approvedCrop && !isExporting && (
              <>
                {/* Accent border around the approved crop — stays visible always, with uniform glow */}
                <div
                  className="absolute pointer-events-none z-[15]"
                  style={{
                    left: approvedCrop.x - 3,
                    top: approvedCrop.y - 3,
                    width: approvedCrop.width + 6,
                    height: approvedCrop.height + 6,
                    borderRadius: 14,
                    border: `2px solid ${accentTheme.color}`,
                    boxShadow: `0 0 20px ${accentTheme.glowColor}, 0 0 40px ${accentTheme.glowColor}60, inset 0 0 20px ${accentTheme.glowColor}40`,
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
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
                      height: approvedCrop.y,
                      background: "rgba(0,0,0,0.55)",
                    }}
                  />
                  {/* Bottom */}
                  <div
                    className="absolute"
                    style={{
                      left: 0,
                      top: approvedCrop.y + approvedCrop.height,
                      width: "100%",
                      height: `calc(100% - ${approvedCrop.y + approvedCrop.height}px)`,
                      background: "rgba(0,0,0,0.55)",
                    }}
                  />
                  {/* Left */}
                  <div
                    className="absolute"
                    style={{
                      left: 0,
                      top: approvedCrop.y,
                      width: approvedCrop.x,
                      height: approvedCrop.height,
                      background: "rgba(0,0,0,0.55)",
                    }}
                  />
                  {/* Right */}
                  <div
                    className="absolute"
                    style={{
                      left: approvedCrop.x + approvedCrop.width,
                      top: approvedCrop.y,
                      width: `calc(100% - ${approvedCrop.x + approvedCrop.width}px)`,
                      height: approvedCrop.height,
                      background: "rgba(0,0,0,0.55)",
                    }}
                  />
                  {/* Approved badge */}
                  <div
                    className="absolute z-[16] flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{
                      left: approvedCrop.x + approvedCrop.width / 2,
                      top: approvedCrop.y - 8,
                      transform: "translate(-50%, -100%)",
                      background: accentTheme.color,
                      boxShadow: `0 2px 12px ${accentTheme.glowColor}`,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      color: "#fff",
                      fontWeight: 600,
                      letterSpacing: "0.02em",
                    }}
                  >
                    <Check className="w-3 h-3" />
                    Crop Approved
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-4 cursor-pointer"
            onClick={triggerUpload}
          >
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
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
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
        {screenshotImage && !isApproved && (
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              boxShadow: "inset 0 0 40px rgba(0,0,0,0.15)",
            }}
          />
        )}
      </div>

      {/* Crop/Resize Controls */}
      {screenshotImage && showControls && !isDragging && !isExporting && (
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1.5 rounded-lg z-20 transition-opacity"
          style={{
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {!isApproved && (
            <>
              <button
                className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                onClick={handleZoomOut}
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <div
                className="text-[10px] text-white/50 min-w-[40px] text-center select-none"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {Math.round(crop.scale * 100)}%
              </div>

              <button
                className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                onClick={handleZoomIn}
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-4 bg-white/10 mx-0.5" />

              <div
                className="flex items-center gap-1 text-[10px] text-white/40 select-none px-1"
                title="Drag image to reposition"
              >
                <Move className="w-3 h-3" />
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>Drag</span>
              </div>

              <div className="w-px h-4 bg-white/10 mx-0.5" />
            </>
          )}

          {/* Approve / Edit Crop button */}
          {!isApproved ? (
            <button
              className="flex items-center justify-center gap-1 h-7 px-2.5 rounded-md text-white/90 hover:text-white transition-all text-[10px] font-medium"
              style={{
                background: `${accentTheme.color}30`,
                border: `1px solid ${accentTheme.color}50`,
                fontFamily: "'JetBrains Mono', monospace",
              }}
              onClick={handleApprove}
              title="Approve current crop"
            >
              <Check className="w-3 h-3" />
              Approve
            </button>
          ) : (
            <button
              className="flex items-center justify-center gap-1 h-7 px-2.5 rounded-md text-white/90 hover:text-white transition-all text-[10px] font-medium"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
              onClick={handleEditCrop}
              title="Edit crop"
            >
              <Pencil className="w-3 h-3" />
              Edit Crop
            </button>
          )}

          <div className="w-px h-4 bg-white/10 mx-0.5" />

          <button
            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            onClick={handleReset}
            title="Reset position & zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              triggerUpload();
            }}
            title="Replace image"
          >
            <MonitorSmartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Remove button */}
      {screenshotImage && !isExporting && (
        <button
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            setCrop(DEFAULT_CROP);
            setIsApproved(false);
            setApprovedCrop(null);
            setShowApprovedFeedback(false);
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
        onChange={(e) => {
          handleChange(e);
          setCrop(DEFAULT_CROP);
          setIsApproved(false);
          setApprovedCrop(null);
          setShowApprovedFeedback(false);
        }}
      />
    </div>
  );
}
