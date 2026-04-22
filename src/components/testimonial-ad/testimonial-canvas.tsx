import { motion, AnimatePresence } from "framer-motion";
import type {
  AccentTheme,
  AdFormat,
  BackgroundMode,
  TestimonialData,
  VerticalLayoutVariant,
} from "./types";
import { CanvasBackground } from "./canvas-background";
import { LogoSlot } from "./logo-slot";
import { BadgePill } from "./badge-pill";
import { QuoteBlock } from "./quote-block";
import { StarRating } from "./star-rating";
import { ClientAvatar } from "./client-avatar";
import { AttributionBlock } from "./attribution-block";
import { AppScreenshotSlot } from "./app-screenshot-slot";
import React, { useState, useCallback, useRef, useEffect } from "react";

interface TestimonialCanvasProps {
  data: TestimonialData;
  format: AdFormat;
  accentTheme: AccentTheme;
  backgroundMode: BackgroundMode;
  verticalLayoutVariant: VerticalLayoutVariant;
  onDataChange: (data: Partial<TestimonialData>) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  isExporting?: boolean;
}

const staggerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

export function TestimonialCanvas({
  data,
  format,
  accentTheme,
  backgroundMode,
  verticalLayoutVariant,
  onDataChange,
  canvasRef,
  isExporting = false,
}: TestimonialCanvasProps) {
  const isVertical = format === "9x16";
  const isLandscape = format === "16x9";

  // Scale canvas down to fit screen while maintaining aspect ratio
  const canvasWidth = isLandscape ? 1920 : 1080;
  const canvasHeight = isVertical ? 1920 : 1080;

  return (
    <div
      className="relative overflow-hidden"
      ref={canvasRef}
      style={{
        width: canvasWidth,
        height: canvasHeight,
      }}
    >
      <CanvasBackground
        accentTheme={accentTheme}
        backgroundMode={backgroundMode}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={`${format}-${verticalLayoutVariant}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-full h-full"
        >
          {isVertical ? (
            verticalLayoutVariant === "quote-top" ? (
              <VerticalQuoteTopLayout
                data={data}
                accentTheme={accentTheme}
                backgroundMode={backgroundMode}
                format={format}
                onDataChange={onDataChange}
                isExporting={isExporting}
              />
            ) : (
              <VerticalLayout
                data={data}
                accentTheme={accentTheme}
                backgroundMode={backgroundMode}
                format={format}
                onDataChange={onDataChange}
                isExporting={isExporting}
              />
            )
          ) : isLandscape ? (
            <LandscapeLayout
              data={data}
              accentTheme={accentTheme}
              backgroundMode={backgroundMode}
              format={format}
              onDataChange={onDataChange}
              isExporting={isExporting}
            />
          ) : (
            <SquareLayout
              data={data}
              accentTheme={accentTheme}
              backgroundMode={backgroundMode}
              format={format}
              onDataChange={onDataChange}
              isExporting={isExporting}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─── 1×1 Square Layout (1080×1080) ─── */
function SquareLayout({
  data,
  accentTheme,
  backgroundMode,
  format,
  onDataChange,
  isExporting = false,
}: {
  data: TestimonialData;
  accentTheme: AccentTheme;
  backgroundMode: BackgroundMode;
  format: AdFormat;
  onDataChange: (d: Partial<TestimonialData>) => void;
  isExporting?: boolean;
}) {
  const isDark = backgroundMode === "dark";
  return (
    <div className="flex flex-col h-full px-[64px] py-[56px]">
      {/* Top: Logo + Badge */}
      <motion.div
        className="flex items-center justify-between"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        <LogoSlot
          logoText={data.logoText}
          logoImage={data.logoImage}
          onLogoTextChange={(t) => onDataChange({ logoText: t })}
          onLogoImageChange={(img) => onDataChange({ logoImage: img })}
          backgroundMode={backgroundMode}
        />
        <BadgePill
          text={data.badgeText}
          onTextChange={(t) => onDataChange({ badgeText: t })}
          backgroundMode={backgroundMode}
        />
      </motion.div>
      {/* App Screenshot – hero slot */}
      <motion.div
        className="mt-4 flex justify-center flex-1 min-h-0 overflow-hidden"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={1}
      >
        <AppScreenshotSlot
          screenshotImage={data.appScreenshot}
          accentTheme={accentTheme}
          borderThickness={data.borderThickness[format]}
          onScreenshotChange={(img) => onDataChange({ appScreenshot: img })}
          variant="square"
          isExporting={isExporting}
        />
      </motion.div>
      {/* Star Rating */}
      <motion.div
        className="mt-3 mb-2"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={2}
      >
        <StarRating
          rating={data.rating}
          accentTheme={accentTheme}
          onRatingChange={(r) => onDataChange({ rating: r })}
        />
      </motion.div>
      {/* Quote */}
      <motion.div
        className="mb-4"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={3}
      >
        <QuoteBlock
          quote={data.quote}
          accentTheme={accentTheme}
          format={format}
          onQuoteChange={(t) => onDataChange({ quote: t })}
          backgroundMode={backgroundMode}
          quoteFontSize={data.quoteFontSize[format]}
        />
      </motion.div>
      {/* Horizontal divider */}
      <motion.div
        className={`w-full h-px mb-3 ${isDark ? "bg-white/10" : "bg-black/10"}`}
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={4}
      />
      {/* Bottom: Avatar + Attribution */}
      <motion.div
        className="flex items-center justify-between"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={5}
      >
        <div className="flex items-center gap-5">
          <ClientAvatar
            avatarImage={data.avatarImage}
            accentTheme={accentTheme}
            onAvatarImageChange={(img) => onDataChange({ avatarImage: img })}
            size={56}
            backgroundMode={backgroundMode}
          />
          <AttributionBlock
            clientName={data.clientName}
            clientRole={data.clientRole}
            onNameChange={(t) => onDataChange({ clientName: t })}
            onRoleChange={(t) => onDataChange({ clientRole: t })}
            backgroundMode={backgroundMode}
          />
        </div>
      </motion.div>
    </div>
  );
}

/* ─── 9×16 Vertical Layout (1080×1920) ─── */
function VerticalLayout({
  data,
  accentTheme,
  backgroundMode,
  format,
  onDataChange,
  isExporting = false,
}: {
  data: TestimonialData;
  accentTheme: AccentTheme;
  backgroundMode: BackgroundMode;
  format: AdFormat;
  onDataChange: (d: Partial<TestimonialData>) => void;
  isExporting?: boolean;
}) {
  const isDark = backgroundMode === "dark";
  return (
    <div className="flex flex-col h-full px-[72px] py-[96px]">
      {/* Top: Logo + Badge */}
      <motion.div
        className="flex items-center justify-between"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        <LogoSlot
          logoText={data.logoText}
          logoImage={data.logoImage}
          onLogoTextChange={(t) => onDataChange({ logoText: t })}
          onLogoImageChange={(img) => onDataChange({ logoImage: img })}
          backgroundMode={backgroundMode}
        />
        <BadgePill
          text={data.badgeText}
          onTextChange={(t) => onDataChange({ badgeText: t })}
          backgroundMode={backgroundMode}
        />
      </motion.div>
      {/* App Screenshot – hero slot in vertical format */}
      <motion.div
        className="mt-10 flex justify-center flex-1 min-h-0 overflow-hidden"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={1}
      >
        <AppScreenshotSlot
          screenshotImage={data.appScreenshot}
          accentTheme={accentTheme}
          borderThickness={data.borderThickness[format]}
          onScreenshotChange={(img) => onDataChange({ appScreenshot: img })}
          variant="vertical"
          isExporting={isExporting}
        />
      </motion.div>
      {/* Small spacer before bottom content */}
      <div className="min-h-[32px]" />
      {/* Star rating */}
      <motion.div
        className="mb-8"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={2}
      >
        <StarRating
          rating={data.rating}
          accentTheme={accentTheme}
          onRatingChange={(r) => onDataChange({ rating: r })}
        />
      </motion.div>
      {/* Quote */}
      <motion.div
        className="mb-10"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={3}
      >
        <QuoteBlock
          quote={data.quote}
          accentTheme={accentTheme}
          format={format}
          onQuoteChange={(t) => onDataChange({ quote: t })}
          backgroundMode={backgroundMode}
          quoteFontSize={data.quoteFontSize[format]}
        />
      </motion.div>
      {/* Horizontal divider */}
      <motion.div
        className={`w-full h-px mb-10 ${isDark ? "bg-white/10" : "bg-black/10"}`}
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={4}
      />
      {/* Bottom: Avatar + Attribution */}
      <motion.div
        className="flex items-center gap-8"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={5}
      >
        <ClientAvatar
          avatarImage={data.avatarImage}
          accentTheme={accentTheme}
          onAvatarImageChange={(img) => onDataChange({ avatarImage: img })}
          size={110}
          backgroundMode={backgroundMode}
        />
        <AttributionBlock
          clientName={data.clientName}
          clientRole={data.clientRole}
          onNameChange={(t) => onDataChange({ clientName: t })}
          onRoleChange={(t) => onDataChange({ clientRole: t })}
          backgroundMode={backgroundMode}
          nameFontSize={40}
          roleFontSize={30}
        />
      </motion.div>
    </div>
  );
}

/* ─── 9×16 Vertical Layout — Quote Top (1080×1920) ─── */
function VerticalQuoteTopLayout({
  data,
  accentTheme,
  backgroundMode,
  format,
  onDataChange,
  isExporting = false,
}: {
  data: TestimonialData;
  accentTheme: AccentTheme;
  backgroundMode: BackgroundMode;
  format: AdFormat;
  onDataChange: (d: Partial<TestimonialData>) => void;
  isExporting?: boolean;
}) {
  const isDark = backgroundMode === "dark";
  return (
    <div className="flex flex-col h-full px-[72px] py-[96px]">
      {/* Top: Logo + Badge */}
      <motion.div
        className="flex items-center justify-between"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        <LogoSlot
          logoText={data.logoText}
          logoImage={data.logoImage}
          onLogoTextChange={(t) => onDataChange({ logoText: t })}
          onLogoImageChange={(img) => onDataChange({ logoImage: img })}
          backgroundMode={backgroundMode}
        />
        <BadgePill
          text={data.badgeText}
          onTextChange={(t) => onDataChange({ badgeText: t })}
          backgroundMode={backgroundMode}
        />
      </motion.div>

      {/* Star rating */}
      <motion.div
        className="mt-10 mb-6"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={1}
      >
        <StarRating
          rating={data.rating}
          accentTheme={accentTheme}
          onRatingChange={(r) => onDataChange({ rating: r })}
        />
      </motion.div>

      {/* Quote */}
      <motion.div
        className="mb-8"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={2}
      >
        <QuoteBlock
          quote={data.quote}
          accentTheme={accentTheme}
          format={format}
          onQuoteChange={(t) => onDataChange({ quote: t })}
          backgroundMode={backgroundMode}
          quoteFontSize={data.quoteFontSize[format]}
        />
      </motion.div>

      {/* Horizontal divider */}
      <motion.div
        className={`w-full h-px mb-8 ${isDark ? "bg-white/10" : "bg-black/10"}`}
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={3}
      />

      {/* Avatar + Attribution */}
      <motion.div
        className="flex items-center gap-8 mb-8"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={4}
      >
        <ClientAvatar
          avatarImage={data.avatarImage}
          accentTheme={accentTheme}
          onAvatarImageChange={(img) => onDataChange({ avatarImage: img })}
          size={90}
          backgroundMode={backgroundMode}
        />
        <AttributionBlock
          clientName={data.clientName}
          clientRole={data.clientRole}
          onNameChange={(t) => onDataChange({ clientName: t })}
          onRoleChange={(t) => onDataChange({ clientRole: t })}
          backgroundMode={backgroundMode}
          nameFontSize={36}
          roleFontSize={26}
        />
      </motion.div>

      {/* App Screenshot – bottom hero slot */}
      <motion.div
        className="flex justify-center flex-1 min-h-0 overflow-hidden"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={5}
      >
        <AppScreenshotSlot
          screenshotImage={data.appScreenshot}
          accentTheme={accentTheme}
          borderThickness={data.borderThickness[format]}
          onScreenshotChange={(img) => onDataChange({ appScreenshot: img })}
          variant="vertical"
          isExporting={isExporting}
        />
      </motion.div>
    </div>
  );
}

/* ─── 16×9 Landscape Layout (1920×1080) ─── */
function LandscapeLayout({
  data,
  accentTheme,
  backgroundMode,
  format,
  onDataChange,
  isExporting = false,
}: {
  data: TestimonialData;
  accentTheme: AccentTheme;
  backgroundMode: BackgroundMode;
  format: AdFormat;
  onDataChange: (d: Partial<TestimonialData>) => void;
  isExporting?: boolean;
}) {
  const isDark = backgroundMode === "dark";
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(640);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  const MIN_LEFT = 420;
  const MAX_LEFT = 960;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      dragStartX.current = e.clientX;
      dragStartWidth.current = leftWidth;
    },
    [leftWidth],
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      // Get the scale of the canvas (it's often scaled down to fit)
      const rect = container.getBoundingClientRect();
      const scale = rect.width / 1920;
      const delta = (e.clientX - dragStartX.current) / scale;
      const newWidth = Math.min(
        MAX_LEFT,
        Math.max(MIN_LEFT, dragStartWidth.current + delta),
      );
      setLeftWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className="flex h-full"
      style={{ cursor: isDragging ? "col-resize" : undefined }}
    >
      {/* Left column – Attribution & Quote */}
      <div
        className="flex flex-col justify-between shrink-0 px-[56px] py-[72px]"
        style={{ width: leftWidth }}
      >
        {/* Top: Logo + Badge */}
        <motion.div
          className="flex items-center justify-between"
          variants={staggerVariants}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <LogoSlot
            logoText={data.logoText}
            logoImage={data.logoImage}
            onLogoTextChange={(t) => onDataChange({ logoText: t })}
            onLogoImageChange={(img) => onDataChange({ logoImage: img })}
            backgroundMode={backgroundMode}
          />
          <BadgePill
            text={data.badgeText}
            onTextChange={(t) => onDataChange({ badgeText: t })}
            backgroundMode={backgroundMode}
          />
        </motion.div>

        {/* Middle: Quote */}
        <motion.div
          className="flex flex-col gap-6"
          variants={staggerVariants}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <StarRating
            rating={data.rating}
            accentTheme={accentTheme}
            onRatingChange={(r) => onDataChange({ rating: r })}
          />
          <QuoteBlock
            quote={data.quote}
            accentTheme={accentTheme}
            format={format}
            onQuoteChange={(t) => onDataChange({ quote: t })}
            backgroundMode={backgroundMode}
            quoteFontSize={data.quoteFontSize[format]}
          />
        </motion.div>

        {/* Bottom: Avatar + Attribution */}
        <motion.div
          className="flex items-center gap-8 w-[420px] h-[120px]"
          variants={staggerVariants}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <ClientAvatar
            avatarImage={data.avatarImage}
            accentTheme={accentTheme}
            onAvatarImageChange={(img) => onDataChange({ avatarImage: img })}
            size={96}
            backgroundMode={backgroundMode}
          />
          <AttributionBlock
            clientName={data.clientName}
            clientRole={data.clientRole}
            onNameChange={(t) => onDataChange({ clientName: t })}
            onRoleChange={(t) => onDataChange({ clientRole: t })}
            backgroundMode={backgroundMode}
          />
        </motion.div>
      </div>
      {/* Draggable Divider */}
      {!isExporting && (
        <div
          className="relative shrink-0 flex items-center justify-center"
          style={{
            width: 12,
            cursor: "col-resize",
            zIndex: 20,
          }}
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Visible line */}
          <div
            className="absolute inset-y-0 transition-all duration-200"
            style={{
              width: isDragging ? 3 : isHovering ? 2 : 1,
              left: "50%",
              transform: "translateX(-50%)",
              background: isDragging
                ? accentTheme.color
                : isHovering
                  ? isDark
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.15)"
                  : isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.05)",
              boxShadow: isDragging
                ? `0 0 12px ${accentTheme.glowColor}`
                : "none",
            }}
          />
          {/* Drag handle dots */}
          <div
            className="relative z-10 flex flex-col gap-1 items-center transition-opacity duration-200"
            style={{ opacity: isDragging || isHovering ? 1 : 0 }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  background: isDragging
                    ? accentTheme.color
                    : isDark
                      ? "rgba(255,255,255,0.4)"
                      : "rgba(0,0,0,0.3)",
                }}
              />
            ))}
          </div>
        </div>
      )}
      {/* Static border for export */}
      {isExporting && (
        <div
          className="shrink-0"
          style={{
            width: 1,
            background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
          }}
        />
      )}
      {/* Right column – App Screenshot (widescreen hero) */}
      <div className="flex-1 flex items-center justify-center p-[40px]">
        <motion.div
          className="w-full h-full"
          variants={staggerVariants}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          <AppScreenshotSlot
            screenshotImage={data.appScreenshot}
            accentTheme={accentTheme}
            borderThickness={data.borderThickness[format]}
            onScreenshotChange={(img) => onDataChange({ appScreenshot: img })}
            variant="landscape"
            isExporting={isExporting}
          />
        </motion.div>
      </div>
    </div>
  );
}
