import React from 'react';
import { MapPin, User, Clock, X, Shirt, Edit2, Package } from 'lucide-react';
import { Shot, Character, Scene, Prop } from '../../types';

interface SceneContextProps {
  shot: Shot;
  scene?: Scene;
  scenes?: Scene[]; // 所有可用场景列表
  characters: Character[];
  availableCharacters: Character[];
  props?: Prop[]; // 当前镜头关联的道具
  availableProps?: Prop[]; // 可以添加的道具
  onAddCharacter: (charId: string) => void;
  onRemoveCharacter: (charId: string) => void;
  onVariationChange: (charId: string, varId: string) => void;
  onSceneChange?: (sceneId: string) => void; // 场景切换回调
  onAddProp?: (propId: string) => void;
  onRemoveProp?: (propId: string) => void;
}

const SceneContext: React.FC<SceneContextProps> = ({
  shot,
  scene,
  scenes = [],
  characters,
  availableCharacters,
  props = [],
  availableProps = [],
  onAddCharacter,
  onRemoveCharacter,
  onVariationChange,
  onSceneChange,
  onAddProp,
  onRemoveProp
}) => {
  return (
    <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-primary)] mb-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-4 h-4 text-[var(--text-tertiary)]" />
        <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
          场景环境 (Scene Context)
        </h4>
      </div>
      
      <div className="flex gap-4 min-w-0">
        <div className="w-28 h-20 bg-[var(--bg-elevated)] rounded-lg overflow-hidden flex-shrink-0 border border-[var(--border-secondary)] relative">
          {scene?.referenceImage ? (
            <img src={scene.referenceImage} className="w-full h-full object-cover" alt={scene.location} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--bg-hover)]">
              <MapPin className="w-6 h-6 text-[var(--text-muted)]" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col gap-1.5 overflow-hidden justify-center">
          {/* Scene Name Selection */}
          <div className="relative group min-w-0">
            {onSceneChange && scenes.length > 1 ? (
              <div className="relative flex items-center">
                <select
                  value={shot.sceneId}
                  onChange={(e) => onSceneChange(e.target.value)}
                  className="w-full appearance-none bg-transparent text-[var(--text-primary)] text-sm font-bold pr-6 outline-none hover:text-[var(--accent)] transition-colors cursor-pointer truncate"
                  title={scene?.location}
                >
                  {scenes.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.location}
                    </option>
                  ))}
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-tertiary)] group-hover:text-[var(--accent)]">
                  <Edit2 className="w-3 h-3" />
                </div>
              </div>
            ) : (
              <div className="text-[var(--text-primary)] text-sm font-bold truncate" title={scene?.location}>
                {scene?.location || '未知场景'}
              </div>
            )}
          </div>

          {/* Time & Atmosphere Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <Clock className="w-3 h-3 shrink-0" />
              <span className="truncate opacity-80" title={scene?.time}>
                {scene?.time || '未设置时间'}
              </span>
            </div>
            
            {scene?.atmosphere && (
              <p className="text-xs text-[var(--text-tertiary)] line-clamp-2 break-all leading-relaxed" title={scene.atmosphere}>
                {scene.atmosphere}
              </p>
            )}
          </div>
          
          {/* Character List */}
          <div className="flex flex-col gap-2 pt-2">
            {characters.map(char => {
              const hasVars = char.variations && char.variations.length > 0;
              const selectedVarId = shot.characterVariations?.[char.id];
              
              return (
                <div 
                  key={char.id} 
                  className="flex items-center justify-between bg-[var(--bg-elevated)] rounded p-1.5 border border-[var(--border-primary)] group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[var(--border-secondary)] overflow-hidden flex-shrink-0">
                      {char.referenceImage && (
                        <img src={char.referenceImage} className="w-full h-full object-cover" alt={char.name} />
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--text-secondary)] font-medium">{char.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {hasVars && (
                      <select
                        value={selectedVarId || ''}
                        onChange={(e) => onVariationChange(char.id, e.target.value)}
                        className="text-[10px] bg-[var(--bg-hover)] text-[var(--text-tertiary)] border border-[var(--border-secondary)] rounded px-1.5 py-0.5 outline-none"
                      >
                        <option value="">基础造型</option>
                        {char.variations!.map(v => (
                          <option key={v.id} value={v.id}>
                            <Shirt className="w-2 h-2 inline mr-1" />
                            {v.name}
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={() => onRemoveCharacter(char.id)}
                      className="p-1 text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-bg)] rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="移除角色"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {/* Add Character Selector */}
            {availableCharacters.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <select 
                  onChange={(e) => {
                    if (e.target.value) {
                      onAddCharacter(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="flex-1 bg-[var(--bg-elevated)] text-[11px] text-[var(--text-tertiary)] border border-[var(--border-secondary)] rounded px-2 py-1.5 outline-none focus:border-[var(--accent)] hover:border-[var(--border-secondary)] transition-colors"
                >
                  <option value="">+ 添加角色到此镜头</option>
                  {availableCharacters.map(char => (
                    <option key={char.id} value={char.id}>{char.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Props List */}
          {(props.length > 0 || availableProps.length > 0) && (
            <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-[var(--border-primary)]">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest">道具 (Props)</span>
              </div>
              
              {props.map(prop => (
                <div 
                  key={prop.id} 
                  className="flex items-center justify-between bg-[var(--bg-elevated)] rounded p-1.5 border border-[var(--border-primary)] group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[var(--border-secondary)] overflow-hidden flex-shrink-0">
                      {prop.referenceImage ? (
                        <img src={prop.referenceImage} className="w-full h-full object-cover" alt={prop.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-3 h-3 text-[var(--text-muted)]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--text-secondary)] font-medium">{prop.name}</span>
                    <span className="text-[9px] text-[var(--text-muted)] font-mono bg-[var(--bg-hover)] px-1 py-0.5 rounded">{prop.category}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {onRemoveProp && (
                      <button
                        onClick={() => onRemoveProp(prop.id)}
                        className="p-1 text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-bg)] rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="移除道具"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Add Prop Selector */}
              {onAddProp && availableProps.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <select 
                    onChange={(e) => {
                      if (e.target.value) {
                        onAddProp(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    className="flex-1 bg-[var(--bg-elevated)] text-[11px] text-[var(--text-tertiary)] border border-[var(--border-secondary)] rounded px-2 py-1.5 outline-none focus:border-[var(--accent)] hover:border-[var(--border-secondary)] transition-colors"
                  >
                    <option value="">+ 添加道具到此镜头</option>
                    {availableProps.map(prop => (
                      <option key={prop.id} value={prop.id}>{prop.name} ({prop.category})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SceneContext;
