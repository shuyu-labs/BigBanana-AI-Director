/**
 * 图片模型适配器
 * 处理 Gemini Image API
 */

import { ImageModelDefinition, ImageGenerateOptions, AspectRatio } from '../../types/model';
import { getApiKeyForModel, getApiBaseUrlForModel, getActiveImageModel } from '../modelRegistry';
import { ApiKeyError } from './chatAdapter';

const CHAT_COMPLETION_IMAGE_ENDPOINT = '/v1/chat/completions';
const CHAT_COMPAT_MODELS = [/gemini-3-pro-image/i];

/**
 * 重试操作
 */
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 2000
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      // 400/401/403/404 错误不重试
      if (error.message?.includes('400') || 
          error.message?.includes('401') || 
          error.message?.includes('403') ||
          error.message?.includes('404')) {
        throw error;
      }
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
};

const getImageSizeByAspectRatio = (aspectRatio: AspectRatio): string => {
  const sizeMap: Record<AspectRatio, string> = {
    '1:1': '1024x1024',
    '16:9': '1280x720',
    '9:16': '720x1280',
  };
  return sizeMap[aspectRatio] || '1024x1024';
};

const parseErrorMessage = async (res: Response): Promise<string> => {
  let errorMessage = `HTTP 错误: ${res.status}`;
  try {
    const errorData = await res.json();
    errorMessage = errorData.error?.message || errorData.message || errorMessage;
  } catch (e) {
    const errorText = await res.text();
    if (errorText) errorMessage = errorText;
  }
  return errorMessage;
};

const isChatCompatModel = (apiModel: string): boolean => {
  return CHAT_COMPAT_MODELS.some((reg) => reg.test(apiModel));
};

const shouldUseChatCompatByEndpoint = (endpoint: string): boolean => {
  return endpoint.includes('/v1/chat/completions');
};

const isRouteOrModelMismatch = (errorMessage: string): boolean => {
  const lower = errorMessage.toLowerCase();
  return (
    lower.includes('unknown provider for model') ||
    lower.includes('model not found') ||
    lower.includes('does not exist') ||
    lower.includes('unsupported model') ||
    lower.includes('not support') ||
    lower.includes('404') ||
    lower.includes('page not found') ||
    lower.includes('not found') ||
    lower.includes('模型不存在') ||
    lower.includes('模型不支持')
  );
};

const blobToDataUrl = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (!result || !result.startsWith('data:image/')) {
        reject(new Error('图片格式转换失败'));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.readAsDataURL(blob);
  });
};

const fetchUrlAsDataUrl = async (url: string): Promise<string> => {
  const imageRes = await fetch(url, { method: 'GET' });
  if (!imageRes.ok) {
    throw new Error(`图片下载失败: ${imageRes.status}`);
  }
  const imageBlob = await imageRes.blob();
  return blobToDataUrl(imageBlob);
};

const tryExtractDataUrl = (text: string): string | null => {
  const dataUrlMatch = text.match(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=\n\r]+/);
  if (dataUrlMatch?.[0]) {
    return dataUrlMatch[0].replace(/[\r\n]/g, '');
  }

  const plainBase64 = text.trim();
  if (/^[A-Za-z0-9+/=]+$/.test(plainBase64) && plainBase64.length > 512) {
    return `data:image/png;base64,${plainBase64}`;
  }

  return null;
};

