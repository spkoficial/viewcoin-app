import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const viewcoinTransactionsTable = pgTable("viewcoin_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull().default(1),
  minutesWatched: integer("minutes_watched").notNull(),
  channelName: text("channel_name").notNull(),
  earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertViewcoinTransactionSchema = createInsertSchema(viewcoinTransactionsTable).omit({ id: true, earnedAt: true });
export type InsertViewcoinTransaction = z.infer<typeof insertViewcoinTransactionSchema>;
export type ViewcoinTransaction = typeof viewcoinTransactionsTable.$inferSelect;
