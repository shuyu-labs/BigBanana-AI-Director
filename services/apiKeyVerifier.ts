const DEFAULT_API_BASE = (process.env.ANTSK_API_BASE || 'https://api.antsk.cn')
  .replace(/\/+$/, '')
  .replace(/\/(v1|v1beta)$/i, '');

const PREFERRED_VERIFY_MODELS = ['gpt-5.1', 'gpt-5.2', 'gpt-5', 'gpt-41'];

const MODEL_NOT_FOUND_PATTERNS = [
  'unknown provider for model',
  'model not found',
  'does not exist',
  'invalid model',
  'unsupported model',
  'not support',
  '未找到模型',
  '模型不存在',
  '模型不支持',
];

const getErrorMessage = async (response: Response): Promise<string> => {
  let errorMessage = `验证失败: ${response.status}`;
  try {
    const errorData = await response.json();
    errorMessage = errorData.error?.message || errorData.message || errorMessage;
  } catch (e) {
    try {
      const text = await response.text();
      if (text) errorMessage = text;
    } catch {
      // ignore
    }
  }
  return errorMessage;
};

const tryGetAvailableModels = async (baseUrl: string, apiKey: string): Promise<string[] | null> => {
  try {
    const response = await fetch(`${baseUrl}/v1/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    if (!response.ok) return null;
    const data = await response.json();
    const ids = Array.isArray(data?.data)
      ? data.data.map((m: any) => m?.id).filter((id: unknown): id is string => typeof id === 'string' && id.length > 0)
      : [];
    return ids.length > 0 ? ids : null;
  } catch {
    return null;
  }
};

const resolveVerifyCandidates = (availableModels: string[] | null): string[] => {
  if (!availableModels || availableModels.length === 0) {
    return [...PREFERRED_VERIFY_MODELS];
  }

  const set = new Set(availableModels);
  const preferred = PREFERRED_VERIFY_MODELS.filter(m => set.has(m));

  if (preferred.length > 0) {
    return preferred;
  }

  return availableModels.slice(0, 5);
};

const isModelUnavailableError = (status: number, message: string): boolean => {
  if (status === 404) return true;
  const lower = message.toLowerCase();
  return MODEL_NOT_FOUND_PATTERNS.some(pattern => lower.includes(pattern));
};

export const verifyApiKeyAgainstBase = async (
  apiKey: string,
  baseUrl?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!apiKey.trim()) {
      return { success: false, message: '请输入 API Key' };
    }

    const url = (baseUrl || DEFAULT_API_BASE)
      .replace(/\/+$/, '')
      .replace(/\/(v1|v1beta)$/i, '');

    const availableModels = await tryGetAvailableModels(url, apiKey);
    const candidates = resolveVerifyCandidates(availableModels);

    let lastError = '验证失败：未拿到可用响应';

    for (const model of candidates) {
      const response = await fetch(`${url}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: '仅返回1' }],
          temperature: 0.1,
          max_tokens: 5,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.choices?.[0]?.message?.content !== undefined) {
          return { success: true, message: `API Key 验证成功（模型: ${model}）` };
        }
        lastError = `模型 ${model} 返回格式异常`;
        continue;
      }

      const errorMessage = await getErrorMessage(response);

      if (!isModelUnavailableError(response.status, errorMessage)) {
        return { success: false, message: errorMessage };
      }

      lastError = `模型 ${model} 不可用：${errorMessage}`;
    }

    return { success: false, message: lastError };
  } catch (error: any) {
    return { success: false, message: error.message || '网络错误' };
  }
};
