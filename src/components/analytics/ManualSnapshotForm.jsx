import { useState } from "react";
import { Loader2 } from "lucide-react";
import SectionCard from "@/components/clients/detail/SectionCard";

const INPUT_STYLE = { background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" };
const FIELDS = [
  { key: "subscribers", label: "Subscribers", placeholder: "12800" },
  { key: "views", label: "Total views", placeholder: "1450000" },
  { key: "watchHours", label: "Watch hours", placeholder: "9800" },
  { key: "impressionsCTR", label: "CTR %", placeholder: "6.4" },
];

export default function ManualSnapshotForm({ onSave }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [values, setValues] = useState({ subscribers: "", views: "", watchHours: "", impressionsCTR: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const payload = { date };
      FIELDS.forEach((field) => {
        const raw = values[field.key].trim();
        if (raw === "") return;
        const parsed = Number(raw);
        if (Number.isNaN(parsed) || parsed < 0) throw new Error(`${field.label} needs a number.`);
        payload[field.key] = parsed;
      });
      await onSave(payload);
      setValues({ subscribers: "", views: "", watchHours: "", impressionsCTR: "" });
      setSaved(true);
    } catch (requestError) {
      setError(requestError?.message || "That snapshot couldn't be saved.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SectionCard title="Add numbers by hand" delay={300}>
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        Watch time and CTR only exist in YouTube Studio, so record them here. Saving on a date that already has a
        snapshot updates it, which is how a trend builds.
      </p>

      <form onSubmit={submit} className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <label className="block">
          <span className="mb-1 block text-[11.5px] text-muted-foreground">Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-9 w-full rounded-[10px] px-3 text-[13px] tabular-nums outline-none focus:ring-2 focus:ring-ring"
            style={INPUT_STYLE}
          />
        </label>
        {FIELDS.map((field) => (
          <label key={field.key} className="block">
            <span className="mb-1 block text-[11.5px] text-muted-foreground">{field.label}</span>
            <input
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={values[field.key]}
              onChange={(event) => setValues((previous) => ({ ...previous, [field.key]: event.target.value }))}
              placeholder={field.placeholder}
              className="h-9 w-full rounded-[10px] px-3 text-[13px] tabular-nums outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              style={INPUT_STYLE}
            />
          </label>
        ))}
        <div className="flex items-end">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[10px] px-4 text-[13px] font-medium text-white transition-opacity disabled:opacity-40"
            style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>

      {error && <p className="mt-2 text-[12.5px] text-destructive">{error}</p>}
      {saved && !error && <p className="mt-2 text-[12.5px] text-muted-foreground">Snapshot saved.</p>}
    </SectionCard>
  );
}