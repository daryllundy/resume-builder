import { users, type User, type InsertUser, 
  type TailoringHistory, type InsertTailoringHistory, tailoringHistories,
  type JobPost, type InsertJobPost, jobPosts, type ApplicationStatus
} from "@shared/schema";
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, desc, asc } from 'drizzle-orm';
import * as schema from '@shared/schema';

// Configure database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// Storage interface with CRUD methods
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Resume tailoring history methods
  getTailoringHistoryByUserId(userId: number): Promise<TailoringHistory[]>;
  createTailoringHistory(history: InsertTailoringHistory): Promise<TailoringHistory>;

  // Job board methods
  getJobPostsByUserId(userId: number): Promise<JobPost[]>;
  getJobPostById(id: number): Promise<JobPost | undefined>;
  createJobPost(jobPost: InsertJobPost): Promise<JobPost>;
  updateJobPost(id: number, jobPost: Partial<InsertJobPost>): Promise<JobPost | undefined>;
  updateJobPostStatus(id: number, status: ApplicationStatus): Promise<JobPost | undefined>;
  deleteJobPost(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getTailoringHistoryByUserId(userId: number): Promise<TailoringHistory[]> {
    return await db.select().from(tailoringHistories)
      .where(eq(tailoringHistories.userId, userId))
      .orderBy(desc(tailoringHistories.requestDate));
  }

  async createTailoringHistory(insertHistory: InsertTailoringHistory): Promise<TailoringHistory> {
    const [history] = await db.insert(tailoringHistories).values(insertHistory).returning();
    return history;
  }

  async getJobPostsByUserId(userId: number): Promise<JobPost[]> {
    return await db.select().from(jobPosts)
      .where(eq(jobPosts.userId, userId))
      .orderBy(desc(jobPosts.dateModified));
  }

  async getJobPostById(id: number): Promise<JobPost | undefined> {
    const [jobPost] = await db.select().from(jobPosts).where(eq(jobPosts.id, id));
    return jobPost;
  }

  async createJobPost(insertJobPost: InsertJobPost): Promise<JobPost> {
    const [jobPost] = await db.insert(jobPosts).values(insertJobPost).returning();
    return jobPost;
  }

  async updateJobPost(id: number, updatedJobPost: Partial<InsertJobPost>): Promise<JobPost | undefined> {
    const [jobPost] = await db.update(jobPosts)
      .set({
        ...updatedJobPost,
        dateModified: new Date()
      })
      .where(eq(jobPosts.id, id))
      .returning();
    return jobPost;
  }

  async updateJobPostStatus(id: number, status: ApplicationStatus): Promise<JobPost | undefined> {
    const [jobPost] = await db.update(jobPosts)
      .set({
        status,
        dateModified: new Date()
      })
      .where(eq(jobPosts.id, id))
      .returning();
    return jobPost;
  }

  async deleteJobPost(id: number): Promise<boolean> {
    const result = await db.delete(jobPosts).where(eq(jobPosts.id, id));
    return true; // In Drizzle, delete doesn't return count directly
  }
}

export const storage = new DatabaseStorage();
