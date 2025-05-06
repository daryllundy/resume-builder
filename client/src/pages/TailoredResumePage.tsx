import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { JobPost, TailoringHistory } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { ArrowLeft, Download, Copy, FileText, Briefcase } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function TailoredResumePage() {
  const [, params] = useRoute('/tailored-resume/:id');
  const jobId = params?.id ? parseInt(params.id) : null;
  const [activeTab, setActiveTab] = useState<'resume' | 'job'>('resume');
  
  // Get job data
  const { data: job, isLoading: isJobLoading } = useQuery({
    queryKey: [`/api/jobs/${jobId}`],
    queryFn: async () => {
      if (!jobId) return null;
      const response = await apiRequest('GET', `/api/jobs/${jobId}`);
      return response.json() as Promise<JobPost>;
    },
    enabled: !!jobId,
  });
  
  // Get tailoring history for this job
  const { data: tailoringHistory, isLoading: isHistoryLoading } = useQuery({
    queryKey: [`/api/tailoring-history`, jobId],
    queryFn: async () => {
      if (!jobId) return [];
      const response = await apiRequest('GET', `/api/tailoring-history?jobId=${jobId}`);
      return response.json() as Promise<TailoringHistory[]>;
    },
    enabled: !!jobId,
  });
  
  // Most recent tailored resume
  const latestTailoredResume = tailoringHistory && tailoringHistory.length > 0 
    ? tailoringHistory[0]
    : null;
    
  // Generate PDF from resume content
  const handleDownloadPDF = () => {
    const resumeElement = document.getElementById('tailored-resume-content');
    if (!resumeElement) return;
    
    const fileName = `tailored-resume-${job?.company || 'company'}-${job?.title || 'position'}.pdf`;
    
    const pdfOptions = {
      margin: [10, 10, 10, 10],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    toast({
      title: "Generating PDF",
      description: "Your PDF is being generated, please wait...",
    });
    
    // Use any type to bypass TypeScript error
    (html2pdf() as any).from(resumeElement).set(pdfOptions).save().then(() => {
      toast({
        title: "PDF Downloaded",
        description: "Your tailored resume has been downloaded as a PDF.",
      });
    });
  };
  
  // Copy tailored resume content to clipboard
  const handleCopyToClipboard = () => {
    if (!latestTailoredResume?.tailoredResume) return;
    
    // Use non-null assertion since we already checked above
    navigator.clipboard.writeText(latestTailoredResume.tailoredResume!).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Your tailored resume has been copied to the clipboard.",
      });
    });
  };
  
  if (isJobLoading || isHistoryLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
          <p className="mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Link href="/jobs">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Job Board
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/jobs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Job Board
            </Button>
          </Link>
        </div>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
          <p className="text-gray-600">{job.company}{job.location ? ` • ${job.location}` : ''}</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'resume' | 'job')}>
          <TabsList className="mb-6">
            <TabsTrigger value="resume">
              <FileText className="w-4 h-4 mr-2" />
              Tailored Resume
            </TabsTrigger>
            <TabsTrigger value="job">
              <Briefcase className="w-4 h-4 mr-2" />
              Job Description
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="resume">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Tailored Resume</CardTitle>
              </CardHeader>
              
              <CardContent>
                {latestTailoredResume ? (
                  <div 
                    id="tailored-resume-content" 
                    className="prose max-w-none whitespace-pre-line"
                  >
                    {latestTailoredResume.tailoredResume}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-gray-500 mb-4">No tailored resume available for this job yet.</p>
                    <Link href="/">
                      <Button>
                        Create Tailored Resume
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
              
              {latestTailoredResume && (
                <CardFooter className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleCopyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={handleDownloadPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="job">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Job Description</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="prose max-w-none whitespace-pre-line">
                  {job.description || (
                    <p className="text-gray-500">No job description available.</p>
                  )}
                </div>
              </CardContent>
              
              {job.url && (
                <CardFooter>
                  <a 
                    href={job.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline"
                  >
                    View original job listing
                  </a>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}