import React from 'react';
import { FileText, Users, Clapperboard, Film, ChevronLeft, ListTree, HelpCircle, Cpu, Sun, Moon, Loader2 } from 'lucide-react';
import logoImg from '../logo.png';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  currentStage: string;
  setStage: (stage: 'script' | 'assets' | 'director' | 'export' | 'prompts') => void;
  onExit: () => void;
  projectName?: string;
  onShowOnboarding?: () => void;
  onShowModelConfig?: () => void;
  isNavigationLocked?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentStage, setStage, onExit, projectName, onShowOnboarding, onShowModelConfig, isNavigationLocked }) => {
  const { theme, toggleTheme } = useTheme();
  const navItems = [
    { id: 'script', label: '剧本与故事', icon: FileText, sub: 'Phase 01' },
    { id: 'assets', label: '角色与场景', icon: Users, sub: 'Phase 02' },
    { id: 'director', label: '导演工作台', icon: Clapperboard, sub: 'Phase 03' },
    { id: 'export', label: '成片与导出', icon: Film, sub: 'Phase 04' },
    { id: 'prompts', label: '提示词管理', icon: ListTree, sub: 'Advanced' },
  ];

  return (
    <aside className="w-72 bg-[var(--bg-base)] border-r border-[var(--border-primary)] h-screen fixed left-0 top-0 flex flex-col z-50 select-none">
      {/* Header */}
      <div className="p-6 border-b border-[var(--border-subtle)]">
        <a 
          href="https://tree456.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 mb-6 group cursor-pointer"
        >
          <img src={logoImg} alt="Logo" className="w-8 h-8 flex-shrink-0 transition-transform group-hover:scale-110" />
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-[var(--text-primary)] tracking-wider group-hover:text-[var(--text-secondary)] transition-colors">BigBanana</h1>
            <p className="text-[10px] text-[var(--text-tertiary)] tracking-widest group-hover:text-[var(--text-secondary)] transition-colors">Studio Pro</p>
          </div>
        </a>

        <button 
          onClick={onExit}
          className={`flex items-center gap-2 transition-colors text-xs font-mono uppercase tracking-wide group ${
            isNavigationLocked 
              ? 'text-[var(--text-muted)] opacity-50 cursor-not-allowed' 
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
          }`}
          title={isNavigationLocked ? '生成任务进行中，退出将导致数据丢失' : undefined}
        >
          <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          返回项目列表
        </button>
      </div>

      {/* Project Status */}
      <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
         <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">当前项目</div>
         <div className="text-sm font-medium text-[var(--text-secondary)] truncate font-mono">{projectName || '未命名项目'}</div>
      </div>

      {/* Generation Lock Indicator */}
      {isNavigationLocked && (
        <div className="mx-4 mt-4 px-3 py-2.5 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/30">
          <div className="flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 text-[var(--warning)] animate-spin flex-shrink-0" />
            <span className="text-[10px] font-medium text-[var(--warning)] uppercase tracking-wide">生成任务进行中</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-1 leading-relaxed">
            切换页面将导致数据丢失
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = currentStage === item.id;
          const isLocked = isNavigationLocked && !isActive;
          return (
            <button
              key={item.id}
              onClick={() => setStage(item.id as any)}
              className={`w-full flex items-center justify-between px-6 py-4 transition-all duration-200 group relative border-l-2 ${
                isActive 
                  ? 'border-[var(--text-primary)] bg-[var(--nav-active-bg)] text-[var(--text-primary)]'
                  : isLocked
                    ? 'border-transparent text-[var(--text-muted)] opacity-50 cursor-not-allowed'
                    : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--nav-hover-bg)]'
              }`}
              title={isLocked ? '生成任务进行中，切换页面将导致数据丢失' : undefined}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${isActive ? 'text-[var(--text-primary)]' : isLocked ? 'text-[var(--text-muted)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'}`} />
                <span className="font-medium text-xs tracking-wider uppercase">{item.label}</span>
              </div>
              <span className={`text-[10px] font-mono ${isActive ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-muted)]'}`}>{item.sub}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-[var(--border-subtle)] space-y-4">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-between text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
          title={theme === 'dark' ? '切换亮色主题' : '切换暗色主题'}
        >
          <span className="font-mono text-[10px] uppercase tracking-widest">{theme === 'dark' ? '亮色主题' : '暗色主题'}</span>
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        {onShowOnboarding && (
          <button 
            onClick={onShowOnboarding}
            className="w-full flex items-center justify-between text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
          >
            <span className="font-mono text-[10px] uppercase tracking-widest">新手引导</span>
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
        {onShowModelConfig && (
          <button 
            onClick={onShowModelConfig}
            className="w-full flex items-center justify-between text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
          >
            <span className="font-mono text-[10px] uppercase tracking-widest">模型配置</span>
            <Cpu className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;