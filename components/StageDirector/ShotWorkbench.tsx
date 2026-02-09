import React from 'react';
import { ChevronLeft, ChevronRight, X, Film, Edit2, MessageSquare, Sparkles, Loader2, Scissors, Grid3x3 } from 'lucide-react';
import { Shot, Character, Scene, Prop, ProjectState, AspectRatio, VideoDuration, NineGridData, NineGridPanel } from '../../types';
import SceneContext from './SceneContext';
import KeyframeEditor from './KeyframeEditor';
import VideoGenerator from './VideoGenerator';

interface ShotWorkbenchProps {
  shot: Shot;
  shotIndex: number;
  totalShots: number;
  scriptData?: ProjectState['scriptData'];
  currentVideoModelId: string;
  nextShotHasStartFrame?: boolean; // 下一个镜头是否有首帧
  isAIOptimizing?: boolean;
  isSplittingShot?: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onEditActionSummary: () => void;
  onGenerateAIAction: () => void;
  onSplitShot: () => void;
  onAddCharacter: (charId: string) => void;
  onRemoveCharacter: (charId: string) => void;
  onVariationChange: (charId: string, varId: string) => void;
  onSceneChange: (sceneId: string) => void;
  onAddProp?: (propId: string) => void;
  onRemoveProp?: (propId: string) => void;
  onGenerateKeyframe: (type: 'start' | 'end') => void;
  onUploadKeyframe: (type: 'start' | 'end') => void;
  onEditKeyframePrompt: (type: 'start' | 'end', prompt: string) => void;
  onOptimizeKeyframeWithAI: (type: 'start' | 'end') => void;
  onOptimizeBothKeyframes: () => void;
  onCopyPreviousEndFrame: () => void;
  onCopyNextStartFrame: () => void;
  useAIEnhancement: boolean;
  onToggleAIEnhancement: () => void;
  onGenerateVideo: (aspectRatio: AspectRatio, duration: VideoDuration, modelId: string) => void;
  onEditVideoPrompt: () => void;
  onVideoModelChange: (modelId: string) => void;
  onImageClick: (url: string, title: string) => void;
  // 九宫格分镜预览（高级功能）
  onGenerateNineGrid: () => void;
  nineGrid?: NineGridData;
  onSelectNineGridPanel: (panel: NineGridPanel) => void;
  onShowNineGrid: () => void;
}

