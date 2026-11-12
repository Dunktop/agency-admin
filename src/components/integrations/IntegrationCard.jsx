import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Loader2, PlugZap, Unplug } from "lucide-react";
import { toast } from "sonner";
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
import { catalogById } from "./integration-catalog";
import { statusMeta, timeAgo } from "./status";
import IntegrationIcon from "./IntegrationIcon";
import { disconnectIntegration, testIntegration } from "@/lib/integrations-fns";

export default function IntegrationCard({ integration, canManage, onOpenGuide, onChanged }) {
  const test = useServerFn(testIntegration);
  const disconnect = useServerFn(disconnectIntegration);
  const guide = catalogById[integration.id];
  const meta = statusMeta(integration.status);

  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const runTest = async () => {
    setBusy(true);
    try {
      const response = await test({ data: { id: integration.id, fields: {} } });
      if (response.ok) toast.success(response.message);
      else toast.error(response.message);
      await onChanged?.();
    } catch (error) {
      toast.error(error?.message || "That integration couldn't be reached.");
    } finally {
      setBusy(false);
    }
  };

  const runDisconnect = async () => {
    setConfirming(false);
    setBusy(true);
    try {
      await disconnect({ data: { id: integration.id } });
      toast.success(`${guide.name} disconnected.`);
      await onChanged?.();
    } catch (error) {
      toast.error(error?.message || "Couldn't disconnect that integration.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass animate-rise flex flex-col rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <IntegrationIcon id={integration.id} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[15px] font-semibold leading-snug tracking-[-0.01em]">{guide.name}</h3>
            <span
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ color: meta.color, background: meta.background }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
              {meta.label}
            </span>
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{guide.blurb}</p>
        </div>
      </div>

      <p className="mt-3 text-[11.5px] text-muted-foreground">
        {timeAgo(integration.testedAt)}
        {integration.builtIn && integration.status === "CONNECTED" ? " · included with your app" : ""}
      </p>

      {integration.status === "ERROR" && integration.error && (
        <p className="mt-2 rounded-[8px] px-2 py-1.5 text-[11.5px] leading-relaxed" style={{ color: "#FF453A", background: "rgba(255,69,58,0.1)" }}>
          {integration.error}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
        <button
          type="button"
          onClick={() => onOpenGuide(integration.id)}
          className="inline-flex h-8 items-center gap-1.5 rounded-[9px] px-2.5 text-[12.5px] font-medium"
          style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Setup guide
        </button>

        {canManage && (
          <button
            type="button"
            onClick={runTest}
            disabled={busy}
            className="inline-flex h-8 items-center gap-1.5 rounded-[9px] px-2.5 text-[12.5px] font-medium disabled:opacity-50"
            style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlugZap className="h-3.5 w-3.5" />}
            Test
          </button>
        )}

        {canManage && integration.status !== "NOT_CONFIGURED" && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={busy}
            className="inline-flex h-8 items-center gap-1.5 rounded-[9px] px-2.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
          >
            <Unplug className="h-3.5 w-3.5" />
            {integration.builtIn ? "Reset" : "Disconnect"}
          </button>
        )}
      </div>

      {!canManage && (
        <p className="pt-3 text-[11.5px] text-muted-foreground">Only an admin can change integrations.</p>
      )}

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent className="glass-strong border-0">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {integration.builtIn ? `Reset ${guide.name}?` : `Disconnect ${guide.name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {integration.builtIn
                ? "The AI keeps working — this only clears the verified status, so the setup banner comes back until you test it again."
                : `The stored credentials are deleted and ${
                    integration.id === "higgsfield" ? "thumbnail images stop rendering" : `the ${guide.name} features stop working`
                  } until you set it up again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep connected</AlertDialogCancel>
            <AlertDialogAction onClick={runDisconnect} style={{ background: "#FF453A", color: "#fff" }}>
              {integration.builtIn ? "Reset" : "Disconnect"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}