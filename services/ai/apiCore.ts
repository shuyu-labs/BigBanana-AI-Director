/**
 * API 基础设施层
 * 统一的 API 调用、重试、错误处理、JSON 清理等工具函数
 */

import { AspectRatio } from "../../types";
import {
  getGlobalApiKey as getRegistryApiKey,
  setGlobalApiKey as setRegistryApiKey,
  getApiBaseUrlForModel,
  getApiKeyForModel,
  getModelById,
  getModels,
  getActiveModel,
  getActiveChatModel,
  getActiveVideoModel,
  getActiveImageModel,
} from '../modelRegistry';

// ============================================
// 脚本日志回调（供各服务模块使用）
// ============================================

type ScriptLogCallback = (message: string) => void;

let scriptLogCallback: ScriptLogCallback | null = null;

export const setScriptLogCallback = (callback: ScriptLogCallback) => {
  scriptLogCallback = callback;
};

export const clearScriptLogCallback = () => {
  scriptLogCallback = null;
};

export const logScriptProgress = (message: string) => {
  if (scriptLogCallback) {
    scriptLogCallback(message);
  }
};

// ============================================
// API Key 管理
// ============================================

/**
 * API Key 错误类
 */
export class ApiKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiKeyError';
  }
}

/** 运行时 API Key（向后兼容） */
let runtimeApiKey: string = process.env.API_KEY || "";

/**
 * 设置全局API密钥
 */
export const setGlobalApiKey = (key: string) => {
  runtimeApiKey = key;
  setRegistryApiKey(key);
};

/** 默认 API base URL（向后兼容） */
const DEFAULT_API_BASE = 'https://api.antsk.cn';

/**
 * 解析模型：根据 type 和可选 modelId 找到对应的模型配置
 */
export const resolveModel = (type: 'chat' | 'image' | 'video', modelId?: string) => {
  if (modelId) {
    const model = getModelById(modelId);
    if (model && model.type === type) return model;
    const candidates = getModels(type).filter(m => m.apiModel === modelId);
    if (candidates.length === 1) return candidates[0];
  }
  return getActiveModel(type);
};

/**
 * 解析请求用的模型名称（apiModel 字段）
 */
export const resolveRequestModel = (type: 'chat' | 'image' | 'video', modelId?: string): string => {
  const resolved = resolveModel(type, modelId);
  return resolved?.apiModel || resolved?.id || modelId || '';
};

/**
 * 检查并返回 API Key
 * @throws {ApiKeyError} 如果 API Key 缺失
 */
export const checkApiKey = (type: 'chat' | 'image' | 'video' = 'chat', modelId?: string): string => {
  const resolvedModel = resolveModel(type, modelId);
  console.log(`[checkApiKey] type=${type}, modelId=${modelId}, resolvedModel=`, resolvedModel?.id, resolvedModel?.providerId);

  if (resolvedModel) {
    const modelApiKey = getApiKeyForModel(resolvedModel.id);
    console.log(`[checkApiKey] modelApiKey found:`, !!modelApiKey, modelApiKey ? '(has key)' : '(no key)');
    if (modelApiKey) return modelApiKey;
  }

  const registryKey = getRegistryApiKey();
  console.log(`[checkApiKey] registryKey found:`, !!registryKey);
  if (registryKey) return registryKey;

  console.log(`[checkApiKey] runtimeApiKey found:`, !!runtimeApiKey);
  if (!runtimeApiKey) throw new ApiKeyError("API Key 缺失，请在模型配置中设置 API Key。");
  return runtimeApiKey;
};

/**
 * 获取 API 基础 URL
 */
export const getApiBase = (type: 'chat' | 'image' | 'video' = 'chat', modelId?: string): string => {
  try {
    const resolvedModel = resolveModel(type, modelId);
    if (resolvedModel) {
      return getApiBaseUrlForModel(resolvedModel.id);
    }
    return DEFAULT_API_BASE;
  } catch (e) {
    return DEFAULT_API_BASE;
  }
};

/**
 * 获取当前激活的对话模型名称
 */
