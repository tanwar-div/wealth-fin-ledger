# FinLedger — Personal Finance & Habit Analytics Platform

A full-stack MERN application that unifies **money tracking** and **habit building** in one place: log income and expenses, track assets and liabilities, set savings goals, build financial habits with streaks, and watch net worth grow across a 12-month analytics dashboard.

<p>
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue">
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Demo Accounts](#demo-accounts)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Implementation Highlights](#implementation-highlights)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

Most finance apps tell you *what* you spent. FinLedger also tracks *whether you kept the behaviour that got you there* — the habit engine and the ledger share one dashboard, so a savings streak and a net-worth curve sit side by side.

**What it does:**

- Tracks income and expenses with category filtering and monthly breakdowns
- Maintains a balance sheet of assets and liabilities to compute real net worth
- Runs daily / weekly / monthly habit streaks with gap detection and best-streak records
- Aggregates everything into a 12-month analytics view (net worth, cash flow, savings curve, category splits)
- Ships a role-gated admin console for user management and platform KPIs

**Scale:** 36 REST endpoints · 9 resource modules · 7 Mongoose models · 21+ React components across 10 pages.

---

## Features

### Money

- **Income tracker** — 7 source types (Salary, Freelance, Scholarship, Investments, Gifts, Business, Other) with date-range and source filters
- **Expense tracker** — 9 categories with month/year, category, and min/max-amount filters; server returns running totals and per-category rollups with every query
- **Net worth** — assets and liabilities across Cash, Mutual Funds, Stocks, Gold, Crypto, Property; net worth = savings + assets − liabilities
- **Savings goals** — target vs. current amount, deadline, live progress percentage, and automatic transition to `completed` when a goal is funded

### Habits

- **Frequency-aware streaks** — daily, weekly, or monthly habits, each normalised to its own period boundary
- **Gap detection** — a streak only extends when the previous completion lands in exactly the preceding period; otherwise it resets to 1
- **Idempotent completions** — marking the same period twice is a no-op, not a double count
- **Best-streak records** kept alongside the current streak

### Analytics

- 12-month rolling time series for net worth growth, savings growth, and monthly cash flow
- Category and source breakdowns for expenses and income
- Four interactive chart types (area, bar, line, pie) rendered with Recharts
- The entire analytics page is served by **one** API call

### Platform

- JWT authentication with httpOnly cookie + Bearer token fallback
- Role-based access control (`user` / `admin`) with per-document ownership checks on every mutating route
- Account suspension — suspended users are rejected at the auth middleware, not in the UI
- In-app feedback with an admin triage queue (`open` → `in_progress` → `resolved`)
- Admin KPI dashboard: total users, 30-day active users, transactions tracked, active habits, open feedback

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, React Router 6, React Hook Form, Tailwind CSS 3, Recharts, Axios, Lucide icons, Vite 5 |
| **Backend** | Node.js, Express 4, express-async-handler, express-validator, Morgan |
| **Database** | MongoDB, Mongoose 8 (schema validation, compound indexes, aggregation pipelines) |
| **Auth & Security** | JSON Web Tokens, bcryptjs, httpOnly/SameSite cookies, CORS allowlist |
| **Tooling** | npm, nodemon, ESLint, PostCSS, Autoprefixer |
| **Deployment** | Vercel (client, SPA rewrites) · any Node host (server) · MongoDB Atlas |

---

## Architecture

The backend follows a strict **route → validator → controller → model** flow. Routes never touch the database; controllers never parse requests.

```
wealth-fin-ledger/
├── client/                      # React + Vite SPA
│   └── src/
│       ├── components/          # Layout, Sidebar, Modal, StatCard, StreakStrip, route guards…
│       ├── context/             # AuthContext — session state, login/register/logout
│       ├── pages/               # Dashboard, Income, Expenses, Habits, Goals, Analytics, Admin, Auth
│       ├── services/api.js      # Axios instance + interceptors, one typed module per resource
│       └── App.jsx              # Router with ProtectedRoute / AdminRoute guards
│
└── server/                      # Express REST API
    ├── config/db.js             # MongoDB connection
    ├── controllers/             # Business logic (9 modules)
    ├── middleware/              # auth (JWT), admin (RBAC), validateRequest, errorHandler
    ├── models/                  # 7 Mongoose schemas
    ├── routes/                  # Endpoint definitions + express-validator chains
    ├── seed/seedData.js         # Realistic demo dataset
    ├── utils/                   # streak.js (pure streak engine), generateToken.js
    └── server.js                # App wiring, CORS allowlist, health check
```

**Request lifecycle**

```
Client → Axios (attaches JWT)
       → CORS allowlist
       → express-validator chain  ──✗──►  400 { success: false, message }
       → protect (JWT verify, load user, reject suspended)
       → admin (role check, admin routes only)
       → controller (ownership check → Mongoose)
       → errorHandler  ──►  normalized JSON for every failure path
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A MongoDB instance (local `mongod` or a free MongoDB Atlas cluster)

### 1. Clone

```bash
git clone https://github.com/tanwar-div/wealth-fin-ledger.git
cd wealth-fin-ledger
```

### 2. Backend

```bash
cd server
npm install
cp .env.example .env      # then fill in MONGO_URI and JWT_SECRET
npm run seed              # optional: load demo data
npm run dev               # http://localhost:5000
```

Verify it's up: `curl http://localhost:5000/api/health`

### 3. Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev               # http://localhost:5173
```

### Available scripts

| Location | Command | Description |
|---|---|---|
| `server` | `npm run dev` | Start the API with nodemon hot-reload |
| `server` | `npm start` | Start the API in production mode |
| `server` | `npm run seed` | Wipe and repopulate the database with demo data |
| `server` | `npm run seed:destroy` | Wipe all collections |
| `client` | `npm run dev` | Vite dev server |
| `client` | `npm run build` | Production bundle to `dist/` |
| `client` | `npm run preview` | Preview the production build |
| `client` | `npm run lint` | ESLint |

---

## Environment Variables

**`server/.env`**

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGO_URI` | ✅ | — | MongoDB connection string |
| `JWT_SECRET` | ✅ | — | Secret used to sign JWTs — use a long random string |
| `JWT_EXPIRES_IN` | — | `7d` | Token lifetime |
| `PORT` | — | `5000` | API port |
| `NODE_ENV` | — | `development` | `production` enables secure cookies and hides stack traces |
| `CLIENT_URL` | — | `http://localhost:5173` | Comma-separated CORS allowlist |

**`client/.env`**

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | — | `http://localhost:5000/api` | Base URL of the API |

---

## Demo Accounts

Available after running `npm run seed`:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@fhb.com` | `Admin@123` |
| User | `demo@fhb.com` | `Demo@1234` |

The demo user comes preloaded with a year of income and expense history, assets and liabilities, active habits with streaks, and in-progress savings goals — enough to populate every chart.

---

## API Reference

Base URL: `/api` · All routes except `register`, `login`, and `health` require a JWT.

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Create an account, returns a JWT |
| `POST` | `/login` | Public | Authenticate, returns a JWT |
| `POST` | `/logout` | Private | Clear the auth cookie |
| `GET` | `/me` | Private | Current user profile |
| `PUT` | `/me` | Private | Update name, currency, monthly income target |

### Income — `/api/income`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List income (filters: `source`, `month`, `year`) with totals |
| `POST` | `/` | Add an income record |
| `PUT` | `/:id` | Update an income record (owner only) |
| `DELETE` | `/:id` | Delete an income record (owner only) |

### Expenses — `/api/expenses`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List expenses (filters: `month`, `year`, `category`, `minAmount`, `maxAmount`) with totals and per-category rollups |
| `POST` | `/` | Add an expense |
| `PUT` | `/:id` | Update an expense (owner only) |
| `DELETE` | `/:id` | Delete an expense (owner only) |

### Habits — `/api/habits`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List habits with current and best streaks |
| `POST` | `/` | Create a habit (`daily` / `weekly` / `monthly`) |
| `PATCH` | `/:id/complete` | Mark the current period complete and recompute the streak |
| `PATCH` | `/:id/skip` | Undo the most recent completion |
| `PUT` | `/:id` | Update title, frequency, or active state |
| `DELETE` | `/:id` | Delete a habit |

### Savings Goals — `/api/goals`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List goals with computed progress percentage |
| `POST` | `/` | Create a goal |
| `PUT` | `/:id` | Update or contribute towards a goal — auto-completes when funded |
| `DELETE` | `/:id` | Delete a goal |

### Assets — `/api/assets`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List assets and liabilities |
| `POST` | `/` | Add an asset or liability |
| `PUT` | `/:id` | Update an entry (owner only) |
| `DELETE` | `/:id` | Delete an entry (owner only) |

### Dashboard — `/api/dashboard`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Summary totals, net worth, current-month figures, recent activity, goal progress |
| `GET` | `/analytics` | 12-month net worth / savings / cash-flow series plus category breakdowns |

### Feedback — `/api/feedback`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Submit feedback |

### Admin — `/api/admin` *(role: `admin`)*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/users` | List all users |
| `PATCH` | `/users/:id/status` | Suspend or reactivate a user |
| `DELETE` | `/users/:id` | Delete a user account |
| `GET` | `/stats` | Platform KPIs via aggregation pipelines |
| `GET` | `/feedback` | Feedback queue |
| `PATCH` | `/feedback/:id` | Update feedback status |

### Response shape

Every endpoint returns a consistent envelope:

```jsonc
// success
{ "success": true, "data": { /* … */ } }

// failure — from the centralized error handler
{ "success": false, "message": "Not authorized to modify this record" }
```

---

## Data Models

| Model | Key fields | Notes |
|---|---|---|
| **User** | `name`, `email`, `password`, `role`, `currency`, `monthlyIncomeTarget`, `status` | Password auto-hashed on save via a pre-save hook; excluded from queries by default (`select: false`) |
| **Income** | `userId`, `source`, `amount`, `date`, `notes` | Enum-validated source; indexed on `(userId, date)` |
| **Expense** | `userId`, `category`, `amount`, `date`, `description` | Compound indexes on `(userId, date)` and `(userId, category)` |
| **Asset** | `userId`, `type`, `name`, `value`, `isLiability` | One schema serves both sides of the balance sheet |
| **Habit** | `userId`, `title`, `frequency`, `currentStreak`, `bestStreak`, `completedDates[]` | Streaks are derived, never client-supplied |
| **SavingsGoal** | `userId`, `goalName`, `targetAmount`, `currentAmount`, `deadline`, `status` | Auto-completes when `currentAmount >= targetAmount` |
| **Feedback** | `userId`, `message`, `status` | Admin triage workflow |

---

## Implementation Highlights

<details>
<summary><b>Frequency-aware streak engine</b> — <code>server/utils/streak.js</code></summary>

<br>

Streak logic lives in pure, dependency-free functions with no knowledge of Mongoose or Express, so it can be reasoned about and tested in isolation.

Every completion date is normalised to the start of its period — day, week (Sunday), or month — before comparison. A streak extends only when the previous completion falls in *exactly* the preceding period; any gap resets it to 1. Completing the same period twice returns early instead of inflating the count, which makes the endpoint idempotent for a given period.

</details>

<details>
<summary><b>Single-call analytics aggregation</b> — <code>server/controllers/dashboardController.js</code></summary>

<br>

`GET /api/dashboard/analytics` fetches income, expense, and asset collections in parallel with `Promise.all`, then builds twelve month-buckets and folds every record into them via an index map — an O(n) pass rather than twelve filtered scans.

From those buckets it derives a running net-worth curve, a cumulative savings curve, monthly cash flow, and category/source breakdowns, returning all five datasets in one response. The Analytics page renders four chart types from a single request.

</details>

<details>
<summary><b>Layered authentication and authorization</b> — <code>server/middleware/</code></summary>

<br>

Tokens are read from an `Authorization: Bearer` header or an httpOnly cookie, so the API works for both browser and non-browser clients. `protect` verifies the signature, reloads the user (so a deleted or suspended account is rejected immediately rather than at token expiry), and attaches it to the request. `admin` gates the admin router at the router level with `router.use(protect, admin)`.

Authorization does not stop at roles: every mutating controller re-checks that the document's `userId` matches the requester before writing, so an authenticated user cannot touch another user's records by guessing an ObjectId.

</details>

<details>
<summary><b>Centralized error contract</b> — <code>server/middleware/errorHandler.js</code></summary>

<br>

Controllers are wrapped in `express-async-handler` and simply `throw`. A single error middleware translates Mongoose `CastError`, duplicate-key (`11000`), and `ValidationError` failures — plus JWT errors — into clean, human-readable JSON with the right status code, and suppresses stack traces in production.

On the client, one Axios response interceptor unwraps that envelope into `err.message`, so every component handles failures the same way without its own parsing logic.

</details>

<details>
<summary><b>Validation at the edge</b> — <code>server/routes/</code></summary>

<br>

`express-validator` chains sit on the routes themselves, ahead of any controller. A shared `validateRequest` middleware short-circuits with a 400 and the first readable message when a rule fails, which keeps controllers free of defensive input checks and guarantees a uniform validation error shape.

</details>

---

## Roadmap

- [ ] Jest + Supertest integration suite across the API (`server.js` already exports `app` for this)
- [ ] `helmet` and `express-rate-limit` on authentication routes
- [ ] Recurring transactions and budget envelopes with threshold alerts
- [ ] CSV / PDF export of statements and analytics
- [ ] Cursor pagination on transaction lists
- [ ] Dockerised local setup and a CI workflow

---

## License

Released under the [MIT License](LICENSE).

---

<p align="center">Built by <a href="https://github.com/tanwar-div">Divyanshu Tanwar</a></p>
