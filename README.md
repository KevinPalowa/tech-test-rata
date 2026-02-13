# Mini Clinic Management System

A web-based clinic management system built with React, Apollo Client, and a standalone Node.js GraphQL server backed by SQLite.

## Features

- **Fully Responsive UI**: Optimized for Mobile, Tablet, and Desktop with a premium aesthetic.
- **Patient Management**: Add, view, and edit patient profiles.
- **Appointment Management**: Schedule, update, and delete patient appointments.
- **Calendar View**: Visual representation of appointments in Daily, Weekly (with horizontal scroll), and Monthly modes.
- **Real-time Updates**: Automatically refetches data after mutations to keep the UI in sync.
- **Persistent Storage**: Data is stored in a local SQLite database.

## Architecture

- **Frontend**: Vite + React + Apollo Client + Tailwind CSS
- **Backend**: Node.js + Apollo Server + Knex.js
- **Database**: SQLite3

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- npm

### 1. Installation

Install dependencies for both the root project and the backend server:

```bash
# Install root (and frontend) dependencies
npm install

# Install backend dependencies
cd server && npm install
cd ..
```

### 2. Database Initialization (Optional)

The database is pre-seeded, but you can reset it anytime:

```bash
cd server
npm run db:reset
cd ..
```

### 3. Start Development Environment

Run both the GraphQL server and the Vite frontend concurrently with a single command:

```bash
npm run dev
```

- **Frontend**: `http://localhost:5173/`
- **Backend (GraphQL)**: `http://localhost:4000/`

---

## Database Schema

The SQLite database (`server/database/dev.sqlite3`) contains the following tables:

- `patients`: Core patient data (name, DOB, gender, phone, address, etc.).
- `appointments`: Scheduled visits linked to patients.
- `visits`: Historical medical visit records for patients.
- `workflow_steps`: Configuration for the clinic's workflow phases.

## Development

- **Server Logic**: Resolvers and schema are located in `server/resolvers.js` and `server/schema.js`.
- **Frontend Logic**: GraphQL queries and mutations are in `src/graphql/documents.js`.
- **Apollo Setup**: Configured in `src/graphql/client.js`.
