import React, { useState, useEffect } from 'react';
import { X, Loader2, RefreshCw, Grid3x3, AlertCircle, Edit2, Save, ArrowRight, Wand2, ImagePlus } from 'lucide-react';
import { Character, CharacterTurnaroundPanel } from '../../types';
import { CHARACTER_TURNAROUND_LAYOUT } from '../../services/aiService';

interface TurnaroundModalProps {
  character: Character;
  onClose: () => void;
  onGeneratePanels: (charId: string) => void;
  onConfirmPanels: (charId: string, panels: CharacterTurnaroundPanel[]) => void;
  onUpdatePanel: (charId: string, index: number, panel: Partial<CharacterTurnaroundPanel>) => void;
  onRegenerate: (charId: string) => void;
  onRegenerateImage: (charId: string) => void; // 仅重新生成图片（保留已有的视角描述）
  onImageClick: (imageUrl: string) => void;
}

const TurnaroundModal: React.FC<TurnaroundModalProps> = ({
  character,
  onClose,
  onGeneratePanels,
  onConfirmPanels,
  onUpdatePanel,
  onRegenerate,
  onRegenerateImage,
  onImageClick,
}) => {
  const turnaround = character.turnaround;
  const [editingPanel, setEditingPanel] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ viewAngle: string; shotSize: string; description: string }>({
    viewAngle: '', shotSize: '', description: ''
  });

  // 当编辑面板时，初始化编辑表单
  useEffect(() => {
    if (editingPanel !== null && turnaround?.panels?.[editingPanel]) {
      const panel = turnaround.panels[editingPanel];
      setEditForm({
        viewAngle: panel.viewAngle,
        shotSize: panel.shotSize,
        description: panel.description
      });
    }
  }, [editingPanel, turnaround?.panels]);

  const isGeneratingPanels = turnaround?.status === 'generating_panels';
  const isPanelsReady = turnaround?.status === 'panels_ready';
  const isGeneratingImage = turnaround?.status === 'generating_image';
  const hasFailed = turnaround?.status === 'failed';
  const isCompleted = turnaround?.status === 'completed' && turnaround?.imageUrl;
  const hasNoPanels = !turnaround || turnaround.status === 'pending';

  const handlePanelClick = (index: number) => {
    if (isPanelsReady) {
      setEditingPanel(editingPanel === index ? null : index);
    }
  };

  const handleSaveEdit = () => {
    if (editingPanel !== null) {
      onUpdatePanel(character.id, editingPanel, editForm);
      setEditingPanel(null);
    }
  };

  const handleConfirmAndGenerate = () => {
    if (turnaround?.panels && turnaround.panels.length === 9) {
      onConfirmPanels(character.id, turnaround.panels);
    }
  };

  return (
    <div
      className="absolute inset-0 z-40 bg-[var(--bg-base)]/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-elevated)] border border-[var(--border-secondary)] rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 px-6 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-surface)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--bg-hover)] overflow-hidden border border-[var(--border-secondary)]">
              {character.referenceImage && (
                <img src={character.referenceImage} className="w-full h-full object-cover" alt={character.name} />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Grid3x3 className="w-4 h-4 text-[var(--accent-text)]" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {character.name} - 造型九宫格
              </h3>
            </div>
            {isPanelsReady && (
              <span className="text-[10px] text-[var(--warning-text)] font-bold uppercase tracking-wider bg-[var(--warning-bg)] px-2 py-0.5 rounded border border-[var(--warning-border)]">
                待确认
              </span>
            )}
            {isCompleted && (
              <span className="text-[10px] text-[var(--success-text)] font-bold uppercase tracking-wider bg-[var(--success-bg)] px-2 py-0.5 rounded border border-[var(--success-border)]">
                已完成
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isCompleted && (
              <button
                onClick={() => onRegenerateImage(character.id)}
                className="px-3 py-1.5 bg-[var(--accent-bg)] hover:bg-[var(--accent-hover-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                title="保留视角描述，仅重新生成九宫格图片"
              >
                <ImagePlus className="w-3 h-3" />
                重新生成图片
              </button>
            )}
            {(isCompleted || isPanelsReady) && (
              <button
                onClick={() => onRegenerate(character.id)}
                className="px-3 py-1.5 bg-[var(--bg-hover)] hover:bg-[var(--border-secondary)] text-[var(--text-secondary)] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                title="重新生成视角描述和图片"
              >
                <RefreshCw className="w-3 h-3" />
                重新生成描述
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--error-hover-bg)] rounded text-[var(--text-tertiary)] hover:text-[var(--error-text)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* 初始状态 - 尚未开始 */}
          {hasNoPanels && (
            <div className="flex flex-col items-center justify-center py-20">
              <Grid3x3 className="w-16 h-16 text-[var(--text-muted)] mb-6 opacity-30" />
              <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                角色造型九宫格
              </h4>
              <p className="text-sm text-[var(--text-tertiary)] mb-2 text-center max-w-md">
                生成角色的多视角参考图（正面、侧面、背面、俯视、仰视等），
                在后续生成镜头图时将整张九宫格作为参考，提升角色一致性。
              </p>
              <p className="text-xs text-[var(--text-muted)] mb-8 text-center max-w-sm">
                提示：角色需要先有基础参考图，九宫格将基于该图生成多视角版本。
              </p>
              <button
                onClick={() => onGeneratePanels(character.id)}
                disabled={!character.referenceImage && !character.visualPrompt}
                className="px-6 py-3 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[var(--btn-primary-shadow)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Wand2 className="w-4 h-4" />
                生成造型九宫格
              </button>
            </div>
          )}

          {/* Loading Panels State */}
          {isGeneratingPanels && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-6" />
              <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                正在生成视角描述...
              </h4>
              <p className="text-sm text-[var(--text-tertiary)]">
                AI正在为角色「{character.name}」设计9个不同视角的描述，请耐心等待
              </p>
            </div>
          )}

          {/* Loading Image State */}
          {isGeneratingImage && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-6" />
              <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                正在生成九宫格造型图片...
              </h4>
              <p className="text-sm text-[var(--text-tertiary)]">
                根据视角描述为角色「{character.name}」生成多视角参考图，请耐心等待
              </p>
              {/* 显示已确认的视角列表 */}
              {turnaround?.panels && turnaround.panels.length > 0 && (
                <div className="mt-6 w-full max-w-lg space-y-1.5 px-6">
                  {turnaround.panels.map((panel, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-primary)]">
                      <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] font-bold text-[var(--text-secondary)]">
                        {panel.viewAngle} / {panel.shotSize}
                      </span>
                      <span className="text-[9px] text-[var(--text-muted)] truncate flex-1">
                        {panel.description.substring(0, 50)}...
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Failed State */}
          {hasFailed && (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="w-12 h-12 text-[var(--error)] mb-6 opacity-60" />
              <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                生成失败
              </h4>
              <p className="text-sm text-[var(--text-tertiary)] mb-6">
                {turnaround?.panels && turnaround.panels.length > 0
                  ? '九宫格图片生成失败，您可以重新确认生成或修改描述后重试'
                  : '视角描述生成失败，请重试'
                }
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onRegenerate(character.id)}
                  className="px-4 py-2 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  重新生成描述
                </button>
                {turnaround?.panels && turnaround.panels.length === 9 && (
                  <button
                    onClick={handleConfirmAndGenerate}
                    className="px-4 py-2 bg-[var(--accent-bg)] hover:bg-[var(--accent-hover-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                  >
                    <ArrowRight className="w-3 h-3" />
                    重试生成图片
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Panels Ready State - 用户审核和编辑视角描述 */}
          {isPanelsReady && turnaround?.panels && (
            <div className="p-6 space-y-4">
              {/* 提示信息 */}
              <div className="flex items-start gap-3 p-4 bg-[var(--warning-bg)] border border-[var(--warning-border)] rounded-lg">
                <Wand2 className="w-5 h-5 text-[var(--warning-text)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[var(--warning-text)] mb-1">
                    AI已生成9个视角描述，请检查后确认
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    点击任意视角可编辑其角度、景别和描述内容。确认无误后点击下方「确认并生成图片」按钮。
                  </p>
                </div>
              </div>

              {/* 面板列表 - 可编辑 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {turnaround.panels.map((panel, idx) => (
                  <div
                    key={idx}
                    className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${
                      editingPanel === idx
                        ? 'border-[var(--accent)] bg-[var(--accent-bg)] shadow-lg'
                        : 'border-[var(--border-primary)] bg-[var(--bg-surface)] hover:border-[var(--border-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer'
                    }`}
                    onClick={() => editingPanel !== idx && handlePanelClick(idx)}
                  >
                    {/* 面板头部 */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          editingPanel === idx
                            ? 'bg-[var(--accent)] text-white'
                            : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)]'
                        }`}>
                          {idx + 1}
                        </span>
                        {editingPanel !== idx && (
                          <span className="text-[11px] font-bold text-[var(--text-secondary)]">
                            {panel.viewAngle} / {panel.shotSize}
                          </span>
                        )}
                      </div>
                      {editingPanel !== idx && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePanelClick(idx); }}
                          className="p-1 hover:bg-[var(--bg-hover)] rounded text-[var(--text-muted)] hover:text-[var(--accent-text)] transition-colors"
                          title="编辑"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* 编辑模式 */}
                    {editingPanel === idx ? (
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="text-[8px] uppercase tracking-wider text-[var(--text-muted)] font-bold mb-0.5 block">视角</label>
                            <select
                              value={editForm.viewAngle}
                              onChange={(e) => setEditForm(prev => ({ ...prev, viewAngle: e.target.value }))}
                              className="w-full bg-[var(--bg-base)] border border-[var(--border-secondary)] rounded px-2 py-1 text-[11px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                            >
                              {CHARACTER_TURNAROUND_LAYOUT.viewAngles.map(angle => (
                                <option key={angle} value={angle}>{angle}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1">
                            <label className="text-[8px] uppercase tracking-wider text-[var(--text-muted)] font-bold mb-0.5 block">景别</label>
                            <select
                              value={editForm.shotSize}
                              onChange={(e) => setEditForm(prev => ({ ...prev, shotSize: e.target.value }))}
                              className="w-full bg-[var(--bg-base)] border border-[var(--border-secondary)] rounded px-2 py-1 text-[11px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                            >
                              {CHARACTER_TURNAROUND_LAYOUT.shotSizes.map(size => (
                                <option key={size} value={size}>{size}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-[8px] uppercase tracking-wider text-[var(--text-muted)] font-bold mb-0.5 block">描述</label>
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full bg-[var(--bg-base)] border border-[var(--border-secondary)] rounded px-2 py-1 text-[10px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] resize-none"
                          />
                        </div>
                        <button
                          onClick={handleSaveEdit}
                          className="w-full py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover-bg)] text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          保存修改
                        </button>
                      </div>
                    ) : (
                      <p className="text-[9px] text-[var(--text-muted)] leading-relaxed line-clamp-3">
                        {panel.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* 确认按钮 */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleConfirmAndGenerate}
                  className="px-8 py-3 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[var(--btn-primary-shadow)]"
                >
                  <ArrowRight className="w-4 h-4" />
                  确认并生成图片
                </button>
              </div>
            </div>
          )}

          {/* Completed State - 显示九宫格图片 */}
          {isCompleted && turnaround?.imageUrl && (
            <div className="p-6 space-y-4">
              {/* 九宫格图片 */}
              <div>
                <img
                  src={turnaround.imageUrl}
                  alt={`${character.name} Turnaround Sheet`}
                  className="w-full rounded-lg border border-[var(--border-primary)] cursor-pointer"
                  onClick={() => onImageClick(turnaround.imageUrl!)}
                />
              </div>

              {/* 视角描述列表 */}
              <div>
                <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Grid3x3 className="w-3.5 h-3.5" />
                  视角描述明细
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {turnaround.panels.map((panel, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-primary)]"
                    >
                      <span className="w-5 h-5 rounded-full bg-[var(--bg-hover)] text-[var(--text-tertiary)] flex items-center justify-center text-[9px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] block">
                          {panel.viewAngle} / {panel.shotSize}
                        </span>
                        <span className="text-[9px] text-[var(--text-muted)] line-clamp-2">
                          {panel.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 底部操作按钮 */}
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => onRegenerateImage(character.id)}
                  className="px-4 py-2 bg-[var(--accent-bg)] hover:bg-[var(--accent-hover-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  title="保留视角描述，仅重新生成图片"
                >
                  <ImagePlus className="w-3 h-3" />
                  重新生成图片
                </button>
                <button
                  onClick={() => onRegenerate(character.id)}
                  className="px-4 py-2 bg-[var(--bg-hover)] hover:bg-[var(--border-secondary)] text-[var(--text-secondary)] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 border border-[var(--border-primary)]"
                  title="重新生成视角描述和图片"
                >
                  <RefreshCw className="w-3 h-3" />
                  重新生成描述
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TurnaroundModal;