const tryExtractImageUrl = (text: string): string | null => {
  const markdownImage = text.match(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/i);
  if (markdownImage?.[1]) {
    return markdownImage[1];
  }

  const plainUrl = text.match(/https?:\/\/[^\s)"']+/i);
  return plainUrl?.[0] || null;
};

const extractImageFromChatResponse = async (data: any): Promise<string> => {
  const message = data?.choices?.[0]?.message;
  const content = message?.content;

  const parseText = async (text: string): Promise<string | null> => {
    const dataUrl = tryExtractDataUrl(text);
    if (dataUrl) return dataUrl;

    const imageUrl = tryExtractImageUrl(text);
    if (imageUrl) {
      try {
        return await fetchUrlAsDataUrl(imageUrl);
      } catch (e) {
        // 兼容跨域限制：下载失败时回退为原始 URL
        return imageUrl;
      }
    }

    return null;
  };

  if (typeof content === 'string') {
    const parsed = await parseText(content);
    if (parsed) return parsed;
  }

  if (Array.isArray(content)) {
    for (const part of content) {
      if (typeof part === 'string') {
        const parsed = await parseText(part);
        if (parsed) return parsed;
        continue;
      }

      if (part?.type === 'image_url') {
        const imageUrl = part.image_url?.url;
        if (typeof imageUrl === 'string' && imageUrl) {
          if (imageUrl.startsWith('data:image/')) return imageUrl;
          try {
            return await fetchUrlAsDataUrl(imageUrl);
          } catch (e) {
            // 兼容跨域限制：下载失败时回退为原始 URL
            return imageUrl;
          }
        }
      }

      if (part?.type === 'text' || part?.type === 'output_text') {
        const parsed = await parseText(part.text || '');
        if (parsed) return parsed;
      }
    }
  }

  throw new Error(`图片生成失败：兼容接口返回中未找到图片数据，响应片段：${JSON.stringify(data).slice(0, 500)}`);
};

const callImageApiByChatCompat = async (
  options: ImageGenerateOptions,
  activeModel: ImageModelDefinition,
  apiKey: string,
  apiBase: string,
  apiModel: string,
  aspectRatio: AspectRatio,
): Promise<string> => {
  const messages: any[] = [];

  if (options.referenceImages && options.referenceImages.length > 0) {
    const content = [
      { type: 'text', text: options.prompt },
      ...options.referenceImages.map((url) => ({
        type: 'image_url',
        image_url: { url },
      })),
    ];
    messages.push({ role: 'user', content });
  } else {
    messages.push({ role: 'user', content: options.prompt });
  }

  const requestBody = {
    model: apiModel,
    messages,
    extra_body: {
      size: getImageSizeByAspectRatio(aspectRatio),
    },
  };

  const endpoint = activeModel.endpoint && activeModel.endpoint.trim()
    ? activeModel.endpoint
    : CHAT_COMPLETION_IMAGE_ENDPOINT;

  const response = await retryOperation(async () => {
    const res = await fetch(`${apiBase}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': '*/*',
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const message = await parseErrorMessage(res);
      throw new Error(message);
    }

    return res;
  });

  const data = await response.json();
  return extractImageFromChatResponse(data);
};

/**
 * 调用图片生成 API
 */
export const callImageApi = async (
  options: ImageGenerateOptions,
  model?: ImageModelDefinition
): Promise<string> => {
  // 获取当前激活的模型
  const activeModel = model || getActiveImageModel();
  if (!activeModel) {
    throw new Error('没有可用的图片模型');
  }

  // 获取 API 配置
  const apiKey = getApiKeyForModel(activeModel.id);
  if (!apiKey) {
    throw new ApiKeyError('API Key 缺失，请在设置中配置 API Key');
  }
  
  const apiBase = getApiBaseUrlForModel(activeModel.id);
  const apiModel = activeModel.apiModel || activeModel.id;
  const endpoint = activeModel.endpoint || `/v1beta/models/${apiModel}:generateContent`;
  
  // 确定宽高比
  const aspectRatio = options.aspectRatio || activeModel.params.defaultAspectRatio;

  if (isChatCompatModel(apiModel) && shouldUseChatCompatByEndpoint(endpoint)) {
    return callImageApiByChatCompat(options, activeModel, apiKey, apiBase, apiModel, aspectRatio);
  }
  
  // 构建提示词
  let finalPrompt = options.prompt;
  
  // 如果有参考图，添加一致性指令
  if (options.referenceImages && options.referenceImages.length > 0) {
    finalPrompt = `
      ⚠️⚠️⚠️ CRITICAL REQUIREMENTS - CHARACTER CONSISTENCY ⚠️⚠️⚠️
      
      Reference Images Information:
      - The FIRST image is the Scene/Environment reference.
      - Any subsequent images are Character references (Base Look or Variation).
      
      Task:
      Generate a cinematic shot matching this prompt: "${options.prompt}".
      
      ⚠️ ABSOLUTE REQUIREMENTS (NON-NEGOTIABLE):
      1. Scene Consistency:
         - STRICTLY maintain the visual style, lighting, and environment from the scene reference.
      
      2. Character Consistency - HIGHEST PRIORITY:
         If characters are present in the prompt, they MUST be IDENTICAL to the character reference images:
         • Facial Features: Eyes (color, shape, size), nose structure, mouth shape, facial contours must be EXACTLY the same
         • Hairstyle & Hair Color: Length, color, texture, and style must be PERFECTLY matched
         • Clothing & Outfit: Style, color, material, and accessories must be IDENTICAL
         • Body Type: Height, build, proportions must remain consistent
         
      ⚠️ DO NOT create variations or interpretations of the character - STRICT REPLICATION ONLY!
      ⚠️ Character appearance consistency is THE MOST IMPORTANT requirement!
    `;
  }

  // 构建请求 parts
  const parts: any[] = [{ text: finalPrompt }];

  // 添加参考图片
  if (options.referenceImages) {
    options.referenceImages.forEach((imgUrl) => {
      const match = imgUrl.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    });
  }

  // 构建请求体
  const requestBody: any = {
    contents: [{
      role: 'user',
      parts: parts,
    }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  };
  
  // 非默认宽高比需要添加 imageConfig
  if (aspectRatio !== '16:9') {
    requestBody.generationConfig.imageConfig = {
      aspectRatio: aspectRatio,
    };
  }

  // 调用 API
  try {
    const response = await retryOperation(async () => {
      const res = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': '*/*',
      },
      body: JSON.stringify(requestBody),
    });

      if (!res.ok) {
        if (res.status === 400) {
          throw new Error('提示词可能包含不安全或违规内容，未能处理。请修改后重试。');
        }
        if (res.status === 500) {
          throw new Error('当前请求较多，暂时未能处理成功，请稍后重试。');
        }
        const errorMessage = await parseErrorMessage(res);
        throw new Error(errorMessage);
      }

      return await res.json();
    });

    // 提取 base64 图片
    const candidates = response.candidates || [];
    if (candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error('图片生成失败：未能从响应中提取图片数据');
  } catch (error: any) {
    if (isChatCompatModel(apiModel) && isRouteOrModelMismatch(error?.message || '')) {
      return callImageApiByChatCompat(options, activeModel, apiKey, apiBase, apiModel, aspectRatio);
    }
    throw error;
  }
};

/**
 * 检查宽高比是否支持
 */
export const isAspectRatioSupported = (
  aspectRatio: AspectRatio,
  model?: ImageModelDefinition
): boolean => {
  const activeModel = model || getActiveImageModel();
  if (!activeModel) return false;
  
  return activeModel.params.supportedAspectRatios.includes(aspectRatio);
};
