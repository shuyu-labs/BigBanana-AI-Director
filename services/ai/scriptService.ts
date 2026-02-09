/**
 * 剧本处理服务
 * 包含剧本解析、分镜生成、续写、改写等功能
 */

import { ScriptData, Shot, Scene, ArtDirection } from "../../types";
import { addRenderLogWithTokens } from '../renderLogService';
import {
  retryOperation,
  cleanJsonString,
  chatCompletion,
  chatCompletionStream,
  logScriptProgress,
} from './apiCore';
import { getStylePrompt } from './promptConstants';
import { generateArtDirection, generateAllCharacterPrompts, generateVisualPrompts } from './visualService';

// Re-export 日志回调函数（保持外部 API 兼容）
export { setScriptLogCallback, clearScriptLogCallback, logScriptProgress } from './apiCore';

// ============================================
// 剧本解析
// ============================================

/**
 * Agent 1 & 2: Script Structuring & Breakdown
 * 解析原始文本为结构化剧本数据
 */
export const parseScriptToData = async (
  rawText: string,
  language: string = '中文',
  model: string = 'gpt-5.1',
  visualStyle: string = 'live-action'
): Promise<ScriptData> => {
  console.log('📝 parseScriptToData 调用 - 使用模型:', model, '视觉风格:', visualStyle);
  logScriptProgress('正在解析剧本结构...');
  const startTime = Date.now();

  const prompt = `
    Analyze the text and output a JSON object in the language: ${language}.
    
    Tasks:
    1. Extract title, genre, logline (in ${language}).
    2. Extract characters (id, name, gender, age, personality).
    3. Extract scenes (id, location, time, atmosphere).
    4. Break down the story into paragraphs linked to scenes.
    
    Input:
    "${rawText.slice(0, 30000)}" // Limit input context if needed
    
    Output ONLY valid JSON with this structure:
    {
      "title": "string",
      "genre": "string",
      "logline": "string",
      "characters": [{"id": "string", "name": "string", "gender": "string", "age": "string", "personality": "string"}],
      "scenes": [{"id": "string", "location": "string", "time": "string", "atmosphere": "string"}],
      "storyParagraphs": [{"id": number, "text": "string", "sceneRefId": "string"}]
    }
  `;

  try {
    const responseText = await retryOperation(() => chatCompletion(prompt, model, 0.7, 8192, 'json_object'));

    let parsed: any = {};
    try {
      const text = cleanJsonString(responseText);
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse script data JSON:", e);
      parsed = {};
    }

    // Enforce String IDs for consistency and init variations
    const characters = Array.isArray(parsed.characters) ? parsed.characters.map((c: any) => ({
      ...c,
      id: String(c.id),
      variations: []
    })) : [];
    const scenes = Array.isArray(parsed.scenes) ? parsed.scenes.map((s: any) => ({ ...s, id: String(s.id) })) : [];
    const storyParagraphs = Array.isArray(parsed.storyParagraphs) ? parsed.storyParagraphs.map((p: any) => ({ ...p, sceneRefId: String(p.sceneRefId) })) : [];

    const genre = parsed.genre || "通用";

    // ========== Phase 1: 生成全局美术指导文档 ==========
    console.log("🎨 正在为角色和场景生成视觉提示词...", `风格: ${visualStyle}`);
    logScriptProgress(`正在生成角色与场景的视觉提示词（风格：${visualStyle}）...`);

    let artDirection: ArtDirection | undefined;
    try {
      artDirection = await generateArtDirection(
        parsed.title || '未命名剧本',
        genre,
        parsed.logline || '',
        characters.map((c: any) => ({ name: c.name, gender: c.gender, age: c.age, personality: c.personality })),
        scenes.map((s: any) => ({ location: s.location, time: s.time, atmosphere: s.atmosphere })),
        visualStyle,
        language,
        model
      );
      console.log("✅ 全局美术指导文档生成完成，风格关键词:", artDirection.moodKeywords.join(', '));
    } catch (e) {
      console.error("⚠️ 全局美术指导文档生成失败，将使用默认风格:", e);
    }

    // ========== Phase 2: 批量生成角色视觉提示词 ==========
    if (characters.length > 0 && artDirection) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));

        const batchResults = await generateAllCharacterPrompts(
          characters, artDirection, genre, visualStyle, language, model
        );

        for (let i = 0; i < characters.length; i++) {
          if (batchResults[i] && batchResults[i].visualPrompt) {
            characters[i].visualPrompt = batchResults[i].visualPrompt;
            characters[i].negativePrompt = batchResults[i].negativePrompt;
          }
        }

        // Fallback: individually generate failed characters
        const failedCharacters = characters.filter((c: any) => !c.visualPrompt);
        if (failedCharacters.length > 0) {
          console.log(`⚠️ ${failedCharacters.length} 个角色需要单独重新生成提示词`);
          logScriptProgress(`${failedCharacters.length} 个角色需要单独重新生成...`);
          for (const char of failedCharacters) {
            try {
              await new Promise(resolve => setTimeout(resolve, 1500));
              console.log(`  重新生成角色提示词: ${char.name}`);
              logScriptProgress(`重新生成角色视觉提示词：${char.name}`);
              const prompts = await generateVisualPrompts('character', char, genre, model, visualStyle, language, artDirection);
              char.visualPrompt = prompts.visualPrompt;
              char.negativePrompt = prompts.negativePrompt;
            } catch (e) {
              console.error(`Failed to generate visual prompt for character ${char.name}:`, e);
            }
          }
        }
      } catch (e) {
        console.error("批量角色提示词生成失败，回退到逐个生成模式:", e);
        for (let i = 0; i < characters.length; i++) {
          try {
            if (i > 0) await new Promise(resolve => setTimeout(resolve, 1500));
            console.log(`  生成角色提示词: ${characters[i].name}`);
            logScriptProgress(`生成角色视觉提示词：${characters[i].name}`);
            const prompts = await generateVisualPrompts('character', characters[i], genre, model, visualStyle, language, artDirection);
            characters[i].visualPrompt = prompts.visualPrompt;
            characters[i].negativePrompt = prompts.negativePrompt;
          } catch (e2) {
            console.error(`Failed to generate visual prompt for character ${characters[i].name}:`, e2);
          }
        }
      }
    } else if (characters.length > 0) {
      for (let i = 0; i < characters.length; i++) {
        try {
          if (i > 0) await new Promise(resolve => setTimeout(resolve, 1500));
          console.log(`  生成角色提示词: ${characters[i].name}`);
          logScriptProgress(`生成角色视觉提示词：${characters[i].name}`);
          const prompts = await generateVisualPrompts('character', characters[i], genre, model, visualStyle, language);
          characters[i].visualPrompt = prompts.visualPrompt;
          characters[i].negativePrompt = prompts.negativePrompt;
        } catch (e) {
          console.error(`Failed to generate visual prompt for character ${characters[i].name}:`, e);
        }
      }
    }

    // ========== Phase 3: 生成场景视觉提示词 ==========
    for (let i = 0; i < scenes.length; i++) {
      try {
        if (i > 0 || characters.length > 0) await new Promise(resolve => setTimeout(resolve, 1500));
        console.log(`  生成场景提示词: ${scenes[i].location}`);
        logScriptProgress(`生成场景视觉提示词：${scenes[i].location}`);
        const prompts = await generateVisualPrompts('scene', scenes[i], genre, model, visualStyle, language, artDirection);
        scenes[i].visualPrompt = prompts.visualPrompt;
        scenes[i].negativePrompt = prompts.negativePrompt;
      } catch (e) {
        console.error(`Failed to generate visual prompt for scene ${scenes[i].location}:`, e);
      }
    }

    console.log("✅ 视觉提示词生成完成！");
    logScriptProgress('视觉提示词生成完成');

    const result = {
      title: parsed.title || "未命名剧本",
      genre: genre,
      logline: parsed.logline || "",
      language: language,
      artDirection,
      characters,
      scenes,
      props: [],
      storyParagraphs
    };

    addRenderLogWithTokens({
      type: 'script-parsing',
      resourceId: 'script-parse-' + Date.now(),
      resourceName: result.title,
      status: 'success',
      model: model,
      prompt: prompt.substring(0, 200) + '...',
      duration: Date.now() - startTime
    });

    return result;
  } catch (error: any) {
    addRenderLogWithTokens({
      type: 'script-parsing',
      resourceId: 'script-parse-' + Date.now(),
      resourceName: '剧本解析',
      status: 'failed',
      model: model,
      prompt: prompt.substring(0, 200) + '...',
      error: error.message,
      duration: Date.now() - startTime
    });
    throw error;
  }
};

