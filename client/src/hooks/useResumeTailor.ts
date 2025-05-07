import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import html2pdf from "html2pdf.js";
import { getTemplateById } from "@/lib/resumeTemplates";

export function useResumeTailor() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tailoredResumeText, setTailoredResumeText] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("chronological");

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST", 
        "/api/tailor", 
        { 
          resume: resumeText, 
          jobDescription,
          templateId: selectedTemplateId
        }
      );
      
      return response.text();
    },
    onSuccess: (data) => {
      // Apply the selected template to the tailored resume
      const template = getTemplateById(selectedTemplateId);
      try {
        // Parse the HTML content to extract the plain text
        const tempElement = document.createElement("div");
        tempElement.innerHTML = data;
        const plainText = tempElement.innerText;
        
        // Apply the template formatting to the plain text
        const formattedText = template.format(plainText);
        
        // Convert back to HTML format with proper line breaks
        const formattedHtml = formattedText
          .replace(/\n\n/g, '</p><p>')
          .replace(/\n/g, '<br>')
          .replace(/•/g, '&bull;');
        
        const wrappedHtml = `<p>${formattedHtml}</p>`.replace('<p></p>', '');
        
        setTailoredResumeText(wrappedHtml);
      } catch (error) {
        console.error("Error applying template:", error);
        // Fallback to the original data if template application fails
        setTailoredResumeText(data);
      }
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
      // Show loading toast
      toast({
        title: "Processing Resume",
        description: "Your resume file is being processed...",
        duration: 3000,
      });
      
      // Create a FormData object
      const formData = new FormData();
      formData.append("file", file);
      
      // Send the file to the server for processing
      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Failed to parse resume");
      }
      
      const result = await response.json();
      
      if (!result.success || !result.text) {
        throw new Error("No text was extracted from the resume");
      }
      
      // Set the extracted text
      setResumeText(result.text);
      
      toast({
        title: "Resume Processed",
        description: "Your resume has been successfully processed. Feel free to edit the text if needed.",
      });
    } catch (error) {
      console.error("Error parsing file:", error);
      toast({
        title: "Error Processing Resume",
        description: error instanceof Error ? error.message : "Failed to process the uploaded file. Please try again or paste your resume text directly.",
        variant: "destructive",
        duration: 5000,
      });
      
      // For user convenience, allow them to manually type their resume
      setResumeText(""); 
      throw error;
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
    selectedTemplateId,
    setSelectedTemplateId,
    isLoading: mutation.isPending,
    tailorResume,
    handleResumeUpload,
    downloadPDF,
    copyToClipboard,
  };
}
