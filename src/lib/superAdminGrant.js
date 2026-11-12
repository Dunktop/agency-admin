const KEY = "agency-admin:super-grant";

export const saveSuperAdminGrant = (grantId) => {
  try {
    window.sessionStorage.setItem(KEY, grantId);
  } catch {
    // Private-mode storage failures just mean the grant isn't carried over.
  }
};

export const takeSuperAdminGrant = () => {
  try {
    const value = window.sessionStorage.getItem(KEY);
    if (value) window.sessionStorage.removeItem(KEY);
    return value || "";
  } catch {
    return "";
  }
};