import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { setSuperAdminPassword } from "@/lib/security-fns";

export default function SecurityPanel({ data }) {
  const router = useRouter();
  const save = useServerFn(setSuperAdminPassword);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  if (!data?.canManage) {
    return (
      <p className="glass rounded-2xl px-4 py-5 text-[13.5px] leading-relaxed text-muted-foreground">
        Only an admin can change the super admin password.
      </p>
    );
  }

  const submit = async (event) => {
    event.preventDefault();
    if (password.length < 8 || busy) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await save({ data: { password } });
      setPassword("");
      setSaved(true);
      await router.invalidate();
    } catch (requestError) {
      setError(requestError?.message || "That password couldn't be saved.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="glass rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <span
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "rgba(10,132,255,0.16)", color: "#0A84FF" }}
          >
            <ShieldCheck className="h-4 w-4" strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold tracking-[-0.01em]">Super admin access</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              The login screen has a Super Admin Access button. Whoever enters your team email plus this password gets
              full owner access to that login — it's the way back in if an owner account is locked out. Set the password
              here; it's stored hashed, never in plain text.
            </p>

            <p className="mt-2 text-[12.5px]">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium"
                style={
                  data.passwordSet
                    ? { color: "#30D158", background: "rgba(48,209,88,0.14)" }
                    : { color: "#9a9aa0", background: "rgba(120,120,128,0.18)" }
                }
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: data.passwordSet ? "#30D158" : "#9a9aa0" }}
                />
                {data.passwordSet ? "Password set" : "No password set yet"}
              </span>
            </p>

            <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <KeyRound className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={data.passwordSet ? "New password" : "At least 8 characters"}
                  aria-label="Super admin password"
                  autoComplete="new-password"
                  className="h-10 w-full rounded-[10px] pl-9 pr-3 text-[13.5px] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                  style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={busy || password.length < 8}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-[10px] px-4 text-[13px] font-medium text-white disabled:opacity-40"
                style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
              >
                {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {busy ? "Saving…" : data.passwordSet ? "Replace password" : "Set password"}
              </button>
            </form>

            {error && <p className="mt-2 text-[12.5px] text-destructive">{error}</p>}
            {saved && (
              <p className="mt-2 flex items-center gap-1.5 text-[12.5px]" style={{ color: "#30D158" }}>
                <Check className="h-3.5 w-3.5" /> Password saved.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}