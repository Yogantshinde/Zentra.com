# Zentra frontend integration

This update wires the existing landing page's header and hero CTA buttons to a signup/login modal, then displays a finance dashboard after authentication. The dashboard calls the existing Express API for summary and transactions, and lets the signed-in user add or delete transactions.

## Apply to your existing project

1. Keep your existing `backend/.env` file; do not overwrite it with the example file.
2. Copy the updated `src/App.tsx` into your project's `src/App.tsx`.
3. Copy the updated `src/components/templates/finance-management-landing-page-finsyc/Header 01 Finsyc.tsx` into the matching file in your project.
4. Ensure the backend is running in one terminal:
   ```powershell
   cd C:\Users\Fujitsu\Downloads\zentra-backend-ready\finsyc\backend
   npm run dev
   ```
5. In a second terminal, run the frontend from the project root:
   ```powershell
   cd C:\Users\Fujitsu\Downloads\zentra-backend-ready\finsyc
   npm install
   npm run dev
   ```
6. Open `http://localhost:5173/`, click **Get Started**, create an account with a valid email and password (at least 8 characters), then add an income or expense from the dashboard.

The Vite config proxies `/api` to `http://localhost:4000`. The frontend stores the JWT in browser localStorage. This is a local development implementation; for production, use secure HttpOnly cookies and review the deployment security configuration.
