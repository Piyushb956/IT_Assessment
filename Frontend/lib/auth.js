// Single source of truth for "who is logged in right now" on the frontend.
// The actual security check still happens on the backend via the token —
// this just tells the UI which page to show/redirect to.

export function getSession() {
  if (typeof window === "undefined") return null;
  const token = sessionStorage.getItem("token");
  const userRaw = sessionStorage.getItem("user");
  if (!token || !userRaw) return null;
  try {
    return { token, user: JSON.parse(userRaw) };
  } catch {
    return null;
  }
}

export function saveSession(tokenResponse) {
  sessionStorage.setItem("token", tokenResponse.access_token);
  sessionStorage.setItem(
    "user",
    JSON.stringify({
      id: tokenResponse.id,
      name: tokenResponse.name,
      role: tokenResponse.role,
    })
  );
}

export function logout() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
}

export const ROLE_HOME = {
  employer: "/employer",
  virtual_hr: "/virtual-hr",
  admin: "/admin",
};