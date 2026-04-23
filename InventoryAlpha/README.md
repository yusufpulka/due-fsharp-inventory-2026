# ShelfPilot Control Room

ShelfPilot Control Room is a WebSharper and F# inventory management system built for the DUE F# 2026 Alpha brief. This version expands the original submission with role-aware workflows, CSV catalog tools, and a more usable responsive interface.

## What is included

- WebSharper + F# single-page inventory application.
- Role-aware workspace modes for administrator, manager, clerk, and viewer.
- CSV export of the current inventory catalog.
- CSV import for manager and administrator roles.
- Responsive inventory board built around mobile-friendly cards instead of a desktop-only table.
- Stock movement logging with low-stock monitoring and recent activity tracking.

## Role model

- `Administrator`: can move stock, import CSV, export CSV, and reset demo data.
- `Manager`: can move stock, import CSV, and export CSV.
- `Clerk`: can move stock and export CSV.
- `Viewer`: read-only dashboard access.

The current app uses demo users and role switching inside the UI rather than a full authentication system. That keeps the Alpha project easy to review while still demonstrating role-based behavior.

## CSV format

Expected columns:

`Sku,Name,Category,Unit,OnHand,ReorderLevel,TargetStock,Supplier,Location`

Notes:

- Category must be one of `Components`, `Office`, `Packaging`, `Safety`, or `Electronics`.
- Import replaces the current catalog with the uploaded CSV content.
- Import also refreshes movement history with import-generated adjustment entries.

## Run locally

```powershell
cd "C:\Users\Lenovo T14 G1\Desktop\Inventory management system\InventoryAlpha"
dotnet restore
dotnet run
```

The app runs on the local ASP.NET Core URL printed in the terminal, typically `http://localhost:5064`.

## Project structure

- `Domain.fs`: shared domain types, permissions, metrics, and CSV helpers.
- `Server.fs`: in-memory store, role checks, seeded users, CSV import/export, and RPC endpoints.
- `Client.fs`: role switcher, inventory board, stock console, CSV tools, and dashboard UI.
- `Site.fs`: WebSharper sitelet host page.
- `Program.fs`: ASP.NET Core startup and WebSharper wiring.
- `wwwroot/app.css`: responsive styling and UI theme.

## Suggested next step

For a Beta or final course iteration, the best next upgrade would be real authentication plus persistent storage so user roles and imported catalogs survive restarts.
