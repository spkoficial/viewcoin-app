import { Router, type IRouter } from "express";
import { db, usersTable, viewcoinTransactionsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { getUserIdFromToken } from "../lib/auth";

const router: IRouter = Router();

function getAuthUserId(req: any): number | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return getUserIdFromToken(token);
}

router.post("/viewcoins/earn", async (req, res): Promise<void> => {
  const userId = getAuthUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }

  const { minutesWatched, channelName, slotId } = req.body;

  if (!minutesWatched || !channelName) {
    res.status(400).json({ error: "minutesWatched e channelName são obrigatórios" });
    return;
  }

  // 1 Viewcoin per 5 minutes
  const viewcoinsEarned = Math.floor(minutesWatched / 5);

  if (viewcoinsEarned <= 0) {
    res.status(400).json({ error: "Mínimo de 5 minutos para ganhar Viewcoins" });
    return;
  }

  // Insert transaction
  const [transaction] = await db
    .insert(viewcoinTransactionsTable)
    .values({
      userId,
      amount: viewcoinsEarned,
      minutesWatched,
      channelName,
    })
    .returning();

  // Update user balance
  const [updatedUser] = await db
    .update(usersTable)
    .set({ viewcoins: sql`${usersTable.viewcoins} + ${viewcoinsEarned}` })
    .where(eq(usersTable.id, userId))
    .returning({ viewcoins: usersTable.viewcoins });

  res.json({
    viewcoinsEarned,
    newBalance: updatedUser.viewcoins,
    transaction: {
      id: transaction.id,
      userId: transaction.userId,
      amount: transaction.amount,
      minutesWatched: transaction.minutesWatched,
      channelName: transaction.channelName,
      earnedAt: transaction.earnedAt.toISOString(),
    },
  });
});

router.get("/viewcoins/history/:userId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);

  if (isNaN(userId)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  const transactions = await db
    .select()
    .from(viewcoinTransactionsTable)
    .where(eq(viewcoinTransactionsTable.userId, userId))
    .orderBy(desc(viewcoinTransactionsTable.earnedAt))
    .limit(50);

  res.json(transactions.map(t => ({
    id: t.id,
    userId: t.userId,
    amount: t.amount,
    minutesWatched: t.minutesWatched,
    channelName: t.channelName,
    earnedAt: t.earnedAt.toISOString(),
  })));
});

router.get("/ranking", async (_req, res): Promise<void> => {
  const users = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      viewcoins: usersTable.viewcoins,
      totalMinutesWatched: sql<number>`coalesce((select sum(minutes_watched) from viewcoin_transactions where user_id = ${usersTable.id}), 0)`,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.viewcoins));

  const ranking = users.map((user, index) => ({
    position: index + 1,
    userId: user.id,
    username: user.username,
    viewcoins: user.viewcoins,
    totalMinutesWatched: Number(user.totalMinutesWatched),
  }));

  res.json(ranking);
});

export default router;
