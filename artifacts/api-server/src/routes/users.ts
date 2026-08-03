import { Router, type IRouter } from "express";
import { db, usersTable, viewcoinTransactionsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { getUserIdFromToken, hashPassword } from "../lib/auth";

const router: IRouter = Router();

function getAuthUserId(req: any): number | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return getUserIdFromToken(token);
}

router.get("/users", async (_req, res): Promise<void> => {
  const users = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      viewcoins: usersTable.viewcoins,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.viewcoins));

  res.json(users);
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id));

  if (!user) {
    res.status(404).json({ error: "Usuário não encontrado" });
    return;
  }

  const totalMinutesResult = await db
    .select({ total: sql<number>`coalesce(sum(${viewcoinTransactionsTable.minutesWatched}), 0)` })
    .from(viewcoinTransactionsTable)
    .where(eq(viewcoinTransactionsTable.userId, id));

  const recentTransactions = await db
    .select()
    .from(viewcoinTransactionsTable)
    .where(eq(viewcoinTransactionsTable.userId, id))
    .orderBy(desc(viewcoinTransactionsTable.earnedAt))
    .limit(10);

  res.json({
    id: user.id,
    username: user.username,
    viewcoins: user.viewcoins,
    totalMinutesWatched: Number(totalMinutesResult[0]?.total ?? 0),
    createdAt: user.createdAt.toISOString(),
    recentTransactions: recentTransactions.map(t => ({
      id: t.id,
      userId: t.userId,
      amount: t.amount,
      minutesWatched: t.minutesWatched,
      channelName: t.channelName,
      earnedAt: t.earnedAt.toISOString(),
    })),
  });
});

router.patch("/users/:id", async (req, res): Promise<void> => {
  const authUserId = getAuthUserId(req);
  if (!authUserId) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  if (authUserId !== id) {
    res.status(403).json({ error: "Sem permissão" });
    return;
  }

  const { username, email, password } = req.body;
  const updates: Record<string, any> = {};

  if (username) updates.username = username;
  if (email) updates.email = email;
  if (password) updates.passwordHash = hashPassword(password);

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "Nenhum campo para atualizar" });
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "Usuário não encontrado" });
    return;
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    viewcoins: user.viewcoins,
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
