export const PLAN_OPTIONS = [
  { value: "TEAM_ONLY", label: "Team only", hint: "The agency runs everything" },
  { value: "PERSONAL_INVOLVED", label: "Personal involved", hint: "Client films and appears" },
  { value: "CUSTOM", label: "Custom", hint: "Custom scope and fee" },
];

export const PLAN_LABELS = {
  TEAM_ONLY: "Team only",
  PERSONAL_INVOLVED: "Personal involved",
  CUSTOM: "Custom",
};

export const PLAN_COLORS = {
  TEAM_ONLY: "#0A84FF",
  PERSONAL_INVOLVED: "#BF5AF2",
  CUSTOM: "#64D2FF",
};

export const STAGES = [
  { key: "WAITING_FOR_FOOTAGE", label: "Waiting for footage", color: "#8E8E93" },
  { key: "FILMING", label: "Filming", color: "#0A84FF" },
  { key: "EDITING_SHORT_FORM", label: "Editing short-form", color: "#BF5AF2" },
  { key: "EDITING_LONG_FORM", label: "Editing long-form", color: "#BF5AF2" },
  { key: "DESIGNING_THUMBNAIL", label: "Designing thumbnail", color: "#FF375F" },
  { key: "IN_REVIEW", label: "In review", color: "#FF9F0A" },
  { key: "UPLOADING", label: "Uploading", color: "#64D2FF" },
  { key: "PUBLISHED", label: "Published", color: "#30D158" },
];

export const STAGE_BY_KEY = Object.fromEntries(STAGES.map((stage) => [stage.key, stage]));

export const PAYMENT_LABELS = { SETUP: "Setup fee", MONTHLY: "Monthly retainer" };

export const PAYMENT_COLORS = { PENDING: "#FF9F0A", PAID: "#30D158", OVERDUE: "#FF453A" };

export const ROLE_LABELS = {
  CHANNEL_MANAGER: "Channel manager",
  SHORT_FORM_EDITOR: "Short-form editor",
  LONG_FORM_EDITOR: "Long-form editor",
  THUMBNAIL_DESIGNER: "Thumbnail designer",
};

export function formatMoney(value) {
  const amount = Number(value);
  if (value === null || value === undefined || value === "" || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompact(value) {
  const amount = Number(value);
  if (value === null || value === undefined || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-GB", { notation: "compact", maximumFractionDigits: 1 }).format(amount);
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function formatDuration(seconds) {
  const total = Number(seconds) || 0;
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function stripProtocol(url) {
  return String(url || "").replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export function parseJsonList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function strategyBullets(strategyItems, fallbackText) {
  const items = parseJsonList(strategyItems)
    .filter((item) => item?.action || item?.target)
    .map((item) => ({
      action: String(item.action || "").trim(),
      target: String(item.target || "").trim(),
      reasoning: String(item.reasoning || "").trim(),
    }));
  if (items.length) return items;

  return String(fallbackText || "")
    .split(/\n+/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean)
    .map((line) => ({ action: line, target: "", reasoning: "" }));
}