/**
 * 对话模型适配器
 * 处理 OpenAI 兼容的 Chat Completions API
 */

import { ChatModelDefinition, ChatOptions, ChatModelParams } from '../../types/model';
import { getApiKeyForModel, getApiBaseUrlForModel, getActiveChatModel } from '../modelRegistry';
import { verifyApiKeyAgainstBase } from '../apiKeyVerifier';

/**
 * API Key 错误类
 */
export class ApiKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiKeyError';
  }
}

/**
 * 重试操作
 */
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      // 400/401/403 错误不重试
      if (error.message?.includes('400') || 
          error.message?.includes('401') || 
          error.message?.includes('403')) {
        throw error;
      }
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
};

/**
 * 清理 JSON 响应
 */
const cleanJsonResponse = (response: string): string => {
  let cleaned = response.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/```\s*$/, '');
  return cleaned.trim();
};

/**
 * 调用对话模型 API
 */
export const callChatApi = async (
  options: ChatOptions,
  model?: ChatModelDefinition
): Promise<string> => {
  // 获取当前激活的模型
  const activeModel = model || getActiveChatModel();
  if (!activeModel) {
    throw new Error('没有可用的对话模型');
  }

  // 获取 API 配置
  const apiKey = getApiKeyForModel(activeModel.id);
  if (!apiKey) {
    throw new ApiKeyError('API Key 缺失，请在设置中配置 API Key');
  }
  
  const apiBase = getApiBaseUrlForModel(activeModel.id);
  const endpoint = activeModel.endpoint || '/v1/chat/completions';
  const apiModel = activeModel.apiModel || activeModel.id;
  
  // 合并参数
  const params: ChatModelParams = {
    ...activeModel.params,
    ...options.overrideParams,
  };
  
  // 构建请求体
  const messages: any[] = [];
  
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  
  messages.push({ role: 'user', content: options.prompt });
  
  const requestBody: any = {
    model: apiModel,
    messages,
    temperature: params.temperature,
  };
  if (params.maxTokens !== undefined) {
    requestBody.max_tokens = params.maxTokens;
  }
  
  if (params.topP !== undefined) {
    requestBody.top_p = params.topP;
  }
  if (params.frequencyPenalty !== undefined) {
    requestBody.frequency_penalty = params.frequencyPenalty;
  }
  if (params.presencePenalty !== undefined) {
    requestBody.presence_penalty = params.presencePenalty;
  }
  
  // JSON 格式响应
  if (options.responseFormat === 'json') {
    requestBody.response_format = { type: 'json_object' };
  }
  
  // 超时控制
  const timeout = options.timeout || 600000; // 默认 10 分钟
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await retryOperation(async () => {
      const res = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      
      if (!res.ok) {
        let errorMessage = `HTTP 错误: ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch (e) {
          const errorText = await res.text();
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }
      
      return res;
    });
    
    clearTimeout(timeoutId);
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // 如果是 JSON 格式，清理响应
    if (options.responseFormat === 'json') {
      return cleanJsonResponse(content);
    }
    
    return content;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error(`请求超时 (${timeout / 1000}秒)`);
    }
    
    throw error;
  }
};

/**
 * 验证 API Key
 */
export const verifyApiKey = async (apiKey: string, baseUrl?: string): Promise<{ success: boolean; message: string }> => {
  return verifyApiKeyAgainstBase(apiKey, baseUrl);
};
