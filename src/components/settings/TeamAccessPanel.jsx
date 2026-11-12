import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { inviteTeamMember } from "@/lib/team-access-fns";

const ROLE_STYLE = {
  admin: { label: "Owner", color: "#0A84FF", background: "rgba(10,132,255,0.16)" },
  user: { label: "Member", color: "#9a9aa0", background: "rgba(120,120,128,0.18)" },
};

const initials = (value) =>
  String(value || "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

function RolePill({ role }) {
  const style = ROLE_STYLE[role] || ROLE_STYLE.user;
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={style}
    >
      {role === "admin" && <ShieldCheck className="h-3 w-3" />}
      {style.label}
    </span>
  );
}

export default function TeamAccessPanel({ data }) {
  const router = useRouter();
  const invite = useServerFn(inviteTeamMember);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");

  if (!data?.canManage) {
    return (
      <p className="glass rounded-2xl px-4 py-5 text-[13.5px] leading-relaxed text-muted-foreground">
        Only an admin can invite team members or see the login list.
      </p>
    );
  }

  const submit = async (event) => {
    event.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    setError("");
    setSent("");
    try {
      const response = await invite({ data: { email: email.trim().toLowerCase(), role } });
      setSent(`Invite sent to ${response.email}.`);
      setEmail("");
      await router.invalidate();
    } catch (requestError) {
      setError(requestError?.message || "That invite couldn't be sent.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-[13.5px] leading-relaxed text-muted-foreground">
        Team members sign in at this app's URL with the email you invite — no VPN, no local network. Owners see and
        change everything; members work inside the same workspace.
      </p>

      <form onSubmit={submit} className="glass rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" style={{ color: "#0A84FF" }} />
          <h3 className="text-[14.5px] font-semibold tracking-[-0.01em]">Invite a team member</h3>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="teammate@agency.com"
            aria-label="Team member email"
            className="h-10 w-full rounded-[10px] px-3 text-[13.5px] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
            required
          />
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            aria-label="Access level"
            className="h-10 shrink-0 rounded-[10px] px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring"
            style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
          >
            <option value="user">Member</option>
            <option value="admin">Owner</option>
          </select>
          <button
            type="submit"
            disabled={busy || !email.trim()}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-[10px] px-4 text-[13px] font-medium text-white disabled:opacity-40"
            style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {busy ? "Sending…" : "Send invite"}
          </button>
        </div>

        {error && <p className="mt-2 text-[12.5px] text-destructive">{error}</p>}
        {sent && (
          <p className="mt-2 flex items-center gap-1.5 text-[12.5px]" style={{ color: "#30D158" }}>
            <Check className="h-3.5 w-3.5" /> {sent}
          </p>
        )}
      </form>

      <section className="glass rounded-2xl p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-[14.5px] font-semibold tracking-[-0.01em]">Team logins</h3>
          <span className="text-[12px] text-muted-foreground">
            {data.invites.length + 1} {data.invites.length === 0 ? "login" : "logins"}
          </span>
        </div>

        <ul className="mt-3 divide-y" style={{ borderColor: "var(--hairline)" }}>
          <li className="flex items-center gap-3 py-2.5">
            <span
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11.5px] font-semibold"
              style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
            >
              {initials(data.self?.email)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-medium">
                {data.self?.email}
                <span className="ml-1.5 text-[11.5px] text-muted-foreground">(you)</span>
              </p>
              <p className="text-[12px] text-muted-foreground">Signed in now</p>
            </div>
            <RolePill role={data.self?.role || "admin"} />
          </li>

          {data.invites.map((member) => (
            <li key={member.id} className="flex items-center gap-3 py-2.5">
              <span
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11.5px] font-semibold"
                style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
              >
                {initials(member.email)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-[13.5px] font-medium">
                  <Mail className="h-3 w-3 shrink-0 text-muted-foreground" />
                  {member.email}
                </p>
                <p className="truncate text-[12px] text-muted-foreground">
                  Invited {formatDate(member.invitedAt)}
                  {member.invitedBy ? ` by ${member.invitedBy}` : ""}
                </p>
              </div>
              <RolePill role={member.role} />
            </li>
          ))}
        </ul>

        <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">
          Every account and role also lives in the app dashboard's App Users page, where you can remove a login or change
          a role. Locked out of an owner account? Use Super Admin Access on the login screen.
        </p>
      </section>
    </div>
  );
}