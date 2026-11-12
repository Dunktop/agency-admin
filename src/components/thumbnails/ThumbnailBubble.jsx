import { Sparkles } from "lucide-react";
import ThumbnailImageCard from "./ThumbnailImageCard";
import UserBubble from "./UserBubble";

export default function ThumbnailBubble({
  message,
  variants,
  busyKind,
  configured,
  onRegenerate,
  onVariations,
  onOverlay,
  onRate,
}) {
  if (message.role === "user") return <UserBubble text={message.content} />;

  return (
    <div className="flex gap-3">
      <div
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
        style={{ background: "linear-gradient(145deg,#0A84FF,#BF5AF2)" }}
      >
        <Sparkles className="h-3 w-3 text-white" strokeWidth={2.2} />
      </div>
      <div className="min-w-0 flex-1 space-y-2.5">
        <p className="whitespace-pre-wrap text-[15px] leading-[1.6]">{message.content}</p>
        <ThumbnailImageCard
          message={message}
          variants={variants}
          busyKind={busyKind}
          configured={configured}
          onRegenerate={onRegenerate}
          onVariations={onVariations}
          onOverlay={onOverlay}
          onRate={onRate}
        />
      </div>
    </div>
  );
}