import { Request, Response } from "express";

const customWorkbenchHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Company Research</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f3f5f7;
      --panel: #ffffff;
      --panel-alt: #f8fafc;
      --text: #202124;
      --muted: #667085;
      --line: #d7dee8;
      --strong-line: #aeb8c7;
      --teal: #0f766e;
      --teal-soft: #e4f3f0;
      --blue: #2563eb;
      --blue-soft: #e8eefc;
      --amber: #b45309;
      --amber-soft: #fbefd8;
      --red: #b42318;
      --red-soft: #fee4e2;
      --green: #166534;
      --green-soft: #e7f6eb;
      --ink: #111827;
      --nav: #17211f;
      --nav-muted: #afbbb7;
      --nav-active: #ddf7ef;
      --shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      letter-spacing: 0;
    }

    button,
    input,
    select,
    textarea {
      font: inherit;
      letter-spacing: 0;
    }

    button {
      cursor: pointer;
    }

    .app-shell {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 66px minmax(0, 1fr);
      grid-template-rows: auto 1fr;
    }

    .topbar {
      grid-column: 2;
      border-bottom: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(14px);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .topbar-inner {
      max-width: none;
      margin: 0 auto;
      padding: 10px 24px;
      display: grid;
      grid-template-columns: minmax(180px, 0.55fr) minmax(280px, 1fr) auto;
      gap: 16px;
      align-items: center;
    }

    .brand {
      display: grid;
      gap: 2px;
    }

    h1 {
      margin: 0;
      font-size: 13px;
      line-height: 1.2;
      font-weight: 820;
    }

    .brand span {
      color: var(--muted);
      font-size: 12px;
      font-weight: 680;
    }

    .topbar-actions {
      display: grid;
      grid-template-columns: minmax(180px, 1fr) auto auto auto;
      gap: 8px;
      align-items: center;
      min-width: 0;
    }

    .topbar-actions input {
      min-height: 38px;
      background: var(--panel-alt);
    }

    .topbar-actions .button {
      min-height: 38px;
      white-space: nowrap;
    }

    .status-strip {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .chip {
      min-height: 30px;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      border: 1px solid var(--line);
      background: var(--panel-alt);
      color: var(--muted);
      border-radius: 6px;
      padding: 5px 9px;
      font-size: 12px;
      white-space: nowrap;
    }

    .chip-dot {
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: var(--strong-line);
      flex: 0 0 auto;
    }

    .chip.ok .chip-dot {
      background: var(--teal);
    }

    .chip.warn .chip-dot {
      background: var(--amber);
    }

    .chip.bad .chip-dot {
      background: var(--red);
    }

    .workspace {
      grid-column: 2;
      max-width: none;
      width: 100%;
      margin: 0 auto;
      padding: 22px 28px 30px;
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 16px;
    }

    .settings {
      grid-column: 1;
      grid-row: 1 / span 2;
      align-self: stretch;
      position: sticky;
      top: 0;
      height: 100vh;
      border: 0;
      background: var(--nav);
      border-radius: 0;
      box-shadow: none;
      overflow: hidden;
    }

    .app-nav {
      background: var(--nav);
      min-height: 100%;
      padding: 12px 7px;
      display: grid;
      grid-auto-rows: min-content;
      gap: 8px;
      align-content: start;
    }

    .nav-logo {
      width: 38px;
      height: 38px;
      margin: 0 auto 8px;
      border-radius: 9px;
      display: grid;
      place-items: center;
      background: linear-gradient(145deg, #e7fff8, #95d8ca);
      color: #0d332f;
      font-size: 22px;
      font-weight: 900;
    }

    .nav-section-label {
      display: none;
      color: var(--nav-muted);
      font-size: 11px;
      font-weight: 820;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .nav-link {
      position: relative;
      min-height: 58px;
      color: #eef6f3;
      text-decoration: none;
      display: grid;
      justify-items: center;
      align-content: center;
      gap: 4px;
      border: 1px solid transparent;
      border-radius: 8px;
      padding: 7px 4px;
      font-size: 10px;
      font-weight: 760;
      text-align: center;
      line-height: 1.15;
    }

    .nav-icon {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      display: grid;
      place-items: center;
      background: rgba(255, 255, 255, 0.08);
      color: var(--nav-active);
      font-size: 12px;
      font-weight: 900;
    }

    .nav-link b {
      position: absolute;
      top: 4px;
      right: 3px;
      min-width: 16px;
      height: 16px;
      border-radius: 999px;
      text-align: center;
      background: rgba(221, 247, 239, 0.16);
      color: #ffffff;
      font-size: 9px;
      font-weight: 820;
      line-height: 16px;
    }

    .nav-link.active,
    .nav-link:focus {
      background: rgba(221, 247, 239, 0.12);
      border-color: rgba(221, 247, 239, 0.35);
      outline: none;
    }

    .sidebar-divider {
      display: none;
    }

    .screen-header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 18px;
      align-items: center;
      margin-bottom: 2px;
    }

    .screen-header h2 {
      margin: 0;
      color: var(--ink);
      font-size: 24px;
      line-height: 1.18;
      font-weight: 840;
    }

    .screen-header span {
      color: var(--muted);
      font-size: 13px;
      font-weight: 650;
    }

    .connection-dock {
      border: 1px solid var(--line);
      background: var(--panel);
      border-radius: 8px;
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .connection-dock summary {
      min-height: 46px;
      padding: 12px 14px;
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      cursor: pointer;
      color: var(--ink);
      font-size: 13px;
      font-weight: 820;
      list-style: none;
    }

    .connection-dock summary::-webkit-details-marker {
      display: none;
    }

    .connection-dock summary span {
      color: var(--muted);
      font-size: 12px;
      font-weight: 700;
    }

    .connection-grid {
      border-top: 1px solid var(--line);
      padding: 12px;
      display: grid;
      grid-template-columns: minmax(180px, 1.1fr) minmax(150px, 0.85fr) minmax(150px, 0.85fr) auto;
      gap: 10px;
      align-items: end;
    }

    .connection-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    .run-meta-grid {
      display: grid;
      grid-template-columns: minmax(180px, 1.2fr) minmax(160px, 0.9fr) minmax(140px, 0.75fr) minmax(180px, 1fr);
      gap: 12px;
    }

    .lookup-strip {
      border: 1px solid var(--line);
      background: var(--panel);
      border-radius: 8px;
      box-shadow: var(--shadow);
      padding: 12px;
      display: grid;
      grid-template-columns: minmax(220px, 1fr) auto auto auto;
      gap: 10px;
      align-items: center;
    }

    .lookup-strip input {
      min-height: 40px;
    }

    .advanced-controls {
      border-top: 1px solid var(--line);
      padding-top: 12px;
      display: grid;
      gap: 12px;
    }

    .advanced-controls summary {
      cursor: pointer;
      color: var(--muted);
      font-size: 12px;
      font-weight: 820;
      list-style: none;
    }

    .advanced-controls summary::-webkit-details-marker {
      display: none;
    }

    .recent-runs,
    .contacts-workspace,
    .export-workspace {
      border: 1px solid var(--line);
      background: var(--panel);
      border-radius: 8px;
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .compact-table {
      width: 100%;
      min-width: 760px;
      border-collapse: collapse;
      font-size: 12px;
    }

    .compact-table-wrap {
      overflow: auto;
    }

    .compact-table td,
    .compact-table th {
      padding: 9px 10px;
      border-bottom: 1px solid var(--line);
    }

    .view-pills,
    .export-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    .view-pill {
      border: 1px solid var(--line);
      background: #fff;
      color: var(--text);
      border-radius: 999px;
      min-height: 30px;
      padding: 5px 10px;
      font-size: 12px;
      font-weight: 760;
    }

    .view-pill.active {
      border-color: #add6b6;
      background: var(--green-soft);
      color: var(--green);
    }

    .export-card {
      flex: 1 1 190px;
      min-height: 88px;
      border: 1px solid var(--line);
      background: var(--panel-alt);
      border-radius: 8px;
      padding: 12px;
      display: grid;
      gap: 8px;
      align-content: space-between;
    }

    .export-card b {
      font-size: 13px;
    }

    .export-card span {
      color: var(--muted);
      font-size: 12px;
      line-height: 1.4;
    }

    .settings-header,
    .panel-header {
      padding: 13px 14px;
      border-bottom: 1px solid var(--line);
      background: var(--panel-alt);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .settings-header h2,
    .panel-header h2 {
      margin: 0;
      font-size: 14px;
      line-height: 1.2;
    }

    .settings-body {
      padding: 14px;
      display: grid;
      gap: 12px;
    }

    .field {
      display: grid;
      gap: 6px;
      min-width: 0;
    }

    .field label,
    .toggle span,
    .check span {
      color: var(--muted);
      font-size: 12px;
      font-weight: 700;
    }

    input,
    select,
    textarea {
      width: 100%;
      min-width: 0;
      border: 1px solid var(--line);
      background: #fff;
      color: var(--text);
      border-radius: 6px;
      padding: 9px 10px;
      outline: none;
    }

    input:focus,
    select:focus,
    textarea:focus {
      border-color: var(--blue);
      box-shadow: 0 0 0 3px var(--blue-soft);
    }

    textarea {
      min-height: 138px;
      resize: vertical;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 12px;
      line-height: 1.45;
    }

    .toggle,
    .check {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 32px;
    }

    .toggle input,
    .check input {
      width: 16px;
      height: 16px;
      flex: 0 0 auto;
    }

    .main {
      min-width: 0;
      display: grid;
      gap: 18px;
    }

    .panel,
    .metric-card,
    .detail {
      border: 1px solid var(--line);
      background: var(--panel);
      border-radius: 8px;
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .panel-body {
      padding: 16px;
      display: grid;
      gap: 16px;
    }

    .research-grid {
      display: grid;
      grid-template-columns: minmax(260px, 1.2fr) minmax(260px, 1fr);
      gap: 14px;
      align-items: start;
    }

    .controls-grid {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: 12px;
      align-items: end;
    }

    .enrichment-row {
      grid-column: span 12;
      display: flex;
      flex-wrap: wrap;
      gap: 10px 16px;
      align-items: center;
      border-top: 1px solid var(--line);
      padding-top: 12px;
    }

    .span-2 { grid-column: span 2; }
    .span-3 { grid-column: span 3; }
    .span-4 { grid-column: span 4; }
    .span-6 { grid-column: span 6; }
    .span-12 { grid-column: span 12; }

    .actions {
      display: flex;
      gap: 9px;
      flex-wrap: wrap;
      align-items: center;
    }

    .button {
      min-height: 38px;
      border: 1px solid var(--strong-line);
      background: #fff;
      color: var(--text);
      border-radius: 6px;
      padding: 8px 12px;
      font-weight: 760;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
    }

    .button.primary {
      border-color: #0f5f58;
      background: var(--teal);
      color: #fff;
    }

    .button.blue {
      border-color: #1d4ed8;
      background: var(--blue);
      color: #fff;
    }

    .button.warn {
      border-color: #92400e;
      background: var(--amber);
      color: #fff;
    }

    .button:disabled {
      cursor: not-allowed;
      opacity: 0.62;
    }

    .mini {
      min-height: 30px;
      padding: 5px 8px;
      font-size: 12px;
      border-radius: 6px;
      border: 1px solid var(--line);
      background: #fff;
      color: var(--text);
      font-weight: 720;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 12px;
    }

    .metric-card {
      padding: 12px;
      display: grid;
      gap: 5px;
    }

    .metric-card b {
      font-size: 22px;
      line-height: 1.15;
    }

    .metric-card span {
      color: var(--muted);
      font-size: 12px;
      font-weight: 700;
    }

    .quality-block {
      display: grid;
      gap: 8px;
    }

    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .section-title h2 {
      margin: 0;
      font-size: 14px;
      line-height: 1.2;
      color: var(--ink);
    }

    .section-title span {
      color: var(--muted);
      font-size: 12px;
      font-weight: 700;
    }

    .quality-strip {
      border: 1px solid var(--line);
      background: var(--panel);
      border-radius: 8px;
      box-shadow: var(--shadow);
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      overflow: hidden;
    }

    .quality-item {
      min-height: 76px;
      padding: 13px 14px;
      display: grid;
      gap: 5px;
      align-content: center;
      border-right: 1px solid var(--line);
    }

    .quality-item:last-child {
      border-right: 0;
    }

    .quality-item b {
      font-size: 20px;
      line-height: 1.15;
    }

    .quality-item span {
      color: var(--muted);
      font-size: 12px;
      font-weight: 720;
    }

    .toolbar {
      display: grid;
      grid-template-columns: minmax(220px, 1fr) 150px 170px 130px auto;
      gap: 10px;
      align-items: end;
    }

    .column-picker {
      border: 1px solid var(--line);
      border-radius: 6px;
      background: var(--panel-alt);
      padding: 10px;
      display: grid;
      gap: 10px;
    }

    .column-picker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .column-picker-title {
      color: var(--muted);
      font-size: 12px;
      font-weight: 780;
    }

    .column-options {
      display: grid;
      grid-template-columns: repeat(5, minmax(130px, 1fr));
      gap: 6px 12px;
    }

    .table-wrap {
      overflow: auto;
      border-top: 1px solid var(--line);
      max-height: 560px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 1320px;
      font-size: 12px;
    }

    th,
    td {
      border-bottom: 1px solid var(--line);
      padding: 9px 10px;
      text-align: left;
      vertical-align: top;
    }

    th {
      position: sticky;
      top: 0;
      z-index: 1;
      background: var(--panel-alt);
      color: var(--muted);
      font-weight: 780;
    }

    td {
      word-break: break-word;
    }

    .clean-chip {
      border-color: #add6b6;
      background: var(--green-soft);
      color: var(--green);
    }

    tr[data-row-id] {
      cursor: pointer;
    }

    tr[data-row-id]:hover {
      background: #f7fbfb;
    }

    tr.selected {
      background: var(--teal-soft);
    }

    .status-pill,
    .keyword-pill {
      display: inline-flex;
      align-items: center;
      min-height: 24px;
      border-radius: 999px;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 780;
      border: 1px solid var(--line);
      background: var(--panel-alt);
      color: var(--muted);
      white-space: nowrap;
    }

    .status-pill.done {
      border-color: #add6b6;
      background: var(--green-soft);
      color: var(--green);
    }

    .status-pill.running {
      border-color: #a9c0f5;
      background: var(--blue-soft);
      color: var(--blue);
    }

    .status-pill.failed {
      border-color: #f3b2ad;
      background: var(--red-soft);
      color: var(--red);
    }

    .status-pill.queued {
      border-color: var(--line);
      background: var(--panel-alt);
      color: var(--muted);
    }

    .keyword-list {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
    }

    .keyword-pill {
      background: var(--amber-soft);
      color: #7c3f04;
      border-color: #e8c98f;
    }

    .domain-cell {
      display: grid;
      gap: 3px;
    }

    .domain-cell b {
      font-size: 13px;
    }

    .domain-cell span,
    .muted {
      color: var(--muted);
      font-size: 12px;
    }

    .score {
      font-weight: 820;
      font-size: 16px;
      color: var(--ink);
    }

    .empty {
      padding: 34px 14px;
      color: var(--muted);
      text-align: center;
      font-weight: 700;
    }

    .detail {
      display: grid;
      grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
    }

    .detail-snapshot,
    .detail-main,
    .detail-context {
      min-width: 0;
      padding: 16px;
      display: grid;
      gap: 12px;
    }

    .detail-snapshot {
      border-right: 1px solid var(--line);
    }

    .detail-main {
      align-content: start;
    }

    .detail-context {
      grid-column: 1 / -1;
      border-top: 1px solid var(--line);
      background: var(--panel-alt);
    }

    .detail h3 {
      margin: 0;
      font-size: 16px;
      line-height: 1.35;
    }

    .detail a {
      color: var(--blue);
      overflow-wrap: anywhere;
    }

    .snapshot-toolbar {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: start;
      min-width: 0;
    }

    .snapshot-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .snapshot-frame {
      min-height: 330px;
      border: 1px solid var(--line);
      border-radius: 8px;
      overflow: hidden;
      background: linear-gradient(180deg, #ffffff 0%, #eef7f5 100%);
      display: grid;
      grid-template-rows: auto 1fr;
    }

    .snapshot-browser {
      min-height: 42px;
      padding: 10px 12px;
      border-bottom: 1px solid var(--line);
      background: #fff;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: 10px;
      align-items: center;
      color: var(--muted);
      font-size: 12px;
      font-weight: 720;
    }

    .snapshot-dots {
      display: flex;
      gap: 5px;
    }

    .snapshot-dots span {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: var(--line);
    }

    .snapshot-content {
      min-height: 286px;
      padding: 22px;
      display: grid;
      align-content: space-between;
      gap: 20px;
    }

    .snapshot-domain {
      color: var(--muted);
      font-size: 12px;
      font-weight: 820;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .snapshot-heading {
      color: var(--ink);
      font-size: 24px;
      font-weight: 820;
      line-height: 1.2;
      max-width: 760px;
    }

    .snapshot-content p {
      margin: 10px 0 0;
      color: var(--text);
      font-size: 13px;
      line-height: 1.55;
      max-width: 760px;
    }

    .snapshot-meta {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
    }

    .snapshot-stat {
      min-width: 0;
      border-top: 1px solid var(--line);
      padding-top: 10px;
      display: grid;
      gap: 3px;
    }

    .snapshot-stat b {
      font-size: 13px;
      line-height: 1.25;
    }

    .snapshot-stat span {
      color: var(--muted);
      font-size: 11px;
      font-weight: 720;
    }

    .context-list {
      display: grid;
      gap: 10px;
      max-height: 320px;
      overflow: auto;
    }

    .context-item {
      border: 1px solid var(--line);
      border-radius: 6px;
      background: #fff;
      padding: 10px;
      display: grid;
      gap: 6px;
      font-size: 12px;
      line-height: 1.45;
    }

    .context-item b {
      color: #7c3f04;
    }

    .summary-text {
      color: var(--text);
      font-size: 13px;
      line-height: 1.55;
      max-height: 140px;
      overflow: auto;
      padding-right: 4px;
    }

    .data-list {
      display: grid;
      gap: 8px;
      font-size: 12px;
      line-height: 1.45;
    }

    .data-list div {
      display: grid;
      gap: 3px;
    }

    .data-list b {
      color: var(--muted);
      font-size: 11px;
      text-transform: uppercase;
    }

    .toast {
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 30;
      min-width: 260px;
      max-width: min(420px, calc(100vw - 36px));
      border: 1px solid var(--line);
      background: var(--panel);
      color: var(--text);
      border-radius: 8px;
      box-shadow: var(--shadow);
      padding: 12px 14px;
      display: none;
      font-weight: 720;
    }

    .toast.show {
      display: block;
    }

    @media (max-width: 1120px) {
      .research-grid,
      .detail {
        grid-template-columns: 1fr;
      }

      .connection-grid,
      .run-meta-grid {
        grid-template-columns: 1fr 1fr;
      }

      .detail-snapshot {
        border-right: 0;
        border-bottom: 1px solid var(--line);
      }

      .detail-context {
        border-top: 1px solid var(--line);
      }
    }

    @media (max-width: 840px) {
      .topbar-inner,
      .topbar-actions,
      .screen-header,
      .connection-grid,
      .run-meta-grid,
      .toolbar {
        grid-template-columns: 1fr;
      }

      .column-options {
        grid-template-columns: 1fr 1fr;
      }

      .status-strip {
        justify-content: flex-start;
      }

      .metrics {
        grid-template-columns: 1fr 1fr;
      }

      .quality-strip,
      .snapshot-meta {
        grid-template-columns: 1fr 1fr;
      }

      .quality-item:nth-child(2n) {
        border-right: 0;
      }

      .controls-grid {
        grid-template-columns: 1fr;
      }

      .span-2,
      .span-3,
      .span-4,
      .span-6,
      .span-12,
      .enrichment-row {
        grid-column: auto;
      }
    }

    @media (max-width: 520px) {
      .app-shell {
        grid-template-columns: 56px minmax(0, 1fr);
      }

      .settings {
        width: 56px;
      }

      .nav-link {
        min-height: 54px;
        font-size: 9px;
      }

      .nav-icon {
        width: 20px;
        height: 20px;
      }

      .workspace,
      .topbar-inner {
        padding-left: 12px;
        padding-right: 12px;
      }

      .metrics {
        grid-template-columns: 1fr;
      }

      .quality-strip,
      .snapshot-meta {
        grid-template-columns: 1fr;
      }

      .quality-item {
        border-right: 0;
        border-bottom: 1px solid var(--line);
      }

      .quality-item:last-child {
        border-bottom: 0;
      }

      .snapshot-toolbar {
        display: grid;
      }

      .snapshot-actions {
        justify-content: flex-start;
      }

      .column-options {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="app-shell">
    <aside class="settings">
      <nav class="app-nav" aria-label="Workspace">
        <div class="nav-logo">S</div>
        <div class="nav-section-label">Workspace</div>
        <a class="nav-link active" href="#bulkRun"><span class="nav-icon">C</span><span>Command</span><b id="navTotal">0</b></a>
        <a class="nav-link" href="#companiesPanel"><span class="nav-icon">Co</span><span>Companies</span><b id="navDone">0</b></a>
        <a class="nav-link" href="#contactsPanel"><span class="nav-icon">P</span><span>Contacts</span><b id="navContacts">0</b></a>
        <a class="nav-link" href="#runHistory"><span class="nav-icon">R</span><span>Runs</span><b id="navRuns">0</b></a>
        <a class="nav-link" href="#exportPanel"><span class="nav-icon">E</span><span>Exports</span><b id="navMatched">0</b></a>
        <a class="nav-link" href="#connectionDock"><span class="nav-icon">S</span><span>Settings</span><b id="navFailed">0</b></a>
      </nav>
    </aside>

    <header class="topbar">
      <div class="topbar-inner">
        <div class="brand">
          <h1>Company Research</h1>
          <span>Local Firecrawl Workbench</span>
        </div>
        <div class="topbar-actions">
          <input id="globalSearch" autocomplete="off" spellcheck="false" placeholder="Search or paste a domain" />
          <button id="lookupButton" class="button" type="button">Lookup</button>
          <button id="topRunButton" class="button primary" type="button">Run</button>
          <button id="topExportButton" class="button" type="button">CSV</button>
        </div>
        <div class="status-strip">
          <span id="apiStatus" class="chip warn"><span class="chip-dot"></span><span>API unchecked</span></span>
          <span id="customStatus" class="chip warn"><span class="chip-dot"></span><span>Custom key unset</span></span>
          <span id="lushaStatus" class="chip warn"><span class="chip-dot"></span><span>Lusha unchecked</span></span>
        </div>
      </div>
    </header>

    <main class="workspace">
      <section class="main">
        <section class="screen-header">
          <div>
            <h2>Command Center</h2>
            <span>Build saved account lists, run research, and turn web evidence into usable company intelligence.</span>
          </div>
          <div class="actions">
            <button id="newRunButton" class="button" type="button">New List</button>
            <button id="headerRunButton" class="button primary" type="button">Run Research</button>
            <button id="headerExportButton" class="button" type="button">Export CSV</button>
          </div>
        </section>

        <section id="bulkRun" class="panel">
          <div class="panel-header">
            <h2>Bulk Research List</h2>
            <div class="actions">
              <button id="sampleButton" class="mini" type="button">Sample</button>
              <button id="clearButton" class="mini" type="button">Clear</button>
            </div>
          </div>
          <div class="panel-body">
            <div class="run-meta-grid">
              <div class="field">
                <label for="runName">List name</label>
                <input id="runName" autocomplete="off" spellcheck="false" />
              </div>
              <div class="field">
                <label for="runCampaign">Campaign</label>
                <input id="runCampaign" autocomplete="off" spellcheck="false" />
              </div>
              <div class="field">
                <label for="runOwner">Owner</label>
                <input id="runOwner" autocomplete="off" spellcheck="false" />
              </div>
              <div class="field">
                <label for="runGoal">ICP goal</label>
                <input id="runGoal" autocomplete="off" spellcheck="false" />
              </div>
            </div>
            <div class="research-grid">
              <div class="field">
                <label for="researchUrls">Websites</label>
                <textarea id="researchUrls" spellcheck="false" placeholder="https://example.com"></textarea>
              </div>
              <div class="field">
                <label for="researchKeywords">Smart keywords</label>
                <textarea id="researchKeywords" spellcheck="false"></textarea>
              </div>
            </div>
            <div class="enrichment-row">
              <label class="check"><input id="checkMx" type="checkbox" checked /><span>MX provider</span></label>
              <label class="check"><input id="checkWebsite" type="checkbox" checked /><span>Domain status</span></label>
              <label class="check"><input id="extractContacts" type="checkbox" checked /><span>Emails, phones, addresses</span></label>
            </div>
            <details class="advanced-controls">
              <summary>Advanced run settings</summary>
              <div class="controls-grid">
                <div class="field span-2">
                  <label for="concurrency">Parallel</label>
                  <select id="concurrency">
                    <option value="1">1</option>
                    <option value="2" selected>2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>
                <div class="field span-2">
                  <label for="scrapeWait">Wait ms</label>
                  <input id="scrapeWait" type="number" min="0" max="60000" step="500" value="0" />
                </div>
                <div class="field span-2">
                  <label for="scrapeTimeout">Timeout ms</label>
                  <input id="scrapeTimeout" type="number" min="1000" step="1000" value="30000" />
                </div>
                <div class="field span-3">
                  <label for="runMode">Content</label>
                  <select id="runMode">
                    <option value="main" selected>Main content</option>
                    <option value="all">Full page</option>
                  </select>
                </div>
                <div class="field span-3">
                  <label for="dedupeMode">List handling</label>
                  <select id="dedupeMode">
                    <option value="dedupe" selected>Deduplicate domains</option>
                    <option value="keep">Keep every row</option>
                  </select>
                </div>
                <div class="field span-3">
                  <label for="domainTimeout">Domain timeout ms</label>
                  <input id="domainTimeout" type="number" min="1000" max="30000" step="1000" value="8000" />
                </div>
              </div>
            </details>
            <div class="actions span-12">
              <button id="previewButton" class="button" type="button">Preview List</button>
              <button id="saveRunButton" class="button" type="button">Save List</button>
              <button id="runButton" class="button primary" type="button">Run Research</button>
              <button id="stopButton" class="button warn" type="button" disabled>Stop</button>
            </div>
          </div>
        </section>

        <section id="runHistory" class="recent-runs">
          <div class="panel-header">
            <h2>Recent Runs</h2>
            <div class="actions">
              <button id="saveCurrentViewButton" class="mini" type="button">Save View</button>
            </div>
          </div>
          <div class="compact-table-wrap">
            <table class="compact-table">
              <thead>
                <tr><th>List</th><th>Status</th><th>Progress</th><th>Companies</th><th>Campaign</th><th>Updated</th><th></th></tr>
              </thead>
              <tbody id="recentRunsBody">
                <tr><td colspan="7"><div class="empty">No saved runs yet</div></td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="metrics">
          <div class="metric-card"><b id="metricTotal">0</b><span>Total</span></div>
          <div class="metric-card"><b id="metricDone">0</b><span>Done</span></div>
          <div class="metric-card"><b id="metricRunning">0</b><span>Running</span></div>
          <div class="metric-card"><b id="metricMatched">0</b><span>Matched</span></div>
          <div class="metric-card"><b id="metricContacts">0</b><span>Contacts</span></div>
          <div class="metric-card"><b id="metricFailed">0</b><span>Failed</span></div>
        </section>

        <section id="dataQuality" class="quality-block">
          <div class="section-title">
            <h2>Data Quality Overview</h2>
            <span>Current run</span>
          </div>
          <div class="quality-strip">
            <div class="quality-item"><b id="qualityActive">0</b><span>Active domains</span></div>
            <div class="quality-item"><b id="qualityMail">0</b><span>Mail servers found</span></div>
            <div class="quality-item"><b id="qualityRedirects">0</b><span>Redirecting domains</span></div>
            <div class="quality-item"><b id="qualityClean">0</b><span>Clean records</span></div>
          </div>
        </section>

        <section id="companiesPanel" class="panel">
          <div class="panel-header">
            <h2>Company Table</h2>
            <div class="actions">
              <button id="exportCsvButton" class="mini" type="button">CSV</button>
              <button id="exportJsonButton" class="mini" type="button">JSON</button>
            </div>
          </div>
          <div class="panel-body">
            <div class="toolbar">
              <div class="field">
                <label for="resultSearch">Search</label>
                <input id="resultSearch" autocomplete="off" spellcheck="false" />
              </div>
              <div class="field">
                <label for="statusFilter">Status</label>
                <select id="statusFilter">
                  <option value="all">All</option>
                  <option value="matched">Matched</option>
                  <option value="hasContacts">Has contacts</option>
                  <option value="active">Active domain</option>
                  <option value="redirecting">Redirecting</option>
                  <option value="inactive">Inactive</option>
                  <option value="done">Done</option>
                  <option value="running">Running</option>
                  <option value="queued">Queued</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div class="field">
                <label for="sortBy">Sort</label>
                <select id="sortBy">
                  <option value="score" selected>Score</option>
                  <option value="matches">Matched keywords</option>
                  <option value="contacts">Contact data</option>
                  <option value="mxProvider">MX provider</option>
                  <option value="websiteStatus">Website status</option>
                  <option value="domain">Domain</option>
                  <option value="status">Status</option>
                  <option value="elapsedMs">Time</option>
                </select>
              </div>
              <button id="resetColumnsButton" class="button" type="button">Reset</button>
              <button id="sortDirectionButton" class="button" type="button">Desc</button>
            </div>
            <div id="savedViews" class="view-pills"></div>
            <div id="columnPicker" class="column-picker"></div>
          </div>
          <div class="table-wrap">
            <table>
              <thead id="resultsHead"></thead>
              <tbody id="resultsBody">
                <tr><td colspan="8"><div class="empty">No companies loaded</div></td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="contactsPanel" class="contacts-workspace">
          <div class="panel-header">
            <h2>Contacts Workspace</h2>
            <div class="actions">
              <button id="exportContactsButton" class="mini" type="button">Contacts CSV</button>
            </div>
          </div>
          <div class="compact-table-wrap">
            <table class="compact-table">
              <thead>
                <tr><th>Company</th><th>Contact</th><th>Type</th><th>Source</th></tr>
              </thead>
              <tbody id="contactsBody">
                <tr><td colspan="4"><div class="empty">Run research to collect emails, phones, and address signals</div></td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="detailPanel" class="detail">
          <div class="detail-snapshot">
            <div class="snapshot-toolbar">
              <div>
                <div class="muted">Website Snapshot</div>
                <h3 id="snapshotTitle">No selection</h3>
              </div>
              <div class="snapshot-actions">
                <button id="openSelectedButton" class="mini" type="button" disabled>Open</button>
                <button id="copySelectedButton" class="mini" type="button" disabled>Copy URL</button>
              </div>
            </div>
            <div id="snapshotFrame" class="snapshot-frame">
              <div class="empty">Select a row</div>
            </div>
          </div>
          <div class="detail-main">
            <div class="muted">Selected company</div>
            <h3 id="detailTitle">No selection</h3>
            <a id="detailUrl" href="#" target="_blank" rel="noreferrer"></a>
            <div id="detailPills" class="keyword-list"></div>
            <div id="detailSummary" class="summary-text"></div>
            <div id="detailContacts" class="data-list"></div>
          </div>
          <div class="detail-context">
            <div class="muted">Keyword context</div>
            <div id="detailContexts" class="context-list">
              <div class="empty">Select a row</div>
            </div>
          </div>
        </section>

        <section id="exportPanel" class="export-workspace">
          <div class="panel-header">
            <h2>Export Packages</h2>
            <div class="actions">
              <button id="exportViewButton" class="mini" type="button">Export Current View</button>
            </div>
          </div>
          <div class="panel-body">
            <div class="export-grid">
              <button class="export-card" id="exportCompaniesCard" type="button"><b>Companies CSV</b><span>Clean company rows with domain health, MX, scores, and source URLs.</span></button>
              <button class="export-card" id="exportContactsCard" type="button"><b>Contacts CSV</b><span>Extracted emails and phones with company association keys.</span></button>
              <button class="export-card" id="exportHubspotCard" type="button"><b>HubSpot Companies</b><span>CRM-ready account fields using domain as the unique key.</span></button>
              <button class="export-card" id="exportJsonCard" type="button"><b>Research JSON</b><span>Full normalized run data for debugging or AI enrichment.</span></button>
            </div>
          </div>
        </section>

        <details id="connectionDock" class="connection-dock">
          <summary>Settings and providers <span>Firecrawl, custom key, Lusha, local API</span></summary>
          <div class="connection-grid">
            <div class="field">
              <label for="baseUrl">API base</label>
              <input id="baseUrl" autocomplete="off" spellcheck="false" />
            </div>
            <div class="field">
              <label for="firecrawlKey">Firecrawl key</label>
              <input id="firecrawlKey" type="password" autocomplete="off" spellcheck="false" />
            </div>
            <div class="field">
              <label for="customKey">Custom key</label>
              <input id="customKey" type="password" autocomplete="off" spellcheck="false" />
            </div>
            <div class="connection-actions">
              <label class="toggle">
                <input id="showKeys" type="checkbox" />
                <span>Show keys</span>
              </label>
              <button class="mini" id="checkConnectionButton" type="button">Check</button>
              <button id="usageButton" class="mini" type="button">Lusha credits</button>
              <button id="saveSettingsButton" class="mini" type="button">Save</button>
            </div>
          </div>
        </details>
      </section>
    </main>
  </div>
  <div id="toast" class="toast"></div>

  <script>
    (function () {
      var storageKey = "company-research-workbench";
      var defaultKeywords = "security, compliance, SOC 2, ISO 27001, GDPR, risk, audit, SSO, SAML, API, integration, enterprise, pricing, customers, case study, partner, funding, careers";
      var rows = [];
      var selectedRowId = null;
      var stopRequested = false;
      var running = false;
      var sortDescending = true;
      var lastResult = null;
      var visibleColumnKeys = [];
      var entityDecoder = null;
      var savedRuns = [];
      var savedViews = [];
      var currentRunId = null;
      var activeViewKey = "all";

      var columnDefinitions = [
        { key: "company", label: "Company", defaultVisible: true, render: companyCell },
        { key: "site", label: "Site", defaultVisible: true, render: siteCell },
        { key: "mail", label: "Mail Server", defaultVisible: true, render: mxCell },
        { key: "score", label: "Score", defaultVisible: true, render: scoreCell },
        { key: "keywords", label: "Keywords", defaultVisible: true, render: keywordsCell },
        { key: "contacts", label: "Contacts", defaultVisible: true, render: contactCell },
        { key: "contactEmails", label: "Contact Emails", defaultVisible: false, render: contactEmailsCell },
        { key: "allEmails", label: "All Emails", defaultVisible: false, render: allEmailsCell },
        { key: "phones", label: "Phones", defaultVisible: false, render: phonesCell },
        { key: "addresses", label: "Addresses", defaultVisible: false, render: addressesCell },
        { key: "finalUrl", label: "Final URL", defaultVisible: false, render: finalUrlCell },
        { key: "redirects", label: "Redirects", defaultVisible: false, render: redirectsCell },
        { key: "mxRecords", label: "MX Records", defaultVisible: false, render: mxRecordsCell },
        { key: "summary", label: "Clean Summary", defaultVisible: true, render: summaryCell },
        { key: "time", label: "Time", defaultVisible: true, render: timeCell }
      ];

      function $(id) {
        return document.getElementById(id);
      }

      function loadSettings() {
        try {
          return JSON.parse(localStorage.getItem(storageKey) || "{}");
        } catch (error) {
          return {};
        }
      }

      function saveSettings(silent) {
        var next = {
          baseUrl: $("baseUrl").value.trim(),
          firecrawlKey: $("firecrawlKey").value,
          customKey: $("customKey").value,
          runName: $("runName").value,
          runCampaign: $("runCampaign").value,
          runOwner: $("runOwner").value,
          runGoal: $("runGoal").value,
          urls: $("researchUrls").value,
          keywords: $("researchKeywords").value,
          concurrency: $("concurrency").value,
          scrapeWait: $("scrapeWait").value,
          scrapeTimeout: $("scrapeTimeout").value,
          runMode: $("runMode").value,
          dedupeMode: $("dedupeMode").value,
          domainTimeout: $("domainTimeout").value,
          checkMx: $("checkMx").checked,
          checkWebsite: $("checkWebsite").checked,
          extractContacts: $("extractContacts").checked,
          visibleColumns: visibleColumnKeys,
          savedRuns: savedRuns,
          savedViews: savedViews,
          currentRunId: currentRunId,
          activeViewKey: activeViewKey
        };
        localStorage.setItem(storageKey, JSON.stringify(next));
        updateKeyStatus();
        if (!silent) showToast("Settings saved");
      }

      function initSettings() {
        var settings = loadSettings();
        $("baseUrl").value = settings.baseUrl || window.location.origin;
        $("firecrawlKey").value = settings.firecrawlKey || "";
        $("customKey").value = settings.customKey || "";
        $("runName").value = settings.runName || "Q3 Target Account List";
        $("runCampaign").value = settings.runCampaign || "Outbound research";
        $("runOwner").value = settings.runOwner || "You";
        $("runGoal").value = settings.runGoal || "Find strong ICP and contact signals";
        $("researchUrls").value = settings.urls || "https://www.pistachioapp.com";
        $("researchKeywords").value = settings.keywords || defaultKeywords;
        $("concurrency").value = settings.concurrency || "2";
        $("scrapeWait").value = settings.scrapeWait || "0";
        $("scrapeTimeout").value = settings.scrapeTimeout || "30000";
        $("runMode").value = settings.runMode || "main";
        $("dedupeMode").value = settings.dedupeMode || "dedupe";
        $("domainTimeout").value = settings.domainTimeout || "8000";
        $("checkMx").checked = settings.checkMx !== false;
        $("checkWebsite").checked = settings.checkWebsite !== false;
        $("extractContacts").checked = settings.extractContacts !== false;
        visibleColumnKeys = sanitizeColumnKeys(settings.visibleColumns);
        savedRuns = Array.isArray(settings.savedRuns) ? settings.savedRuns : [];
        savedViews = Array.isArray(settings.savedViews) ? settings.savedViews : [];
        currentRunId = settings.currentRunId || null;
        activeViewKey = settings.activeViewKey || "all";
        var currentRun = currentRunId ? savedRuns.find(function (run) { return run.id === currentRunId; }) : null;
        if (currentRun && Array.isArray(currentRun.rows)) {
          rows = currentRun.rows;
          selectedRowId = currentRun.selectedRowId || (rows[0] && rows[0].id) || null;
          applyRunMeta(currentRun.meta || {});
        }
        updateKeyStatus();
        renderColumnPicker();
        renderAll();
      }

      function updateKeyStatus() {
        setChip("customStatus", $("customKey").value.trim() ? "ok" : "warn", $("customKey").value.trim() ? "Custom key set" : "Custom key unset");
      }

      function applyRunMeta(meta) {
        $("runName").value = meta.name || $("runName").value || "Untitled account list";
        $("runCampaign").value = meta.campaign || "";
        $("runOwner").value = meta.owner || "";
        $("runGoal").value = meta.goal || "";
        if (meta.urls !== undefined) $("researchUrls").value = meta.urls;
        if (meta.keywords !== undefined) $("researchKeywords").value = meta.keywords;
      }

      function currentRunMeta() {
        return {
          name: cleanDisplayValue($("runName").value || "Untitled account list", 120),
          campaign: cleanDisplayValue($("runCampaign").value || "", 120),
          owner: cleanDisplayValue($("runOwner").value || "", 80),
          goal: cleanDisplayValue($("runGoal").value || "", 180),
          urls: $("researchUrls").value,
          keywords: $("researchKeywords").value,
          config: {
            concurrency: $("concurrency").value,
            scrapeWait: $("scrapeWait").value,
            scrapeTimeout: $("scrapeTimeout").value,
            runMode: $("runMode").value,
            dedupeMode: $("dedupeMode").value,
            domainTimeout: $("domainTimeout").value,
            checkMx: $("checkMx").checked,
            checkWebsite: $("checkWebsite").checked,
            extractContacts: $("extractContacts").checked
          }
        };
      }

      function newRunId() {
        return "run_" + String(Date.now()) + "_" + Math.random().toString(16).slice(2);
      }

      function rowForStorage(row) {
        var copy = {};
        Object.keys(row || {}).forEach(function (key) {
          if (key !== "markdown") copy[key] = row[key];
        });
        return copy;
      }

      function runCounts(sourceRows) {
        var items = sourceRows || rows;
        var done = items.filter(function (row) { return row.status === "done"; }).length;
        var failed = items.filter(function (row) { return row.status === "failed"; }).length;
        var contacts = items.filter(hasContactData).length;
        var matched = items.filter(function (row) { return row.matches && row.matches.length; }).length;
        return {
          total: items.length,
          done: done,
          failed: failed,
          contacts: contacts,
          matched: matched,
          progress: items.length ? Math.round((done + failed) / items.length * 100) : 0
        };
      }

      function upsertSavedRun(status, silent) {
        if (!currentRunId) currentRunId = newRunId();
        var counts = runCounts(rows);
        var now = new Date().toISOString();
        var existing = savedRuns.find(function (run) { return run.id === currentRunId; });
        var createdAt = existing && existing.createdAt ? existing.createdAt : now;
        var next = {
          id: currentRunId,
          status: status || (existing && existing.status) || "draft",
          meta: currentRunMeta(),
          counts: counts,
          rows: rows.map(rowForStorage),
          selectedRowId: selectedRowId,
          createdAt: createdAt,
          updatedAt: now
        };
        savedRuns = [next].concat(savedRuns.filter(function (run) { return run.id !== currentRunId; })).slice(0, 20);
        saveSettings(true);
        renderRecentRuns();
        if (!silent) showToast("Saved " + next.meta.name);
      }

      function loadSavedRun(id) {
        var run = savedRuns.find(function (item) { return item.id === id; });
        if (!run) return;
        currentRunId = run.id;
        rows = Array.isArray(run.rows) ? run.rows : [];
        selectedRowId = run.selectedRowId || (rows[0] && rows[0].id) || null;
        applyRunMeta(run.meta || {});
        saveSettings(true);
        renderAll();
        showToast("Opened " + ((run.meta && run.meta.name) || "saved list"));
      }

      function resetForNewRun() {
        currentRunId = newRunId();
        rows = [];
        selectedRowId = null;
        $("runName").value = "Untitled account list";
        $("runCampaign").value = "";
        $("runOwner").value = "You";
        $("runGoal").value = "";
        $("researchUrls").value = "";
        renderAll();
        saveSettings(true);
        showToast("New list ready");
      }

      function defaultColumnKeys() {
        return columnDefinitions.filter(function (column) {
          return column.defaultVisible;
        }).map(function (column) {
          return column.key;
        });
      }

      function sanitizeColumnKeys(keys) {
        var allowed = {};
        columnDefinitions.forEach(function (column) {
          allowed[column.key] = true;
        });
        var input = Array.isArray(keys) ? keys : defaultColumnKeys();
        var cleaned = input.filter(function (key) {
          return allowed[key];
        });
        return cleaned.length ? cleaned : defaultColumnKeys();
      }

      function visibleColumns() {
        var selected = {};
        visibleColumnKeys.forEach(function (key) {
          selected[key] = true;
        });
        return columnDefinitions.filter(function (column) {
          return selected[column.key];
        });
      }

      function renderColumnPicker() {
        $("columnPicker").innerHTML =
          '<div class="column-picker-header">' +
            '<span class="column-picker-title">Columns</span>' +
            '<span class="chip clean-chip"><span class="chip-dot"></span><span>Cleaned view</span></span>' +
          "</div>" +
          '<div class="column-options">' +
          columnDefinitions.map(function (column) {
            var checked = visibleColumnKeys.indexOf(column.key) >= 0 ? " checked" : "";
            return '<label class="check"><input type="checkbox" data-column-key="' + escapeHtml(column.key) + '"' + checked + " /><span>" + escapeHtml(column.label) + "</span></label>";
          }).join("") +
          "</div>";

        Array.prototype.forEach.call($("columnPicker").querySelectorAll("[data-column-key]"), function (input) {
          input.addEventListener("change", function () {
            var key = input.getAttribute("data-column-key");
            if (input.checked) {
              if (visibleColumnKeys.indexOf(key) < 0) visibleColumnKeys.push(key);
            } else {
              visibleColumnKeys = visibleColumnKeys.filter(function (item) { return item !== key; });
              if (!visibleColumnKeys.length) visibleColumnKeys = defaultColumnKeys();
            }
            saveSettings();
            renderColumnPicker();
            renderAll();
          });
        });
      }

      function setChip(id, state, text) {
        var el = $(id);
        el.className = "chip " + state;
        el.querySelector("span:last-child").textContent = text;
      }

      function showToast(message) {
        var toast = $("toast");
        toast.textContent = message;
        toast.classList.add("show");
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(function () {
          toast.classList.remove("show");
        }, 2400);
      }

      function endpoint(path) {
        var base = $("baseUrl").value.trim() || window.location.origin;
        return base.replace(/\\/$/, "") + path;
      }

      function requestHeaders(authMode, hasBody) {
        var headers = {};
        if (hasBody) headers["Content-Type"] = "application/json";

        if (authMode === "custom") {
          var customKey = $("customKey").value.trim();
          if (customKey) headers["x-custom-api-key"] = customKey;
        }

        if (authMode === "firecrawl") {
          var firecrawlKey = $("firecrawlKey").value.trim();
          if (firecrawlKey) headers.Authorization = "Bearer " + firecrawlKey;
        }

        return headers;
      }

      async function apiRequest(path, options) {
        var method = options.method || "POST";
        var body = options.body;
        var auth = options.auth || "firecrawl";
        var hasBody = method !== "GET" && body !== undefined;
        var started = performance.now();

        try {
          var response = await fetch(endpoint(path), {
            method: method,
            headers: requestHeaders(auth, hasBody),
            body: hasBody ? JSON.stringify(body) : undefined
          });
          var text = await response.text();
          var data;
          try {
            data = text ? JSON.parse(text) : null;
          } catch (error) {
            data = text;
          }
          return {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            endpoint: path,
            elapsedMs: Math.round(performance.now() - started),
            response: data
          };
        } catch (error) {
          return {
            ok: false,
            status: 0,
            statusText: "Network error",
            endpoint: path,
            elapsedMs: Math.round(performance.now() - started),
            response: { success: false, error: error.message || String(error) }
          };
        }
      }

      function setButtonsForRun(isRunning) {
        running = isRunning;
        $("runButton").disabled = isRunning;
        $("topRunButton").disabled = isRunning;
        $("headerRunButton").disabled = isRunning;
        $("previewButton").disabled = isRunning;
        $("stopButton").disabled = !isRunning;
      }

      function parseUrls() {
        var lines = $("researchUrls").value.split(/\\r?\\n|,/);
        var seen = {};
        var parsed = [];
        var dedupe = $("dedupeMode").value === "dedupe";

        lines.forEach(function (line) {
          var raw = line.trim();
          if (!raw) return;
          var normalized = normalizeUrl(raw);
          if (!normalized) return;
          var domain = domainFromUrl(normalized);
          var key = dedupe ? domain : normalized;
          if (dedupe && seen[key]) return;
          seen[key] = true;
          parsed.push({
            id: "row_" + String(Date.now()) + "_" + String(parsed.length),
            raw: raw,
            url: normalized,
            domain: domain,
            status: "queued",
            statusCode: null,
            elapsedMs: null,
            score: 0,
            matches: [],
            contexts: [],
            title: "",
            summary: "",
            error: "",
            markdown: "",
            mx: null,
            website: null,
            domainCheckStatus: "queued",
            domainCheckError: "",
            extracted: emptyExtractedData()
          });
        });

        return parsed;
      }

      function normalizeUrl(raw) {
        var value = raw.trim();
        if (!/^https?:\\/\\//i.test(value)) value = "https://" + value;
        try {
          return new URL(value).href;
        } catch (error) {
          return "";
        }
      }

      function domainFromUrl(url) {
        try {
          return new URL(url).hostname.replace(/^www\\./i, "");
        } catch (error) {
          return url;
        }
      }

      function parseKeywords() {
        var seen = {};
        var values = $("researchKeywords").value.split(/\\r?\\n|,/).map(function (keyword) {
          return keyword.trim();
        }).filter(Boolean);

        return values.filter(function (keyword) {
          var key = keyword.toLowerCase();
          if (seen[key]) return false;
          seen[key] = true;
          return true;
        });
      }

      function previewList() {
        rows = parseUrls();
        selectedRowId = rows.length ? rows[0].id : null;
        upsertSavedRun("previewed", true);
        renderAll();
        showToast(String(rows.length) + " companies loaded");
      }

      async function runResearch() {
        var parsed = parseUrls();
        if (!parsed.length) {
          showToast("Add websites first");
          return;
        }

        rows = parsed;
        selectedRowId = rows[0].id;
        stopRequested = false;
        setButtonsForRun(true);
        upsertSavedRun("running", true);
        renderAll();

        await inspectRows(rows);
        if (stopRequested) {
          setButtonsForRun(false);
          upsertSavedRun("cancelled", true);
          renderAll();
          showToast("Research stopped");
          return;
        }

        var keywords = parseKeywords();
        var queue = rows.slice();
        var parallel = Math.max(1, Math.min(4, Number($("concurrency").value || 1)));
        var workers = [];

        for (var i = 0; i < parallel; i += 1) {
          workers.push(runWorker(queue, keywords));
        }

        await Promise.all(workers);
        setButtonsForRun(false);
        upsertSavedRun(stopRequested ? "cancelled" : "done", true);
        renderAll();
        showToast(stopRequested ? "Research stopped" : "Research complete");
      }

      async function runWorker(queue, keywords) {
        while (queue.length && !stopRequested) {
          var row = queue.shift();
          if (!row) return;
          await scrapeRow(row, keywords);
        }
      }

      async function inspectRows(targetRows) {
        if (!$("checkMx").checked && !$("checkWebsite").checked) return;

        var chunks = chunk(targetRows, 100);
        for (var i = 0; i < chunks.length && !stopRequested; i += 1) {
          var group = chunks[i];
          group.forEach(function (row) {
            row.domainCheckStatus = "running";
            row.domainCheckError = "";
          });
          renderAll();

          var result = await apiRequest("/v2/custom/research/domains/inspect", {
            auth: "none",
            body: {
              domains: group.map(function (row) { return row.domain; }),
              checkMx: $("checkMx").checked,
              checkWebsite: $("checkWebsite").checked,
              timeoutMs: Number($("domainTimeout").value || 8000),
              concurrency: Math.max(1, Math.min(16, Number($("concurrency").value || 2) * 2))
            }
          });
          lastResult = result;

          if (!result.ok) {
            group.forEach(function (row) {
              row.domainCheckStatus = "failed";
              row.domainCheckError = extractError(result);
            });
            renderAll();
            continue;
          }

          var items = result.response && result.response.data ? result.response.data : [];
          var byDomain = {};
          items.forEach(function (item) {
            if (item && item.domain) byDomain[item.domain] = item;
          });

          group.forEach(function (row) {
            var item = byDomain[row.domain];
            if (!item) {
              row.domainCheckStatus = "failed";
              row.domainCheckError = "No inspection result";
              return;
            }
            row.mx = item.mx || null;
            row.website = item.website || null;
            row.domainCheckStatus = item.error ? "failed" : "done";
            row.domainCheckError = item.error || "";
          });
          upsertSavedRun("running", true);
          renderAll();
        }
      }

      function chunk(items, size) {
        var chunks = [];
        for (var i = 0; i < items.length; i += size) {
          chunks.push(items.slice(i, i + size));
        }
        return chunks;
      }

      async function scrapeRow(row, keywords) {
        row.status = "running";
        row.error = "";
        renderAll();

        var body = {
          url: row.url,
          formats: ["markdown"],
          onlyMainContent: $("runMode").value === "main",
          waitFor: Number($("scrapeWait").value || 0),
          timeout: Number($("scrapeTimeout").value || 30000)
        };

        var result = await apiRequest("/v2/scrape", { auth: "firecrawl", body: body });
        lastResult = result;
        row.statusCode = result.status;
        row.elapsedMs = result.elapsedMs;
        setChip("apiStatus", result.status === 0 ? "bad" : "ok", result.status === 0 ? "API offline" : "API " + result.status);

        if (!result.ok) {
          row.status = "failed";
          row.error = extractError(result);
          upsertSavedRun("running", true);
          renderAll();
          return;
        }

        var data = unwrapScrapeData(result);
        var markdown = String((data && data.markdown) || "");
        var metadata = data && data.metadata ? data.metadata : {};
        row.markdown = markdown;
        row.title = cleanDisplayValue(metadata.title || firstHeading(markdown) || row.domain, 160);
        row.summary = summarize(markdown);
        row.extracted = $("extractContacts").checked ? extractContactData(markdown) : emptyExtractedData();

        var analysis = analyzeText([row.title, row.domain, row.url, markdown].join("\\n"), keywords);
        row.matches = analysis.matches;
        row.contexts = analysis.contexts;
        row.score = analysis.score;
        row.status = "done";
        upsertSavedRun("running", true);
        renderAll();
      }

      function unwrapScrapeData(result) {
        if (!result || !result.response) return {};
        if (result.response.data) return result.response.data;
        return result.response;
      }

      function extractError(result) {
        var response = result && result.response;
        if (response && response.error) return String(response.error);
        if (response && response.message) return String(response.message);
        return result.statusText || "Request failed";
      }

      function firstHeading(markdown) {
        var lines = String(markdown || "").split(/\\r?\\n/);
        for (var i = 0; i < lines.length; i += 1) {
          var line = cleanDisplayValue(lines[i].replace(/^#+\\s*/, ""), 140);
          if (line && line.length < 140) return line;
        }
        return "";
      }

      function summarize(markdown) {
        var text = cleanText(markdown);
        if (!text) return "";
        return text.length > 260 ? text.slice(0, 257) + "..." : text;
      }

      function cleanText(value) {
        return decodeEntities(stripHtml(String(value || "")))
          .replace(/!\\[[^\\]]*\\]\\([^)]*\\)/g, " ")
          .replace(/\\[([^\\]]+)\\]\\([^)]*\\)/g, "$1")
          .replace(/[#*_|>]/g, " ")
          .replace(/\\u00a0/g, " ")
          .replace(/\\s+/g, " ")
          .trim();
      }

      function stripHtml(value) {
        return String(value || "")
          .replace(/<script[\\s\\S]*?<\\/script>/gi, " ")
          .replace(/<style[\\s\\S]*?<\\/style>/gi, " ")
          .replace(/<[^>]+>/g, " ");
      }

      function decodeEntities(value) {
        if (!entityDecoder) entityDecoder = document.createElement("textarea");
        entityDecoder.innerHTML = String(value || "");
        return entityDecoder.value;
      }

      function cleanDisplayValue(value, limit) {
        var text = cleanText(value);
        if (limit && text.length > limit) return text.slice(0, limit - 3) + "...";
        return text;
      }

      function emptyExtractedData() {
        return {
          emails: [],
          contactEmails: [],
          phones: [],
          addresses: []
        };
      }

      function extractContactData(markdown) {
        var text = cleanText(markdown);
        var emailMatches = text.match(/\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b/gi) || [];
        var emails = unique(emailMatches.map(function (email) {
          return email.toLowerCase().replace(/[.,;:)]+$/, "");
        }).filter(isUsefulEmail));

        return {
          emails: emails,
          contactEmails: emails.filter(isLikelyContactEmail),
          phones: extractPhones(text),
          addresses: extractAddresses(markdown)
        };
      }

      function isUsefulEmail(email) {
        if (!email || email.length > 120) return false;
        if (/\\.(png|jpg|jpeg|gif|webp|svg|css|js)$/i.test(email)) return false;
        if (email.indexOf("@example.") >= 0) return false;
        if (email.indexOf("@domain.") >= 0) return false;
        return email.indexOf(".") > email.indexOf("@") + 1;
      }

      function isLikelyContactEmail(email) {
        var local = email.split("@")[0].toLowerCase();
        return /^(contact|info|sales|support|hello|team|admin|enquiries|enquiry|press|media|careers|jobs|privacy|legal|office)$/i.test(local);
      }

      function extractPhones(text) {
        var matches = String(text || "").match(/(?:\\+?\\d[\\d().\\-\\s]{7,}\\d)/g) || [];
        return unique(matches.map(function (phone) {
          return phone.replace(/\\s+/g, " ").trim().replace(/[.,;:)]+$/, "");
        }).filter(function (phone) {
          var digits = phone.replace(/\\D/g, "");
          return digits.length >= 8 && digits.length <= 15;
        })).slice(0, 12);
      }

      function extractAddresses(markdown) {
        var lines = String(markdown || "").split(/\\r?\\n/).map(cleanMarkdownLine).filter(Boolean);
        var addresses = [];
        for (var i = 0; i < lines.length; i += 1) {
          var line = lines[i];
          var lower = line.toLowerCase();
          var hasPostcode = /\\b[A-Z]{1,2}\\d[A-Z\\d]?\\s*\\d[A-Z]{2}\\b/i.test(line);
          var hasZip = /\\b\\d{5}(?:-\\d{4})?\\b/.test(line);
          var hasStreet = /\\b(street|st\\.|road|rd\\.|avenue|ave\\.|lane|ln\\.|drive|dr\\.|way|boulevard|blvd\\.|court|ct\\.|suite|ste\\.|floor|registered office|head office|hq)\\b/i.test(line);
          var hasCue = lower.indexOf("address") >= 0 || lower.indexOf("registered office") >= 0 || lower.indexOf("headquarters") >= 0;
          if ((hasPostcode || hasZip || hasStreet || hasCue) && line.length >= 12 && line.length <= 220) {
            var candidate = line;
            if (hasCue && lines[i + 1] && candidate.length + lines[i + 1].length < 220) {
              candidate = candidate + " " + lines[i + 1];
            }
            addresses.push(candidate);
          }
        }
        return unique(addresses).slice(0, 8);
      }

      function cleanMarkdownLine(line) {
        return cleanText(line);
      }

      function unique(values) {
        var seen = {};
        var output = [];
        values.forEach(function (value) {
          var text = String(value || "").trim();
          var key = text.toLowerCase();
          if (!text || seen[key]) return;
          seen[key] = true;
          output.push(text);
        });
        return output;
      }

      function analyzeText(text, keywords) {
        var clean = cleanText(text);
        var matches = [];
        var contexts = [];
        var score = 0;

        keywords.forEach(function (keyword) {
          var regex = new RegExp(escapeRegExp(keyword), "gi");
          var count = 0;
          var match;

          while ((match = regex.exec(clean)) !== null) {
            count += 1;
            if (contexts.length < 16) {
              contexts.push({
                keyword: keyword,
                text: contextSnippet(clean, match.index, keyword.length)
              });
            }
            if (match.index === regex.lastIndex) regex.lastIndex += 1;
          }

          if (count > 0) {
            matches.push({ keyword: keyword, count: count });
            score += 10 + Math.min(count, 12);
          }
        });

        matches.sort(function (a, b) {
          return b.count - a.count || a.keyword.localeCompare(b.keyword);
        });

        return { matches: matches, contexts: contexts, score: score };
      }

      function contextSnippet(text, index, length) {
        var start = Math.max(0, index - 90);
        var end = Math.min(text.length, index + length + 110);
        var snippet = text.slice(start, end).trim();
        if (start > 0) snippet = "... " + snippet;
        if (end < text.length) snippet += " ...";
        return snippet;
      }

      function escapeRegExp(value) {
        return String(value).replace(/[.*+?^$(){}|[\\]\\\\]/g, "\\\\$&");
      }

      function filteredRows() {
        var query = $("resultSearch").value.trim().toLowerCase();
        var status = $("statusFilter").value;
        var sortBy = $("sortBy").value;
        var result = rows.filter(function (row) {
          if (status === "matched" && !row.matches.length) return false;
          if (status === "hasContacts" && !hasContactData(row)) return false;
          if (status === "active" && !(row.website && row.website.status === "active")) return false;
          if (status === "redirecting" && !(row.website && row.website.status === "redirecting")) return false;
          if (status === "inactive" && !(row.website && row.website.status === "inactive")) return false;
          if (["all", "matched", "hasContacts", "active", "redirecting", "inactive"].indexOf(status) < 0 && row.status !== status) return false;
          if (!query) return true;
          var haystack = [
            row.domain,
            row.url,
            row.title,
            row.summary,
            row.error,
            row.domainCheckError,
            row.mx && row.mx.provider,
            row.website && row.website.status,
            row.website && row.website.finalUrl,
            row.extracted && row.extracted.emails.join(" "),
            row.extracted && row.extracted.contactEmails.join(" "),
            row.extracted && row.extracted.phones.join(" "),
            row.extracted && row.extracted.addresses.join(" "),
            row.matches.map(function (item) { return item.keyword; }).join(" "),
            row.contexts.map(function (item) { return item.text; }).join(" ")
          ].join(" ").toLowerCase();
          return haystack.indexOf(query) >= 0;
        });

        result.sort(function (a, b) {
          var av = sortValue(a, sortBy);
          var bv = sortValue(b, sortBy);
          var compare;
          if (typeof av === "number" && typeof bv === "number") {
            compare = av - bv;
          } else {
            compare = String(av).localeCompare(String(bv));
          }
          return sortDescending ? -compare : compare;
        });

        return result;
      }

      function sortValue(row, sortBy) {
        if (sortBy === "score") return row.score || 0;
        if (sortBy === "matches") return row.matches.length || 0;
        if (sortBy === "contacts") return contactCount(row);
        if (sortBy === "mxProvider") return row.mx && row.mx.provider ? row.mx.provider : "";
        if (sortBy === "websiteStatus") return row.website && row.website.status ? row.website.status : "";
        if (sortBy === "elapsedMs") return row.elapsedMs || 0;
        if (sortBy === "status") return row.status || "";
        return row.domain || "";
      }

      function hasContactData(row) {
        return contactCount(row) > 0;
      }

      function contactCount(row) {
        var extracted = row.extracted || emptyExtractedData();
        return extracted.emails.length + extracted.phones.length + extracted.addresses.length;
      }

      function contactItems() {
        var items = [];
        rows.forEach(function (row) {
          var extracted = row.extracted || emptyExtractedData();
          extracted.contactEmails.forEach(function (email) {
            items.push({ rowId: row.id, company: row.domain, value: email, type: "contact email", source: "public website" });
          });
          extracted.emails.filter(function (email) {
            return extracted.contactEmails.indexOf(email) < 0;
          }).forEach(function (email) {
            items.push({ rowId: row.id, company: row.domain, value: email, type: "email", source: "public website" });
          });
          extracted.phones.forEach(function (phone) {
            items.push({ rowId: row.id, company: row.domain, value: phone, type: "phone", source: "public website" });
          });
        });
        return items;
      }

      function renderAll() {
        renderMetrics();
        renderRecentRuns();
        renderSavedViews();
        renderTable();
        renderContacts();
        renderDetail();
      }

      function renderMetrics() {
        var done = rows.filter(function (row) { return row.status === "done"; }).length;
        var runningCount = rows.filter(function (row) { return row.status === "running"; }).length;
        var matched = rows.filter(function (row) { return row.matches && row.matches.length; }).length;
        var contacts = rows.filter(hasContactData).length;
        var failed = rows.filter(function (row) { return row.status === "failed"; }).length;
        var active = rows.filter(function (row) { return row.website && row.website.status === "active"; }).length;
        var mail = rows.filter(function (row) { return row.mx && row.mx.records && row.mx.records.length; }).length;
        var redirects = rows.filter(function (row) { return row.website && row.website.status === "redirecting"; }).length;
        var clean = rows.filter(function (row) { return row.status === "done" && !row.error; }).length;

        $("metricTotal").textContent = String(rows.length);
        $("metricDone").textContent = String(done);
        $("metricRunning").textContent = String(runningCount);
        $("metricMatched").textContent = String(matched);
        $("metricContacts").textContent = String(contacts);
        $("metricFailed").textContent = String(failed);
        $("qualityActive").textContent = String(active);
        $("qualityMail").textContent = String(mail);
        $("qualityRedirects").textContent = String(redirects);
        $("qualityClean").textContent = String(clean);
        $("navTotal").textContent = String(rows.length);
        $("navDone").textContent = String(done);
        $("navContacts").textContent = String(contactItems().length);
        $("navRuns").textContent = String(savedRuns.length);
        $("navMatched").textContent = String(matched);
        $("navFailed").textContent = String(failed);
      }

      function renderRecentRuns() {
        var body = $("recentRunsBody");
        if (!body) return;
        if (!savedRuns.length) {
          body.innerHTML = '<tr><td colspan="7"><div class="empty">No saved runs yet</div></td></tr>';
          return;
        }
        body.innerHTML = savedRuns.slice(0, 8).map(function (run) {
          var counts = run.counts || runCounts(run.rows || []);
          var meta = run.meta || {};
          var isActive = run.id === currentRunId;
          return '<tr data-run-id="' + escapeHtml(run.id) + '">' +
            '<td><div class="domain-cell"><b>' + escapeHtml(meta.name || "Untitled account list") + '</b><span>' + escapeHtml(meta.goal || "-") + "</span></div></td>" +
            '<td><span class="status-pill ' + escapeHtml(statusClass(run.status)) + '">' + escapeHtml(run.status || "draft") + "</span></td>" +
            '<td>' + escapeHtml(String(counts.progress || 0)) + "%</td>" +
            '<td>' + escapeHtml(String(counts.total || 0)) + "</td>" +
            '<td>' + escapeHtml(meta.campaign || "-") + "</td>" +
            '<td>' + escapeHtml(formatDate(run.updatedAt)) + "</td>" +
            '<td><button class="mini" data-open-run="' + escapeHtml(run.id) + '" type="button">' + (isActive ? "Open" : "Reopen") + "</button></td>" +
          "</tr>";
        }).join("");

        Array.prototype.forEach.call(body.querySelectorAll("[data-open-run]"), function (button) {
          button.addEventListener("click", function (event) {
            event.stopPropagation();
            loadSavedRun(button.getAttribute("data-open-run"));
          });
        });
      }

      function statusClass(status) {
        if (status === "done" || status === "previewed") return "done";
        if (status === "running") return "running";
        if (status === "failed" || status === "cancelled") return "failed";
        return "queued";
      }

      function formatDate(value) {
        if (!value) return "-";
        try {
          return new Date(value).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
        } catch (error) {
          return "-";
        }
      }

      function renderSavedViews() {
        var container = $("savedViews");
        if (!container) return;
        var builtIns = [
          { key: "all", label: "All", status: "all", query: "" },
          { key: "contacts", label: "Has contacts", status: "hasContacts", query: "" },
          { key: "matched", label: "Matched", status: "matched", query: "" },
          { key: "active", label: "Active domains", status: "active", query: "" },
          { key: "failed", label: "Failed", status: "failed", query: "" }
        ];
        var views = builtIns.concat(savedViews);
        container.innerHTML = views.map(function (view) {
          var active = activeViewKey === view.key ? " active" : "";
          return '<button class="view-pill' + active + '" data-view-key="' + escapeHtml(view.key) + '" type="button">' + escapeHtml(view.label) + "</button>";
        }).join("");
        Array.prototype.forEach.call(container.querySelectorAll("[data-view-key]"), function (button) {
          button.addEventListener("click", function () {
            applySavedView(button.getAttribute("data-view-key"));
          });
        });
      }

      function applySavedView(key) {
        var builtIns = {
          all: { status: "all", query: "" },
          contacts: { status: "hasContacts", query: "" },
          matched: { status: "matched", query: "" },
          active: { status: "active", query: "" },
          failed: { status: "failed", query: "" }
        };
        var view = builtIns[key] || savedViews.find(function (item) { return item.key === key; });
        if (!view) return;
        activeViewKey = key;
        $("statusFilter").value = view.status || "all";
        $("resultSearch").value = view.query || "";
        $("globalSearch").value = view.query || "";
        if (view.sortBy) $("sortBy").value = view.sortBy;
        saveSettings(true);
        renderAll();
      }

      function saveCurrentView() {
        var name = window.prompt("Save this view as", "Qualified accounts");
        if (!name) return;
        var key = "view_" + Date.now();
        savedViews = savedViews.concat([{
          key: key,
          label: cleanDisplayValue(name, 60),
          status: $("statusFilter").value,
          query: $("resultSearch").value,
          sortBy: $("sortBy").value
        }]).slice(-12);
        activeViewKey = key;
        saveSettings(true);
        renderSavedViews();
        showToast("Saved view");
      }

      function looksLikeDomain(value) {
        var text = String(value || "").trim();
        if (!text) return false;
        if (/^https?:\\/\\//i.test(text)) return true;
        return /^[a-z0-9][a-z0-9.-]*\\.[a-z]{2,}(?:\\/.*)?$/i.test(text);
      }

      function lookupFromSearch() {
        var value = $("globalSearch").value.trim();
        if (!value) return;
        if (looksLikeDomain(value)) {
          var normalized = normalizeUrl(value);
          var domain = domainFromUrl(normalized);
          var existing = rows.find(function (row) { return row.domain === domain; });
          if (!existing) {
            var current = $("researchUrls").value.trim();
            $("researchUrls").value = current ? current + "\\n" + normalized : normalized;
            previewList();
            var added = rows.find(function (row) { return row.domain === domain; });
            if (added) selectedRowId = added.id;
            upsertSavedRun("previewed", true);
            renderAll();
            showToast("Added " + domain + " to this list");
          } else {
            selectedRowId = existing.id;
            $("resultSearch").value = domain;
            renderAll();
          }
          document.getElementById("companiesPanel").scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        $("resultSearch").value = value;
        renderAll();
      }

      function renderTable() {
        renderTableHead();
        var body = $("resultsBody");
        var view = filteredRows();
        var columns = visibleColumns();
        if (!view.length) {
          body.innerHTML = '<tr><td colspan="' + String(columns.length || 1) + '"><div class="empty">No matching companies</div></td></tr>';
          return;
        }

        body.innerHTML = view.map(function (row) {
          return "<tr data-row-id=\\"" + escapeHtml(row.id) + "\\"" + (row.id === selectedRowId ? " class=\\"selected\\"" : "") + ">" +
            columns.map(function (column) {
              return "<td>" + column.render(row) + "</td>";
            }).join("") +
            "</tr>";
        }).join("");
      }

      function renderTableHead() {
        var columns = visibleColumns();
        $("resultsHead").innerHTML = "<tr>" + columns.map(function (column) {
          return "<th>" + escapeHtml(column.label) + "</th>";
        }).join("") + "</tr>";
      }

      function renderContacts() {
        var body = $("contactsBody");
        if (!body) return;
        var contacts = contactItems();
        if (!contacts.length) {
          body.innerHTML = '<tr><td colspan="4"><div class="empty">Run research to collect emails, phones, and address signals</div></td></tr>';
          return;
        }
        body.innerHTML = contacts.slice(0, 200).map(function (item) {
          return '<tr data-contact-row-id="' + escapeHtml(item.rowId) + '">' +
            '<td>' + escapeHtml(item.company) + "</td>" +
            '<td>' + escapeHtml(item.value) + "</td>" +
            '<td><span class="status-pill done">' + escapeHtml(item.type) + "</span></td>" +
            '<td>' + escapeHtml(item.source) + "</td>" +
          "</tr>";
        }).join("");
      }

      function companyCell(row) {
        return '<div class="domain-cell"><b>' + escapeHtml(cleanDisplayValue(row.title || row.domain, 140)) + "</b><span>" + escapeHtml(row.domain) + "</span><span>" + escapeHtml(row.url) + "</span></div>";
      }

      function scoreCell(row) {
        return '<span class="score">' + escapeHtml(String(row.score || 0)) + "</span>";
      }

      function keywordsCell(row) {
        return keywordPills(row.matches);
      }

      function summaryCell(row) {
        return escapeHtml(cleanDisplayValue(row.error || row.summary || "-", 320));
      }

      function timeCell(row) {
        return escapeHtml(row.elapsedMs ? String(row.elapsedMs) + " ms" : "-");
      }

      function contactEmailsCell(row) {
        return listCell((row.extracted || emptyExtractedData()).contactEmails);
      }

      function allEmailsCell(row) {
        return listCell((row.extracted || emptyExtractedData()).emails);
      }

      function phonesCell(row) {
        return listCell((row.extracted || emptyExtractedData()).phones);
      }

      function addressesCell(row) {
        return listCell((row.extracted || emptyExtractedData()).addresses);
      }

      function finalUrlCell(row) {
        return escapeHtml(cleanDisplayValue(row.website && row.website.finalUrl ? row.website.finalUrl : "-", 260));
      }

      function redirectsCell(row) {
        var redirects = row.website && row.website.redirects ? row.website.redirects : [];
        return listCell(redirects.map(function (item) {
          return item.from + " -> " + item.to + " (" + item.statusCode + ")";
        }));
      }

      function mxRecordsCell(row) {
        var records = row.mx && row.mx.records ? row.mx.records : [];
        return listCell(records.map(function (record) {
          return record.priority + " " + record.exchange;
        }));
      }

      function listCell(values) {
        var cleaned = (values || []).map(function (value) {
          return cleanDisplayValue(value, 260);
        }).filter(Boolean);
        if (!cleaned.length) return '<span class="muted">-</span>';
        return '<div class="domain-cell">' + cleaned.slice(0, 4).map(function (value) {
          return "<span>" + escapeHtml(value) + "</span>";
        }).join("") + (cleaned.length > 4 ? "<span>+" + escapeHtml(String(cleaned.length - 4)) + " more</span>" : "") + "</div>";
      }

      function statusPill(row) {
        return '<span class="status-pill ' + escapeHtml(row.status) + '">' + escapeHtml(row.status) + (row.statusCode ? " " + escapeHtml(String(row.statusCode)) : "") + "</span>";
      }

      function siteCell(row) {
        var website = row.website;
        if (row.domainCheckStatus === "running") return '<span class="status-pill running">checking</span>';
        if (row.domainCheckStatus === "failed") return '<span class="status-pill failed">' + escapeHtml(row.domainCheckError || "failed") + "</span>";
        if (!website) return statusPill(row);
        var status = website.status || "unknown";
        var css = status === "active" || status === "redirecting" ? "done" : status === "inactive" || status === "error" ? "failed" : "queued";
        return '<div class="domain-cell"><span class="status-pill ' + css + '">' + escapeHtml(status) + (website.statusCode ? " " + escapeHtml(String(website.statusCode)) : "") + '</span><span>' + escapeHtml(website.finalUrl || website.startUrl || "-") + "</span></div>";
      }

      function mxCell(row) {
        var mx = row.mx;
        if (row.domainCheckStatus === "running") return '<span class="muted">checking</span>';
        if (row.domainCheckStatus === "failed") return '<span class="status-pill failed">' + escapeHtml(row.domainCheckError || "failed") + "</span>";
        if (!mx) return '<span class="muted">not checked</span>';
        var recordText = mx.records && mx.records.length ? String(mx.records.length) + " records" : mx.status;
        return '<div class="domain-cell"><b>' + escapeHtml(mx.provider || "-") + "</b><span>" + escapeHtml(recordText) + "</span></div>";
      }

      function contactCell(row) {
        var extracted = row.extracted || emptyExtractedData();
        if (!hasContactData(row)) return '<span class="muted">-</span>';
        return '<div class="domain-cell"><span>' + escapeHtml(String(extracted.emails.length)) + " emails</span><span>" + escapeHtml(String(extracted.phones.length)) + " phones</span><span>" + escapeHtml(String(extracted.addresses.length)) + " addresses</span></div>";
      }

      function keywordPills(matches) {
        if (!matches || !matches.length) return '<span class="muted">-</span>';
        return '<div class="keyword-list">' + matches.slice(0, 8).map(function (item) {
          return '<span class="keyword-pill">' + escapeHtml(item.keyword) + " " + escapeHtml(String(item.count)) + "</span>";
        }).join("") + "</div>";
      }

      function renderDetail() {
        var row = rows.find(function (item) { return item.id === selectedRowId; });
        if (!row) {
          $("snapshotTitle").textContent = "No selection";
          $("snapshotFrame").innerHTML = '<div class="empty">Select a row</div>';
          $("openSelectedButton").disabled = true;
          $("copySelectedButton").disabled = true;
          $("detailTitle").textContent = "No selection";
          $("detailUrl").textContent = "";
          $("detailUrl").removeAttribute("href");
          $("detailPills").innerHTML = "";
          $("detailSummary").textContent = "";
          $("detailContacts").innerHTML = "";
          $("detailContexts").innerHTML = '<div class="empty">Select a row</div>';
          return;
        }

        $("openSelectedButton").disabled = false;
        $("copySelectedButton").disabled = false;
        renderSnapshot(row);
        $("detailTitle").textContent = row.title || row.domain;
        $("detailUrl").textContent = row.url;
        $("detailUrl").href = row.url;
        $("detailPills").innerHTML = keywordPills(row.matches);
        $("detailSummary").textContent = row.error || row.summary || "";
        $("detailContacts").innerHTML = formattedContactData(row);

        if (!row.contexts.length) {
          $("detailContexts").innerHTML = '<div class="empty">No keyword context</div>';
          return;
        }

        $("detailContexts").innerHTML = row.contexts.map(function (item) {
          return '<div class="context-item"><b>' + escapeHtml(item.keyword) + "</b><span>" + escapeHtml(item.text) + "</span></div>";
        }).join("");
      }

      function renderSnapshot(row) {
        var website = row.website || {};
        var mx = row.mx || {};
        var extracted = row.extracted || emptyExtractedData();
        var finalUrl = website.finalUrl || website.startUrl || row.url;
        var status = website.status || row.status || "queued";
        var statusText = status + (website.statusCode ? " " + String(website.statusCode) : "");
        var mailText = mx.provider || "Unknown";
        var redirectText = website.redirects && website.redirects.length ? String(website.redirects.length) + " redirects" : "No redirects";
        var contactText = String(extracted.contactEmails.length || extracted.emails.length || 0) + " emails";
        var summary = row.error || row.summary || "Run research to populate the cleaned company summary.";

        $("snapshotTitle").textContent = row.title || row.domain;
        $("snapshotFrame").innerHTML =
          '<div class="snapshot-browser">' +
            '<div class="snapshot-dots"><span></span><span></span><span></span></div>' +
            '<span>' + escapeHtml(cleanDisplayValue(finalUrl, 140)) + "</span>" +
          "</div>" +
          '<div class="snapshot-content">' +
            "<div>" +
              '<div class="snapshot-domain">' + escapeHtml(row.domain) + "</div>" +
              '<div class="snapshot-heading">' + escapeHtml(cleanDisplayValue(row.title || row.domain, 120)) + "</div>" +
              "<p>" + escapeHtml(cleanDisplayValue(summary, 340)) + "</p>" +
            "</div>" +
            '<div class="snapshot-meta">' +
              '<div class="snapshot-stat"><b>' + escapeHtml(statusText) + "</b><span>Site status</span></div>" +
              '<div class="snapshot-stat"><b>' + escapeHtml(mailText) + "</b><span>Mail server</span></div>" +
              '<div class="snapshot-stat"><b>' + escapeHtml(redirectText) + "</b><span>Redirects</span></div>" +
              '<div class="snapshot-stat"><b>' + escapeHtml(contactText) + "</b><span>Contacts</span></div>" +
            "</div>" +
          "</div>";
      }

      function formattedContactData(row) {
        var extracted = row.extracted || emptyExtractedData();
        var mx = row.mx;
        var website = row.website;
        var sections = [];
        sections.push(formatDataSection("Domain status", [
          website && website.status ? website.status : "-",
          website && website.finalUrl ? website.finalUrl : "",
          website && website.redirects && website.redirects.length ? "Redirects: " + website.redirects.map(function (item) { return item.to; }).join(" -> ") : ""
        ]));
        sections.push(formatDataSection("MX provider", [
          mx && mx.provider ? mx.provider : "-",
          mx && mx.records ? mx.records.map(function (record) { return record.priority + " " + record.exchange; }).join("; ") : ""
        ]));
        sections.push(formatDataSection("Contact emails", extracted.contactEmails));
        sections.push(formatDataSection("All emails", extracted.emails));
        sections.push(formatDataSection("Phones", extracted.phones));
        sections.push(formatDataSection("Addresses", extracted.addresses));
        return sections.join("");
      }

      function formatDataSection(label, values) {
        var clean = (values || []).filter(Boolean);
        return "<div><b>" + escapeHtml(label) + "</b><span>" + escapeHtml(clean.length ? clean.join("; ") : "-") + "</span></div>";
      }

      function exportCsv() {
        var view = filteredRows();
        var headers = ["domain", "url", "scrapeStatus", "scrapeStatusCode", "websiteStatus", "websiteStatusCode", "finalUrl", "redirects", "mxProvider", "mxRecords", "score", "matchedKeywords", "contactEmails", "emails", "phones", "addresses", "title", "summary", "elapsedMs", "error"];
        var lines = [headers.join(",")].concat(view.map(function (row) {
          var extracted = row.extracted || emptyExtractedData();
          var mx = row.mx || { provider: "", records: [] };
          var website = row.website || { redirects: [] };
          return [
            row.domain,
            row.url,
            row.status,
            row.statusCode || "",
            website.status || "",
            website.statusCode || "",
            website.finalUrl || "",
            website.redirects ? website.redirects.map(function (item) { return item.from + " -> " + item.to + " (" + item.statusCode + ")"; }).join("; ") : "",
            mx.provider || "",
            mx.records ? mx.records.map(function (record) { return record.priority + " " + record.exchange; }).join("; ") : "",
            row.score || 0,
            row.matches.map(function (item) { return item.keyword + ":" + item.count; }).join("; "),
            extracted.contactEmails.join("; "),
            extracted.emails.join("; "),
            extracted.phones.join("; "),
            extracted.addresses.join("; "),
            row.title,
            row.summary,
            row.elapsedMs || "",
            row.error || row.domainCheckError
          ].map(csvCell).join(",");
        }));
        downloadBlob("company-research.csv", lines.join("\\n"), "text/csv");
      }

      function exportJson() {
        downloadBlob("company-research.json", JSON.stringify(filteredRows().map(normalizedExportRow), null, 2), "application/json");
      }

      function exportContactsCsv() {
        var headers = ["companyDomain", "contact", "type", "source", "listName", "campaign"];
        var meta = currentRunMeta();
        var lines = [headers.join(",")].concat(contactItems().map(function (item) {
          return [
            item.company,
            item.value,
            item.type,
            item.source,
            meta.name,
            meta.campaign
          ].map(csvCell).join(",");
        }));
        downloadBlob("company-research-contacts.csv", lines.join("\\n"), "text/csv");
      }

      function exportHubspotCsv() {
        var meta = currentRunMeta();
        var headers = ["Company domain name", "Company name", "Website URL", "Final URL", "Phone Number", "Street Address", "Lead Status", "Lead Source", "Campaign", "ICP Goal", "MX Provider", "Domain Health", "Research Score", "Matched Keywords", "Source URL", "Research Notes"];
        var lines = [headers.join(",")].concat(filteredRows().map(function (row) {
          var extracted = row.extracted || emptyExtractedData();
          var website = row.website || {};
          var mx = row.mx || {};
          return [
            row.domain,
            row.title || row.domain,
            row.url,
            website.finalUrl || row.url,
            extracted.phones[0] || "",
            extracted.addresses[0] || "",
            row.status === "done" ? "Research Complete" : row.status,
            "Firecrawl company research",
            meta.campaign,
            meta.goal,
            mx.provider || "",
            website.status || "",
            row.score || 0,
            row.matches.map(function (item) { return item.keyword + ":" + item.count; }).join("; "),
            website.finalUrl || row.url,
            cleanDisplayValue(row.summary || row.error || row.domainCheckError || "", 900)
          ].map(csvCell).join(",");
        }));
        downloadBlob("hubspot-company-research.csv", lines.join("\\n"), "text/csv");
      }

      function normalizedExportRow(row) {
        var extracted = row.extracted || emptyExtractedData();
        var mx = row.mx || { provider: "", records: [] };
        var website = row.website || { redirects: [] };
        return {
          domain: row.domain,
          url: row.url,
          title: cleanDisplayValue(row.title || row.domain, 240),
          scrapeStatus: row.status,
          scrapeStatusCode: row.statusCode || null,
          websiteStatus: website.status || "",
          websiteStatusCode: website.statusCode || null,
          finalUrl: cleanDisplayValue(website.finalUrl || "", 500),
          redirects: website.redirects || [],
          mxProvider: mx.provider || "",
          mxRecords: mx.records || [],
          score: row.score || 0,
          matchedKeywords: row.matches || [],
          contactEmails: extracted.contactEmails,
          emails: extracted.emails,
          phones: extracted.phones,
          addresses: extracted.addresses,
          summary: cleanDisplayValue(row.summary || "", 1000),
          elapsedMs: row.elapsedMs || null,
          error: cleanDisplayValue(row.error || row.domainCheckError || "", 500)
        };
      }

      function csvCell(value) {
        var text = cleanDisplayValue(value == null ? "" : value, 5000);
        return '"' + text.replace(/"/g, '""') + '"';
      }

      function downloadBlob(filename, content, type) {
        var blob = new Blob([content], { type: type });
        var url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      }

      function escapeHtml(value) {
        return String(value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      }

      function getSelectedRow() {
        return rows.find(function (item) { return item.id === selectedRowId; }) || null;
      }

      function selectedFinalUrl() {
        var row = getSelectedRow();
        if (!row) return "";
        return row.website && row.website.finalUrl ? row.website.finalUrl : row.url;
      }

      function copyText(value) {
        if (!value) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(value).then(function () {
            showToast("Copied URL");
          }).catch(function () {
            fallbackCopyText(value);
          });
          return;
        }
        fallbackCopyText(value);
      }

      function fallbackCopyText(value) {
        var input = document.createElement("textarea");
        input.value = value;
        input.setAttribute("readonly", "readonly");
        input.style.position = "fixed";
        input.style.left = "-9999px";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        showToast("Copied URL");
      }

      async function checkConnection() {
        var result = await apiRequest("/", { method: "GET", auth: "none" });
        lastResult = result;
        setChip("apiStatus", result.ok ? "ok" : "bad", result.ok ? "API ready" : "API offline");
        showToast(result.ok ? "API ready" : "API offline");
      }

      async function checkUsage() {
        var result = await apiRequest("/v2/custom/lusha/account/usage", { method: "GET", auth: "custom" });
        lastResult = result;
        setChip("lushaStatus", result.ok ? "ok" : "warn", result.ok ? "Lusha ready" : "Lusha " + result.status);
        showToast(result.ok ? "Lusha credits checked" : "Lusha check failed");
      }

      function bindEvents() {
        $("saveSettingsButton").addEventListener("click", function () { saveSettings(false); });
        $("checkConnectionButton").addEventListener("click", checkConnection);
        $("usageButton").addEventListener("click", checkUsage);
        $("newRunButton").addEventListener("click", resetForNewRun);
        $("lookupButton").addEventListener("click", lookupFromSearch);
        $("topRunButton").addEventListener("click", runResearch);
        $("topExportButton").addEventListener("click", exportCsv);
        $("headerRunButton").addEventListener("click", runResearch);
        $("headerExportButton").addEventListener("click", exportCsv);
        $("previewButton").addEventListener("click", previewList);
        $("saveRunButton").addEventListener("click", function () {
          upsertSavedRun(rows.length ? "previewed" : "draft", false);
        });
        $("runButton").addEventListener("click", runResearch);
        $("stopButton").addEventListener("click", function () {
          stopRequested = true;
          $("stopButton").disabled = true;
        });
        $("clearButton").addEventListener("click", function () {
          rows = [];
          selectedRowId = null;
          $("researchUrls").value = "";
          upsertSavedRun("draft", true);
          renderAll();
        });
        $("sampleButton").addEventListener("click", function () {
          if (!$("runName").value.trim()) $("runName").value = "Sample account research";
          if (!$("runCampaign").value.trim()) $("runCampaign").value = "Sample outbound";
          $("researchUrls").value = [
            "https://www.pistachioapp.com",
            "https://www.lusha.com",
            "https://www.firecrawl.dev"
          ].join("\\n");
          $("researchKeywords").value = defaultKeywords;
          previewList();
        });
        $("showKeys").addEventListener("change", function (event) {
          var type = event.target.checked ? "text" : "password";
          $("firecrawlKey").type = type;
          $("customKey").type = type;
        });
        $("globalSearch").addEventListener("keydown", function (event) {
          if (event.key === "Enter") lookupFromSearch();
        });
        $("globalSearch").addEventListener("input", function () {
          $("resultSearch").value = $("globalSearch").value;
          renderAll();
        });
        $("resultSearch").addEventListener("input", function () {
          $("globalSearch").value = $("resultSearch").value;
          renderAll();
        });
        $("statusFilter").addEventListener("change", renderAll);
        $("sortBy").addEventListener("change", renderAll);
        $("resetColumnsButton").addEventListener("click", function () {
          visibleColumnKeys = defaultColumnKeys();
          saveSettings();
          renderColumnPicker();
          renderAll();
        });
        $("sortDirectionButton").addEventListener("click", function () {
          sortDescending = !sortDescending;
          $("sortDirectionButton").textContent = sortDescending ? "Desc" : "Asc";
          renderAll();
        });
        $("exportCsvButton").addEventListener("click", exportCsv);
        $("exportJsonButton").addEventListener("click", exportJson);
        $("exportContactsButton").addEventListener("click", exportContactsCsv);
        $("saveCurrentViewButton").addEventListener("click", saveCurrentView);
        $("exportViewButton").addEventListener("click", exportCsv);
        $("exportCompaniesCard").addEventListener("click", exportCsv);
        $("exportContactsCard").addEventListener("click", exportContactsCsv);
        $("exportHubspotCard").addEventListener("click", exportHubspotCsv);
        $("exportJsonCard").addEventListener("click", exportJson);
        $("openSelectedButton").addEventListener("click", function () {
          var url = selectedFinalUrl();
          if (url) window.open(url, "_blank", "noopener,noreferrer");
        });
        $("copySelectedButton").addEventListener("click", function () {
          copyText(selectedFinalUrl());
        });
        Array.prototype.forEach.call(document.querySelectorAll(".nav-link"), function (link) {
          link.addEventListener("click", function () {
            Array.prototype.forEach.call(document.querySelectorAll(".nav-link"), function (item) {
              item.classList.remove("active");
            });
            link.classList.add("active");
          });
        });
        $("resultsBody").addEventListener("click", function (event) {
          var row = event.target.closest("tr[data-row-id]");
          if (!row) return;
          selectedRowId = row.getAttribute("data-row-id");
          renderAll();
        });
        $("contactsBody").addEventListener("click", function (event) {
          var row = event.target.closest("tr[data-contact-row-id]");
          if (!row) return;
          selectedRowId = row.getAttribute("data-contact-row-id");
          renderAll();
          document.getElementById("detailPanel").scrollIntoView({ behavior: "smooth", block: "start" });
        });
        ["runName", "runCampaign", "runOwner", "runGoal", "researchUrls", "researchKeywords", "concurrency", "scrapeWait", "scrapeTimeout", "runMode", "dedupeMode", "domainTimeout", "checkMx", "checkWebsite", "extractContacts"].forEach(function (id) {
          $(id).addEventListener("change", saveSettings);
        });
      }

      initSettings();
      bindEvents();

      window.__companyResearchWorkbench = {
        getRows: function () { return rows.slice(); },
        getLastResult: function () { return lastResult; }
      };
    })();
  </script>
</body>
</html>`;

export async function customWorkbenchController(
  _req: Request,
  res: Response,
) {
  return res.type("html").status(200).send(customWorkbenchHtml);
}
