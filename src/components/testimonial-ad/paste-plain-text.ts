import type { ClipboardEvent } from "react";

/**
 * Paste handler for contentEditable elements that strips all formatting
 * and inserts only plain text, preserving the element's own styling.
 */
export function handlePastePlainText(e: ClipboardEvent<HTMLElement>) {
  e.preventDefault();
  const text = e.clipboardData.getData("text/plain");
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  range.deleteContents();
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);

  // Move cursor to end of inserted text
  range.setStartAfter(textNode);
  range.setEndAfter(textNode);
  selection.removeAllRanges();
  selection.addRange(range);
}
