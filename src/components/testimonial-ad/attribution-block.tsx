interface AttributionBlockProps {
  clientName: string;
  clientRole: string;
  onNameChange: (text: string) => void;
  onRoleChange: (text: string) => void;
}

export function AttributionBlock({
  clientName,
  clientRole,
  onNameChange,
  onRoleChange,
}: AttributionBlockProps) {
  return (
    <div className="flex flex-col gap-1">
      <span
        contentEditable
        suppressContentEditableWarning
        className="text-[22px] font-medium text-white/95 outline-none cursor-text"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        onBlur={(e) =>
          onNameChange(e.currentTarget.textContent || clientName)
        }
      >
        {clientName}
      </span>
      <span
        contentEditable
        suppressContentEditableWarning
        className="text-[18px] font-light outline-none cursor-text"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          color: "#94A3B8",
        }}
        onBlur={(e) =>
          onRoleChange(e.currentTarget.textContent || clientRole)
        }
      >
        {clientRole}
      </span>
    </div>
  );
}
