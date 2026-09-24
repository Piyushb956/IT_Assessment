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





export default function VirtualHrPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [mode, setMode] = useState("video");
  const [taskId, setTaskId] = useState("");
 
  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "virtual_hr") {
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
    loadTasks();
    loadInterviews();
    const interval = setInterval(() => {
      loadTasks();
      loadInterviews();
    }, 4000);
    return () => clearInterval(interval);
  }, [user, loadTasks, loadInterviews]);
 
  async function handleStatusChange(id, status) {
    try {
      await api.updateTaskStatus(id, status);
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }
 
  async function handleSchedule(e) {
    e.preventDefault();
    setError("");
    try {
      await api.createInterview({
        task_id: Number(taskId),
        candidate_name: candidateName,
        scheduled_time: scheduledTime,
        mode,
      });
      setCandidateName("");
      setScheduledTime("");
      setTaskId("");
      setModalOpen(false);
      loadInterviews();
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
                + Schedule interview
              </button>
            }
          />
        </div>
 
        <div className="p-6">
          <StatsOverview tasks={tasks} />
        </div>
 
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">My tasks</h2>
          <TaskList tasks={tasks} onStatusChange={handleStatusChange} />
        </div>
 
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Scheduled interviews</h2>
          <InterviewList interviews={interviews} tasks={tasks} />
        </div>
      </div>
 
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule an interview">
        <form onSubmit={handleSchedule} className="space-y-4">
          <select
            className="glass-input"
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            required
          >
            <option value="" className="bg-slate-900">Related task...</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-900">{t.title}</option>
            ))}
          </select>
          <input
            className="glass-input"
            placeholder="Candidate name"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            required
          />
          <input
            type="datetime-local"
            className="glass-input"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            required
          />
          <div className="flex gap-2">
            {["voice", "video", "chat"].map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setMode(m)}
                className={
                  mode === m
                    ? "flex-1 capitalize py-2 rounded-lg bg-teal-400 text-slate-900 font-medium transition"
                    : "flex-1 capitalize py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition"
                }
              >
                {m}
              </button>
            ))}
          </div>
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full">Schedule</button>
        </form>
      </Modal>
    </main>
  );
}
 