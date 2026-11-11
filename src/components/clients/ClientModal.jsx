import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { analyzeClientChannel, createClient, updateClient } from "@/lib/server-fns";
import { PLAN_OPTIONS } from "@/lib/clients";
import AiUnavailable from "@/components/ai/AiUnavailable";
import MonthlyFeeStepper from "./MonthlyFeeStepper";
import { Loader2, Sparkles } from "lucide-react";

const EMPTY = {
  name: "",
  channelUrl: "",
  channelThumbnail: "",
  channelSummary: "",
  contentStyle: "",
  offers: "",
  contentStrategy: "",
  growthOpportunities: "",
  strategyItems: "",
  latestUploads: "",
  analysisDate: "",
  planType: "TEAM_ONLY",
  customPlanLabel: "",
  monthlyFee: "",
};

const fromClient = (client) => ({
  name: client.name || "",
  channelUrl: client.channelUrl || "",
  channelThumbnail: client.channelThumbnail || "",
  channelSummary: client.channelSummary || "",
  contentStyle: client.contentStyle || "",
  offers: client.offers || "",
  contentStrategy: client.contentStrategy || "",
  growthOpportunities: client.growthOpportunities || "",
  strategyItems: client.strategyItems || "",
  latestUploads: client.latestUploads || "",
  analysisDate: client.analysisDate || "",
  planType: client.planType || "TEAM_ONLY",
  customPlanLabel: client.customPlanLabel || "",
  monthlyFee: client.monthlyFee === null || client.monthlyFee === undefined ? "" : String(client.monthlyFee),
});

