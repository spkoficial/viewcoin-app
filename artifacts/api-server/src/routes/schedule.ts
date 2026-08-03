import { Router, type IRouter } from "express";
import { db, scheduleSlotsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getUserIdFromToken } from "../lib/auth";

const router: IRouter = Router();

function getAuthUserId(req: any): number | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return getUserIdFromToken(token);
}

async function isAdmin(userId: number): Promise<boolean> {
  const [user] = await db
    .select({ isAdmin: usersTable.isAdmin })
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  return user?.isAdmin ?? false;
}

function formatSlot(slot: any) {
  return {
    id: slot.id,
    dayOfWeek: slot.dayOfWeek,
    hourStart: slot.hourStart,
    hourEnd: slot.hourEnd,
    memberName: slot.memberName,
    channelLink: slot.channelLink,
    createdAt: slot.createdAt instanceof Date ? slot.createdAt.toISOString() : slot.createdAt,
  };
}

router.get("/schedule", async (_req, res): Promise<void> => {
  const slots = await db
    .select()
    .from(scheduleSlotsTable)
    .orderBy(scheduleSlotsTable.dayOfWeek, scheduleSlotsTable.hourStart);

  res.json(slots.map(formatSlot));
});

router.get("/schedule/current", async (_req, res): Promise<void> => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday, ...
  const currentHour = now.getHours();

  const slots = await db
    .select()
    .from(scheduleSlotsTable)
    .where(
      and(
        eq(scheduleSlotsTable.dayOfWeek, dayOfWeek),
      )
    );

  const activeSlot = slots.find(
    s => s.hourStart <= currentHour && s.hourEnd > currentHour
  );

  if (activeSlot) {
    res.json({ hasSlot: true, slot: formatSlot(activeSlot) });
  } else {
    res.json({ hasSlot: false });
  }
});

router.post("/schedule/slot", async (req, res): Promise<void> => {
  const userId = getAuthUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }

  if (!(await isAdmin(userId))) {
    res.status(403).json({ error: "Apenas administradores podem editar a grade" });
    return;
  }

  const { dayOfWeek, hourStart, hourEnd, memberName, channelLink } = req.body;

  if (dayOfWeek === undefined || hourStart === undefined || hourEnd === undefined || !memberName || !channelLink) {
    res.status(400).json({ error: "Todos os campos são obrigatórios" });
    return;
  }

  const [slot] = await db
    .insert(scheduleSlotsTable)
    .values({ dayOfWeek, hourStart, hourEnd, memberName, channelLink })
    .returning();

  res.status(201).json(formatSlot(slot));
});

router.put("/schedule/:id", async (req, res): Promise<void> => {
  const userId = getAuthUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }

  if (!(await isAdmin(userId))) {
    res.status(403).json({ error: "Apenas administradores podem editar a grade" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const { dayOfWeek, hourStart, hourEnd, memberName, channelLink } = req.body;

  const [slot] = await db
    .update(scheduleSlotsTable)
    .set({ dayOfWeek, hourStart, hourEnd, memberName, channelLink })
    .where(eq(scheduleSlotsTable.id, id))
    .returning();

  if (!slot) {
    res.status(404).json({ error: "Slot não encontrado" });
    return;
  }

  res.json(formatSlot(slot));
});

router.delete("/schedule/:id", async (req, res): Promise<void> => {
  const userId = getAuthUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }

  if (!(await isAdmin(userId))) {
    res.status(403).json({ error: "Apenas administradores podem editar a grade" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [slot] = await db
    .delete(scheduleSlotsTable)
    .where(eq(scheduleSlotsTable.id, id))
    .returning();

  if (!slot) {
    res.status(404).json({ error: "Slot não encontrado" });
    return;
  }

  res.json({ success: true, message: "Slot removido com sucesso" });
});

export default router;
