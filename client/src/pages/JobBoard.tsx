import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { JobPost, ApplicationStatus } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import JobStatusPill from "../components/JobStatusPill";
import JobPostForm from "../components/JobPostForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function JobBoard() {
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [selectedTab, setSelectedTab] = useState<ApplicationStatus | "all">("all");
  
  const { data: jobs = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/jobs"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/jobs");
      return response.json() as Promise<JobPost[]>;
    },
  });

  const handleStatusChange = async (jobId: number, newStatus: ApplicationStatus) => {
    try {
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
      toast({
        title: "Error updating status",
        description: "Failed to update job application status.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm("Are you sure you want to delete this job post?")) {
      return;
    }
    
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

  return (
    <div className="container px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 sm:gap-0 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Job Application Tracker</h1>
        <Button 
          onClick={() => setIsAddingJob(true)}
          className="bg-primary text-white w-full sm:w-auto"
        >
          Add New Job
        </Button>
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
          {isLoading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
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
                      <JobStatusPill 
                        status={job.status} 
                        onStatusChange={(newStatus: ApplicationStatus) => handleStatusChange(job.id, newStatus)} 
                      />
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
    </div>
  );
}