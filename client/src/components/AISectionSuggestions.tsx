import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Lightbulb, Plus, Sparkles, Copy, Check, Brain, Target, Award, Users, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SectionSuggestion {
  type: string;
  title: string;
  content: string;
  bullets?: string[];
  rationale: string;
  impact: 'high' | 'medium' | 'low';
}

interface AISuggestionsResponse {
  suggestions: SectionSuggestion[];
  personalizedTips: string[];
  industryInsights: string[];
}

interface AISectionSuggestionsProps {
  sectionType: string;
  currentContent: string;
  jobDescription?: string;
  onApplySuggestion: (content: string) => void;
  trigger?: React.ReactNode;
}

const sectionIcons = {
  summary: Brain,
  experience: Briefcase,
  skills: Target,
  projects: Award,
  certifications: Users,
  achievements: Sparkles,
  custom: Plus
};

export default function AISectionSuggestions({ 
  sectionType, 
  currentContent, 
  jobDescription, 
  onApplySuggestion,
  trigger 
}: AISectionSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<AISuggestionsResponse | null>(null);
  
  const { toast } = useToast();

  const getSuggestionsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/ai-section-suggestions', {
        method: 'POST',
        body: {
          sectionType,
          currentContent,
          jobDescription
        }
      });
    },
    onSuccess: (data: AISuggestionsResponse) => {
      setSuggestions(data);
      setIsOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Failed to Get Suggestions",
        description: error instanceof Error ? error.message : "Unable to generate AI suggestions",
        variant: "destructive"
      });
    }
  });

  const handleGetSuggestions = () => {
    getSuggestionsMutation.mutate();
  };

  const handleCopySuggestion = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast({
        title: "Copied to Clipboard",
        description: "Content copied successfully"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleApplySuggestion = (content: string) => {
    onApplySuggestion(content);
    setIsOpen(false);
    toast({
      title: "Suggestion Applied",
      description: "Content has been added to your resume section"
    });
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatSectionName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const defaultTrigger = (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleGetSuggestions}
      disabled={getSuggestionsMutation.isPending}
      className="border-purple-200 text-purple-700 hover:bg-purple-50"
    >
      {getSuggestionsMutation.isPending ? (
        <>
          <div className="animate-spin h-3 w-3 border-2 border-purple-600 border-t-transparent rounded-full mr-2" />
          Getting Ideas...
        </>
      ) : (
        <>
          <Lightbulb className="h-3 w-3 mr-2" />
          AI Suggestions
        </>
      )}
    </Button>
  );

  return (
    <>
      {trigger ? (
        <div onClick={handleGetSuggestions}>
          {trigger}
        </div>
      ) : (
        defaultTrigger
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-purple-900 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Suggestions for {formatSectionName(sectionType)}
            </DialogTitle>
          </DialogHeader>

          {suggestions && (
            <div className="space-y-6">
              {/* Content Suggestions */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Content Suggestions</h3>
                <div className="space-y-4">
                  {suggestions.suggestions.map((suggestion, index) => (
                    <Card key={index} className="border-purple-100 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base text-gray-900 mb-2">
                              {suggestion.title}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${getImpactColor(suggestion.impact)}`}>
                                {suggestion.impact.toUpperCase()} IMPACT
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {suggestion.type}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopySuggestion(suggestion.content, index)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {copiedIndex === index ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApplySuggestion(suggestion.content)}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              Apply
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          {suggestion.bullets ? (
                            <ul className="space-y-1 text-sm text-gray-700">
                              {suggestion.bullets.map((bullet, bulletIndex) => (
                                <li key={bulletIndex} className="flex items-start gap-2">
                                  <span className="text-purple-600 mt-1">•</span>
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {suggestion.content}
                            </p>
                          )}
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs text-blue-700 font-medium mb-1">Why this works:</p>
                          <p className="text-xs text-blue-600">{suggestion.rationale}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Personalized Tips */}
              {suggestions.personalizedTips.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Personalized Tips
                  </h3>
                  <div className="grid gap-3">
                    {suggestions.personalizedTips.map((tip, index) => (
                      <Card key={index} className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                        <CardContent className="p-4">
                          <p className="text-sm text-purple-800">{tip}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Industry Insights */}
              {suggestions.industryInsights.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    Industry Insights
                  </h3>
                  <div className="grid gap-3">
                    {suggestions.industryInsights.map((insight, index) => (
                      <Card key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                        <CardContent className="p-4">
                          <p className="text-sm text-green-800">{insight}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Close
                </Button>
                <Button 
                  onClick={handleGetSuggestions}
                  disabled={getSuggestionsMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get New Suggestions
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Simplified popover version for inline suggestions
export function AISectionSuggestionsPopover({ 
  sectionType, 
  currentContent, 
  jobDescription, 
  onApplySuggestion 
}: AISectionSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quickSuggestions, setQuickSuggestions] = useState<string[]>([]);
  
  const { toast } = useToast();

  const getQuickSuggestionsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/ai-quick-suggestions', {
        method: 'POST',
        body: {
          sectionType,
          currentContent: currentContent.slice(0, 200), // Limit for quick suggestions
          jobDescription
        }
      });
    },
    onSuccess: (data: { suggestions: string[] }) => {
      setQuickSuggestions(data.suggestions);
      setIsOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Failed to Get Suggestions",
        description: error instanceof Error ? error.message : "Unable to generate suggestions",
        variant: "destructive"
      });
    }
  });

  const handleApplyQuickSuggestion = (suggestion: string) => {
    onApplySuggestion(suggestion);
    setIsOpen(false);
    toast({
      title: "Suggestion Applied",
      description: "Content added to your section"
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => getQuickSuggestionsMutation.mutate()}
          disabled={getQuickSuggestionsMutation.isPending}
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
        >
          {getQuickSuggestionsMutation.isPending ? (
            <div className="animate-spin h-3 w-3 border-2 border-purple-600 border-t-transparent rounded-full" />
          ) : (
            <Lightbulb className="h-3 w-3" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            Quick Suggestions
          </h4>
          {quickSuggestions.length > 0 ? (
            <div className="space-y-2">
              {quickSuggestions.map((suggestion, index) => (
                <Card key={index} className="border-gray-200 hover:border-purple-300 cursor-pointer transition-colors">
                  <CardContent 
                    className="p-3"
                    onClick={() => handleApplyQuickSuggestion(suggestion)}
                  >
                    <p className="text-xs text-gray-700">{suggestion}</p>
                    <div className="mt-2 flex justify-end">
                      <Button size="sm" variant="ghost" className="text-xs text-purple-600 hover:text-purple-700">
                        Apply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">Click the button to get AI suggestions for this section.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}