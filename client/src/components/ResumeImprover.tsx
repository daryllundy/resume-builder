import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Wand2, 
  Download, 
  FileText, 
  FileDown,
  FileType,
  Loader2,
  CheckCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResumeImprovementResult {
  improvedResume: string;
  changesExplanation: string;
  implementedRecommendations: string[];
  additionalSuggestions: string[];
}

interface ResumeImproverProps {
  resumeContent: string;
  recommendations: string[];
  jobDescription?: string;
  onImprovedResume?: (improvedResume: string) => void;
}

export default function ResumeImprover({ 
  resumeContent, 
  recommendations, 
  jobDescription,
  onImprovedResume 
}: ResumeImproverProps) {
  const [result, setResult] = useState<ResumeImprovementResult | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const { toast } = useToast();

  const improveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/improve-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeContent,
          recommendations,
          jobDescription
        })
      });

      if (!response.ok) {
        throw new Error("Failed to improve resume");
      }

      return response.json();
    },
    onSuccess: (data: ResumeImprovementResult) => {
      setResult(data);
      onImprovedResume?.(data.improvedResume);
      toast({
        title: "Resume Improved",
        description: "Your resume has been enhanced with AI recommendations.",
      });
    },
    onError: (error) => {
      toast({
        title: "Improvement Failed",
        description: error instanceof Error ? error.message : "Failed to improve resume",
        variant: "destructive",
      });
    }
  });

  const downloadMutation = useMutation({
    mutationFn: async ({ format, content, filename }: { format: string; content: string; filename: string }) => {
      const response = await fetch("/api/convert-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          format,
          filename
        })
      });

      if (!response.ok) {
        throw new Error("Failed to convert document");
      }

      // Handle PDF differently (returns HTML for client-side conversion)
      if (format === 'pdf') {
        const data = await response.json();
        return { format: 'pdf', htmlContent: data.content, blob: undefined };
      }

      // For other formats, return the blob
      const blob = await response.blob();
      return { format, blob, htmlContent: undefined };
    },
    onSuccess: (data) => {
      if (data.format === 'pdf') {
        // Use html2pdf.js for PDF conversion
        const element = document.createElement('div');
        element.innerHTML = data.htmlContent;
        element.style.display = 'none';
        document.body.appendChild(element);

        // Import and use html2pdf
        import('html2pdf.js').then((html2pdf) => {
          const opt = {
            margin: 1,
            filename: 'improved-resume.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
          };

          html2pdf.default().set(opt).from(element).save().then(() => {
            document.body.removeChild(element);
            toast({
              title: "Downloaded",
              description: "Resume downloaded as PDF successfully.",
            });
          });
        });
      } else {
        // Handle other formats
        if (data.blob) {
          const url = URL.createObjectURL(data.blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `improved-resume.${data.format === 'markdown' ? 'md' : data.format}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }

        toast({
          title: "Downloaded",
          description: `Resume downloaded as ${data.format.toUpperCase()} successfully.`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download resume",
        variant: "destructive",
      });
    }
  });

  const handleDownload = (format: string) => {
    const content = result?.improvedResume || resumeContent;
    const filename = result ? 'improved-resume' : 'resume';
    
    downloadMutation.mutate({ format, content, filename });
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'markdown': return <FileDown className="h-4 w-4" />;
      case 'doc': return <FileType className="h-4 w-4" />;
      case 'txt': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Improvement Action */}
      {!result && recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Improve Resume with AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Recommendations to implement:</h4>
              <div className="grid gap-2">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{rec}</span>
                  </div>
                ))}
                {recommendations.length > 3 && (
                  <div className="text-sm text-gray-500">
                    +{recommendations.length - 3} more recommendations
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={() => improveMutation.mutate()}
              disabled={improveMutation.isPending}
              className="w-full"
            >
              {improveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Improving Resume...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Improve Resume with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Download Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Resume
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  disabled={downloadMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {downloadMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownload('pdf')}>
                  {getFormatIcon('pdf')}
                  <span className="ml-2">PDF Document</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('doc')}>
                  {getFormatIcon('doc')}
                  <span className="ml-2">Word Document</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('markdown')}>
                  {getFormatIcon('markdown')}
                  <span className="ml-2">Markdown</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('txt')}>
                  {getFormatIcon('txt')}
                  <span className="ml-2">Plain Text</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Download your {result ? 'improved ' : ''}resume in multiple formats for different application requirements.
          </p>
        </CardContent>
      </Card>

      {/* Improvement Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Improvement Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Changes Made:</h4>
                <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                  {result.changesExplanation}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Implemented Recommendations:</h4>
                <div className="space-y-1">
                  {result.implementedRecommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {result.additionalSuggestions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Additional Suggestions:</h4>
                  <div className="space-y-1">
                    {result.additionalSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resume Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Resume Content</span>
                <div className="flex gap-2">
                  <Button
                    variant={showOriginal ? "outline" : "default"}
                    size="sm"
                    onClick={() => setShowOriginal(false)}
                  >
                    Improved
                  </Button>
                  <Button
                    variant={showOriginal ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowOriginal(true)}
                  >
                    Original
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
                  {showOriginal ? resumeContent : result.improvedResume}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}