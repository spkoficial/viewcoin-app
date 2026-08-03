import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scheduleSlotsTable = pgTable("schedule_slots", {
  id: serial("id").primaryKey(),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Domingo, 1=Segunda, ..., 6=Sábado
  hourStart: integer("hour_start").notNull(), // 0-23
  hourEnd: integer("hour_end").notNull(),     // 1-24
  memberName: text("member_name").notNull(),
  channelLink: text("channel_link").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertScheduleSlotSchema = createInsertSchema(scheduleSlotsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertScheduleSlot = z.infer<typeof insertScheduleSlotSchema>;
export type ScheduleSlot = typeof scheduleSlotsTable.$inferSelect;
