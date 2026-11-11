import { Link } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { formatMoney, stripProtocol } from "@/lib/clients";
import ClientAvatar from "./ClientAvatar";
import { PlanBadge, StagePill } from "./Badges";

export default function ClientRow({ client, stage, editMode, onEdit, onDelete }) {
  const churned = client.status === "CHURNED";

  return (
    <div className="glass animate-rise flex flex-col gap-3 rounded-2xl px-4 py-3.5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <ClientAvatar src={client.channelThumbnail} name={client.name} />
        <div className="min-w-0">
          <Link
            to="/clients/$clientId"
            params={{ clientId: client.id }}
            className="block truncate text-[15px] font-medium underline-offset-4 hover:underline"
            style={{ opacity: churned ? 0.6 : 1 }}
          >
            {client.name}
          </Link>
          <p className="truncate text-[13px] text-muted-foreground">
            {client.channelUrl ? stripProtocol(client.channelUrl) : "No channel linked"}
            {churned && <span className="ml-2 text-[11px] uppercase tracking-wide">Churned</span>}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-end">
        <PlanBadge planType={client.planType} customPlanLabel={client.customPlanLabel} />
        <StagePill stage={stage} />

        <div className="ml-auto w-[86px] shrink-0 text-right sm:ml-0">
          <p className="text-[15px] font-medium tabular-nums">{formatMoney(client.monthlyFee)}</p>
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">per month</p>
        </div>

        {editMode && (
          <div className="flex items-center gap-1">
            <button type="button" onClick={onEdit} className="icon-btn h-8 w-8" aria-label={`Edit ${client.name}`}>
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="icon-btn h-8 w-8 hover:text-[#FF453A]"
              aria-label={`Delete ${client.name}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}