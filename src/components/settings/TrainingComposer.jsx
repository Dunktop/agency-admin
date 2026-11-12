import { useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";

export default function TrainingComposer({ value, onChange, onSend, sending, placeholder }) {
  const areaRef = useRef(null);

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    area.style.height = "auto";
    area.style.height = `${Math.min(area.scrollHeight, 220)}px`;
  }, [value]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  const disabled = sending || !value.trim();
  const count = value.length;

  return (
    <div>
      <div className="glass flex items-end gap-2 rounded-[20px] py-1.5 pl-4 pr-1.5">
        <textarea
          ref={areaRef}
          rows={2}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Training material"
          className="max-h-[220px] w-full resize-none bg-transparent py-2 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={disabled}
          aria-label="Send training"
          className="mb-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-30"
          style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
        >
          <ArrowUp className="h-[17px] w-[17px]" strokeWidth={2.4} />
        </button>
      </div>
      <p className="mt-2 text-center text-[11.5px] text-muted-foreground">
        {count > 4000 ? `${count.toLocaleString("en-GB")} characters · ` : ""}Enter to send · Shift + Enter for a new line
      </p>
    </div>
  );
}