// ============================================
// 分镜生成
// ============================================

/**
 * 生成分镜列表
 * 根据剧本数据和目标时长，为每个场景生成适量的分镜头
 */
export const generateShotList = async (scriptData: ScriptData, model: string = 'gpt-5.1'): Promise<Shot[]> => {
  console.log('🎬 generateShotList 调用 - 使用模型:', model, '视觉风格:', scriptData.visualStyle);
  logScriptProgress('正在生成分镜列表...');
  const overallStartTime = Date.now();

  if (!scriptData.scenes || scriptData.scenes.length === 0) {
    return [];
  }

  const lang = scriptData.language || '中文';
  const visualStyle = scriptData.visualStyle || 'live-action';
  const stylePrompt = getStylePrompt(visualStyle);
  const artDir = scriptData.artDirection;

  const artDirectionBlock = artDir ? `
      ⚠️ GLOBAL ART DIRECTION (MANDATORY for ALL visualPrompt fields):
      ${artDir.consistencyAnchors}
      Color Palette: Primary=${artDir.colorPalette.primary}, Secondary=${artDir.colorPalette.secondary}, Accent=${artDir.colorPalette.accent}
      Color Temperature: ${artDir.colorPalette.temperature}, Saturation: ${artDir.colorPalette.saturation}
      Lighting Style: ${artDir.lightingStyle}
      Texture: ${artDir.textureStyle}
      Mood Keywords: ${artDir.moodKeywords.join(', ')}
      Character Proportions: ${artDir.characterDesignRules.proportions}
      Line/Edge Style: ${artDir.characterDesignRules.lineWeight}
      Detail Level: ${artDir.characterDesignRules.detailLevel}
` : '';

  const processScene = async (scene: Scene, index: number): Promise<Shot[]> => {
    const sceneStartTime = Date.now();
    const paragraphs = scriptData.storyParagraphs
      .filter(p => String(p.sceneRefId) === String(scene.id))
      .map(p => p.text)
      .join('\n');

    if (!paragraphs.trim()) return [];

    const targetDurationStr = scriptData.targetDuration || '60s';
    const targetSeconds = parseInt(targetDurationStr.replace(/[^\d]/g, '')) || 60;
    const totalShotsNeeded = Math.round(targetSeconds / 10);
    const scenesCount = scriptData.scenes.length;
    const shotsPerScene = Math.max(1, Math.round(totalShotsNeeded / scenesCount));

    const prompt = `
      Act as a professional cinematographer. Generate a detailed shot list (Camera blocking) for Scene ${index + 1}.
      Language for Text Output: ${lang}.
      
      IMPORTANT VISUAL STYLE: ${stylePrompt}
      All 'visualPrompt' fields MUST describe shots in this "${visualStyle}" style.
${artDirectionBlock}
      Scene Details:
      Location: ${scene.location}
      Time: ${scene.time}
      Atmosphere: ${scene.atmosphere}
      
      Scene Action:
      "${paragraphs.slice(0, 5000)}"
      
      Context:
      Genre: ${scriptData.genre}
      Visual Style: ${visualStyle} (${stylePrompt})
      Target Duration (Whole Script): ${scriptData.targetDuration || 'Standard'}
      Total Shots Budget: ${totalShotsNeeded} shots (Each shot = 10 seconds of video)
      Shots for This Scene: Approximately ${shotsPerScene} shots
      
      Characters:
      ${JSON.stringify(scriptData.characters.map(c => ({ id: c.id, name: c.name, desc: c.visualPrompt || c.personality })))}

      Professional Camera Movement Reference (Choose from these categories):
      - Horizontal Left Shot (向左平移) - Camera moves left
      - Horizontal Right Shot (向右平移) - Camera moves right
      - Pan Left Shot (平行向左扫视) - Pan left
      - Pan Right Shot (平行向右扫视) - Pan right
      - Vertical Up Shot (向上直线运动) - Move up vertically
      - Vertical Down Shot (向下直线运动) - Move down vertically
      - Tilt Up Shot (向上仰角运动) - Tilt upward
      - Tilt Down Shot (向下俯角运动) - Tilt downward
      - Zoom Out Shot (镜头缩小/拉远) - Pull back/zoom out
      - Zoom In Shot (镜头放大/拉近) - Push in/zoom in
      - Dolly Shot (推镜头) - Dolly in/out movement
      - Circular Shot (环绕拍摄) - Orbit around subject
      - Over the Shoulder Shot (越肩镜头) - Over shoulder perspective
      - Pan Shot (摇镜头) - Pan movement
      - Low Angle Shot (仰视镜头) - Low angle view
      - High Angle Shot (俯视镜头) - High angle view
      - Tracking Shot (跟踪镜头) - Follow subject
      - Handheld Shot (摇摄镜头) - Handheld camera
      - Static Shot (静止镜头) - Fixed camera position
      - POV Shot (主观视角) - Point of view
      - Bird's Eye View Shot (俯瞰镜头) - Overhead view
      - 360-Degree Circular Shot (360度环绕) - Full circle
      - Parallel Tracking Shot (平行跟踪) - Side tracking
      - Diagonal Tracking Shot (对角跟踪) - Diagonal tracking
      - Rotating Shot (旋转镜头) - Rotating movement
      - Slow Motion Shot (慢动作) - Slow-mo effect
      - Time-Lapse Shot (延时摄影) - Time-lapse
      - Canted Shot (斜视镜头) - Dutch angle
      - Cinematic Dolly Zoom (电影式变焦推轨) - Vertigo effect

      Instructions:
      1. Create EXACTLY ${shotsPerScene} shots (or ${shotsPerScene - 1} to ${shotsPerScene + 1} shots if needed for story flow) for this scene.
      2. CRITICAL: Each shot will be 10 seconds. Total shots must match the target duration formula: ${targetSeconds} seconds ÷ 10 = ${totalShotsNeeded} total shots across all scenes.
      3. DO NOT exceed ${shotsPerScene + 1} shots for this scene. Select the most important moments only.
      4. 'cameraMovement': Can reference the Professional Camera Movement Reference list above for inspiration, or use your own creative camera movements. You may use the exact English terms (e.g., "Dolly Shot", "Pan Right Shot", "Zoom In Shot", "Tracking Shot") or describe custom movements.
      5. 'shotSize': Specify the field of view (e.g., Extreme Close-up, Medium Shot, Wide Shot).
      6. 'actionSummary': Detailed description of what happens in the shot (in ${lang}).
      7. 'visualPrompt': Detailed description for image generation in ${visualStyle} style (OUTPUT IN ${lang}). Include style-specific keywords.${artDir ? ' MUST follow the Global Art Direction color palette, lighting, and mood.' : ''} Keep it under 50 words.
      
      Output ONLY a valid JSON OBJECT with this exact structure (no markdown, no extra text):
      {
        "shots": [
          {
            "id": "string",
            "sceneId": "${scene.id}",
            "actionSummary": "string",
            "dialogue": "string (empty if none)",
            "cameraMovement": "string",
            "shotSize": "string",
            "characters": ["string"],
            "keyframes": [
              {"id": "string", "type": "start|end", "visualPrompt": "string (MUST include ${visualStyle} style keywords${artDir ? ' and follow Art Direction' : ''})"}
            ]
          }
        ]
      }
    `;

    let responseText = '';
    try {
      console.log(`  📡 场景 ${index + 1} API调用 - 模型:`, model);
      responseText = await retryOperation(() => chatCompletion(prompt, model, 0.5, 8192, 'json_object'));
      const text = cleanJsonString(responseText);
      const parsed = JSON.parse(text);

      const shots = Array.isArray(parsed)
        ? parsed
        : (parsed && Array.isArray((parsed as any).shots) ? (parsed as any).shots : []);

      const validShots = Array.isArray(shots) ? shots : [];
      const result = validShots.map((s: any) => ({
        ...s,
        sceneId: String(scene.id)
      }));

      addRenderLogWithTokens({
        type: 'script-parsing',
        resourceId: `shot-gen-scene-${scene.id}-${Date.now()}`,
        resourceName: `分镜生成 - 场景${index + 1}: ${scene.location}`,
        status: 'success',
        model: model,
        prompt: prompt.substring(0, 200) + '...',
        duration: Date.now() - sceneStartTime
      });

      return result;
    } catch (e: any) {
      console.error(`Failed to generate shots for scene ${scene.id}`, e);
      try {
        console.error(`  ↳ sceneId=${scene.id}, sceneIndex=${index}, responseText(snippet)=`, String(responseText || '').slice(0, 500));
      } catch {
        // ignore
      }

      addRenderLogWithTokens({
        type: 'script-parsing',
        resourceId: `shot-gen-scene-${scene.id}-${Date.now()}`,
        resourceName: `分镜生成 - 场景${index + 1}: ${scene.location}`,
        status: 'failed',
        model: model,
        prompt: prompt.substring(0, 200) + '...',
        error: e.message || String(e),
        duration: Date.now() - sceneStartTime
      });

      return [];
    }
  };

  // Process scenes sequentially
  const BATCH_SIZE = 1;
  const allShots: Shot[] = [];

  for (let i = 0; i < scriptData.scenes.length; i += BATCH_SIZE) {
    if (i > 0) await new Promise(resolve => setTimeout(resolve, 1500));

    const batch = scriptData.scenes.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((scene, idx) => processScene(scene, i + idx))
    );
    batchResults.forEach(shots => allShots.push(...shots));
  }

  if (allShots.length === 0) {
    throw new Error('分镜生成失败：AI返回为空（可能是 JSON 结构不匹配或场景内容未被识别）。请打开控制台查看分镜生成日志。');
  }

  return allShots.map((s, idx) => ({
    ...s,
    id: `shot-${idx + 1}`,
    keyframes: Array.isArray(s.keyframes) ? s.keyframes.map((k: any) => ({
      ...k,
      id: `kf-${idx + 1}-${k.type}`,
      status: 'pending'
    })) : []
  }));
};

