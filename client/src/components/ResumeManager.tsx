import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Upload, FileText, MoreVertical, Star, StarOff, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Resume } from "@shared/schema";

interface ResumeManagerProps {
  selectedResumeId?: number;
  onResumeSelect?: (resumeId: number) => void;
}

export default function ResumeManager({ selectedResumeId, onResumeSelect }: ResumeManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const [newResumeTitle, setNewResumeTitle] = useState("");
  const [newResumeContent, setNewResumeContent] = useState("");
  const [uploadMethod, setUploadMethod] = useState<"file" | "text">("file");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch resumes
  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ["/api/resumes"],
    queryFn: () => apiRequest("/api/resumes")
  });

  // Create resume mutation
  const createResumeMutation = useMutation({
    mutationFn: async (data: { title: string; content?: string; file?: File }) => {
      const formData = new FormData();
      formData.append("title", data.title);
      
      if (data.file) {
        formData.append("file", data.file);
      } else if (data.content) {
        formData.append("content", data.content);
      }

      const response = await fetch("/api/resumes", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create resume");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      setIsCreateDialogOpen(false);
      setNewResumeTitle("");
      setNewResumeContent("");
      toast({
        title: "Resume created",
        description: "Your resume has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create resume",
        variant: "destructive",
      });
    }
  });

  // Update resume mutation
  const updateResumeMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<Resume> }) => {
      return apiRequest(`/api/resumes/${data.id}`, "PUT", data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      setIsEditDialogOpen(false);
      setEditingResume(null);
      toast({
        title: "Resume updated",
        description: "Your resume has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update resume",
        variant: "destructive",
      });
    }
  });

  // Delete resume mutation
  const deleteResumeMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/resumes/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      toast({
        title: "Resume deleted",
        description: "Your resume has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete resume",
        variant: "destructive",
      });
    }
  });

  // Set default resume mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/resumes/${id}/set-default`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      toast({
        title: "Default resume set",
        description: "This resume is now your default.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set default resume",
        variant: "destructive",
      });
    }
  });

  const handleCreateResume = () => {
    if (!newResumeTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a resume title",
        variant: "destructive",
      });
      return;
    }

    if (uploadMethod === "text" && !newResumeContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter resume content",
        variant: "destructive",
      });
      return;
    }

    createResumeMutation.mutate({
      title: newResumeTitle,
      content: uploadMethod === "text" ? newResumeContent : undefined,
    });
  };

  const handleFileUpload = (file: File) => {
    if (!newResumeTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a resume title first",
        variant: "destructive",
      });
      return;
    }

    createResumeMutation.mutate({
      title: newResumeTitle,
      file,
    });
  };

  const handleEditResume = (resume: Resume) => {
    setEditingResume(resume);
    setIsEditDialogOpen(true);
  };

  const handleUpdateResume = () => {
    if (!editingResume) return;

    updateResumeMutation.mutate({
      id: editingResume.id,
      updates: editingResume,
    });
  };

  if (isLoading) {
    return <div className="p-4">Loading resumes...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Resume Library</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Resume
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Resume</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Resume Title</Label>
                <Input
                  id="title"
                  value={newResumeTitle}
                  onChange={(e) => setNewResumeTitle(e.target.value)}
                  placeholder="e.g., Software Engineer Resume"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={uploadMethod === "file" ? "default" : "outline"}
                  onClick={() => setUploadMethod("file")}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant={uploadMethod === "text" ? "default" : "outline"}
                  onClick={() => setUploadMethod("text")}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Enter Text
                </Button>
              </div>

              {uploadMethod === "file" ? (
                <FileUpload
                  onFileSelected={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt"
                  maxSize={10 * 1024 * 1024}
                />
              ) : (
                <div>
                  <Label htmlFor="content">Resume Content</Label>
                  <Textarea
                    id="content"
                    value={newResumeContent}
                    onChange={(e) => setNewResumeContent(e.target.value)}
                    placeholder="Paste your resume content here..."
                    className="min-h-[200px]"
                  />
                  <Button 
                    onClick={handleCreateResume}
                    disabled={createResumeMutation.isPending}
                    className="mt-2"
                  >
                    {createResumeMutation.isPending ? "Creating..." : "Create Resume"}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resumes.map((resume: Resume) => (
          <Card 
            key={resume.id} 
            className={`cursor-pointer transition-colors ${
              selectedResumeId === resume.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => onResumeSelect?.(resume.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium truncate">
                  {resume.title}
                </CardTitle>
                <div className="flex items-center gap-1">
                  {resume.isDefault && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditResume(resume)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {!resume.isDefault && (
                        <DropdownMenuItem onClick={() => setDefaultMutation.mutate(resume.id)}>
                          <Star className="h-4 w-4 mr-2" />
                          Set as Default
                        </DropdownMenuItem>
                      )}
                      {resume.isDefault && (
                        <DropdownMenuItem disabled>
                          <StarOff className="h-4 w-4 mr-2" />
                          Default Resume
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => deleteResumeMutation.mutate(resume.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {resume.originalFileName && (
                  <Badge variant="secondary" className="text-xs">
                    {resume.originalFileName}
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground">
                  Updated {new Date(resume.updatedAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {resume.content.substring(0, 100)}...
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {resumes.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No resumes yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first resume to get started with tailoring
          </p>
        </div>
      )}

      {/* Edit Resume Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Resume</DialogTitle>
          </DialogHeader>
          {editingResume && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Resume Title</Label>
                <Input
                  id="edit-title"
                  value={editingResume.title}
                  onChange={(e) => setEditingResume({ ...editingResume, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-content">Resume Content</Label>
                <Textarea
                  id="edit-content"
                  value={editingResume.content}
                  onChange={(e) => setEditingResume({ ...editingResume, content: e.target.value })}
                  className="min-h-[300px]"
                />
              </div>
              <Button 
                onClick={handleUpdateResume}
                disabled={updateResumeMutation.isPending}
              >
                {updateResumeMutation.isPending ? "Updating..." : "Update Resume"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}