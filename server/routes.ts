import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { insertJobPostSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { parseResume } from "./pdf-parser";
import { log } from "./vite";

// Extend the Express Request type to include session
declare module 'express-serve-static-core' {
  interface Request {
    session?: {
      userId?: number;
      [key: string]: any;
    };
  }
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up multer for file uploads
  const memoryStorage = multer.memoryStorage();
  const upload = multer({
    storage: memoryStorage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
  });
  
  // Parse resume file (PDF, Word, etc.)
  app.post("/api/parse-resume", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          message: "No file uploaded" 
        });
      }

      log(`Processing uploaded file: ${req.file.originalname}`, "resume-parser");
      
      // Parse the resume using our Python script
      const text = await parseResume(req.file.buffer, req.file.originalname);
      
      return res.json({ 
        success: true, 
        text 
      });
    } catch (error) {
      log(`Error parsing resume: ${error}`, "resume-parser");
      return res.status(500).json({ 
        message: "Failed to parse resume", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  // Endpoint to tailor a resume based on the job description
  app.post("/api/tailor", async (req, res) => {
    try {
      const { resume, jobDescription, jobId } = req.body;

      if (!resume || !jobDescription) {
        return res.status(400).json({ 
          message: "Both resume and job description are required" 
        });
      }

      // Default to user ID 1 if not logged in for demo
      const userId = req.session?.userId || 1;
      
      // Call OpenAI to tailor the resume
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: 
              "You are an expert resume consultant that helps job seekers tailor their resume to specific job descriptions. Your task is to analyze a resume and job description, then rewrite the resume to highlight the most relevant skills and experiences. Keep the resume professional and maintain a similar formatting structure. Return the result in clean HTML format."
          },
          {
            role: "user",
            content: 
              `Job Description:\n${jobDescription}\n\nResume:\n${resume}\n\nPlease tailor this resume to highlight the most relevant skills and experiences for this job. Maintain the professional tone and overall structure, but reorganize and reword content to match the job requirements. Format the result as clean HTML with appropriate headings, paragraphs, and bullet points.`
          }
        ]
      });

      const tailoredResume = completion.choices[0].message.content;
      
      // Store the tailoring request in history
      await storage.createTailoringHistory({
        userId,
        jobId: jobId ? parseInt(jobId) : undefined,
        requestDate: new Date(),
        resumeText: resume,
        jobDescription,
        tailoredResume,
      });

      res.send(tailoredResume);
    } catch (error) {
      console.error("Error tailoring resume:", error);
      res.status(500).json({ 
        message: "Failed to tailor resume",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Save job post directly from job description form
  app.post("/api/job-description/save", async (req, res) => {
    try {
      const { title, company, location, description, url, notes } = req.body;
      
      if (!title || !company || !description) {
        return res.status(400).json({
          message: "Job title, company, and description are required"
        });
      }

      // Default to user ID 1 if not logged in for demo
      const userId = req.session?.userId || 1;
      
      const jobPost = await storage.createJobPost({
        userId,
        title,
        company,
        location: location || "",
        description,
        url: url || "",
        notes: notes || "",
        status: "saved"
      });
      
      res.status(201).json(jobPost);
    } catch (error) {
      console.error("Error saving job post:", error);
      res.status(500).json({
        message: "Failed to save job post",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Job board endpoints
  app.get("/api/jobs", async (req, res) => {
    try {
      // Default to user ID 1 if not logged in for demo
      const userId = req.session?.userId || 1;
      const jobs = await storage.getJobPostsByUserId(userId);
      res.status(200).json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({
        message: "Failed to fetch jobs",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      const job = await storage.getJobPostById(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.status(200).json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({
        message: "Failed to fetch job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const validationResult = insertJobPostSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid job post data",
          errors: validationResult.error.format()
        });
      }
      
      // Default to user ID 1 if not logged in for demo
      const userId = req.session?.userId || 1;
      const jobPost = await storage.createJobPost({
        ...validationResult.data,
        userId,
        status: "saved" // Set default status to "saved"
      });
      
      res.status(201).json(jobPost);
    } catch (error) {
      console.error("Error creating job post:", error);
      res.status(500).json({
        message: "Failed to create job post",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.patch("/api/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      const job = await storage.getJobPostById(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      const updatedJob = await storage.updateJobPost(id, req.body);
      res.status(200).json(updatedJob);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({
        message: "Failed to update job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.patch("/api/jobs/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      const job = await storage.getJobPostById(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      const { status } = req.body;
      
      // Validate status
      const statusValidator = z.enum([
        "saved", "applied", "hr_screen", "interview", "offer", "accepted", "rejected"
      ]);
      
      const validationResult = statusValidator.safeParse(status);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const updatedJob = await storage.updateJobPostStatus(id, status);
      res.status(200).json(updatedJob);
    } catch (error) {
      console.error("Error updating job status:", error);
      res.status(500).json({
        message: "Failed to update job status",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      const job = await storage.getJobPostById(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      await storage.deleteJobPost(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({
        message: "Failed to delete job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Get tailoring history for a user or job
  app.get("/api/tailoring-history", async (req, res) => {
    try {
      // Default to user ID 1 if not logged in for demo
      const userId = req.session?.userId || 1;
      
      const jobId = req.query.jobId ? parseInt(req.query.jobId as string) : undefined;
      
      // Get all tailoring history for the user
      const history = await storage.getTailoringHistoryByUserId(userId);
      
      // Filter by jobId if provided
      const filteredHistory = jobId 
        ? history.filter(item => item.jobId === jobId)
        : history;
      
      // Sort by date, newest first
      const sortedHistory = filteredHistory.sort((a, b) => {
        const dateA = a.createdAt || a.requestDate;
        const dateB = b.createdAt || b.requestDate;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      
      res.json(sortedHistory);
    } catch (error) {
      console.error("Error fetching tailoring history:", error);
      res.status(500).json({ 
        message: "Failed to fetch tailoring history", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
