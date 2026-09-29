# BillFlow

BillFlow is a bill and customer management application built for tracking invoices, monitoring payment status, and managing client information in a single dashboard. The project combines a React + Vite frontend with an Express + PostgreSQL backend.

## Features

- User registration and login
- Dashboard overview with summary cards and revenue trends
- Bill management with add, delete, and payment-status updates
- Customer management with billing totals
- PostgreSQL-backed persistence for users, bills, and customers
- Responsive UI built with React and Tailwind CSS

## Tech Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express.js
- Database: PostgreSQL
- Testing: Node.js built-in test runner

## Project Structure

```bash
.
├── billflow_db/
│   ├── database/
│   │   └── schema.sql
│   ├── routes/
│   │   └── auth.js
│   ├── server/
│   │   ├── index.js
│   │   ├── inspect-data.js
│   │   └── inspect-db.js
│   └── package.json
├── src/
│   ├── components/
│   ├── data/
│   ├── pages/
│   ├── App.tsx
│   ├── auth.ts
│   ├── index.css
│   ├── main.tsx
│   ├── types.ts
│   └── vite-env.d.ts
├── tests/
│   └── auth-flow.test.js
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── README.md
└── .gitignore
```

## Prerequisites

Before running the project, make sure you have:

- Node.js 18+ or later
- pnpm (recommended) or npm
- PostgreSQL installed and running locally
- A database created for the app

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Bill-Management-System
```

2. Install frontend dependencies:

```bash
npm install
```

3. Install backend dependencies in the database server folder:

```bash
cd billflow_db
pnpm install
cd ..
```

## Database Setup

Create a PostgreSQL database and then add the connection string in a `.env` file inside `billflow_db/server/`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/billflow
PORT=5000
```

Then initialize the schema:

```bash
psql -U postgres -d billflow -f billflow_db/database/schema.sql
```

If needed, you can also use the server-side schema initialization in `billflow_db/server/index.js`, which creates the required tables automatically when the app starts.

## Running the App

### Start the backend API

```bash
npm run server
```

This runs the Express server on port `5000` by default.

### Start the frontend

In a separate terminal:

```bash
npm run dev
```

The Vite app will run on the default port `4173` and can be opened in the browser.

## Available Scripts

From the project root:

```bash
npm run dev      # run the frontend dev server
npm run build    # build the production bundle
npm run preview  # preview the built app
npm run server   # start the backend API
npm run start    # alias for the backend server
npm run test     # run Node.js tests
npm run format   # format TypeScript code with oxfmt
```

## Authentication Flow

The app supports a basic user flow where users can:

- register with name, email, and password
- log in with their email and password
- have their data scoped by user ID in the backend

The frontend stores the active session in local storage and uses the stored user ID to fetch the user-specific bills and customers.

## Notes

- The frontend falls back to a local API URL if the environment variable is missing.
- Some backend data reads and writes are guarded by the `x-user-id` header for user isolation.
- The app is structured for a field project / academic dashboard-style billing system and can be extended with additional features such as invoice PDFs, reports, exporting, and role-based access.

## License

This project is provided as a project/workshop application and may be used for learning and development purposes.
