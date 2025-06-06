import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface EliteTailoringResult {
  jobAnalysis: {
    keywords: string[];
    competencies: string[];
    cultureCues: string[];
  };
  resumeAnalysis: {
    keywordMap: Array<{ keyword: string; status: 'Present' | 'Partial' | 'Missing' }>;
    redFlags: string[];
  };
  tailoredResume: string;
  atsChecklist: Array<{ item: string; status: 'Pass' | 'Fix' }>;
  scores: {
    atsScore: number;
    keywordScore: number;
    recruiterScore: number;
  };
  improvementTips: string[];
}

export async function performEliteTailoring(
  resumeContent: string,
  jobDescription: string
): Promise<EliteTailoringResult> {
  const elitePrompt = `
<prompt_explanation>
You are an elite résumé-optimization consultant. Your mission is to transform the candidate's current résumé so it ranks 90 percent or higher for ATS compatibility, keyword match, and recruiter relevance against the supplied job description.

**Step 1 – Deep analysis**  
• Parse the target job description to extract critical keywords, required skills, preferred skills, core competencies, and cultural cues.  
• Parse the candidate's original résumé. Map every bullet point to concrete accomplishments, skills, and metrics.  
• Identify gaps (missing keywords/skills, outdated phrasing, unclear metrics, vague outcomes).  
• Note any red flags recruiters might spot (employment gaps, redundancy, passive verbs, file-format pitfalls, odd fonts).

**Step 2 – Keyword strategy**  
• Build a prioritized list of keywords and phrases from the job description, grouped by theme (technical, soft-skill, domain, tool, certification).  
• Mark each keyword as **Present**, **Partial**, or **Missing** in the original résumé.

**Step 3 – Rewrite & tailor**  
• Rewrite each résumé section (summary, work experience, education, certs, skills) using crisp bullet points that start with an action verb and quantify results.  
• Integrate all "Missing" keywords naturally—never keyword-stuff.  
• Keep formatting ATS-safe: plain text, no tables, no images, no headers or footers, no fancy characters, no em dashes, use standard section titles.

**Step 4 – ATS & recruiter checklist**  
For each checklist item, mark **Pass** or **Fix**:  
1. File type (.docx or .pdf)  
2. Standard fonts (Arial, Calibri, Times)  
3. Section order (Summary → Skills → Experience → Education → Certifications → Additional)  
4. Consistent dates (MM/YYYY)  
5. No first-person pronouns  
6. Bullet length ≤ 2 lines  
7. All metrics quantified  
8. All acronyms expanded at first use  
9. At least 85 percent keyword overlap  
10. Spelling and grammar clean

**Step 5 – Scoring & advice**  
• Predict ATS score, keyword match score, recruiter match score (0–100).  
• Explain how each score was calculated.  
• List final improvement tips if any score is < 90.

Return everything in structured JSON format with the following structure:
{
  "jobAnalysis": {
    "keywords": ["keyword1", "keyword2", ...],
    "competencies": ["competency1", "competency2", ...],
    "cultureCues": ["cue1", "cue2", ...]
  },
  "resumeAnalysis": {
    "keywordMap": [
      {"keyword": "keyword1", "status": "Present|Partial|Missing"},
      ...
    ],
    "redFlags": ["flag1", "flag2", ...]
  },
  "tailoredResume": "Complete optimized resume content in markdown format",
  "atsChecklist": [
    {"item": "File type (.docx or .pdf)", "status": "Pass|Fix"},
    {"item": "Standard fonts (Arial, Calibri, Times)", "status": "Pass|Fix"},
    ...
  ],
  "scores": {
    "atsScore": 95,
    "keywordScore": 92,
    "recruiterScore": 88
  },
  "improvementTips": ["tip1", "tip2", ...]
}
</prompt_explanation>

Job Description:
${jobDescription}

Current Resume:
${resumeContent}

Perform the elite résumé optimization analysis and return the structured JSON response.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an elite résumé optimization consultant. Analyze and optimize résumés with precision and expertise. Return only valid JSON responses."
        },
        {
          role: "user",
          content: elitePrompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate and structure the response
    return {
      jobAnalysis: {
        keywords: result.jobAnalysis?.keywords || [],
        competencies: result.jobAnalysis?.competencies || [],
        cultureCues: result.jobAnalysis?.cultureCues || []
      },
      resumeAnalysis: {
        keywordMap: result.resumeAnalysis?.keywordMap || [],
        redFlags: result.resumeAnalysis?.redFlags || []
      },
      tailoredResume: result.tailoredResume || "",
      atsChecklist: result.atsChecklist || [],
      scores: {
        atsScore: result.scores?.atsScore || 0,
        keywordScore: result.scores?.keywordScore || 0,
        recruiterScore: result.scores?.recruiterScore || 0
      },
      improvementTips: result.improvementTips || []
    };

  } catch (error) {
    console.error("Elite tailoring failed:", error);
    throw new Error("Failed to perform elite résumé optimization");
  }
}