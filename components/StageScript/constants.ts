/**
 * StageScript 配置常量
 */

export const DURATION_OPTIONS = [
  { label: '30秒 (广告)', value: '30s' },
  { label: '60秒 (预告)', value: '60s' },
  { label: '2分钟 (片花)', value: '120s' },
  { label: '5分钟 (短片)', value: '300s' },
  { label: '自定义', value: 'custom' }
];

export const LANGUAGE_OPTIONS = [
  { label: '中文 (Chinese)', value: '中文' },
  { label: 'English (US)', value: 'English' },
  { label: '日本語 (Japanese)', value: 'Japanese' },
  { label: 'Français (French)', value: 'French' },
  { label: 'Español (Spanish)', value: 'Spanish' }
];

export const MODEL_OPTIONS = [
  { label: 'GPT-5.1 (推荐)', value: 'gpt-5.1' },
  { label: 'GPT-5.2', value: 'gpt-5.2' },
  { label: 'GPT-4.1', value: 'gpt-41' },
  { label: 'Claude Sonnet 4.5', value: 'claude-sonnet-4-5-20250929' },
  { label: '其他 (自定义)', value: 'custom' }
];

export const VISUAL_STYLE_OPTIONS = [
  { label: '🌟 日式动漫', value: 'anime', desc: '日本动漫风格，线条感强' },
  { label: '🎨 2D动画', value: '2d-animation', desc: '经典卓别林/迪士尼风格' },
  { label: '👾 3D动画', value: '3d-animation', desc: '皮克斯/梦工厂风格' },
  { label: '🌌 赛博朋克', value: 'cyberpunk', desc: '高科技赛博朋克风' },
  { label: '🖼️ 油画风格', value: 'oil-painting', desc: '油画质感艺术风' },
  { label: '🎬 真人影视', value: 'live-action', desc: '超写实电影/电视剧风格' },
  { label: '✨ 其他 (自定义)', value: 'custom', desc: '手动输入风格' }
];

export const STYLES = {
  input: 'w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] text-[var(--text-primary)] px-3 py-2.5 text-sm rounded-md focus:border-[var(--border-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--border-secondary)] transition-all placeholder:text-[var(--text-muted)]',
  label: 'text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest',
  select: 'w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] text-[var(--text-primary)] px-3 py-2.5 text-sm rounded-md appearance-none focus:border-[var(--border-secondary)] focus:outline-none transition-all cursor-pointer',
  button: {
    primary: 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)] shadow-lg shadow-[var(--btn-primary-shadow)]',
    secondary: 'bg-transparent border-[var(--border-primary)] text-[var(--text-tertiary)] hover:border-[var(--border-secondary)] hover:text-[var(--text-secondary)]',
    selected: 'bg-[var(--accent-bg-hover)] text-[var(--text-primary)] border-[var(--accent-border)] shadow-sm ring-1 ring-[var(--accent-border)]',
    disabled: 'bg-[var(--bg-hover)] text-[var(--text-tertiary)] cursor-not-allowed'
  },
  editor: {
    textarea: 'w-full bg-[var(--bg-surface)] border border-[var(--border-secondary)] text-[var(--text-secondary)] px-3 py-2 text-sm rounded-md focus:border-[var(--border-primary)] focus:outline-none resize-none',
    mono: 'font-mono',
    serif: 'font-serif italic'
  }
};

export const DEFAULTS = {
  duration: '60s',
  language: '中文',
  model: 'gpt-5.1',
  visualStyle: 'live-action'
};
