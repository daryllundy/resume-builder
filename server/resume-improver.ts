import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ResumeImprovementResult {
  improvedResume: string;
  changesExplanation: string;
  implementedRecommendations: string[];
  additionalSuggestions: string[];
}

export async function improveResumeWithRecommendations(
  resumeContent: string,
  recommendations: string[],
  jobDescription?: string
): Promise<ResumeImprovementResult> {
  const improvementPrompt = `
You are an expert resume optimization consultant. Your task is to improve the provided resume by implementing the specific recommendations given, while maintaining the candidate's authentic experience and achievements.

**Instructions:**
1. Implement each recommendation naturally and professionally
2. Enhance the resume's impact and readability
3. Ensure ATS compatibility and keyword optimization
4. Maintain truthfulness - never fabricate experience or achievements
5. Improve formatting, structure, and content flow
6. Use strong action verbs and quantified achievements

**Resume to Improve:**
${resumeContent}

**Specific Recommendations to Implement:**
${recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

${jobDescription ? `\n**Target Job Description:**\n${jobDescription}` : ''}

**Return the response in JSON format with the following structure:**
{
  "improvedResume": "Complete improved resume content with all recommendations implemented",
  "changesExplanation": "Clear explanation of the changes made and how they improve the resume",
  "implementedRecommendations": ["List of recommendations that were successfully implemented"],
  "additionalSuggestions": ["Additional improvement suggestions for future consideration"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert resume optimization consultant. Improve resumes professionally while maintaining authenticity. Return only valid JSON responses."
        },
        {
          role: "user",
          content: improvementPrompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      improvedResume: result.improvedResume || resumeContent,
      changesExplanation: result.changesExplanation || "No improvements could be applied.",
      implementedRecommendations: result.implementedRecommendations || [],
      additionalSuggestions: result.additionalSuggestions || []
    };

  } catch (error) {
    console.error("Resume improvement failed:", error);
    throw new Error("Failed to improve resume with recommendations");
  }
}