import React, { useState, useEffect } from 'react';
import { X, Loader2, RefreshCw, Check, Grid3x3, AlertCircle, Image as ImageIcon, Crop, Edit2, Save, ArrowRight, Wand2, ImagePlus } from 'lucide-react';
import { NineGridData, NineGridPanel, AspectRatio } from '../../types';
import { NINE_GRID } from './constants';

interface NineGridPreviewProps {
  isOpen: boolean;
  nineGrid?: NineGridData;
  onClose: () => void;
  onSelectPanel: (panel: NineGridPanel) => void;
  onUseWholeImage: () => void;  // 整张九宫格图直接用作首帧
  onRegenerate: () => void;
  onRegenerateImage: () => void; // 仅重新生成图片（保留已有的面板文案描述）
  onConfirmPanels: (panels: NineGridPanel[]) => void; // 用户确认面板后生成图片
  onUpdatePanel: (index: number, panel: Partial<NineGridPanel>) => void; // 编辑单个面板
  /** 当前画面比例（横屏/竖屏），用于调整预览布局 */
  aspectRatio?: AspectRatio;
}

const NineGridPreview: React.FC<NineGridPreviewProps> = ({
  isOpen,
  nineGrid,
  onClose,
  onSelectPanel,
  onUseWholeImage,
  onRegenerate,
  onRegenerateImage,
  onConfirmPanels,
  onUpdatePanel,
  aspectRatio = '16:9'
}) => {
  const [hoveredPanel, setHoveredPanel] = useState<number | null>(null);
  const [selectedPanel, setSelectedPanel] = useState<number | null>(null);
  const [editingPanel, setEditingPanel] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ shotSize: string; cameraAngle: string; description: string }>({
    shotSize: '', cameraAngle: '', description: ''
  });

  // 当编辑面板时，初始化编辑表单
  useEffect(() => {
    if (editingPanel !== null && nineGrid?.panels?.[editingPanel]) {
      const panel = nineGrid.panels[editingPanel];
      setEditForm({
        shotSize: panel.shotSize,
        cameraAngle: panel.cameraAngle,
        description: panel.description
      });
    }
  }, [editingPanel, nineGrid?.panels]);

  if (!isOpen) return null;

  const isGeneratingPanels = nineGrid?.status === 'generating_panels';
  const isPanelsReady = nineGrid?.status === 'panels_ready';
  const isGeneratingImage = nineGrid?.status === 'generating_image';
  const hasFailed = nineGrid?.status === 'failed';
  const isCompleted = nineGrid?.status === 'completed' && nineGrid?.imageUrl;
  // 兼容旧的 generating 状态
  const isGenerating = nineGrid?.status === 'generating_panels' || nineGrid?.status === 'generating_image' || (nineGrid?.status as string) === 'generating';

  const handlePanelClick = (index: number) => {
    if (isPanelsReady) {
      // 在 panels_ready 模式下，点击进入编辑
      setEditingPanel(editingPanel === index ? null : index);
    } else {
      setSelectedPanel(selectedPanel === index ? null : index);
    }
  };

  const handleConfirmSelect = () => {
    if (selectedPanel !== null && nineGrid?.panels?.[selectedPanel]) {
      onSelectPanel(nineGrid.panels[selectedPanel]);
      setSelectedPanel(null);
    }
  };

  const handleSaveEdit = () => {
    if (editingPanel !== null) {
      onUpdatePanel(editingPanel, editForm);
      setEditingPanel(null);
    }
  };

  const handleConfirmAndGenerate = () => {
    if (nineGrid?.panels && nineGrid.panels.length === 9) {
      onConfirmPanels(nineGrid.panels);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[var(--overlay-heavy)] backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-elevated)] border border-[var(--border-secondary)] rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 px-6 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-surface)] shrink-0">
          <div className="flex items-center gap-3">
            <Grid3x3 className="w-4 h-4 text-[var(--accent-text)]" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              九宫格分镜预览
            </h3>
            {isPanelsReady && (
              <span className="text-[10px] text-[var(--warning-text)] font-bold uppercase tracking-wider bg-[var(--warning-bg)] px-2 py-0.5 rounded border border-[var(--warning-border)]">
                待确认
              </span>
            )}
            {isCompleted && (
              <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider bg-[var(--bg-base)]/30 px-2 py-0.5 rounded">
                Advanced
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isCompleted && (
              <button
                onClick={onRegenerateImage}
                className="px-3 py-1.5 bg-[var(--accent-bg)] hover:bg-[var(--accent-hover-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                title="保留镜头描述，仅重新生成九宫格图片"
              >
                <ImagePlus className="w-3 h-3" />
                重新生成图片
              </button>
            )}
            {(isCompleted || isPanelsReady) && (
              <button
                onClick={onRegenerate}
                className="px-3 py-1.5 bg-[var(--bg-hover)] hover:bg-[var(--border-secondary)] text-[var(--text-secondary)] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                title="重新生成镜头描述和图片"
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
          {/* Loading Panels State */}
          {isGeneratingPanels && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-6" />
              <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                正在生成镜头描述...
              </h4>
              <p className="text-sm text-[var(--text-tertiary)]">
                AI正在将镜头拆分为9个不同视角，请耐心等待
              </p>
            </div>
          )}

          {/* Loading Image State */}
          {isGeneratingImage && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-6" />
              <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                正在生成九宫格图片...
              </h4>
              <p className="text-sm text-[var(--text-tertiary)]">
                根据确认的镜头描述生成预览图，请耐心等待
              </p>
              {/* 显示已确认的面板列表 */}
              {nineGrid?.panels && nineGrid.panels.length > 0 && (
                <div className="mt-6 w-full max-w-lg space-y-1.5 px-6">
                  {nineGrid.panels.map((panel, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-primary)]">
                      <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] font-bold text-[var(--text-secondary)]">
                        {panel.shotSize} / {panel.cameraAngle}
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
                {nineGrid?.panels && nineGrid.panels.length > 0 
                  ? '九宫格图片生成失败，您可以重新确认生成或修改描述后重试'
                  : '镜头描述生成失败，请重试'
                }
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={onRegenerate}
                  className="px-4 py-2 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  重新生成描述
                </button>
                {/* 如果面板描述已有，允许直接重试图片生成 */}
                {nineGrid?.panels && nineGrid.panels.length === 9 && (
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

          {/* Panels Ready State - 用户审核和编辑面板描述 */}
          {isPanelsReady && nineGrid?.panels && (
            <div className="p-6 space-y-4">
              {/* 提示信息 */}
              <div className="flex items-start gap-3 p-4 bg-[var(--warning-bg)] border border-[var(--warning-border)] rounded-lg">
                <Wand2 className="w-5 h-5 text-[var(--warning-text)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[var(--warning-text)] mb-1">
                    AI已生成9个镜头描述，请检查后确认
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    点击任意镜头可编辑其景别、机位角度和描述内容。确认无误后点击「确认并生成图片」按钮。
                  </p>
                </div>
              </div>

              {/* 面板列表 - 可编辑 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {nineGrid.panels.map((panel, idx) => (
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
                            {panel.shotSize} / {panel.cameraAngle}
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
                            <label className="text-[8px] uppercase tracking-wider text-[var(--text-muted)] font-bold mb-0.5 block">景别</label>
                            <select
                              value={editForm.shotSize}
                              onChange={(e) => setEditForm(prev => ({ ...prev, shotSize: e.target.value }))}
                              className="w-full text-[10px] p-1.5 bg-[var(--bg-base)] border border-[var(--border-secondary)] rounded text-[var(--text-primary)] focus:border-[var(--accent)] outline-none"
                            >
                              {['远景', '全景', '中景', '近景', '特写', '大特写'].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1">
                            <label className="text-[8px] uppercase tracking-wider text-[var(--text-muted)] font-bold mb-0.5 block">机位</label>
                            <select
                              value={editForm.cameraAngle}
                              onChange={(e) => setEditForm(prev => ({ ...prev, cameraAngle: e.target.value }))}
                              className="w-full text-[10px] p-1.5 bg-[var(--bg-base)] border border-[var(--border-secondary)] rounded text-[var(--text-primary)] focus:border-[var(--accent)] outline-none"
                            >
                              {['俯拍', '仰拍', '平视', '斜拍', '鸟瞰', '低角度', '荷兰角', '过肩'].map(a => (
                                <option key={a} value={a}>{a}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-[8px] uppercase tracking-wider text-[var(--text-muted)] font-bold mb-0.5 block">画面描述</label>
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full text-[10px] p-2 bg-[var(--bg-base)] border border-[var(--border-secondary)] rounded text-[var(--text-primary)] focus:border-[var(--accent)] outline-none resize-none font-mono leading-relaxed"
                            rows={4}
                          />
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setEditingPanel(null)}
                            className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                          >
                            取消
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded text-[9px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            保存
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* 预览模式 */
                      <p className="text-[10px] text-[var(--text-tertiary)] leading-relaxed line-clamp-3">
                        {panel.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* 确认生成按钮 */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-primary)]">
                <p className="text-[10px] text-[var(--text-muted)] max-w-[400px]">
                  确认9个镜头描述无误后，将根据这些描述生成一张3x3九宫格分镜预览图
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-3 py-2 bg-[var(--bg-hover)] hover:bg-[var(--border-secondary)] text-[var(--text-secondary)] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    稍后确认
                  </button>
                  <button
                    onClick={handleConfirmAndGenerate}
                    className="px-4 py-2.5 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg shadow-[var(--btn-primary-shadow)]"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    确认并生成图片
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Completed State - Main Content (与之前相同) */}
          {isCompleted && nineGrid && (
            <div className="p-6 space-y-4">
              <div className={`flex gap-6 ${aspectRatio === '9:16' ? 'items-start' : ''}`}>
                {/* Left: Nine Grid Image with overlay grid */}
                <div className={aspectRatio === '9:16' ? 'w-[320px] shrink-0' : 'flex-1 min-w-0'}>
                  <div className="relative bg-[var(--bg-base)] rounded-lg border border-[var(--border-primary)] overflow-hidden">
                    {/* Base Image - 自适应实际图片比例 */}
                    <img
                      src={nineGrid.imageUrl}
                      className="w-full h-auto block"
                      alt="九宫格分镜预览"
                    />
                    
                    {/* Overlay Grid - 3x3 clickable areas, 完全覆盖图片 */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                      {Array.from({ length: 9 }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`relative border transition-all duration-200 cursor-pointer group/cell ${
                            selectedPanel === idx
                              ? 'border-[var(--accent)] border-2 bg-[var(--accent)]/10 shadow-[inset_0_0_20px_rgba(var(--accent-rgb),0.15)]'
                              : hoveredPanel === idx
                                ? 'border-white/40 bg-white/5'
                                : 'border-transparent hover:border-white/20'
                          }`}
                          onMouseEnter={() => setHoveredPanel(idx)}
                          onMouseLeave={() => setHoveredPanel(null)}
                          onClick={() => handlePanelClick(idx)}
                        >
                          {/* Panel index badge */}
                          <div className={`absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-opacity ${
                            hoveredPanel === idx || selectedPanel === idx
                              ? 'opacity-100'
                              : 'opacity-0 group-hover/cell:opacity-60'
                          } ${
                            selectedPanel === idx
                              ? 'bg-[var(--accent)] text-white'
                              : 'bg-black/60 text-white'
                          }`}>
                            {idx + 1}
                          </div>

                          {/* Selected checkmark */}
                          {selectedPanel === idx && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-[var(--accent)] rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}

                          {/* Hover tooltip */}
                          {hoveredPanel === idx && nineGrid.panels[idx] && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                              <p className="text-white text-[9px] font-bold">
                                {nineGrid.panels[idx].shotSize} / {nineGrid.panels[idx].cameraAngle}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Panel descriptions list */}
                <div className={`${aspectRatio === '9:16' ? 'flex-1 min-w-0' : 'w-64 shrink-0'} space-y-2`}>
                  <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest pb-1 border-b border-[var(--border-primary)]">
                    视角列表
                  </h4>
                  <div className="space-y-1.5 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                    {nineGrid.panels.map((panel, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all duration-150 ${
                          selectedPanel === idx
                            ? 'bg-[var(--accent-bg)] border-[var(--accent-border)] ring-1 ring-[var(--accent)]'
                            : hoveredPanel === idx
                              ? 'bg-[var(--bg-hover)] border-[var(--border-secondary)]'
                              : 'bg-[var(--bg-surface)] border-[var(--border-primary)] hover:bg-[var(--bg-hover)]'
                        }`}
                        onMouseEnter={() => setHoveredPanel(idx)}
                        onMouseLeave={() => setHoveredPanel(null)}
                        onClick={() => handlePanelClick(idx)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                            selectedPanel === idx
                              ? 'bg-[var(--accent)] text-white'
                              : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)]'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="text-[10px] font-bold text-[var(--text-secondary)] truncate">
                            {panel.shotSize} / {panel.cameraAngle}
                          </span>
                        </div>
                        <p className="text-[9px] text-[var(--text-tertiary)] leading-relaxed line-clamp-2 ml-7">
                          {panel.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-primary)]">
                <p className="text-[10px] text-[var(--text-muted)] max-w-[280px]">
                  {selectedPanel !== null 
                    ? `已选择面板 ${selectedPanel + 1}: ${nineGrid.panels[selectedPanel]?.shotSize} / ${nineGrid.panels[selectedPanel]?.cameraAngle}`
                    : '可直接使用整张九宫格图作为首帧，或点击选择某个格子裁剪使用'
                  }
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-3 py-2 bg-[var(--bg-hover)] hover:bg-[var(--border-secondary)] text-[var(--text-secondary)] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={onUseWholeImage}
                    className="px-3 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border-secondary)] hover:border-[var(--border-primary)] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3 h-3" />
                    整图用作首帧
                  </button>
                  <button
                    onClick={handleConfirmSelect}
                    disabled={selectedPanel === null}
                    className="px-3 py-2 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[var(--btn-primary-shadow)]"
                  >
                    <Crop className="w-3 h-3" />
                    裁剪选中格用作首帧
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pending State (initial, before first generation) */}
          {!nineGrid && (
            <div className="flex flex-col items-center justify-center py-20">
              <Grid3x3 className="w-12 h-12 text-[var(--text-muted)] mb-6 opacity-40" />
              <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                九宫格分镜预览
              </h4>
              <p className="text-sm text-[var(--text-tertiary)] mb-6 text-center max-w-md">
                AI将自动将当前镜头拆分为9个不同的摄影视角，<br/>
                生成一张3x3网格预览图，帮助你选择最佳构图方案
              </p>
              <button
                onClick={onRegenerate}
                className="px-4 py-2 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg shadow-[var(--btn-primary-shadow)]"
              >
                <Grid3x3 className="w-3.5 h-3.5" />
                开始生成
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NineGridPreview;
