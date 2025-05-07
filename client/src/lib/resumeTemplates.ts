// Define types for resume templates
export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  // This is a function that will format the resume content according to the template
  format: (content: string) => string;
}

// Helper function to format a resume in chronological style
function formatChronological(content: string): string {
  // Simple pass-through - maintains the original content structure
  return content;
}

// Helper function to format a resume in functional style
function formatFunctional(content: string): string {
  // For functional style, we try to reorganize content to emphasize skills first
  let sections = content.split(/\n{2,}/);
  
  // Find sections (simplistic approach - real implementation would be more robust)
  const skillsIndex = sections.findIndex(s => s.toLowerCase().includes("skills") || s.toLowerCase().includes("expertise"));
  const experienceIndex = sections.findIndex(s => s.toLowerCase().includes("experience") || s.toLowerCase().includes("employment"));
  
  // If we can identify skills and experience sections, reorder them
  if (skillsIndex !== -1 && experienceIndex !== -1 && skillsIndex > experienceIndex) {
    // Move skills before experience
    const skillsSection = sections[skillsIndex];
    sections.splice(skillsIndex, 1);
    sections.splice(experienceIndex, 0, skillsSection);
  }
  
  return sections.join("\n\n");
}

// Helper function to format a resume in combination style
function formatCombination(content: string): string {
  // For combination style, we highlight skills and qualifications up front
  // but still maintain chronological work history
  
  // Extract contact/header info (first few lines)
  const lines = content.split("\n");
  let headerEndIndex = 3; // Default assumption
  
  // Find the first blank line after the header
  for (let i = 0; i < 10 && i < lines.length; i++) {
    if (lines[i].trim() === "") {
      headerEndIndex = i;
      break;
    }
  }
  
  const header = lines.slice(0, headerEndIndex).join("\n");
  const body = lines.slice(headerEndIndex).join("\n");
  
  // Split into sections
  const sections = body.split(/\n{2,}/);
  
  // Try to find summary/objective section
  const summaryIndex = sections.findIndex(s => 
    s.toLowerCase().includes("summary") || 
    s.toLowerCase().includes("objective") || 
    s.toLowerCase().includes("profile")
  );
  
  // Try to find skills section
  const skillsIndex = sections.findIndex(s => 
    s.toLowerCase().includes("skills") || 
    s.toLowerCase().includes("expertise") || 
    s.toLowerCase().includes("qualifications")
  );
  
  // Reorganize sections for combination format
  // Here we want summary, then skills, then everything else
  let newSections = [...sections];
  
  // Process only if we found relevant sections
  if (summaryIndex !== -1 || skillsIndex !== -1) {
    // Remove sections we'll reposition
    const summary = summaryIndex !== -1 ? sections[summaryIndex] : "";
    const skills = skillsIndex !== -1 ? sections[skillsIndex] : "";
    
    if (summaryIndex !== -1) newSections.splice(summaryIndex, 1);
    // Need to adjust index if skills come after summary and we've removed summary
    const adjustedSkillsIndex = skillsIndex > summaryIndex && summaryIndex !== -1 
      ? skillsIndex - 1 
      : skillsIndex;
    
    if (skillsIndex !== -1) newSections.splice(adjustedSkillsIndex, 1);
    
    // Add summary and skills to the beginning
    const sectionsToAdd = [];
    if (summary) sectionsToAdd.push(summary);
    if (skills) sectionsToAdd.push(skills);
    
    newSections = [...sectionsToAdd, ...newSections];
  }
  
  return header + "\n\n" + newSections.join("\n\n");
}

// Define available resume templates
export const resumeTemplates: ResumeTemplate[] = [
  {
    id: "chronological",
    name: "Chronological",
    description: "Traditional format focusing on work history in reverse chronological order",
    format: formatChronological
  },
  {
    id: "functional",
    name: "Functional",
    description: "Emphasizes skills and qualifications rather than job history",
    format: formatFunctional
  },
  {
    id: "combination",
    name: "Combination",
    description: "Hybrid approach highlighting both skills and work experience",
    format: formatCombination
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean, concise format with minimal formatting and essential information only",
    format: (content: string) => {
      // Simplify the resume by removing extra whitespace and condensing sections
      return content
        .replace(/\n{3,}/g, "\n\n") // Remove excessive blank lines
        .replace(/- /g, "• "); // Replace dashes with bullets for a cleaner look
    }
  },
  {
    id: "executive",
    name: "Executive",
    description: "Professional format for senior positions emphasizing leadership and achievements",
    format: (content: string) => {
      // For executive style, emphasize achievements and leadership experience
      // Add "PROFESSIONAL SUMMARY" if no summary exists
      if (!content.toLowerCase().includes("summary") && 
          !content.toLowerCase().includes("profile") && 
          !content.toLowerCase().includes("objective")) {
        
        // Find first major section break to insert summary
        const lines = content.split("\n");
        let insertIndex = 0;
        
        // Skip contact info at top (roughly first 5 lines)
        for (let i = 5; i < Math.min(15, lines.length); i++) {
          if (lines[i].trim() === "" && lines[i+1] && lines[i+1].toUpperCase() === lines[i+1]) {
            insertIndex = i;
            break;
          }
        }
        
        if (insertIndex > 0) {
          lines.splice(insertIndex, 0, "", "PROFESSIONAL SUMMARY", "Experienced professional with a proven track record of success and leadership.");
          return lines.join("\n");
        }
      }
      
      return content;
    }
  }
];

// Get template by ID
export function getTemplateById(id: string): ResumeTemplate {
  return resumeTemplates.find(template => template.id === id) || resumeTemplates[0];
}