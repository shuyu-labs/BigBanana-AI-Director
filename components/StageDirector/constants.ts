// UI样式常量
export const STYLES = {
  // 容器样式
  mainContainer: "flex flex-col h-full bg-[var(--bg-secondary)] relative overflow-hidden",
  toolbar: "h-16 border-b border-[var(--border-primary)] bg-[var(--bg-elevated)] px-6 flex items-center justify-between shrink-0",
  workbench: "w-[480px] bg-[var(--bg-deep)] flex flex-col h-full shadow-2xl animate-in slide-in-from-right-10 duration-300 relative z-20",
  workbenchHeader: "h-16 px-6 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-surface)] shrink-0",
  workbenchContent: "flex-1 overflow-y-auto p-6 space-y-8",
  
  // 卡片样式
  card: "group relative flex flex-col bg-[var(--bg-elevated)] border rounded-xl overflow-hidden cursor-pointer transition-all duration-200",
  cardActive: "border-[var(--accent)] ring-1 ring-[var(--accent-border)] shadow-xl scale-[0.98]",
  cardInactive: "border-[var(--border-primary)] hover:border-[var(--border-secondary)] hover:shadow-lg",
  
  // 按钮样式
  primaryButton: "px-4 py-2 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)] rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 shadow-lg shadow-[var(--btn-primary-shadow)]",
  secondaryButton: "px-4 py-2 bg-[var(--bg-surface)] text-[var(--text-tertiary)] border border-[var(--border-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-primary)] rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2",
  iconButton: "p-2 hover:bg-[var(--bg-hover)] rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors",
  
  // 模态框样式
  modalOverlay: "fixed inset-0 z-50 bg-[var(--overlay-heavy)] backdrop-blur-sm flex items-center justify-center p-4",
  modalContainer: "bg-[var(--bg-elevated)] border border-[var(--border-secondary)] rounded-xl p-6 max-w-2xl w-full space-y-4 shadow-2xl",
  modalTextarea: "w-full h-64 bg-[var(--bg-base)] text-[var(--text-primary)] border border-[var(--border-secondary)] rounded-lg p-4 text-sm outline-none focus:border-[var(--accent)] transition-colors resize-none",
  
  // 内容区域
  sectionHeader: "flex items-center gap-2 border-b border-[var(--border-primary)] pb-2",
  contentBox: "bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-primary)]",
};

// 视觉风格配置
export const VISUAL_STYLE_PROMPTS: Record<string, string> = {
  'live-action': 'photorealistic, cinematic film quality, real human actors, professional cinematography, natural lighting, 8K resolution',
  'anime': 'Japanese anime style, cel-shaded, vibrant colors, expressive eyes, dynamic poses, Studio Ghibli/Makoto Shinkai quality',
  '2d-animation': 'classic 2D animation, hand-drawn style, Disney/Pixar quality, smooth lines, expressive characters, painterly backgrounds',
  '3d-animation': 'high-quality 3D CGI animation, Pixar/DreamWorks style, subsurface scattering, detailed textures, stylized characters',
  'cyberpunk': 'cyberpunk aesthetic, neon-lit, rain-soaked streets, holographic displays, high-tech low-life, Blade Runner style',
  'oil-painting': 'oil painting style, visible brushstrokes, rich textures, classical art composition, museum quality fine art',
};

// 视频提示词模板
export const VIDEO_PROMPT_TEMPLATES = {
  sora2: {
    chinese: `基于提供的参考图片生成视频。

动作描述：{actionSummary}

技术要求：
- 关键：视频必须从参考图片的精确构图和画面内容开始，自然展开后续动作
- 镜头运动：{cameraMovement}
- 运动：确保动作流畅自然，避免突兀的跳跃或不连续
- 视觉风格：电影质感，全程保持一致的光照和色调
- 细节：保持角色外观和场景环境的全程一致性
- 语言：配音和字幕使用中文`,
    
    english: `Generate a video based on the provided reference image.

Action Description: {actionSummary}

Technical Requirements:
- CRITICAL: The video MUST begin with the exact composition and content of the reference image, then naturally develop the subsequent action
- Camera Movement: {cameraMovement}
- Motion: Ensure smooth and natural movement, avoid abrupt jumps or discontinuities
- Visual Style: Cinematic quality with consistent lighting and color tone throughout
- Details: Maintain character appearance and scene environment consistency throughout
- Language: Use {language} for voiceover and subtitles`
  },
  
  // 九宫格分镜模式的视频提示词（Sora-2 专用，精简版，避免超过8192字符限制）
  // 保留9个面板的景别/角度顺序，但description截断控制总长度
  sora2NineGrid: {
    chinese: `⚠️ 最高优先级指令：参考图是3x3九宫格分镜板，严禁在视频中展示！视频第一帧必须是面板1的全屏场景画面。
⛔ 绝对禁止：不要在视频任何帧展示九宫格原图、网格画面、缩略图集或多画面拼贴。

动作描述：{actionSummary}

九宫格镜头顺序（参考图从左到右、从上到下）：
{panelDescriptions}

视频从面板1全屏画面开始，按1→9顺序切换视角，形成蒙太奇剪辑。
每个视角约{secondsPerPanel}秒，镜头运动：{cameraMovement}
保持角色外观一致，电影质感，中文配音。`,

    english: `⚠️ HIGHEST PRIORITY: The reference image is a 3x3 storyboard grid — NEVER show it in the video! The first frame MUST be the full-screen scene from Panel 1.
⛔ FORBIDDEN: Do NOT show the grid image, grid lines, thumbnail collection, or multi-panel layout in ANY frame.

Action: {actionSummary}

Storyboard shot sequence (reference grid, left-to-right, top-to-bottom):
{panelDescriptions}

Start video with Panel 1 full-screen, transition through 1→9 as a montage.
~{secondsPerPanel}s per angle. Camera: {cameraMovement}
Maintain character consistency, cinematic quality. Language: {language}.`
  },

  veo: {
    simple: `{actionSummary}

镜头运动：{cameraMovement}
配音语言：使用{language}配音`
  }
};

