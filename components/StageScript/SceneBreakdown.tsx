import React from 'react';
import { Clock, List, ArrowLeft, TextQuote } from 'lucide-react';
import { ProjectState, Shot } from '../../types';
import { deduplicateScenes } from './utils';
import CharacterList from './CharacterList';
import SceneList from './SceneList';
import ShotRow from './ShotRow';

interface Props {
  project: ProjectState;
  editingCharacterId: string | null;
  editingCharacterPrompt: string;
  editingShotId: string | null;
  editingShotPrompt: string;
  editingShotCharactersId: string | null;
  editingShotActionId: string | null;
  editingShotActionText: string;
  editingShotDialogueText: string;
  onEditCharacter: (charId: string, prompt: string) => void;
  onSaveCharacter: (charId: string, prompt: string) => void;
  onCancelCharacterEdit: () => void;
  onEditShotPrompt: (shotId: string, prompt: string) => void;
  onSaveShotPrompt: () => void;
  onCancelShotPrompt: () => void;
  onEditShotCharacters: (shotId: string) => void;
  onAddCharacterToShot: (shotId: string, charId: string) => void;
  onRemoveCharacterFromShot: (shotId: string, charId: string) => void;
  onCloseShotCharactersEdit: () => void;
  onEditShotAction: (shotId: string, action: string, dialogue: string) => void;
  onSaveShotAction: () => void;
  onCancelShotAction: () => void;
  onBackToStory: () => void;
}

const SceneBreakdown: React.FC<Props> = ({
  project,
  editingCharacterId,
  editingCharacterPrompt,
  editingShotId,
  editingShotPrompt,
  editingShotCharactersId,
  editingShotActionId,
  editingShotActionText,
  editingShotDialogueText,
  onEditCharacter,
  onSaveCharacter,
  onCancelCharacterEdit,
  onEditShotPrompt,
  onSaveShotPrompt,
  onCancelShotPrompt,
  onEditShotCharacters,
  onAddCharacterToShot,
  onRemoveCharacterFromShot,
  onCloseShotCharactersEdit,
  onEditShotAction,
  onSaveShotAction,
  onCancelShotAction,
  onBackToStory
}) => {
  const uniqueScenes = deduplicateScenes(project.scriptData?.scenes);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)] animate-in fade-in duration-500">
      {/* Header */}
      <div className="h-16 px-6 border-b border-[var(--border-primary)] bg-[var(--bg-sunken)] flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-6">
          <h2 className="text-lg font-light text-[var(--text-primary)] tracking-tight flex items-center gap-3">
            <List className="w-5 h-5 text-[var(--text-tertiary)]" />
            拍摄清单
            <span className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider ml-1">Script Manifest</span>
          </h2>
          <div className="h-6 w-px bg-[var(--border-primary)]"></div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">项目</span>
              <span className="text-sm text-[var(--text-secondary)] font-medium">{project.scriptData?.title}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">时长</span>
              <span className="text-sm font-mono text-[var(--text-tertiary)]">{project.targetDuration}</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onBackToStory}
          className="text-xs font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center gap-2 px-4 py-2 hover:bg-[var(--bg-hover)] rounded-lg transition-all"
        >
          <ArrowLeft className="w-3 h-3" />
          返回编辑
        </button>
      </div>

      {/* Content Split View */}
      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-72 border-r border-[var(--border-primary)] bg-[var(--bg-primary)] flex flex-col hidden lg:flex">
          <div className="p-6 border-b border-[var(--border-subtle)]">
            <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
              <TextQuote className="w-3 h-3" /> 故事梗概
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] italic leading-relaxed font-serif">"{project.scriptData?.logline}"</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <CharacterList
              characters={project.scriptData?.characters || []}
              editingCharacterId={editingCharacterId}
              editingPrompt={editingCharacterPrompt}
              onEdit={onEditCharacter}
              onSave={onSaveCharacter}
              onCancel={onCancelCharacterEdit}
            />

            <SceneList scenes={uniqueScenes} />
          </div>
        </div>

        {/* Main: Script & Shots */}
        <div className="flex-1 overflow-y-auto bg-[var(--bg-base)] p-0">
          <div className="max-w-5xl mx-auto pb-20">
            {project.scriptData?.scenes.map((scene, index) => {
              const sceneShots = project.shots.filter(s => s.sceneId === scene.id);
              if (sceneShots.length === 0) return null;

              return (
                <div key={scene.id} className="border-b border-[var(--border-primary)]">
                  {/* Scene Header */}
                  <div className="sticky top-0 z-10 bg-[var(--bg-sunken)]/95 backdrop-blur border-y border-[var(--border-primary)] px-8 py-5 flex items-center justify-between shadow-lg shadow-black/20">
                    <div className="flex items-baseline gap-4">
                      <span className="text-3xl font-bold text-[var(--text-primary)]/10 font-mono">{(index + 1).toString().padStart(2, '0')}</span>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wider">
                        {scene.location}
                      </h3>
                    </div>
                    <div className="flex gap-4 text-[10px] font-mono uppercase tracking-widest text-[var(--text-tertiary)]">
                      <span className="flex items-center gap-1.5"><Clock className="w-3 h-3"/> {scene.time}</span>
                      <span className="text-[var(--text-muted)]">|</span>
                      <span>{scene.atmosphere}</span>
                    </div>
                  </div>

                  {/* Shot Rows */}
                  <div className="divide-y divide-zinc-800/50">
                    {sceneShots.map((shot) => (
                      <ShotRow
                        key={shot.id}
                        shot={shot}
                        shotNumber={project.shots.indexOf(shot) + 1}
                        scriptData={project.scriptData}
                        editingShotId={editingShotId}
                        editingShotPrompt={editingShotPrompt}
                        editingShotCharactersId={editingShotCharactersId}
                        editingShotActionId={editingShotActionId}
                        editingShotActionText={editingShotActionText}
                        editingShotDialogueText={editingShotDialogueText}
                        onEditPrompt={onEditShotPrompt}
                        onSavePrompt={onSaveShotPrompt}
                        onCancelPrompt={onCancelShotPrompt}
                        onEditCharacters={onEditShotCharacters}
                        onAddCharacter={onAddCharacterToShot}
                        onRemoveCharacter={onRemoveCharacterFromShot}
                        onCloseCharactersEdit={onCloseShotCharactersEdit}
                        onEditAction={onEditShotAction}
                        onSaveAction={onSaveShotAction}
                        onCancelAction={onCancelShotAction}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneBreakdown;
