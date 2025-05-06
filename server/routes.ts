import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function registerRoutes(app: Express): Promise<Server> {
  // Endpoint to tailor a resume based on the job description
  app.post("/api/tailor", async (req, res) => {
    try {
      const { resume, jobDescription } = req.body;

      if (!resume || !jobDescription) {
        return res.status(400).json({ 
          message: "Both resume and job description are required" 
        });
      }

      // Store the tailoring request in history if user is logged in
      const userId = req.session?.userId;
      if (userId) {
        await storage.createTailoringHistory({
          userId,
          requestDate: new Date(),
          resumeText: resume,
          jobDescription,
        });
      }

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
      res.send(tailoredResume);
    } catch (error) {
      console.error("Error tailoring resume:", error);
      res.status(500).json({ 
        message: "Failed to tailor resume",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
