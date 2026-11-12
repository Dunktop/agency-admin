export default function UserBubble({ text }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[86%] whitespace-pre-wrap break-words rounded-[18px] px-4 py-2.5 text-[15px] leading-[1.55] text-white"
        style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
      >
        {text}
      </div>
    </div>
  );
}