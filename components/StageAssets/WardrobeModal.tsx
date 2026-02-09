import React, { useState } from 'react';
import { User, X, Shirt, Plus, RefreshCw, Loader2, Upload, AlertCircle } from 'lucide-react';
import { Character, CharacterVariation } from '../../types';
import ImageUploadButton from './ImageUploadButton';
import { generateId } from './utils';

interface WardrobeModalProps {
  character: Character;
  onClose: () => void;
  onAddVariation: (charId: string, name: string, prompt: string) => void;
  onDeleteVariation: (charId: string, varId: string) => void;
  onGenerateVariation: (charId: string, varId: string) => void;
  onUploadVariation: (charId: string, varId: string, file: File) => void;
  onImageClick: (imageUrl: string) => void;
}

const WardrobeModal: React.FC<WardrobeModalProps> = ({
  character,
  onClose,
  onAddVariation,
  onDeleteVariation,
  onGenerateVariation,
  onUploadVariation,
  onImageClick,
}) => {
  const [newVarName, setNewVarName] = useState('');
  const [newVarPrompt, setNewVarPrompt] = useState('');

  const handleAddVariation = () => {
    if (newVarName && newVarPrompt) {
      onAddVariation(character.id, newVarName, newVarPrompt);
      setNewVarName('');
      setNewVarPrompt('');
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-[var(--bg-base)]/90 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="h-16 px-8 border-b border-[var(--border-primary)] flex items-center justify-between shrink-0 bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-hover)] overflow-hidden border border-[var(--border-secondary)]">
              {character.referenceImage && (
                <img src={character.referenceImage} className="w-full h-full object-cover" alt={character.name} />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{character.name}</h3>
              <p className="text-xs text-[var(--text-tertiary)] font-mono uppercase tracking-wider">Wardrobe & Variations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors">
            <X className="w-5 h-5 text-[var(--text-tertiary)]" />
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Base Look */}
            <div>
              <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                <User className="w-4 h-4" /> Base Appearance
              </h4>
              <div className="bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-primary)]">
                <div 
                  className="aspect-video bg-[var(--bg-elevated)] rounded-lg overflow-hidden mb-4 relative cursor-pointer"
                  onClick={() => character.referenceImage && onImageClick(character.referenceImage)}
                >
                  {character.referenceImage ? (
                    <img src={character.referenceImage} className="w-full h-full object-cover" alt="Base" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-[var(--text-muted)]">No Image</div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-[var(--bg-base)]/60 backdrop-blur rounded text-[10px] text-[var(--text-primary)] font-bold uppercase border border-[var(--overlay-border)]">
                    Default
                  </div>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] leading-relaxed font-mono">{character.visualPrompt}</p>
              </div>
            </div>

            {/* Variations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest flex items-center gap-2">
                  <Shirt className="w-4 h-4" /> Variations / Outfits
                </h4>
              </div>

              <div className="space-y-4">
                {/* List */}
                {(character.variations || []).map((variation) => (
                  <div 
                    key={variation.id} 
                    className="flex gap-4 p-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl group hover:border-[var(--border-secondary)] transition-colors"
                  >
                    <div className="w-20 h-24 bg-[var(--bg-elevated)] rounded-lg flex-shrink-0 overflow-hidden relative border border-[var(--border-primary)]">
                      {variation.referenceImage ? (
                        <img 
                          src={variation.referenceImage} 
                          className="w-full h-full object-cover cursor-pointer" 
                          alt={variation.name}
                          onClick={() => onImageClick(variation.referenceImage!)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {variation.status === 'failed' ? (
                            <AlertCircle className="w-6 h-6 text-[var(--error)]" />
                          ) : (
                            <Shirt className="w-6 h-6 text-[var(--text-muted)]" />
                          )}
                        </div>
                      )}
                      {variation.status === 'generating' && (
                        <div className="absolute inset-0 bg-[var(--bg-base)]/60 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 text-[var(--text-primary)] animate-spin" />
                        </div>
                      )}
                      {variation.status === 'failed' && !variation.referenceImage && (
                        <div className="absolute bottom-0 left-0 right-0 bg-[var(--error-hover-bg-strong)] text-[var(--text-primary)] text-[8px] text-center py-0.5">
                          失败
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-bold text-[var(--text-secondary)] text-sm">{variation.name}</h5>
                        <button 
                          onClick={() => onDeleteVariation(character.id, variation.id)} 
                          className="text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[10px] text-[var(--text-tertiary)] line-clamp-2 mb-3 font-mono">{variation.visualPrompt}</p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => onGenerateVariation(character.id, variation.id)}
                          disabled={variation.status === 'generating'}
                          className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors disabled:opacity-50 ${
                            variation.status === 'failed' 
                              ? 'text-[var(--error-text)] hover:text-[var(--error-text)]' 
                              : 'text-[var(--accent-text)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          <RefreshCw className={`w-3 h-3 ${variation.status === 'generating' ? 'animate-spin' : ''}`} />
                          {variation.status === 'failed' ? '重试' : variation.referenceImage ? 'Regenerate' : 'Generate Look'}
                        </button>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--success-text)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors cursor-pointer">
                          <Upload className="w-3 h-3" />
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                onUploadVariation(character.id, variation.id, file);
                                e.target.value = '';
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add New */}
                <div className="p-4 border border-dashed border-[var(--border-primary)] rounded-xl bg-[var(--bg-primary)]/50">
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Variation Name (e.g. Tactical Gear)" 
                      value={newVarName}
                      onChange={(e) => setNewVarName(e.target.value)}
                      className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-secondary)]"
                    />
                    <textarea 
                      placeholder="Visual description of outfit/state..."
                      value={newVarPrompt}
                      onChange={(e) => setNewVarPrompt(e.target.value)}
                      className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-secondary)] resize-none h-16"
                    />
                    <button 
                      onClick={handleAddVariation}
                      disabled={!newVarName || !newVarPrompt}
                      className="w-full py-2 bg-[var(--bg-hover)] hover:bg-[var(--border-secondary)] text-[var(--text-secondary)] rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Add Variation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardrobeModal;
