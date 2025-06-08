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
- Skills-forward presentation with 15+ relevant keywords
- Achievement-focused bullet points with technical terminology
- Modern industry buzzwords and trending technologies`,

  executive: `Generate an executive-level resume template emphasizing leadership and strategic impact. Include:
- Executive summary highlighting strategic achievements with C-suite keywords
- Leadership experience with quantified results and business terminology
- Board service, speaking engagements, or industry recognition
- Traditional, sophisticated formatting
- Focus on business impact and P&L responsibility
- Strategic keywords: transformation, revenue growth, stakeholder management, strategic planning`,

  creative: `Design a creative portfolio resume template that showcases innovation and design thinking:
- Dynamic layout with visual elements
- Portfolio/project highlights section
- Creative skills and software proficiency (Adobe Creative Suite, Figma, Sketch, etc.)
- Awards and recognition section
- Brand/personal statement area
- Creative industry keywords: user experience, visual design, brand identity, digital marketing`,

  technical: `Build a technical specialist resume template optimized for engineering roles:
- Technical skills matrix organized by category (Programming Languages, Frameworks, Databases, Cloud Platforms)
- Project portfolios with technologies used and specific tech stacks
- Certifications and continuous learning (AWS, Azure, Google Cloud, Kubernetes, etc.)
- Open source contributions or publications
- Problem-solving achievements with technical metrics
- High-demand technical keywords: microservices, DevOps, CI/CD, containerization, machine learning, cybersecurity`,

  'entry-level': `Create an entry-level resume template highlighting potential and education:
- Strong education section with relevant coursework and GPA (if 3.5+)
- Internships, projects, and volunteer experience with measurable outcomes
- Transferable skills from academic and extracurricular activities
- Leadership roles in student organizations
- Technical projects and certifications (entry-level keywords: teamwork, problem-solving, communication, adaptability, time management)`,

  'career-change': `Develop a career transition resume template emphasizing transferable skills:
- Skills-based format highlighting transferable competencies with cross-industry keywords
- Bridge experiences that connect previous and target roles
- Professional development and reskilling efforts (certifications, bootcamps, courses)
- Volunteer work or side projects in target field
- Personal brand statement explaining career pivot
- Strategic keywords: adaptability, cross-functional experience, continuous learning, strategic thinking`
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
2. Professional Summary (3-4 lines highlighting key value proposition with relevant keywords)
3. Core Skills/Competencies (CRITICAL: Include 12-15 highly relevant technical and soft skills using exact terminology from job descriptions and industry standards)
4. Professional Experience (2-4 relevant positions with 3-4 achievement-focused bullets each)
5. Education (relevant degree and certifications)
6. Additional sections as appropriate (Projects, Certifications, Awards, etc.)

**KEYWORD OPTIMIZATION REQUIREMENTS:**
- Extract and integrate high-value keywords from the job description (if provided)
- Include industry-standard technical skills, software, methodologies, and certifications
- Use exact terminology that ATS systems scan for (e.g., "JavaScript" not "JS", "Search Engine Optimization" not "SEO")
- Incorporate keywords naturally throughout all sections, especially in:
  * Professional Summary (3-5 strategic keywords)
  * Core Skills section (comprehensive keyword list)
  * Experience bullets (action verbs + technical terms)
  * Education/Certifications (relevant credential keywords)

**ATS OPTIMIZATION:**
- Use standard section headers (Professional Experience, Education, Skills)
- Include both abbreviated and full forms of technical terms
- Add relevant industry buzzwords and trending technologies
- Ensure 8-12% keyword density throughout the document

Format as clean, ATS-friendly text with clear section headers. Use professional language and industry-specific terminology for ${industry}. Focus on quantifiable achievements and impact.

IMPORTANT: Create realistic, professional content - not placeholder text. Make it industry-specific, keyword-rich, and compelling for both ATS systems and human recruiters.`;

  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert resume writer, ATS optimization specialist, and career strategist. Your expertise includes: 1) Identifying high-value keywords from job descriptions, 2) Creating ATS-compliant formatting, 3) Strategic keyword placement for maximum scoring, 4) Industry-specific terminology and trending skills, 5) Balancing keyword density with natural readability. Create professional, keyword-rich resume templates that score 85%+ on ATS systems while remaining compelling to human recruiters."
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