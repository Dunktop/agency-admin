import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { updateClient } from "@/lib/server-fns";
import { Loader2 } from "lucide-react";
import SectionCard from "./SectionCard";

export default function NotesCard({ client }) {
  const [value, setValue] = useState(client.notes || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const update = useServerFn(updateClient);
  const router = useRouter();

  useEffect(() => {
    setValue(client.notes || "");
  }, [client.id, client.notes]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await update({ data: { id: client.id, notes: value } });
      await router.invalidate();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard
      title="Notes"
      delay={300}
      action={
        <div className="flex items-center gap-2">
          {saved && <span className="text-[13px] text-muted-foreground">Saved</span>}
          <button
            type="button"
            onClick={save}
            disabled={saving || value === (client.notes || "")}
            className="inline-flex h-8 items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-medium text-white disabled:opacity-40"
            style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save
          </button>
        </div>
      }
    >
      <textarea
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setSaved(false);
        }}
        placeholder="Context, preferences, access details, anything the team should know."
        className="min-h-[110px] w-full resize-y rounded-[10px] bg-transparent px-3 py-2.5 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground"
        style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
      />
    </SectionCard>
  );
}