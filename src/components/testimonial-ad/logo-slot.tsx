import { useFileUpload } from "@/hooks/use-file-upload";
import { Upload, X } from "lucide-react";

interface LogoSlotProps {
  logoText: string;
  logoImage: string | null;
  onLogoTextChange: (text: string) => void;
  onLogoImageChange: (dataUrl: string | null) => void;
}

export function LogoSlot({
  logoText,
  logoImage,
  onLogoTextChange,
  onLogoImageChange,
}: LogoSlotProps) {
  const { inputRef, triggerUpload, handleChange } =
    useFileUpload((url) => onLogoImageChange(url));

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
            />
            {/* Remove button */}
            <button
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onLogoImageChange(null);
              }}
              title="Remove logo image"
            >
              <X className="w-3 h-3 text-white/70" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <Upload className="w-4.5 h-4.5 text-white/50" />
            </div>
            <span
              contentEditable
              suppressContentEditableWarning
              className="text-xl font-bold tracking-[0.2em] text-white/90 outline-none cursor-text"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
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
