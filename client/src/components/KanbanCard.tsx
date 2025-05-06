import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { JobPost } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter 
} from '@/components/ui/card';
import { Trash2, ExternalLink, FileText } from 'lucide-react';
import { Link } from 'wouter';

interface KanbanCardProps {
  job: JobPost;
  onDeleteJob: (jobId: number) => Promise<void>;
}

export default function KanbanCard({ job, onDeleteJob }: KanbanCardProps) {
  // Set up sortable functionality with dnd-kit
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: job.id });

  // Apply transform styles from dnd-kit
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Handle delete job
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this job?')) {
      await onDeleteJob(job.id);
    }
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className="border shadow-sm hover:shadow cursor-move bg-white"
      {...attributes} 
      {...listeners}
    >
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm font-medium truncate">
          {job.title}
        </CardTitle>
        <CardDescription className="text-xs truncate">
          {job.company}{job.location ? ` • ${job.location}` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {job.description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
            {job.description.length > 150 
              ? `${job.description.substring(0, 150)}...` 
              : job.description}
          </p>
        )}
        <div className="text-xs text-gray-500">
          Added: {formatDate(job.dateAdded)}
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between">
        <div className="flex space-x-2">
          <Link href={`/tailored-resume/${job.id}`}>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Resume
            </Button>
          </Link>
          {job.url && (
            <a 
              href={job.url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                <ExternalLink className="h-3 w-3 mr-1" />
                Job
              </Button>
            </a>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2 text-xs text-red-600 hover:text-red-800 hover:bg-red-50"
          onClick={handleDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}