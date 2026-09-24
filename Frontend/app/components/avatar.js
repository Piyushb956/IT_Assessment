export default function Avatar({ name }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-teal-400 to-violet-500 flex items-center justify-center text-slate-900 font-semibold text-sm shadow-lg shadow-teal-500/20">
      {initials}
    </div>
  );
}