// ============================================
// 剧本续写/改写
// ============================================

/**
 * AI续写功能 - 基于已有剧本内容续写后续情节
 */
export const continueScript = async (existingScript: string, language: string = '中文', model: string = 'gpt-5.1'): Promise<string> => {
  console.log('✍️ continueScript 调用 - 使用模型:', model);
  const startTime = Date.now();

  const prompt = `
你是一位资深剧本创作者。请在充分理解下方已有剧本内容的基础上，续写后续情节。

续写要求：
1. 严格保持原剧本的风格、语气、人物性格和叙事节奏，确保无明显风格断层。
2. 情节发展需自然流畅，逻辑严密，因果关系合理，避免突兀转折。
3. 有效增加戏剧冲突和情感张力，使故事更具吸引力和张力。
4. 续写内容应为原有剧本长度的30%-50%，字数适中，避免过短或过长。
5. 保持剧本的原有格式，包括场景描述、人物对白、舞台指示等，确保格式一致。
6. 输出语言为：${language}，用词准确、表达流畅。
7. 仅输出续写剧本内容，不添加任何说明、前缀或后缀。

已有剧本内容：
${existingScript}

请直接续写剧本内容。（不要包含"续写："等前缀）：
`;

  try {
    const result = await retryOperation(() => chatCompletion(prompt, model, 0.8, 4096));
    const duration = Date.now() - startTime;

    await addRenderLogWithTokens({
      type: 'script-parsing',
      resourceId: 'continue-script',
      resourceName: 'AI续写剧本',
      status: 'success',
      model,
      duration,
      prompt: existingScript.substring(0, 200) + '...'
    });

    return result;
  } catch (error) {
    console.error('❌ 续写失败:', error);
    throw error;
  }
};

