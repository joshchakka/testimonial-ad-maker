import type { AccentTheme, AdFormat } from "./types";

interface QuoteBlockProps {
  quote: string;
  accentTheme: AccentTheme;
  format: AdFormat;
  onQuoteChange: (text: string) => void;
}

export function QuoteBlock({
  quote,
  accentTheme,
  format,
  onQuoteChange,
}: QuoteBlockProps) {
  const isVertical = format === "9x16";
  const isLandscape = format === "16x9";

  const quoteMarkSize = isVertical
    ? "text-[100px] -mb-6"
    : isLandscape
    ? "text-[90px] -mb-5"
    : "text-[80px] -mb-5";

  const quoteTextSize = isVertical
    ? "text-[32px]"
    : isLandscape
    ? "text-[32px]"
    : "text-[24px]";

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
          className={`block leading-none font-bold ${quoteMarkSize}`}
          style={{
            fontFamily: "'Fraunces', serif",
            color: accentTheme.color,
          }}
        >
          &ldquo;
        </span>

        {/* Quote text */}
        <p
          contentEditable
          suppressContentEditableWarning
          className={`text-white/95 leading-relaxed outline-none cursor-text ${quoteTextSize}`}
          style={{
            fontFamily: "'Fraunces', serif",
            fontStyle: "italic",
            fontWeight: 400,
          }}
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
