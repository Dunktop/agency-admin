import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertCircle, Check, Clock, Loader2, PlugZap } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { catalogById } from "./integration-catalog";
import { statusMeta, timeAgo } from "./status";
import CopyBlock from "./CopyBlock";
import IntegrationIcon from "./IntegrationIcon";
import { saveIntegration, testIntegration } from "@/lib/integrations-fns";

function CredentialField({ field, value, onChange, disabled }) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-medium text-muted-foreground">{field.label}</span>
      <div className="flex gap-2">
        <input
          type={visible ? "text" : "password"}
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          className="h-9 w-full rounded-[10px] px-3 font-mono text-[12.5px] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring disabled:opacity-60"
          style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="h-9 shrink-0 rounded-[10px] px-3 text-[12px] text-muted-foreground"
          style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </label>
  );
}

export default function SetupGuideSheet({ integration, canManage = false, onClose, onSaved }) {
  const save = useServerFn(saveIntegration);
  const test = useServerFn(testIntegration);
  const guide = integration ? catalogById[integration.id] : null;

  const [draft, setDraft] = useState({});
  const [checked, setChecked] = useState([]);
  const [busy, setBusy] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!integration) return;
    setDraft({ ...(integration.fields || {}) });
    setChecked([]);
    setResult(null);
    setBusy("");
  }, [integration?.id]);

  if (!integration || !guide) return null;

  const meta = statusMeta(integration.status);
  const missing = guide.fields.filter((field) => !String(draft[field.key] || "").trim());
  const canSave = missing.length === 0;

  const toggle = (index) =>
    setChecked((prev) => (prev.includes(index) ? prev.filter((entry) => entry !== index) : [...prev, index]));

  const runSave = async () => {
    setBusy("save");
    setResult(null);
    try {
      const response = await save({ data: { id: integration.id, fields: draft } });
      setResult({ ok: true, message: response.message });
      await onSaved?.();
    } catch (error) {
      setResult({ ok: false, message: error?.message || "Those credentials couldn't be saved." });
    } finally {
      setBusy("");
    }
  };

  const runTest = async () => {
    setBusy("test");
    setResult(null);
    try {
      const response = await test({
        data: { id: integration.id, fields: integration.fieldKeys.length ? draft : {} },
      });
      setResult({ ok: response.ok, message: response.message });
      await onSaved?.();
    } catch (error) {
      setResult({ ok: false, message: error?.message || "That integration couldn't be reached." });
    } finally {
      setBusy("");
    }
  };

  return (
    <Sheet open={Boolean(integration)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="glass-strong w-full overflow-y-auto border-l-0 p-0 sm:max-w-[460px]">
        <div className="p-5 pb-10">
          <SheetHeader className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <IntegrationIcon id={integration.id} />
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-[18px] font-semibold tracking-[-0.01em]">{guide.name}</SheetTitle>
                <SheetDescription className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {guide.blurb}
                </SheetDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11.5px]">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium"
                style={{ color: meta.color, background: meta.background }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                {meta.label}
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-muted-foreground"
                style={{ background: "var(--nav-hover)" }}
              >
                <Clock className="h-3 w-3" /> {guide.minutes}
              </span>
              {integration.builtIn && (
                <span
                  className="rounded-full px-2 py-0.5 text-muted-foreground"
                  style={{ background: "var(--nav-hover)" }}
                >
                  Included
                </span>
              )}
            </div>
          </SheetHeader>

          <p className="mt-4 text-[13.5px] leading-relaxed text-muted-foreground">{guide.intro}</p>

          <ol className="mt-4 space-y-4">
            {guide.steps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span
                  className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11.5px] font-semibold"
                  style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium leading-snug">{step.title}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{step.body}</p>
                  {step.code && <CopyBlock code={step.code} />}
                </div>
              </li>
            ))}
          </ol>

          {guide.fields.length > 0 && (
            <div className="mt-5 space-y-3">
              {guide.fields.map((field) => (
                <CredentialField
                  key={field.key}
                  field={field}
                  value={draft[field.key]}
                  disabled={!integration || busy !== ""}
                  onChange={(value) => setDraft((prev) => ({ ...prev, [field.key]: value }))}
                />
              ))}
            </div>
          )}

          <div className="mt-5 space-y-2">
            <p className="text-[12.5px] font-medium text-muted-foreground">Completion checklist</p>
            {guide.steps.map((step, index) => (
              <button
                key={step.title}
                type="button"
                onClick={() => toggle(index)}
                className="flex w-full items-start gap-2 rounded-[10px] px-2 py-1.5 text-left text-[12.5px] transition-colors hover:bg-[var(--nav-hover)]"
              >
                <span
                  className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px]"
                  style={{
                    background: checked.includes(index) ? "#30D158" : "transparent",
                    border: checked.includes(index) ? "none" : "1px solid var(--glass-border)",
                  }}
                >
                  {checked.includes(index) && <Check className="h-3 w-3 text-black" strokeWidth={3} />}
                </span>
                <span className={checked.includes(index) ? "text-muted-foreground line-through" : ""}>{step.title}</span>
              </button>
            ))}
            <div className="flex items-start gap-2 px-2 py-1.5 text-[12.5px]">
              <span
                className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px]"
                style={{
                  background: integration.status === "CONNECTED" ? "#30D158" : "transparent",
                  border: integration.status === "CONNECTED" ? "none" : "1px solid var(--glass-border)",
                }}
              >
                {integration.status === "CONNECTED" && <Check className="h-3 w-3 text-black" strokeWidth={3} />}
              </span>
              <span className={integration.status === "CONNECTED" ? "text-muted-foreground line-through" : ""}>
                Connection verified · {timeAgo(integration.testedAt)}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            {canManage && guide.fields.length > 0 && (
              <button
                type="button"
                onClick={runSave}
                disabled={busy !== "" || !canSave}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[10px] px-4 text-[13px] font-medium text-white transition-opacity disabled:opacity-40"
                style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
              >
                {busy === "save" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {busy === "save" ? "Verifying…" : "Save & connect"}
              </button>
            )}
            <button
              type="button"
              onClick={runTest}
              disabled={busy !== "" || !canManage}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[10px] px-4 text-[13px] font-medium disabled:opacity-40"
              style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
            >
              {busy === "test" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlugZap className="h-3.5 w-3.5" />}
              {busy === "test" ? "Testing…" : "Test connection"}
            </button>
          </div>

          {result && (
            <p
              className="mt-3 flex items-start gap-1.5 text-[12.5px] leading-relaxed"
              style={{ color: result.ok ? "#30D158" : "#FF453A" }}
            >
              {result.ok ? (
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              )}
              {result.message}
            </p>
          )}

          {!canManage && (
            <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
              Only an admin can save or test credentials.
            </p>
          )}

          {canManage && !integration.fieldKeys.length && integration.status !== "CONNECTED" && (
            <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
              Nothing to paste here — the check above is the whole setup.
            </p>
          )}

          {guide.note && (
            <p className="mt-5 rounded-[10px] px-3 py-2 text-[12px] leading-relaxed text-muted-foreground" style={{ background: "var(--nav-hover)" }}>
              {guide.note}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}