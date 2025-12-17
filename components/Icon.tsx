import React from 'react';
import { 
  Cross, 
  MoonStar, 
  Star, 
  Flower2, 
  Sparkles, 
  Heart, 
  ArrowRight,
  RefreshCw,
  Copy,
  ChevronLeft,
  BookOpen,
  CheckCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const Icons: Record<string, React.FC<{ className?: string }>> = {
  Cross,
  MoonStar,
  Star,
  Flower2,
  Sparkles,
  Om: Flower2, 
  Heart,
  ArrowRight,
  RefreshCw,
  Copy,
  ChevronLeft,
  BookOpen,
  CheckCircle,
  ExternalLink,
  ShieldCheck
};

interface IconProps {
  name: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className }) => {
  const IconComponent = Icons[name] || Sparkles;
  return <IconComponent className={className} />;
};
