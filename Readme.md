# Salarite Virtual HR Dashboard

A mini ATS/HR dashboard built for the Salarite intern assignment. An Employer
assigns tasks to a Virtual HR user, the Virtual HR updates task status and
schedules interviews, and the Employer sees status changes live without
refreshing.

## Live demo

- **App**: [https://your-app-name.vercel.app](https://it-hr-mauve.vercel.app/)
- **API docs**: [https://your-backend-name.onrender.com/docs](https://it-hr.onrender.com)

> The backend is on a free tier and may take 30-60 seconds to wake up on
> first load. If the app doesn't respond right away, use the "Trouble
> logging in? Click here" link on the login page, wait a moment, then try
> again.


## Demo credentials
> Note: Employer and Virtual HR credentials below are demo accounts meant
> for testing. The Admin password is intentionally not included here, since
> that account can create and manage all other users — it will be shared
> separately with the evaluator if needed.
> Bootstrap the admin account via SQL as above, then create these two
>  through the `/admin` panel:


| Role | Email | Password |
|---|---|---|
| Admin | admin@company.com | set during bootstrap |
| Employer | priya@company.com | priya@123 | set via admin panel |
| Virtual HR | bob.hr@company.com | bob@123 | set via admin panel |


## Platforms used

| Layer | Platform |
|---|---|
| Frontend hosting | Vercel |
| Backend hosting | Render |
| Database | FreeSQLDatabase |
| Repository | GitHub |


## Tech stack

- **Backend**: FastAPI (async), SQLAlchemy (async), MySQL
- **Auth**: JWT tokens (60-minute expiry), bcrypt-hashed passwords,
  role-based route guards enforced on every endpoint
- **Frontend**: Next.js (App Router), Tailwind CSS v4
- **Real-time updates**: polling every 4 seconds (see "Known limitations")

## Features

- Role-based login: Employer, Virtual HR, and Admin, each with their own
  dashboard — visiting the wrong dashboard's URL redirects you to your own
- Employer: assign tasks to a Virtual HR user, see live task status and a
  visual breakdown (pending / in progress / completed)
- Virtual HR: update task status via an inline control, schedule interviews
  with a candidate name, time, and mode (voice/video/chat placeholder)
- Both dashboards show scheduled interviews relevant to them
- Admin panel: create new users and assign roles without touching SQL

## Project structure

```
IT_Assessment/
├── backend/
│   ├── main.py           API routes
│   ├── model.py          SQLAlchemy models
│   ├── schema.py         Pydantic request/response schemas
│   ├── database.py       Async DB connection setup
│   ├── auth.py           Password hashing, JWT tokens, role guards
│   ├── hash_password.py  One-off script to hash a password for seeding
│   ├── requirements.txt
│   └── .env              (not committed — see setup below)
└── frontend/
    ├── app/
    │   ├── login/         Login page
    │   ├── employer/      Employer dashboard
    │   ├── virtual-hr/    Virtual HR dashboard
    │   └── admin/         Admin panel (create/list users)
    ├── components/        Shared UI: header, stats, task list, interview
    │                      list, modal
    ├── lib/               API client (attaches auth token) + session helpers
    └── .env.local         (not committed — see setup below)
```

## Backend setup

1. Create a virtual environment and install dependencies:
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate      # Windows
   source .venv/bin/activate   # macOS/Linux
   pip install -r requirements.txt
   ```

2. Create the MySQL database and a dedicated app user:
   ```sql
   CREATE DATABASE salarite_hr;
   CREATE USER 'salarite_app'@'localhost' IDENTIFIED BY 'yourpassword';
   GRANT ALL PRIVILEGES ON salarite_hr.* TO 'salarite_app'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. Create `backend/.env`:
   ```
   DATABASE_URL=mysql+aiomysql://salarite_app:yourpassword@localhost:3306/salarite_hr
   SECRET_KEY=replace-with-a-long-random-string
   ```

4. Start the server (this auto-creates all tables on first run):
   ```bash
   uvicorn main:app --reload
   ```
   Visit `http://127.0.0.1:8000/docs` to confirm it's running.

5. Bootstrap your first admin user. Passwords are hashed, so generate one first:
   ```bash
   python hash_password.py
   ```
   Then insert the admin directly (this is the only time you'll need raw SQL
   for a user):
   ```sql
   INSERT INTO users (name, email, password_hash, role, created_at)
   VALUES ('Admin', 'admin@company.com', 'PASTE_HASH_HERE', 'admin', NOW());
   ```
   Log in as admin through the app and create the Employer and Virtual HR
   demo users from the `/admin` page.

## Frontend setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Create `frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. Run the dev server:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` — it redirects to `/login`.



## API overview

| Method | Route | Role required |
|---|---|---|
| POST | `/auth/login` | none |
| GET | `/users/virtual-hr` | employer |
| POST | `/tasks` | employer |
| GET | `/tasks` | employer, virtual_hr, admin (self-filtered by token) |
| PATCH | `/tasks/{id}/status` | virtual_hr (own tasks only) |
| POST | `/interviews` | virtual_hr |
| GET | `/interviews` | employer, virtual_hr, admin (self-filtered by token) |
| POST | `/admin/users` | admin |
| GET | `/admin/users` | admin |

Every protected route reads the caller's identity and role from their JWT
token — never from a client-supplied query param or body field — so no
route can be tricked by editing a URL or request payload.

## Known limitations

- **Token expiry is 60 minutes.** Sessions are short by design for this
  demo; expect to log back in if you pause for more than 10 minutes between
  actions. Adjust `ACCESS_TOKEN_EXPIRE_MINUTES` in `backend/auth.py` if a
  longer demo session is preferred.
- Real-time updates use polling (every 4s) rather than WebSockets — chosen
  for reliability within the assignment's time limit; both are acceptable
  per the assignment brief.
- Interview scheduling is a placeholder — no real voice/video/chat calling
  is implemented, matching the assignment's "inbuilt calling placeholder"
  requirement.
- CORS is set to `allow_origins=["*"]` for development; restrict this to
  the deployed frontend's exact URL in production.
- No refresh-token flow — once a token expires, the user must log in again;
  sufficient for a demo, not for a production system.

## Deployment

- **Backend** → deployed on Render. Root directory `backend`, build command
  `pip install -r requirements.txt`, start command
  `uvicorn main:app --host 0.0.0.0 --port $PORT`. `DATABASE_URL` and
  `SECRET_KEY` are set as environment variables in Render's dashboard
  (never committed as `.env`).
- **Frontend** → deployed on Vercel. Root directory `frontend`,
  `NEXT_PUBLIC_API_URL` set as an environment variable pointing at the live
  Render backend URL.
- **Database** → hosted on FreeSQLDatabase (free MySQL, 30-day trial per
  database). If this project is evaluated after that window, a fresh
  database can be created there and the connection details updated in
  Render's environment variables.
