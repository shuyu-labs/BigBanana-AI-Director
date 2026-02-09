/**
 * StagePrompts 配置常量
 */

export const STYLES = {
  card: {
    base: 'bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg p-4',
    nested: 'bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded p-3'
  },
  button: {
    edit: 'text-xs text-[var(--accent-text)] hover:text-[var(--accent-text-hover)] px-3 py-1 border border-[var(--accent-border)] rounded hover:bg-[var(--accent-bg)] transition-colors',
    editSmall: 'text-xs text-[var(--accent-text)] hover:text-[var(--accent-text-hover)] px-2 py-0.5 border border-[var(--accent-border)] rounded hover:bg-[var(--accent-bg)] transition-colors',
    editVideo: 'text-xs text-[var(--accent-text)] hover:text-[var(--accent-text-hover)] px-2 py-0.5 border border-[var(--accent-border)] rounded hover:bg-[var(--accent-bg)] transition-colors',
    save: 'flex items-center gap-1 px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] text-xs rounded transition-colors',
    saveSmall: 'flex items-center gap-1 px-2 py-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] text-xs rounded transition-colors',
    saveVideo: 'flex items-center gap-1 px-2 py-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-on)] text-xs rounded transition-colors',
    cancel: 'flex items-center gap-1 px-3 py-1.5 bg-[var(--border-secondary)] hover:bg-[var(--border-primary)] text-[var(--text-primary)] text-xs rounded transition-colors',
    cancelSmall: 'flex items-center gap-1 px-2 py-1 bg-[var(--border-secondary)] hover:bg-[var(--border-primary)] text-[var(--text-primary)] text-xs rounded transition-colors'
  },
  textarea: {
    base: 'w-full bg-[var(--bg-hover)] text-[var(--text-primary)] rounded border border-[var(--border-secondary)] focus:border-[var(--accent)] focus:outline-none font-mono',
    large: 'p-3 min-h-[100px] text-sm',
    small: 'p-2 min-h-[80px] text-xs',
    video: 'p-2 min-h-[120px] text-xs'
  },
  display: {
    base: 'text-sm text-[var(--text-tertiary)] bg-[var(--bg-surface)] p-3 rounded border border-[var(--border-primary)] font-mono',
    small: 'text-xs text-[var(--text-tertiary)] font-mono whitespace-pre-wrap'
  },
  badge: {
    shotNumber: 'text-xs font-bold text-[var(--accent-text)] bg-[var(--accent-bg)] px-2 py-0.5 rounded',
    keyframeStart: 'text-xs font-medium px-2 py-0.5 rounded bg-[var(--success-bg)] text-[var(--success-text)] border border-[var(--success-border)]',
    keyframeEnd: 'text-xs font-medium px-2 py-0.5 rounded bg-[var(--info-bg)] text-[var(--info-text)] border border-[var(--info-border)]',
    videoPrompt: 'text-xs font-medium px-2 py-0.5 rounded bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)]'
  }
};

export type PromptCategory = 'characters' | 'scenes' | 'props' | 'keyframes' | 'all';

export type EditingPrompt = {
  type: 'character' | 'character-variation' | 'scene' | 'prop' | 'keyframe' | 'video';
  id: string;
  variationId?: string;
  shotId?: string;
  value: string;
} | null;

export const STATUS_STYLES = {
  completed: 'text-[var(--success-text)] bg-[var(--success-bg)]',
  generating: 'text-[var(--warning-text)] bg-[var(--warning-bg)]',
  failed: 'text-[var(--error-text)] bg-[var(--error-bg)]',
  idle: 'text-[var(--text-tertiary)]'
};

export const STATUS_LABELS = {
  completed: '✓ 已生成',
  generating: '生成中',
  failed: '失败',
  idle: '待生成'
};
