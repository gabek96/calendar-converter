import { useState, useEffect, useCallback, useRef } from "react";
import * as XLSX from "xlsx";

// ── Theme ──────────────────────────────────────────────────────────────────
const T = {
  bg:          "#F0F4FF",
  surface:     "#E6ECFF",
  card:        "#FFFFFF",
  border:      "#C8D4F0",
  borderHover: "#99AEE8",
  accent:      "#5566E0",
  accentDim:   "rgba(85,102,224,0.10)",
  accentHover: "#4455CC",
  gold:        "#C07A08",
  red:         "#CC2E48",
  green:       "#1A9860",
  text:        "#2C3A60",
  muted:       "#8098BE",
  subtle:      "#4A6090",
  white:       "#18264A",
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&family=Instrument+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body {
    background: ${T.bg};
    color: ${T.text};
    font-family: 'Instrument Sans', sans-serif;
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }

  .app { display: flex; height: 100vh; overflow: hidden; }

  .sidebar {
    width: 220px; min-width: 220px;
    background: ${T.surface};
    border-right: 1px solid ${T.border};
    display: flex; flex-direction: column;
  }
  .sidebar-logo { padding: 24px 20px 20px; border-bottom: 1px solid ${T.border}; }
  .logo-mark { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: ${T.white}; letter-spacing: -0.5px; display: flex; align-items: center; gap: 8px; }
  .logo-dot { width: 8px; height: 8px; background: ${T.accent}; border-radius: 50%; }
  .logo-sub { font-size: 11px; color: ${T.muted}; margin-top: 3px; letter-spacing: 1px; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; }

  .sidebar-nav { padding: 16px 12px; flex: 1; }
  .nav-section-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: ${T.muted}; padding: 0 8px; margin-bottom: 6px; margin-top: 16px; font-family: 'JetBrains Mono', monospace; }
  .nav-section-label:first-child { margin-top: 0; }
  .nav-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; border: none; background: transparent; color: ${T.subtle}; font-size: 13.5px; font-family: 'Instrument Sans', sans-serif; font-weight: 500; border-radius: 8px; cursor: pointer; transition: all 0.15s; text-align: left; margin-bottom: 2px; }
  .nav-btn:hover { background: rgba(0,0,0,0.06); color: ${T.text}; }
  .nav-btn.active { background: ${T.accentDim}; color: ${T.accent}; }
  .nav-btn .icon { font-size: 16px; width: 20px; text-align: center; }
  .nav-badge { margin-left: auto; background: ${T.border}; color: ${T.subtle}; font-size: 10px; padding: 1px 6px; border-radius: 10px; font-family: 'JetBrains Mono', monospace; }
  .nav-btn.active .nav-badge { background: ${T.accentDim}; color: ${T.accent}; }
  .sidebar-footer { padding: 16px 12px; border-top: 1px solid ${T.border}; }

  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .topbar { height: 56px; border-bottom: 1px solid ${T.border}; display: flex; align-items: center; padding: 0 24px; gap: 12px; flex-shrink: 0; background: ${T.surface}; }
  .topbar-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: ${T.white}; flex: 1; }

  .search-wrap { position: relative; }
  .search-input { background: ${T.card}; border: 1px solid ${T.border}; border-radius: 8px; color: ${T.text}; font-family: 'Instrument Sans', sans-serif; font-size: 13px; padding: 7px 12px 7px 32px; width: 220px; transition: border-color 0.15s; outline: none; }
  .search-input:focus { border-color: ${T.accent}; }
  .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: ${T.muted}; font-size: 14px; pointer-events: none; }

  .content { flex: 1; padding: 24px; display: flex; flex-direction: column; min-height: calc(100vh - 56px); }

  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; font-family: 'Instrument Sans', sans-serif; cursor: pointer; transition: all 0.15s; border: none; white-space: nowrap; }
  .btn-primary { background: ${T.accent}; color: #fff; }
  .btn-primary:hover { background: ${T.accentHover}; }
  .btn-ghost { background: transparent; color: ${T.subtle}; border: 1px solid ${T.border}; }
  .btn-ghost:hover { border-color: ${T.borderHover}; color: ${T.text}; }
  .btn-danger { background: transparent; color: ${T.red}; border: 1px solid rgba(239,68,68,0.3); }
  .btn-danger:hover { background: rgba(239,68,68,0.08); }
  .btn-sm { padding: 5px 10px; font-size: 12px; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .card { background: ${T.card}; border: 1px solid ${T.border}; border-radius: 12px; overflow: hidden; }
  .card-header { padding: 16px 20px; border-bottom: 1px solid ${T.border}; display: flex; align-items: center; justify-content: space-between; }
  .card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: ${T.white}; }

  .event-table { width: 100%; border-collapse: collapse; }
  .event-table th { text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: ${T.muted}; border-bottom: 1px solid ${T.border}; font-family: 'JetBrains Mono', monospace; }
  .event-table td { padding: 12px 16px; border-bottom: 1px solid ${T.border}; font-size: 13.5px; vertical-align: middle; }
  .event-table tr:last-child td { border-bottom: none; }
  .event-table tbody tr { transition: background 0.1s; cursor: pointer; }
  .event-table tbody tr:hover { background: rgba(59,130,246,0.05); }
  .event-title-cell { font-weight: 600; color: ${T.white}; }
  .event-date-cell { color: ${T.subtle}; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
  .event-loc-cell { color: ${T.subtle}; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .actions-cell { display: flex; gap: 6px; justify-content: flex-end; }

  .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; animation: fadeIn 0.15s ease; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal { background: ${T.card}; border: 1px solid ${T.border}; border-radius: 16px; width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto; animation: slideUp 0.2s ease; }
  @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .modal-header { padding: 20px 24px 16px; border-bottom: 1px solid ${T.border}; display: flex; align-items: center; justify-content: space-between; }
  .modal-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: ${T.white}; }
  .modal-close { background: none; border: none; color: ${T.muted}; cursor: pointer; font-size: 20px; padding: 4px; line-height: 1; border-radius: 6px; transition: color 0.15s; }
  .modal-close:hover { color: ${T.text}; }
  .modal-body { padding: 20px 24px; }
  .modal-footer { padding: 16px 24px; border-top: 1px solid ${T.border}; display: flex; gap: 10px; justify-content: flex-end; }

  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-field { display: flex; flex-direction: column; gap: 6px; }
  .form-field.full { grid-column: 1 / -1; }
  .form-label { font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: ${T.muted}; font-family: 'JetBrains Mono', monospace; }
  .form-label .req { color: ${T.accent}; }
  .form-input, .form-textarea, .form-select { background: ${T.surface}; border: 1px solid ${T.border}; border-radius: 8px; color: ${T.text}; font-family: 'Instrument Sans', sans-serif; font-size: 13.5px; padding: 9px 12px; transition: border-color 0.15s; outline: none; width: 100%; }
  .form-input:focus, .form-textarea:focus, .form-select:focus { border-color: ${T.accent}; }
  .form-textarea { resize: vertical; min-height: 80px; }
  .form-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234B5A6A' fill='none' stroke-width='1.5'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }

  /* ── Calendar: fully fixed layout ─────────────────────────────── */
  .cal-wrap {
    display: flex;
    flex-direction: column;
    height: 680px; /* fixed total height — never changes */
  }
  .cal-nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    flex-shrink: 0;
  }
  .cal-month { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; color: ${T.white}; min-width: 200px; }
  .cal-nav { display: flex; align-items: center; gap: 8px; }
  .cal-day-labels {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    flex-shrink: 0;
    margin-bottom: 1px;
  }
  .cal-day-label { text-align: center; padding: 6px 0; font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: ${T.muted}; font-family: 'JetBrains Mono', monospace; }
  .cal-grid {
    flex: 1; /* fill remaining fixed height */
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: repeat(6, 1fr); /* always 6 rows, equal height */
    gap: 1px;
    background: ${T.border};
    border: 1px solid ${T.border};
    border-radius: 10px;
    overflow: hidden;
    min-height: 0; /* critical: lets flex child shrink */
  }
  .cal-cell {
    background: ${T.card};
    padding: 7px 8px;
    cursor: pointer;
    transition: background 0.1s;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .cal-cell:hover { background: rgba(59,130,246,0.06); }
  .cal-cell.other-month { background: ${T.surface}; }
  .cal-cell.today { background: ${T.accentDim}; }
  .cal-date { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 500; color: ${T.subtle}; margin-bottom: 3px; flex-shrink: 0; }
  .cal-cell.today .cal-date { color: ${T.accent}; font-weight: 700; }
  .cal-cell.other-month .cal-date { color: ${T.muted}; }
  .cal-events-wrap { flex: 1; overflow: hidden; display: flex; flex-direction: column; gap: 2px; min-height: 0; }
  .cal-event-pill { font-size: 10px; padding: 2px 5px; border-radius: 3px; background: ${T.accentDim}; color: ${T.accent}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; cursor: pointer; flex-shrink: 0; }
  .cal-event-pill:hover { background: rgba(59,130,246,0.25); }
  .cal-more { font-size: 10px; color: ${T.muted}; flex-shrink: 0; }

  .drop-zone { border: 1.5px dashed ${T.border}; border-radius: 12px; padding: 40px 24px; text-align: center; cursor: pointer; transition: border-color 0.2s, background 0.2s; background: ${T.card}; position: relative; }
  .drop-zone:hover, .drop-zone.drag-over { border-color: ${T.accent}; background: ${T.accentDim}; }
  .drop-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }

  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
  .stat-card { background: ${T.card}; border: 1px solid ${T.border}; border-radius: 12px; padding: 16px 20px; }
  .stat-label { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: ${T.muted}; font-family: 'JetBrains Mono', monospace; margin-bottom: 8px; }
  .stat-value { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: ${T.white}; }
  .stat-sub { font-size: 11px; color: ${T.muted}; margin-top: 4px; }

  .filter-bar { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
  .filter-chip { padding: 5px 12px; border-radius: 20px; border: 1px solid ${T.border}; background: transparent; color: ${T.subtle}; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s; font-family: 'Instrument Sans', sans-serif; }
  .filter-chip:hover { border-color: ${T.accent}; color: ${T.accent}; }
  .filter-chip.active { background: ${T.accentDim}; border-color: ${T.accent}; color: ${T.accent}; }

  .mapper-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 20px; }
  .mapper-select { background: ${T.surface}; border: 1px solid ${T.border}; border-radius: 8px; color: ${T.text}; padding: 8px 12px; font-family: 'Instrument Sans', sans-serif; font-size: 13px; width: 100%; outline: none; appearance: none; cursor: pointer; transition: border-color 0.15s; }
  .mapper-select:focus { border-color: ${T.accent}; }

  .empty-state { text-align: center; padding: 60px 24px; }
  .empty-icon { font-size: 48px; margin-bottom: 16px; }
  .empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; color: ${T.text}; margin-bottom: 8px; }
  .empty-sub { color: ${T.muted}; font-size: 13px; margin-bottom: 24px; }

  .toast-wrap { position: fixed; bottom: 24px; right: 24px; z-index: 200; display: flex; flex-direction: column; gap: 8px; }
  .toast { background: ${T.card}; border: 1px solid ${T.border}; border-radius: 10px; padding: 12px 16px; font-size: 13px; color: ${T.text}; display: flex; align-items: center; gap: 8px; animation: slideUp 0.2s ease; box-shadow: 0 8px 32px rgba(0,0,0,0.4); min-width: 220px; }
  .toast.success { border-color: rgba(16,185,129,0.4); }
  .toast.error { border-color: rgba(239,68,68,0.4); }

  .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; font-family: 'JetBrains Mono', monospace; }

  .modal-tabs { display: flex; border-bottom: 1px solid ${T.border}; padding: 0 24px; }
  .modal-tab { padding: 10px 16px; font-size: 13px; font-weight: 600; border: none; background: transparent; color: ${T.subtle}; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; font-family: 'Instrument Sans', sans-serif; transition: color 0.15s; }
  .modal-tab.active { color: ${T.accent}; border-bottom-color: ${T.accent}; }
  .modal-tab:hover:not(.active) { color: ${T.text}; }

  .task-item { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid ${T.border}; }
  .task-item:last-child { border-bottom: none; }
  .task-check { width: 16px; height: 16px; accent-color: ${T.accent}; cursor: pointer; flex-shrink: 0; }
  .task-text { flex: 1; font-size: 13.5px; color: ${T.text}; }
  .task-text.done { text-decoration: line-through; color: ${T.muted}; }
  .task-del { background: none; border: none; color: ${T.muted}; cursor: pointer; font-size: 16px; padding: 2px 4px; line-height: 1; border-radius: 4px; }
  .task-del:hover { color: ${T.red}; }

  .vol-item { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid ${T.border}; }
  .vol-item:last-child { border-bottom: none; }
  .vol-name { font-size: 13.5px; font-weight: 600; color: ${T.text}; flex: 1; }
  .vol-role { font-size: 11px; color: ${T.subtle}; font-family: 'JetBrains Mono', monospace; }

  .progress-bar-wrap { height: 3px; background: ${T.border}; border-radius: 2px; margin-top: 5px; }
  .progress-bar-fill { height: 100%; border-radius: 2px; background: ${T.accent}; transition: width 0.3s; }

  .prep-card { background: ${T.card}; border: 1px solid ${T.border}; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; cursor: pointer; transition: border-color 0.15s; }
  .prep-card:hover { border-color: ${T.borderHover}; }
  .days-chip { padding: 2px 9px; border-radius: 10px; font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace; display: inline-block; }
  .prep-pills { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
  .prep-pill { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; background: ${T.surface}; border: 1px solid ${T.border}; color: ${T.subtle}; font-family: 'Instrument Sans', sans-serif; }

  .hub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px; flex: 1; align-items: stretch; }
  @media (max-width: 900px) { .hub-grid { grid-template-columns: 1fr; } }
  .hub-panel-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: ${T.white}; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .hub-event-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid ${T.border}; cursor: pointer; }
  .hub-event-row:last-child { border-bottom: none; }
  .hub-event-row:hover .hub-event-title { color: ${T.accent}; }
  .hub-event-title { font-size: 13.5px; font-weight: 600; color: ${T.text}; flex: 1; transition: color 0.15s; }
  .hub-event-meta { font-size: 11px; color: ${T.muted}; font-family: 'JetBrains Mono', monospace; }
  .hub-task-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid ${T.border}; }
  .hub-task-row:last-child { border-bottom: none; }
  .hub-task-event { font-size: 11px; color: ${T.muted}; font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

  .view-toggle { display: flex; background: ${T.surface}; border: 1px solid ${T.border}; border-radius: 8px; overflow: hidden; }
  .view-toggle-btn { padding: 5px 12px; font-size: 12px; font-weight: 600; border: none; background: transparent; color: ${T.subtle}; cursor: pointer; font-family: 'Instrument Sans', sans-serif; transition: all 0.15s; }
  .view-toggle-btn.active { background: ${T.accentDim}; color: ${T.accent}; }

  .tasks-row { display: flex; align-items: center; gap: 12px; padding: 12px 20px; transition: background 0.1s; }
  .tasks-row:hover { background: rgba(59,130,246,0.03); }
  .priority-badge { font-size: 9px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 2px 7px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; flex-shrink: 0; }
  .cl-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 20px; border-bottom: 1px solid ${T.border}; transition: background 0.1s; }
  .cl-item:last-child { border-bottom: none; }
  .cl-item:hover { background: rgba(59,130,246,0.03); }
  .cl-item-notes { font-size: 11px; color: ${T.muted}; font-family: 'JetBrains Mono', monospace; margin-top: 3px; line-height: 1.5; }

  .events-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .event-card { background: ${T.card}; border: 1px solid ${T.border}; border-radius: 12px; overflow: hidden; cursor: pointer; transition: border-color 0.15s, transform 0.15s; display: flex; flex-direction: column; }
  .event-card:hover { border-color: ${T.borderHover}; transform: translateY(-2px); }
  .event-card-accent { height: 3px; flex-shrink: 0; }
  .event-card-body { padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 10px; }
  .event-card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: ${T.white}; line-height: 1.3; }
  .event-card-meta { display: flex; flex-direction: column; gap: 4px; }
  .event-card-meta-row { display: flex; align-items: center; gap: 6px; font-size: 12px; color: ${T.subtle}; font-family: 'JetBrains Mono', monospace; }
  .event-card-meta-icon { width: 14px; text-align: center; flex-shrink: 0; font-style: normal; }
  .event-card-badges { display: flex; gap: 6px; flex-wrap: wrap; }
  .event-card-desc { font-size: 12px; color: ${T.muted}; line-height: 1.5; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .event-card-footer { padding: 10px 16px; border-top: 1px solid ${T.border}; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .event-card-footer-item { display: flex; align-items: center; gap: 4px; font-size: 11px; color: ${T.muted}; font-family: 'JetBrains Mono', monospace; }
  .event-card-footer-item span { font-size: 12px; }
  .event-card-actions { margin-left: auto; display: flex; gap: 6px; }

  @media (max-width: 768px) {
    .sidebar { display: none; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .form-grid { grid-template-columns: 1fr; }
    .form-field.full { grid-column: 1; }
    .events-card-grid { grid-template-columns: 1fr; }
  }
`;

// ── Helpers ────────────────────────────────────────────────────────────────

// Generates a short unique ID by combining the current timestamp (base-36)
// with a random string — used to give every event, task, and volunteer its own key.
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// Ensures a number is always two digits (e.g. 9 → "09"). Used when building
// date/time strings so they stay in a consistent HH:MM or YYYY-MM-DD format.
function pad(n) { return String(n).padStart(2, "0"); }

// Excel stores times as a decimal fraction of one day (e.g. 0.5 = noon, 0.75 = 6 PM).
// When a cell holds a combined date+time, the integer part is the date serial and
// the fractional part is the time — we extract just the fractional part here.
// Returns a "HH:MM" string, or passes the raw value through if it can't be parsed.
function excelTimeToString(val) {
  const num = Number(val);
  if (isNaN(num) || num < 0) return String(val).trim();
  // Extract only the time portion (decimal part) from a combined datetime serial
  const frac = num % 1;
  if (frac === 0) return String(val).trim(); // no time component present
  const totalMinutes = Math.round(frac * 24 * 60);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${pad(hours)}:${pad(minutes)}`;
}

// Excel represents dates as the number of days since Jan 1, 1900 (serial 1).
// Subtracting 25569 converts it to a Unix epoch (days since Jan 1, 1970),
// then we multiply by 86400000 to get milliseconds for the Date constructor.
// We use UTC getters so timezone offsets don't shift the date by a day.
function excelSerialToDate(serial) {
  const utc = new Date((serial - 25569) * 86400 * 1000);
  if (isNaN(utc)) return null;
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}

// Tries to turn any date value from an imported spreadsheet into a JS Date.
// Priority: Excel serial number → ISO "YYYY-MM-DD" string → anything JS can parse.
function parseDate(val) {
  if (!val) return null;
  const num = Number(val);
  // Excel date serials fall roughly in this range (year 1955–2091)
  if (!isNaN(num) && num > 20000 && num < 70000) return excelSerialToDate(num);
  // Strict ISO match prevents JS from applying timezone shifts to date-only strings
  const iso = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]);
  // Fall back to the native parser for formats like "March 5, 2025"
  const d = new Date(val);
  return isNaN(d) ? null : d;
}

