import React from 'react';
import { Sparkles } from 'lucide-react';
import logoImg from '../../logo.png';

interface WelcomePageProps {
  onNext: () => void;
  onSkip: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onNext, onSkip }) => {
  return (
    <div className="flex flex-col items-center text-center">
      {/* 大图区域：Logo + 装饰 */}
      <div className="relative mb-8">
        <div className="absolute -inset-8 bg-[var(--accent-bg)] rounded-full blur-3xl opacity-50"></div>
        <img 
          src={logoImg} 
          alt="BigBanana AI Director" 
          className="w-24 h-24 relative z-10"
        />
        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-[var(--warning-text)] animate-pulse" />
      </div>

      {/* 欢迎语 */}
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
        嗨，创作者
      </h1>

      {/* 核心价值 */}
      <p className="text-xl text-[var(--text-secondary)] mb-2">
        把你的故事，变成会动的短剧
      </p>

      {/* 说明文案 */}
      <p className="text-sm text-[var(--text-tertiary)] mb-10 max-w-xs">
        只需一段剧本，AI帮你搞定剩下的一切
      </p>

      {/* 主按钮 */}
      <button
        onClick={onNext}
        className="px-8 py-3 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-bold text-sm rounded-lg hover:bg-[var(--btn-primary-hover)] transition-all duration-200 transform hover:scale-105"
      >
        看看怎么玩
      </button>

      {/* 跳过入口 */}
      <button
        onClick={onSkip}
        className="mt-6 text-xs text-[var(--text-muted)] hover:text-[var(--text-tertiary)] transition-colors"
      >
        稍后了解，直接开始
      </button>
    </div>
  );
};

export default WelcomePage;