/**
 * AI续写功能（流式）
 */
export const continueScriptStream = async (
  existingScript: string,
  language: string = '中文',
  model: string = 'gpt-5.1',
  onDelta?: (delta: string) => void
): Promise<string> => {
  console.log('✍️ continueScriptStream 调用 - 使用模型:', model);
  const startTime = Date.now();

  const prompt = `
你是一位资深剧本创作者。请在充分理解下方已有剧本内容的基础上，续写后续情节。

续写要求：
1. 严格保持原剧本的风格、语气、人物性格和叙事节奏，确保无明显风格断层。
2. 情节发展需自然流畅，逻辑严密，因果关系合理，避免突兀转折。
3. 有效增加戏剧冲突和情感张力，使故事更具吸引力和张力。
4. 续写内容应为原有剧本长度的30%-50%，字数适中，避免过短或过长。
5. 保持剧本的原有格式，包括场景描述、人物对白、舞台指示等，确保格式一致。
6. 输出语言为：${language}，用词准确、表达流畅。
7. 仅输出续写剧本内容，不添加任何说明、前缀或后缀。

已有剧本内容：
${existingScript}

请直接续写剧本内容。（不要包含"续写："等前缀）：
`;

  try {
    const result = await retryOperation(() => chatCompletionStream(prompt, model, 0.8, undefined, 600000, onDelta));
    const duration = Date.now() - startTime;

    await addRenderLogWithTokens({
      type: 'script-parsing',
      resourceId: 'continue-script',
      resourceName: 'AI续写剧本（流式）',
      status: 'success',
      model,
      duration,
      prompt: existingScript.substring(0, 200) + '...'
    });

    return result;
  } catch (error) {
    console.error('❌ 续写失败（流式）:', error);
    throw error;
  }
};