// 默认配置
export const DEFAULTS = {
  videoModel: 'sora-2' as const,
  batchGenerateDelay: 3000, // 批量生成延迟（毫秒）
};

// ============================================
// 九宫格分镜预览相关常量（高级功能）
// ============================================

export const NINE_GRID = {
  panelCount: 9,
  // 典型景别列表
  defaultShotSizes: ['远景', '全景', '中全景', '中景', '中近景', '近景', '特写', '大特写', '极端特写'],
  // 典型机位角度列表
  defaultCameraAngles: ['俯拍', '平视', '仰拍', '侧面', '正面', '背面', '斜拍', '鸟瞰', '低角度'],
  // 九宫格位置标签
  positionLabels: [
    '左上 (Top-Left)', '中上 (Top-Center)', '右上 (Top-Right)',
    '左中 (Middle-Left)', '正中 (Center)', '右中 (Middle-Right)',
    '左下 (Bottom-Left)', '中下 (Bottom-Center)', '右下 (Bottom-Right)'
  ],
};

// 九宫格 AI 拆分提示词模板（Chat 模型使用）
export const NINE_GRID_SPLIT_PROMPT = {
  system: `你是一位专业的电影分镜师和摄影指导。你的任务是将一个镜头动作拆解为9个不同的摄影视角，用于九宫格分镜预览。
每个视角必须展示相同场景的不同景别和机位角度组合，确保覆盖从远景到特写、从俯拍到仰拍的多样化视角。`,

  user: `请将以下镜头动作拆解为9个不同的摄影视角，用于生成一张3x3九宫格分镜图。

【镜头动作】{actionSummary}
【原始镜头运动】{cameraMovement}
【场景信息】地点: {location}, 时间: {time}, 氛围: {atmosphere}
【角色】{characters}
【视觉风格】{visualStyle}

请按照以下要求返回JSON格式数据：
1. 9个视角必须覆盖不同的景别和角度组合，避免重复
2. 建议覆盖：建立镜头(远/全景)、人物交互(中景)、情绪表达(近景/特写)、氛围细节(各种角度)
3. 每个视角的description必须包含具体的画面内容描述（角色位置、动作、表情、环境细节等）
4. description使用英文撰写，但可以包含场景和角色的中文名称

请严格按照以下JSON格式输出，不要包含其他文字：
{
  "panels": [
    {
      "index": 0,
      "shotSize": "远景",
      "cameraAngle": "俯拍",
      "description": "Establishing aerial shot showing..."
    },
    {
      "index": 1,
      "shotSize": "中景",
      "cameraAngle": "平视",
      "description": "Medium shot at eye level..."
    }
  ]
}

注意：必须恰好返回9个panel（index 0-8），按照九宫格从左到右、从上到下的顺序排列。`
};

// 九宫格图片生成提示词模板（Gemini Image 使用）
export const NINE_GRID_IMAGE_PROMPT_TEMPLATE = {
  prefix: `Generate a SINGLE image composed as a cinematic storyboard with a 3x3 grid layout (9 equal panels).
The image shows the SAME scene from 9 DIFFERENT camera angles and shot sizes.
Each panel is separated by thin white borders.

Visual Style: {visualStyle}

Grid Layout (left to right, top to bottom):`,

  panelTemplate: `Panel {index} ({position}): [{shotSize} / {cameraAngle}] - {description}`,

  suffix: `CRITICAL REQUIREMENTS:
- The output MUST be a SINGLE image divided into exactly 9 equal rectangular panels in a 3x3 grid layout
- Each panel MUST have a thin white border/separator (2-3px) between panels
- All 9 panels show the SAME scene from DIFFERENT camera angles and shot sizes
- Maintain STRICT character consistency across ALL panels (same face, hair, clothing, body proportions)
- Maintain consistent lighting, color palette, and atmosphere across all panels
- Each panel should be a complete, well-composed frame suitable for use as a keyframe
- The overall image should read as a professional cinematographer's shot planning board`
};
