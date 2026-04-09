# Web App Usage Guide

This guide explains how to use the web app in two contexts:

1. Developer workflow
2. End-user workflow on a local computer

---

# Overview

This project is a local monorepo application with:

- **Renderer backend**: Node.js/Express app in `apps/renderer`
- **Web frontend**: Next.js app in `apps/web`
- **Shared packages**: reusable code in `packages/*`
- **MySQL**: required for database-backed features
- **Storage**: local assets and render outputs in `/storage`

The app is intended to run on a **local machine**, not on a hosted production server.

---

# For Developers

## Prerequisites

Install these first:

- **Node.js** and **npm**
- **MySQL** with the Windows service name `MySQL80`
- Project dependencies installed from the monorepo root

## First-time setup

From the repository root:

```bash
npm install
```

Make sure MySQL is installed and the `MySQL80` service exists.

## Development mode

To run both apps in development mode:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:renderer
npm run dev:web
```

### What these do

- `dev:renderer` starts the backend with hot-reload/dev tooling
- `dev:web` starts the Next.js frontend in development mode

## Build for local production

When testing the local production version:

```bash
npm run build:prod
```

This runs:

- TypeScript project build for shared packages and backend
- Next.js production build for the frontend

## Start local production mode

After building:

```bash
npm run start:renderer
npm run start:web
```

Or use the provided batch scripts on Windows.

## Recommended developer batch files

### Rebuild and start everything
Use this when code changed and you want a fresh local production run:

- `run-build-start.bat`

### Start already-built app
Use this when the code has already been built:

- `run-start.bat`

## Developer notes

- Shared packages are consumed as workspace packages, not by importing folder paths directly
- Imports should use package names such as:
  - `@hiwave/db`
  - `@hiwave/config`
  - `@hiwave/templates`
- TypeScript builds are handled with `tsc -b`
- The frontend runs on port `3000`
- The backend runs on port `4000`

## Troubleshooting

### Package import errors
Make sure:

- `npm install` was run from the repo root
- package names in imports match the `name` field in each package's `package.json`
- the package exports the required symbol from its main `index.ts`

### Node built-in module type errors
If `path`, `process`, `fs`, or similar fail in TypeScript, verify that the package/app `tsconfig.json` includes:

```json
"types": ["node"]
```

### Backend does not start
Check that:

- MySQL is running
- the database connection settings are correct
- `npm run build:prod` completed successfully

### Frontend does not start
Check that:

- the backend started first
- port `3000` is free
- `next build` completed successfully

---

# For End Users

## What this app does

This app runs locally on your computer and opens two parts behind the scenes:

- the backend service
- the web interface

You do not need to start each one manually.

## Before using the app

Make sure:

- the application files are already installed on your computer
- MySQL is installed and available on the machine
- the app has already been built by the developer, or you were given the batch files that rebuild it automatically

## Easiest way to use it

Double-click:

- `run-build-start.bat`

Use this when the developer gave you a new version or after updates were made.

## Faster startup option

Double-click:

- `run-start.bat`

Use this when the app was already built and no code changes were made.

## What happens when you run the batch file

The launcher will:

1. Start MySQL
2. Start the backend service
3. Wait until the backend is ready
4. Start the web app

## How to open the app

After startup, open this in your browser:

```text
http://127.0.0.1:3000
```

## Important notes for end users

- Keep the command windows open while using the app
- Closing those windows will stop the app
- The app is meant to run only on this computer unless a developer changes the setup

## Common issues

### Nothing opens in the browser
Wait a few more seconds, then open:

```text
http://127.0.0.1:3000
```

### A command window shows errors
Send the error text or a screenshot to the developer.

### The app worked before but not now
Try this:

1. Close all app windows
2. Run `run-build-start.bat` again

### MySQL permission popup appears
This can happen because the script may request elevated permissions to start the MySQL service.

---

# Recommended Windows Batch Files

## Rebuild and start local production

- `run-build-start.bat`

Use when:
- code changed
- a new version was received
- you want the safest restart path

## Start local production without rebuilding

- `run-start.bat`

Use when:
- the current build is already up to date
- you only want to relaunch the app

---

# Recommended Daily Usage

## Developer
- use `npm run dev` during active development
- use `run-build-start.bat` for local production testing

## End user
- use `run-start.bat` for normal daily use
- use `run-build-start.bat` after updates or when instructed

---

# Ports

Default local ports:

- Frontend: `3000`
- Backend: `4000`

Frontend URL:

```text
http://127.0.0.1:3000
```

---

# Support Checklist

Before reporting an issue, confirm:

- MySQL is running
- the batch file was launched successfully
- the command windows remain open
- the browser was opened at `http://127.0.0.1:3000`

If an error appears, capture the full message and share it with the developer.