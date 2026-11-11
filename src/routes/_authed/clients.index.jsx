import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import PageHeader from "@/components/layout/PageHeader";
import ClientsToolbar from "@/components/clients/ClientsToolbar";
import ClientRow from "@/components/clients/ClientRow";
import ClientModal from "@/components/clients/ClientModal";
import { deleteClient, listClients } from "@/lib/server-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, UserRoundPlus } from "lucide-react";

export const Route = createFileRoute("/_authed/clients/")({
  validateSearch: (search) => ({
    q: typeof search.q === "string" && search.q ? search.q : undefined,
    plan: typeof search.plan === "string" && search.plan ? search.plan : undefined,
  }),
  loaderDeps: ({ search }) => ({ q: search.q, plan: search.plan }),
  loader: ({ deps }) => listClients({ data: { search: deps.q, plan: deps.plan } }),
  head: () => ({ meta: [{ title: "Clients · Agency Admin" }] }),
  component: ClientsPage,
});

function ClientsPage() {
  const { clients, stages } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const remove = useServerFn(deleteClient);

  const [query, setQuery] = useState(search.q ?? "");
  const [editMode, setEditMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pending, setPending] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if ((search.q ?? "") !== query) {
        navigate({ to: "/clients", search: { q: query || undefined, plan: search.plan }, replace: true });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, search.q, search.plan, navigate]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (client) => {
    setEditing(client);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!pending) return;
    setDeleting(true);
    try {
      await remove({ data: { id: pending.id } });
      await router.invalidate();
      setPending(null);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = Boolean(search.q || search.plan);

  return (
    <div className="space-y-4">
      <PageHeader title="Clients" subtitle="Accounts, plans and channel health" />

      <ClientsToolbar
        query={query}
        onQuery={setQuery}
        plan={search.plan || "ALL"}
        onPlan={(value) =>
          navigate({
            to: "/clients",
            search: { q: search.q, plan: value === "ALL" ? undefined : value },
            replace: true,
          })
        }
        editMode={editMode}
        onToggleEdit={() => setEditMode((value) => !value)}
        onAdd={openAdd}
      />

      {clients.length === 0 ? (
        <div className="glass animate-rise flex flex-col items-center justify-center rounded-2xl px-6 py-14 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px]" style={{ background: "var(--nav-active)" }}>
            <UserRoundPlus className="h-5 w-5" strokeWidth={1.6} style={{ color: "#64D2FF" }} />
          </div>
          <h2 className="text-[17px] font-semibold tracking-[-0.01em]">
            {filtered ? "No matching clients" : "No clients yet"}
          </h2>
          <p className="mt-1.5 max-w-sm text-[15px] text-muted-foreground">
            {filtered
              ? "Try a different search or plan filter."
              : "Add your first client, paste their channel and let AI build the profile."}
          </p>
          {!filtered && (
            <button
              type="button"
              onClick={openAdd}
              className="mt-5 inline-flex h-10 items-center rounded-[10px] px-4 text-[15px] font-medium text-white"
              style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
            >
              Add Client
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {clients.map((client) => (
            <ClientRow
              key={client.id}
              client={client}
              stage={stages[client.id]}
              editMode={editMode}
              onEdit={() => openEdit(client)}
              onDelete={() => setPending(client)}
            />
          ))}
        </div>
      )}

      <ClientModal open={modalOpen} onOpenChange={setModalOpen} client={editing} />

      <AlertDialog open={Boolean(pending)} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent className="glass-strong rounded-[20px] border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-semibold tracking-[-0.02em]">
              Delete {pending?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-muted-foreground">
              This removes the client along with their pipeline, team and payment records. It cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[10px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="rounded-[10px] bg-[#FF453A] text-white hover:bg-[#FF453A]/90"
            >
              {deleting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Delete client
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}