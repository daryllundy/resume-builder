import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, FileText, Eye, Download } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { TailoringHistory as TailoringHistoryType } from "@shared/schema";

interface TailoringHistoryProps {
  jobId?: number;
}

export default function TailoringHistory({ jobId }: TailoringHistoryProps) {
  const [selectedHistory, setSelectedHistory] = useState<TailoringHistoryType | null>(null);
  const [viewMode, setViewMode] = useState<'original' | 'tailored'>('tailored');

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["/api/tailoring-history", jobId],
    queryFn: () => apiRequest(`/api/tailoring-history${jobId ? `?jobId=${jobId}` : ""}`)
  });

  const downloadPDF = (content: string, filename: string) => {
    // Simple text download for now - could be enhanced with actual PDF generation
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!history.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tailored resumes yet</h3>
          <p className="text-gray-500 text-center">
            {jobId 
              ? "Start tailoring your resume for this job to see your history here."
              : "Start tailoring your resumes for specific jobs to see your history here."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {history.map((item: TailoringHistoryType, index: number) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      Resume Tailoring Session
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(item.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {item.templateId}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Job Description Preview</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.jobDescription.substring(0, 150)}...
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedHistory(item)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Resumes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>Resume Comparison</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <Button
                              variant={viewMode === 'original' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setViewMode('original')}
                            >
                              Original Resume
                            </Button>
                            <Button
                              variant={viewMode === 'tailored' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setViewMode('tailored')}
                            >
                              Tailored Resume
                            </Button>
                          </div>
                          
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={viewMode}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ScrollArea className="h-[500px] border rounded-lg p-4">
                                <pre className="whitespace-pre-wrap text-sm">
                                  {viewMode === 'original' ? item.originalResume : item.tailoredResume}
                                </pre>
                              </ScrollArea>
                            </motion.div>
                          </AnimatePresence>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadPDF(
                                viewMode === 'original' ? item.originalResume : item.tailoredResume,
                                `resume-${viewMode}-${format(new Date(item.createdAt), 'yyyy-MM-dd')}`
                              )}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download {viewMode === 'original' ? 'Original' : 'Tailored'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadPDF(
                        item.tailoredResume,
                        `tailored-resume-${format(new Date(item.createdAt), 'yyyy-MM-dd')}`
                      )}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}