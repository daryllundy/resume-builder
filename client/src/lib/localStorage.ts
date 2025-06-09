import type { Resume, JobPost, TailoringHistory, User } from "@shared/schema";

// Storage keys
const STORAGE_KEYS = {
  RESUMES: 'resume_tailor_resumes',
  JOB_POSTS: 'resume_tailor_jobs',
  TAILORING_HISTORY: 'resume_tailor_history',
  USER: 'resume_tailor_user',
  COUNTERS: 'resume_tailor_counters'
} as const;

// Counter management for ID generation
interface Counters {
  resumeId: number;
  jobId: number;
  historyId: number;
}

const getCounters = (): Counters => {
  const stored = localStorage.getItem(STORAGE_KEYS.COUNTERS);
  return stored ? JSON.parse(stored) : { resumeId: 1, jobId: 1, historyId: 1 };
};

const updateCounters = (counters: Counters) => {
  localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(counters));
};

// Generic storage functions
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage key ${key}:`, error);
  }
};

// User management
export const getCurrentUser = (): User => {
  return getFromStorage(STORAGE_KEYS.USER, {
    id: 1,
    username: "demo_user",
    password: "demo_password",
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

export const setCurrentUser = (user: User): void => {
  saveToStorage(STORAGE_KEYS.USER, user);
};

// Resume management
export const getResumes = (): Resume[] => {
  const resumes = getFromStorage<Resume[]>(STORAGE_KEYS.RESUMES, []);
  // Convert date strings back to Date objects
  return resumes.map(resume => ({
    ...resume,
    createdAt: new Date(resume.createdAt),
    updatedAt: new Date(resume.updatedAt)
  }));
};

export const saveResume = (resume: Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>): Resume => {
  const resumes = getResumes();
  const counters = getCounters();
  
  const newResume: Resume = {
    ...resume,
    id: counters.resumeId++,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  resumes.push(newResume);
  saveToStorage(STORAGE_KEYS.RESUMES, resumes);
  updateCounters(counters);
  
  return newResume;
};

export const updateResume = (id: number, updates: Partial<Resume>): Resume | null => {
  const resumes = getResumes();
  const index = resumes.findIndex(r => r.id === id);
  
  if (index === -1) return null;
  
  const updatedResume = {
    ...resumes[index],
    ...updates,
    updatedAt: new Date()
  };
  
  resumes[index] = updatedResume;
  saveToStorage(STORAGE_KEYS.RESUMES, resumes);
  
  return updatedResume;
};

export const deleteResume = (id: number): boolean => {
  const resumes = getResumes();
  const filteredResumes = resumes.filter(r => r.id !== id);
  
  if (filteredResumes.length === resumes.length) return false;
  
  saveToStorage(STORAGE_KEYS.RESUMES, filteredResumes);
  return true;
};

export const getResumeById = (id: number): Resume | null => {
  const resumes = getResumes();
  return resumes.find(r => r.id === id) || null;
};

// Job Posts management
export const getJobPosts = (): JobPost[] => {
  const jobs = getFromStorage<JobPost[]>(STORAGE_KEYS.JOB_POSTS, []);
  // Convert date strings back to Date objects
  return jobs.map(job => ({
    ...job,
    dateAdded: new Date(job.dateAdded),
    dateModified: new Date(job.dateModified),
    deadline: job.deadline ? new Date(job.deadline) : null
  }));
};

export const saveJobPost = (job: Omit<JobPost, 'id' | 'dateAdded' | 'dateModified'>): JobPost => {
  const jobs = getJobPosts();
  const counters = getCounters();
  
  const newJob: JobPost = {
    ...job,
    id: counters.jobId++,
    dateAdded: new Date(),
    dateModified: new Date()
  };
  
  jobs.push(newJob);
  saveToStorage(STORAGE_KEYS.JOB_POSTS, jobs);
  updateCounters(counters);
  
  return newJob;
};

export const updateJobPost = (id: number, updates: Partial<JobPost>): JobPost | null => {
  const jobs = getJobPosts();
  const index = jobs.findIndex(j => j.id === id);
  
  if (index === -1) return null;
  
  const updatedJob = {
    ...jobs[index],
    ...updates,
    dateModified: new Date()
  };
  
  jobs[index] = updatedJob;
  saveToStorage(STORAGE_KEYS.JOB_POSTS, jobs);
  
  return updatedJob;
};

export const deleteJobPost = (id: number): boolean => {
  const jobs = getJobPosts();
  const filteredJobs = jobs.filter(j => j.id !== id);
  
  if (filteredJobs.length === jobs.length) return false;
  
  saveToStorage(STORAGE_KEYS.JOB_POSTS, filteredJobs);
  return true;
};

export const getJobPostById = (id: number): JobPost | null => {
  const jobs = getJobPosts();
  return jobs.find(j => j.id === id) || null;
};

// Tailoring History management
export const getTailoringHistory = (): TailoringHistory[] => {
  const history = getFromStorage<TailoringHistory[]>(STORAGE_KEYS.TAILORING_HISTORY, []);
  // Convert date strings back to Date objects
  return history.map(item => ({
    ...item,
    createdAt: new Date(item.createdAt)
  }));
};

export const saveTailoringHistory = (history: Omit<TailoringHistory, 'id' | 'createdAt'>): TailoringHistory => {
  const historyItems = getTailoringHistory();
  const counters = getCounters();
  
  const newHistoryItem: TailoringHistory = {
    ...history,
    id: counters.historyId++,
    createdAt: new Date()
  };
  
  historyItems.unshift(newHistoryItem); // Add to beginning for chronological order
  saveToStorage(STORAGE_KEYS.TAILORING_HISTORY, historyItems);
  updateCounters(counters);
  
  return newHistoryItem;
};

export const getTailoringHistoryByJobId = (jobId: number): TailoringHistory[] => {
  const history = getTailoringHistory();
  return history.filter(item => item.jobPostId === jobId);
};

export const getTailoringHistoryByUserId = (userId: number): TailoringHistory[] => {
  const history = getTailoringHistory();
  return history.filter(item => item.userId === userId);
};

// Utility functions
export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

export const exportData = () => {
  const data = {
    resumes: getResumes(),
    jobPosts: getJobPosts(),
    tailoringHistory: getTailoringHistory(),
    user: getCurrentUser(),
    exportDate: new Date().toISOString()
  };
  
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.resumes) saveToStorage(STORAGE_KEYS.RESUMES, data.resumes);
    if (data.jobPosts) saveToStorage(STORAGE_KEYS.JOB_POSTS, data.jobPosts);
    if (data.tailoringHistory) saveToStorage(STORAGE_KEYS.TAILORING_HISTORY, data.tailoringHistory);
    if (data.user) saveToStorage(STORAGE_KEYS.USER, data.user);
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Initialize with demo data if storage is empty
export const initializeWithDemoData = (): void => {
  const resumes = getResumes();
  const jobs = getJobPosts();
  
  // Only initialize if storage is completely empty
  if (resumes.length === 0 && jobs.length === 0) {
    // Create a demo user
    setCurrentUser({
      id: 1,
      username: "demo_user",
      password: "demo_password",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Create a demo resume
    saveResume({
      userId: 1,
      title: "Software Engineer Resume",
      originalFileName: null,
      content: `John Doe
