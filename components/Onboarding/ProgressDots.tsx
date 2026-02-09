import React from 'react';
import { TOTAL_PAGES } from './constants';

interface ProgressDotsProps {
  currentPage: number;
  onPageChange: (page: number) => void;
}

const ProgressDots: React.FC<ProgressDotsProps> = ({ currentPage, onPageChange }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: TOTAL_PAGES }, (_, index) => (
        <button
          key={index}
          onClick={() => onPageChange(index)}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            index === currentPage
              ? 'bg-[var(--btn-primary-bg)] scale-125'
              : 'bg-[var(--border-secondary)] hover:bg-[var(--border-secondary)]'
          }`}
          aria-label={`跳转到第 ${index + 1} 页`}
        />
      ))}
    </div>
  );
};

export default ProgressDots;