// Formats a stored "YYYY-MM-DD" date string into a readable label like "Feb 28, 2026".
// The "T00:00:00" suffix forces the Date to be interpreted in local time, avoiding
// an off-by-one day that happens when JS parses bare ISO strings as UTC midnight.
function fmtDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Converts a 24-hour "HH:MM" time string to 12-hour "h:MM AM/PM" format.
// Handles edge cases: midnight (0:00 → 12:00 AM) and noon (12:00 → 12:00 PM).
// If the string doesn't match the expected pattern it's returned unchanged.
function fmt12h(t) {
  if (!t) return "";
  const m = t.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return t; // not a recognizable HH:MM string — pass through as-is
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ampm = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;       // midnight: hour 0 displays as 12 AM
  else if (h > 12) h -= 12;  // afternoon: subtract 12 to get 12-hour value
  return `${h}:${min} ${ampm}`;
}

// Converts a JS Date object to a "YYYY-MM-DD" string for consistent storage.
// We read local year/month/day (not UTC) so the stored date matches what the
// user sees in their timezone.
function toISODate(d) {
  if (!d) return "";
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

// Builds the text of a .ics (iCalendar) file from an array of event objects.
// Each event becomes a VEVENT block. Events with a start time get full datetime
// stamps; events with no time get a DATE-only stamp (all-day).
function buildICS(events) {
  const now = new Date();
  // DTSTAMP requires a UTC timestamp in the format YYYYMMDDTHHmmssZ
  const stamp = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}Z`;
  // Calendar wrapper required by the iCalendar spec (RFC 5545)
  const lines = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Calendar Converter//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH","X-WR-CALNAME:My Events"];
  for (const ev of events) {
    const d = ev.date; if (!d) continue;
    const dateBase = d.replace(/-/g, ""); // "YYYY-MM-DD" → "YYYYMMDD" for iCal format
    // Converts a stored "HH:MM" time string into an iCal datetime like "20260228T143000"
    const parseTime = (t) => { if (!t) return null; const m = t.match(/(\d+):(\d+)\s*(am|pm)?/i); if (!m) return null; let h=parseInt(m[1]),mi=parseInt(m[2]); if(m[3]){const ap=m[3].toLowerCase();if(ap==="pm"&&h!==12)h+=12;if(ap==="am"&&h===12)h=0;} return `${dateBase}T${pad(h)}${pad(mi)}00`; };
    const start = ev.startTime ? parseTime(ev.startTime) : null;
    const end = ev.endTime ? parseTime(ev.endTime) : null;
    lines.push("BEGIN:VEVENT",`UID:${ev.id}@calendar-converter`,`DTSTAMP:${stamp}`);
    if (start) {
      // Timed event: include full datetime; if no end time, use start time for DTEND
      lines.push(`DTSTART:${start}`,`DTEND:${end||start}`);
    } else {
      // All-day event: DATE-only value, no time component
      lines.push(`DTSTART;VALUE=DATE:${dateBase}`,`DTEND;VALUE=DATE:${dateBase}`);
    }
    lines.push(`SUMMARY:${ev.title||"Event"}`);
    if (ev.location) lines.push(`LOCATION:${ev.location}`);
    // Newlines inside descriptions must be escaped as \n for the iCal format
    if (ev.description) lines.push(`DESCRIPTION:${ev.description.replace(/\n/g,"\\n")}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n"); // iCalendar spec requires CRLF line endings
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Reads the saved event list from localStorage. Falls back to an empty array
// if the key doesn't exist yet or the stored JSON is corrupted.
function loadEvents() { try { return JSON.parse(localStorage.getItem("cal_events")||"[]"); } catch { return []; } }
// Serializes the current event array to JSON and writes it to localStorage
// so data persists across page refreshes without a backend.
function saveEvents(evs) { localStorage.setItem("cal_events", JSON.stringify(evs)); }

// ── EventForm ──────────────────────────────────────────────────────────────
const EMPTY_FORM = { title:"", date:"", startTime:"", endTime:"", location:"", description:"", category:"", semester:"", food:"", status:"Planning", tasks:[], volunteers:[] };
const CATEGORIES = ["Meeting","Workshop","Social","Conference","Deadline","Other"];
const SEMESTER = ["Fall","Spring"];
const CAT_COLORS = { Meeting: T.accent, Workshop: T.green, Social: T.gold, Conference: "#A78BFA", Deadline: T.red, Other: T.subtle };
const STATUS_COLORS = { Planning: T.accent, Confirmed: T.green, Cancelled: T.red, Completed: T.subtle };

const DEFAULT_CHECKLIST = [
  { id:"pre1",  text:"Event name finalized",               notes:"",                                                                  priority:"ASAP"  },
  { id:"pre2",  text:"Event summary written",              notes:"Someone should get the idea of the event just from the description", priority:"ASAP"  },
  { id:"pre3",  text:"Volunteers needed?",                 notes:"",                                                                  priority:""      },
  { id:"pre4",  text:"Theme / initiatives addressed",      notes:"Keep it clear and concise",                                         priority:"ASAP"  },
  { id:"pre5",  text:"RSVP form created",                  notes:"Every event needs one. Minimum: Name, Major, Year",                  priority:"ASAP"  },
  { id:"pre6",  text:"Food provided?",                     notes:"",                                                                  priority:""      },
  { id:"pre7",  text:"Attendees need to bring anything?",  notes:"",                                                                  priority:""      },
  { id:"pre8",  text:"Date and time confirmed",            notes:"",                                                                  priority:""      },
  { id:"pre9",  text:"Sign-in form created",               notes:"Minimum: Name, Major, Year — leave until finalized",                priority:"Later" },
  { id:"pre10", text:"Location confirmed",                 notes:"",                                                                  priority:""      },
  { id:"pre11", text:"Venue capacity checked",             notes:"Depends on venue limit",                                            priority:""      },
  { id:"pre12", text:"PCI volunteers secured",             notes:"",                                                                  priority:""      },
  { id:"pre13", text:"Monday academic volunteers secured", notes:"",                                                                  priority:""      },
];
// Same pattern as loadEvents — loads the custom checklist or falls back to
// DEFAULT_CHECKLIST if nothing has been saved yet.
function loadChecklist() { try { return JSON.parse(localStorage.getItem("cal_checklist")||"null")||DEFAULT_CHECKLIST; } catch { return DEFAULT_CHECKLIST; } }
function saveChecklist(items) { localStorage.setItem("cal_checklist", JSON.stringify(items)); }

// ── EventForm ──────────────────────────────────────────────────────────────
// Shared form used by both the "New Event" and "Edit Event" modals.
// Props:
//   initial  – existing event object when editing; undefined/null when creating
//   onSave   – called with the completed form object when the user submits
//   onClose  – called when the user cancels
function EventForm({ initial, onSave, onClose }) {
  // Single state object holds every field so one helper can update any of them
  const [form, setForm] = useState(initial || EMPTY_FORM);
  // Shorthand updater: merges a single changed field into the existing form state
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  // The Save button stays disabled until the two required fields are filled in
  const valid = form.title.trim() && form.date;
  return (
    <div>
      <div className="form-grid">
        <div className="form-field full"><label className="form-label">Event Title <span className="req">*</span></label><input className="form-input" placeholder="e.g. General Body Meeting" value={form.title} onChange={e=>set("title",e.target.value)} /></div>
        <div className="form-field"><label className="form-label">Date <span className="req">*</span></label><input type="date" className="form-input" value={form.date} onChange={e=>set("date",e.target.value)} /></div>
        <div className="form-field"><label className="form-label">Category</label><select className="form-select" value={form.category} onChange={e=>set("category",e.target.value)}><option value="">— none —</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
        <div className="form-field"><label className="form-label">Start Time</label><input type="time" className="form-input" value={form.startTime} onChange={e=>set("startTime",e.target.value)} /></div>
        <div className="form-field"><label className="form-label">End Time</label><input type="time" className="form-input" value={form.endTime} onChange={e=>set("endTime",e.target.value)} /></div>
        <div className="form-field"><label className="form-label">Status</label><select className="form-select" value={form.status||"Planning"} onChange={e=>set("status",e.target.value)}><option value="Planning">Planning</option><option value="Confirmed">Confirmed</option><option value="Cancelled">Cancelled</option><option value="Completed">Completed</option></select></div>
        <div className="form-field"><label className="form-label">Semester</label><select className="form-select" value={form.semester} onChange={e=>set("semester",e.target.value)}><option value="">— none —</option>{SEMESTER.map(s=><option key={s}>{s}</option>)}</select></div>
        <div className="form-field"><label className="form-label">Food Provided</label><select className="form-select" value={form.food} onChange={e=>set("food",e.target.value)}><option value="">— none —</option><option value="Yes">Yes</option><option value="No">No</option><option value="TBD">TBD</option></select></div>
        <div className="form-field full"><label className="form-label">Location</label><input className="form-input" placeholder="e.g. Howe Hall 100" value={form.location} onChange={e=>set("location",e.target.value)} /></div>
        <div className="form-field full"><label className="form-label">Description</label><textarea className="form-textarea" placeholder="Details about the event..." value={form.description} onChange={e=>set("description",e.target.value)} /></div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!valid} onClick={()=>onSave(form)}>{initial?.id ? "Save Changes" : "Create Event"}</button>
      </div>
    </div>
  );
}

