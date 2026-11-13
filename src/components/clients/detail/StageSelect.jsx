import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { STAGES } from "@/lib/clients";
import { setClientStage } from "@/lib/server-fns";

export default function StageSelect({ clientId, stage }) {
  const router = useRouter();
  const save = useServerFn(setClientStage);
  const [busy, setBusy] = useState(false);

  const change = async (event) => {
    const value = event.target.value;
    if (!value || value === stage) return;
    setBusy(true);
    try {
      await save({ data: { clientId, stage: value } });
      await router.invalidate();
    } catch (error) {
      toast.error(error?.message || "Could not update the stage.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <select
      value={stage || ""}
      onChange={change}
      disabled={busy}
      className="h-8 rounded-[9px] bg-transparent px-2 text-[13px] text-foreground outline-none transition-opacity disabled:opacity-50"
      style={{ border: "0.5px solid var(--glass-border)" }}
    >
      <option value="">Set stage…</option>
      {STAGES.map((item) => (
        <option key={item.key} value={item.key}>
          {item.label}
        </option>
      ))}
    </select>
  );
}