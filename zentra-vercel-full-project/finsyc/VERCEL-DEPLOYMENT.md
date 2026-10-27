# Zentra deployment notes

## Frontend on Vercel
1. Upload this project to a Git repository (recommended) or import the repository in Vercel.
2. Set the Vercel project root directory to `finsyc` if the repository contains this folder at its root; if the repository root itself is this folder, leave Root Directory as `./`.
3. Build command: `npm run build`; output directory: `dist`. The included `vercel.json` configures these values.
4. The frontend defaults to `/api` for local development (Vite proxies this to `http://localhost:4000`). For production, set the environment variable `VITE_API_BASE` to your separately hosted backend base URL including `/api`, for example `https://your-backend-host.example/api`.

## Backend deployment requirement
The Express backend in `backend/` uses MySQL and is a normal Node server. The frontend deployment on Vercel does not automatically deploy or run this backend or your local MySQL database. Deploy `backend/` to a Node-compatible host and use a remotely accessible MySQL database. Configure the backend environment variables there (`PORT`, `CLIENT_ORIGIN`, `JWT_SECRET`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`). Set `CLIENT_ORIGIN` to the deployed Vercel site URL. Import `backend/database/schema.sql` into the remote database. Never upload a real `.env` or database password to Git/Vercel.

## Local development
- Terminal 1: `cd backend`, `npm install`, configure `backend/.env`, then `npm run dev`.
- Terminal 2 (project root): `npm install`, then `npm run dev`.
- Local Vite proxy routes `/api` to `http://localhost:4000`.

## Important
The archive includes source code and deployment configuration, not `node_modules`, build output, or secrets. Run `npm install` on the target environment.
