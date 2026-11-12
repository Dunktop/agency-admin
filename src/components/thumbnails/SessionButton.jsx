import { formatDistanceToNow } from "date-fns";

export default function SessionButton({ session, active, onSelect }) {
  const stamp = session.createdAt ? new Date(session.createdAt) : null;

  return (
    <button
      type="button"
      onClick={() => onSelect(session.id)}
      data-active={active ? "true" : "false"}
      className="nav-item w-full rounded-[10px] px-2.5 py-2 text-left"
    >
      <p className="truncate text-[13px] font-medium leading-snug">{session.title}</p>
      {stamp && (
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          {formatDistanceToNow(stamp, { addSuffix: true })}
        </p>
      )}
    </button>
  );
}