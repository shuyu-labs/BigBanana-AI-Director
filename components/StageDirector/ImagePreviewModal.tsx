import React from 'react';
import { X } from 'lucide-react';

interface ImagePreviewModalProps {
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, title, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-[var(--overlay-full)] backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button 
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-[var(--text-primary)] transition-colors z-10"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </button>
      
      {title && (
        <div className="absolute top-6 left-6 z-10">
            <div className="bg-[var(--overlay-medium)] backdrop-blur-sm px-4 py-2 rounded-lg border border-[var(--overlay-border)]">
            <h3 className="text-[var(--text-primary)] font-bold text-sm">{title}</h3>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-center p-8 w-full h-full">
        <img 
          src={imageUrl} 
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          alt={title || 'Preview'}
        />
      </div>
      
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-[var(--overlay-medium)] backdrop-blur-sm px-4 py-2 rounded-full border border-[var(--overlay-border)]">
          <p className="text-[var(--text-primary)]/60 text-xs">点击任意位置关闭</p>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
