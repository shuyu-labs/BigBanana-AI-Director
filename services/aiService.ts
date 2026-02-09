/**
 * AI Service - Facade（统一入口）
 * 
 * 此文件作为统一入口，从 ./ai/ 模块导出所有 AI 服务功能。
 * 所有模块应通过 import { xxx } from '../services/aiService' 引用。
 * 
 * 实际实现已拆分为以下模块：
 * - ai/apiCore.ts        基础设施层（API 调用、重试、错误处理、API Key 管理）
 * - ai/promptConstants.ts 提示词常量（视觉风格、负面提示词）
 * - ai/scriptService.ts   剧本处理（解析、分镜、续写、改写）
 * - ai/visualService.ts   视觉资产（美术指导、提示词生成、图像生成）
 * - ai/videoService.ts    视频生成（Veo 同步、Sora 异步）
 * - ai/shotService.ts     分镜辅助（关键帧优化、动作生成、镜头拆分、九宫格）
 */

export * from './ai';
