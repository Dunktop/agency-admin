const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const pad = (value) => String(value).padStart(2, "0");

export { WEEKDAY_SHORT };

export const dateKey = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;

export const todayKey = () => {
  const now = new Date();
  return dateKey(now.getFullYear(), now.getMonth(), now.getDate());
};

export const monthLabel = (year, month) =>
  new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export const monthPrefix = (year, month) => `${year}-${pad(month + 1)}`;

export function buildCells(year, month) {
  const toCell = (date, outside) => ({
    key: dateKey(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    day: date.getUTCDate(),
    outside,
  });

  const firstWeekday = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const daysInPrev = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells = [];
  for (let index = firstWeekday; index > 0; index -= 1) {
    cells.push(toCell(new Date(Date.UTC(year, month - 1, daysInPrev - index + 1)), true));
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toCell(new Date(Date.UTC(year, month, day)), false));
  }
  let next = 1;
  while (cells.length % 7 !== 0) {
    cells.push(toCell(new Date(Date.UTC(year, month + 1, next)), true));
    next += 1;
  }
  return cells;
}