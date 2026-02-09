// UI样式常量
export const STYLES = {
  // 容器样式
  mainContainer: "flex flex-col h-full bg-[var(--bg-secondary)] relative overflow-hidden",
  header: "h-16 border-b border-[var(--border-primary)] bg-[var(--bg-elevated)] px-6 flex items-center justify-between shrink-0",
  content: "flex-1 overflow-y-auto p-8 space-y-12",
  
  // 卡片样式
  card: "bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl overflow-hidden flex flex-col group hover:border-[var(--border-secondary)] transition-all hover:shadow-lg",
  cardDark: "bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-primary)]",
  
  // 按钮样式
  primaryButton: "px-4 py-2 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)] rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 shadow-lg shadow-[var(--btn-primary-shadow)]",
  secondaryButton: "px-4 py-2 bg-[var(--bg-surface)] text-[var(--text-tertiary)] border border-[var(--border-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-primary)] rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2",
  iconButton: "p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors",
  smallButton: "px-3 py-1.5 bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--border-secondary)] rounded text-[10px] font-bold transition-all border border-[var(--border-secondary)] flex items-center gap-1",
  
  // 输入框样式
  input: "w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-secondary)]",
  textarea: "w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-secondary)] resize-none",
  
  // 图片容器样式
  imageContainer: "aspect-video bg-[var(--bg-elevated)] relative rounded-lg overflow-hidden cursor-pointer",
  imagePreview: "w-full h-full object-cover",
  
  // 标签样式
  badge: "px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded text-[10px] text-[var(--text-tertiary)] font-mono uppercase",
  
  // 模态框样式
  modalOverlay: "absolute inset-0 z-50 bg-[var(--bg-base)]/95 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200",
  modalContainer: "bg-[var(--bg-surface)] border border-[var(--border-primary)] w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden",
  modalHeader: "h-16 px-8 border-b border-[var(--border-primary)] flex items-center justify-between shrink-0 bg-[var(--bg-elevated)]",
  modalBody: "flex-1 overflow-y-auto p-8",
};

// 网格布局常量
export const GRID_LAYOUTS = {
  cards: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  twoColumn: "grid grid-cols-1 md:grid-cols-2 gap-8",
};

// 默认配置
export const DEFAULTS = {
  language: '中文',
  visualStyle: 'live-action',
  genre: 'Cinematic',
  modelVersion: 'gpt-5.1',
  batchGenerateDelay: 3000, // 批量生成延迟（毫秒）
};

// 地域特征配置
export const REGIONAL_FEATURES = {
  Chinese: {
    character: 'Chinese person, East Asian facial features, Chinese ethnicity, ',
    scene: 'Chinese setting, East Asian architecture and aesthetics, ',
  },
  Japanese: {
    character: 'Japanese person, East Asian facial features, Japanese ethnicity, ',
    scene: 'Japanese setting, Japanese architecture and aesthetics, ',
  },
};

// 语言映射
export const LANGUAGE_MAP: Record<string, keyof typeof REGIONAL_FEATURES> = {
  '中文': 'Chinese',
  'Chinese': 'Chinese',
  '日本語': 'Japanese',
  'Japanese': 'Japanese',
};

// 道具分类
export const PROP_CATEGORIES = [
  { value: '武器', label: '武器' },
  { value: '文件/书信', label: '文件/书信' },
  { value: '食物/饮品', label: '食物/饮品' },
  { value: '交通工具', label: '交通工具' },
  { value: '装饰品', label: '装饰品' },
  { value: '科技设备', label: '科技设备' },
  { value: '自然物品', label: '自然物品' },
  { value: '其他', label: '其他' },
] as const;
