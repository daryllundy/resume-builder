import React, { useState } from 'react';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';
import { JobPost, ApplicationStatus } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import KanbanColumn from '../components/KanbanColumn';
import KanbanCard from '../components/KanbanCard';
import { useEffect } from 'react';

interface KanbanBoardProps {
  jobs: JobPost[];
  onJobStatusChange: (jobId: number, status: ApplicationStatus) => Promise<void>;
  onJobDelete: (jobId: number) => Promise<void>;
  refreshJobs: () => void;
}

const COLUMN_ORDER: ApplicationStatus[] = [
  'saved',
  'applied',
  'hr_screen',
  'interview',
  'offer',
  'accepted',
  'rejected',
];

const COLUMN_TITLES: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  hr_screen: 'HR Screen',
  interview: 'Interview',
  offer: 'Offer',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export default function KanbanBoard({ 
  jobs, 
  onJobStatusChange, 
  onJobDelete,
  refreshJobs
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [activeJob, setActiveJob] = useState<JobPost | null>(null);

  // Group jobs by status
  const jobsByStatus = COLUMN_ORDER.reduce((acc, status) => {
    acc[status] = jobs.filter(job => job.status === status);
    return acc;
  }, {} as Record<ApplicationStatus, JobPost[]>);

  // Configure sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle start of drag operation
  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const jobId = Number(active.id);
    const draggedJob = jobs.find(job => job.id === jobId);
    
    setActiveId(jobId);
    if (draggedJob) {
      setActiveJob(draggedJob);
    }
  }

  // Handle end of drag operation
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setActiveJob(null);
      return;
    }

    const jobId = Number(active.id);
    const newStatus = String(over.id) as ApplicationStatus;
    
    console.log("Dragged job to:", { jobId, newStatus, overId: over.id });
    
    // Update job status if it changed
    const currentJob = jobs.find(job => job.id === jobId);
    
    if (currentJob && currentJob.status !== newStatus) {
      try {
        await onJobStatusChange(jobId, newStatus);
        console.log("Status updated successfully");
      } catch (error) {
        console.error("Failed to update job status:", error);
      }
    }
    
    setActiveId(null);
    setActiveJob(null);
  }

  // Refresh the jobs data and log for debugging
  useEffect(() => {
    refreshJobs();
    console.log("KanbanBoard received jobs:", jobs);
  }, [refreshJobs, jobs.length]);

  return (
    <div className="w-full overflow-auto">
      <div className="min-w-[800px] p-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-7 gap-3">
            {COLUMN_ORDER.map((status) => (
              <KanbanColumn 
                key={status} 
                status={status}
                title={COLUMN_TITLES[status]}
                jobs={jobsByStatus[status] || []}
                onDeleteJob={onJobDelete}
              />
            ))}
          </div>

          <DragOverlay>
            {activeId && activeJob ? (
              <div className="w-full opacity-80">
                <KanbanCard 
                  job={activeJob} 
                  onDeleteJob={onJobDelete}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}