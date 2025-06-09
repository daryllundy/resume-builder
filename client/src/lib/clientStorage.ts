import { 
  getResumes, 
  saveResume, 
  updateResume, 
  deleteResume, 
  getResumeById,
  getJobPosts,
  saveJobPost,
  updateJobPost,
  deleteJobPost,
  getJobPostById,
  getTailoringHistory,
  saveTailoringHistory,
  getTailoringHistoryByJobId,
  getTailoringHistoryByUserId,
  getCurrentUser,
  initializeWithDemoData
} from './localStorage';

import type { Resume, JobPost, TailoringHistory, InsertResume, InsertJobPost, InsertTailoringHistory } from '@shared/schema';

// Initialize demo data on first load
if (typeof window !== 'undefined') {
  initializeWithDemoData();
}

// Client-side storage service that mimics the server API
export const clientStorage = {
  // Resume operations
  async getResumes(): Promise<Resume[]> {
    return Promise.resolve(getResumes());
  },

  async getResumeById(id: number): Promise<Resume | null> {
    return Promise.resolve(getResumeById(id));
  },

  async createResume(resume: InsertResume): Promise<Resume> {
    const currentUser = getCurrentUser();
    const newResume = saveResume({
      userId: currentUser.id,
      title: resume.title,
      content: resume.content,
      originalFileName: resume.originalFileName || null,
      isDefault: resume.isDefault || null
    });
    return Promise.resolve(newResume);
  },

  async updateResume(id: number, updates: Partial<InsertResume>): Promise<Resume | null> {
    const updated = updateResume(id, updates);
    return Promise.resolve(updated);
  },

  async deleteResume(id: number): Promise<boolean> {
    return Promise.resolve(deleteResume(id));
  },

  async setDefaultResume(userId: number, resumeId: number): Promise<void> {
    const resumes = getResumes();
    
    // Remove default flag from all resumes
    resumes.forEach(resume => {
      if (resume.isDefault) {
        updateResume(resume.id, { isDefault: false });
      }
    });
    
    // Set the selected resume as default
    updateResume(resumeId, { isDefault: true });
    
    return Promise.resolve();
  },

  // Job operations
  async getJobPosts(): Promise<JobPost[]> {
    return Promise.resolve(getJobPosts());
  },

  async getJobPostById(id: number): Promise<JobPost | null> {
    return Promise.resolve(getJobPostById(id));
  },

  async createJobPost(job: InsertJobPost): Promise<JobPost> {
    const currentUser = getCurrentUser();
    const newJob = saveJobPost({
      ...job,
      userId: currentUser.id
    });
    return Promise.resolve(newJob);
  },

  async updateJobPost(id: number, updates: Partial<InsertJobPost>): Promise<JobPost | null> {
    const updated = updateJobPost(id, updates);
    return Promise.resolve(updated);
  },

  async updateJobPostStatus(id: number, status: JobPost['status']): Promise<JobPost | null> {
    const updated = updateJobPost(id, { status });
    return Promise.resolve(updated);
  },

  async deleteJobPost(id: number): Promise<boolean> {
    return Promise.resolve(deleteJobPost(id));
  },

  // Tailoring history operations
  async getTailoringHistory(): Promise<TailoringHistory[]> {
    return Promise.resolve(getTailoringHistory());
  },

  async getTailoringHistoryByJobId(jobId: number): Promise<TailoringHistory[]> {
    return Promise.resolve(getTailoringHistoryByJobId(jobId));
  },

  async getTailoringHistoryByUserId(userId: number): Promise<TailoringHistory[]> {
    return Promise.resolve(getTailoringHistoryByUserId(userId));
  },

  async createTailoringHistory(history: InsertTailoringHistory): Promise<TailoringHistory> {
    const currentUser = getCurrentUser();
    const newHistory = saveTailoringHistory({
      ...history,
      userId: currentUser.id
    });
    return Promise.resolve(newHistory);
  },

  // User operations
  async getCurrentUser() {
    return Promise.resolve(getCurrentUser());
  }
};

// Mock API functions that work with localStorage
export const mockApiRequest = async (endpoint: string, method: string = 'GET', data?: any): Promise<any> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));

  const [, , resource, id, action] = endpoint.split('/');

  try {
    switch (resource) {
      case 'resumes':
        if (method === 'GET') {
          if (id) {
            const resume = await clientStorage.getResumeById(parseInt(id));
            if (!resume) throw new Error('Resume not found');
            return resume;
          }
          return await clientStorage.getResumes();
        }
        if (method === 'POST') {
          if (action === 'set-default') {
            const currentUser = getCurrentUser();
            await clientStorage.setDefaultResume(currentUser.id, parseInt(id));
            return { success: true };
          }
          return await clientStorage.createResume(data);
        }
        if (method === 'PUT' && id) {
          const updated = await clientStorage.updateResume(parseInt(id), data);
          if (!updated) throw new Error('Resume not found');
          return updated;
        }
        if (method === 'PATCH' && id) {
          const updated = await clientStorage.updateResume(parseInt(id), data);
          if (!updated) throw new Error('Resume not found');
          return updated;
        }
        if (method === 'DELETE' && id) {
          const deleted = await clientStorage.deleteResume(parseInt(id));
          if (!deleted) throw new Error('Resume not found');
          return { success: true };
        }
        break;

      case 'jobs':
        if (method === 'GET') {
          if (id) {
            const job = await clientStorage.getJobPostById(parseInt(id));
            if (!job) throw new Error('Job not found');
            return job;
          }
          return await clientStorage.getJobPosts();
        }
        if (method === 'POST') {
          return await clientStorage.createJobPost(data);
        }
        if (method === 'PUT' && id) {
          const updated = await clientStorage.updateJobPost(parseInt(id), data);
          if (!updated) throw new Error('Job not found');
          return updated;
        }
        if (method === 'PATCH' && id) {
          const updated = await clientStorage.updateJobPost(parseInt(id), data);
          if (!updated) throw new Error('Job not found');
          return updated;
        }
        if (method === 'DELETE' && id) {
          const deleted = await clientStorage.deleteJobPost(parseInt(id));
          if (!deleted) throw new Error('Job not found');
          return { success: true };
        }
        break;

      case 'job-description':
        if (action === 'save' && method === 'POST') {
          return await clientStorage.createJobPost(data);
        }
        break;

      case 'tailoring-history':
        if (method === 'GET') {
          return await clientStorage.getTailoringHistory();
        }
        if (method === 'POST') {
          return await clientStorage.createTailoringHistory(data);
        }
        break;

      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }
  } catch (error) {
    console.error('MockAPI Error:', error);
    throw error;
  }

  throw new Error(`Unsupported method ${method} for endpoint ${endpoint}`);
};