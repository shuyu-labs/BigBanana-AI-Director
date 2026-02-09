/**
 * 模型列表组件
 * 显示特定类型的模型列表，支持选择激活模型
 */

import React, { useState, useEffect } from 'react';
import { Plus, Info, CheckCircle } from 'lucide-react';
import { 
  ModelType, 
  ModelDefinition, 
} from '../../types/model';
import {
  getModels,
  updateModel,
  registerModel,
  removeModel,
  getActiveModelsConfig,
  setActiveModel,
  getProviderById,
} from '../../services/modelRegistry';
import { useAlert } from '../GlobalAlert';
import ModelCard from './ModelCard';
import AddModelForm from './AddModelForm';

interface ModelListProps {
  type: ModelType;
  onRefresh: () => void;
}

const typeDescriptions: Record<ModelType, string> = {
  chat: '用于剧本解析、分镜生成、提示词优化等文本生成任务',
  image: '用于角色定妆、场景生成、关键帧生成等图片生成任务',
  video: '用于视频片段生成任务',
};

const ModelList: React.FC<ModelListProps> = ({ type, onRefresh }) => {
  const [models, setModels] = useState<ModelDefinition[]>([]);
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [expandedModelId, setExpandedModelId] = useState<string | null>(null);
  const [activeModelId, setActiveModelId] = useState<string>('');
  const { showAlert } = useAlert();

  useEffect(() => {
    loadModels();
  }, [type]);

  const loadModels = () => {
    const allModels = getModels(type);
    setModels(allModels);
    // 获取当前激活的模型
    const activeConfig = getActiveModelsConfig();
    setActiveModelId(activeConfig[type]);
  };

  const handleSetActiveModel = (modelId: string) => {
    if (setActiveModel(type, modelId)) {
      setActiveModelId(modelId);
      const model = models.find(m => m.id === modelId);
      const provider = model ? getProviderById(model.providerId) : null;
      showAlert(
        `已切换到 ${model?.name}${provider ? ` (${provider.name})` : ''}`, 
        { type: 'success' }
      );
      onRefresh();
    } else {
      showAlert('设置激活模型失败，请确保模型已启用', { type: 'error' });
    }
  };

  const handleUpdateModel = (modelId: string, updates: Partial<ModelDefinition>) => {
    if (updateModel(modelId, updates)) {
      loadModels();
      onRefresh();
    }
  };

  const handleDeleteModel = (modelId: string) => {
    showAlert('确定要删除这个模型吗？', {
      type: 'warning',
      showCancel: true,
      onConfirm: () => {
        if (removeModel(modelId)) {
          loadModels();
          onRefresh();
          showAlert('模型已删除', { type: 'success' });
        }
      }
    });
  };

  const handleAddModel = (model: Omit<ModelDefinition, 'id' | 'isBuiltIn'>) => {
    try {
      registerModel(model);
      setIsAddingModel(false);
      loadModels();
      onRefresh();
      showAlert('模型添加成功', { type: 'success' });
    } catch (error) {
      showAlert(error instanceof Error ? error.message : '添加模型失败', { type: 'error' });
    }
  };

  const handleToggleExpand = (modelId: string) => {
    setExpandedModelId(expandedModelId === modelId ? null : modelId);
  };

  return (
    <div className="space-y-4">
      {/* 类型说明 */}
      <div className="mb-4">
        <p className="text-xs text-[var(--text-tertiary)]">{typeDescriptions[type]}</p>
      </div>

      {/* 当前激活模型信息 */}
      <div className="bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle className="w-4 h-4 text-[var(--accent-text)]" />
          <span className="text-xs font-bold text-[var(--accent-text-hover)]">当前使用</span>
        </div>
        {(() => {
          const activeModel = models.find(m => m.id === activeModelId);
          const provider = activeModel ? getProviderById(activeModel.providerId) : null;
          return (
            <p className="text-[11px] text-[var(--text-secondary)]">
              <span className="font-medium">{activeModel?.name || '未选择'}</span>
              {provider && (
                <span className="text-[var(--text-tertiary)] ml-2">
                  → {provider.name} ({provider.baseUrl})
                </span>
              )}
            </p>
          );
        })()}
      </div>

      {/* 提示信息 */}
      <div className="bg-[var(--bg-hover)]/50 border border-[var(--border-secondary)] rounded-lg p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-[var(--text-tertiary)] leading-relaxed">
          点击「使用此模型」按钮可切换激活模型。自定义模型配置了独立提供商后，API 请求会发送到对应的地址。
          点击展开按钮可调整模型参数。
        </p>
      </div>

      {/* 模型列表 */}
      <div className="space-y-2">
        {models.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            isExpanded={expandedModelId === model.id}
            isActive={activeModelId === model.id}
            onToggleExpand={() => handleToggleExpand(model.id)}
            onUpdate={(updates) => handleUpdateModel(model.id, updates)}
            onDelete={() => handleDeleteModel(model.id)}
            onSetActive={() => handleSetActiveModel(model.id)}
          />
        ))}
      </div>

      {/* 添加模型 */}
      {isAddingModel ? (
        <AddModelForm
          type={type}
          onSave={handleAddModel}
          onCancel={() => setIsAddingModel(false)}
        />
      ) : (
        <button
          onClick={() => setIsAddingModel(true)}
          className="w-full py-3 border border-dashed border-[var(--border-secondary)] rounded-lg text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--border-secondary)] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加自定义模型
        </button>
      )}
    </div>
  );
};

export default ModelList;
