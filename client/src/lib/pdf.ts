import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Set worker path to CDN
GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.worker.min.js';

export async function parsePDF(file: File): Promise<string> {
  try {
    // Load the file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    
    // Extract text from all pages
    let textContent = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      
      // Concatenate the text items with proper spacing
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
      
      textContent += pageText + '\n\n';
    }
    
    return textContent.trim();
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file. Please try again or paste your resume text directly.');
  }
}
