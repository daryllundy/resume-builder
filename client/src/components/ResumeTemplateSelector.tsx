import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { resumeTemplates, ResumeTemplate } from "@/lib/resumeTemplates";
import { 
  ArrowUpDown, 
  ListChecks, 
  FileStack, 
  Minimize2, 
  Award 
} from "lucide-react";

// Map of template IDs to icons for visual representation
const templateIcons: Record<string, React.ReactNode> = {
  chronological: <ArrowUpDown className="h-6 w-6" />,
  functional: <ListChecks className="h-6 w-6" />,
  combination: <FileStack className="h-6 w-6" />,
  minimalist: <Minimize2 className="h-6 w-6" />,
  executive: <Award className="h-6 w-6" />
};

interface ResumeTemplateSelectorProps {
  selectedTemplateId: string;
  onTemplateSelect: (templateId: string) => void;
}

export default function ResumeTemplateSelector({ 
  selectedTemplateId, 
  onTemplateSelect 
}: ResumeTemplateSelectorProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Select Resume Style</h3>
      
      <RadioGroup
        value={selectedTemplateId}
        onValueChange={onTemplateSelect}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {resumeTemplates.map((template) => (
          <div key={template.id}>
            <RadioGroupItem
              value={template.id}
              id={`template-${template.id}`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`template-${template.id}`}
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <div className="mb-2 rounded-full bg-muted p-2">
                {templateIcons[template.id]}
              </div>
              <div className="text-center">
                <div className="font-semibold">{template.name}</div>
                <div className="text-sm text-muted-foreground">{template.description}</div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}