import React from 'react';
import { MapPin } from 'lucide-react';
import { Scene } from '../../types';

interface Props {
  scenes: Scene[];
}

const SceneList: React.FC<Props> = ({ scenes }) => {
  return (
    <section>
      <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
        <MapPin className="w-3 h-3" /> 场景列表
      </h3>
      <div className="space-y-1">
        {scenes.map((s) => (
          <div key={s.id} className="flex items-center gap-3 text-xs text-[var(--text-tertiary)] group cursor-default p-2 rounded hover:bg-[var(--nav-hover-bg)] transition-colors">
            <div className="w-1.5 h-1.5 bg-[var(--border-secondary)] rounded-full group-hover:bg-[var(--text-tertiary)] transition-colors"></div>
            <span className="truncate group-hover:text-[var(--text-secondary)]">{s.location}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SceneList;
