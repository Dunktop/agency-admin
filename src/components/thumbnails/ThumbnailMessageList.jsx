import ThumbnailBubble from "./ThumbnailBubble";
import UserBubble from "./UserBubble";

export default function ThumbnailMessageList({
  messages,
  pending,
  busyId,
  busyKind,
  configured,
  onRegenerate,
  onVariations,
  onOverlay,
  onRate,
}) {
  const visible = messages.filter((message) => !message.variantOf);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-1 pb-6 pt-2">
      {visible.map((message) => (
        <ThumbnailBubble
          key={message.id}
          message={message}
          variants={messages.filter((item) => item.variantOf === message.id)}
          busyKind={busyId === message.id ? busyKind : ""}
          configured={configured}
          onRegenerate={onRegenerate}
          onVariations={onVariations}
          onOverlay={onOverlay}
          onRate={onRate}
        />
      ))}
      {pending && <UserBubble text={pending} />}
    </div>
  );
}