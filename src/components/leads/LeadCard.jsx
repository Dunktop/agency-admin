import { Pencil, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/clients";
import { LEAD_STATUSES, LEAD_STATUS_BY_VALUE } from "@/lib/leads";

export default function LeadCard({ lead, busy, onStatus, onEdit, onDelete }) {
  const status = LEAD_STATUS_BY_VALUE[lead.status] || LEAD_STATUSES[0];

  return (
    <li className="glass animate-rise rounded-2xl p-4" style={{ animationDelay: "60ms" }}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium">{lead.name}</p>
          {lead.channelUrl ? (
            <a
              href={lead.channelUrl.startsWith("http") ? lead.channelUrl : `https://${lead.channelUrl}`}
              target="_blank"
              rel="noreferrer"
              className="text-[12px] text-muted-foreground underline-offset-2 hover:underline"
            >
              {lead.channelUrl}
            </a>
          ) : (
            <p className="text-[12px] text-muted-foreground">No channel link</p>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className="rounded-full px-2.5 py-[3px] text-[11.5px] font-medium"
            style={{ background: `${status.color}1f`, color: status.color }}
          >
            {status.label}
          </span>
          <button type="button" onClick={onEdit} className="icon-btn h-7 w-7" aria-label={`Edit ${lead.name}`}>
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.9} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="icon-btn h-7 w-7"
            aria-label={`Delete ${lead.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
          </button>
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <div className="rounded-[10px] px-2.5 py-1.5" style={{ background: "var(--nav-hover)" }}>
          <p className="text-[10.5px] uppercase tracking-[0.07em] text-muted-foreground">Upfront</p>
          <p className="text-[13.5px] font-semibold tabular-nums">{formatMoney(lead.upfrontCash)}</p>
        </div>
        <div className="rounded-[10px] px-2.5 py-1.5" style={{ background: "var(--nav-hover)" }}>
          <p className="text-[10.5px] uppercase tracking-[0.07em] text-muted-foreground">Monthly</p>
          <p className="text-[13.5px] font-semibold tabular-nums">{formatMoney(lead.monthlyRecurring)}</p>
        </div>
      </div>

      {lead.notes && <p className="mt-2 line-clamp-3 text-[12.5px] leading-relaxed text-muted-foreground">{lead.notes}</p>}

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {LEAD_STATUSES.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={busy || lead.status === option.value}
            onClick={() => onStatus(option.value)}
            className="h-7 rounded-full px-2.5 text-[11.5px] font-medium transition-opacity disabled:opacity-40"
            style={{
              background: lead.status === option.value ? `${option.color}26` : "var(--nav-hover)",
              color: lead.status === option.value ? option.color : "var(--nav-fg)",
              border: `0.5px solid ${lead.status === option.value ? `${option.color}66` : "var(--glass-border)"}`,
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </li>
  );
}