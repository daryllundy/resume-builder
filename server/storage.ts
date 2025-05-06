import { users, type User, type InsertUser, 
  type TailoringHistory, type InsertTailoringHistory, tailoringHistories,
  type JobPost, type InsertJobPost, jobPosts, type ApplicationStatus
} from "@shared/schema";
import { eq, desc, asc } from 'drizzle-orm';
import { db } from './db';

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

// In-memory fallback storage to handle database connection issues
class MemoryStorage implements IStorage {
  private users: User[] = [];
  private tailoringHistories: TailoringHistory[] = [];
  private jobPosts: JobPost[] = [];
  private nextUserId = 1;
  private nextJobId = 1;
  private nextHistoryId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = {
      id: this.nextUserId++,
      ...insertUser
    };
    this.users.push(user);
    return user;
  }

  async getTailoringHistoryByUserId(userId: number): Promise<TailoringHistory[]> {
    return this.tailoringHistories
      .filter(history => history.userId === userId)
      .sort((a, b) => {
        const dateA = a.createdAt || a.requestDate;
        const dateB = b.createdAt || b.requestDate;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
  }

  async createTailoringHistory(insertHistory: InsertTailoringHistory): Promise<TailoringHistory> {
    const now = new Date();
    const history = {
      id: this.nextHistoryId++,
      ...insertHistory,
      createdAt: now,
      tailoredResume: insertHistory.tailoredResume || null
    } as TailoringHistory;
    
    this.tailoringHistories.push(history);
    return history;
  }

  async getJobPostsByUserId(userId: number): Promise<JobPost[]> {
    return this.jobPosts
      .filter(job => job.userId === userId)
      .sort((a, b) => new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime());
  }

  async getJobPostById(id: number): Promise<JobPost | undefined> {
    return this.jobPosts.find(job => job.id === id);
  }

  async createJobPost(insertJobPost: InsertJobPost): Promise<JobPost> {
    const now = new Date();
    const job = {
      id: this.nextJobId++,
      ...insertJobPost,
      dateAdded: now,
      dateModified: now,
      deadline: insertJobPost.deadline || null
    } as JobPost;
    
    this.jobPosts.push(job);
    return job;
  }

  async updateJobPost(id: number, updatedJobPost: Partial<InsertJobPost>): Promise<JobPost | undefined> {
    const index = this.jobPosts.findIndex(job => job.id === id);
    if (index === -1) return undefined;
    
    const job = this.jobPosts[index];
    const updatedJob = {
      ...job,
      ...updatedJobPost,
      dateModified: new Date()
    };
    
    this.jobPosts[index] = updatedJob;
    return updatedJob;
  }

  async updateJobPostStatus(id: number, status: ApplicationStatus): Promise<JobPost | undefined> {
    const index = this.jobPosts.findIndex(job => job.id === id);
    if (index === -1) return undefined;
    
    const job = this.jobPosts[index];
    const updatedJob = {
      ...job,
      status,
      dateModified: new Date()
    };
    
    this.jobPosts[index] = updatedJob;
    return updatedJob;
  }

  async deleteJobPost(id: number): Promise<boolean> {
    const index = this.jobPosts.findIndex(job => job.id === id);
    if (index === -1) return false;
    
    this.jobPosts.splice(index, 1);
    return true;
  }
}

// Database storage with fallback to in-memory when connection fails
export class DatabaseStorage implements IStorage {
  private memStorage = new MemoryStorage();
  private useInMemory = false;

  private async withFallback<T>(dbOperation: () => Promise<T>, memOperation: () => Promise<T>): Promise<T> {
    // If we've previously switched to in-memory storage, continue using it
    if (this.useInMemory) {
      return memOperation();
    }

    try {
      // Try to use the database
      return await dbOperation();
    } catch (error) {
      console.warn("Database operation failed, falling back to in-memory storage:", error);
      
      // Switch to in-memory mode permanently for this session
      this.useInMemory = true;
      
      // Use in-memory storage as fallback
      return memOperation();
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.withFallback(
      async () => {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
      },
      () => this.memStorage.getUser(id)
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.withFallback(
      async () => {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        return user;
      },
      () => this.memStorage.getUserByUsername(username)
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return this.withFallback(
      async () => {
        const [user] = await db.insert(users).values(insertUser).returning();
        return user;
      },
      () => this.memStorage.createUser(insertUser)
    );
  }

  async getTailoringHistoryByUserId(userId: number): Promise<TailoringHistory[]> {
    return this.withFallback(
      async () => {
        return await db.select().from(tailoringHistories)
          .where(eq(tailoringHistories.userId, userId))
          .orderBy(desc(tailoringHistories.requestDate));
      },
      () => this.memStorage.getTailoringHistoryByUserId(userId)
    );
  }

  async createTailoringHistory(insertHistory: InsertTailoringHistory): Promise<TailoringHistory> {
    return this.withFallback(
      async () => {
        const [history] = await db.insert(tailoringHistories).values(insertHistory).returning();
        return history;
      },
      () => this.memStorage.createTailoringHistory(insertHistory)
    );
  }

  async getJobPostsByUserId(userId: number): Promise<JobPost[]> {
    return this.withFallback(
      async () => {
        return await db.select().from(jobPosts)
          .where(eq(jobPosts.userId, userId))
          .orderBy(desc(jobPosts.dateModified));
      },
      () => this.memStorage.getJobPostsByUserId(userId)
    );
  }

  async getJobPostById(id: number): Promise<JobPost | undefined> {
    return this.withFallback(
      async () => {
        const [jobPost] = await db.select().from(jobPosts).where(eq(jobPosts.id, id));
        return jobPost;
      },
      () => this.memStorage.getJobPostById(id)
    );
  }

  async createJobPost(insertJobPost: InsertJobPost): Promise<JobPost> {
    return this.withFallback(
      async () => {
        const [jobPost] = await db.insert(jobPosts).values(insertJobPost).returning();
        return jobPost;
      },
      () => this.memStorage.createJobPost(insertJobPost)
    );
  }

  async updateJobPost(id: number, updatedJobPost: Partial<InsertJobPost>): Promise<JobPost | undefined> {
    return this.withFallback(
      async () => {
        const [jobPost] = await db.update(jobPosts)
          .set({
            ...updatedJobPost,
            dateModified: new Date()
          })
          .where(eq(jobPosts.id, id))
          .returning();
        return jobPost;
      },
      () => this.memStorage.updateJobPost(id, updatedJobPost)
    );
  }

  async updateJobPostStatus(id: number, status: ApplicationStatus): Promise<JobPost | undefined> {
    return this.withFallback(
      async () => {
        const [jobPost] = await db.update(jobPosts)
          .set({
            status,
            dateModified: new Date()
          })
          .where(eq(jobPosts.id, id))
          .returning();
        return jobPost;
      },
      () => this.memStorage.updateJobPostStatus(id, status)
    );
  }

  async deleteJobPost(id: number): Promise<boolean> {
    return this.withFallback(
      async () => {
        await db.delete(jobPosts).where(eq(jobPosts.id, id));
        return true;
      },
      () => this.memStorage.deleteJobPost(id)
    );
  }
}

export const storage = new DatabaseStorage();
