import type { AccentTheme, AdFormat, BackgroundMode } from "./types";
import { handlePastePlainText } from "./paste-plain-text";

interface QuoteBlockProps {
  quote: string;
  accentTheme: AccentTheme;
  format: AdFormat;
  onQuoteChange: (text: string) => void;
  backgroundMode: BackgroundMode;
  quoteFontSize?: number;
}

export function QuoteBlock({
  quote,
  accentTheme,
  format,
  onQuoteChange,
  backgroundMode,
  quoteFontSize,
}: QuoteBlockProps) {
  const isVertical = format === "9x16";
  const isLandscape = format === "16x9";
  const isDark = backgroundMode === "dark";

  // Default sizes per format if no custom size provided
  const defaultSize = isVertical ? 32 : isLandscape ? 32 : 24;
  const fontSize = quoteFontSize ?? defaultSize;

  // Scale the quote mark proportionally to the font size
  // Use a smaller multiplier for 9x16 to save vertical space
  const quoteMarkMultiplier = isVertical ? 1.3 : 3.2;
  const quoteMarkMbMultiplier = isVertical ? -0.35 : -0.18;
  const quoteMarkPx = Math.round(fontSize * quoteMarkMultiplier);
  const quoteMarkMb = Math.round(fontSize * quoteMarkMbMultiplier);

  const paddingLeft = isVertical ? "pl-8" : "pl-7";

  return (
    <div className="relative">
      {/* Accent bar - vertical left border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[4px] rounded-full"
        style={{ backgroundColor: accentTheme.color }}
      />

      <div className={paddingLeft}>
        {/* Decorative opening quote mark */}
        <span
          className="block leading-none font-bold"
          style={{
            fontFamily: "'Hedvig Letters Serif', serif",
            color: accentTheme.color,
            fontSize: `${quoteMarkPx}px`,
            marginBottom: `${quoteMarkMb}px`,
          }}
        >
          &ldquo;
        </span>

        {/* Quote text */}
        <p
          contentEditable
          suppressContentEditableWarning
          className="leading-relaxed outline-none cursor-text"
          style={{
            fontFamily: "'Hedvig Letters Serif', serif",
            fontWeight: 400,
            fontSize: `${fontSize}px`,
            color: isDark ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.85)",
          }}
          onPaste={handlePastePlainText}
          onBlur={(e) =>
            onQuoteChange(e.currentTarget.textContent || quote)
          }
        >
          {quote}
        </p>
      </div>
    </div>
  );
}
