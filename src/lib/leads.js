export const LEAD_STATUSES = [
  { value: "TO_CONTACT", label: "To contact", color: "#8E8E93" },
  { value: "CONTACTED", label: "Contacted", color: "#0A84FF" },
  { value: "IN_TALKS", label: "In talks", color: "#FF9F0A" },
  { value: "CLOSED", label: "Closed won", color: "#30D158" },
  { value: "LOST", label: "Lost", color: "#FF453A" },
];

export const LEAD_STATUS_BY_VALUE = Object.fromEntries(LEAD_STATUSES.map((status) => [status.value, status]));