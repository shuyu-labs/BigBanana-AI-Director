import React from 'react';
import { Loader2, Edit2, Upload, ArrowRight, ArrowLeft, Sparkles, Wand2 } from 'lucide-react';
import { Keyframe } from '../../types';

interface KeyframeEditorProps {
  startKeyframe?: Keyframe;
  endKeyframe?: Keyframe;
  showEndFrame?: boolean;
  canCopyPrevious: boolean;
  canCopyNext: boolean; // 是否可以复制下一镜头的首帧（需要有下一个镜头且已生成首帧）
  isAIOptimizing?: boolean;
  useAIEnhancement: boolean;
  onToggleAIEnhancement: () => void;
  onGenerateKeyframe: (type: 'start' | 'end') => void;
  onUploadKeyframe: (type: 'start' | 'end') => void;
  onEditPrompt: (type: 'start' | 'end', prompt: string) => void;
  onOptimizeWithAI: (type: 'start' | 'end') => void;
  onOptimizeBothWithAI: () => void;
  onCopyPrevious: () => void;
  onCopyNext: () => void; // 复制下一镜头首帧到当前尾帧
  onImageClick: (url: string, title: string) => void;
}

const KeyframeEditor: React.FC<KeyframeEditorProps> = ({
  startKeyframe,
  endKeyframe,
  showEndFrame = true,
  canCopyPrevious,
  canCopyNext,
  isAIOptimizing = false,
  useAIEnhancement,
  onToggleAIEnhancement,
  onGenerateKeyframe,
  onUploadKeyframe,
  onEditPrompt,
  onOptimizeWithAI,
  onOptimizeBothWithAI,
  onCopyPrevious,
  onCopyNext,
  onImageClick
}) => {
  const renderKeyframePanel = (
    type: 'start' | 'end',
    label: string,
    keyframe?: Keyframe
  ) => {
    const isGenerating = keyframe?.status === 'generating';
    const hasFailed = keyframe?.status === 'failed';
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
            {label}
          </label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onOptimizeWithAI(type)}
              disabled={isAIOptimizing}
              className="p-1 text-[var(--accent-text)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="AI优化提示词"
            >
              {isAIOptimizing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
            </button>
            {keyframe?.visualPrompt && (
              <button
                onClick={() => onEditPrompt(type, keyframe.visualPrompt!)}
                className="p-1 text-[var(--warning-text)] hover:text-[var(--text-primary)] transition-colors"
                title="编辑提示词"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        
        <div className="aspect-video bg-[var(--bg-base)] rounded-lg border border-[var(--border-primary)] overflow-hidden relative group">
          {keyframe?.imageUrl ? (
            <>
              <img
                src={keyframe.imageUrl}
                className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                onClick={() => onImageClick(keyframe.imageUrl!, `${label} - 关键帧`)}
                alt={label}
              />
              <div className="absolute inset-0 bg-[var(--bg-base)]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="text-[var(--text-primary)] text-xs font-mono">点击预览</span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-muted)] p-2">
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin mb-2 text-[var(--accent)]" />
                  <span className="text-[10px] text-[var(--text-tertiary)]">生成中...</span>
                </>
              ) : hasFailed ? (
                <>
                  <span className="text-[10px] text-[var(--error)] mb-2">生成失败</span>
                  <button
                    onClick={() => onGenerateKeyframe(type)}
                    className="px-2 py-1 bg-[var(--error-bg)] text-[var(--error-text)] hover:bg-[var(--error-hover-bg-strong)] rounded text-[9px] font-bold transition-colors border border-[var(--error-border)]"
                  >
                    重试
                  </button>
                </>
              ) : (
                <span className="text-[10px] text-center">未生成</span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isGenerating && (
            <>
              <button
                onClick={() => onGenerateKeyframe(type)}
                disabled={isGenerating}
                className="flex-1 py-1.5 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {keyframe?.imageUrl ? '重新生成' : '生成'}
              </button>
              <button
                onClick={() => onUploadKeyframe(type)}
                className="flex-1 py-1.5 bg-[var(--bg-hover)] hover:bg-[var(--border-secondary)] text-[var(--text-secondary)] rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
              >
                <Upload className="w-3 h-3" />
                上传
              </button>
            </>
          )}
        </div>

        {/* Copy Previous Button for Start Frame */}
        {type === 'start' && canCopyPrevious && !keyframe?.imageUrl && (
          <button
            onClick={onCopyPrevious}
            className="w-full py-1.5 bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 border border-[var(--border-secondary)]"
          >
            <ArrowRight className="w-3 h-3" />
            复制上一镜头尾帧
          </button>
        )}

        {/* Copy Next Button for End Frame */}
        {type === 'end' && canCopyNext && !keyframe?.imageUrl && (
          <button
            onClick={onCopyNext}
            className="w-full py-1.5 bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 border border-[var(--border-secondary)]"
          >
            <ArrowLeft className="w-3 h-3" />
            复制下一镜头首帧
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-[var(--border-primary)] pb-2">
        <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest flex-1">
          视觉制作 (Visual Production)
        </span>
        
        {/* AI 增强开关 */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--text-tertiary)]">
            AI增强提示词
          </span>
          <button
            onClick={onToggleAIEnhancement}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              useAIEnhancement ? 'bg-[var(--accent)]' : 'bg-[var(--border-secondary)]'
            }`}
            title={useAIEnhancement ? '关闭AI增强：使用基础提示词快速生成' : '开启AI增强：自动扩展为专业电影级描述'}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-[var(--btn-primary-bg)] transition-transform ${
                useAIEnhancement ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        {/* 一次性优化两帧按钮 */}
        {showEndFrame && (
          <button
            onClick={onOptimizeBothWithAI}
            disabled={isAIOptimizing}
            className="px-3 py-1.5 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            title="AI一次性优化起始帧和结束帧（推荐）"
          >
            {isAIOptimizing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>优化中...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3 h-3" />
                <span>AI优化两帧</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className={`grid gap-4 ${showEndFrame ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {renderKeyframePanel('start', '起始帧', startKeyframe)}
        {showEndFrame && renderKeyframePanel('end', '结束帧', endKeyframe)}
      </div>
    </div>
  );
};

export default KeyframeEditor;
