import { useFileUpload } from "@/hooks/use-file-upload";
import { Upload, X } from "lucide-react";
import type { BackgroundMode } from "./types";
import { handlePastePlainText } from "./paste-plain-text";

interface LogoSlotProps {
  logoText: string;
  logoImage: string | null;
  onLogoTextChange: (text: string) => void;
  onLogoImageChange: (dataUrl: string | null) => void;
  backgroundMode: BackgroundMode;
}

export function LogoSlot({
  logoText,
  logoImage,
  onLogoTextChange,
  onLogoImageChange,
  backgroundMode,
}: LogoSlotProps) {
  const { inputRef, triggerUpload, handleChange } =
    useFileUpload((url) => onLogoImageChange(url));

  const isDark = backgroundMode === "dark";

  return (
    <div className="flex items-center gap-3">
      {/* Clickable logo area */}
      <div
        className="relative cursor-pointer group"
        onClick={triggerUpload}
        title="Click to upload logo"
      >
        {logoImage ? (
          <div className="relative">
            <img
              src={logoImage}
              alt="Logo"
              className="h-10 max-w-[180px] object-contain"
              style={isDark ? undefined : { filter: "invert(1)" }}
            />
            {/* Remove button */}
            <button
              className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/10 hover:bg-black/20"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onLogoImageChange(null);
              }}
              title="Remove logo image"
            >
              <X className={`w-3 h-3 ${isDark ? "text-white/70" : "text-black/70"}`} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors ${
              isDark ? "bg-white/10 group-hover:bg-white/20" : "bg-black/10 group-hover:bg-black/20"
            }`}>
              <Upload className={`w-4.5 h-4.5 ${isDark ? "text-white/50" : "text-black/50"}`} />
            </div>
            <span
              contentEditable
              suppressContentEditableWarning
              className="text-xl font-bold tracking-[0.2em] outline-none cursor-text"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)",
              }}
              onPaste={handlePastePlainText}
              onBlur={(e) =>
                onLogoTextChange(e.currentTarget.textContent || logoText)
              }
              onClick={(e) => e.stopPropagation()}
            >
              {logoText}
            </span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.svg"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
