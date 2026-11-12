import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";

const FONTS = [
  { id: "impact", label: "Impact", stack: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif" },
  { id: "sans", label: "Sans", stack: "system-ui, -apple-system, 'SF Pro Display', sans-serif" },
  { id: "serif", label: "Serif", stack: "Georgia, 'Times New Roman', serif" },
  { id: "mono", label: "Mono", stack: "'SF Mono', ui-monospace, Menlo, monospace" },
];

const COLORS = ["#FFFFFF", "#FFD60A", "#FF453A", "#0A84FF", "#30D158", "#000000"];

export default function OverlayEditor({ open, onOpenChange, imageUrl, onSave }) {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [text, setText] = useState("WATCH THIS");
  const [font, setFont] = useState("impact");
  const [size, setSize] = useState(13);
  const [color, setColor] = useState("#FFFFFF");
  const [pos, setPos] = useState({ x: 0.5, y: 0.82 });
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const source = imageUrl ? `/api/thumbnail-asset?url=${encodeURIComponent(imageUrl)}` : "";

  useEffect(() => {
    if (!open || !source) return undefined;
    let alive = true;
    setImage(null);
    setError("");
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (alive) setImage(img);
    };
    img.onerror = () => {
      if (alive) setError("Couldn't load that image for editing.");
    };
    img.src = source;
    return () => {
      alive = false;
    };
  }, [open, source]);

  const dims = useMemo(() => {
    if (!image) return { width: 1280, height: 720 };
    const naturalWidth = image.naturalWidth || 1280;
    const naturalHeight = image.naturalHeight || 720;
    const width = Math.min(naturalWidth, 2400);
    return { width, height: Math.round(width * (naturalHeight / naturalWidth)) };
  }, [image]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, dims.width, dims.height);
    ctx.drawImage(image, 0, 0, dims.width, dims.height);

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    const fontSizePx = Math.max(12, Math.round((size / 100) * dims.height));
    const lineHeight = fontSizePx * 1.08;
    const stack = FONTS.find((item) => item.id === font)?.stack || FONTS[0].stack;

    ctx.save();
    ctx.font = `900 ${fontSizePx}px ${stack}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;
    ctx.lineWidth = Math.max(2, fontSizePx * 0.09);
    ctx.strokeStyle = "rgba(0,0,0,0.85)";
    ctx.fillStyle = color;

    const centerX = pos.x * dims.width;
    const startY = pos.y * dims.height - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => {
      const y = startY + index * lineHeight;
      ctx.strokeText(line, centerX, y);
      ctx.fillText(line, centerX, y);
    });
    ctx.restore();
  }, [image, dims, text, size, color, font, pos]);

  const moveTo = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setPos({
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    });
  };

  const save = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(true);
    setError("");
    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      if (!blob) throw new Error("empty");
      const file = new File([blob], "thumbnail-overlay.jpg", { type: "image/jpeg" });
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      await onSave(file_url);
      onOpenChange(false);
    } catch {
      setError("Couldn't save the composite. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[92dvh] w-[calc(100vw-1.25rem)] max-w-[720px] overflow-y-auto border-0 p-4 sm:p-5"
        style={{ background: "var(--glass-strong)", backdropFilter: "blur(40px) saturate(180%)" }}
      >
        <DialogHeader>
          <DialogTitle className="text-[16px] font-semibold tracking-[-0.01em]">
            Add text overlay
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">
            Drag the text on the image to place it, then save the composite.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3">
          {image ? (
            <canvas
              ref={canvasRef}
              width={dims.width}
              height={dims.height}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                setDragging(true);
                moveTo(event);
              }}
              onPointerMove={(event) => {
                if (dragging) moveTo(event);
              }}
              onPointerUp={() => setDragging(false)}
              onPointerCancel={() => setDragging(false)}
              className="w-full cursor-move touch-none rounded-xl"
              style={{ border: "0.5px solid var(--glass-border)" }}
            />
          ) : (
            <div
              className="flex aspect-video w-full items-center justify-center rounded-xl"
              style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
            >
              {error ? (
                <span className="px-4 text-center text-[13px] text-muted-foreground">{error}</span>
              ) : (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <textarea
            rows={2}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Overlay text"
            className="w-full resize-none rounded-[10px] px-3 py-2 text-[14px] outline-none"
            style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
          />

          <div className="flex flex-wrap items-center gap-1.5">
            {FONTS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setFont(option.id)}
                className="rounded-[8px] px-2.5 py-1 text-[12.5px] font-medium"
                style={{
                  background: font === option.id ? "var(--nav-active)" : "var(--nav-hover)",
                  border: "0.5px solid var(--glass-border)",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-3 text-[12.5px] text-muted-foreground">
            <span className="w-[34px] shrink-0">Size</span>
            <input
              type="range"
              min={4}
              max={26}
              value={size}
              onChange={(event) => setSize(Number(event.target.value))}
              className="h-1 w-full accent-[#0A84FF]"
              aria-label="Text size"
            />
          </label>

          <div className="flex flex-wrap items-center gap-1.5">
            {COLORS.map((swatch) => (
              <button
                key={swatch}
                type="button"
                onClick={() => setColor(swatch)}
                aria-label={`Text colour ${swatch}`}
                className="h-6 w-6 rounded-full"
                style={{
                  background: swatch,
                  outline: color === swatch ? "2px solid #0A84FF" : "0.5px solid var(--glass-border)",
                  outlineOffset: color === swatch ? "1px" : "0",
                }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              aria-label="Custom text colour"
              className="h-6 w-8 cursor-pointer rounded-md border-0 bg-transparent p-0"
            />
          </div>

          {error && <p className="text-[12.5px]" style={{ color: "#FF453A" }}>{error}</p>}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-[10px] px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy || !image}
            className="inline-flex items-center gap-1.5 rounded-[10px] px-3.5 py-1.5 text-[13px] font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />}
            Save composite
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}