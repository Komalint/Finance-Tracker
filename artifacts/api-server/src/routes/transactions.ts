import { Router, type IRouter } from "express";
import { eq, desc, ilike, and, sql } from "drizzle-orm";
import { db, transactionsTable } from "@workspace/db";
import {
  ListTransactionsQueryParams,
  ListTransactionsResponse,
  CreateTransactionBody,
  GetTransactionParams,
  GetTransactionResponse,
  UpdateTransactionParams,
  UpdateTransactionBody,
  UpdateTransactionResponse,
  DeleteTransactionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/transactions", async (req, res): Promise<void> => {
  const queryParsed = ListTransactionsQueryParams.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.message });
    return;
  }
  const { category, type, search, sortBy, sortOrder } = queryParsed.data;

  const conditions = [];

  if (category) {
    conditions.push(eq(transactionsTable.category, category));
  }
  if (type) {
    conditions.push(eq(transactionsTable.type, type as "income" | "expense"));
  }
  if (search) {
    conditions.push(ilike(transactionsTable.description, `%${search}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const isAsc = sortOrder === "asc";

  let orderCol;
  if (sortBy === "amount") {
    orderCol = isAsc
      ? sql`${transactionsTable.amount} ASC`
      : sql`${transactionsTable.amount} DESC`;
  } else if (sortBy === "date") {
    orderCol = isAsc
      ? sql`${transactionsTable.date} ASC`
      : sql`${transactionsTable.date} DESC`;
  } else if (sortBy === "description") {
    orderCol = isAsc
      ? sql`${transactionsTable.description} ASC`
      : sql`${transactionsTable.description} DESC`;
  } else {
    orderCol = desc(transactionsTable.createdAt);
  }

  const rows = await db
    .select()
    .from(transactionsTable)
    .where(whereClause)
    .orderBy(orderCol);

  const mapped = rows.map((r) => ({
    ...r,
    amount: Number(r.amount),
    date: r.date,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  res.json(ListTransactionsResponse.parse(mapped));
});

router.post("/transactions", async (req, res): Promise<void> => {
  const parsed = CreateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .insert(transactionsTable)
    .values({
      description: parsed.data.description,
      amount: String(parsed.data.amount),
      type: parsed.data.type as "income" | "expense",
      category: parsed.data.category,
      date: parsed.data.date,
    })
    .returning();

  res.status(201).json(
    GetTransactionResponse.parse({
      ...row,
      amount: Number(row.amount),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })
  );
});

router.get("/transactions/:id", async (req, res): Promise<void> => {
  const params = GetTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }

  res.json(
    GetTransactionResponse.parse({
      ...row,
      amount: Number(row.amount),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })
  );
});

router.patch("/transactions/:id", async (req, res): Promise<void> => {
  const params = UpdateTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.description !== undefined)
    updateData.description = parsed.data.description;
  if (parsed.data.amount !== undefined)
    updateData.amount = String(parsed.data.amount);
  if (parsed.data.type !== undefined) updateData.type = parsed.data.type;
  if (parsed.data.category !== undefined)
    updateData.category = parsed.data.category;
  if (parsed.data.date !== undefined) updateData.date = parsed.data.date;

  const [row] = await db
    .update(transactionsTable)
    .set(updateData)
    .where(eq(transactionsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }

  res.json(
    UpdateTransactionResponse.parse({
      ...row,
      amount: Number(row.amount),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })
  );
});

router.delete("/transactions/:id", async (req, res): Promise<void> => {
  const params = DeleteTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(transactionsTable)
    .where(eq(transactionsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
