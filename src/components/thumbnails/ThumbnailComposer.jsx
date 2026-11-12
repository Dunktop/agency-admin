import { useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";

export default function ThumbnailComposer({ value, onChange, onSend, sending, noClient, autoFocus }) {
  const areaRef = useRef(null);

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    area.style.height = "auto";
    area.style.height = `${Math.min(area.scrollHeight, 200)}px`;
  }, [value]);

  useEffect(() => {
    if (autoFocus) areaRef.current?.focus();
  }, [autoFocus]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  const disabled = sending || noClient || !value.trim();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="glass flex items-end gap-2 rounded-[20px] py-1.5 pl-4 pr-1.5">
        <textarea
          ref={areaRef}
          rows={1}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe a thumbnail or paste a video topic..."
          aria-label="Describe a thumbnail"
          className="max-h-[200px] w-full resize-none bg-transparent py-2 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={disabled}
          aria-label="Send message"
          className="mb-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-30"
          style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
        >
          <ArrowUp className="h-[17px] w-[17px]" strokeWidth={2.4} />
        </button>
      </div>
      <p className="mt-2 text-center text-[11.5px] text-muted-foreground">
        {noClient
          ? "Pick a client above so this generation is tagged"
          : "Enter to send · Shift + Enter for a new line"}
      </p>
    </div>
  );
}