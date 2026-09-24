export default function InterviewList({ interviews, tasks }) {
  const taskTitle = (id) => tasks.find((t) => t.id === id)?.title || `Task #${id}`;

  return (
    <div className="divide-y divide-white/10">
      {interviews.length === 0 && (
        <p className="p-8 text-center text-slate-400 text-sm">
          No interviews scheduled yet.
        </p>
      )}
      {interviews.map((iv) => (
        <div key={iv.id} className="py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-medium truncate">{iv.candidate_name}</p>
            <p className="text-slate-400 text-sm truncate">
              {taskTitle(iv.task_id)} · {new Date(iv.scheduled_time).toLocaleString()}
            </p>
          </div>
          <span className="badge bg-violet-400/10 text-violet-300 border-violet-400/20 capitalize shrink-0">
            {iv.mode}
          </span>
        </div>
      ))}
    </div>
  );
}