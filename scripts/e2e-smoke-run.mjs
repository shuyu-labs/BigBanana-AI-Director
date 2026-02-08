import fs from 'node:fs/promises';
import path from 'node:path';

const API_BASE = (process.env.ANTSK_API_BASE || 'http://127.0.0.1:8317')
  .replace(/\/+$/, '')
  .replace(/\/(v1|v1beta)$/i, '');
const API_KEY = process.env.ANTSK_API_KEY;
const CHAT_MODEL = process.env.SMOKE_CHAT_MODEL || 'gpt-5.1';
const IMAGE_MODEL = process.env.SMOKE_IMAGE_MODEL || 'gemini-3-pro-image-preview';

const now = new Date();
const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
const outDir = path.resolve(process.cwd(), 'artifacts', `e2e-smoke-${stamp}`);

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
};

const ensureDir = async () => {
  await fs.mkdir(outDir, { recursive: true });
};

const writeJson = async (name, data) => {
  const p = path.join(outDir, name);
  await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf8');
  return p;
};

const writeText = async (name, text) => {
  const p = path.join(outDir, name);
  await fs.writeFile(p, text, 'utf8');
  return p;
};

const postChat = async (body) => {
  const res = await fetch(`${API_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`chat failed ${res.status}: ${txt.slice(0, 600)}`);
  }

  return res.json();
};

const parseJsonContent = (raw) => {
  const cleaned = String(raw || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();
  return JSON.parse(cleaned);
};

const getImageBase64 = (data) => {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const item = parts.find((p) => p?.inlineData?.data);
  return item?.inlineData?.data || null;
};

const generateImage = async (prompt, outputName) => {
  const res = await fetch(`${API_BASE}/v1beta/models/${IMAGE_MODEL}:generateContent`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`image failed ${res.status}: ${txt.slice(0, 600)}`);
  }

  const data = await res.json();
  const b64 = getImageBase64(data);
  if (!b64) {
    throw new Error(`image response has no inlineData: ${JSON.stringify(data).slice(0, 800)}`);
  }

  const imgPath = path.join(outDir, outputName);
  await fs.writeFile(imgPath, Buffer.from(b64, 'base64'));
  return { imgPath, raw: data };
};

const tryCreateVideoTask = async (prompt) => {
  const form = new FormData();
  form.append('model', 'sora-2');
  form.append('prompt', prompt);
  form.append('seconds', '4');
  form.append('size', '1280x720');

  const res = await fetch(`${API_BASE}/v1/videos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    body: form,
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  return {
    ok: res.ok,
    status: res.status,
    body: json,
  };
};

const main = async () => {
  if (!API_KEY) {
    throw new Error('Missing required env: ANTSK_API_KEY');
  }

  await ensureDir();

  const storySeed = `雨夜，废弃火车站。
前刑警林峥收到一盘旧录音带，里面是三年前失踪妹妹留下的求救片段。
他必须在天亮前找到站台下方的密室，否则关键证据会被销毁。`;

  const scriptPrompt = `请将以下故事改写成短片企划 JSON，仅返回 JSON：
${storySeed}

字段要求：
{
  "title": "string",
  "genre": "string",
  "logline": "string",
  "characters": [{"id":"1","name":"","gender":"","age":"","personality":""}],
  "scenes": [{"id":"1","location":"","time":"","atmosphere":""}],
  "storyParagraphs": [{"id":1,"text":"","sceneRefId":"1"}]
}`;

  const scriptResp = await postChat({
    model: CHAT_MODEL,
    messages: [{ role: 'user', content: scriptPrompt }],
    response_format: { type: 'json_object' },
    temperature: 0.6,
    max_tokens: 2000,
  });

  const scriptContent = scriptResp?.choices?.[0]?.message?.content || '{}';
  const scriptData = parseJsonContent(scriptContent);
  await writeJson('01_script_data.json', scriptData);

  const shotsPrompt = `基于下述剧本 JSON，生成 6 条分镜，仅返回 JSON：
${JSON.stringify(scriptData)}

格式：
{
  "shots": [
    {
      "id":"1",
      "sceneId":"1",
      "actionSummary":"",
      "dialogue":"",
      "cameraMovement":"",
      "shotSize":"",
      "characters":["1"]
    }
  ]
}`;

  const shotsResp = await postChat({
    model: CHAT_MODEL,
    messages: [{ role: 'user', content: shotsPrompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 2500,
  });

  const shotsContent = shotsResp?.choices?.[0]?.message?.content || '{}';
  const shotsData = parseJsonContent(shotsContent);
  await writeJson('02_shots.json', shotsData);

  const firstChar = scriptData.characters?.[0] || { name: '林峥', gender: '男', age: '30', personality: '冷静、执着' };
  const firstScene = scriptData.scenes?.[0] || { location: '废弃火车站', time: '深夜', atmosphere: '潮湿、悬疑' };

  const charPromptResp = await postChat({
    model: CHAT_MODEL,
    messages: [{
      role: 'user',
      content: `为角色生成中文写实风格出图提示词，只返回一段文本：姓名=${firstChar.name}，性别=${firstChar.gender}，年龄=${firstChar.age}，性格=${firstChar.personality}。要求：电影感、光影明确、服装细节清晰。`,
    }],
    temperature: 0.7,
    max_tokens: 500,
  });
  const charImagePrompt = charPromptResp?.choices?.[0]?.message?.content?.trim() || '写实电影感角色肖像，男性，夜色冷光。';
  await writeText('03_character_image_prompt.txt', charImagePrompt);

  const scenePromptResp = await postChat({
    model: CHAT_MODEL,
    messages: [{
      role: 'user',
      content: `为场景生成中文写实风格出图提示词，只返回一段文本：地点=${firstScene.location}，时间=${firstScene.time}，氛围=${firstScene.atmosphere}。要求：镜头构图、景深、体积光。`,
    }],
    temperature: 0.7,
    max_tokens: 500,
  });
  const sceneImagePrompt = scenePromptResp?.choices?.[0]?.message?.content?.trim() || '雨夜废弃火车站，电影感广角镜头。';
  await writeText('04_scene_image_prompt.txt', sceneImagePrompt);

  const charImage = await generateImage(charImagePrompt, '05_character.jpg');
  await writeJson('05_character_image_raw.json', { ok: true, hasInlineData: true, path: charImage.imgPath });

  const sceneImage = await generateImage(sceneImagePrompt, '06_scene.jpg');
  await writeJson('06_scene_image_raw.json', { ok: true, hasInlineData: true, path: sceneImage.imgPath });

  const videoTry = await tryCreateVideoTask('雨夜火车站中，主角持手电缓慢前行，镜头由远推近，悬疑电影风格');
  await writeJson('07_video_task_try.json', videoTry);

  const summary = [
    '# E2E Smoke Run',
    '',
    `- API_BASE: ${API_BASE}`,
    `- CHAT_MODEL: ${CHAT_MODEL}`,
    `- IMAGE_MODEL: ${IMAGE_MODEL}`,
    '',
    '## 产物',
    '- 01_script_data.json',
    '- 02_shots.json',
    '- 03_character_image_prompt.txt',
    '- 04_scene_image_prompt.txt',
    '- 05_character.jpg',
    '- 06_scene.jpg',
    '- 07_video_task_try.json',
    '',
    '## 快速结论',
    `- 文案生成: 成功`,
    `- 分镜生成: 成功`,
    `- 角色图生成: 成功 (${path.basename(charImage.imgPath)})`,
    `- 场景图生成: 成功 (${path.basename(sceneImage.imgPath)})`,
    `- 视频任务创建: ${videoTry.ok ? '成功' : '失败'} (HTTP ${videoTry.status})`,
  ].join('\n');

  const summaryPath = await writeText('00_summary.md', summary);

  console.log(JSON.stringify({
    ok: true,
    outDir,
    summaryPath,
    videoStatus: { ok: videoTry.ok, status: videoTry.status },
  }, null, 2));
};

main().catch(async (err) => {
  try {
    await ensureDir();
    await writeText('00_error.txt', String(err?.stack || err?.message || err));
  } catch {
    // ignore
  }
  console.error(err);
  process.exit(1);
});
