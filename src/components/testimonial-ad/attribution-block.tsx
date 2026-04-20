import type { BackgroundMode } from "./types";
import { handlePastePlainText } from "./paste-plain-text";

interface AttributionBlockProps {
  clientName: string;
  clientRole: string;
  onNameChange: (text: string) => void;
  onRoleChange: (text: string) => void;
  backgroundMode: BackgroundMode;
  nameFontSize?: number;
  roleFontSize?: number;
}

export function AttributionBlock({
  clientName,
  clientRole,
  onNameChange,
  onRoleChange,
  backgroundMode,
  nameFontSize = 30,
  roleFontSize = 24,
}: AttributionBlockProps) {
  const isDark = backgroundMode === "dark";

  return (
    <div className="flex flex-col gap-1.5">
      <span
        contentEditable
        suppressContentEditableWarning
        className="font-medium outline-none cursor-text"
        style={{
          fontSize: nameFontSize,
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          color: isDark ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.85)",
        }}
        onPaste={handlePastePlainText}
        onBlur={(e) =>
          onNameChange(e.currentTarget.textContent || clientName)
        }
      >
        {clientName}
      </span>
      <span
        contentEditable
        suppressContentEditableWarning
        className="font-light outline-none cursor-text"
        style={{
          fontSize: roleFontSize,
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          color: isDark ? "#94A3B8" : "#64748B",
        }}
        onPaste={handlePastePlainText}
        onBlur={(e) =>
          onRoleChange(e.currentTarget.textContent || clientRole)
        }
      >
        {clientRole}
      </span>
    </div>
  );
}
