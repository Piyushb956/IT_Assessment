"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { getSession, ROLE_HOME } from "../../lib/auth";
import DashboardHeader from "../components/dashboard_header";
import Modal from "../components/modal";

const ROLE_STYLES = {
  employer: "bg-violet-400/10 text-violet-300 border-violet-400/20",
  virtual_hr: "bg-sky-400/10 text-sky-300 border-sky-400/20",
  admin: "bg-teal-400/10 text-teal-300 border-teal-400/20",
};

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("virtual_hr");
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "admin") {
      router.push(ROLE_HOME[session.user.role] || "/login");
      return;
    }
    setUser(session.user);
  }, [router]);

  const loadUsers = useCallback(async () => {
    try {
      const data = await api.listUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (user) loadUsers();
  }, [user, loadUsers]);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api.createUser({ name, email, password, role });
      setName("");
      setEmail("");
      setPassword("");
      setRole("virtual_hr");
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!user) return null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="glass-panel divide-y divide-white/10">
        <div className="p-6">
          <DashboardHeader
            user={user}
            action={
              <button onClick={() => setModalOpen(true)} className="btn-primary">
                + Create user
              </button>
            }
          />
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Users</h2>
          <div className="divide-y divide-white/10">
            {users.length === 0 && (
              <p className="p-8 text-center text-slate-400 text-sm">No users yet.</p>
            )}
            {users.map((u) => (
              <div key={u.id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-slate-400 text-sm">{u.email}</p>
                </div>
                <span className={`badge ${ROLE_STYLES[u.role] || ""}`}>
                  {u.role.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create a user">
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            className="glass-input"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            className="glass-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="glass-input"
            placeholder="Temporary password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select
            className="glass-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="employer" className="bg-slate-900">Employer</option>
            <option value="virtual_hr" className="bg-slate-900">Virtual HR</option>
            <option value="admin" className="bg-slate-900">Admin</option>
          </select>
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full">Create user</button>
        </form>
      </Modal>
    </main>
  );
}