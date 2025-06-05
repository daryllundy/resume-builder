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

// Resumes table for storing uploaded resumes
export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  originalFileName: text("original_file_name"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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

// Resume tailoring history table schema
export const tailoringHistories = pgTable("tailoring_histories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  resumeId: integer("resume_id").notNull().references(() => resumes.id),
  jobPostId: integer("job_post_id").references(() => jobPosts.id),
  originalResume: text("original_resume").notNull(),
  jobDescription: text("job_description").notNull(),
  tailoredResume: text("tailored_resume").notNull(),
  templateId: text("template_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTailoringHistorySchema = createInsertSchema(tailoringHistories).omit({
  id: true,
  createdAt: true,
});

export const insertJobPostSchema = createInsertSchema(jobPosts).omit({
  id: true,
  dateAdded: true,
  dateModified: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumes.$inferSelect;

export type InsertTailoringHistory = z.infer<typeof insertTailoringHistorySchema>;
export type TailoringHistory = typeof tailoringHistories.$inferSelect;

export type InsertJobPost = z.infer<typeof insertJobPostSchema>;
export type JobPost = typeof jobPosts.$inferSelect;
export type ApplicationStatus = typeof applicationStatusEnum.enumValues[number];
