import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface TemplateGenerationRequest {
  templateType: string;
  jobDescription?: string;
  experience: string;
  industry: string;
}

export interface GeneratedTemplate {
  content: string;
  templateType: string;
  industry: string;
  experience: string;
}

const templatePrompts = {
  modern: `Create a modern, professional resume template with clean formatting and strong visual hierarchy. Focus on:
- Contemporary section headers and layout
- Strategic use of white space
- Professional typography
- Skills-forward presentation
- Achievement-focused bullet points`,

  executive: `Generate an executive-level resume template emphasizing leadership and strategic impact. Include:
- Executive summary highlighting strategic achievements
- Leadership experience with quantified results
- Board service, speaking engagements, or industry recognition
- Traditional, sophisticated formatting
- Focus on business impact and P&L responsibility`,

  creative: `Design a creative portfolio resume template that showcases innovation and design thinking:
- Dynamic layout with visual elements
- Portfolio/project highlights section
- Creative skills and software proficiency
- Awards and recognition section
- Brand/personal statement area`,

  technical: `Build a technical specialist resume template optimized for engineering roles:
- Technical skills matrix organized by category
- Project portfolios with technologies used
- Certifications and continuous learning
- Open source contributions or publications
- Problem-solving achievements with technical metrics`,

  'entry-level': `Create an entry-level resume template highlighting potential and education:
- Strong education section with relevant coursework
- Internships, projects, and volunteer experience
- Transferable skills from academic and extracurricular activities
- Leadership roles in student organizations
- Technical projects and certifications`,

  'career-change': `Develop a career transition resume template emphasizing transferable skills:
- Skills-based format highlighting transferable competencies
- Bridge experiences that connect previous and target roles
- Professional development and reskilling efforts
- Volunteer work or side projects in target field
- Personal brand statement explaining career pivot`
};

export async function generateProfessionalTemplate(request: TemplateGenerationRequest): Promise<GeneratedTemplate> {
  const { templateType, jobDescription, experience, industry } = request;
  
  const basePrompt = templatePrompts[templateType as keyof typeof templatePrompts] || templatePrompts.modern;
  
  const prompt = `You are an elite resume strategist creating a professional resume template.

Template Type: ${templateType}
Industry: ${industry}
Experience Level: ${experience}
${jobDescription ? `Target Job: ${jobDescription.slice(0, 500)}` : ''}

${basePrompt}

Generate a complete resume template with realistic, professional content that someone in ${industry} with ${experience} experience would have. Include:

1. Professional Header (Name, Contact Info, LinkedIn, Portfolio if relevant)
2. Professional Summary (3-4 lines highlighting key value proposition)
3. Core Skills/Competencies (relevant to ${industry})
4. Professional Experience (2-4 relevant positions with 3-4 achievement-focused bullets each)
5. Education (relevant degree and certifications)
6. Additional sections as appropriate (Projects, Certifications, Awards, etc.)

Format as clean, ATS-friendly text with clear section headers. Use professional language and industry-specific terminology for ${industry}. Focus on quantifiable achievements and impact.

IMPORTANT: Create realistic, professional content - not placeholder text. Make it industry-specific and compelling.`;

  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert resume writer and career strategist. Create professional, industry-specific resume templates with realistic content that showcases best practices for the given field and experience level."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const content = completion.choices[0].message.content;
    
    if (!content) {
      throw new Error("Failed to generate template content");
    }

    return {
      content,
      templateType,
      industry,
      experience
    };
  } catch (error) {
    console.error("Error generating template:", error);
    throw new Error(`Failed to generate template: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateAISectionSuggestions(
  sectionType: string,
  currentContent: string,
  jobDescription?: string
): Promise<{
  suggestions: Array<{
    type: string;
    title: string;
    content: string;
    bullets?: string[];
    rationale: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  personalizedTips: string[];
  industryInsights: string[];
}> {
  const prompt = `You are an expert resume optimization consultant analyzing a ${sectionType} section.

Current Content: ${currentContent || 'Empty section'}
${jobDescription ? `Target Job Description: ${jobDescription.slice(0, 800)}` : ''}

Analyze the current content and provide specific, actionable suggestions to improve this ${sectionType} section. Generate:

1. 3-5 specific content suggestions with:
   - Descriptive title
   - Complete improved content (not just suggestions)
   - Rationale for why this improves the section
   - Impact level (high/medium/low)

2. 2-3 personalized tips for optimizing this section type

3. 2-3 industry insights relevant to this role/field

Focus on:
- ATS optimization and keyword inclusion
- Quantifiable achievements and impact
- Industry-specific language and expectations
- Competitive differentiation
- Professional storytelling

Respond in JSON format:
{
  "suggestions": [
    {
      "type": "content_improvement",
      "title": "descriptive title",
      "content": "complete improved content",
      "bullets": ["bullet 1", "bullet 2"] (if applicable),
      "rationale": "why this works",
      "impact": "high|medium|low"
    }
  ],
  "personalizedTips": ["tip 1", "tip 2"],
  "industryInsights": ["insight 1", "insight 2"]
}`;

  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert resume optimization consultant. Provide specific, actionable suggestions to improve resume sections. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.6,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    
    if (!content) {
      throw new Error("Failed to generate suggestions");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    throw new Error(`Failed to generate suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateQuickSuggestions(
  sectionType: string,
  currentContent: string,
  jobDescription?: string
): Promise<{ suggestions: string[] }> {
  const prompt = `Generate 3-4 quick, actionable suggestions to improve this ${sectionType} section:

Current: ${currentContent.slice(0, 200)}
${jobDescription ? `Target Role: ${jobDescription.slice(0, 300)}` : ''}

Provide brief, specific suggestions (1-2 sentences each) focusing on immediate improvements like:
- Adding quantifiable metrics
- Including relevant keywords
- Improving action verbs
- Highlighting specific achievements

Respond in JSON format: {"suggestions": ["suggestion 1", "suggestion 2", ...]}`;

  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a resume optimization expert. Provide brief, actionable suggestions in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.6,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    
    if (!content) {
      throw new Error("Failed to generate quick suggestions");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating quick suggestions:", error);
    throw new Error(`Failed to generate quick suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}