import React, { useState } from 'react';
import { Search, Film } from 'lucide-react';
import { ProjectState } from '../../types';
import { PromptCategory, EditingPrompt } from './constants';
import { 
  savePromptEdit, 
  filterCharacters, 
  filterScenes, 
  filterProps,
  filterShots 
} from './utils';
import CharacterSection from './CharacterSection';
import SceneSection from './SceneSection';
import PropSection from './PropSection';
import KeyframeSection from './KeyframeSection';

interface Props {
  project: ProjectState;
  updateProject: (updates: Partial<ProjectState> | ((prev: ProjectState) => ProjectState)) => void;
}

const StagePrompts: React.FC<Props> = ({ project, updateProject }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<PromptCategory>('all');
  const [editingPrompt, setEditingPrompt] = useState<EditingPrompt>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['characters', 'scenes', 'props', 'shots'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleStartEdit = (
    type: 'character' | 'character-variation' | 'scene' | 'prop' | 'keyframe' | 'video',
    id: string,
    currentValue: string,
    variationId?: string,
    shotId?: string
  ) => {
    setEditingPrompt({ type, id, value: currentValue, variationId, shotId });
  };

  const handleSaveEdit = () => {
    if (!editingPrompt) return;

    updateProject((prev: ProjectState) => savePromptEdit(prev, editingPrompt));
    setEditingPrompt(null);
  };

  const handleCancelEdit = () => {
    setEditingPrompt(null);
  };

  const handlePromptChange = (value: string) => {
    if (editingPrompt) {
      setEditingPrompt({ ...editingPrompt, value });
    }
  };

  // Filter data
  const filteredCharacters = category === 'all' || category === 'characters'
    ? filterCharacters(project.scriptData?.characters || [], searchQuery)
    : [];

  const filteredScenes = category === 'all' || category === 'scenes'
    ? filterScenes(project.scriptData?.scenes || [], searchQuery)
    : [];

  const filteredProps = category === 'all' || category === 'props'
    ? filterProps(project.scriptData?.props || [], searchQuery)
    : [];

  const filteredShots = category === 'all' || category === 'keyframes'
    ? filterShots(project.shots || [], searchQuery)
    : [];

  const hasNoData = !project.scriptData && !project.shots.length;

  return (
    <div className="h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] flex flex-col">
      {/* Header */}
      <div className="border-b border-[var(--border-primary)] bg-[var(--bg-base)]/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">提示词管理</h1>
              <p className="text-sm text-[var(--text-tertiary)]">查看和编辑所有生成任务的提示词和变量</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索提示词、角色、场景..."
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-primary)] text-[var(--text-primary)] pl-10 pr-4 py-2 rounded-lg text-sm focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PromptCategory)}
              className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] text-[var(--text-primary)] px-4 py-2 rounded-lg text-sm focus:border-[var(--accent)] focus:outline-none"
            >
              <option value="all">全部</option>
              <option value="characters">角色</option>
              <option value="scenes">场景</option>
              <option value="props">道具</option>
              <option value="keyframes">关键帧</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-6xl mx-auto">
          {project.scriptData && (
            <>
              <CharacterSection
                characters={filteredCharacters}
                isExpanded={expandedSections.has('characters')}
                onToggle={() => toggleSection('characters')}
                editingPrompt={editingPrompt}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onPromptChange={handlePromptChange}
              />

              <SceneSection
                scenes={filteredScenes}
                isExpanded={expandedSections.has('scenes')}
                onToggle={() => toggleSection('scenes')}
                editingPrompt={editingPrompt}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onPromptChange={handlePromptChange}
              />

              <PropSection
                props={filteredProps}
                isExpanded={expandedSections.has('props')}
                onToggle={() => toggleSection('props')}
                editingPrompt={editingPrompt}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onPromptChange={handlePromptChange}
              />
            </>
          )}

          {project.shots.length > 0 && (
            <KeyframeSection
              shots={filteredShots}
              scriptData={project.scriptData}
              isExpanded={expandedSections.has('shots')}
              onToggle={() => toggleSection('shots')}
              editingPrompt={editingPrompt}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onPromptChange={handlePromptChange}
            />
          )}

          {/* Empty State */}
          {hasNoData && (
            <div className="text-center py-16">
              <div className="text-[var(--text-muted)] mb-4">
                <Film className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">暂无提示词数据</p>
                <p className="text-sm mt-2">请先在剧本阶段生成角色和场景，或在导演工作台生成分镜</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StagePrompts;
