import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Resume tailoring history table schema
export const tailoringHistories = pgTable("tailoring_histories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  requestDate: timestamp("request_date").notNull(),
  resumeText: text("resume_text").notNull(),
  jobDescription: text("job_description").notNull(),
  tailoredResume: text("tailored_resume"),
});

export const insertTailoringHistorySchema = createInsertSchema(tailoringHistories).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTailoringHistory = z.infer<typeof insertTailoringHistorySchema>;
export type TailoringHistory = typeof tailoringHistories.$inferSelect;
