import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import GlassStat from "@/components/layout/GlassStat";
import LeadCard from "@/components/leads/LeadCard";
import LeadFormDialog from "@/components/leads/LeadFormDialog";
import { createLead, deleteLead, getLeads, updateLead } from "@/lib/leads-fns";
import { LEAD_STATUSES } from "@/lib/leads";
import { formatMoney } from "@/lib/clients";

export const Route = createFileRoute("/_authed/leads")({
  ssr: false,
  loader: () => getLeads(),
  head: () => ({ meta: [{ title: "Leads · Agency Admin" }] }),
  component: LeadsPage,
});

const ORDER = Object.fromEntries(LEAD_STATUSES.map((status, index) => [status.value, index]));

function LeadsPage() {
  const { leads, totals } = Route.useLoaderData();
  const router = useRouter();
  const create = useServerFn(createLead);
  const update = useServerFn(updateLead);
  const remove = useServerFn(deleteLead);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const sorted = [...leads].sort(
    (a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9) || a.name.localeCompare(b.name)
  );

  const submit = async (values) => {
    if (editing) await update({ data: { id: editing.id, ...values } });
    else await create({ data: values });
    await router.invalidate();
  };

  const setStatus = async (lead, status) => {
    setBusyId(lead.id);
    try {
      await update({ data: { id: lead.id, status } });
      await router.invalidate();
    } finally {
      setBusyId(null);
    }
  };

  const removeLead = async (lead) => {
    setBusyId(lead.id);
    try {
      await remove({ data: { id: lead.id } });
      await router.invalidate();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leads"
        subtitle="Prospects worth closing"
        action={
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3.5 text-[13px] font-medium text-white"
            style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} />
            New lead
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <GlassStat
          label="Open upfront"
          value={formatMoney(totals.openUpfront)}
          hint={`${totals.openCount} open ${totals.openCount === 1 ? "lead" : "leads"}`}
          delay={0}
        />
        <GlassStat
          label="Open monthly"
          value={formatMoney(totals.openMonthly)}
          hint="Becomes MRR on close"
          delay={60}
        />
        <GlassStat
          label="Won upfront"
          value={formatMoney(totals.wonUpfront)}
          hint={`${totals.wonCount} closed ${totals.wonCount === 1 ? "deal" : "deals"}`}
          tone={totals.wonUpfront > 0 ? "#30D158" : undefined}
          delay={120}
        />
        <GlassStat
          label="Won monthly"
          value={formatMoney(totals.wonMonthly)}
          hint="Recurring from closed deals"
          tone={totals.wonMonthly > 0 ? "#30D158" : undefined}
          delay={180}
        />
      </div>

      {sorted.length === 0 ? (
        <p className="glass animate-rise rounded-2xl px-5 py-6 text-[14.5px] leading-relaxed text-muted-foreground">
          No leads yet. Log the first channel you want to close.
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              busy={busyId === lead.id}
              onStatus={(status) => setStatus(lead, status)}
              onEdit={() => {
                setEditing(lead);
                setDialogOpen(true);
              }}
              onDelete={() => removeLead(lead)}
            />
          ))}
        </ul>
      )}

      <LeadFormDialog
        open={dialogOpen}
        lead={editing}
        onOpenChange={setDialogOpen}
        onSubmit={submit}
      />
    </div>
  );
}