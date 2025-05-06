import { useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  maxSize?: number;
}

export function FileUpload({ onFileSelected, accept = "*", maxSize = Infinity }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      toast({
        title: "File too large",
        description: `File size exceeds the maximum limit of ${maxSizeMB}MB.`,
        variant: "destructive",
      });
      return false;
    }

    // If accept is provided and not *, check file type
    if (accept && accept !== "*") {
      const acceptedTypes = accept.split(",").map(type => type.trim());
      const fileExtension = `.${file.name.split('.').pop()}`.toLowerCase();
      const fileType = file.type;

      const isAccepted = acceptedTypes.some(type => {
        // Check for mime type match or extension match
        return fileType.match(type) || fileExtension.match(type);
      });

      if (!isAccepted) {
        toast({
          title: "Invalid file type",
          description: `File must be one of the following formats: ${accept}`,
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelected(file);
      }
      // Reset input to allow uploading the same file again
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelected(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const borderClass = isDragging ? 'border-primary' : 'border-gray-300 hover:border-primary';

  return (
    <div
      className={`mt-2 border-2 border-dashed ${borderClass} rounded-lg p-6 text-center transition-colors`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={triggerFileInput}
    >
      <div className="space-y-2">
        <div className="mx-auto h-16 w-16 text-gray-400 flex items-center justify-center">
          <i className="fas fa-file-upload text-3xl"></i>
        </div>
        <div className="text-sm text-gray-600">
          <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary-dark">
            <span>Upload a file</span>
            <input 
              ref={fileInputRef}
              id="file-upload" 
              name="file-upload" 
              type="file" 
              className="sr-only" 
              accept={accept} 
              onChange={handleFileChange}
            />
          </label>
          <span className="text-gray-500"> or drag and drop</span>
        </div>
        <p className="text-xs text-gray-500">
          {accept === "*" ? "Any file format" : accept.replaceAll(",", ", ")} up to {maxSize ? `${(maxSize / (1024 * 1024)).toFixed(1)}MB` : "unlimited size"}
        </p>
      </div>
    </div>
  );
}
