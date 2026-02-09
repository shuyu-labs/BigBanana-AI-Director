import React from 'react';
import { FileText, Users, Clapperboard, Film, ArrowRight } from 'lucide-react';
import { WORKFLOW_STEPS } from './constants';

interface WorkflowPageProps {
  onNext: () => void;
}

const icons = [FileText, Users, Clapperboard, Film];

const WorkflowPage: React.FC<WorkflowPageProps> = ({ onNext }) => {
  return (
    <div className="flex flex-col items-center text-center">
      {/* 标题 */}
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8">
        四步出片，就这么简单
      </h2>

      {/* 流程图示意 */}
      <div className="w-full max-w-md mb-10">
        <div className="flex items-center justify-between mb-6">
          {WORKFLOW_STEPS.map((step, index) => {
            const Icon = icons[index];
            return (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center mb-2">
                    <Icon className="w-5 h-5 text-[var(--accent-text)]" />
                  </div>
                  <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{step.number}</span>
                </div>
                {index < WORKFLOW_STEPS.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* 步骤说明列表 */}
        <div className="space-y-3 text-left">
          {WORKFLOW_STEPS.map((step, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 bg-[var(--nav-hover-bg)] border border-[var(--border-primary)] rounded-lg px-4 py-3"
            >
              <span className="text-[var(--accent-text)] font-bold text-sm">{step.number}</span>
              <span className="text-[var(--text-primary)] font-medium text-sm">{step.title}</span>
              <span className="text-[var(--text-tertiary)] text-xs">→ {step.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 主按钮 */}
      <button
        onClick={onNext}
        className="px-8 py-3 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-bold text-sm rounded-lg hover:bg-[var(--btn-primary-hover)] transition-all duration-200 transform hover:scale-105"
      >
        继续了解
      </button>
    </div>
  );
};

export default WorkflowPage;
