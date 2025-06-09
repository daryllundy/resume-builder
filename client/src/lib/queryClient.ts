import { QueryClient, QueryFunction } from "@tanstack/react-query";
import type { Resume, JobPost, TailoringHistory } from '@shared/schema';

// Storage keys for localStorage
const STORAGE_KEYS = {
  RESUMES: 'resume_tailor_resumes',
  JOB_POSTS: 'resume_tailor_jobs',
  TAILORING_HISTORY: 'resume_tailor_history',
  COUNTERS: 'resume_tailor_counters'
} as const;

interface Counters {
  resumeId: number;
  jobId: number;
  historyId: number;
}

// Storage utilities
const getCounters = (): Counters => {
  const stored = localStorage.getItem(STORAGE_KEYS.COUNTERS);
  return stored ? JSON.parse(stored) : { resumeId: 1, jobId: 1, historyId: 1 };
};

const updateCounters = (counters: Counters) => {
  localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(counters));
};

// Initialize with demo data if storage is empty
const initializeDemoData = () => {
  const resumes = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESUMES) || '[]');
  const jobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.JOB_POSTS) || '[]');
  
  if (resumes.length === 0 && jobs.length === 0) {
    const demoResume: Resume = {
      id: 1,
      userId: 1,
      title: "Software Engineer Resume",
      content: `John Doe
Software Engineer
Email: john.doe@email.com
Phone: (555) 123-4567

Professional Summary:
Experienced software engineer with 5+ years developing scalable web applications using modern technologies.

Technical Skills:
• Programming Languages: JavaScript, TypeScript, Python
• Frontend: React, Vue.js, HTML5, CSS3
• Backend: Node.js, Express
• Databases: PostgreSQL, MongoDB

Professional Experience:
Senior Software Engineer | TechCorp Inc. | 2021 - Present
• Led development of microservices architecture serving 100K+ daily users
• Reduced application load time by 40% through performance optimizations

Education:
Bachelor of Science in Computer Science | State University | 2019`,
      originalFileName: null,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const demoJob: JobPost = {
      id: 1,
      userId: 1,
      title: "Senior Full Stack Developer",
      company: "Innovation Labs",
      location: "San Francisco, CA",
      description: "We are seeking a Senior Full Stack Developer with React and Node.js experience.",
      url: null,
      status: "applied",
      dateAdded: new Date(),
      dateModified: new Date(),
      deadline: null,
      notes: "Applied through company website"
    };
    
    localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify([demoResume]));
    localStorage.setItem(STORAGE_KEYS.JOB_POSTS, JSON.stringify([demoJob]));
    updateCounters({ resumeId: 2, jobId: 2, historyId: 1 });
  }
};

// Initialize demo data on load
if (typeof window !== 'undefined') {
  initializeDemoData();
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Handler functions for localStorage operations
function handleResumeOperations(method: string, id?: string, action?: string, data?: any) {
  const resumes: Resume[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESUMES) || '[]')
    .map((r: any) => ({ ...r, createdAt: new Date(r.createdAt), updatedAt: new Date(r.updatedAt) }));
  
  switch (method) {
    case 'GET':
      if (id) {
        const resume = resumes.find(r => r.id === parseInt(id));
        if (!resume) throw new Error('Resume not found');
        return resume;
      }
      return resumes;
      
    case 'POST':
      if (action === 'set-default') {
        const updatedResumes = resumes.map(r => ({ ...r, isDefault: r.id === parseInt(id) }));
        localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(updatedResumes));
        return { success: true };
      }
      
      const counters = getCounters();
      const newResume: Resume = {
        id: counters.resumeId++,
        userId: 1,
        title: data.title,
        content: data.content,
        originalFileName: data.originalFileName || null,
        isDefault: data.isDefault || false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      resumes.push(newResume);
      localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(resumes));
      updateCounters(counters);
      return newResume;
      
    case 'PUT':
    case 'PATCH':
      if (!id) throw new Error('Resume ID required');
      const index = resumes.findIndex(r => r.id === parseInt(id));
      if (index === -1) throw new Error('Resume not found');
      
      resumes[index] = { ...resumes[index], ...data, updatedAt: new Date() };
      localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(resumes));
      return resumes[index];
      
    case 'DELETE':
      if (!id) throw new Error('Resume ID required');
      const filteredResumes = resumes.filter(r => r.id !== parseInt(id));
      localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(filteredResumes));
      return { success: true };
      
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
}

