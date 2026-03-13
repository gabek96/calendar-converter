# 📅 Calendar Converter

A React app that converts Excel (.xlsx) and CSV spreadsheets into calendar files (.ics) that can be imported or subscribed to in Google Calendar, Apple Calendar, and Outlook.

---

## Features

- Upload `.xlsx`, `.xls`, or `.csv` files
- Auto-detects and maps columns (Title, Date, Start Time, End Time, Location, Description)
- Handles Excel serial date numbers automatically
- Exports a `.ics` file for download
- Supports Google Calendar import and `webcal://` subscribe links

---

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

---

## Setup

### 1. Create a Vite React project

```bash
npm create vite@latest calendar-converter -- --template react
cd calendar-converter
```

### 2. Install dependencies

```bash
npm install
npm install xlsx
```

### 3. Add the component

Copy `nsbe-calendar.jsx` (or `calendar-converter.jsx`) into the `src/` folder.

### 4. Update `src/main.jsx`

Replace the default import with:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import CalendarConverter from "./calendar-converter";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CalendarConverter />
  </React.StrictMode>,
);
```

### 5. Run the app

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

---

## Spreadsheet Format

Your spreadsheet should have the following columns (names don't need to be exact — you can remap them in the app):

| Column      | Required | Example                          |
| ----------- | -------- | -------------------------------- |
| Event Title | ✅       | General Body Meeting             |
| Date        | ✅       | 2025-03-15 or March 15, 2025     |
| Start Time  | ❌       | 6:00 PM                          |
| End Time    | ❌       | 8:00 PM                          |
| Location    | ❌       | Howe Hall 100                    |
| Description | ❌       | Come learn about upcoming events |

> **Note:** Excel serial date numbers (e.g. `45884`) are automatically converted to real dates.

---

## Deployment Options

### Option A — Web App (Vercel, free)

```bash
npm run build
npx vercel
```

Share the generated URL with anyone — no install needed.

### Option B — Desktop App (Electron)

Install Electron:

```bash
npm install --save-dev electron electron-builder concurrently wait-on
```

Create `electron.cjs` in the project root:

```js
const { app, BrowserWindow } = require("electron");

function createWindow() {
  const win = new BrowserWindow({ width: 1100, height: 800 });
  win.loadURL("http://localhost:5173");
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
```

Add to `package.json`:

```json
{
  "main": "electron.cjs",
  "scripts": {
    "electron:dev": "concurrently \"vite\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "vite build && electron-builder"
  },
  "build": {
    "appId": "com.yourname.calendar-converter",
    "productName": "Calendar Converter",
    "files": ["dist/**/*", "electron.cjs"],
    "directories": { "output": "release" },
    "win": { "target": "nsis" },
    "mac": { "target": "dmg" },
    "linux": { "target": "AppImage" }
  }
}
```

Run in dev mode:

```bash
npm run electron:dev
```

Build the installer:

```bash
npm run electron:build
```

Your `.exe` (Windows), `.dmg` (Mac), or `AppImage` (Linux) will be in the `release/` folder.

### Option C — Progressive Web App (PWA)

Deploy to Vercel, then users can click **"Install"** in Chrome or Edge to get a standalone app window — no installer needed.

---

## Project Structure

```
calendar-converter/
├── src/
│   ├── main.jsx              # React entry point
│   └── calendar-converter.jsx # Main app component
├── public/
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Tech Stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [SheetJS (xlsx)](https://sheetjs.com/) — spreadsheet parsing
- [iCalendar (.ics)](https://icalendar.org/) — calendar file format

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
