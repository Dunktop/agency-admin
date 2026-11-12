import { useState } from "react";
import { Loader2, RefreshCw, Youtube } from "lucide-react";
import SectionCard from "@/components/clients/detail/SectionCard";
import { Image } from "@/components/ui/image";

const INPUT_STYLE = { background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" };

export default function ChannelConnectCard({ client, apiKeyConfigured, onConnect, onSync }) {
  const [value, setValue] = useState(client.channelUrl || "");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const connect = async (event) => {
    event.preventDefault();
    if (!value.trim() || busy) return;
    setBusy("connect");
    setError("");
    try {
      await onConnect(value.trim());
    } catch (requestError) {
      setError(requestError?.message || "That channel couldn't be connected.");
    } finally {
      setBusy("");
    }
  };

  const sync = async () => {
    if (busy) return;
    setBusy("sync");
    setError("");
    try {
      await onSync();
    } catch (requestError) {
      setError(requestError?.message || "Couldn't pull the channel stats.");
    } finally {
      setBusy("");
    }
  };

  const field = (
    <input
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder="https://youtube.com/@channel or UC…"
      aria-label="YouTube channel URL or ID"
      className="h-9 w-full min-w-0 rounded-[10px] px-3 text-[13px] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
      style={INPUT_STYLE}
    />
  );

  return (
    <SectionCard
      title="Channel"
      delay={240}
      action={
        client.channelId ? (
          <span className="text-[12.5px] text-muted-foreground tabular-nums">{client.channelId}</span>
        ) : null
      }
    >
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full" style={{ background: "var(--nav-hover)" }}>
          {client.channelThumbnail ? (
            <Image src={client.channelThumbnail} alt="" className="h-full w-full" fittingType="fill" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Youtube className="h-4 w-4" strokeWidth={1.9} />
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium">{client.name}</p>
          <p className="text-[12px] text-muted-foreground">
            {client.channelId ? "Channel linked" : apiKeyConfigured ? "No channel linked yet" : "Add your API key first"}
          </p>
        </div>
        {client.channelId && (
          <button
            type="button"
            onClick={sync}
            disabled={Boolean(busy)}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[9px] px-3 text-[12.5px] font-medium transition-opacity disabled:opacity-40"
            style={INPUT_STYLE}
          >
            {busy === "sync" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.9} />
            )}
            {busy === "sync" ? "Syncing…" : "Sync now"}
          </button>
        )}
      </div>

      {!client.channelId && (
        <form onSubmit={connect} className="mt-3 flex flex-col gap-2 sm:flex-row">
          {field}
          <button
            type="submit"
            disabled={Boolean(busy) || !value.trim()}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-[10px] px-4 text-[13px] font-medium text-white transition-opacity disabled:opacity-40"
            style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
          >
            {busy === "connect" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {busy === "connect" ? "Connecting…" : "Connect & sync"}
          </button>
        </form>
      )}

      {client.channelId && (
        <details className="mt-3">
          <summary className="cursor-pointer text-[12.5px] text-muted-foreground">Use a different channel</summary>
          <form onSubmit={connect} className="mt-2 flex flex-col gap-2 sm:flex-row">
            {field}
            <button
              type="submit"
              disabled={Boolean(busy) || !value.trim()}
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-[10px] px-4 text-[13px] font-medium transition-opacity disabled:opacity-40"
              style={INPUT_STYLE}
            >
              {busy === "connect" ? "Connecting…" : "Save & sync"}
            </button>
          </form>
        </details>
      )}

      {error && <p className="mt-2 text-[12.5px] leading-relaxed text-destructive">{error}</p>}
    </SectionCard>
  );
}