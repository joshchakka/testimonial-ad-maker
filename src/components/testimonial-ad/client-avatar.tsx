import { useFileUpload } from "@/hooks/use-file-upload";
import { User, X } from "lucide-react";
import type { AccentTheme } from "./types";

interface ClientAvatarProps {
  avatarImage: string | null;
  accentTheme: AccentTheme;
  onAvatarImageChange: (dataUrl: string | null) => void;
  size?: number;
}

export function ClientAvatar({
  avatarImage,
  accentTheme,
  onAvatarImageChange,
  size = 56,
}: ClientAvatarProps) {
  const { inputRef, triggerUpload, handleChange } =
    useFileUpload((url) => onAvatarImageChange(url));

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
          background: avatarImage ? "transparent" : "rgba(255,255,255,0.05)",
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
            className="text-white/30 group-hover:text-white/50 transition-colors"
            style={{ width: size * 0.45, height: size * 0.45 }}
          />
        )}
      </div>
      {avatarImage && (
        <button
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={(e) => {
            e.stopPropagation();
            onAvatarImageChange(null);
          }}
          title="Remove avatar"
        >
          <X className="w-3 h-3 text-white/70" />
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