Software Engineer

Contact Information:
Email: john.doe@email.com
Phone: (555) 123-4567
LinkedIn: linkedin.com/in/johndoe

Professional Summary:
Experienced software engineer with 5+ years developing scalable web applications using modern technologies. Proven track record of delivering high-quality solutions and leading cross-functional teams.

Technical Skills:
• Programming Languages: JavaScript, TypeScript, Python, Java
• Frontend: React, Vue.js, HTML5, CSS3, Tailwind CSS
• Backend: Node.js, Express, Django, Spring Boot
• Databases: PostgreSQL, MongoDB, Redis
• Cloud: AWS, Docker, Kubernetes
• Tools: Git, Jenkins, Jest, Webpack

Professional Experience:

Senior Software Engineer | TechCorp Inc. | 2021 - Present
• Led development of microservices architecture serving 100K+ daily users
• Reduced application load time by 40% through performance optimizations
• Mentored 3 junior developers and established code review best practices
• Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes

Software Engineer | StartupXYZ | 2019 - 2021
• Built responsive web applications using React and Node.js
• Collaborated with design team to implement pixel-perfect UI components
• Integrated third-party APIs and payment processing systems
• Participated in agile development with 2-week sprint cycles

Education:
Bachelor of Science in Computer Science | State University | 2019
GPA: 3.7/4.0

Certifications:
• AWS Certified Developer Associate
• Google Cloud Platform Professional`,
      isDefault: true
    });
    
    // Create a demo job posting
    saveJobPost({
      userId: 1,
      title: "Senior Full Stack Developer",
      company: "Innovation Labs",
      location: "San Francisco, CA",
      description: `We are seeking a Senior Full Stack Developer to join our growing team. The ideal candidate will have strong experience with React, Node.js, and cloud technologies.

Requirements:
• 5+ years of full stack development experience
• Strong proficiency in JavaScript/TypeScript
• Experience with React, Node.js, and modern web frameworks
• Knowledge of cloud platforms (AWS, GCP, or Azure)
• Experience with database design and optimization
• Strong problem-solving and communication skills

Responsibilities:
• Design and develop scalable web applications
• Collaborate with cross-functional teams
• Mentor junior developers
• Participate in code reviews and technical discussions
• Contribute to architectural decisions`,
      url: "https://example.com/jobs/senior-fullstack",
      status: "applied",
      deadline: null,
      notes: "Applied through company website"
    });
  }
};