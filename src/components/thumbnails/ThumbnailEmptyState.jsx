import { Frame } from "lucide-react";

export default function ThumbnailEmptyState() {
  return (
    <div className="px-2 text-center">
      <div
        className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl"
        style={{ background: "linear-gradient(145deg,#0A84FF,#BF5AF2)" }}
      >
        <Frame className="h-[19px] w-[19px] text-white" strokeWidth={2} />
      </div>
      <h2 className="text-[22px] font-semibold tracking-[-0.02em]">What are we thumbnailing?</h2>
      <p className="mx-auto mt-2 max-w-[360px] text-[14px] leading-relaxed text-muted-foreground">
        Describe a topic or paste a video, and I&apos;ll explain the direction I&apos;m taking, then render
        it 16:9 in 4K.
      </p>
    </div>
  );
}