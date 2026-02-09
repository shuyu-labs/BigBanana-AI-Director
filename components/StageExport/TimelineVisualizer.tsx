import React from 'react';
import { Film } from 'lucide-react';
import { Shot } from '../../types';
import { STYLES } from './constants';

interface Props {
  shots: Shot[];
}

const TimelineVisualizer: React.FC<Props> = ({ shots }) => {
  return (
    <div className="mb-10">
      <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-widest mb-2 px-1">
        <span>Sequence Map</span>
        <span>TC 00:00:00:00</span>
      </div>
      <div className={STYLES.timeline.container}>
        {shots.length === 0 ? (
          <div className="w-full flex items-center justify-center text-[var(--text-muted)] text-xs font-mono uppercase tracking-widest">
            <Film className="w-4 h-4 mr-2" />
            No Shots Available
          </div>
        ) : (
          shots.map((shot, idx) => {
            const isDone = !!shot.interval?.videoUrl;
            return (
              <div 
                key={shot.id} 
                className={`${STYLES.timeline.segment} ${
                  isDone ? STYLES.timeline.segmentComplete : STYLES.timeline.segmentIncomplete
                }`}
                title={`Shot ${idx+1}: ${shot.actionSummary}`}
              >
                {/* Mini Progress Bar inside timeline segment */}
                {isDone && <div className="h-full w-full bg-[var(--accent-bg)]"></div>}
                
                {/* Hover Tooltip */}
                <div className={STYLES.timeline.tooltip}>
                  <div className="bg-[var(--bg-base)] text-[var(--text-primary)] text-[10px] px-2 py-1 rounded border border-[var(--border-secondary)] shadow-xl">
                    Shot {idx + 1}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TimelineVisualizer;
