import { Link } from "@tanstack/react-router";
import { Image } from "@/components/ui/image";
import { PLAN_LABELS, STAGE_BY_KEY } from "@/lib/clients";

export default function ClientStageCard({ client, delay = 0 }) {
  const stage = client.stage ? STAGE_BY_KEY[client.stage] : null;
  const color = stage?.color || "#8E8E93";

  return (
    <li className="animate-rise" style={{ animationDelay: `${delay}ms` }}>
      <Link
        to="/clients/$clientId"
        params={{ clientId: client.id }}
        className="glass flex h-full flex-col gap-3 rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-2.5">
          <span
            className="h-8 w-8 shrink-0 overflow-hidden rounded-full"
            style={{ background: "var(--nav-hover)" }}
          >
            {client.channelThumbnail && (
              <Image src={client.channelThumbnail} alt="" className="h-full w-full" fittingType="fill" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14.5px] font-medium leading-tight">{client.name}</p>
            <p className="text-[11.5px] text-muted-foreground">{PLAN_LABELS[client.planType] || "Team only"}</p>
          </div>
        </div>

        <span
          className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[12px] font-medium"
          style={{ background: `${color}1f`, color }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          {stage?.label || "No update yet"}
        </span>
      </Link>
    </li>
  );
}