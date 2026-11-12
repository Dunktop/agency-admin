import { Check, ChevronDown, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ThumbnailClientPicker({ value, clients, onChange }) {
  const active = clients.find((client) => client.id === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 max-w-[170px] items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium transition-colors hover:bg-[var(--nav-hover)] sm:max-w-[210px]"
          style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
          aria-label="Client tagged on this session"
        >
          <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.9} />
          <span className="truncate">{active?.name || "Pick a client"}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={2} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[320px] w-[240px] overflow-y-auto">
        <DropdownMenuLabel className="text-[12px] font-normal text-muted-foreground">
          Tag generations to
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {clients.length === 0 ? (
          <DropdownMenuItem disabled>No clients yet</DropdownMenuItem>
        ) : (
          clients.map((client) => (
            <DropdownMenuItem
              key={client.id}
              onSelect={() => onChange(client.id)}
              className="gap-2 text-[13px]"
            >
              <span className="min-w-0 flex-1 truncate">{client.name}</span>
              {client.id === value && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}