// ── ImportModal ────────────────────────────────────────────────────────────
// The internal app fields that a spreadsheet column can be mapped to.
// req:true means that field must be mapped before the import button is enabled.
const FIELD_DEFS = [
  { key:"title",     label:"Event Title", req:true },
  { key:"date",      label:"Date",        req:true },
  { key:"startTime", label:"Start Time" },
  { key:"semester",  label:"Semester" },
  { key:"location",  label:"Location" },
  { key:"description", label:"Description" },
  { key:"category",  label:"Category" },
];

// Modal that lets the user drag-and-drop (or click-to-browse) a .xlsx/.csv file,
// then map its columns to event fields before importing.
// Props:
//   onImport – called with an array of parsed event objects on confirm
//   onClose  – called when the user cancels
function ImportModal({ onImport, onClose }) {
  const [rows, setRows] = useState([]);       // raw data rows from the spreadsheet
  const [headers, setHeaders] = useState([]); // column header names from the first row
  const [mapping, setMapping] = useState({}); // { appField: "SpreadsheetColumnName" }
  const [drag, setDrag] = useState(false);    // true while a file is being dragged over the zone
  const [err, setErr] = useState("");         // parse error message shown below the drop zone
  const [fileName, setFileName] = useState(""); // displayed after a file is loaded
  const fileRef = useRef(); // hidden <input type="file"> triggered by clicking the drop zone

  // Reads the dropped/selected file with the xlsx library, extracts the first sheet,
  // then tries to auto-match column headers to known field names using regex patterns.
  const process = (file) => {
    setErr(""); setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // CSV files must be read as text; binary Excel files need an ArrayBuffer
        const wb = file.name.endsWith(".csv") ? XLSX.read(e.target.result, { type:"string" }) : XLSX.read(e.target.result, { type:"array" });
        const ws = wb.Sheets[wb.SheetNames[0]]; // always use the first sheet
        const json = XLSX.utils.sheet_to_json(ws, { defval:"" }); // defval fills empty cells with ""
        if (!json.length) { setErr("No data found."); return; }
        const hdrs = Object.keys(json[0]);
        setHeaders(hdrs); setRows(json);
        // Auto-mapping: test each column header against a regex for each field
        const auto = {};
        const rx = { title:/title|event|name|subject/i, date:/^date$/i, startTime:/start\s*time|begin/i, endTime:/end\s*time/i, location:/location|venue|place/i, description:/desc|notes?/i, category:/cat|type/i };
        for (const [f, r] of Object.entries(rx)) { const m = hdrs.find(h=>r.test(h)); if (m) auto[f]=m; }
        setMapping(auto);
      } catch { setErr("Could not parse file. Use .xlsx or .csv."); }
    };
    file.name.endsWith(".csv") ? reader.readAsText(file) : reader.readAsArrayBuffer(file);
  };

  // Converts every spreadsheet row into an event object using the current mapping,
  // then filters out any rows that are missing the required title or date fields.
  const doImport = () => {
    const events = rows.map(row => {
      // Helper that pulls the mapped column value for a given field key
      const get = k => mapping[k] ? String(row[mapping[k]]||"").trim() : "";
      const rawDate = get("date");
      const num = Number(rawDate);
      let dateStr = "";
      // Excel date serials need special conversion; everything else goes through parseDate
      if (!isNaN(num) && num > 20000 && num < 70000) { const d = excelSerialToDate(num); if (d) dateStr = toISODate(d); }
      else { const d = parseDate(rawDate); if (d) dateStr = toISODate(d); }
      // Times may be Excel fractional values or strings — excelTimeToString handles both
      const rawStart = mapping.startTime ? row[mapping.startTime] : "";
      const rawEnd = mapping.endTime ? row[mapping.endTime] : "";
      const startTime = rawStart !== "" && rawStart !== null ? excelTimeToString(rawStart) : "";
      const endTime = rawEnd !== "" && rawEnd !== null ? excelTimeToString(rawEnd) : "";
      return { id:uid(), title:get("title"), date:dateStr, startTime, endTime, location:get("location"), description:get("description"), category:get("category") };
    }).filter(e => e.title && e.date); // drop rows without required fields
    onImport(events);
  };

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header"><span className="modal-title">Import from Spreadsheet</span><button className="modal-close" onClick={onClose}>×</button></div>
        <div className="modal-body">
          <div className={`drop-zone${drag?" drag-over":""}`} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)process(f);}} onClick={()=>fileRef.current.click()}>
            <input ref={fileRef} type="file" accept=".xlsx,.csv,.xls" className="drop-input" onChange={e=>{const f=e.target.files[0];if(f)process(f);}} onClick={e=>e.stopPropagation()} />
            <div style={{fontSize:32,marginBottom:10}}>📂</div>
            <div style={{fontWeight:600,color:T.text,marginBottom:4}}>{fileName||"Drop your spreadsheet here"}</div>
            <div style={{fontSize:12,color:T.muted}}>{rows.length?`${rows.length} rows loaded`:"Accepts .xlsx, .xls, .csv"}</div>
          </div>
          {err && <div style={{color:T.red,fontSize:12,marginTop:10}}>⚠ {err}</div>}
          {headers.length > 0 && (
            <>
              <div style={{margin:"16px 0 8px",fontSize:11,letterSpacing:1,textTransform:"uppercase",color:T.muted,fontFamily:"'JetBrains Mono',monospace"}}>Map Columns</div>
              <div className="mapper-grid" style={{padding:0,gap:10}}>
                {FIELD_DEFS.map(({key,label,req})=>(
                  <div key={key} style={{display:"flex",flexDirection:"column",gap:4}}>
                    <label style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",letterSpacing:1,textTransform:"uppercase"}}>{label}{req&&<span style={{color:T.accent}}> *</span>}</label>
                    <select className="mapper-select" value={mapping[key]||""} onChange={e=>setMapping(m=>({...m,[key]:e.target.value||undefined}))}><option value="">— skip —</option>{headers.map(h=><option key={h}>{h}</option>)}</select>
                  </div>
                ))}
              </div>
              <div style={{marginTop:12,fontSize:12,color:T.muted}}>{rows.filter(r=>{const t=mapping.title?String(r[mapping.title]||"").trim():"";const d=mapping.date?String(r[mapping.date]||"").trim():"";return t&&d;}).length} of {rows.length} rows will be imported</div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!rows.length||!mapping.title||!mapping.date} onClick={doImport}>Import Events</button>
        </div>
      </div>
    </div>
  );
}

