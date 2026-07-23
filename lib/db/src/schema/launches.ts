import { pgTable, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const launchesTable = pgTable("launches", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  ticker: text("ticker").notNull(),
  description: text("description").notNull().default(""),
  website: text("website"),
  twitter: text("twitter"),
  telegram: text("telegram"),
  totalSupply: text("total_supply").notNull(),
  chainId: integer("chain_id").notNull(),
  chainName: text("chain_name").notNull(),
  deployer: text("deployer").notNull(),
  feeTxHash: text("fee_tx_hash").notNull(),
  verified: boolean("verified").notNull().default(false),
  /** true = mint authority retained; false = renounced (safer) */
  mintAuthority: boolean("mint_authority").notNull().default(true),
  /** true = freeze authority retained; false = disabled (safer, Solana/X1 only) */
  freezeAuthority: boolean("freeze_authority").notNull().default(false),
  /** Wallet address or username of the referrer, captured via ?ref= URL param */
  referredBy: text("referred_by"),
  /** Object storage path for the token logo, e.g. /objects/uploads/<uuid> */
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLaunchSchema = createInsertSchema(launchesTable).omit({
  createdAt: true,
});
export type InsertLaunch = z.infer<typeof insertLaunchSchema>;
export type DbLaunch = typeof launchesTable.$inferSelect;
