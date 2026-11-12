import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LEAD_STATUSES } from "@/lib/leads";

const INPUT_STYLE = { background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" };
const EMPTY = { name: "", channelUrl: "", status: "TO_CONTACT", upfrontCash: "", monthlyRecurring: "", notes: "" };

export default function LeadFormDialog({ open, lead, onOpenChange, onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      lead
        ? {
            name: lead.name,
            channelUrl: lead.channelUrl,
            status: lead.status,
            upfrontCash: lead.upfrontCash ? String(lead.upfrontCash) : "",
            monthlyRecurring: lead.monthlyRecurring ? String(lead.monthlyRecurring) : "",
            notes: lead.notes,
          }
        : EMPTY
    );
  }, [open, lead]);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!form.name.trim()) {
      setError("Give the lead a name.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSubmit({
        name: form.name.trim(),
        channelUrl: form.channelUrl.trim(),
        status: form.status,
        upfrontCash: form.upfrontCash === "" ? 0 : Number(form.upfrontCash),
        monthlyRecurring: form.monthlyRecurring === "" ? 0 : Number(form.monthlyRecurring),
        notes: form.notes.trim(),
      });
      onOpenChange(false);
    } catch (requestError) {
      setError(requestError?.message || "That lead couldn't be saved.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{lead ? "Edit lead" : "New lead"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-2.5">
          <input
            value={form.name}
            onChange={set("name")}
            placeholder="Channel or contact name"
            aria-label="Lead name"
            className="h-9 w-full rounded-[10px] px-3 text-[13.5px] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            style={INPUT_STYLE}
          />
          <input
            value={form.channelUrl}
            onChange={set("channelUrl")}
            placeholder="Channel URL (optional)"
            aria-label="Channel URL"
            className="h-9 w-full rounded-[10px] px-3 text-[13px] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            style={INPUT_STYLE}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              step="any"
              value={form.upfrontCash}
              onChange={set("upfrontCash")}
              placeholder="Upfront cash"
              aria-label="Upfront cash"
              className="h-9 min-w-0 rounded-[10px] px-3 text-[13px] tabular-nums outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              style={INPUT_STYLE}
            />
            <input
              type="number"
              min="0"
              step="any"
              value={form.monthlyRecurring}
              onChange={set("monthlyRecurring")}
              placeholder="Monthly recurring"
              aria-label="Monthly recurring revenue"
              className="h-9 min-w-0 rounded-[10px] px-3 text-[13px] tabular-nums outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              style={INPUT_STYLE}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {LEAD_STATUSES.map((status) => (
              <button
                key={status.value}
                type="button"
                onClick={() => setForm((current) => ({ ...current, status: status.value }))}
                className="h-8 rounded-[9px] text-[12.5px] font-medium transition-opacity"
                style={{
                  background: form.status === status.value ? `${status.color}26` : "var(--nav-hover)",
                  color: form.status === status.value ? status.color : "var(--nav-fg)",
                  border: `0.5px solid ${form.status === status.value ? `${status.color}66` : "var(--glass-border)"}`,
                  gridColumn: status.value === "LOST" ? "span 2" : undefined,
                }}
              >
                {status.label}
              </button>
            ))}
          </div>
          <textarea
            rows={3}
            value={form.notes}
            onChange={set("notes")}
            placeholder="Notes — what they sell, what they need, when to follow up"
            aria-label="Notes"
            className="w-full resize-none rounded-[10px] px-3 py-2 text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            style={INPUT_STYLE}
          />

          {error && <p className="text-[12.5px] text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-9 rounded-[10px] px-3 text-[13px] font-medium text-muted-foreground"
              style={INPUT_STYLE}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="h-9 rounded-[10px] px-4 text-[13px] font-medium text-white transition-opacity disabled:opacity-40"
              style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
            >
              {busy ? "Saving…" : "Save lead"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}