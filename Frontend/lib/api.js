const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getVirtualHrUsers: () => request("/users/virtual-hr"),

  // assigned_by is no longer sent — the backend reads it from your token
  createTask: (task) =>
    request("/tasks", { method: "POST", body: JSON.stringify(task) }),

  // no user_id/role params anymore — the backend reads them from your token
  getTasks: () => request("/tasks"),

  updateTaskStatus: (taskId, status) =>
    request(`/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // scheduled_by is no longer sent — the backend reads it from your token
  createInterview: (interview) =>
    request("/interviews", { method: "POST", body: JSON.stringify(interview) }),

  getInterviews: (taskId) =>
    request(taskId ? `/interviews?task_id=${taskId}` : "/interviews"),

  // Admin only
  createUser: (user) =>
    request("/admin/users", { method: "POST", body: JSON.stringify(user) }),
  listUsers: () => request("/admin/users"),
};