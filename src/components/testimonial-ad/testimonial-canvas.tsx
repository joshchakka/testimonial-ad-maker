import { motion, AnimatePresence } from "framer-motion";
import type { AccentTheme, AdFormat, TestimonialData } from "./types";
import { CanvasBackground } from "./canvas-background";
import { LogoSlot } from "./logo-slot";
import { BadgePill } from "./badge-pill";
import { QuoteBlock } from "./quote-block";
import { StarRating } from "./star-rating";
import { ClientAvatar } from "./client-avatar";
import { AttributionBlock } from "./attribution-block";
import { AppScreenshotSlot } from "./app-screenshot-slot";
import React from "react";

interface TestimonialCanvasProps {
  data: TestimonialData;
  format: AdFormat;
  accentTheme: AccentTheme;
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
      <CanvasBackground accentTheme={accentTheme} />
      <AnimatePresence mode="wait">
        <motion.div
          key={format}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-full h-full"
        >
          {isVertical ? (
            <VerticalLayout
              data={data}
              accentTheme={accentTheme}
              format={format}
              onDataChange={onDataChange}
              isExporting={isExporting}
            />
          ) : isLandscape ? (
            <LandscapeLayout
              data={data}
              accentTheme={accentTheme}
              format={format}
              onDataChange={onDataChange}
              isExporting={isExporting}
            />
          ) : (
            <SquareLayout
              data={data}
              accentTheme={accentTheme}
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
  format,
  onDataChange,
  isExporting = false,
}: {
  data: TestimonialData;
  accentTheme: AccentTheme;
  format: AdFormat;
  onDataChange: (d: Partial<TestimonialData>) => void;
  isExporting?: boolean;
}) {
  return (
    <div className="flex flex-col h-full px-[72px] py-[64px]">
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
        />
        <BadgePill
          text={data.badgeText}
          onTextChange={(t) => onDataChange({ badgeText: t })}
        />
      </motion.div>

      {/* App Screenshot */}
      <motion.div
        className="mt-8 flex justify-center"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={1}
      >
        <AppScreenshotSlot
          screenshotImage={data.appScreenshot}
          accentTheme={accentTheme}
          onScreenshotChange={(img) => onDataChange({ appScreenshot: img })}
          variant="square"
          isExporting={isExporting}
        />
      </motion.div>

      {/* Spacer pushes content to bottom */}
      <div className="flex-1" />

      {/* Star Rating */}
      <motion.div
        className="mb-5"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={2}
      >
        <StarRating rating={data.rating} accentTheme={accentTheme} onRatingChange={(r) => onDataChange({ rating: r })} />
      </motion.div>
      {/* Quote */}
      <motion.div
        className="mb-6"
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
        />
      </motion.div>
      {/* Horizontal divider */}
      <motion.div
        className="w-full h-px bg-white/10 mb-6"
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
            size={64}
          />
          <AttributionBlock
            clientName={data.clientName}
            clientRole={data.clientRole}
            onNameChange={(t) => onDataChange({ clientName: t })}
            onRoleChange={(t) => onDataChange({ clientRole: t })}
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
  format,
  onDataChange,
  isExporting = false,
}: {
  data: TestimonialData;
  accentTheme: AccentTheme;
  format: AdFormat;
  onDataChange: (d: Partial<TestimonialData>) => void;
  isExporting?: boolean;
}) {
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
        />
        <BadgePill
          text={data.badgeText}
          onTextChange={(t) => onDataChange({ badgeText: t })}
        />
      </motion.div>

      {/* App Screenshot – hero slot in vertical format */}
      <motion.div
        className="mt-12 flex justify-center"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={1}
      >
        <AppScreenshotSlot
          screenshotImage={data.appScreenshot}
          accentTheme={accentTheme}
          onScreenshotChange={(img) => onDataChange({ appScreenshot: img })}
          variant="vertical"
          isExporting={isExporting}
        />
      </motion.div>

      {/* Spacer pushes content to bottom */}
      <div className="flex-1" />

      {/* Star rating */}
      <motion.div
        className="mb-8"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={2}
      >
        <StarRating rating={data.rating} accentTheme={accentTheme} onRatingChange={(r) => onDataChange({ rating: r })} />
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
        />
      </motion.div>
      {/* Horizontal divider */}
      <motion.div
        className="w-full h-px bg-white/10 mb-10"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={4}
      />
      {/* Bottom: Avatar + Attribution */}
      <motion.div
        className="flex items-center gap-6"
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        custom={5}
      >
        <ClientAvatar
          avatarImage={data.avatarImage}
          accentTheme={accentTheme}
          onAvatarImageChange={(img) => onDataChange({ avatarImage: img })}
          size={80}
        />
        <AttributionBlock
          clientName={data.clientName}
          clientRole={data.clientRole}
          onNameChange={(t) => onDataChange({ clientName: t })}
          onRoleChange={(t) => onDataChange({ clientRole: t })}
        />
      </motion.div>
    </div>
  );
}

/* ─── 16×9 Landscape Layout (1920×1080) ─── */
function LandscapeLayout({
  data,
  accentTheme,
  format,
  onDataChange,
  isExporting = false,
}: {
  data: TestimonialData;
  accentTheme: AccentTheme;
  format: AdFormat;
  onDataChange: (d: Partial<TestimonialData>) => void;
  isExporting?: boolean;
}) {
  return (
    <div className="flex h-full">
      {/* Left column – Attribution & Quote */}
      <div className="flex flex-col justify-between w-[640px] shrink-0 px-[56px] py-[72px] border-r border-white/5">
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
          />
          <BadgePill
            text={data.badgeText}
            onTextChange={(t) => onDataChange({ badgeText: t })}
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
          />
        </motion.div>

        {/* Bottom: Avatar + Attribution */}
        <motion.div
          className="flex items-center gap-6"
          variants={staggerVariants}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <ClientAvatar
            avatarImage={data.avatarImage}
            accentTheme={accentTheme}
            onAvatarImageChange={(img) => onDataChange({ avatarImage: img })}
            size={72}
          />
          <AttributionBlock
            clientName={data.clientName}
            clientRole={data.clientRole}
            onNameChange={(t) => onDataChange({ clientName: t })}
            onRoleChange={(t) => onDataChange({ clientRole: t })}
          />
        </motion.div>
      </div>

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
            onScreenshotChange={(img) => onDataChange({ appScreenshot: img })}
            variant="landscape"
            isExporting={isExporting}
          />
        </motion.div>
      </div>
    </div>
  );
}