export const getActiveChatModelName = (): string => {
  try {
    const model = getActiveChatModel();
    return model?.apiModel || model?.id || 'gpt-5.1';
  } catch (e) {
    return 'gpt-5.1';
  }
};

// Re-export modelRegistry helpers that other modules may need
export { getActiveModel, getActiveChatModel, getActiveVideoModel, getActiveImageModel };

// ============================================
// 通用工具函数
// ============================================

/**
 * 重试操作辅助函数，用于处理429限流、超时、服务器错误等临时性错误
 * 采用指数退避策略
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 2000
): Promise<T> => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (e: any) {
      lastError = e;
      const isRetryableError =
        e.status === 429 ||
        e.code === 429 ||
        e.status === 504 ||
        e.message?.includes('429') ||
        e.message?.includes('quota') ||
        e.message?.includes('RESOURCE_EXHAUSTED') ||
        e.message?.includes('超时') ||
        e.message?.includes('timeout') ||
        e.message?.includes('Gateway Timeout') ||
        e.message?.includes('504') ||
        e.message?.includes('ECONNRESET') ||
        e.message?.includes('ETIMEDOUT') ||
        e.message?.includes('network') ||
        e.message?.includes('openai_error') ||
        e.status >= 500;

      if (isRetryableError && i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        console.warn(`请求失败，正在重试... (第 ${i + 1}/${maxRetries} 次，${delay}ms后重试)`, e.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw e;
    }
  }
  throw lastError;
};

/**
 * 清理AI返回的JSON字符串，移除markdown代码块标记
 */
export const cleanJsonString = (str: string): string => {
  if (!str) return "{}";
  let cleaned = str.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/```\s*$/, '');
  return cleaned.trim();
};

/**
 * 从 HTTP 错误响应中解析错误信息，返回带 status 属性的 Error
 */
export const parseHttpError = async (response: Response): Promise<Error> => {
  const httpStatus = response.status;
  let errorMessage = `HTTP错误: ${httpStatus}`;
  try {
    const errorData = await response.json();
    errorMessage = errorData.error?.message || errorMessage;
  } catch (e) {
    try {
      const errorText = await response.text();
      if (errorText) errorMessage = errorText;
    } catch {
      // ignore
    }
  }
  const err: any = new Error(errorMessage);
  err.status = httpStatus;
  return err;
};

// ============================================
// Chat Completion API
// ============================================

/**
 * 调用聊天完成API（非流式）
 */
export const chatCompletion = async (
  prompt: string,
  model: string = 'gpt-5.1',
  temperature: number = 0.7,
  maxTokens: number = 8192,
  responseFormat?: 'json_object',
  timeout: number = 600000
): Promise<string> => {
  const apiKey = checkApiKey('chat', model);
  const requestModel = resolveRequestModel('chat', model);

  const requestBody: any = {
    model: requestModel,
    messages: [{ role: 'user', content: prompt }],
    temperature: temperature
  };

  if (responseFormat === 'json_object') {
    requestBody.response_format = { type: 'json_object' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const apiBase = getApiBase('chat', model);
    const resolved = resolveModel('chat', model);
    const endpoint = resolved?.endpoint || '/v1/chat/completions';
    const response = await fetch(`${apiBase}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    if (!response.ok) {
      throw await parseHttpError(response);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`请求超时（${timeout}ms）`);
    }
    throw error;
  }
};

/**
 * 调用聊天完成API（SSE流式模式）
 */
