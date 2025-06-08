import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Zap, Clock, Target, Briefcase, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TemplateGeneratorProps {
  onTemplateGenerated: (content: string) => void;
}

interface GeneratedTemplate {
  content: string;
  templateType: string;
  industry: string;
  experience: string;
}

const templateStyles = [
  { 
    id: 'modern', 
    name: 'Modern Professional', 
    icon: Sparkles, 
    description: 'Clean, contemporary design with strong visual hierarchy',
    industries: ['Technology', 'Marketing', 'Design', 'Consulting']
  },
  { 
    id: 'executive', 
    name: 'Executive Level', 
    icon: Target, 
    description: 'Traditional format optimized for senior management roles',
    industries: ['Finance', 'Healthcare', 'Manufacturing', 'Legal']
  },
  { 
    id: 'creative', 
    name: 'Creative Portfolio', 
    icon: Zap, 
    description: 'Dynamic layout highlighting creative achievements',
    industries: ['Media', 'Advertising', 'Entertainment', 'Arts']
  },
  { 
    id: 'technical', 
    name: 'Technical Specialist', 
    icon: Briefcase, 
    description: 'Skills-focused format for technical professionals',
    industries: ['Engineering', 'IT', 'Research', 'Development']
  },
  { 
    id: 'entry-level', 
    name: 'Entry Level', 
    icon: GraduationCap, 
    description: 'Education and potential-focused for new graduates',
    industries: ['All Industries', 'Internships', 'Graduate Programs']
  },
  { 
    id: 'career-change', 
    name: 'Career Transition', 
    icon: Clock, 
    description: 'Highlights transferable skills and adaptability',
    industries: ['Cross-Industry', 'Consulting', 'Non-Profit', 'Startups']
  }
];

export default function TemplateGenerator({ onTemplateGenerated }: TemplateGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [jobDescription, setJobDescription] = useState('');
  const [experience, setExperience] = useState('');
  const [industry, setIndustry] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateTemplateMutation = useMutation({
    mutationFn: async (data: {
      templateType: string;
      jobDescription: string;
      experience: string;
      industry: string;
    }) => {
      return await apiRequest('/api/generate-template', 'POST', data);
    },
    onSuccess: (data: GeneratedTemplate) => {
      toast({
        title: "Template Generated Successfully",
        description: `Created a ${data.templateType} template for ${data.industry}`,
      });
      onTemplateGenerated(data.content);
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate template",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setSelectedTemplate('');
    setJobDescription('');
    setExperience('');
    setIndustry('');
  };

  const handleGenerate = () => {
    if (!selectedTemplate || !industry) {
      toast({
        title: "Missing Information",
        description: "Please select a template style and specify your industry",
        variant: "destructive"
      });
      return;
    }

    generateTemplateMutation.mutate({
      templateType: selectedTemplate,
      jobDescription,
      experience,
      industry
    });
  };

  const selectedTemplateData = templateStyles.find(t => t.id === selectedTemplate);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Professional Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Template Generator
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Choose Your Template Style</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {templateStyles.map((template) => {
                const Icon = template.icon;
                const isSelected = selectedTemplate === template.id;
                
                return (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected 
                        ? 'ring-2 ring-purple-500 bg-purple-50 border-purple-200' 
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${isSelected ? 'text-purple-600' : 'text-gray-600'}`} />
                        <CardTitle className={`text-sm ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>
                          {template.name}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {template.industries.slice(0, 2).map((ind) => (
                          <Badge 
                            key={ind} 
                            variant="secondary" 
                            className={`text-xs ${isSelected ? 'bg-purple-100 text-purple-700' : ''}`}
                          >
                            {ind}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Selected Template Details */}
          {selectedTemplateData && (
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <selectedTemplateData.icon className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">{selectedTemplateData.name}</span>
                </div>
                <p className="text-sm text-purple-700 mb-3">{selectedTemplateData.description}</p>
                <div className="flex flex-wrap gap-1">
                  {selectedTemplateData.industries.map((ind) => (
                    <Badge key={ind} className="bg-purple-100 text-purple-700 text-xs">
                      {ind}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Industry Input */}
          <div>
            <Label htmlFor="industry" className="text-base font-semibold">Industry/Field</Label>
            <Textarea
              id="industry"
              placeholder="e.g., Software Engineering, Digital Marketing, Financial Services, Healthcare..."
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="mt-2"
              rows={2}
            />
          </div>

          {/* Experience Input */}
          <div>
            <Label htmlFor="experience" className="text-base font-semibold">Experience Level & Background</Label>
            <Textarea
              id="experience"
              placeholder="e.g., 5 years in software development, recent graduate with internship experience, career changer from finance to tech..."
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="mt-2"
              rows={2}
            />
          </div>

          {/* Job Description (Optional) */}
          <div>
            <Label htmlFor="jobDescription" className="text-base font-semibold">Target Job Description (Optional)</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste a job description to tailor the template to specific requirements..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>

          {/* Generate Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={generateTemplateMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {generateTemplateMutation.isPending ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Template
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}