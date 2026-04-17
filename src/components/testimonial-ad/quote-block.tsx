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

  return (
    <div className="relative">
      {/* Accent bar - vertical left border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[4px] rounded-full"
        style={{ backgroundColor: accentTheme.color }}
      />

      <div className={`${isVertical ? "pl-8" : "pl-7"}`}>
        {/* Decorative opening quote mark */}
        <span
          className={`block leading-none font-bold ${isVertical ? "text-[120px] -mb-8" : "text-[96px] -mb-6"}`}
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
          className={`text-white/95 leading-relaxed outline-none cursor-text ${isVertical ? "text-[36px]" : "text-[28px]"}`}
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
