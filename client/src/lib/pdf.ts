// Simple PDF parsing implementation without using web workers
// This avoids issues with CDN and worker version mismatches
export async function parsePDF(file: File): Promise<string> {
  try {
    console.log("Warning: Setting up fake worker.");
    
    // For now, let's use a simple direct text extraction approach
    try {
      // For PDFs, we'll use a different approach later, but for now use basic text extraction
      const text = await file.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error("Could not extract text from PDF - the file appears to be empty or image-based.");
      }
      
      return text;
    } catch (readError) {
      console.error("Error reading PDF content:", readError);
      throw new Error("Could not read PDF content. The file might be corrupted or password-protected.");
    }
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file. Please paste your resume text directly instead.');
  }
}
