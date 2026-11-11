export const MONEY_COLORS = {
  paid: "#30D158",
  pending: "#FF9F0A",
  overdue: "#FF453A",
  revenue: "#30D158",
  cost: "#FF9F0A",
  mrr: "#0A84FF",
};

export const AXIS_PROPS = {
  axisLine: false,
  tickLine: false,
  tick: { fill: "#8E8E93", fontSize: 11 },
  tickMargin: 6,
};

export const moneyTick = (value) =>
  Math.abs(Number(value)) >= 1000 ? `$${Math.round(Number(value) / 1000)}k` : `$${Math.round(Number(value) || 0)}`;

export const TOOLTIP_STYLE = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
  padding: "8px 10px",
};