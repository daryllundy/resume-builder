import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
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

// Job application status enum
export const applicationStatusEnum = pgEnum("application_status", [
  "saved",
  "applied",
  "hr_screen",
  "interview",
  "offer",
  "accepted",
  "rejected"
]);

// Job board schema
export const jobPosts = pgTable("job_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  description: text("description").notNull(),
  url: text("url"),
  notes: text("notes"),
  status: applicationStatusEnum("status").notNull().default("saved"),
  dateAdded: timestamp("date_added").notNull().defaultNow(),
  dateModified: timestamp("date_modified").notNull().defaultNow(),
  deadline: timestamp("deadline"),
});

export const insertJobPostSchema = createInsertSchema(jobPosts).omit({
  id: true,
  dateAdded: true,
  dateModified: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTailoringHistory = z.infer<typeof insertTailoringHistorySchema>;
export type TailoringHistory = typeof tailoringHistories.$inferSelect;

export type InsertJobPost = z.infer<typeof insertJobPostSchema>;
export type JobPost = typeof jobPosts.$inferSelect;
export type ApplicationStatus = typeof applicationStatusEnum.enumValues[number];
