import React, { useState } from 'react';
import { Key, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { verifyApiKey } from '../../services/aiService';

interface ApiKeyPageProps {
  currentApiKey: string;
  onSaveApiKey: (key: string) => void;
  onNext: () => void;
  onSkip: () => void;
}

const ApiKeyPage: React.FC<ApiKeyPageProps> = ({ 
  currentApiKey, 
  onSaveApiKey, 
  onNext,
  onSkip 
}) => {
  const [inputKey, setInputKey] = useState(currentApiKey);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'error'>(
    currentApiKey ? 'success' : 'idle'
  );
  const [verifyMessage, setVerifyMessage] = useState(currentApiKey ? '已配置' : '');

  const handleVerifyAndContinue = async () => {
    if (!inputKey.trim()) {
      setVerifyStatus('error');
      setVerifyMessage('请输入 API Key');
      return;
    }

    setIsVerifying(true);
    setVerifyStatus('idle');

    try {
      const result = await verifyApiKey(inputKey.trim());
      
      if (result.success) {
        setVerifyStatus('success');
        setVerifyMessage('验证成功！');
        onSaveApiKey(inputKey.trim());
        // 短暂延迟后进入下一步
        setTimeout(() => {
          onNext();
        }, 500);
      } else {
        setVerifyStatus('error');
        setVerifyMessage(result.message);
      }
    } catch (error: any) {
      setVerifyStatus('error');
      setVerifyMessage(error.message || '验证出错');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      {/* 图标 */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
          <Key className="w-8 h-8 text-[var(--accent-text)]" />
        </div>
        {verifyStatus === 'success' && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--success)] rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-[var(--text-primary)]" />
          </div>
        )}
      </div>

      {/* 标题 */}
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
        配置你的 API Key
      </h2>

      {/* 说明 */}
      <p className="text-[var(--text-tertiary)] text-sm mb-6 max-w-xs">
        需要 API Key 才能使用 AI 生成功能
      </p>

      {/* 输入框 */}
      <div className="w-full max-w-sm mb-4">
        <input
          type="password"
          value={inputKey}
          onChange={(e) => {
            setInputKey(e.target.value);
            setVerifyStatus('idle');
            setVerifyMessage('');
          }}
          placeholder="输入你的 BigBanana API Key..."
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] text-[var(--text-primary)] px-4 py-3 text-sm rounded-lg focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-hover)] transition-all font-mono placeholder:text-[var(--text-muted)] text-center"
          disabled={isVerifying}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && inputKey.trim() && !isVerifying) {
              handleVerifyAndContinue();
            }
          }}
        />

        {/* 状态提示 */}
        {verifyMessage && (
          <div className={`mt-2 flex items-center justify-center gap-2 text-xs ${
            verifyStatus === 'success' ? 'text-[var(--success-text)]' : 'text-[var(--error-text)]'
          }`}>
            {verifyStatus === 'success' ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            {verifyMessage}
          </div>
        )}
      </div>

      {/* 获取 Key 链接 */}
      <div className="flex items-center gap-4 mb-8">
        <a 
          href="https://api.antsk.cn" 
          target="_blank" 
          rel="noreferrer" 
          className="text-xs text-[var(--accent-text)] hover:underline inline-flex items-center gap-1"
        >
          立即购买 <ExternalLink className="w-3 h-3" />
        </a>
        <span className="text-[var(--text-muted)]">|</span>
        <a 
          href="https://ocnf8yod3ljg.feishu.cn/wiki/MgFVw2EoQieTLKktaf2cHvu6nY3" 
          target="_blank" 
          rel="noreferrer" 
          className="text-xs text-[var(--accent-text)] hover:underline inline-flex items-center gap-1"
        >
          使用教程 <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* 主按钮 */}
      <button
        onClick={handleVerifyAndContinue}
        disabled={isVerifying}
        className="px-8 py-3 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-bold text-sm rounded-lg hover:bg-[var(--btn-primary-hover)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isVerifying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            验证中...
          </>
        ) : (
          '验证并继续'
        )}
      </button>

      {/* 跳过入口 */}
      <button
        onClick={onSkip}
        className="mt-4 text-xs text-[var(--text-muted)] hover:text-[var(--text-tertiary)] transition-colors"
      >
        稍后在设置中配置
      </button>
    </div>
  );
};

export default ApiKeyPage;
