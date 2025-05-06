import React from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { JobPost, ApplicationStatus } from '@shared/schema';
import KanbanCard from '../components/KanbanCard';

interface KanbanColumnProps {
  status: ApplicationStatus;
  title: string;
  jobs: JobPost[];
  onDeleteJob: (jobId: number) => Promise<void>;
}

export default function KanbanColumn({ 
  status, 
  title, 
  jobs, 
  onDeleteJob 
}: KanbanColumnProps) {
  // Get column colors based on status
  const getColumnColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'saved':
        return 'bg-blue-50 border-blue-200';
      case 'applied':
        return 'bg-purple-50 border-purple-200';
      case 'hr_screen':
        return 'bg-indigo-50 border-indigo-200';
      case 'interview':
        return 'bg-yellow-50 border-yellow-200';
      case 'offer':
        return 'bg-green-50 border-green-200';
      case 'accepted':
        return 'bg-emerald-50 border-emerald-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Get title colors based on status
  const getTitleColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'saved':
        return 'text-blue-700';
      case 'applied':
        return 'text-purple-700';
      case 'hr_screen':
        return 'text-indigo-700';
      case 'interview':
        return 'text-yellow-700';
      case 'offer':
        return 'text-green-700';
      case 'accepted':
        return 'text-emerald-700';
      case 'rejected':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  // Calculate column height based on status
  const getColumnHeight = (status: ApplicationStatus) => {
    // Make certain columns taller in the UI
    switch (status) {
      case 'applied':
      case 'interview':
        return 'min-h-[500px]';
      default:
        return 'min-h-[400px]';
    }
  };

  const columnClasses = `
    ${getColumnColor(status)} 
    ${getColumnHeight(status)}
    rounded-md 
    border 
    p-2 
    flex 
    flex-col
  `;

  const titleClasses = `
    ${getTitleColor(status)} 
    text-sm 
    font-semibold 
    mb-2 
    p-1
    text-center
  `;

  // Make the entire column a drop target
  const { setNodeRef } = useSortable({
    id: status,
    data: {
      type: "column",
      status
    }
  });

  return (
    <div 
      ref={setNodeRef}
      className={columnClasses} 
      data-status={status}
    >
      <h3 className={titleClasses}>{title} <span className="text-gray-500">({jobs.length})</span></h3>
      <div className="flex-1 overflow-y-auto space-y-2">
        {jobs.map((job) => (
          <KanbanCard 
            key={job.id} 
            job={job} 
            onDeleteJob={onDeleteJob}
          />
        ))}
        {jobs.length === 0 && (
          <div className="flex items-center justify-center h-24 text-sm text-gray-400">
            No jobs in this stage
          </div>
        )}
      </div>
    </div>
  );
}