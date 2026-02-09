import React from 'react';
import { Monitor, Smartphone, Square } from 'lucide-react';
import { AspectRatio, VideoDuration } from '../types';

interface AspectRatioSelectorProps {
  value: AspectRatio;
  onChange: (value: AspectRatio) => void;
  /** 是否支持方形 (1:1)，默认 true。Veo 模型不支持方形 */
  allowSquare?: boolean;
  /** 紧凑模式，只显示图标 */
  compact?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 横竖屏选择器组件
 * 用于选择图片/视频生成的画面比例
 */
export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
  value,
  onChange,
  allowSquare = true,
  compact = false,
  disabled = false
}) => {
  const options: { value: AspectRatio; label: string; icon: React.ReactNode; desc: string }[] = [
    { 
      value: '16:9', 
      label: '横屏', 
      icon: <Monitor className="w-4 h-4" />,
      desc: '1280x720'
    },
    { 
      value: '9:16', 
      label: '竖屏', 
      icon: <Smartphone className="w-4 h-4" />,
      desc: '720x1280'
    },
    { 
      value: '1:1', 
      label: '方形', 
      icon: <Square className="w-4 h-4" />,
      desc: '720x720'
    },
  ];

  const filteredOptions = allowSquare ? options : options.filter(o => o.value !== '1:1');

  return (
    <div className="flex gap-1">
      {filteredOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => !disabled && onChange(option.value)}
          disabled={disabled}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all
            ${value === option.value
              ? 'bg-[var(--accent)] text-[var(--text-primary)]'
              : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:bg-[var(--border-secondary)] hover:text-[var(--text-secondary)]'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          title={`${option.label} (${option.desc})`}
        >
          {option.icon}
          {!compact && <span>{option.label}</span>}
        </button>
      ))}
    </div>
  );
};

interface VideoDurationSelectorProps {
  value: VideoDuration;
  onChange: (value: VideoDuration) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 视频时长选择器组件
 * 仅用于 Sora-2 模型
 */
export const VideoDurationSelector: React.FC<VideoDurationSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const durations: VideoDuration[] = [4, 8, 12];

  return (
    <div className="flex gap-1">
      {durations.map((d) => (
        <button
          key={d}
          onClick={() => !disabled && onChange(d)}
          disabled={disabled}
          className={`
            px-3 py-1.5 rounded-md text-xs transition-all
            ${value === d
              ? 'bg-[var(--accent)] text-[var(--text-primary)]'
              : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:bg-[var(--border-secondary)] hover:text-[var(--text-secondary)]'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {d}秒
        </button>
      ))}
    </div>
  );
};

interface VideoSettingsPanelProps {
  aspectRatio: AspectRatio;
  onAspectRatioChange: (value: AspectRatio) => void;
  duration: VideoDuration;
  onDurationChange: (value: VideoDuration) => void;
  /** 视频模型类型，veo 不支持方形和时长选择 */
  modelType: 'sora' | 'veo';
  disabled?: boolean;
  /** 支持的横竖屏比例列表 */
  supportedAspectRatios?: AspectRatio[];
  /** 支持的时长列表 */
  supportedDurations?: VideoDuration[];
}

/**
 * 视频设置面板
 * 组合了横竖屏选择和时长选择
 */
export const VideoSettingsPanel: React.FC<VideoSettingsPanelProps> = ({
  aspectRatio,
  onAspectRatioChange,
  duration,
  onDurationChange,
  modelType,
  disabled = false,
  supportedAspectRatios,
  supportedDurations,
}) => {
  // 根据模型支持的比例过滤
  const allowSquare = supportedAspectRatios 
    ? supportedAspectRatios.includes('1:1')
    : modelType === 'sora';
  
  // 是否显示时长选择器
  const showDuration = supportedDurations 
    ? supportedDurations.length > 1
    : modelType === 'sora';
  
  // 可用的时长列表
  const availableDurations = supportedDurations || [4, 8, 12];

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[var(--text-tertiary)] uppercase">比例</span>
        <AspectRatioSelector
          value={aspectRatio}
          onChange={onAspectRatioChange}
          allowSquare={allowSquare}
          disabled={disabled}
        />
      </div>
      
      {showDuration && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--text-tertiary)] uppercase">时长</span>
          <div className="flex gap-1">
            {availableDurations.map((d) => (
              <button
                key={d}
                onClick={() => !disabled && onDurationChange(d)}
                disabled={disabled}
                className={`
                  px-3 py-1.5 rounded-md text-xs transition-all
                  ${duration === d
                    ? 'bg-[var(--accent)] text-[var(--text-primary)]'
                    : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:bg-[var(--border-secondary)] hover:text-[var(--text-secondary)]'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {d}秒
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AspectRatioSelector;
