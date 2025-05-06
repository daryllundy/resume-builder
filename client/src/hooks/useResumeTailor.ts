import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
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
        // For PDF files, provide a friendly message explaining the limitation
        toast({
          title: "PDF Upload Detected",
          description: "PDF parsing is currently limited. Please copy and paste your resume text directly for best results.",
          duration: 5000,
        });
        
        // Return a placeholder message instead of trying to parse the PDF
        text = "Please copy and paste your resume text here, as direct PDF parsing is currently limited.";
        
      } else if (file.type.includes("text") || file.name.endsWith(".txt") || file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
        // For text-based files, extract the content directly
        try {
          text = await file.text();
          
          if (!text.trim()) {
            throw new Error("The uploaded file appears to be empty.");
          }
        } catch (textError) {
          console.error("Error extracting text from file:", textError);
          throw new Error("Could not read text from the file. The file might be corrupted or in an unsupported format.");
        }
      } else {
        // For other file types
        throw new Error(`Unsupported file type: ${file.type}. Please upload a text file or paste your resume directly.`);
      }
      
      setResumeText(text);
    } catch (error) {
      console.error("Error parsing file:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to process the uploaded file. Please try again or paste your resume text directly.");
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
