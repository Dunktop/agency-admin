import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AnalyticsToolbar({ clients, value, onChange }) {
  return (
    <div className="w-full sm:w-[240px]">
      <Select value={value || "ALL"} onValueChange={(next) => onChange(next === "ALL" ? "" : next)}>
        <SelectTrigger
          aria-label="Choose a client"
          className="h-9 rounded-[10px] text-[13px]"
          style={{ background: "var(--nav-hover)", borderColor: "var(--glass-border)" }}
        >
          <SelectValue placeholder="All clients" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All clients</SelectItem>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}