import { Tag } from "lucide-react";

export default function ClientTagPicker({ value, clients, onChange }) {
  return (
    <div
      className="relative inline-flex h-7 shrink-0 items-center rounded-full pl-2 pr-1"
      style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
    >
      <Tag className="h-3 w-3 shrink-0" strokeWidth={2} style={{ color: value ? "#64D2FF" : "var(--nav-fg)" }} />
      <select
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Tag this thread to a client"
        className="h-full cursor-pointer appearance-none bg-transparent pl-1.5 pr-5 text-[12.5px] outline-none"
        style={{ color: value ? "#64D2FF" : "inherit" }}
      >
        <option value="">No client</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>
    </div>
  );
}