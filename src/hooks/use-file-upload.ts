import { useCallback, useRef } from "react";

export function useFileUpload(onFileSelected: (dataUrl: string) => void) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Keep a stable ref to the latest callback to avoid stale closures
  const callbackRef = useRef(onFileSelected);
  callbackRef.current = onFileSelected;

  const triggerUpload = useCallback(() => {
    // Reset value BEFORE opening file picker so the same file can be re-selected
    // and onChange always fires
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        callbackRef.current(result);
      }
    };
    reader.readAsDataURL(file);

    // Also reset after reading to ensure next upload always triggers onChange
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  return { inputRef, triggerUpload, handleChange };
}
