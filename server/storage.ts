import { users, type User, type InsertUser, type TailoringHistory, type InsertTailoringHistory, tailoringHistories } from "@shared/schema";

// Storage interface with CRUD methods
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Resume tailoring history methods
  getTailoringHistoryByUserId(userId: number): Promise<TailoringHistory[]>;
  createTailoringHistory(history: InsertTailoringHistory): Promise<TailoringHistory>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tailoringHistories: Map<number, TailoringHistory>;
  currentUserId: number;
  currentHistoryId: number;

  constructor() {
    this.users = new Map();
    this.tailoringHistories = new Map();
    this.currentUserId = 1;
    this.currentHistoryId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTailoringHistoryByUserId(userId: number): Promise<TailoringHistory[]> {
    return Array.from(this.tailoringHistories.values()).filter(
      (history) => history.userId === userId,
    );
  }

  async createTailoringHistory(insertHistory: InsertTailoringHistory): Promise<TailoringHistory> {
    const id = this.currentHistoryId++;
    const history: TailoringHistory = { ...insertHistory, id };
    this.tailoringHistories.set(id, history);
    return history;
  }
}

export const storage = new MemStorage();