function handleJobOperations(method: string, id?: string, data?: any) {
  const jobs: JobPost[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.JOB_POSTS) || '[]')
    .map((j: any) => ({
      ...j,
      dateAdded: new Date(j.dateAdded),
      dateModified: new Date(j.dateModified),
      deadline: j.deadline ? new Date(j.deadline) : null
    }));
  
  switch (method) {
    case 'GET':
      if (id) {
        const job = jobs.find(j => j.id === parseInt(id));
        if (!job) throw new Error('Job not found');
        return job;
      }
      return jobs;
      
    case 'POST':
      const counters = getCounters();
      const newJob: JobPost = {
        id: counters.jobId++,
        userId: 1,
        title: data.title,
        company: data.company,
        location: data.location || null,
        description: data.description,
        url: data.url || null,
        status: data.status || "saved",
        dateAdded: new Date(),
        dateModified: new Date(),
        deadline: data.deadline ? new Date(data.deadline) : null,
        notes: data.notes || null
      };
      jobs.push(newJob);
      localStorage.setItem(STORAGE_KEYS.JOB_POSTS, JSON.stringify(jobs));
      updateCounters(counters);
      return newJob;
      
    case 'PUT':
    case 'PATCH':
      if (!id) throw new Error('Job ID required');
      const index = jobs.findIndex(j => j.id === parseInt(id));
      if (index === -1) throw new Error('Job not found');
      
      jobs[index] = { ...jobs[index], ...data, dateModified: new Date() };
      localStorage.setItem(STORAGE_KEYS.JOB_POSTS, JSON.stringify(jobs));
      return jobs[index];
      
    case 'DELETE':
      if (!id) throw new Error('Job ID required');
      const filteredJobs = jobs.filter(j => j.id !== parseInt(id));
      localStorage.setItem(STORAGE_KEYS.JOB_POSTS, JSON.stringify(filteredJobs));
      return { success: true };
      
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
}

function handleTailoringHistoryOperations(method: string, data?: any) {
  const history: TailoringHistory[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TAILORING_HISTORY) || '[]')
    .map((h: any) => ({ ...h, createdAt: new Date(h.createdAt) }));
  
  switch (method) {
    case 'GET':
      return history;
      
    case 'POST':
      const counters = getCounters();
      const newHistory: TailoringHistory = {
        id: counters.historyId++,
        userId: 1,
        resumeId: data.resumeId,
        jobPostId: data.jobPostId,
        originalResume: data.originalResume,
        jobDescription: data.jobDescription,
        tailoredResume: data.tailoredResume,
        templateId: data.templateId,
        createdAt: new Date()
      };
      history.unshift(newHistory);
      localStorage.setItem(STORAGE_KEYS.TAILORING_HISTORY, JSON.stringify(history));
      updateCounters(counters);
      return newHistory;
      
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
}

export async function apiRequest(
  url: string,
  method: string = "GET",
  data?: unknown | undefined,
): Promise<any> {
  // Simulate network delay for localStorage operations
  await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
  
  const [, , resource, id, action] = url.split('/');
  
  // Handle localStorage operations for data persistence
  try {
    switch (resource) {
      case 'resumes':
        return handleResumeOperations(method, id, action, data);
      case 'jobs':
        return handleJobOperations(method, id, data);
      case 'job-description':
        if (action === 'save' && method === 'POST') {
          return handleJobOperations('POST', undefined, data);
        }
        break;
      case 'tailoring-history':
        return handleTailoringHistoryOperations(method, data);
      
      // Forward AI-related operations to server
      case 'tailor':
      case 'analyze-gaps':
      case 'improve-section':
      case 'ai-section-suggestions':
      case 'generate-template':
      case 'elite-tailor':
      case 'improve-resume':
      case 'analyze-resume':
      case 'resume-impact-score':
      case 'parse-resume':
        const isFormData = data instanceof FormData;
        const res = await fetch(url, {
          method,
          headers: isFormData ? {} : (data ? { "Content-Type": "application/json" } : {}),
          body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
          credentials: "include",
        });
        await throwIfResNotOk(res);
        return res.json();
      
      default:
        throw new Error(`Unknown endpoint: ${resource}`);
    }
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