/**
 * AI改写功能 - 对整个剧本进行改写
 */
export const rewriteScript = async (originalScript: string, language: string = '中文', model: string = 'gpt-5.1'): Promise<string> => {
  console.log('🔄 rewriteScript 调用 - 使用模型:', model);
  const startTime = Date.now();

  const prompt = `
你是一位顶级剧本编剧顾问，擅长提升剧本的结构、情感和戏剧张力。请对下方提供的剧本进行系统性、创造性改写，目标是使剧本在连贯性、流畅性和戏剧冲突等方面显著提升。

改写具体要求如下：

1. 保留原剧本的核心故事线和主要人物设定，不改变故事主旨。
2. 优化情节结构，确保事件发展具有清晰的因果关系，逻辑严密。
3. 增强场景之间的衔接与转换，使整体叙事流畅自然。
4. 丰富和提升人物对话，使其更具个性、情感色彩和真实感，避免生硬或刻板。
5. 强化戏剧冲突，突出人物之间的矛盾与情感张力，增加情节的吸引力和感染力。
6. 深化人物内心活动和情感描写，提升剧本的情感深度。
7. 优化整体节奏，合理分配高潮与缓和段落，避免情节拖沓或推进过快。
8. 保持或适度增加剧本内容长度，确保内容充实但不过度冗长。
9. 严格遵循剧本格式规范，包括场景标注、人物台词、舞台指示等。
10. 输出语言为：${language}，确保语言风格与剧本类型相符。

原始剧本内容如下：
${originalScript}

请根据以上要求，输出经过全面改写、结构优化、情感丰富的完整剧本文本。
`;

  try {
    const result = await retryOperation(() => chatCompletion(prompt, model, 0.7, 8192));
    const duration = Date.now() - startTime;

    await addRenderLogWithTokens({
      type: 'script-parsing',
      resourceId: 'rewrite-script',
      resourceName: 'AI改写剧本',
      status: 'success',
      model,
      duration,
      prompt: originalScript.substring(0, 200) + '...'
    });

    return result;
  } catch (error) {
    console.error('❌ 改写失败:', error);
    throw error;
  }
};

