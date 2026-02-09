import React from 'react';
import { Image as ImageIcon, Video, Trash2 } from 'lucide-react';
import { Shot } from '../../types';

interface ShotCardProps {
  shot: Shot;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDelete?: (shotId: string) => void;
}

const ShotCard: React.FC<ShotCardProps> = ({ shot, index, isActive, onClick, onDelete }) => {
  const sKf = shot.keyframes?.find(k => k.type === 'start');
  const hasImage = !!sKf?.imageUrl;
  const hasVideo = !!shot.interval?.videoUrl;

  // 从shot.id中提取显示编号
  // 例如：shot-1 → "SHOT 001", shot-1-1 → "SHOT 001-1", shot-1-2 → "SHOT 001-2"
  const getShotDisplayNumber = () => {
    const idParts = shot.id.split('-').slice(1); // 移除 "shot" 前缀
    if (idParts.length === 1) {
      // 主镜头：shot-1 → "SHOT 001"
      return `SHOT ${String(idParts[0]).padStart(3, '0')}`;
    } else if (idParts.length === 2) {
      // 子镜头：shot-1-1 → "SHOT 001-1"
      return `SHOT ${String(idParts[0]).padStart(3, '0')}-${idParts[1]}`;
    } else {
      // 降级方案：使用index
      return `SHOT ${String(index + 1).padStart(3, '0')}`;
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`
        group relative flex flex-col bg-[var(--bg-elevated)] border rounded-xl overflow-hidden cursor-pointer transition-all duration-200
        ${isActive ? 'border-[var(--accent)] ring-1 ring-[var(--accent-border)] shadow-xl scale-[0.98]' : 'border-[var(--border-primary)] hover:border-[var(--border-secondary)] hover:shadow-lg'}
      `}
    >
      {/* Header */}
      <div className="px-3 py-2 bg-[var(--bg-surface)] border-b border-[var(--border-primary)] flex justify-between items-center">
        <span className={`font-mono text-[10px] font-bold ${isActive ? 'text-[var(--accent-text)]' : 'text-[var(--text-tertiary)]'}`}>
          {getShotDisplayNumber()}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] px-1.5 py-0.5 bg-[var(--bg-hover)] text-[var(--text-tertiary)] rounded uppercase">
            {shot.cameraMovement}
          </span>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(shot.id);
              }}
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-all opacity-0 group-hover:opacity-100"
              title="删除分镜"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Thumbnail */}
      <div className="aspect-video bg-[var(--bg-elevated)] relative overflow-hidden">
        {hasImage ? (
          <img 
            src={sKf!.imageUrl} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            alt={`Shot ${index + 1}`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)]">
            <ImageIcon className="w-8 h-8 opacity-20" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {hasVideo && (
            <div className="px-2 py-1 bg-[var(--success)] text-[var(--text-primary)] rounded-full text-[9px] font-bold uppercase flex items-center gap-1 shadow-lg">
              <Video className="w-2.5 h-2.5" />
              VIDEO
            </div>
          )}
        </div>

        {!isActive && !hasImage && (
          <div className="absolute inset-0 bg-[var(--bg-base)]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-[var(--text-primary)] text-xs font-mono">点击编辑</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3">
        <p className="text-xs text-[var(--text-tertiary)] line-clamp-2 leading-relaxed">
          {shot.actionSummary}
        </p>
      </div>
    </div>
  );
};

export default ShotCard;
