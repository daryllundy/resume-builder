import { users, type User, type InsertUser, 
  type TailoringHistory, type InsertTailoringHistory, tailoringHistories,
  type JobPost, type InsertJobPost, jobPosts, type ApplicationStatus,
  resumes, type Resume, type InsertResume
} from "@shared/schema";
import { eq, desc, asc } from 'drizzle-orm';
import { db } from './db';

// Storage interface with CRUD methods
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Resume management methods
  getResumesByUserId(userId: number): Promise<Resume[]>;
  getResumeById(id: number): Promise<Resume | undefined>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: number, resume: Partial<InsertResume>): Promise<Resume | undefined>;
  deleteResume(id: number): Promise<boolean>;
  setDefaultResume(userId: number, resumeId: number): Promise<void>;

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
  private users: User[] = [
    // Create a default user with ID 1 to avoid foreign key constraints
    { id: 1, username: 'default', password: 'password' }
  ];
  private resumes: Resume[] = [];
  private tailoringHistories: TailoringHistory[] = [];
  private jobPosts: JobPost[] = [];
  private nextUserId = 2; // Start from 2 since we already have user 1
  private nextResumeId = 1;
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

  // Resume management methods
  async getResumesByUserId(userId: number): Promise<Resume[]> {
    return this.resumes
      .filter(resume => resume.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getResumeById(id: number): Promise<Resume | undefined> {
    return this.resumes.find(resume => resume.id === id);
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    const now = new Date();
    const resume = {
      id: this.nextResumeId++,
      ...insertResume,
      originalFileName: insertResume.originalFileName || null,
      isDefault: insertResume.isDefault || false,
      createdAt: now,
      updatedAt: now,
    };
    this.resumes.push(resume);
    return resume;
  }

  async updateResume(id: number, updatedResume: Partial<InsertResume>): Promise<Resume | undefined> {
    const resumeIndex = this.resumes.findIndex(resume => resume.id === id);
    if (resumeIndex === -1) return undefined;

    const now = new Date();
    this.resumes[resumeIndex] = {
      ...this.resumes[resumeIndex],
      ...updatedResume,
      updatedAt: now,
    };
    return this.resumes[resumeIndex];
  }

  async deleteResume(id: number): Promise<boolean> {
    const resumeIndex = this.resumes.findIndex(resume => resume.id === id);
    if (resumeIndex === -1) return false;

    this.resumes.splice(resumeIndex, 1);
    return true;
  }

  async setDefaultResume(userId: number, resumeId: number): Promise<void> {
    // First, unset any existing default resumes for this user
    this.resumes.forEach(resume => {
      if (resume.userId === userId) {
        resume.isDefault = false;
      }
    });

    // Then set the new default
    const resumeIndex = this.resumes.findIndex(resume => resume.id === resumeId && resume.userId === userId);
    if (resumeIndex !== -1) {
      this.resumes[resumeIndex].isDefault = true;
    }
  }

  async getTailoringHistoryByUserId(userId: number): Promise<TailoringHistory[]> {
    return this.tailoringHistories
      .filter(history => history.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  // Resume management methods
  async getResumesByUserId(userId: number): Promise<Resume[]> {
    return this.withFallback(
      async () => {
        return await db.select().from(resumes)
          .where(eq(resumes.userId, userId))
          .orderBy(desc(resumes.updatedAt));
      },
      () => this.memStorage.getResumesByUserId(userId)
    );
  }

  async getResumeById(id: number): Promise<Resume | undefined> {
    return this.withFallback(
      async () => {
        const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
        return resume;
      },
      () => this.memStorage.getResumeById(id)
    );
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    return this.withFallback(
      async () => {
        const [resume] = await db.insert(resumes).values(insertResume).returning();
        return resume;
      },
      () => this.memStorage.createResume(insertResume)
    );
  }

  async updateResume(id: number, updatedResume: Partial<InsertResume>): Promise<Resume | undefined> {
    return this.withFallback(
      async () => {
        const [resume] = await db.update(resumes)
          .set({
            ...updatedResume,
            updatedAt: new Date()
          })
          .where(eq(resumes.id, id))
          .returning();
        return resume;
      },
      () => this.memStorage.updateResume(id, updatedResume)
    );
  }

  async deleteResume(id: number): Promise<boolean> {
    return this.withFallback(
      async () => {
        const result = await db.delete(resumes).where(eq(resumes.id, id));
        return (result.rowCount || 0) > 0;
      },
      () => this.memStorage.deleteResume(id)
    );
  }

  async setDefaultResume(userId: number, resumeId: number): Promise<void> {
    return this.withFallback(
      async () => {
        // First, unset any existing default resumes for this user
        await db.update(resumes)
          .set({ isDefault: false })
          .where(eq(resumes.userId, userId));

        // Then set the new default
        await db.update(resumes)
          .set({ isDefault: true })
          .where(eq(resumes.id, resumeId));
      },
      () => this.memStorage.setDefaultResume(userId, resumeId)
    );
  }

  async getTailoringHistoryByUserId(userId: number): Promise<TailoringHistory[]> {
    return this.withFallback(
      async () => {
        return await db.select().from(tailoringHistories)
          .where(eq(tailoringHistories.userId, userId))
          .orderBy(desc(tailoringHistories.createdAt));
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
