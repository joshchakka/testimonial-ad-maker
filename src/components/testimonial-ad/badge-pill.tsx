interface BadgePillProps {
  text: string;
  onTextChange: (text: string) => void;
}

export function BadgePill({ text, onTextChange }: BadgePillProps) {
  return (
    <span
      contentEditable
      suppressContentEditableWarning
      className="inline-block px-4 py-1.5 rounded-full text-[14px] font-medium tracking-wider uppercase border border-white/10 bg-white/5 text-white/60 outline-none cursor-text"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
      onBlur={(e) => onTextChange(e.currentTarget.textContent || text)}
    >
      {text}
    </span>
  );
}
