import React from 'react';
import { MapPin } from 'lucide-react';
import { Scene } from '../../types';
import { EditingPrompt, STYLES } from './constants';
import CollapsibleSection from './CollapsibleSection';
import PromptEditor from './PromptEditor';

interface Props {
  scenes: Scene[];
  isExpanded: boolean;
  onToggle: () => void;
  editingPrompt: EditingPrompt;
  onStartEdit: (type: 'scene', id: string, value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onPromptChange: (value: string) => void;
}

const SceneSection: React.FC<Props> = ({
  scenes,
  isExpanded,
  onToggle,
  editingPrompt,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onPromptChange
}) => {
  if (scenes.length === 0) return null;

  return (
    <CollapsibleSection
      title="场景"
      icon={<MapPin className="w-5 h-5" />}
      count={scenes.length}
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      {scenes.map(scene => (
        <div key={scene.id} className={STYLES.card.base}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{scene.location}</h3>
              <p className="text-sm text-[var(--text-tertiary)]">
                {scene.time} · {scene.atmosphere}
              </p>
            </div>
            <button
              onClick={() => onStartEdit('scene', scene.id, scene.visualPrompt || '')}
              className={STYLES.button.edit}
            >
              编辑
            </button>
          </div>

          {editingPrompt?.type === 'scene' && editingPrompt.id === scene.id ? (
            <PromptEditor
              value={editingPrompt.value}
              onChange={onPromptChange}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
              size="large"
            />
          ) : (
            <p className={STYLES.display.base}>
              {scene.visualPrompt || '未设置提示词'}
            </p>
          )}
        </div>
      ))}
    </CollapsibleSection>
  );
};

export default SceneSection;
