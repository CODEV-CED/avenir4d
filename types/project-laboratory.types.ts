// B3 — types/project-laboratory.types.ts
import type { HybridProject } from '@/types/hybrid-project.schema';
import type { EmergingCareerBatch3 } from '@/data/emerging-careers-batch3';

export interface ProjectLaboratoryProps {
  initialCareers?: EmergingCareerBatch3[];
  maxProjects?: number;
}

export interface ProjectCardProps {
  project: HybridProject;
  onSelect: (project: HybridProject) => void;
  isSelected?: boolean;
}

export interface CareerSelectorProps {
  careers?: EmergingCareerBatch3[];
  onSelect: (career: EmergingCareerBatch3) => void;
  maxSelection?: number;
}
