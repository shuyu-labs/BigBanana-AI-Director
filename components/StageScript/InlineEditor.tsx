import React from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { STYLES } from './constants';

interface Props {
  isEditing: boolean;
  value: string;
  displayValue?: string;
  onEdit: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
  italic?: boolean;
  showEditButton?: boolean;
  emptyText?: string;
}

const InlineEditor: React.FC<Props> = ({
  isEditing,
  value,
  displayValue,
  onEdit,
  onChange,
  onSave,
  onCancel,
  placeholder = '输入内容...',
  rows = 6,
  mono = false,
  italic = false,
  showEditButton = true,
  emptyText = '暂无内容'
}) => {
  if (isEditing) {
    return (
      <div className="space-y-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${STYLES.editor.textarea} ${mono ? STYLES.editor.mono : ''} ${italic ? STYLES.editor.serif : ''}`}
          rows={rows}
          placeholder={placeholder}
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="px-3 py-1.5 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-xs font-bold rounded flex items-center gap-1 hover:bg-[var(--btn-primary-hover)] transition-colors"
          >
            <Check className="w-3 h-3" />
            保存
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 bg-[var(--bg-hover)] text-[var(--text-tertiary)] text-xs font-bold rounded flex items-center gap-1 hover:bg-[var(--border-secondary)] transition-colors"
          >
            <X className="w-3 h-3" />
            取消
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 group">
      <p className={`flex-1 text-[10px] text-[var(--text-tertiary)] leading-relaxed ${mono ? 'font-mono' : ''} ${italic ? 'font-serif italic' : ''} ${!displayValue && !value ? 'text-[var(--text-muted)]' : ''}`}>
        {displayValue || value || emptyText}
      </p>
      {showEditButton && (
        <button
          onClick={onEdit}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[var(--bg-hover)] rounded flex-shrink-0"
          title="编辑"
        >
          <Edit2 className="w-3 h-3 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" />
        </button>
      )}
    </div>
  );
};

export default InlineEditor;
