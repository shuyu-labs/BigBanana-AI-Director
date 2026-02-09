import React from 'react';
import { Aperture, Edit2, Check, X, UserPlus } from 'lucide-react';
import { Shot, Character, ScriptData } from '../../types';
import InlineEditor from './InlineEditor';
import { STYLES } from './constants';

interface Props {
  shot: Shot;
  shotNumber: number;
  scriptData?: ScriptData;
  editingShotId: string | null;
  editingShotPrompt: string;
  editingShotCharactersId: string | null;
  editingShotActionId: string | null;
  editingShotActionText: string;
  editingShotDialogueText: string;
  onEditPrompt: (shotId: string, prompt: string) => void;
  onSavePrompt: () => void;
  onCancelPrompt: () => void;
  onEditCharacters: (shotId: string) => void;
  onAddCharacter: (shotId: string, charId: string) => void;
  onRemoveCharacter: (shotId: string, charId: string) => void;
  onCloseCharactersEdit: () => void;
  onEditAction: (shotId: string, action: string, dialogue: string) => void;
  onSaveAction: () => void;
  onCancelAction: () => void;
}

const ShotRow: React.FC<Props> = ({
  shot,
  shotNumber,
  scriptData,
  editingShotId,
  editingShotPrompt,
  editingShotCharactersId,
  editingShotActionId,
  editingShotActionText,
  editingShotDialogueText,
  onEditPrompt,
  onSavePrompt,
  onCancelPrompt,
  onEditCharacters,
  onAddCharacter,
  onRemoveCharacter,
  onCloseCharactersEdit,
  onEditAction,
  onSaveAction,
  onCancelAction
}) => {
  // 从shot.id中提取显示编号
  // 例如：shot-1 → "SHOT 001", shot-1-1 → "SHOT 001-1"
  const getShotDisplayNumber = () => {
    const idParts = shot.id.split('-').slice(1); // 移除 "shot" 前缀
    if (idParts.length === 1) {
      // 主镜头：shot-1 → "SHOT 001"
      return `SHOT ${String(idParts[0]).padStart(3, '0')}`;
    } else if (idParts.length === 2) {
      // 子镜头：shot-1-1 → "SHOT 001-1"
      return `SHOT ${String(idParts[0]).padStart(3, '0')}-${idParts[1]}`;
    } else {
      // 降级方案：使用传入的shotNumber
      return `SHOT ${shotNumber.toString().padStart(3, '0')}`;
    }
  };

  return (
    <div className="group bg-[var(--bg-base)] hover:bg-[var(--bg-primary)] transition-colors p-8 flex gap-8">
      {/* Shot ID & Tech Data */}
      <div className="w-32 flex-shrink-0 flex flex-col gap-4">
        <div className="text-xs font-mono text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors">
          {getShotDisplayNumber()}
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border-primary)] text-[10px] font-mono text-[var(--text-tertiary)] uppercase text-center rounded">
            {shot.shotSize || 'MED'}
          </div>
          <div className="px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border-primary)] text-[10px] font-mono text-[var(--text-tertiary)] uppercase text-center rounded">
            {shot.cameraMovement}
          </div>
        </div>
      </div>

      {/* Main Action */}
      <div className="flex-1 space-y-4">
        {editingShotActionId === shot.id ? (
          <div className="space-y-3 p-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">动作描述</label>
              <textarea
                value={editingShotActionText}
                onChange={(e) => onEditAction(shot.id, e.target.value, editingShotDialogueText)}
                className={STYLES.editor.textarea}
                rows={3}
                placeholder="输入动作描述..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">台词（可选）</label>
              <textarea
                value={editingShotDialogueText}
                onChange={(e) => onEditAction(shot.id, editingShotActionText, e.target.value)}
                className={`${STYLES.editor.textarea} ${STYLES.editor.serif}`}
                rows={2}
                placeholder="输入台词（留空表示无台词）..."
              />
            </div>
            
            <div className="flex gap-2 pt-2 border-t border-[var(--border-primary)]">
              <button onClick={onSaveAction} className="px-3 py-1.5 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-xs font-bold rounded flex items-center gap-1 hover:bg-[var(--btn-primary-hover)] transition-colors">
                <Check className="w-3 h-3" />
                保存
              </button>
              <button onClick={onCancelAction} className="px-3 py-1.5 bg-[var(--bg-hover)] text-[var(--text-tertiary)] text-xs font-bold rounded flex items-center gap-1 hover:bg-[var(--border-secondary)] transition-colors">
                <X className="w-3 h-3" />
                取消
              </button>
            </div>
          </div>
        ) : (
          <div className="relative group/action">
            <div className="flex items-start gap-2">
              <p className="text-[var(--text-secondary)] text-sm leading-7 font-medium max-w-2xl flex-1">
                {shot.actionSummary}
              </p>
              <button
                onClick={() => onEditAction(shot.id, shot.actionSummary, shot.dialogue || '')}
                className="opacity-0 group-hover/action:opacity-100 transition-opacity p-1.5 hover:bg-[var(--bg-hover)] rounded flex-shrink-0"
                title="编辑动作和台词"
              >
                <Edit2 className="w-3.5 h-3.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" />
              </button>
            </div>
            
            {shot.dialogue && (
              <div className="pl-6 border-l-2 border-[var(--border-primary)] group-hover:border-[var(--border-secondary)] transition-colors py-1 mt-3">
                <p className="text-[var(--text-tertiary)] font-serif italic text-sm">"{shot.dialogue}"</p>
              </div>
            )}
          </div>
        )}
        
        {/* Characters */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">角色</span>
            <button
              onClick={() => onEditCharacters(shot.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[var(--bg-hover)] rounded"
              title="编辑角色列表"
            >
              <Edit2 className="w-3 h-3 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" />
            </button>
          </div>
          
          {editingShotCharactersId === shot.id ? (
            <div className="space-y-3 p-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg">
              <div className="space-y-2">
                <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">当前角色</div>
                <div className="flex flex-wrap gap-2">
                  {shot.characters.length === 0 ? (
                    <span className="text-xs text-[var(--text-muted)] italic">无角色</span>
                  ) : (
                    shot.characters.map(cid => {
                      const char = scriptData?.characters.find(c => c.id === cid);
                      return char ? (
                        <div key={cid} className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] border border-[var(--border-secondary)] px-2 py-1 rounded-md bg-[var(--bg-elevated)]">
                          <span>{char.name}</span>
                          <button
                            onClick={() => onRemoveCharacter(shot.id, cid)}
                            className="ml-1 hover:text-[var(--error-text)] transition-colors"
                            title="移除角色"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : null;
                    })
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">添加角色</div>
                <div className="flex flex-wrap gap-2">
                  {scriptData?.characters
                    .filter(char => !shot.characters.includes(char.id))
                    .map(char => (
                      <button
                        key={char.id}
                        onClick={() => onAddCharacter(shot.id, char.id)}
                        className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[var(--text-tertiary)] border border-[var(--border-primary)] px-2 py-1 rounded-md bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] hover:border-[var(--border-secondary)] transition-colors"
                        title="添加角色"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>{char.name}</span>
                      </button>
                    ))}
                  {scriptData?.characters.filter(char => !shot.characters.includes(char.id)).length === 0 && (
                    <span className="text-xs text-[var(--text-muted)] italic">所有角色已添加</span>
                  )}
                </div>
              </div>
              
              <div className="pt-2 border-t border-[var(--border-primary)]">
                <button
                  onClick={onCloseCharactersEdit}
                  className="px-3 py-1.5 bg-[var(--bg-hover)] text-[var(--text-secondary)] text-xs font-bold rounded flex items-center gap-1 hover:bg-[var(--border-secondary)] transition-colors"
                >
                  <Check className="w-3 h-3" />
                  完成
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
              {shot.characters.length === 0 ? (
                <span className="text-[10px] text-[var(--text-muted)] italic">无角色</span>
              ) : (
                shot.characters.map(cid => {
                  const char = scriptData?.characters.find(c => c.id === cid);
                  return char ? (
                    <span key={cid} className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-tertiary)] border border-[var(--border-primary)] px-2 py-0.5 rounded-full bg-[var(--bg-elevated)]">
                      {char.name}
                    </span>
                  ) : null;
                })
              )}
            </div>
          )}
        </div>

        {/* Mobile Prompt Editor */}
        <div className="xl:hidden pt-4 border-t border-[var(--border-subtle)]">
          <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 flex items-center gap-2 justify-between">
            <span className="flex items-center gap-2">
              <Aperture className="w-3 h-3" /> 画面提示词
            </span>
            {editingShotId !== shot.id && (
              <button
                onClick={() => onEditPrompt(shot.id, shot.keyframes[0]?.visualPrompt || '')}
                className="p-1.5 bg-[var(--bg-hover)] hover:bg-[var(--border-secondary)] rounded transition-colors"
                title="编辑提示词"
              >
                <Edit2 className="w-3 h-3 text-[var(--text-tertiary)]" />
              </button>
            )}
          </div>
          <InlineEditor
            isEditing={editingShotId === shot.id}
            value={editingShotId === shot.id ? editingShotPrompt : shot.keyframes[0]?.visualPrompt || ''}
            onEdit={() => onEditPrompt(shot.id, shot.keyframes[0]?.visualPrompt || '')}
            onChange={(val) => onEditPrompt(shot.id, val)}
            onSave={onSavePrompt}
            onCancel={onCancelPrompt}
            placeholder="输入画面提示词..."
            rows={6}
            mono={true}
            showEditButton={false}
          />
        </div>
      </div>

      {/* Prompt Preview (Desktop) */}
      <div className="w-64 hidden xl:block pl-6 border-l border-[var(--border-subtle)]">
        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 flex items-center gap-2 justify-between">
          <span className="flex items-center gap-2">
            <Aperture className="w-3 h-3" /> 画面提示词
          </span>
          {editingShotId !== shot.id && (
            <button
              onClick={() => onEditPrompt(shot.id, shot.keyframes[0]?.visualPrompt || '')}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[var(--bg-hover)] rounded"
              title="编辑提示词"
            >
              <Edit2 className="w-3 h-3 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" />
            </button>
          )}
        </div>
        <InlineEditor
          isEditing={editingShotId === shot.id}
          value={editingShotId === shot.id ? editingShotPrompt : shot.keyframes[0]?.visualPrompt || ''}
          onEdit={() => onEditPrompt(shot.id, shot.keyframes[0]?.visualPrompt || '')}
          onChange={(val) => onEditPrompt(shot.id, val)}
          onSave={onSavePrompt}
          onCancel={onCancelPrompt}
          placeholder="输入画面提示词..."
          rows={8}
          mono={true}
          showEditButton={false}
        />
      </div>
    </div>
  );
};

export default ShotRow;
