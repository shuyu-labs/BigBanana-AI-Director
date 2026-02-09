import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Props {
  title: string;
  icon: React.ReactNode;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<Props> = ({
  title,
  icon,
  count,
  isExpanded,
  onToggle,
  children
}) => {
  return (
    <div className="mb-8">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 mb-4 text-[var(--text-primary)] hover:text-[var(--accent-text)] transition-colors"
      >
        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        {icon}
        <h2 className="text-xl font-bold">{title} ({count})</h2>
      </button>

      {isExpanded && (
        <div className="space-y-4 ml-7">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
