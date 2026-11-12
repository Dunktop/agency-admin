export const STATUS_META = {
  CONNECTED: { label: "Connected", color: "#30D158", background: "rgba(48,209,88,0.14)" },
  NOT_CONFIGURED: { label: "Not configured", color: "#9a9aa0", background: "rgba(120,120,128,0.18)" },
  ERROR: { label: "Error", color: "#FF453A", background: "rgba(255,69,58,0.14)" },
};

export const statusMeta = (status) => STATUS_META[status] || STATUS_META.NOT_CONFIGURED;

export function timeAgo(iso) {
  if (!iso) return "Never tested";
  const stamp = new Date(iso).getTime();
  if (Number.isNaN(stamp)) return "Never tested";
  const seconds = Math.max(0, Math.round((Date.now() - stamp) / 1000));
  if (seconds < 60) return "Tested just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `Tested ${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Tested ${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `Tested ${days} d ago`;
  return `Tested ${new Date(stamp).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
}