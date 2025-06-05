import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ResumeScores {
  impactScore: number;
  atsScore: number;
  jobMatchScore: number;
  impactFeedback: string;
  atsFeedback: string;
  jobMatchFeedback: string;
  overallFeedback: string;
  improvements: string[];
}

export async function analyzeResumeScores(
  resumeContent: string,
  jobDescription: string
): Promise<ResumeScores> {
  try {
    const prompt = `
Analyze this resume against the job description and provide comprehensive scoring and feedback.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeContent}

Please analyze and score the resume on these three dimensions:

1. IMPACT SCORE (0-100): How well does the resume demonstrate quantifiable achievements, leadership, and measurable results?
2. ATS SCORE (0-100): How well will this resume perform in Applicant Tracking Systems? Consider keyword usage, formatting, standard sections, and readability.
3. JOB MATCH SCORE (0-100): How well does the resume align with the specific job requirements, skills, and qualifications?

Provide your response in JSON format with the following structure:
{
  "impactScore": number,
  "atsScore": number,
  "jobMatchScore": number,
  "impactFeedback": "Detailed feedback on impact and achievements",
  "atsFeedback": "Detailed feedback on ATS optimization",
  "jobMatchFeedback": "Detailed feedback on job alignment",
  "overallFeedback": "Summary of strengths and areas for improvement",
  "improvements": ["Specific actionable improvement suggestion 1", "Specific actionable improvement suggestion 2", "Specific actionable improvement suggestion 3"]
}

Be specific, constructive, and actionable in your feedback.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert resume analyst and career coach with deep knowledge of ATS systems, hiring practices, and resume optimization. Provide precise, actionable feedback."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate and ensure all scores are within 0-100 range
    return {
      impactScore: Math.max(0, Math.min(100, result.impactScore || 0)),
      atsScore: Math.max(0, Math.min(100, result.atsScore || 0)),
      jobMatchScore: Math.max(0, Math.min(100, result.jobMatchScore || 0)),
      impactFeedback: result.impactFeedback || "No feedback available",
      atsFeedback: result.atsFeedback || "No feedback available",
      jobMatchFeedback: result.jobMatchFeedback || "No feedback available",
      overallFeedback: result.overallFeedback || "No feedback available",
      improvements: Array.isArray(result.improvements) ? result.improvements : []
    };
  } catch (error) {
    console.error("Error analyzing resume scores:", error);
    throw new Error("Failed to analyze resume scores");
  }
}

export async function getResumeImpactScore(resumeContent: string): Promise<{
  score: number;
  feedback: string;
  improvements: string[];
}> {
  try {
    const prompt = `
Analyze this resume and provide an impact score based on how well it demonstrates quantifiable achievements, leadership, and measurable results.

RESUME:
${resumeContent}

Focus on:
- Quantified achievements (numbers, percentages, metrics)
- Action verbs and strong language
- Leadership and initiative examples
- Business impact and results
- Career progression and growth

Provide your response in JSON format:
{
  "score": number (0-100),
  "feedback": "Detailed feedback on impact and achievements",
  "improvements": ["Specific suggestion 1", "Specific suggestion 2", "Specific suggestion 3"]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert resume analyst focused on impact assessment and achievement quantification."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      score: Math.max(0, Math.min(100, result.score || 0)),
      feedback: result.feedback || "No feedback available",
      improvements: Array.isArray(result.improvements) ? result.improvements : []
    };
  } catch (error) {
    console.error("Error analyzing resume impact:", error);
    throw new Error("Failed to analyze resume impact");
  }
}