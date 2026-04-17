import { useRef } from "react";

export function useFileUpload(onFileSelected: (dataUrl: string) => void) {
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerUpload = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        onFileSelected(result);
      }
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-uploaded
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return { inputRef, triggerUpload, handleChange };
}
