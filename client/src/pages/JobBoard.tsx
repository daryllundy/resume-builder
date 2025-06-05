import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { JobPost, ApplicationStatus } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import JobPostForm from "../components/JobPostForm";
import KanbanBoard from "../components/KanbanBoard";
import ResumeManager from "../components/ResumeManager";
import ResumeTailorDialog from "../components/ResumeTailorDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, FileText, Wand2, Plus } from "lucide-react";

export default function JobBoard() {
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [selectedTab, setSelectedTab] = useState<ApplicationStatus | "all">("all");
  const [selectedResumeId, setSelectedResumeId] = useState<number | undefined>();
  const [tailorDialogOpen, setTailorDialogOpen] = useState(false);
  const [selectedJobForTailoring, setSelectedJobForTailoring] = useState<JobPost | undefined>();
  
  const { data: jobs = [], isLoading, refetch, error } = useQuery({
    queryKey: ["/api/jobs"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/jobs");
        const data = await response.json() as JobPost[];
        console.log("Fetched jobs:", data);
        return data;
      } catch (error) {
        console.error("Error fetching jobs:", error);
        throw error;
      }
    },
    staleTime: 3000, // Reduce refetching frequency
    retry: 2, // Retry failed requests
  });

  const handleStatusChange = async (jobId: number, newStatus: ApplicationStatus) => {
    try {
      console.log("Updating job status:", { jobId, newStatus });
      
      await apiRequest(
        "PATCH",
        `/api/jobs/${jobId}/status`,
        { status: newStatus }
      );
      
      toast({
        title: "Status updated",
        description: "Job application status has been updated.",
      });
      
      refetch();
    } catch (error) {
      console.error("Status update error details:", error);
      
      toast({
        title: "Error updating status",
        description: "Failed to update job application status. Check console for details.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      await apiRequest("DELETE", `/api/jobs/${jobId}`);
      
      toast({
        title: "Job deleted",
        description: "Job post has been removed from your board.",
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Error deleting job",
        description: "Failed to delete job post.",
        variant: "destructive",
      });
    }
  };

  const filteredJobs = selectedTab === "all" 
    ? jobs 
    : jobs.filter(job => job.status === selectedTab);

  const handleTailorResumeForJob = (job: JobPost) => {
    setSelectedJobForTailoring(job);
    setTailorDialogOpen(true);
  };

  return (
    <div className="container px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Job Application Hub</h1>
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Job Applications
          </TabsTrigger>
          <TabsTrigger value="resumes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Resume Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 sm:gap-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Job Applications</h2>
              {selectedResumeId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (jobs.length > 0) {
                      handleTailorResumeForJob(jobs[0]);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  Tailor Resume
                </Button>
              )}
            </div>
            <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
              <div className="flex rounded-md border border-input">
                <Button 
                  type="button"
                  onClick={() => setViewMode("kanban")}
                  variant={viewMode === "kanban" ? "default" : "ghost"}
                  className="rounded-r-none"
                >
                  Kanban
                </Button>
                <Button 
                  type="button"
                  onClick={() => setViewMode("list")}
                  variant={viewMode === "list" ? "default" : "ghost"}
                  className="rounded-l-none"
                >
                  List
                </Button>
              </div>
              <Button 
                onClick={() => setIsAddingJob(true)}
                className="bg-primary text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Job
              </Button>
            </div>
          </div>

          {isAddingJob && (
            <div className="mb-8">
              <JobPostForm
                onCancel={() => setIsAddingJob(false)}
                onSuccess={() => {
                  setIsAddingJob(false);
                  refetch();
                }}
              />
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600">No jobs found</h3>
              <p className="text-sm text-gray-500 mt-2">
                You haven't added any jobs to your board yet.
              </p>
              <Button 
                onClick={() => setIsAddingJob(true)}
                variant="outline" 
                className="mt-4"
              >
                Add Your First Job
              </Button>
            </div>
          ) : viewMode === "kanban" ? (
            <div className="w-full">
              <KanbanBoard 
                jobs={jobs} 
                onJobStatusChange={handleStatusChange} 
                onJobDelete={handleDeleteJob}
                refreshJobs={refetch}
              />
            </div>
          ) : (
        <Tabs defaultValue="all" onValueChange={(value) => setSelectedTab(value as ApplicationStatus | "all")}>
          <div className="overflow-auto pb-2">
            <TabsList className="mb-4 w-auto inline-flex sm:w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
              <TabsTrigger value="applied">Applied</TabsTrigger>
              <TabsTrigger value="hr_screen">HR</TabsTrigger>
              <TabsTrigger value="interview">Interviews</TabsTrigger>
              <TabsTrigger value="offer">Offers</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={selectedTab}>
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-600">No jobs found</h3>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedTab === "all" 
                    ? "You haven't added any jobs to your board yet." 
                    : `You don't have any jobs with '${selectedTab.replace('_', ' ')}' status.`}
                </p>
                {selectedTab === "all" && (
                  <Button 
                    onClick={() => setIsAddingJob(true)}
                    variant="outline" 
                    className="mt-4"
                  >
                    Add Your First Job
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredJobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 sm:gap-0">
                      <div>
                        <h3 className="text-lg sm:text-xl font-medium text-gray-800">{job.title}</h3>
                        <p className="text-gray-600 text-sm sm:text-base">{job.company}{job.location ? ` • ${job.location}` : ''}</p>
                      </div>
                      <div className="self-start">
                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {job.status.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-sm text-gray-600 line-clamp-3">
                        {job.description}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-0">
                      <div className="text-xs text-gray-500">
                        Added: {new Date(job.dateAdded).toLocaleDateString()}
                      </div>
                      <div className="flex gap-3 self-end xs:self-auto">
                        {job.url && (
                          <a 
                            href={job.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:text-primary/80"
                          >
                            View Listing
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
          )}
        </TabsContent>

        <TabsContent value="resumes" className="space-y-6">
          <ResumeManager
            selectedResumeId={selectedResumeId}
            onResumeSelect={setSelectedResumeId}
          />
        </TabsContent>
      </Tabs>

      {/* Resume Tailor Dialog */}
      <ResumeTailorDialog
        isOpen={tailorDialogOpen}
        onOpenChange={setTailorDialogOpen}
        jobPost={selectedJobForTailoring}
      />
    </div>
  );
}