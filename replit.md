# Finance Dashboard

## Overview

A professional finance dashboard for tracking income, expenses, and financial trends. Features role-based UI (Admin/Viewer), real-time chart updates, and full transaction management.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS v4 + shadcn/ui
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (Replit built-in)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Charts**: Recharts
- **State**: TanStack Query (React Query) + React Context (for role)
- **Animations**: Framer Motion
- **Build**: esbuild (CJS bundle for API), Vite (frontend)

## Features

- Dashboard overview with summary cards (Net Worth, Monthly Income, Expenses, Savings)
- Monthly Cash Flow bar chart (last 6 months)
- Spending Breakdown donut chart by category
- Recent Transactions list on dashboard
- Full Transactions Ledger with search, filter by type/category
- Financial Insights page with savings rate, MoM change, top categories
- Role-Based UI: Admin (full CRUD) vs Viewer (read-only, no add/edit/delete)
- All summaries and charts auto-update on any transaction change

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/finance-dashboard run dev` — run frontend locally

## Artifacts

- `artifacts/finance-dashboard` — React+Vite frontend at `/`
- `artifacts/api-server` — Express API server at `/api`

## Database Schema

- `transactions` table: id, description, amount (numeric), type (income/expense), category, date, created_at, updated_at

## API Endpoints

- `GET/POST /api/transactions` — list / create transactions
- `GET/PATCH/DELETE /api/transactions/:id` — get / update / delete
- `GET /api/summary` — dashboard financial summary
- `GET /api/summary/monthly` — monthly income vs expense trend (last 6 months)
- `GET /api/summary/category-breakdown` — expense breakdown by category
- `GET /api/summary/insights` — financial insights
