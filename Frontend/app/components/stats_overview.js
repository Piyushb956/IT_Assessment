const STATUS_META = {
  pending: { label: "Pending", bar: "bg-amber-400", text: "text-amber-300" },
  in_progress: { label: "In progress", bar: "bg-sky-400", text: "text-sky-300" },
  completed: { label: "Completed", bar: "bg-teal-400", text: "text-teal-300" },
};

export default function StatsOverview({ tasks }) {
  const counts = { pending: 0, in_progress: 0, completed: 0 };
  tasks.forEach((t) => {
    counts[t.status] = (counts[t.status] || 0) + 1;
  });
  const total = tasks.length;

  return (
    <div className="glass-panel p-6 mb-8">
      <div className="grid grid-cols-3 gap-4 mb-5">
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <div key={key}>
            <p className={`text-3xl font-display font-semibold ${meta.text}`}>
              {counts[key]}
            </p>
            <p className="text-slate-400 text-sm">{meta.label}</p>
          </div>
        ))}
      </div>

      <div className="h-2 rounded-full overflow-hidden bg-white/5 flex">
        {total === 0 ? (
          <div className="w-full bg-white/10" />
        ) : (
          Object.entries(STATUS_META).map(
            ([key, meta]) =>
              counts[key] > 0 && (
                <div
                  key={key}
                  className={meta.bar}
                  style={{ width: `${(counts[key] / total) * 100}%` }}
                />
              )
          )
        )}
      </div>
    </div>
  );
}