export default function ClientModal({ open, onOpenChange, client, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [error, setError] = useState("");

  const analyze = useServerFn(analyzeClientChannel);
  const create = useServerFn(createClient);
  const update = useServerFn(updateClient);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    setForm(client ? fromClient(client) : EMPTY);
    setAnalyzing(false);
    setSaving(false);
    setAiError(false);
    setError("");
  }, [open, client]);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const hasAnalysis = Boolean(form.channelSummary || form.contentStyle || form.offers || form.contentStrategy);

  const runAnalysis = async () => {
    if (!form.channelUrl.trim()) {
      setError("Paste a YouTube channel URL first.");
      return;
    }
    setError("");
    setAiError(false);
    setAnalyzing(true);
    try {
      const result = await analyze({ data: { channelUrl: form.channelUrl.trim() } });
      setForm((current) => ({
        ...current,
        name: current.name || result.channelTitle,
        channelThumbnail: result.channelThumbnail || current.channelThumbnail,
        channelSummary: result.channelSummary,
        contentStyle: result.contentStyle,
        offers: result.offers,
        contentStrategy: result.contentStrategy,
        growthOpportunities: result.growthOpportunities,
        strategyItems: JSON.stringify(result.strategyItems || []),
        latestUploads: JSON.stringify(result.latestUploads || []),
        analysisDate: result.analysisDate,
      }));
    } catch {
      setAiError(true);
    } finally {
      setAnalyzing(false);
    }
  };

  const save = async () => {
    if (!form.name.trim()) {
      setError("Give the client a name before saving.");
      return;
    }
    setError("");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      channelUrl: form.channelUrl.trim(),
      channelThumbnail: form.channelThumbnail,
      channelSummary: form.channelSummary,
      contentStyle: form.contentStyle,
      offers: form.offers,
      contentStrategy: form.contentStrategy,
      growthOpportunities: form.growthOpportunities,
      strategyItems: form.strategyItems,
      latestUploads: form.latestUploads,
      analysisDate: form.analysisDate,
      planType: form.planType,
      customPlanLabel: form.planType === "CUSTOM" ? form.customPlanLabel : "",
      monthlyFee: form.monthlyFee === "" ? undefined : Number(form.monthlyFee),
    };
    try {
      if (client) {
        await update({ data: { id: client.id, ...payload } });
      } else {
        await create({ data: payload });
      }
      await router.invalidate();
      onSaved?.();
      onOpenChange(false);
    } catch {
      setError("Could not save this client. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-h-[88vh] overflow-y-auto rounded-[20px] border-0 p-0 sm:max-w-xl">
        <div className="px-5 pb-5 pt-6 sm:px-6">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-semibold tracking-[-0.02em]">
              {client ? "Edit client" : "Add client"}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground">
              {client
                ? "Update plan details, fees or the channel profile."
                : "Paste a YouTube channel and AI will profile it before you save."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="client-name" className="text-[13px] font-medium">
                Client name
              </Label>
              <Input
                id="client-name"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                placeholder="Filled in by AI, or type it yourself"
                className="h-10 rounded-[10px] text-[15px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-channel" className="text-[13px] font-medium">
                YouTube channel URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="client-channel"
                  value={form.channelUrl}
                  onChange={(event) => setField("channelUrl", event.target.value)}
                  placeholder="https://youtube.com/@channel"
                  className="h-10 rounded-[10px] text-[15px]"
                />
                {!client && (
                  <button
                    type="button"
                    onClick={runAnalysis}
                    disabled={analyzing}
                    className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-medium text-white disabled:opacity-60"
                    style={{ background: "linear-gradient(145deg,#BF5AF2,#8E2DE2)" }}
                  >
                    {analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {analyzing ? "Analysing" : "Analyse"}
                  </button>
                )}
              </div>
              {analyzing && (
                <p className="text-[13px] text-muted-foreground">
                  Reading the channel's most recent uploads and classifying them by runtime…
                </p>
              )}
              {aiError && <div className="pt-1"><AiUnavailable /></div>}
            </div>

            <div className="space-y-2.5">
              <Label className="text-[13px] font-medium">Plan type</Label>
              <div className="grid grid-cols-3 gap-1 rounded-[12px] p-1" style={{ background: "var(--nav-hover)" }}>
                {PLAN_OPTIONS.map((option) => {
                  const active = form.planType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setField("planType", option.value);
                        if (option.value === "CUSTOM" && !form.monthlyFee) setField("monthlyFee", "3000");
                      }}
                      className="rounded-[9px] px-2 py-2 text-[13px] font-medium transition-all"
                      style={
                        active
                          ? { background: "var(--glass-strong)", boxShadow: "0 1px 2px rgba(0,0,0,0.25)" }
                          : { color: "var(--nav-fg)" }
                      }
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {form.planType === "CUSTOM" ? (
                <div className="space-y-3 pt-1">
                  <MonthlyFeeStepper value={form.monthlyFee || "3000"} onChange={(value) => setField("monthlyFee", value)} />
                  <Input
                    value={form.customPlanLabel}
                    onChange={(event) => setField("customPlanLabel", event.target.value)}
                    placeholder="$3000 — only ideation and channel management"
                    className="h-10 rounded-[10px] text-[15px]"
                  />
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <Label htmlFor="client-fee" className="text-[13px] font-medium">
                    Monthly fee
                  </Label>
                  <Input
                    id="client-fee"
                    type="number"
                    min="0"
                    value={form.monthlyFee}
                    onChange={(event) => setField("monthlyFee", event.target.value)}
                    placeholder="0"
                    className="h-10 rounded-[10px] text-[15px] tabular-nums"
                  />
                </div>
              )}
            </div>

            {(client || hasAnalysis) && (
              <div className="space-y-3 border-t pt-4" style={{ borderColor: "var(--hairline)" }}>
                <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Channel profile</p>
                <Textarea
                  value={form.channelSummary}
                  onChange={(event) => setField("channelSummary", event.target.value)}
                  placeholder="Channel summary"
                  className="min-h-[72px] rounded-[10px] text-[15px]"
                />
                <Textarea
                  value={form.contentStyle}
                  onChange={(event) => setField("contentStyle", event.target.value)}
                  placeholder="Content style"
                  className="min-h-[72px] rounded-[10px] text-[15px]"
                />
                <Textarea
                  value={form.offers}
                  onChange={(event) => setField("offers", event.target.value)}
                  placeholder="What they sell"
                  className="min-h-[72px] rounded-[10px] text-[15px]"
                />
                <Textarea
                  value={form.growthOpportunities}
                  onChange={(event) => setField("growthOpportunities", event.target.value)}
                  placeholder="Growth opportunities"
                  className="min-h-[72px] rounded-[10px] text-[15px]"
                />
                <Textarea
                  value={form.contentStrategy}
                  onChange={(event) => setField("contentStrategy", event.target.value)}
                  placeholder="Content strategy"
                  className="min-h-[88px] rounded-[10px] text-[15px]"
                />
              </div>
            )}

            {error && <p className="text-[13px]" style={{ color: "#FF453A" }}>{error}</p>}
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-10 items-center rounded-[10px] px-4 text-[15px] font-medium"
              style={{ background: "var(--nav-hover)" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving || analyzing}
              className="inline-flex h-10 items-center gap-1.5 rounded-[10px] px-4 text-[15px] font-medium text-white disabled:opacity-60"
              style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {client ? "Save changes" : "Save client"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}