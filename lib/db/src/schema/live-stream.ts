import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const liveStreamSettingsTable = pgTable("live_stream_settings", {
  id: text("id").primaryKey(),
  isLive: boolean("is_live").notNull().default(false),
  title: text("title").notNull().default("Barbie Fun Live"),
  embedUrl: text("embed_url"),
  goLiveUrl: text("go_live_url"),
  videoObjectPath: text("video_object_path"),
  videoTitle: text("video_title"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LiveStreamSettings = typeof liveStreamSettingsTable.$inferSelect;