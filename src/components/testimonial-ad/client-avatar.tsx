import { useFileUpload } from "@/hooks/use-file-upload";
import { User, X } from "lucide-react";
import type { AccentTheme, BackgroundMode } from "./types";

interface ClientAvatarProps {
  avatarImage: string | null;
  accentTheme: AccentTheme;
  onAvatarImageChange: (dataUrl: string | null) => void;
  size?: number;
  backgroundMode?: BackgroundMode;
}

export function ClientAvatar({
  avatarImage,
  accentTheme,
  onAvatarImageChange,
  size = 56,
  backgroundMode = "dark",
}: ClientAvatarProps) {
  const { inputRef, triggerUpload, handleChange } =
    useFileUpload((url) => onAvatarImageChange(url));

  const isDark = backgroundMode === "dark";

  return (
    <div
      className="relative cursor-pointer group flex-shrink-0"
      onClick={triggerUpload}
      title="Click to upload avatar"
    >
      <div
        className="rounded-full overflow-hidden flex items-center justify-center transition-all"
        style={{
          width: size,
          height: size,
          boxShadow: `0 0 0 2px ${accentTheme.color}, 0 0 20px ${accentTheme.glowColor}`,
          background: avatarImage
            ? "transparent"
            : isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(0,0,0,0.05)",
        }}
      >
        {avatarImage ? (
          <img
            src={avatarImage}
            alt="Client avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <User
            className={`transition-colors ${
              isDark
                ? "text-white/30 group-hover:text-white/50"
                : "text-black/30 group-hover:text-black/50"
            }`}
            style={{ width: size * 0.45, height: size * 0.45 }}
          />
        )}
      </div>
      {avatarImage && (
        <button
          className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 ${
            isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/10 hover:bg-black/20"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onAvatarImageChange(null);
          }}
          title="Remove avatar"
        >
          <X className={`w-3 h-3 ${isDark ? "text-white/70" : "text-black/70"}`} />
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