const ShotWorkbench: React.FC<ShotWorkbenchProps> = ({
  shot,
  shotIndex,
  totalShots,
  scriptData,
  currentVideoModelId,
  nextShotHasStartFrame = false,
  isAIOptimizing = false,
  isSplittingShot = false,
  onClose,
  onPrevious,
  onNext,
  onEditActionSummary,
  onGenerateAIAction,
  onSplitShot,
  onAddCharacter,
  onRemoveCharacter,
  onVariationChange,
  onSceneChange,
  onAddProp,
  onRemoveProp,
  onGenerateKeyframe,
  onUploadKeyframe,
  onEditKeyframePrompt,
  onOptimizeKeyframeWithAI,
  onOptimizeBothKeyframes,
  onCopyPreviousEndFrame,
  onCopyNextStartFrame,
  useAIEnhancement,
  onToggleAIEnhancement,
  onGenerateVideo,
  onEditVideoPrompt,
  onVideoModelChange,
  onImageClick,
  onGenerateNineGrid,
  nineGrid,
  onSelectNineGridPanel,
  onShowNineGrid
}) => {
  const scene = scriptData?.scenes.find(s => String(s.id) === String(shot.sceneId));
  const activeCharacters = scriptData?.characters.filter(c => shot.characters.includes(c.id)) || [];
  const availableCharacters = scriptData?.characters.filter(c => !shot.characters.includes(c.id)) || [];
  const activeProps = (scriptData?.props || []).filter(p => (shot.props || []).includes(p.id));
  const availablePropsForShot = (scriptData?.props || []).filter(p => !(shot.props || []).includes(p.id));
  
  const startKf = shot.keyframes?.find(k => k.type === 'start');
  const endKf = shot.keyframes?.find(k => k.type === 'end');
  const normalizedModelId = currentVideoModelId.trim().toLowerCase();
  const showEndFrame = normalizedModelId.startsWith('veo');
  
  // 从shot.id中提取显示编号
  const getShotDisplayNumber = () => {
    const idParts = shot.id.split('-').slice(1); // 移除 "shot" 前缀
    if (idParts.length === 1) {
      // 主镜头：shot-1 → "01"
      return String(idParts[0]).padStart(2, '0');
    } else if (idParts.length === 2) {
      // 子镜头：shot-1-1 → "01-1"
      return `${String(idParts[0]).padStart(2, '0')}-${idParts[1]}`;
    } else {
      // 降级方案：使用shotIndex
      return String(shotIndex + 1).padStart(2, '0');
    }
  };
  
  return (
    <div className="w-[480px] bg-[var(--bg-deep)] flex flex-col h-full shadow-2xl animate-in slide-in-from-right-10 duration-300 relative z-20">
      {/* Header */}
      <div className="h-16 px-6 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-surface)] shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
          <span className="min-w-[3rem] h-8 px-2 bg-[var(--accent-bg)] text-[var(--accent-text)] rounded-lg flex items-center justify-center font-bold font-mono text-[11px] whitespace-nowrap border border-[var(--accent-border)] shrink-0">
            {getShotDisplayNumber()}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[var(--text-primary)] font-bold text-sm">镜头详情</h3>
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest truncate" title={shot.cameraMovement}>
              {shot.cameraMovement}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={onPrevious}
            disabled={shotIndex === 0}
            className="p-2 hover:bg-[var(--bg-hover)] rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNext}
            disabled={shotIndex === totalShots - 1}
            className="p-2 hover:bg-[var(--bg-hover)] rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-20 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-[var(--border-secondary)] mx-2"></div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--error-hover-bg)] rounded text-[var(--text-tertiary)] hover:text-[var(--error-text)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Scene Context */}
        {scriptData && (
          <SceneContext
            shot={shot}
            scene={scene}
            scenes={scriptData.scenes}
            characters={activeCharacters}
            availableCharacters={availableCharacters}
            props={activeProps}
            availableProps={availablePropsForShot}
            onAddCharacter={onAddCharacter}
            onRemoveCharacter={onRemoveCharacter}
            onVariationChange={onVariationChange}
            onSceneChange={onSceneChange}
            onAddProp={onAddProp}
            onRemoveProp={onRemoveProp}
          />
        )}

        {/* Nine Grid Storyboard Preview - Advanced Feature (不在 veo 首尾帧模式下显示) */}
        {currentVideoModelId !== 'veo' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={
                nineGrid?.status === 'completed' || nineGrid?.status === 'panels_ready' || nineGrid?.status === 'generating_image'
                  ? onShowNineGrid 
                  : onGenerateNineGrid
              }
              disabled={nineGrid?.status === 'generating_panels' || nineGrid?.status === 'generating_image'}
              className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                nineGrid?.status === 'generating_panels' || nineGrid?.status === 'generating_image'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-primary)] cursor-wait'
                  : nineGrid?.status === 'completed'
                    ? 'bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-border)] hover:bg-[var(--success-hover-bg)]'
                    : nineGrid?.status === 'panels_ready'
                      ? 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)] hover:bg-[var(--warning-hover-bg)]'
                      : 'bg-[var(--bg-surface)] text-[var(--text-tertiary)] border-[var(--border-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-primary)] hover:bg-[var(--bg-hover)]'
              }`}
              title="九宫格分镜预览 - 使用AI将镜头拆分为9个不同视角的预览图"
            >
              {nineGrid?.status === 'generating_panels' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>镜头描述生成中...</span>
                </>
              ) : nineGrid?.status === 'generating_image' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>九宫格图片生成中...</span>
                </>
              ) : nineGrid?.status === 'panels_ready' ? (
                <>
                  <Grid3x3 className="w-3.5 h-3.5" />
                  <span>查看/确认镜头描述</span>
                  <span className="ml-1 px-1.5 py-0.5 bg-[var(--warning-text)]/10 rounded text-[8px]">待确认</span>
                </>
              ) : nineGrid?.status === 'completed' ? (
                <>
                  <Grid3x3 className="w-3.5 h-3.5" />
                  <span>查看九宫格分镜</span>
                  <span className="ml-1 px-1.5 py-0.5 bg-[var(--success-text)]/10 rounded text-[8px]">Advanced</span>
                </>
              ) : (
                <>
                  <Grid3x3 className="w-3.5 h-3.5" />
                  <span>九宫格分镜预览</span>
                  <span className="ml-1 px-1.5 py-0.5 bg-[var(--accent)]/10 text-[var(--accent-text)] rounded text-[8px]">Advanced</span>
                </>
              )}
            </button>
          </div>
          
          {/* Nine Grid thumbnail preview (if generated) */}
          {nineGrid?.status === 'completed' && nineGrid.imageUrl && (
            <div 
              className="relative bg-[var(--bg-base)] rounded-lg border border-[var(--border-primary)] overflow-hidden cursor-pointer group"
              onClick={onShowNineGrid}
            >
              <img
                src={nineGrid.imageUrl}
                className="w-full h-auto block transition-transform duration-300 group-hover:scale-105"
                alt="九宫格分镜预览"
              />
              <div className="absolute inset-0 bg-[var(--bg-base)]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="text-[var(--text-primary)] text-xs font-mono">点击选择视角作为首帧</span>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Visual Production */}
        <KeyframeEditor
          startKeyframe={startKf}
          endKeyframe={endKf}
          showEndFrame={showEndFrame}
          canCopyPrevious={shotIndex > 0}
          canCopyNext={shotIndex < totalShots - 1 && nextShotHasStartFrame}
          isAIOptimizing={isAIOptimizing}
          useAIEnhancement={useAIEnhancement}
          onToggleAIEnhancement={onToggleAIEnhancement}
          onGenerateKeyframe={onGenerateKeyframe}
          onUploadKeyframe={onUploadKeyframe}
          onEditPrompt={onEditKeyframePrompt}
          onOptimizeWithAI={onOptimizeKeyframeWithAI}
          onOptimizeBothWithAI={onOptimizeBothKeyframes}
          onCopyPrevious={onCopyPreviousEndFrame}
          onCopyNext={onCopyNextStartFrame}
          onImageClick={onImageClick}
        />

        {/* Narrative Section - 叙事动作作为视频提示词，放在视觉制作之后、视频生成之前 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-primary)] pb-2">
            <Film className="w-4 h-4 text-[var(--text-tertiary)]" />
            <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
              叙事动作 (Action & Dialogue)
            </h4>
            <div className="ml-auto flex items-center gap-1">
              <button 
                onClick={onSplitShot}
                disabled={isSplittingShot}
                className="p-1 text-[var(--success-text)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="AI拆分镜头"
              >
                {isSplittingShot ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Scissors className="w-3 h-3" />
                )}
              </button>
              <button 
                onClick={onGenerateAIAction}
                disabled={isAIOptimizing}
                className="p-1 text-[var(--accent-text)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="AI生成动作建议"
              >
                {isAIOptimizing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
              </button>
              <button 
                onClick={onEditActionSummary}
                className="p-1 text-[var(--warning-text)] hover:text-[var(--text-primary)] transition-colors"
                title="编辑叙事动作"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar">
            <div className="bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border-primary)]">
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{shot.actionSummary}</p>
            </div>
            
            {shot.dialogue && (
              <div className="bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border-primary)] flex gap-3">
                <MessageSquare className="w-4 h-4 text-[var(--text-muted)] mt-0.5" />
                <div className="flex-1">
                  <p className="text-[var(--text-tertiary)] text-xs italic leading-relaxed">
                    "{shot.dialogue}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Generation */}
        <VideoGenerator
          shot={shot}
          hasStartFrame={!!startKf?.imageUrl}
          hasEndFrame={!!endKf?.imageUrl}
          onGenerate={onGenerateVideo}
          onEditPrompt={onEditVideoPrompt}
          onModelChange={onVideoModelChange}
        />
      </div>
    </div>
  );
};

export default ShotWorkbench;
