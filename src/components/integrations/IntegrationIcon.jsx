import { Sparkles, Image as ImageGlyph, Youtube, MessagesSquare, FileText } from "lucide-react";

const ICONS = {
  ai: Sparkles,
  higgsfield: ImageGlyph,
  youtube: Youtube,
  discord: MessagesSquare,
  notion: FileText,
};

const TINTS = {
  ai: { color: "#BF5AF2", background: "rgba(191,90,242,0.16)" },
  higgsfield: { color: "#0A84FF", background: "rgba(10,132,255,0.16)" },
  youtube: { color: "#FF453A", background: "rgba(255,69,58,0.14)" },
  discord: { color: "#5E5CE6", background: "rgba(94,92,230,0.18)" },
  notion: { color: "#d4d4d8", background: "rgba(120,120,128,0.2)" },
};

export default function IntegrationIcon({ id, className = "h-4 w-4" }) {
  const Icon = ICONS[id] || Sparkles;
  return (
    <span
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
      style={TINTS[id] || TINTS.ai}
    >
      <Icon className={className} strokeWidth={1.9} />
    </span>
  );
}