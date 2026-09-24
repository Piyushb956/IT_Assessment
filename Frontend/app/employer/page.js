"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { getSession, ROLE_HOME } from "../../lib/auth";
import DashboardHeader from "../components/dashboard_header";
import StatsOverview from "../components/stats_overview";
import TaskList from "../components/task_list";
import Modal from "../components/modal";
import InterviewList from "../components/interviewlist";


export default function EmployerPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [hrUsers, setHrUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "employer") {
      // Logged in, but the wrong role for this page — send them to their own dashboard
      router.push(ROLE_HOME[session.user.role] || "/login");
      return;
    }
    setUser(session.user);
  }, [router]);

  const loadTasks = useCallback(async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const loadInterviews = useCallback(async () => {
    try {
      const data = await api.getInterviews();
      setInterviews(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    api.getVirtualHrUsers().then(setHrUsers).catch((err) => setError(err.message));
    loadTasks();
    loadInterviews();
    const interval = setInterval(() => {
      loadTasks();
      loadInterviews();
    }, 4000);
    return () => clearInterval(interval);
  }, [user, loadTasks, loadInterviews]);

  async function handleAssign(e) {
    e.preventDefault();
    setError("");
    try {
      await api.createTask({
        title,
        description,
        assigned_to: Number(assignedTo),
      });
      setTitle("");
      setDescription("");
      setAssignedTo("");
      setModalOpen(false);
      loadTasks();
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
                + Assign task
              </button>
            }
          />
        </div>

        <div className="p-6">
          <StatsOverview tasks={tasks} />
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Tasks</h2>
          <TaskList tasks={tasks} />
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Scheduled interviews</h2>
          <InterviewList interviews={interviews} tasks={tasks} />
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Assign a task">
        <form onSubmit={handleAssign} className="space-y-4">
          <input
            className="glass-input"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="glass-input min-h-[80px]"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <select
            className="glass-input"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            required
          >
            <option value="" className="bg-slate-900">Assign to...</option>
            {hrUsers.map((u) => (
              <option key={u.id} value={u.id} className="bg-slate-900">{u.name}</option>
            ))}
          </select>
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full">Assign task</button>
        </form>
      </Modal>
    </main>
  );
}