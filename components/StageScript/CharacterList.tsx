import React from 'react';
import { Users, Edit2 } from 'lucide-react';
import { Character } from '../../types';
import InlineEditor from './InlineEditor';

interface Props {
  characters: Character[];
  editingCharacterId: string | null;
  editingPrompt: string;
  onEdit: (charId: string, prompt: string) => void;
  onSave: (charId: string, prompt: string) => void;
  onCancel: () => void;
}

const CharacterList: React.FC<Props> = ({
  characters,
  editingCharacterId,
  editingPrompt,
  onEdit,
  onSave,
  onCancel
}) => {
  return (
    <section>
      <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
        <Users className="w-3 h-3" /> 演员表
      </h3>
      <div className="space-y-3">
        {characters.map(c => (
          <div key={c.id} className="group cursor-default p-3 rounded-lg hover:bg-[var(--nav-hover-bg)] transition-colors border border-transparent hover:border-[var(--border-primary)]">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-[var(--text-secondary)] font-medium group-hover:text-[var(--text-primary)]">{c.name}</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">{c.gender}</span>
                </div>
                <InlineEditor
                  isEditing={editingCharacterId === c.id}
                  value={editingCharacterId === c.id ? editingPrompt : c.visualPrompt || ''}
                  displayValue={c.visualPrompt}
                  onEdit={() => onEdit(c.id, c.visualPrompt || '')}
                  onChange={(val) => onEdit(c.id, val)}
                  onSave={() => onSave(c.id, editingPrompt)}
                  onCancel={onCancel}
                  placeholder="输入角色视觉描述..."
                  rows={6}
                  mono={true}
                  emptyText="暂无视觉描述"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CharacterList;
