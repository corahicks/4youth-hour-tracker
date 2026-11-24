# 4Youth Hour Tracker

A full-stack web app for tracking employee hours at 4Youth, a nonprofit delivering STEAM programming to K–8 students across schools in Wilmington, Delaware.

Two roles: **employee** and **admin**.

---

## Stack

**Backend**
- Node.js (ES modules)
- Express
- Supabase (PostgreSQL)
- bcryptjs, jsonwebtoken

**Frontend**
- React (Vite)
- React Router DOM
- CSS custom properties (design tokens)

---

## Database Schema

6 tables in Supabase:

| Table | Purpose |
|---|---|
| `institutions` | Schools and studio locations |
| `users` | Employee accounts with role and hourly rate |
| `pay_rates` | Instructional and paid hours per institution, season, and program type |
| `pay_periods` | Date ranges used to group worklogs for payroll |
| `schedules` | Assigned shifts per employee per institution |
| `worklogs` | Attendance records and extra hours submissions |

`pay_rates` supports three program types: `we_rise`, `after_care`, `studio`.  
Studio worklogs include `start_time` and `end_time`; other program types leave these null.  
`schedule_id` on worklogs is nullable — extra hours submissions are not tied to a scheduled shift.

---

## What's Built

### Auth
- `POST /api/auth/login` — returns JWT on valid credentials

### Middleware
- `verifyToken` — validates JWT on protected routes
- `requireAdmin` — blocks non-admin users with 403

### Employee Routes (`/api/employees`)
All routes require a valid JWT.

| Method | Path | Description |
|---|---|---|
| GET | `/my-schedule` | Logged-in employee's assigned schedule |
| GET | `/full-schedule` | All staff schedules |
| POST | `/confirm-attendance` | Mark a shift attended or absent |
| POST | `/submit-extra-hours` | Submit extra hours for admin approval (duplicate check on date + location + start time) |
| GET | `/worklogs` | Employee's worklogs, optional `?pay_period_id` filter |
| GET | `/pay-period-summary` | Worklogs and total approved hours for a pay period |
| GET | `/current-pay-period` | Active pay period for today's date |
| GET | `/pay-periods` | All pay periods, ordered most recent first |
| GET | `/institutions` | All institutions for form dropdowns |

### Admin Routes (`/api/admin`)
All routes require a valid JWT and admin role.

| Method | Path | Description |
|---|---|---|
| GET | `/worklogs` | All employee worklogs |
| PATCH | `/worklogs/:id` | Approve or deny a worklog |

### Frontend Pages
| Page | Route | Description |
|---|---|---|
| Login | `/` | Sign in with email and password |
| Employee Dashboard | `/dashboard` | Today's shift, attendance confirmation, pay period hours |
| Admin Dashboard | `/admin-dashboard` | Pending worklog approvals |
| My Hours | `/my-hours` | Worklog history with pay period dropdown |
| Submit Extra Hours | `/submit-extra-hours` | Form for studio employees to log hours |

### Frontend Components
- `Navbar` — shared header across all authenticated pages
- `PendingApprovalCard` — approve/deny card for admin dashboard
- `WorklogCard` — worklog display card with status dot
- `ProtectedRoute` — redirects unauthenticated users to login

---

## What's Next

- [ ] Logout button
- [ ] Auto-redirect to login on 401 (expired token)
- [ ] Scheduled shift duration on WorklogCard (join schedules → pay_rates)
- [ ] Admin: create/manage pay periods
- [ ] Invite flow — admin generates token, Nodemailer sends email
- [ ] Re-enable Supabase Row Level Security before deploy
- [ ] PDF pay period export

---

## Running Locally

**Backend:**
```bash
cd backend
node index.js
```

Requires a `.env` file with:
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
JWT_SECRET=
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Requires a `.env` file with:
```
VITE_API_URL=http://localhost:3000
```

See `frontend/.env.example` for reference.
