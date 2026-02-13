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

### 1. Set Up the Backend

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. The migrations and seeds are already set up, but you can reset the database if needed:
   ```bash
   npx knex migrate:latest
   npx knex seed:run
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The backend will be running at `http://localhost:4000/`.

### 2. Set Up the Frontend

1. Go back to the root directory:
   ```bash
   cd ..
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173/`.

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
