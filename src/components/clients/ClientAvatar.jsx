import { cn } from "@/lib/utils";
import { Image } from "@/components/ui/image";

export default function ClientAvatar({ src, name, className }) {
  const initials = String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn("relative shrink-0 overflow-hidden rounded-full", className || "h-11 w-11")}
      style={{ background: "linear-gradient(145deg,#0A84FF,#BF5AF2)" }}
    >
      {src ? (
        <Image src={src} alt={name || "Channel"} fittingType="fill" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[13px] font-semibold text-white">{initials}</span>
      )}
    </div>
  );
}