export const chatCompletionStream = async (
  prompt: string,
  model: string = 'gpt-5.1',
  temperature: number = 0.7,
  responseFormat: 'json_object' | undefined,
  timeout: number = 600000,
  onDelta?: (delta: string) => void
): Promise<string> => {
  const apiKey = checkApiKey('chat', model);
  const requestModel = resolveRequestModel('chat', model);
  const requestBody: any = {
    model: requestModel,
    messages: [{ role: 'user', content: prompt }],
    temperature: temperature,
    stream: true
  };

  if (responseFormat === 'json_object') {
    requestBody.response_format = { type: 'json_object' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const apiBase = getApiBase('chat', model);
    const resolved = resolveModel('chat', model);
    const endpoint = resolved?.endpoint || '/v1/chat/completions';
    const response = await fetch(`${apiBase}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    if (!response.ok) {
      throw await parseHttpError(response);
    }

    if (!response.body) {
      throw new Error('响应流为空，无法进行流式处理');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let fullText = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let boundaryIndex = buffer.indexOf('\n\n');
      while (boundaryIndex !== -1) {
        const chunk = buffer.slice(0, boundaryIndex).trim();
        buffer = buffer.slice(boundaryIndex + 2);

        if (chunk) {
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const dataStr = line.replace(/^data:\s*/, '');
            if (dataStr === '[DONE]') {
              clearTimeout(timeoutId);
              return fullText;
            }
            try {
              const payload = JSON.parse(dataStr);
              const delta = payload?.choices?.[0]?.delta?.content || payload?.choices?.[0]?.message?.content || '';
              if (delta) {
                fullText += delta;
                onDelta?.(delta);
              }
            } catch (e) {
              // 忽略解析失败的行
            }
          }
        }

        boundaryIndex = buffer.indexOf('\n\n');
      }
    }

    clearTimeout(timeoutId);
    return fullText;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`请求超时（${timeout}ms）`);
    }
    throw error;
  }
};

// ============================================
// API Key 验证
// ============================================

/**
 * 验证 API Key 的连通性
 */
export const verifyApiKey = async (key: string): Promise<{ success: boolean; message: string }> => {
  try {
    const apiBase = getApiBase('chat');
    const response = await fetch(`${apiBase}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'gpt-41',
        messages: [{ role: 'user', content: '仅返回1' }],
        temperature: 0.1,
        max_tokens: 5
      })
    });

    if (!response.ok) {
      let errorMessage = `验证失败: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // ignore
      }
      return { success: false, message: errorMessage };
    }

    const data = await response.json();
    if (data.choices?.[0]?.message?.content !== undefined) {
      return { success: true, message: 'API Key 验证成功' };
    } else {
      return { success: false, message: '返回格式异常' };
    }
  } catch (error: any) {
    return { success: false, message: error.message || '网络错误' };
  }
};

// ============================================
// 媒体工具函数
// ============================================

/**
 * 将视频URL转换为base64格式
 */
export const convertVideoUrlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`下载视频失败: HTTP ${response.status}`);
    }
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = () => {
        reject(new Error('转换视频为base64失败'));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error: any) {
    console.error('视频URL转base64失败:', error);
    throw new Error(`视频转换失败: ${error.message}`);
  }
};

/**
 * 调整图片尺寸到指定宽高（cover模式，保持比例居中裁剪）
 */
export const resizeImageToSize = async (base64Data: string, targetWidth: number, targetHeight: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法创建canvas上下文'));
        return;
      }
      const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const offsetX = (targetWidth - scaledWidth) / 2;
      const offsetY = (targetHeight - scaledHeight) / 2;
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      const result = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
      resolve(result);
    };
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = `data:image/png;base64,${base64Data}`;
  });
};

// ============================================
// 视频模型辅助
// ============================================

/**
 * 获取 Veo 模型名称（根据横竖屏和是否有参考图）
 */
export const getVeoModelName = (hasReferenceImage: boolean, aspectRatio: AspectRatio): string => {
  const orientation = aspectRatio === '9:16' ? 'portrait' : 'landscape';
  if (hasReferenceImage) {
    return `veo_3_1_i2v_s_fast_fl_${orientation}`;
  } else {
    return `veo_3_1_t2v_fast_${orientation}`;
  }
};

/**
 * 根据横竖屏比例获取 Sora 视频尺寸
 */
export const getSoraVideoSize = (aspectRatio: AspectRatio): string => {
  const sizeMap: Record<AspectRatio, string> = {
    '16:9': '1280x720',
    '9:16': '720x1280',
    '1:1': '720x720',
  };
  return sizeMap[aspectRatio];
};
