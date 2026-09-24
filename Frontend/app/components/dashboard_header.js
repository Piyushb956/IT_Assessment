import Avatar from "./avatar";

const ROLE_LABEL = {
  employer: "Employer",
  virtual_hr: "Virtual HR",
  admin: "Administrator",
};

export default function DashboardHeader({ user, action }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Avatar name={user.name} />
        <div>
          <p className="font-semibold leading-tight">{user.name}</p>
          <p className="text-slate-400 text-sm leading-tight">
            {ROLE_LABEL[user.role] || user.role}
          </p>
        </div>
      </div>
      {action}
    </div>
  );
}