export const shortDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
};

export const ctrLabel = (value) =>
  value === null || value === undefined || Number.isNaN(Number(value)) ? "—" : `${Number(value).toFixed(1)}%`;

export const numberTick = (value) => {
  const amount = Number(value) || 0;
  if (Math.abs(amount) >= 1000000) return `${(amount / 1000000).toFixed(1)}m`;
  if (Math.abs(amount) >= 1000) return `${Math.round(amount / 1000)}k`;
  return String(Math.round(amount));
};

export const deltaHint = (current, previous, unit) => {
  if (current === null || current === undefined || previous === null || previous === undefined) return null;
  const diff = Number(current) - Number(previous);
  if (!diff) return "No change since last snapshot";
  const sign = diff > 0 ? "+" : "−";
  return `${sign}${numberTick(Math.abs(diff))} ${unit} since last snapshot`;
};