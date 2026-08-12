# 4Youth Hour Tracker

A backend API for tracking employee hours at 4Youth, a nonprofit delivering STEAM programming to K–8 students across schools in Wilmington, Delaware.

Two roles: **employee** and **admin**.

---

## Stack

- Node.js (ES modules)
- Express
- Supabase (PostgreSQL)
- bcryptjs, jsonwebtoken

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

---

## What's Built

### Auth
- `POST /api/auth/login` — returns a JWT on valid credentials

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
| POST | `/submit-extra-hours` | Submit extra hours for admin approval |
| GET | `/worklogs` | Employee's worklogs, optional `?pay_period_id` filter |
| GET | `/pay-period-summary` | Worklogs and total approved hours for a pay period |

### Admin Controller
Functions written for user management, schedule management, worklog status updates, and a PDF export placeholder. Routes not yet wired up.

---

## What's Next

- [ ] Create `routes/admin.js` and register in `index.js`
- [ ] User registration endpoint (currently users can only be created by an admin)
- [ ] Fix `getMyPayPeriodSummary` — `pay_period_id` filter not being applied
- [ ] PDF pay period export
- [ ] Re-enable Supabase Row Level Security before deploy
- [ ] Frontend

---

## Running Locally

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
