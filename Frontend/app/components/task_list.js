"use client";

import { useState } from "react";

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed" },
];

const STATUS_STYLES = {
  pending: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  in_progress: "bg-sky-400/10 text-sky-300 border-sky-400/20",
  completed: "bg-teal-400/10 text-teal-300 border-teal-400/20",
};

const EMPTY_MESSAGES = {
  all: "No tasks yet.",
  pending: "Nothing pending right now.",
  in_progress: "No tasks in progress.",
  completed: "No tasks completed yet — completed tasks will show up here.",
};

// Pass onStatusChange for an editable status control (Virtual HR view).
// Omit it for a read-only badge (Employer view).
export default function TaskList({ tasks, onStatusChange }) {
  const [tab, setTab] = useState("all");
  const filtered = tab === "all" ? tasks : tasks.filter((t) => t.status === tab);

  return (
    <div>
      <div className="flex gap-1 mb-4 bg-white/5 border border-white/20 rounded-lg p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              tab === t.key
                ? "px-3 py-1.5 rounded-md text-sm font-medium bg-white/10 text-white"
                : "px-3 py-1.5 rounded-md text-sm text-slate-400 hover:text-slate-200 transition"
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="glass-panel divide-y divide-white/15">
        {filtered.length === 0 && (
          <p className="p-8 text-center text-slate-400 text-sm">{EMPTY_MESSAGES[tab]}</p>
        )}
        {filtered.map((task) => (
          <div key={task.id} className="p-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium truncate">{task.title}</p>
              {task.description && (
                <p className="text-slate-400 text-sm truncate">{task.description}</p>
              )}
            </div>

            {onStatusChange ? (
              <div className="flex gap-1.5 shrink-0">
                {["pending", "in_progress", "completed"].map((s) => (
                  <button
                    key={s}
                    onClick={() => s !== task.status && onStatusChange(task.id, s)}
                    className={
                      s === task.status
                        ? `px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${STATUS_STYLES[s]}`
                        : "px-2.5 py-1 rounded-full text-xs text-slate-500 border border-white/5 hover:border-white/20 hover:text-slate-300 transition capitalize"
                    }
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            ) : (
              <span className={`badge badge-${task.status} shrink-0`}>
                {task.status.replace("_", " ")}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}