import React from 'react';
import { Plus, RotateCw, BrainCircuit } from 'lucide-react';
import { STYLES } from './constants';

interface Props {
  script: string;
  onChange: (value: string) => void;
  onContinue: () => void;
  onRewrite: () => void;
  isContinuing: boolean;
  isRewriting: boolean;
  lastModified?: string;
}

const ScriptEditor: React.FC<Props> = ({
  script,
  onChange,
  onContinue,
  onRewrite,
  isContinuing,
  isRewriting,
  lastModified
}) => {
  const stats = {
    characters: script.length,
    lines: script.split('\n').length
  };

  const isDisabled = isContinuing || isRewriting || !script.trim();

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-base)] relative">
      {/* Header */}
      <div className="h-14 border-b border-[var(--border-primary)] flex items-center justify-between px-8 bg-[var(--bg-base)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--border-secondary)]"></div>
          <span className="text-xs font-bold text-[var(--text-tertiary)]">剧本编辑器</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onContinue}
            disabled={isDisabled}
            className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all shadow-sm ${
              isDisabled
                ? STYLES.button.disabled
                : STYLES.button.primary
            }`}
          >
            {isContinuing ? (
              <>
                <BrainCircuit className="w-3.5 h-3.5 animate-spin" />
                续写中...
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                AI续写
              </>
            )}
          </button>
          <button
            onClick={onRewrite}
            disabled={isDisabled}
            className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all shadow-sm ${
              isDisabled
                ? STYLES.button.disabled
                : STYLES.button.primary
            }`}
          >
            {isRewriting ? (
              <>
                <BrainCircuit className="w-3.5 h-3.5 animate-spin" />
                改写中...
              </>
            ) : (
              <>
                <RotateCw className="w-3.5 h-3.5" />
                AI改写
              </>
            )}
          </button>
          <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">MARKDOWN SUPPORTED</span>
        </div>
      </div>
      
      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-5xl mx-auto h-full flex flex-col py-12 px-8">
          <textarea
            value={script}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-transparent text-[var(--text-secondary)] font-serif text-lg leading-loose focus:outline-none resize-none placeholder:text-[var(--text-muted)] selection:bg-[var(--bg-hover)]"
            placeholder="在此输入故事大纲或直接粘贴剧本..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Status Footer */}
      <div className="h-8 border-t border-[var(--border-subtle)] bg-[var(--bg-base)] px-4 flex items-center justify-end gap-4 text-[10px] text-[var(--text-muted)] font-mono select-none">
        <span>{stats.characters} 字符</span>
        <span>{stats.lines} 行</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--border-primary)]"></div>
          {lastModified ? '已自动保存' : '准备就绪'}
        </div>
      </div>
    </div>
  );
};

export default ScriptEditor;
