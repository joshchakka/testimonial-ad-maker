import type { BackgroundMode } from "./types";

interface BadgePillProps {
  text: string;
  onTextChange: (text: string) => void;
  backgroundMode: BackgroundMode;
}

export function BadgePill({ text, onTextChange, backgroundMode }: BadgePillProps) {
  const isDark = backgroundMode === "dark";

  return (
    <span
      contentEditable
      suppressContentEditableWarning
      className={`inline-block px-4 py-1.5 rounded-full text-[14px] font-medium tracking-wider uppercase border outline-none cursor-text ${
        isDark
          ? "border-white/10 bg-white/5 text-white/60"
          : "border-black/10 bg-black/5 text-black/50"
      }`}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
      onBlur={(e) => onTextChange(e.currentTarget.textContent || text)}
    >
      {text}
    </span>
  );
}