/**
 * AI改写功能（流式）
 */
export const rewriteScriptStream = async (
  originalScript: string,
  language: string = '中文',
  model: string = 'gpt-5.1',
  onDelta?: (delta: string) => void
): Promise<string> => {
  console.log('🔄 rewriteScriptStream 调用 - 使用模型:', model);
  const startTime = Date.now();

  const prompt = `
你是一位顶级剧本编剧顾问，擅长提升剧本的结构、情感和戏剧张力。请对下方提供的剧本进行系统性、创造性改写，目标是使剧本在连贯性、流畅性和戏剧冲突等方面显著提升。

改写具体要求如下：

1. 保留原剧本的核心故事线和主要人物设定，不改变故事主旨。
2. 优化情节结构，确保事件发展具有清晰的因果关系，逻辑严密。
3. 增强场景之间的衔接与转换，使整体叙事流畅自然。
4. 丰富和提升人物对话，使其更具个性、情感色彩和真实感，避免生硬或刻板。
5. 强化戏剧冲突，突出人物之间的矛盾与情感张力，增加情节的吸引力和感染力。
6. 深化人物内心活动和情感描写，提升剧本的情感深度。
7. 优化整体节奏，合理分配高潮与缓和段落，避免情节拖沓或推进过快。
8. 保持或适度增加剧本内容长度，确保内容充实但不过度冗长。
9. 严格遵循剧本格式规范，包括场景标注、人物台词、舞台指示等。
10. 输出语言为：${language}，确保语言风格与剧本类型相符。

原始剧本内容如下：
${originalScript}

请根据以上要求，输出经过全面改写、结构优化、情感丰富的完整剧本文本。
`;

  try {
    const result = await retryOperation(() => chatCompletionStream(prompt, model, 0.7, undefined, 600000, onDelta));
    const duration = Date.now() - startTime;

    await addRenderLogWithTokens({
      type: 'script-parsing',
      resourceId: 'rewrite-script',
      resourceName: 'AI改写剧本（流式）',
      status: 'success',
      model,
      duration,
      prompt: originalScript.substring(0, 200) + '...'
    });

    return result;
  } catch (error) {
    console.error('❌ 改写失败（流式）:', error);
    throw error;
  }
};
