import { Router, type IRouter } from "express";
import { sql, eq } from "drizzle-orm";
import { db, transactionsTable } from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetMonthlyTrendResponse,
  GetCategoryBreakdownResponse,
  GetInsightsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/summary", async (_req, res): Promise<void> => {
  const rows = await db.select().from(transactionsTable);

  const totalIncome = rows
    .filter((r) => r.type === "income")
    .reduce((s, r) => s + Number(r.amount), 0);
  const totalExpenses = rows
    .filter((r) => r.type === "expense")
    .reduce((s, r) => s + Number(r.amount), 0);
  const totalBalance = totalIncome - totalExpenses;

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthlyRows = rows.filter((r) => r.date.startsWith(currentMonth));
  const monthlyIncome = monthlyRows
    .filter((r) => r.type === "income")
    .reduce((s, r) => s + Number(r.amount), 0);
  const monthlyExpenses = monthlyRows
    .filter((r) => r.type === "expense")
    .reduce((s, r) => s + Number(r.amount), 0);
  const monthlySavings = monthlyIncome - monthlyExpenses;

  res.json(
    GetDashboardSummaryResponse.parse({
      totalBalance,
      totalIncome,
      totalExpenses,
      monthlySavings,
      monthlyIncome,
      monthlyExpenses,
      transactionCount: rows.length,
    })
  );
});

router.get("/summary/monthly", async (_req, res): Promise<void> => {
  const rows = await db.select().from(transactionsTable);

  const monthMap: Record<string, { income: number; expenses: number }> = {};

  for (const row of rows) {
    const monthKey = row.date.substring(0, 7);
    if (!monthMap[monthKey]) {
      monthMap[monthKey] = { income: 0, expenses: 0 };
    }
    if (row.type === "income") {
      monthMap[monthKey].income += Number(row.amount);
    } else {
      monthMap[monthKey].expenses += Number(row.amount);
    }
  }

  const sorted = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6);

  const result = sorted.map(([month, data]) => ({
    month,
    income: Math.round(data.income * 100) / 100,
    expenses: Math.round(data.expenses * 100) / 100,
    savings: Math.round((data.income - data.expenses) * 100) / 100,
  }));

  res.json(GetMonthlyTrendResponse.parse(result));
});

router.get("/summary/category-breakdown", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.type, "expense"));

  const totalExpenses = rows.reduce((s, r) => s + Number(r.amount), 0);
  const catMap: Record<string, { amount: number; count: number }> = {};

  for (const row of rows) {
    if (!catMap[row.category]) {
      catMap[row.category] = { amount: 0, count: 0 };
    }
    catMap[row.category].amount += Number(row.amount);
    catMap[row.category].count++;
  }

  const result = Object.entries(catMap)
    .map(([category, data]) => ({
      category,
      amount: Math.round(data.amount * 100) / 100,
      percentage:
        totalExpenses > 0
          ? Math.round((data.amount / totalExpenses) * 10000) / 100
          : 0,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);

  res.json(GetCategoryBreakdownResponse.parse(result));
});

router.get("/summary/insights", async (_req, res): Promise<void> => {
  const rows = await db.select().from(transactionsTable);

  const expenses = rows.filter((r) => r.type === "expense");
  const incomeRows = rows.filter((r) => r.type === "income");

  const catMap: Record<string, number> = {};
  for (const row of expenses) {
    catMap[row.category] = (catMap[row.category] || 0) + Number(row.amount);
  }

  const sortedCats = Object.entries(catMap).sort(([, a], [, b]) => b - a);
  const highestSpendingCategory = sortedCats[0]?.[0] ?? "N/A";
  const highestSpendingAmount = sortedCats[0]?.[1] ?? 0;
  const topExpenseCategories = sortedCats.slice(0, 3).map(([c]) => c);

  const totalIncome = incomeRows.reduce((s, r) => s + Number(r.amount), 0);
  const totalExpenses = expenses.reduce((s, r) => s + Number(r.amount), 0);
  const savingsRate =
    totalIncome > 0
      ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 10000) / 100
      : 0;

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

  const currentMonthExpenses = expenses
    .filter((r) => r.date.startsWith(currentMonth))
    .reduce((s, r) => s + Number(r.amount), 0);
  const lastMonthExpenses = expenses
    .filter((r) => r.date.startsWith(lastMonth))
    .reduce((s, r) => s + Number(r.amount), 0);

  const monthOverMonthChange =
    lastMonthExpenses > 0
      ? Math.round(
          ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) *
            10000
        ) / 100
      : 0;

  const averageTransactionAmount =
    rows.length > 0
      ? Math.round(
          (rows.reduce((s, r) => s + Number(r.amount), 0) / rows.length) * 100
        ) / 100
      : 0;

  res.json(
    GetInsightsResponse.parse({
      highestSpendingCategory,
      highestSpendingAmount: Math.round(highestSpendingAmount * 100) / 100,
      savingsRate,
      monthOverMonthChange,
      topExpenseCategories,
      averageTransactionAmount,
    })
  );
});

export default router;
