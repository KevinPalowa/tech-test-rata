# Mini Clinic Management System

A web-based clinic management system built with React, TypeScript, Apollo Client, and a standalone Node.js GraphQL server backed by SQLite.

## Features

- **Fully Responsive UI**: Optimized for Mobile, Tablet, and Desktop with a premium aesthetic and glassmorphism elements.
- **Patient Management**: Complete CRUD with pagination support (6 patients per page) and real-time search.
- **Appointment Management**: Schedule and manage appointments with a custom-built, animated confirmation modal for deletions.
- **Calendar View**: Visual representation of appointments in Daily, Weekly (with horizontal scroll), and Monthly modes.
- **Smart Data Sync**: Intelligent caching and auto-refetching (cache-and-network) ensuring all views stay in sync.
- **Persistent Storage**: Data is stored and managed via a local SQLite database using Knex.js.

## Architecture

- **Frontend**: Vite + React + TypeScript + Apollo Client + Tailwind CSS
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

## Building for Production

### Frontend Application

To build the TypeScript frontend for production optimization:

```bash
npm run build
```

The build artifacts will be generated in the `dist` directory. These static files can be served by any web server (Nginx, Apache, Vercel, Netlify, etc.).

To preview the production build locally:

```bash
npm run preview
```

### Backend Server

The backend is a Node.js application running JavaScript, so it **does not require a build step** (no transpilation or compilation needed).

To run the backend in a production environment:

```bash
cd server
npm start
```

---

## Database Schema

The SQLite database (`server/database/dev.sqlite3`) contains the following tables:

- `patients`: Core patient data (name, DOB, gender, phone, address, allergies, tags, notes).
- `appointments`: Scheduled visits linked to patients.
- `workflow_steps`: Configuration for the clinic's workflow phases.

## Development

- **Server Logic**: Resolvers and schema are located in `server/resolvers.js` and `server/schema.js`.
- **Frontend Logic**: GraphQL queries and mutations are in `src/graphql/documents.ts`.
- **Apollo Setup**: Configured in `src/graphql/apolloClient.ts`.
