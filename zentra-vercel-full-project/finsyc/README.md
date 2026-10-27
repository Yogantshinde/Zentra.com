# Zentra — Finance landing page + backend

This project contains the original React + Vite + Tailwind frontend and a new Express + MySQL backend. The landing page design is preserved; the newsletter subscription form now submits to the backend.

## Requirements
- Node.js 20+ and npm
- MySQL 8+ (XAMPP's MySQL/MariaDB may also work)

## 1. Set up the database
Open MySQL Workbench/phpMyAdmin or the MySQL terminal and run `backend/database/schema.sql`.

CLI example from the project root (adjust credentials if needed):

```bash
mysql -u root -p < backend/database/schema.sql
```

## 2. Configure and run backend
Open a terminal in the project root:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and update the values. Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Set `JWT_SECRET` to a long random string of at least 32 characters and update your MySQL username/password. Then run:

```bash
npm run dev
```

The API runs at `http://localhost:4000`. Health check: `http://localhost:4000/api/health`.

## 3. Run frontend
Open a second terminal at the project root:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` calls to the backend at port 4000.

## API routes
All request/response bodies are JSON.

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | No | API and database health |
| POST | `/api/auth/register` | No | Create account: `{ "name", "email", "password" }` |
| POST | `/api/auth/login` | No | Login: `{ "email", "password" }` |
| GET | `/api/auth/me` | Bearer token | Current user profile |
| GET | `/api/dashboard/summary` | Bearer token | Income, expenses, balance, recent transactions |
| GET | `/api/transactions` | Bearer token | List the signed-in user's transactions |
| POST | `/api/transactions` | Bearer token | Add income/expense transaction |
| DELETE | `/api/transactions/:id` | Bearer token | Delete own transaction |
| POST | `/api/newsletter` | No | Save newsletter email; connected to landing-page Subscribe form |
| POST | `/api/contact` | No | Save a contact message |

### Example transaction body
```json
{
  "type": "expense",
  "title": "Groceries",
  "category": "Food",
  "amount": 850.50,
  "transaction_date": "2026-10-27",
  "notes": "Weekly shopping"
}
```

### Authenticated request example
```http
Authorization: Bearer YOUR_TOKEN
```

## Notes
- Passwords are hashed with bcrypt; they are never returned by the API.
- The backend uses parameterized SQL queries, JWT auth, Helmet, CORS, JSON size limits, and rate limiting.
- This is a starter backend, not a bank/payment processor. Do not store card PINs, CVVs, banking passwords, or real payment credentials. Before public production deployment, add email verification, password reset, monitoring, backups, HTTPS, and a reviewed secrets policy.
- The existing landing page is a marketing site; dashboard APIs are included for a future authenticated finance dashboard. Those dashboard APIs are not yet presented as new frontend pages.
