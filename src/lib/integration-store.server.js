// Integration credentials live in AppSetting so they can be managed from the UI
// at runtime. Every read here uses the service role: the entity's own rules keep
// those values out of the browser, and handlers expose only what they need.
const settingKey = (id) => `integration:${id}`;
const ONBOARDING_KEY = "onboarding:dismissed";
const LIMIT = 200;

const parseRecord = (raw) => {
  try {
    const parsed = JSON.parse(raw || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const listSettings = async (base44) => {
  const page = await base44.asServiceRole.entities.AppSetting.list({ limit: LIMIT });
  const items = Array.isArray(page) ? page : page.items || [];
  return new Map(items.map((record) => [record.key, record]));
};

export const readConfigState = async (base44, ids) => {
  const map = await listSettings(base44);
  const states = {};
  for (const id of ids) states[id] = parseRecord(map.get(settingKey(id))?.value);
  return { states, dismissed: map.get(ONBOARDING_KEY)?.value === "1" };
};

export const cleanFields = (fields) => {
  const clean = {};
  for (const [key, value] of Object.entries(fields || {})) {
    if (typeof value === "string" && value.trim()) clean[key] = value.trim();
  }
  return clean;
};

export const readIntegrationFields = async (base44, id) => {
  const { states } = await readConfigState(base44, [id]);
  return cleanFields(states[id]?.fields);
};

export const writeSetting = async (base44, key, value) => {
  const service = base44.asServiceRole;
  const page = await service.entities.AppSetting.filter({ key }, { limit: 1 });
  const items = Array.isArray(page) ? page : page.items || [];
  if (items[0]) return service.entities.AppSetting.update(items[0].id, { value });
  return service.entities.AppSetting.create({ key, value });
};

export const writeIntegrationRecord = (base44, id, data) =>
  writeSetting(base44, settingKey(id), JSON.stringify(data));

export const dismissOnboarding = (base44) => writeSetting(base44, ONBOARDING_KEY, "1");

export const readSettingValue = async (base44, key) => {
  const map = await listSettings(base44);
  return String(map.get(key)?.value || "");
};