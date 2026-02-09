import React from 'react';
import { Package } from 'lucide-react';
import { Prop } from '../../types';
import { EditingPrompt, STYLES } from './constants';
import CollapsibleSection from './CollapsibleSection';
import PromptEditor from './PromptEditor';

interface Props {
  props: Prop[];
  isExpanded: boolean;
  onToggle: () => void;
  editingPrompt: EditingPrompt;
  onStartEdit: (type: 'prop', id: string, value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onPromptChange: (value: string) => void;
}

const PropSection: React.FC<Props> = ({
  props,
  isExpanded,
  onToggle,
  editingPrompt,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onPromptChange
}) => {
  if (props.length === 0) return null;

  return (
    <CollapsibleSection
      title="道具"
      icon={<Package className="w-5 h-5" />}
      count={props.length}
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      {props.map(prop => (
        <div key={prop.id} className={STYLES.card.base}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{prop.name}</h3>
              <p className="text-sm text-[var(--text-tertiary)]">
                {prop.category}{prop.description ? ` · ${prop.description}` : ''}
              </p>
            </div>
            <button
              onClick={() => onStartEdit('prop', prop.id, prop.visualPrompt || '')}
              className={STYLES.button.edit}
            >
              编辑
            </button>
          </div>

          {editingPrompt?.type === 'prop' && editingPrompt.id === prop.id ? (
            <PromptEditor
              value={editingPrompt.value}
              onChange={onPromptChange}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
              size="large"
            />
          ) : (
            <p className={STYLES.display.base}>
              {prop.visualPrompt || '未设置提示词'}
            </p>
          )}
        </div>
      ))}
    </CollapsibleSection>
  );
};

export default PropSection;
