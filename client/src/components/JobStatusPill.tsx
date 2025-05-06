import { useState } from "react";
import { ApplicationStatus } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface JobStatusPillProps {
  status: ApplicationStatus;
  onStatusChange: (status: ApplicationStatus) => void;
}

export default function JobStatusPill({ status, onStatusChange }: JobStatusPillProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Status configuration with colors and labels
  const statusConfig: Record<ApplicationStatus, { color: string; label: string }> = {
    saved: { color: "bg-blue-100 text-blue-800", label: "Saved" },
    applied: { color: "bg-purple-100 text-purple-800", label: "Applied" },
    hr_screen: { color: "bg-indigo-100 text-indigo-800", label: "HR Screen" },
    interview: { color: "bg-yellow-100 text-yellow-800", label: "Interview" },
    offer: { color: "bg-green-100 text-green-800", label: "Offer" },
    accepted: { color: "bg-emerald-100 text-emerald-800", label: "Accepted" },
    rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
  };

  const statusOptions: { value: ApplicationStatus; label: string }[] = [
    { value: "saved", label: "Saved" },
    { value: "applied", label: "Applied" },
    { value: "hr_screen", label: "HR Screen" },
    { value: "interview", label: "Interview" },
    { value: "offer", label: "Offer" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
  ];

  const currentConfig = statusConfig[status];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`rounded-full h-7 px-3 text-xs font-medium focus:ring-0 focus:ring-offset-0 ${currentConfig.color}`}
        >
          {currentConfig.label}
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className={option.value === status ? "bg-gray-100 font-medium" : ""}
            onClick={() => {
              if (option.value !== status) {
                onStatusChange(option.value);
              }
              setIsOpen(false);
            }}
          >
            <div className={`h-2 w-2 rounded-full mr-2 ${statusConfig[option.value].color}`} />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}