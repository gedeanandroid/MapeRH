import { LucideIcon } from 'lucide-react';

export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface IntelligencePrompt {
  id: string;
  text: string;
}

export interface SecurityItemProps {
  text: string;
}