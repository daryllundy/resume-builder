import { useMemo } from "react";
import { motion } from "framer-motion";

interface KeywordHighlighterProps {
  text: string;
  keywords: string[];
  className?: string;
}

interface HighlightedMatch {
  text: string;
  isHighlighted: boolean;
  keyword?: string;
}

export default function KeywordHighlighter({ text, keywords, className = "" }: KeywordHighlighterProps) {
  const highlightedText = useMemo(() => {
    if (!keywords.length || !text) return [{ text, isHighlighted: false }];

    // Create a regex pattern for all keywords (case-insensitive)
    const keywordPattern = keywords
      .filter(keyword => keyword.trim().length > 2) // Only highlight meaningful keywords
      .map(keyword => keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special regex chars
      .join('|');

    if (!keywordPattern) return [{ text, isHighlighted: false }];

    const regex = new RegExp(`(${keywordPattern})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => ({
      text: part,
      isHighlighted: regex.test(part),
      keyword: regex.test(part) ? part.toLowerCase() : undefined
    }));
  }, [text, keywords]);

  const matchCount = highlightedText.filter(part => part.isHighlighted).length;

  return (
    <div className={className}>
      {matchCount > 0 && (
        <motion.div 
          className="text-xs text-green-600 mb-2 font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {matchCount} keyword match{matchCount !== 1 ? 'es' : ''} found
        </motion.div>
      )}
      <div className="leading-relaxed">
        {highlightedText.map((part, index) => (
          part.isHighlighted ? (
            <motion.mark
              key={index}
              className="bg-yellow-200 text-yellow-900 px-1 rounded font-medium"
              initial={{ backgroundColor: '#fef3c7' }}
              animate={{ backgroundColor: '#fde68a' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {part.text}
            </motion.mark>
          ) : (
            <span key={index}>{part.text}</span>
          )
        ))}
      </div>
    </div>
  );
}

// Utility function to extract keywords from job description
export function extractKeywords(jobDescription: string): string[] {
  if (!jobDescription) return [];

  // Common technical keywords, skills, and important terms
  const commonKeywords = [
    // Technical skills
    'react', 'javascript', 'typescript', 'node.js', 'python', 'java', 'sql', 'html', 'css',
    'aws', 'docker', 'kubernetes', 'git', 'agile', 'scrum', 'rest', 'api', 'database',
    'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
    
    // Soft skills and roles
    'leadership', 'communication', 'teamwork', 'problem solving', 'analytical', 'creative',
    'project management', 'collaboration', 'mentoring', 'coaching',
    
    // Experience levels
    'senior', 'junior', 'lead', 'principal', 'architect', 'manager', 'director',
    
    // Education
    'bachelor', 'master', 'phd', 'degree', 'certification', 'certified'
  ];

  // Extract words from job description
  const words = jobDescription
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);

  // Find matches with common keywords
  const matchedKeywords = words.filter(word => 
    commonKeywords.some(keyword => 
      keyword.includes(word) || word.includes(keyword)
    )
  );

  // Also extract capitalized words (likely to be important)
  const capitalizedWords = jobDescription
    .match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];

  // Combine and deduplicate
  const combinedKeywords = [...matchedKeywords, ...capitalizedWords.map(w => w.toLowerCase())];
  const allKeywords = Array.from(new Set(combinedKeywords));
  
  return allKeywords.slice(0, 20); // Limit to top 20 keywords
}