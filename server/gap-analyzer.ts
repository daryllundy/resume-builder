import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface SectionGap {
  section: string;
  status: 'missing' | 'weak' | 'adequate' | 'strong';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  recommendations: string[];
  examples: string[];
  impactScore: number; // 1-10, how much this gap affects overall resume strength
}

export interface ContentGap {
  type: 'keywords' | 'metrics' | 'achievements' | 'skills' | 'formatting';
  section: string;
  description: string;
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface GapAnalysisResult {
  overallScore: number; // 1-100
  completenessScore: number; // 1-100
  sectionGaps: SectionGap[];
  contentGaps: ContentGap[];
  priorityRecommendations: string[];
  industrySpecificTips: string[];
  atsOptimizationGaps: string[];
  strengthAreas: string[];
  estimatedImprovementTime: string;
}

export async function analyzeResumeGaps(
  resumeContent: string,
  targetIndustry?: string,
  experienceLevel?: string,
  jobDescription?: string
): Promise<GapAnalysisResult> {
  
  const analysisPrompt = `Analyze this resume for section gaps and content weaknesses. Provide a comprehensive gap analysis with specific, actionable recommendations.

Resume Content:
${resumeContent}

${targetIndustry ? `Target Industry: ${targetIndustry}` : ''}
${experienceLevel ? `Experience Level: ${experienceLevel}` : ''}
${jobDescription ? `Target Job Description: ${jobDescription.slice(0, 500)}` : ''}

Perform a detailed analysis covering:

1. **Section Completeness Analysis:**
   - Evaluate presence and quality of: Contact Info, Professional Summary, Experience, Education, Skills, Certifications, Projects, Awards, Volunteer Work
   - Rate each section: missing, weak, adequate, strong
   - Assess severity: critical, high, medium, low

2. **Content Quality Analysis:**
   - Missing quantifiable achievements and metrics
   - Lack of industry-specific keywords
   - Weak action verbs and impact statements
   - ATS formatting issues
   - Skills gaps for target role

3. **Industry-Specific Requirements:**
   - Compare against industry standards
   - Identify missing certifications or skills
   - Assess relevance of experience presentation

4. **ATS Optimization Gaps:**
   - Keyword density issues
   - Formatting problems for ATS parsing
   - Missing standard section headers

Provide response in JSON format:
{
  "overallScore": number (1-100),
  "completenessScore": number (1-100),
  "sectionGaps": [
    {
      "section": "string",
      "status": "missing|weak|adequate|strong",
      "severity": "critical|high|medium|low",
      "description": "string",
      "recommendations": ["string"],
      "examples": ["string"],
      "impactScore": number (1-10)
    }
  ],
  "contentGaps": [
    {
      "type": "keywords|metrics|achievements|skills|formatting",
      "section": "string",
      "description": "string",
      "recommendations": ["string"],
      "priority": "high|medium|low"
    }
  ],
  "priorityRecommendations": ["string"],
  "industrySpecificTips": ["string"],
  "atsOptimizationGaps": ["string"],
  "strengthAreas": ["string"],
  "estimatedImprovementTime": "string"
}

Be specific, actionable, and prioritize recommendations by impact. Focus on concrete improvements that will meaningfully strengthen the resume.`;

  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert resume analyst and career strategist with deep knowledge of ATS systems, industry standards, and hiring best practices. Analyze resumes for gaps and provide specific, actionable improvement recommendations. Always respond with valid JSON."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2500,
      temperature: 0.3
    });

    const result = completion.choices[0].message.content;
    
    if (!result) {
      throw new Error("Failed to generate gap analysis");
    }

    const analysisResult: GapAnalysisResult = JSON.parse(result);
    
    // Validate and ensure required fields
    if (!analysisResult.overallScore) analysisResult.overallScore = 50;
    if (!analysisResult.completenessScore) analysisResult.completenessScore = 50;
    if (!analysisResult.sectionGaps) analysisResult.sectionGaps = [];
    if (!analysisResult.contentGaps) analysisResult.contentGaps = [];
    if (!analysisResult.priorityRecommendations) analysisResult.priorityRecommendations = [];
    if (!analysisResult.industrySpecificTips) analysisResult.industrySpecificTips = [];
    if (!analysisResult.atsOptimizationGaps) analysisResult.atsOptimizationGaps = [];
    if (!analysisResult.strengthAreas) analysisResult.strengthAreas = [];
    if (!analysisResult.estimatedImprovementTime) analysisResult.estimatedImprovementTime = "2-4 hours";

    return analysisResult;
    
  } catch (error) {
    console.error("Error analyzing resume gaps:", error);
    throw new Error(`Failed to analyze resume gaps: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateSectionImprovement(
  resumeContent: string,
  sectionName: string,
  currentContent: string,
  recommendations: string[]
): Promise<{
  improvedContent: string;
  explanation: string;
  keyChanges: string[];
}> {
  
  const improvementPrompt = `Improve the following resume section based on the provided recommendations:

Section: ${sectionName}
Current Content: ${currentContent}
Recommendations: ${recommendations.join(', ')}

Full Resume Context:
${resumeContent}

Provide an improved version of this section that:
1. Addresses all the recommendations
2. Uses strong action verbs and quantifiable achievements
3. Incorporates relevant keywords
4. Maintains professional tone and formatting
5. Is ATS-friendly

Respond in JSON format:
{
  "improvedContent": "string",
  "explanation": "string",
  "keyChanges": ["string"]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert resume writer specializing in section optimization. Create improved resume content that addresses specific gaps and recommendations while maintaining professional quality."
        },
        {
          role: "user",
          content: improvementPrompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
      temperature: 0.7
    });

    const result = completion.choices[0].message.content;
    
    if (!result) {
      throw new Error("Failed to generate section improvement");
    }

    return JSON.parse(result);
    
  } catch (error) {
    console.error("Error generating section improvement:", error);
    throw new Error(`Failed to improve section: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}