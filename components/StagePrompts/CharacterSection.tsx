import React from 'react';
import { User } from 'lucide-react';
import { Character } from '../../types';
import { EditingPrompt, STYLES } from './constants';
import CollapsibleSection from './CollapsibleSection';
import PromptEditor from './PromptEditor';

interface Props {
  characters: Character[];
  isExpanded: boolean;
  onToggle: () => void;
  editingPrompt: EditingPrompt;
  onStartEdit: (type: 'character' | 'character-variation', id: string, value: string, variationId?: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onPromptChange: (value: string) => void;
}

const CharacterSection: React.FC<Props> = ({
  characters,
  isExpanded,
  onToggle,
  editingPrompt,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onPromptChange
}) => {
  if (characters.length === 0) return null;

  return (
    <CollapsibleSection
      title="角色"
      icon={<User className="w-5 h-5" />}
      count={characters.length}
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      {characters.map(char => (
        <div key={char.id} className={STYLES.card.base}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{char.name}</h3>
              <p className="text-sm text-[var(--text-tertiary)]">
                {char.gender} · {char.age} · {char.personality}
              </p>
            </div>
            <button
              onClick={() => onStartEdit('character', char.id, char.visualPrompt || '')}
              className={STYLES.button.edit}
            >
              编辑
            </button>
          </div>

          {editingPrompt?.type === 'character' && editingPrompt.id === char.id ? (
            <PromptEditor
              value={editingPrompt.value}
              onChange={onPromptChange}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
              size="large"
            />
          ) : (
            <p className={STYLES.display.base}>
              {char.visualPrompt || '未设置提示词'}
            </p>
          )}

          {/* Character Variations */}
          {char.variations && char.variations.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-[var(--border-primary)] space-y-3">
              <h4 className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-bold">角色变体</h4>
              {char.variations.map(variation => (
                <div key={variation.id} className={STYLES.card.nested}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[var(--text-secondary)]">{variation.name}</span>
                    <button
                      onClick={() => onStartEdit('character-variation', char.id, variation.visualPrompt, variation.id)}
                      className={STYLES.button.editSmall}
                    >
                      编辑
                    </button>
                  </div>

                  {editingPrompt?.type === 'character-variation' && 
                   editingPrompt.id === char.id && 
                   editingPrompt.variationId === variation.id ? (
                    <PromptEditor
                      value={editingPrompt.value}
                      onChange={onPromptChange}
                      onSave={onSaveEdit}
                      onCancel={onCancelEdit}
                      size="small"
                    />
                  ) : (
                    <p className={STYLES.display.small}>
                      {variation.visualPrompt}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </CollapsibleSection>
  );
};

export default CharacterSection;