// ── Calendar View — FIXED SIZE ─────────────────────────────────────────────
function CalendarView({ events, onEventClick, onDayClick }) {
  const today = new Date();
  const [cur, setCur] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const firstDay = new Date(cur.year, cur.month, 1).getDay();
  const daysInMonth = new Date(cur.year, cur.month + 1, 0).getDate();
  const daysInPrev = new Date(cur.year, cur.month, 0).getDate();

  // Always exactly 42 cells = 6 rows × 7 cols — grid never changes size
  const TOTAL_CELLS = 42;

  const eventsByDate = {};
  for (const ev of events) {
    if (ev.date) { if (!eventsByDate[ev.date]) eventsByDate[ev.date] = []; eventsByDate[ev.date].push(ev); }
  }

  const cells = [];
  for (let i = 0; i < TOTAL_CELLS; i++) {
    let day, month, year, isCurrentMonth;
    if (i < firstDay) { day = daysInPrev - firstDay + i + 1; month = cur.month - 1; year = cur.year; isCurrentMonth = false; }
    else if (i < firstDay + daysInMonth) { day = i - firstDay + 1; month = cur.month; year = cur.year; isCurrentMonth = true; }
    else { day = i - firstDay - daysInMonth + 1; month = cur.month + 1; year = cur.year; isCurrentMonth = false; }
    const d = new Date(year, month, day);
    const key = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    const isToday = d.toDateString() === today.toDateString();
    cells.push({ day, key, isCurrentMonth, isToday, events: eventsByDate[key] || [] });
  }

  return (
    <div className="cal-wrap">
      <div className="cal-nav-bar">
        <div className="cal-month">{MONTHS[cur.month]} {cur.year}</div>
        <div className="cal-nav">
          <button className="btn btn-ghost btn-sm" onClick={()=>setCur(c=>{ const d=new Date(c.year,c.month-1); return {year:d.getFullYear(),month:d.getMonth()}; })}>← Prev</button>
          <button className="btn btn-ghost btn-sm" onClick={()=>setCur({year:today.getFullYear(),month:today.getMonth()})}>Today</button>
          <button className="btn btn-ghost btn-sm" onClick={()=>setCur(c=>{ const d=new Date(c.year,c.month+1); return {year:d.getFullYear(),month:d.getMonth()}; })}>Next →</button>
        </div>
      </div>
      <div className="cal-day-labels">
        {DAY_LABELS.map(l=><div key={l} className="cal-day-label">{l}</div>)}
      </div>
      <div className="cal-grid">
        {cells.map((cell,i)=>(
          <div key={i}
            className={`cal-cell${!cell.isCurrentMonth?" other-month":""}${cell.isToday?" today":""}`}
            onClick={()=>onDayClick(cell.key)}>
            <div className="cal-date">{cell.day}</div>
            <div className="cal-events-wrap">
              {cell.events.slice(0,3).map(ev=>(
                <div key={ev.id} className="cal-event-pill"
                  style={{ background: ev.category&&CAT_COLORS[ev.category]?`${CAT_COLORS[ev.category]}22`:T.accentDim, color: ev.category&&CAT_COLORS[ev.category]?CAT_COLORS[ev.category]:T.accent }}
                  onClick={e=>{e.stopPropagation();onEventClick(ev);}}>
                  {ev.startTime&&<span style={{opacity:0.7}}>{fmt12h(ev.startTime)} </span>}{ev.title}
                </div>
              ))}
              {cell.events.length > 3 && <div className="cal-more">+{cell.events.length-3} more</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── WeekView ───────────────────────────────────────────────────────────────
function WeekView({ events, onEventClick, onDayClick }) {
  const today = new Date();
  const [curDate, setCurDate] = useState(new Date());
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) {
      const hour = new Date().getHours();
      scrollRef.current.scrollTop = Math.max(0, (hour - 1) * 56);
    }
  }, []);

  const weekStart = new Date(curDate);
  weekStart.setDate(curDate.getDate() - curDate.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const evMap = {};
  for (const ev of events) {
    if (!ev.date) continue;
    if (!evMap[ev.date]) evMap[ev.date] = { allDay: [], timed: {} };
    if (ev.startTime) {
      const h = parseInt(ev.startTime);
      if (!evMap[ev.date].timed[h]) evMap[ev.date].timed[h] = [];
      evMap[ev.date].timed[h].push(ev);
    } else {
      evMap[ev.date].allDay.push(ev);
    }
  }

  const HOURS = Array.from({ length: 24 }, (_, i) => i);

  const fmtHour = (h) => {
    if (h === 0) return "12 AM";
    if (h < 12) return `${h} AM`;
    if (h === 12) return "12 PM";
    return `${h - 12} PM`;
  };

  const weekEnd = weekDays[6];
  const startLbl = `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()}`;
  const endLbl = weekEnd.getMonth() !== weekStart.getMonth()
    ? `${MONTHS[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
    : `${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;

  const hasAllDay = weekDays.some(d => (evMap[toISODate(d)]?.allDay.length || 0) > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "680px" }}>
      <div className="cal-nav-bar">
        <div className="cal-month">{startLbl} – {endLbl}</div>
        <div className="cal-nav">
          <button className="btn btn-ghost btn-sm" onClick={() => { const d = new Date(curDate); d.setDate(d.getDate() - 7); setCurDate(d); }}>← Prev</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurDate(new Date())}>Today</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { const d = new Date(curDate); d.setDate(d.getDate() + 7); setCurDate(d); }}>Next →</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7, 1fr)", borderBottom: `1px solid ${T.border}`, flexShrink: 0, background: T.surface }}>
        <div style={{ borderRight: `1px solid ${T.border}` }} />
        {weekDays.map((d, i) => {
          const isToday = d.toDateString() === today.toDateString();
          return (
            <div key={i} style={{ padding: "8px 4px", textAlign: "center", borderRight: i < 6 ? `1px solid ${T.border}` : "none", background: isToday ? T.accentDim : "transparent", cursor: "pointer" }}
              onClick={() => onDayClick(toISODate(d))}>
              <div style={{ fontSize: 10, color: T.muted, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{DAY_LABELS[d.getDay()]}</div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: isToday ? T.accent : T.white }}>{d.getDate()}</div>
            </div>
          );
        })}
      </div>

      {hasAllDay && (
        <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7, 1fr)", borderBottom: `1px solid ${T.border}`, flexShrink: 0, background: T.surface }}>
          <div style={{ padding: "4px 6px", fontSize: 9, color: T.muted, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", justifyContent: "flex-end", borderRight: `1px solid ${T.border}` }}>all day</div>
          {weekDays.map((d, i) => {
            const key = toISODate(d);
            const allEvs = evMap[key]?.allDay || [];
            return (
              <div key={i} style={{ padding: 4, borderRight: i < 6 ? `1px solid ${T.border}` : "none", display: "flex", flexDirection: "column", gap: 2 }}>
                {allEvs.map(ev => (
                  <div key={ev.id} className="cal-event-pill"
                    style={{ background: ev.category && CAT_COLORS[ev.category] ? `${CAT_COLORS[ev.category]}22` : T.accentDim, color: ev.category && CAT_COLORS[ev.category] ? CAT_COLORS[ev.category] : T.accent }}
                    onClick={e => { e.stopPropagation(); onEventClick(ev); }}>
                    {ev.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7, 1fr)" }}>
          {HOURS.flatMap(h => [
            <div key={`lbl-${h}`} style={{ height: 56, padding: "4px 6px", borderBottom: `1px solid ${T.border}`, borderRight: `1px solid ${T.border}`, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", fontSize: 10, color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
              {h > 0 ? fmtHour(h) : ""}
            </div>,
            ...weekDays.map((d, di) => {
              const key = toISODate(d);
              const hourEvs = evMap[key]?.timed[h] || [];
              const isToday = d.toDateString() === today.toDateString();
              return (
                <div key={`${h}-${di}`}
                  style={{ height: 56, borderBottom: `1px solid ${T.border}`, borderRight: di < 6 ? `1px solid ${T.border}` : "none", background: isToday ? `${T.accent}06` : "transparent", padding: 2, cursor: "pointer", overflow: "hidden", display: "flex", flexDirection: "column", gap: 2 }}
                  onClick={() => onDayClick(key)}>
                  {hourEvs.map(ev => (
                    <div key={ev.id} className="cal-event-pill"
                      style={{ background: ev.category && CAT_COLORS[ev.category] ? `${CAT_COLORS[ev.category]}22` : T.accentDim, color: ev.category && CAT_COLORS[ev.category] ? CAT_COLORS[ev.category] : T.accent, flexShrink: 0 }}
                      onClick={e => { e.stopPropagation(); onEventClick(ev); }}>
                      {ev.startTime && <span style={{ opacity: 0.7 }}>{fmt12h(ev.startTime)} </span>}{ev.title}
                    </div>
                  ))}
                </div>
              );
            })
          ])}
        </div>
      </div>
    </div>
  );
}

// ── DayView ────────────────────────────────────────────────────────────────
function DayView({ events, onEventClick, onDayClick }) {
  const today = new Date();
  const [curDate, setCurDate] = useState(new Date());
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) {
      const hour = new Date().getHours();
      scrollRef.current.scrollTop = Math.max(0, (hour - 1) * 60);
    }
  }, []);

  const key = toISODate(curDate);
  const isToday = curDate.toDateString() === today.toDateString();
  const dayEvents = events.filter(ev => ev.date === key);
  const allDayEvs = dayEvents.filter(ev => !ev.startTime);
  const timedEvs = {};
  dayEvents.filter(ev => ev.startTime).forEach(ev => {
    const h = parseInt(ev.startTime);
    if (!timedEvs[h]) timedEvs[h] = [];
    timedEvs[h].push(ev);
  });

  const HOURS = Array.from({ length: 24 }, (_, i) => i);

  const fmtHour = (h) => {
    if (h === 0) return "12 AM";
    if (h < 12) return `${h} AM`;
    if (h === 12) return "12 PM";
    return `${h - 12} PM`;
  };

  const dayLabel = curDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "680px" }}>
      <div className="cal-nav-bar">
        <div className="cal-month" style={{ fontSize: 16 }}>{dayLabel}</div>
        <div className="cal-nav">
          <button className="btn btn-ghost btn-sm" onClick={() => { const d = new Date(curDate); d.setDate(d.getDate() - 1); setCurDate(d); }}>← Prev</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurDate(new Date())}>Today</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { const d = new Date(curDate); d.setDate(d.getDate() + 1); setCurDate(d); }}>Next →</button>
        </div>
      </div>

      {allDayEvs.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 8px 8px 60px", borderBottom: `1px solid ${T.border}`, flexShrink: 0, background: T.surface, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: T.muted, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1, flexShrink: 0 }}>All day</span>
          {allDayEvs.map(ev => (
            <div key={ev.id} className="cal-event-pill"
              style={{ background: ev.category && CAT_COLORS[ev.category] ? `${CAT_COLORS[ev.category]}22` : T.accentDim, color: ev.category && CAT_COLORS[ev.category] ? CAT_COLORS[ev.category] : T.accent }}
              onClick={() => onEventClick(ev)}>
              {ev.title}
            </div>
          ))}
        </div>
      )}

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {HOURS.map(h => (
          <div key={h} style={{ display: "flex", minHeight: 60, borderBottom: `1px solid ${T.border}` }}>
            <div style={{ width: 52, flexShrink: 0, padding: "4px 8px", fontSize: 10, color: T.muted, fontFamily: "'JetBrains Mono', monospace", textAlign: "right", borderRight: `1px solid ${T.border}` }}>
              {h > 0 ? fmtHour(h) : ""}
            </div>
            <div style={{ flex: 1, padding: 4, background: isToday ? `${T.accent}06` : "transparent", cursor: "pointer", display: "flex", flexDirection: "column", gap: 2 }}
              onClick={() => onDayClick(key)}>
              {(timedEvs[h] || []).map(ev => (
                <div key={ev.id} className="cal-event-pill"
                  style={{ background: ev.category && CAT_COLORS[ev.category] ? `${CAT_COLORS[ev.category]}22` : T.accentDim, color: ev.category && CAT_COLORS[ev.category] ? CAT_COLORS[ev.category] : T.accent }}
                  onClick={e => { e.stopPropagation(); onEventClick(ev); }}>
                  <span style={{ opacity: 0.7 }}>{fmt12h(ev.startTime)} </span>{ev.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type="success") => {
    const id = uid();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)), 3000);
  }, []);
  return { toasts, show };
}

// ── ViewModal ──────────────────────────────────────────────────────────────
// Read-only view of a single event with three tabs: Details, Tasks, Volunteers.
// Inline task and volunteer management is handled here so users don't need to
// open the edit form just to check off a task or add a volunteer.
// Props:
//   event          – the event object currently being viewed
//   onClose        – closes the modal
//   onEdit         – switches to the edit form for this event
//   onDelete       – triggers the delete confirmation flow
//   onDuplicate    – clones this event (new id, title gets " (copy)" suffix)
//   onUpdateField  – patches a subset of fields on the event without a full re-save
//   checklist      – the org's preset task list, used by "Apply Preset"
function ViewModal({ event, onClose, onEdit, onDelete, onDuplicate, onUpdateField, checklist=[] }) {
  const [tab, setTab] = useState("details"); // which of the three tabs is active

  // Controlled inputs for the inline "add task" row at the bottom of the Tasks tab
  const [newTask, setNewTask] = useState("");

  // Controlled inputs for the inline "add volunteer" row at the bottom of the Volunteers tab
  const [volName, setVolName] = useState("");
  const [volRole, setVolRole] = useState("");
  const [volEmail, setVolEmail] = useState("");
  const [volPhone, setVolPhone] = useState("");

  // Derived shortcuts so we don't repeat event.tasks ?? [] everywhere
  const tasks = event.tasks || [];
  const volunteers = event.volunteers || [];
  const doneCnt = tasks.filter(t => t.done).length; // count of completed tasks for the progress bar

  // Color lookup for the Food Provided value in the Details tab
  const FOOD_C = { Yes:"#10B981", No:"#EF4444", TBD:"#F59E0B" };

  // Appends a new task to this event's task list, then clears the input
  const addTask = () => { if (!newTask.trim()) return; onUpdateField(event.id, { tasks:[...tasks,{id:uid(),text:newTask.trim(),done:false}] }); setNewTask(""); };
  // Flips the done state of a single task by its id
  const toggleTask = (tid) => onUpdateField(event.id, { tasks:tasks.map(t=>t.id===tid?{...t,done:!t.done}:t) });
  // Removes a task by filtering it out of the array
  const deleteTask = (tid) => onUpdateField(event.id, { tasks:tasks.filter(t=>t.id!==tid) });

  // Appends a new volunteer object and clears all four input fields
  const addVol = () => { if (!volName.trim()) return; onUpdateField(event.id, { volunteers:[...volunteers,{id:uid(),name:volName.trim(),role:volRole.trim(),email:volEmail.trim(),phone:volPhone.trim()}] }); setVolName(""); setVolRole(""); setVolEmail(""); setVolPhone(""); };
  // Removes a volunteer by their id
  const deleteVol = (vid) => onUpdateField(event.id, { volunteers:volunteers.filter(v=>v.id!==vid) });

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:560}}>
        <div className="modal-header"><span className="modal-title">{event.title}</span><button className="modal-close" onClick={onClose}>×</button></div>
        <div className="modal-tabs">
          {["details","tasks","volunteers"].map(t=>(
            <button key={t} className={`modal-tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>
              {t==="details"?"Details":t==="tasks"?`Tasks${tasks.length?` (${doneCnt}/${tasks.length})`:""}`:`Volunteers${volunteers.length?` (${volunteers.length})`:""}`}
            </button>
          ))}
        </div>
        <div className="modal-body">
          {tab==="details" && (
            <div>
              {[["Date",fmtDate(event.date)],["Time",event.startTime?`${fmt12h(event.startTime)}${event.endTime?" – "+fmt12h(event.endTime):""}`:"—"],["Location",event.location||"—"],["Category",event.category||"—"],["Status",event.status||"Planning"],["Semester",event.semester||"—"],["Food Provided",event.food||"—"],["Description",event.description||"—"]].map(([k,v])=>(
                <div key={k} style={{marginBottom:14}}>
                  <div style={{fontSize:11,letterSpacing:1,textTransform:"uppercase",color:T.muted,fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>{k}</div>
                  <div style={{color:k==="Food Provided"&&FOOD_C[v]?FOOD_C[v]:k==="Status"?STATUS_COLORS[v]||T.accent:T.text,fontSize:14,fontWeight:(k==="Food Provided"&&FOOD_C[v])||k==="Status"?600:400}}>{v}</div>
                </div>
              ))}
            </div>
          )}
          {tab==="tasks" && (
            <div>
              <div style={{display:"flex",alignItems:"center",marginBottom:12,gap:8,flexWrap:"wrap"}}>
                {tasks.length>0&&<div style={{flex:1}}><div style={{fontSize:12,color:T.muted,marginBottom:4}}>{doneCnt} / {tasks.length} complete</div><div className="progress-bar-wrap"><div className="progress-bar-fill" style={{width:`${(doneCnt/tasks.length)*100}%`}}/></div></div>}
                <button className="btn btn-ghost btn-sm" style={{marginLeft:"auto",flexShrink:0}} title="Apply preset checklist" onClick={()=>{
                  const existing=new Set(tasks.map(t=>t.text.toLowerCase()));
                  const toAdd=checklist.filter(i=>!existing.has(i.text.toLowerCase())).map(i=>({id:uid(),text:i.text,done:false,notes:i.notes||"",priority:i.priority||""}));
                  if(toAdd.length===0){alert("All preset items are already on this event.");return;}
                  onUpdateField(event.id,{tasks:[...tasks,...toAdd]});
                }}>Apply Preset ({checklist.filter(i=>!new Set(tasks.map(t=>t.text.toLowerCase())).has(i.text.toLowerCase())).length})</button>
              </div>
              {tasks.map(t=>{
                const pc={ASAP:T.red,Later:T.muted}[t.priority]||null;
                return (
                  <div key={t.id} className="task-item">
                    <input type="checkbox" className="task-check" checked={t.done} onChange={()=>toggleTask(t.id)}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                        {pc&&<span className="priority-badge" style={{background:`${pc}22`,color:pc}}>{t.priority}</span>}
                        <span className={`task-text${t.done?" done":""}`}>{t.text}</span>
                      </div>
                      {t.notes&&<div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",marginTop:2,lineHeight:1.5}}>{t.notes}</div>}
                    </div>
                    <button className="task-del" onClick={()=>deleteTask(t.id)}>×</button>
                  </div>
                );
              })}
              {tasks.length===0&&<div style={{color:T.muted,fontSize:13,paddingBottom:12}}>No tasks yet — click Apply Preset to load the standard checklist.</div>}
              <div style={{display:"flex",gap:8,marginTop:14}}><input className="form-input" placeholder="Add a task..." value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()} style={{flex:1}}/><button className="btn btn-primary btn-sm" onClick={addTask} disabled={!newTask.trim()}>Add</button></div>
            </div>
          )}
          {tab==="volunteers" && (
            <div>
              {volunteers.map(v=><div key={v.id} className="vol-item"><div style={{flex:1}}><div className="vol-name">{v.name}{v.role&&<span className="vol-role" style={{marginLeft:8,fontWeight:400}}>· {v.role}</span>}</div>{(v.email||v.phone)&&<div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",marginTop:3,display:"flex",gap:12}}>{v.email&&<a href={`mailto:${v.email}`} style={{color:T.accent}}>{v.email}</a>}{v.phone&&<span>{v.phone}</span>}</div>}</div><button className="task-del" onClick={()=>deleteVol(v.id)}>×</button></div>)}
              {volunteers.length===0&&<div style={{color:T.muted,fontSize:13,paddingBottom:12}}>No volunteers yet.</div>}
              <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}><input className="form-input" placeholder="Name" value={volName} onChange={e=>setVolName(e.target.value)} style={{flex:"1 1 120px"}}/><input className="form-input" placeholder="Role (optional)" value={volRole} onChange={e=>setVolRole(e.target.value)} style={{flex:"1 1 120px"}}/><input className="form-input" placeholder="Email (optional)" value={volEmail} onChange={e=>setVolEmail(e.target.value)} style={{flex:"1 1 150px"}}/><input className="form-input" placeholder="Phone (optional)" value={volPhone} onChange={e=>setVolPhone(e.target.value)} style={{flex:"1 1 110px"}}/><button className="btn btn-primary btn-sm" onClick={addVol} disabled={!volName.trim()}>Add</button></div>
            </div>
          )}
        </div>
        <div className="modal-footer"><button className="btn btn-danger btn-sm" onClick={onDelete}>Delete</button><button className="btn btn-ghost btn-sm" onClick={onDuplicate}>Clone</button><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onEdit}>Edit</button></div>
      </div>
    </div>
  );
}

// ── TasksView ──────────────────────────────────────────────────────────────
function TasksView({ events, onUpdateField }) {
  const [filter, setFilter] = useState("all"); // all | pending | done
  const [newText, setNewText] = useState("");
  const [newEventId, setNewEventId] = useState("");
  const [editingId, setEditingId] = useState(null); // { taskId, eventId }
  const [editText, setEditText] = useState("");
  const [editEventId, setEditEventId] = useState("");

  const allTasks = events.flatMap(e => (e.tasks || []).map(t => ({ ...t, eventId: e.id, eventTitle: e.title })));
  const doneCnt = allTasks.filter(t => t.done).length;
  const pendingCnt = allTasks.length - doneCnt;

  const filtered = allTasks.filter(t => filter === "pending" ? !t.done : filter === "done" ? t.done : true);

  const createTask = () => {
    if (!newText.trim() || !newEventId) return;
    const ev = events.find(e => e.id === newEventId);
    if (!ev) return;
    onUpdateField(newEventId, { tasks: [...(ev.tasks || []), { id: uid(), text: newText.trim(), done: false }] });
    setNewText("");
  };

  const toggleTask = (taskId, eventId) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;
    onUpdateField(eventId, { tasks: (ev.tasks || []).map(t => t.id === taskId ? { ...t, done: !t.done } : t) });
  };

  const deleteTask = (taskId, eventId) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;
    onUpdateField(eventId, { tasks: (ev.tasks || []).filter(t => t.id !== taskId) });
  };

  const startEdit = (task) => {
    setEditingId({ taskId: task.id, eventId: task.eventId });
    setEditText(task.text);
    setEditEventId(task.eventId);
  };

  const saveEdit = () => {
    if (!editText.trim() || !editingId) return;
    const { taskId, eventId } = editingId;
    if (editEventId === eventId) {
      // Same event — update text only
      const ev = events.find(e => e.id === eventId);
      onUpdateField(eventId, { tasks: (ev.tasks || []).map(t => t.id === taskId ? { ...t, text: editText.trim() } : t) });
    } else {
      // Moving to a different event
      const oldEv = events.find(e => e.id === eventId);
      const task = (oldEv.tasks || []).find(t => t.id === taskId);
      onUpdateField(eventId, { tasks: (oldEv.tasks || []).filter(t => t.id !== taskId) });
      const newEv = events.find(e => e.id === editEventId);
      onUpdateField(editEventId, { tasks: [...(newEv.tasks || []), { ...task, text: editText.trim() }] });
    }
    setEditingId(null);
  };

  return (
    <div>
      <div style={{marginBottom:20,display:"flex",alignItems:"center",gap:16}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:18,color:T.white}}>All Tasks</div>
        <span style={{fontSize:12,color:T.muted,fontFamily:"'JetBrains Mono',monospace"}}>{doneCnt}/{allTasks.length} complete</span>
      </div>

      {/* Create task */}
      <div className="card" style={{padding:"16px 20px",marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:600,letterSpacing:1,textTransform:"uppercase",color:T.muted,fontFamily:"'JetBrains Mono',monospace",marginBottom:10}}>New Task</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <input className="form-input" placeholder="Task description..." value={newText}
            onChange={e=>setNewText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createTask()} style={{flex:"1 1 200px"}}/>
          <select className="form-select" value={newEventId} onChange={e=>setNewEventId(e.target.value)} style={{flex:"1 1 160px"}}>
            <option value="">— Assign to event —</option>
            {events.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <button className="btn btn-primary" onClick={createTask} disabled={!newText.trim()||!newEventId}>Add</button>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {[["all","All",allTasks.length],["pending","Pending",pendingCnt],["done","Done",doneCnt]].map(([val,lbl,cnt])=>(
          <button key={val} className={`filter-chip${filter===val?" active":""}`} onClick={()=>setFilter(val)}>{lbl} ({cnt})</button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length===0?(
        <div className="empty-state">
          <div className="empty-icon">{filter==="done"?"🎉":"📝"}</div>
          <div className="empty-title">{filter==="done"?"No completed tasks":filter==="pending"?"All caught up!":"No tasks yet"}</div>
          <div className="empty-sub">{filter==="all"?"Add a task above and assign it to an event.":""}</div>
        </div>
      ):(
        <div className="card">
          {filtered.map((task, i) => {
            const isEditing = editingId?.taskId===task.id && editingId?.eventId===task.eventId;
            return (
              <div key={task.eventId+"-"+task.id} className="tasks-row" style={{borderBottom:i<filtered.length-1?`1px solid ${T.border}`:"none"}}>
                {isEditing?(
                  <div style={{display:"flex",gap:8,flex:1,flexWrap:"wrap",alignItems:"center"}}>
                    <input className="form-input" value={editText} onChange={e=>setEditText(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter")saveEdit();if(e.key==="Escape")setEditingId(null);}}
                      autoFocus style={{flex:"1 1 160px"}}/>
                    <select className="form-select" value={editEventId} onChange={e=>setEditEventId(e.target.value)} style={{flex:"1 1 140px"}}>
                      {events.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={()=>setEditingId(null)}>Cancel</button>
                  </div>
                ):(
                  <>
                    <input type="checkbox" className="task-check" checked={task.done} onChange={()=>toggleTask(task.id,task.eventId)}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                        {task.priority&&<span className="priority-badge" style={{background:`${{ASAP:T.red,Later:T.muted}[task.priority]||T.subtle}22`,color:{ASAP:T.red,Later:T.muted}[task.priority]||T.subtle}}>{task.priority}</span>}
                        <div className={`task-text${task.done?" done":""}`}>{task.text}</div>
                      </div>
                      {task.notes&&<div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>{task.notes}</div>}
                      <div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>{task.eventTitle}</div>
                    </div>
                    <div style={{display:"flex",gap:6,flexShrink:0}}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>startEdit(task)}>Edit</button>
                      <button className="task-del" onClick={()=>deleteTask(task.id,task.eventId)}>×</button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── ChecklistView ──────────────────────────────────────────────────────────
function ChecklistView({ checklist, onSetChecklist }) {
  const [newText, setNewText]           = useState("");
  const [newNotes, setNewNotes]         = useState("");
  const [newPriority, setNewPriority]   = useState("");
  const [editId, setEditId]             = useState(null);
  const [editText, setEditText]         = useState("");
  const [editNotes, setEditNotes]       = useState("");
  const [editPriority, setEditPriority] = useState("");

  const PRIOS   = [["","Normal"],["ASAP","ASAP"],["Later","Later"]];
  const pColor  = (p) => ({ ASAP: T.red, Later: T.muted }[p] || T.subtle);

  const addItem    = () => {
    if (!newText.trim()) return;
    onSetChecklist([...checklist, { id: uid(), text: newText.trim(), notes: newNotes.trim(), priority: newPriority }]);
    setNewText(""); setNewNotes(""); setNewPriority("");
  };
  const deleteItem = (id) => onSetChecklist(checklist.filter(i => i.id !== id));
  const startEdit  = (item) => { setEditId(item.id); setEditText(item.text); setEditNotes(item.notes||""); setEditPriority(item.priority||""); };
  const saveEdit   = () => {
    if (!editText.trim()) return;
    onSetChecklist(checklist.map(i => i.id === editId ? { ...i, text: editText.trim(), notes: editNotes.trim(), priority: editPriority } : i));
    setEditId(null);
  };

  return (
    <div>
      <div style={{marginBottom:12,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:18,color:T.white,flex:1}}>Preset Event Checklist</div>
        <button className="btn btn-ghost btn-sm" onClick={()=>{ if(window.confirm("Reset to default checklist items?")) onSetChecklist(DEFAULT_CHECKLIST); }}>Reset to Defaults</button>
      </div>
      <div style={{color:T.subtle,fontSize:13,marginBottom:16,lineHeight:1.6}}>
        Your organization's standard event checklist. Open any event → <strong style={{color:T.text}}>Tasks</strong> tab → <strong style={{color:T.accent}}>Apply Preset</strong> to stamp these onto that event.
      </div>

      <div className="card" style={{marginBottom:16}}>
        {checklist.length===0&&<div style={{color:T.muted,fontSize:13,padding:"20px",textAlign:"center"}}>No items yet. Add some below.</div>}
        {checklist.map(item => {
          const isEd = editId===item.id;
          return (
            <div key={item.id} className="cl-item">
              {isEd ? (
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <input className="form-input" value={editText} onChange={e=>setEditText(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter")saveEdit();if(e.key==="Escape")setEditId(null);}}
                      autoFocus style={{flex:"1 1 200px"}} placeholder="Task name"/>
                    <select className="form-select" value={editPriority} onChange={e=>setEditPriority(e.target.value)} style={{flex:"0 0 110px"}}>
                      {PRIOS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <input className="form-input" value={editNotes} onChange={e=>setEditNotes(e.target.value)} placeholder="Notes / hints (optional)" style={{fontSize:12}}/>
                  <div style={{display:"flex",gap:6}}>
                    <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={()=>setEditId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      {item.priority&&<span className="priority-badge" style={{background:`${pColor(item.priority)}22`,color:pColor(item.priority)}}>{item.priority}</span>}
                      <span style={{fontSize:14,color:T.text}}>{item.text}</span>
                    </div>
                    {item.notes&&<div className="cl-item-notes">{item.notes}</div>}
                  </div>
                  <div style={{display:"flex",gap:4,flexShrink:0}}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>startEdit(item)}>Edit</button>
                    <button className="task-del" onClick={()=>deleteItem(item.id)}>×</button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="card" style={{padding:"16px 20px"}}>
        <div style={{fontSize:11,fontWeight:600,letterSpacing:1,textTransform:"uppercase",color:T.muted,fontFamily:"'JetBrains Mono',monospace",marginBottom:10}}>Add Item</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
          <input className="form-input" value={newText} onChange={e=>setNewText(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&addItem()} placeholder="Task name" style={{flex:"1 1 200px"}}/>
          <select className="form-select" value={newPriority} onChange={e=>setNewPriority(e.target.value)} style={{flex:"0 0 110px"}}>
            {PRIOS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div style={{display:"flex",gap:8}}>
          <input className="form-input" value={newNotes} onChange={e=>setNewNotes(e.target.value)}
            placeholder="Notes / hints (optional)" style={{flex:1,fontSize:12}}/>
          <button className="btn btn-primary" onClick={addItem} disabled={!newText.trim()}>Add</button>
        </div>
      </div>
    </div>
  );
}

// ── HubView ────────────────────────────────────────────────────────────────
function HubView({ events, onEventClick, onNewEvent, onUpdateField }) {
  const [hubEditId, setHubEditId] = useState(null); // { taskId, eventId }
  const [hubEditText, setHubEditText] = useState("");
  const today = new Date(); today.setHours(0,0,0,0);
  const todayStr = toISODate(today);
  const weekLater = new Date(today); weekLater.setDate(today.getDate()+7);
  const upcomingCount = events.filter(e=>e.date>=todayStr).length;
  const allTasks = events.flatMap(e=>(e.tasks||[]).map(t=>({...t,eventTitle:e.title,eventId:e.id,event:e})));
  const openTasks = allTasks.filter(t=>!t.done);
  const totalVols = events.reduce((s,e)=>s+(e.volunteers||[]).length,0);
  const thisWeek = events.filter(ev=>{if(!ev.date)return false;const d=new Date(ev.date+"T00:00:00");return d>=today&&d<=weekLater;}).sort((a,b)=>a.date.localeCompare(b.date));
  const daysLabel = (dateStr) => { const d=new Date(dateStr+"T00:00:00");const diff=Math.round((d-today)/86400000);if(diff===0)return{label:"Today",color:T.red};if(diff===1)return{label:"Tomorrow",color:T.gold};return{label:diff+" days",color:T.green}; };
  const hubToggle = (t) => { const ev=events.find(e=>e.id===t.eventId); if(!ev)return; onUpdateField(t.eventId,{tasks:(ev.tasks||[]).map(tk=>tk.id===t.id?{...tk,done:!tk.done}:tk)}); };
  const hubDelete = (t) => { const ev=events.find(e=>e.id===t.eventId); if(!ev)return; onUpdateField(t.eventId,{tasks:(ev.tasks||[]).filter(tk=>tk.id!==t.id)}); };
  const hubSaveEdit = () => { if(!hubEditText.trim()||!hubEditId)return; const ev=events.find(e=>e.id===hubEditId.eventId); if(!ev)return; onUpdateField(hubEditId.eventId,{tasks:(ev.tasks||[]).map(t=>t.id===hubEditId.taskId?{...t,text:hubEditText.trim()}:t)}); setHubEditId(null); };
  const hour = new Date().getHours();
  const greeting = hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
  return (
    <div style={{display:"flex",flexDirection:"column",flex:1}}>
      <div style={{marginBottom:24}}><div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:26,color:T.white,marginBottom:4}}>{greeting} 👋</div><div style={{color:T.subtle,fontSize:14}}>Here's your event overview for today.</div></div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Total Events</div><div className="stat-value">{events.length}</div></div>
        <div className="stat-card"><div className="stat-label">Upcoming</div><div className="stat-value" style={{color:T.accent}}>{upcomingCount}</div></div>
        <div className="stat-card"><div className="stat-label">Open Tasks</div><div className="stat-value" style={{color:openTasks.length>0?T.gold:T.green}}>{openTasks.length}</div><div className="stat-sub">{openTasks.length===0?"All done!":"across "+events.filter(e=>(e.tasks||[]).some(t=>!t.done)).length+" event(s)"}</div></div>
        <div className="stat-card"><div className="stat-label">Volunteers</div><div className="stat-value" style={{color:T.subtle}}>{totalVols}</div></div>
      </div>
      <div className="hub-grid">
        <div className="card" style={{padding:"16px 20px",display:"flex",flexDirection:"column"}}>
          <div className="hub-panel-title"><span>📅</span> Coming Up This Week<span style={{marginLeft:"auto",fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",fontWeight:400}}>{thisWeek.length} event{thisWeek.length!==1?"s":""}</span></div>
          {thisWeek.length===0?<div style={{color:T.muted,fontSize:13,textAlign:"center",padding:"20px 0"}}>No events this week</div>:thisWeek.map(ev=>{const{label:dayLbl,color:dayColor}=daysLabel(ev.date);return(<div key={ev.id} className="hub-event-row" onClick={()=>onEventClick(ev)}><div style={{flex:1}}><div className="hub-event-title">{ev.title}</div><div className="hub-event-meta">{fmtDate(ev.date)}{ev.startTime?" · "+fmt12h(ev.startTime):""}</div></div><span className="days-chip" style={{background:dayColor+"22",color:dayColor}}>{dayLbl}</span></div>);})}
        </div>
        <div className="card" style={{padding:"16px 20px",display:"flex",flexDirection:"column"}}>
          <div className="hub-panel-title"><span>✓</span> Open Tasks<span style={{marginLeft:"auto",fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",fontWeight:400}}>{openTasks.length} remaining</span></div>
          {openTasks.length===0
            ? <div style={{color:T.green,fontSize:13,textAlign:"center",padding:"20px 0"}}>🎉 All tasks complete!</div>
            : openTasks.slice(0,12).map(t => {
                const isEd = hubEditId?.taskId===t.id && hubEditId?.eventId===t.eventId;
                return (
                  <div key={t.eventId+"-"+t.id} className="hub-task-row">
                    {isEd ? (
                      <div style={{display:"flex",gap:6,flex:1,flexWrap:"wrap",alignItems:"center"}}>
                        <input className="form-input" value={hubEditText} onChange={e=>setHubEditText(e.target.value)}
                          onKeyDown={e=>{if(e.key==="Enter")hubSaveEdit();if(e.key==="Escape")setHubEditId(null);}}
                          autoFocus style={{flex:1,padding:"5px 8px",fontSize:13}}/>
                        <button className="btn btn-primary btn-sm" onClick={hubSaveEdit}>Save</button>
                        <button className="btn btn-ghost btn-sm" onClick={()=>setHubEditId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <>
                        <input type="checkbox" className="task-check" checked={t.done} onChange={()=>hubToggle(t)} style={{flexShrink:0}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13.5,color:T.text,textDecoration:t.done?"line-through":"none",opacity:t.done?0.5:1}}>{t.text}</div>
                          <div className="hub-task-event">{t.eventTitle}</div>
                        </div>
                        <div style={{display:"flex",gap:4,flexShrink:0}}>
                          <button className="btn btn-ghost btn-sm" onClick={()=>{setHubEditId({taskId:t.id,eventId:t.eventId});setHubEditText(t.text);}}>Edit</button>
                          <button className="task-del" onClick={()=>hubDelete(t)}>×</button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
          }
          {openTasks.length>12&&<div style={{fontSize:12,color:T.muted,marginTop:10,textAlign:"center"}}>+{openTasks.length-12} more — open ☑ Tasks to see all</div>}
        </div>
      </div>
      {events.length===0&&<div className="empty-state" style={{marginTop:24}}><div className="empty-icon">🗓</div><div className="empty-title">No events yet</div><div className="empty-sub">Create your first event or import a spreadsheet to get started.</div><button className="btn btn-primary" onClick={onNewEvent}>＋ Create Event</button></div>}
    </div>
  );
}

// ── PrepView ───────────────────────────────────────────────────────────────
function PrepView({ events, onEventClick }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const weekLater = new Date(today); weekLater.setDate(today.getDate()+7);
  const FOOD_C = { Yes:"#10B981", No:"#EF4444", TBD:"#F59E0B" };
  const upcoming = events.filter(ev=>{if(!ev.date)return false;const d=new Date(ev.date+"T00:00:00");return d>=today&&d<=weekLater;}).sort((a,b)=>a.date.localeCompare(b.date));
  const daysLabel = (dateStr) => { const d=new Date(dateStr+"T00:00:00");const diff=Math.round((d-today)/86400000);if(diff===0)return{label:"Today",color:T.red};if(diff===1)return{label:"Tomorrow",color:T.gold};return{label:`${diff} days`,color:T.green}; };
  return (
    <div>
      <div style={{marginBottom:20,display:"flex",alignItems:"center",gap:12}}><div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:18,color:T.white}}>Events This Week</div><span style={{fontSize:12,color:T.muted,fontFamily:"'JetBrains Mono',monospace"}}>{upcoming.length} event{upcoming.length!==1?"s":""}</span></div>
      {upcoming.length===0?<div className="empty-state"><div className="empty-icon">✅</div><div className="empty-title">All clear this week</div><div className="empty-sub">No events in the next 7 days.</div></div>:upcoming.map(ev=>{const tasks=ev.tasks||[];const volunteers=ev.volunteers||[];const doneCnt=tasks.filter(t=>t.done).length;const{label:dayLbl,color:dayColor}=daysLabel(ev.date);return(<div key={ev.id} className="prep-card" onClick={()=>onEventClick(ev)}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:T.white,flex:1}}>{ev.title}</div><span className="days-chip" style={{background:`${dayColor}22`,color:dayColor}}>{dayLbl}</span></div><div style={{fontSize:12,color:T.subtle,fontFamily:"'JetBrains Mono',monospace"}}>{fmtDate(ev.date)}{ev.startTime?" · "+fmt12h(ev.startTime):""}{ev.location?" · "+ev.location:""}</div><div className="prep-pills"><span className="prep-pill" style={{color:FOOD_C[ev.food]||T.muted,borderColor:ev.food?`${FOOD_C[ev.food]}44`:T.border}}>🍽 {ev.food?`Food: ${ev.food}`:"Food: Not set"}</span><span className="prep-pill">✓ Tasks: {tasks.length===0?"None":`${doneCnt}/${tasks.length}`}</span><span className="prep-pill">👤 {volunteers.length===0?"No volunteers":`${volunteers.length} volunteer${volunteers.length!==1?"s":""}`}</span></div>{tasks.length>0&&<div className="progress-bar-wrap" style={{marginTop:10}}><div className="progress-bar-fill" style={{width:`${(doneCnt/tasks.length)*100}%`}}/></div>}</div>);})}
    </div>
  );
}

// ── CardView ───────────────────────────────────────────────────────────────
function CardView({ events, onEventClick, onEdit, onDelete }) {
  const FOOD_C = { Yes: T.green, No: T.red, TBD: T.gold };
  if (events.length === 0) return (
    <div className="empty-state">
      <div className="empty-icon">📭</div>
      <div className="empty-title">No events</div>
      <div className="empty-sub">Try adjusting your search or filters.</div>
    </div>
  );
  return (
    <div className="events-card-grid">
      {events.map(ev => {
        const accentColor = ev.category && CAT_COLORS[ev.category] ? CAT_COLORS[ev.category] : T.accent;
        const tasks = ev.tasks || [];
        const volunteers = ev.volunteers || [];
        const doneCnt = tasks.filter(t => t.done).length;
        return (
          <div key={ev.id} className="event-card" onClick={() => onEventClick(ev)}>
            <div className="event-card-accent" style={{ background: accentColor }} />
            <div className="event-card-body">
              <div className="event-card-title">{ev.title}</div>
              <div className="event-card-meta">
                {ev.date && (
                  <div className="event-card-meta-row">
                    <i className="event-card-meta-icon">📅</i>
                    {fmtDate(ev.date)}
                    {ev.startTime && <span style={{ marginLeft: 4 }}>· {fmt12h(ev.startTime)}{ev.endTime ? ` – ${fmt12h(ev.endTime)}` : ""}</span>}
                  </div>
                )}
                {ev.location && (
                  <div className="event-card-meta-row">
                    <i className="event-card-meta-icon">📍</i>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.location}</span>
                  </div>
                )}
              </div>
              <div className="event-card-badges">
                {ev.category && <span className="tag" style={{ background: `${accentColor}22`, color: accentColor }}>{ev.category}</span>}
                <span className="tag" style={{ background: `${STATUS_COLORS[ev.status || "Planning"] || T.accent}22`, color: STATUS_COLORS[ev.status || "Planning"] || T.accent }}>{ev.status || "Planning"}</span>
                {ev.food && <span className="tag" style={{ background: `${FOOD_C[ev.food] || T.muted}22`, color: FOOD_C[ev.food] || T.muted }}>🍽 {ev.food}</span>}
              </div>
              {ev.description && <div className="event-card-desc">{ev.description}</div>}
            </div>
            <div className="event-card-footer">
              {tasks.length > 0 && (
                <div className="event-card-footer-item"><span>✓</span>{doneCnt}/{tasks.length}</div>
              )}
              {volunteers.length > 0 && (
                <div className="event-card-footer-item"><span>👤</span>{volunteers.length}</div>
              )}
              {ev.semester && (
                <div className="event-card-footer-item"><span>📆</span>{ev.semester}</div>
              )}
              <div className="event-card-actions" onClick={e => e.stopPropagation()}>
                <button className="btn btn-ghost btn-sm" onClick={() => onEdit(ev)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(ev.id)}>Delete</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function CalendarConverter() {
  const [events, setEvents] = useState(loadEvents);
  const [view, setView] = useState("hub");
  const [eventsView, setEventsView] = useState("list");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [checklist, setChecklist] = useState(loadChecklist);
  const [installPrompt, setInstallPrompt] = useState(null);
  const { toasts, show: toast } = useToast();

  useEffect(() => { saveEvents(events); }, [events]);
  useEffect(() => { saveChecklist(checklist); }, [checklist]);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstallPrompt(null));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstallPrompt(null);
  };

  const mutate = (fn) => setEvents(fn);
  const createEvent = (form) => { mutate(evs=>[...evs,{...form,id:uid()}]); setModal(null); toast("Event created!"); };
  const updateEvent = (form) => { mutate(evs=>evs.map(e=>e.id===form.id?form:e)); setModal(null); toast("Event updated!"); };
  const deleteEvent = (id) => { mutate(evs=>evs.filter(e=>e.id!==id)); setShowDeleteConfirm(null); setModal(null); toast("Event deleted.","error"); };
  const updateEventField = (id, patch) => { mutate(evs=>evs.map(e=>e.id===id?{...e,...patch}:e)); setModal(m=>m?.event?.id===id?{...m,event:{...m.event,...patch}}:m); };
  const clearAllEvents = () => { mutate(()=>[]); setShowClearConfirm(false); toast("All events cleared.","error"); };
  const importEvents = (newEvs) => { mutate(evs=>[...evs,...newEvs]); setShowImport(false); toast(`${newEvs.length} events imported!`); };
  const duplicateEvent = (ev) => { const copy={...ev,id:uid(),title:ev.title+" (copy)",tasks:(ev.tasks||[]).map(t=>({...t,id:uid(),done:false})),volunteers:(ev.volunteers||[]).map(v=>({...v,id:uid()}))}; mutate(evs=>[...evs,copy]); setModal(null); toast("Event duplicated!"); };
  const exportICS = () => { const ics=buildICS(filtered);const blob=new Blob([ics],{type:"text/calendar;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="events.ics";a.click();toast("Calendar exported!"); };

  const filtered = events.filter(ev=>{const q=search.toLowerCase();const ms=!q||ev.title?.toLowerCase().includes(q)||ev.location?.toLowerCase().includes(q)||ev.description?.toLowerCase().includes(q);const mc=catFilter==="All"||ev.category===catFilter;const mp=showPast||!ev.date||(ev.date>=toISODate(new Date()));return ms&&mc&&mp;}).sort((a,b)=>(a.date||"").localeCompare(b.date||""));

  const today = new Date();
  const todayStr = toISODate(today);
  const cats = ["All",...CATEGORIES];

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-logo"><div className="logo-mark"><div className="logo-dot"/><span>CalConvert</span></div><div className="logo-sub">Event Manager</div></div>
          <nav className="sidebar-nav">
            <div className="nav-section-label">Views</div>
            {[{id:"hub",icon:"🏠",label:"Hub"},{id:"events",icon:"☰",label:"Events"},{id:"tasks",icon:"☑",label:"Tasks"},{id:"checklist",icon:"📋",label:"Checklist"},{id:"prep",icon:"⚡",label:"Prep"}].map(n=>(
              <button key={n.id} className={`nav-btn${view===n.id?" active":""}`} onClick={()=>setView(n.id)}>
                <span className="icon">{n.icon}</span>{n.label}
                {n.id==="events"&&<span className="nav-badge">{events.length}</span>}
                {n.id==="tasks"&&(()=>{const cnt=events.flatMap(e=>e.tasks||[]).filter(t=>!t.done).length;return cnt>0?<span className="nav-badge">{cnt}</span>:null;})()}
                {n.id==="prep"&&(()=>{const d0=new Date();d0.setHours(0,0,0,0);const d7=new Date(d0);d7.setDate(d0.getDate()+7);const wk=events.filter(e=>{if(!e.date)return false;const d=new Date(e.date+"T00:00:00");return d>=d0&&d<=d7;}).length;return wk>0?<span className="nav-badge">{wk}</span>:null;})()}
              </button>
            ))}
            <div className="nav-section-label">Tools</div>
            <button className="nav-btn" onClick={()=>setShowImport(true)}><span className="icon">⬆</span>Import</button>
            <button className="nav-btn" onClick={exportICS} disabled={!filtered.length}><span className="icon">⬇</span>Export .ics</button>
            <button className="nav-btn" onClick={()=>setModal({type:"create"})}><span className="icon">＋</span>New Event</button>
          </nav>
          <div className="sidebar-footer"><div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace"}}>{events.length} total events</div></div>
        </aside>

        <div className="main">
          <div className="topbar">
            <div className="topbar-title">{view==="hub"?"Dashboard":view==="events"?"Events":view==="tasks"?"Tasks":view==="checklist"?"Checklist":"Preparation"}</div>
            <div className="search-wrap"><span className="search-icon">🔍</span><input className="search-input" placeholder="Search events..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
            {installPrompt&&<button className="btn btn-primary btn-sm" onClick={installApp} title="Install as app">⬇ Install App</button>}
            <button className="btn btn-ghost btn-sm" onClick={()=>setShowImport(true)}>⬆ Import</button>
            <button className="btn btn-primary btn-sm" onClick={()=>setModal({type:"create"})}>＋ New Event</button>
          </div>

          <div className="content">
            {view==="hub"&&<HubView events={events} onEventClick={ev=>setModal({type:"view",event:ev})} onNewEvent={()=>setModal({type:"create"})} onUpdateField={updateEventField}/>}

            {view==="tasks"&&<TasksView events={events} onUpdateField={updateEventField}/>}

            {view==="checklist"&&<ChecklistView checklist={checklist} onSetChecklist={setChecklist}/>}

            {view==="events"&&(
              <>
                <div className="filter-bar">
                  {cats.map(c=><button key={c} className={`filter-chip${catFilter===c?" active":""}`} onClick={()=>setCatFilter(c)}>{c}</button>)}
                  <button className={`filter-chip${!showPast?" active":""}`} onClick={()=>setShowPast(p=>!p)}>{showPast?"All Dates":"Upcoming"}</button>
                  {(search||catFilter!=="All"||showPast)&&<button className="filter-chip" style={{marginLeft:"auto"}} onClick={()=>{setSearch("");setCatFilter("All");setShowPast(false);}}>✕ Clear</button>}
                  <div className="view-toggle" style={{marginLeft:"auto"}}>
                    <button className={`view-toggle-btn${eventsView==="list"?" active":""}`} onClick={()=>setEventsView("list")}>☰ List</button>
                    <button className={`view-toggle-btn${eventsView==="cards"?" active":""}`} onClick={()=>setEventsView("cards")}>⊞ Cards</button>
                    <button className={`view-toggle-btn${eventsView==="calendar"?" active":""}`} onClick={()=>setEventsView("calendar")}>Month</button>
                    <button className={`view-toggle-btn${eventsView==="week"?" active":""}`} onClick={()=>setEventsView("week")}>Week</button>
                    <button className={`view-toggle-btn${eventsView==="day"?" active":""}`} onClick={()=>setEventsView("day")}>Day</button>
                  </div>
                  {filtered.length>0&&(eventsView==="list"||eventsView==="cards")&&<button className="btn btn-ghost btn-sm" onClick={exportICS}>⬇ Export {filtered.length}</button>}
                  {events.length>0&&(eventsView==="list"||eventsView==="cards")&&<button className="btn btn-danger btn-sm" onClick={()=>setShowClearConfirm(true)}>✕ Clear All</button>}
                </div>

                {eventsView==="list"&&<div className="card">
                  {filtered.length===0?(
                    <div className="empty-state"><div className="empty-icon">📭</div><div className="empty-title">{events.length===0?"No events yet":"No results"}</div><div className="empty-sub">{events.length===0?"Create your first event or import a spreadsheet.":"Try adjusting your search or filters."}</div>{events.length===0&&<button className="btn btn-primary" onClick={()=>setModal({type:"create"})}>＋ Create Event</button>}</div>
                  ):(
                    <table className="event-table">
                      <thead><tr><th>Title</th><th>Date</th><th>Time</th><th>Location</th><th>Category</th><th>Status</th><th>Semester</th><th>Food</th><th>Prep</th><th></th></tr></thead>
                      <tbody>
                        {filtered.map(ev=>(
                          <tr key={ev.id} onClick={()=>setModal({type:"view",event:ev})}>
                            <td className="event-title-cell">{ev.title}</td>
                            <td className="event-date-cell">{fmtDate(ev.date)}</td>
                            <td className="event-date-cell">{ev.startTime?fmt12h(ev.startTime):"—"}{ev.endTime&&` – ${fmt12h(ev.endTime)}`}</td>
                            <td className="event-loc-cell">{ev.location||"—"}</td>
                            <td>{ev.category?<span className="tag" style={{background:`${CAT_COLORS[ev.category]||T.subtle}22`,color:CAT_COLORS[ev.category]||T.subtle}}>{ev.category}</span>:"—"}</td>
                            <td><span className="tag" style={{background:`${STATUS_COLORS[ev.status||"Planning"]||T.accent}22`,color:STATUS_COLORS[ev.status||"Planning"]||T.accent}}>{ev.status||"Planning"}</span></td>
                            <td className="event-date-cell">{ev.semester||"—"}</td>
                            <td>{ev.food?<span className="tag" style={{background:`${({Yes:"#10B981",No:"#EF4444",TBD:"#F59E0B"})[ev.food]||"#8A99AA"}22`,color:({Yes:"#10B981",No:"#EF4444",TBD:"#F59E0B"})[ev.food]||"#8A99AA"}}>{ev.food}</span>:"—"}</td>
                            <td className="event-date-cell" style={{whiteSpace:"nowrap"}}>{(ev.tasks||[]).length>0&&<span style={{marginRight:6}}>{(ev.tasks||[]).filter(t=>t.done).length}/{(ev.tasks||[]).length} ✓</span>}{(ev.volunteers||[]).length>0&&<span>{(ev.volunteers||[]).length} 👤</span>}{!(ev.tasks||[]).length&&!(ev.volunteers||[]).length&&"—"}</td>
                            <td><div className="actions-cell" onClick={e=>e.stopPropagation()}><button className="btn btn-ghost btn-sm" onClick={()=>setModal({type:"edit",event:ev})}>Edit</button><button className="btn btn-danger btn-sm" onClick={()=>setShowDeleteConfirm(ev.id)}>Delete</button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>}

                {eventsView==="cards"&&(
                  filtered.length===0?(
                    <div className="empty-state"><div className="empty-icon">📭</div><div className="empty-title">{events.length===0?"No events yet":"No results"}</div><div className="empty-sub">{events.length===0?"Create your first event or import a spreadsheet.":"Try adjusting your search or filters."}</div>{events.length===0&&<button className="btn btn-primary" onClick={()=>setModal({type:"create"})}>＋ Create Event</button>}</div>
                  ):(
                    <CardView events={filtered} onEventClick={ev=>setModal({type:"view",event:ev})} onEdit={ev=>setModal({type:"edit",event:ev})} onDelete={id=>setShowDeleteConfirm(id)}/>
                  )
                )}

                {eventsView==="calendar"&&(
                  <div className="card" style={{padding:"20px"}}>
                    <CalendarView events={events} onEventClick={ev=>setModal({type:"view",event:ev})} onDayClick={dateStr=>setModal({type:"create",event:{...EMPTY_FORM,date:dateStr}})}/>
                  </div>
                )}

                {eventsView==="week"&&(
                  <div className="card" style={{padding:"20px"}}>
                    <WeekView events={events} onEventClick={ev=>setModal({type:"view",event:ev})} onDayClick={dateStr=>setModal({type:"create",event:{...EMPTY_FORM,date:dateStr}})}/>
                  </div>
                )}

                {eventsView==="day"&&(
                  <div className="card" style={{padding:"20px"}}>
                    <DayView events={events} onEventClick={ev=>setModal({type:"view",event:ev})} onDayClick={dateStr=>setModal({type:"create",event:{...EMPTY_FORM,date:dateStr}})}/>
                  </div>
                )}
              </>
            )}

            {view==="prep"&&<PrepView events={events} onEventClick={ev=>setModal({type:"view",event:ev})}/>}
          </div>
        </div>
      </div>

      {modal&&(modal.type==="create"||modal.type==="edit")&&(
        <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal">
            <div className="modal-header"><span className="modal-title">{modal.type==="create"?"New Event":"Edit Event"}</span><button className="modal-close" onClick={()=>setModal(null)}>×</button></div>
            <div className="modal-body"><EventForm initial={modal.event} onSave={form=>modal.type==="create"?createEvent(form):updateEvent({...modal.event,...form})} onClose={()=>setModal(null)}/></div>
          </div>
        </div>
      )}

      {modal?.type==="view"&&<ViewModal event={modal.event} onClose={()=>setModal(null)} onEdit={()=>setModal({type:"edit",event:modal.event})} onDelete={()=>setShowDeleteConfirm(modal.event.id)} onDuplicate={()=>duplicateEvent(modal.event)} onUpdateField={updateEventField} checklist={checklist}/>}

      {showDeleteConfirm&&(
        <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setShowDeleteConfirm(null)}>
          <div className="modal" style={{maxWidth:400}}>
            <div className="modal-header"><span className="modal-title">Delete Event?</span><button className="modal-close" onClick={()=>setShowDeleteConfirm(null)}>×</button></div>
            <div className="modal-body"><p style={{color:T.subtle}}>This action cannot be undone.</p></div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={()=>setShowDeleteConfirm(null)}>Cancel</button><button className="btn btn-danger" onClick={()=>deleteEvent(showDeleteConfirm)}>Yes, Delete</button></div>
          </div>
        </div>
      )}

      {showClearConfirm&&(
        <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setShowClearConfirm(false)}>
          <div className="modal" style={{maxWidth:400}}>
            <div className="modal-header"><span className="modal-title">Clear All Events?</span><button className="modal-close" onClick={()=>setShowClearConfirm(false)}>×</button></div>
            <div className="modal-body"><p style={{color:T.subtle}}>This will permanently delete all {events.length} events. This cannot be undone.</p></div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={()=>setShowClearConfirm(false)}>Cancel</button><button className="btn btn-danger" onClick={clearAllEvents}>Yes, Clear All</button></div>
          </div>
        </div>
      )}

      {showImport&&<ImportModal onImport={importEvents} onClose={()=>setShowImport(false)}/>}

      <div className="toast-wrap">
        {toasts.map(t=><div key={t.id} className={`toast ${t.type}`}>{t.type==="success"?"✓":"✕"} {t.msg}</div>)}
      </div>
    </>
  );
}