/**
 * AI 服务统一导出
 * 所有外部模块应通过此入口引用 AI 服务功能
 */

// 基础设施层
export {
  ApiKeyError,
  setGlobalApiKey,
  verifyApiKey,
  // 以下为内部辅助，但部分场景仍可能直接使用
  retryOperation,
  cleanJsonString,
  chatCompletion,
  chatCompletionStream,
  checkApiKey,
  getApiBase,
  resolveModel,
  resolveRequestModel,
  parseHttpError,
  convertVideoUrlToBase64,
  resizeImageToSize,
  getVeoModelName,
  getSoraVideoSize,
  getActiveChatModelName,
  getActiveModel,
  getActiveChatModel,
  getActiveVideoModel,
  getActiveImageModel,
  // 日志回调
  setScriptLogCallback,
  clearScriptLogCallback,
  logScriptProgress,
} from './apiCore';

// 提示词常量
export {
  VISUAL_STYLE_PROMPTS,
  VISUAL_STYLE_PROMPTS_CN,
  NEGATIVE_PROMPTS,
  SCENE_NEGATIVE_PROMPTS,
  getStylePrompt,
  getStylePromptCN,
  getNegativePrompt,
  getSceneNegativePrompt,
} from './promptConstants';

// 剧本处理服务
export {
  parseScriptToData,
  generateShotList,
  continueScript,
  continueScriptStream,
  rewriteScript,
  rewriteScriptStream,
} from './scriptService';

// 视觉资产生成服务
export {
  generateArtDirection,
  generateAllCharacterPrompts,
  generateVisualPrompts,
  generateImage,
  CHARACTER_TURNAROUND_LAYOUT,
  generateCharacterTurnaroundPanels,
  generateCharacterTurnaroundImage,
} from './visualService';

// 视频生成服务
export {
  generateVideo,
} from './videoService';

// 分镜辅助服务
export {
  optimizeBothKeyframes,
  optimizeKeyframePrompt,
  generateActionSuggestion,
  splitShotIntoSubShots,
  enhanceKeyframePrompt,
  generateNineGridPanels,
  generateNineGridImage,
} from './shotService';
