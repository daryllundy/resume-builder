import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { parsePDF } from "@/lib/pdf";
import html2pdf from "html2pdf.js";

export function useResumeTailor() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tailoredResumeText, setTailoredResumeText] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST", 
        "/api/tailor", 
        { 
          resume: resumeText, 
          jobDescription 
        }
      );
      
      return response.text();
    },
    onSuccess: (data) => {
      setTailoredResumeText(data);
    },
    onError: (error) => {
      toast({
        title: "Error tailoring resume",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const handleResumeUpload = async (file: File) => {
    try {
      let text = "";
      
      if (file.type === "application/pdf") {
        try {
          // Try using the PDF.js parser first
          text = await parsePDF(file);
        } catch (pdfError) {
          console.error("Error parsing PDF with PDF.js:", pdfError);
          
          // Fallback to direct text extraction
          try {
            // For simple text extraction, just read as text
            text = await file.text();
            
            // Add a note for the user about fallback method
            text = "Note: PDF parsing encountered an error, using basic text extraction instead.\n\n" + text;
            
            toast({
              title: "Using fallback PDF extraction",
              description: "The PDF couldn't be parsed properly. Using basic text extraction instead, which may not preserve formatting.",
              variant: "destructive", // Using "destructive" instead of "warning" since it's not a supported variant
              duration: 5000,
            });
          } catch (fallbackError) {
            console.error("Fallback text extraction also failed:", fallbackError);
            throw new Error("Could not extract text from the PDF file. Please copy and paste the content manually.");
          }
        }
      } else {
        // Handle text, doc, and other files
        text = await file.text();
      }
      
      if (!text.trim()) {
        throw new Error("The uploaded file doesn't contain any text content. Please try a different file or paste your resume text directly.");
      }
      
      setResumeText(text);
    } catch (error) {
      console.error("Error parsing file:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to parse the uploaded file. Please try again or paste your resume text directly.");
    }
  };

  const tailorResume = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Both resume and job description are required.",
        variant: "destructive",
      });
      return;
    }

    await mutation.mutateAsync();
  };

  const downloadPDF = () => {
    if (!tailoredResumeText) {
      toast({
        title: "No content to download",
        description: "Please generate a tailored resume first.",
        variant: "destructive",
      });
      return;
    }

    const element = document.getElementById("tailoredResumeText");
    if (!element) {
      toast({
        title: "Error downloading PDF",
        description: "Could not find resume content to download.",
        variant: "destructive",
      });
      return;
    }

    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: "tailored_resume.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();

    toast({
      title: "PDF Downloaded",
      description: "Your tailored resume has been downloaded as a PDF.",
    });
  };

  const copyToClipboard = () => {
    if (!tailoredResumeText) {
      toast({
        title: "No content to copy",
        description: "Please generate a tailored resume first.",
        variant: "destructive",
      });
      return;
    }

    // Create a temporary element to hold the HTML content
    const tempElement = document.createElement("div");
    tempElement.innerHTML = tailoredResumeText;
    
    // Extract text content, preserving line breaks
    const textContent = tempElement.innerText;
    
    navigator.clipboard.writeText(textContent).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description: "Your tailored resume has been copied to your clipboard.",
        });
      },
      (err) => {
        console.error("Failed to copy: ", err);
        toast({
          title: "Failed to copy",
          description: "Please try again or copy manually.",
          variant: "destructive",
        });
      }
    );
  };

  return {
    resumeText,
    setResumeText,
    jobDescription,
    setJobDescription,
    tailoredResumeText,
    isLoading: mutation.isPending,
    tailorResume,
    handleResumeUpload,
    downloadPDF,
    copyToClipboard,
  };
}
