import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthError } from "@/components/auth/parts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginWithMfa } from "@/lib/authMfa";
import { saveSuperAdminGrant, takeSuperAdminGrant } from "@/lib/superAdminGrant";
import { applySuperAdminGrant, grantSuperAdminAccess } from "@/lib/security-fns";

export default function SuperAdminAccessDialog() {
  const grant = useServerFn(grantSuperAdminAccess);
  const apply = useServerFn(applySuperAdminGrant);

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [superPassword, setSuperPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  const close = (next) => {
    setOpen(next);
    if (!next) {
      setPassword("");
      setSuperPassword("");
      setError("");
      setDone(null);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const { grantId } = await grant({ data: { password: superPassword } });
      saveSuperAdminGrant(grantId);

      const result = await loginWithMfa(email.trim().toLowerCase(), password);
      if (result?.mfa_required) {
        setDone({ mfa: true, email });
        return;
      }

      await apply({ data: { grantId } });
      takeSuperAdminGrant();
      window.location.href = "/";
    } catch (requestError) {
      setError(requestError?.message || "That didn't work.");
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-auto mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        Super Admin Access
      </button>

      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="glass-strong max-h-[90vh] overflow-y-auto border-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[17px]">
              <ShieldCheck className="h-4 w-4" style={{ color: "#0A84FF" }} />
              Super admin access
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed">
              Sign in and enter the super admin password from Settings → Security. A correct password gives that login
              full owner access.
            </DialogDescription>
          </DialogHeader>

          {done ? (
            <p className="flex items-start gap-1.5 rounded-[10px] px-3 py-2 text-[12.5px] leading-relaxed" style={{ color: "#30D158", background: "rgba(48,209,88,0.12)" }}>
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Password accepted. Finish the two-factor step for {done.email} and owner access is applied on arrival.
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <AuthError>{error}</AuthError>
              <div className="space-y-1.5">
                <Label htmlFor="super-email">Team email</Label>
                <Input
                  id="super-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="owner@agency.com"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="super-account-password">Account password</Label>
                <Input
                  id="super-account-password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="super-admin-password">Super admin password</Label>
                <Input
                  id="super-admin-password"
                  type="password"
                  required
                  value={superPassword}
                  onChange={(event) => setSuperPassword(event.target.value)}
                  placeholder="From Settings → Security"
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                disabled={busy || !email.trim() || !password || !superPassword}
                className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-[10px] text-[13.5px] font-medium text-white disabled:opacity-40"
                style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {busy ? "Checking…" : "Grant owner access"}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}