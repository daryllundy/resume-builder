import { createWriteStream, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { nanoid } from 'nanoid';

export interface DocumentConversionOptions {
  format: 'pdf' | 'markdown' | 'doc' | 'txt';
  content: string;
  filename?: string;
}

export interface ConversionResult {
  success: boolean;
  filePath?: string;
  mimeType?: string;
  error?: string;
}

export async function convertResumeToFormat(options: DocumentConversionOptions): Promise<ConversionResult> {
  const { format, content, filename = 'resume' } = options;
  const tempId = nanoid();
  const baseFilename = `${filename}_${tempId}`;

  try {
    switch (format) {
      case 'txt':
        return convertToTxt(content, baseFilename);
      
      case 'markdown':
        return convertToMarkdown(content, baseFilename);
      
      case 'doc':
        return convertToDoc(content, baseFilename);
      
      case 'pdf':
        return convertToPdf(content, baseFilename);
      
      default:
        return { success: false, error: 'Unsupported format' };
    }
  } catch (error) {
    console.error('Document conversion failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Conversion failed' 
    };
  }
}

function convertToTxt(content: string, filename: string): ConversionResult {
  const filePath = join(process.cwd(), 'uploads', `${filename}.txt`);
  
  try {
    // Clean HTML tags and format as plain text
    const plainText = content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/&amp;/g, '&') // Replace HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n/g, '\n\n') // Clean up multiple newlines
      .trim();

    require('fs').writeFileSync(filePath, plainText, 'utf8');
    
    return {
      success: true,
      filePath,
      mimeType: 'text/plain'
    };
  } catch (error) {
    return { success: false, error: 'Failed to create TXT file' };
  }
}

function convertToMarkdown(content: string, filename: string): ConversionResult {
  const filePath = join(process.cwd(), 'uploads', `${filename}.md`);
  
  try {
    // Convert basic HTML to Markdown or format plain text as Markdown
    let markdownContent = content;
    
    // If content has HTML tags, convert them
    if (content.includes('<')) {
      markdownContent = content
        .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
        .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
        .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
        .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
        .replace(/<ul[^>]*>/gi, '')
        .replace(/<\/ul>/gi, '\n')
        .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
        .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
    } else {
      // Format plain text as Markdown with proper structure
      const lines = content.split('\n');
      const formattedLines = lines.map(line => {
        const trimmed = line.trim();
        
        // Check if line looks like a heading (ALL CAPS or followed by dashes)
        if (trimmed.length > 0 && (
          trimmed === trimmed.toUpperCase() && trimmed.length < 50 ||
          lines[lines.indexOf(line) + 1]?.trim().startsWith('---')
        )) {
          return `## ${trimmed}`;
        }
        
        // Check if line looks like a bullet point
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
          return trimmed.replace(/^[•\-\*]\s*/, '- ');
        }
        
        return trimmed;
      });
      
      markdownContent = formattedLines.join('\n').replace(/\n\s*\n\s*\n/g, '\n\n');
    }

    require('fs').writeFileSync(filePath, markdownContent, 'utf8');
    
    return {
      success: true,
      filePath,
      mimeType: 'text/markdown'
    };
  } catch (error) {
    return { success: false, error: 'Failed to create Markdown file' };
  }
}

function convertToDoc(content: string, filename: string): ConversionResult {
  const filePath = join(process.cwd(), 'uploads', `${filename}.doc`);
  
  try {
    // Create a simple RTF document (which can be opened by Word)
    // RTF is more compatible than trying to create a true .doc file
    const rtfContent = convertToRTF(content);
    
    require('fs').writeFileSync(filePath, rtfContent, 'utf8');
    
    return {
      success: true,
      filePath,
      mimeType: 'application/msword'
    };
  } catch (error) {
    return { success: false, error: 'Failed to create DOC file' };
  }
}

function convertToRTF(content: string): string {
  // Clean and format content for RTF
  const plainText = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n/g, '\n\n')
    .trim();

  // Basic RTF structure
  const rtfHeader = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}';
  const rtfBody = plainText
    .replace(/\n/g, '\\par\n')
    .replace(/\t/g, '\\tab ')
    .split('\n')
    .map(line => {
      // Make section headers bold if they look like headers
      const trimmed = line.replace('\\par', '').trim();
      if (trimmed.length > 0 && trimmed === trimmed.toUpperCase() && trimmed.length < 50) {
        return `\\b ${line}\\b0`;
      }
      return line;
    })
    .join('\n');
  
  const rtfFooter = '}';
  
  return `${rtfHeader}\n${rtfBody}\n${rtfFooter}`;
}

function convertToPdf(content: string, filename: string): ConversionResult {
  const filePath = join(process.cwd(), 'uploads', `${filename}.pdf`);
  
  try {
    // For PDF generation, we'll create an HTML version and note that
    // the client will handle PDF conversion using html2pdf.js
    const htmlContent = formatContentAsHTML(content);
    
    // Save HTML version for client-side PDF conversion
    const htmlPath = join(process.cwd(), 'uploads', `${filename}.html`);
    require('fs').writeFileSync(htmlPath, htmlContent, 'utf8');
    
    return {
      success: true,
      filePath: htmlPath,
      mimeType: 'text/html' // Client will convert to PDF
    };
  } catch (error) {
    return { success: false, error: 'Failed to prepare PDF content' };
  }
}

function formatContentAsHTML(content: string): string {
  // If content already has HTML, clean it up
  if (content.includes('<')) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Resume</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        h1, h2, h3 { color: #333; margin-top: 30px; margin-bottom: 10px; }
        h1 { font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 5px; }
        h2 { font-size: 20px; color: #555; }
        h3 { font-size: 16px; }
        p { margin-bottom: 10px; }
        ul { margin-left: 20px; }
        li { margin-bottom: 5px; }
        strong, b { font-weight: bold; }
        em, i { font-style: italic; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
  }
  
  // Convert plain text to formatted HTML
  const lines = content.split('\n');
  let htmlContent = '';
  let inList = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '') {
      if (inList) {
        htmlContent += '</ul>\n';
        inList = false;
      }
      htmlContent += '<br>\n';
      continue;
    }
    
    // Check if it's a heading (ALL CAPS or section-like)
    if (line === line.toUpperCase() && line.length < 50 && line.length > 2) {
      if (inList) {
        htmlContent += '</ul>\n';
        inList = false;
      }
      htmlContent += `<h2>${line}</h2>\n`;
    }
    // Check if it's a bullet point
    else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      if (!inList) {
        htmlContent += '<ul>\n';
        inList = true;
      }
      const bulletText = line.replace(/^[•\-\*]\s*/, '');
      htmlContent += `<li>${bulletText}</li>\n`;
    }
    // Regular paragraph
    else {
      if (inList) {
        htmlContent += '</ul>\n';
        inList = false;
      }
      htmlContent += `<p>${line}</p>\n`;
    }
  }
  
  if (inList) {
    htmlContent += '</ul>\n';
  }
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Resume</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; max-width: 800px; }
        h1, h2, h3 { color: #333; margin-top: 25px; margin-bottom: 10px; }
        h1 { font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 5px; }
        h2 { font-size: 18px; color: #555; font-weight: bold; }
        h3 { font-size: 16px; }
        p { margin-bottom: 8px; }
        ul { margin-left: 20px; margin-bottom: 15px; }
        li { margin-bottom: 4px; }
        br { margin-bottom: 8px; }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
}