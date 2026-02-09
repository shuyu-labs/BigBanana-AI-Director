# BigBanana AI Director

> **AI-Powered End-to-End Short Drama & Motion Comic Platform**

[![中文](https://img.shields.io/badge/Language-中文-gray.svg)](./README.md)
[![English](https://img.shields.io/badge/Language-English-blue.svg)](./README_EN.md)
[![日本語](https://img.shields.io/badge/Language-日本語-gray.svg)](./README_JA.md)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

**BigBanana AI Director** is an **AI-powered, one-stop platform** for **short dramas** and **motion comics**, built for creators who want to go from idea to final video fast.

Moving away from the traditional "slot machine" style of random generation, BigBanana adopts an industrial **"Script-to-Asset-to-Keyframe"** workflow. With deep integration of AntSK API’s advanced AI models, it enables **one-sentence to complete drama** — fully automated from **script** to **final video**, while maintaining precise control over character consistency, scene continuity, and camera movement.
## UI Showcase

### Project Management
![Project Management](./images/项目管理.png)

### Phase 01: Script & Storyboard
![Script Creation](./images/剧本创作.png)
![Script & Story](./images/剧本与故事.png)

### Phase 02: Character & Scene Assets
![Character & Scene](./images/角色场景.png)
![Scenes](./images/场景.png)

### Phase 03: Director Workbench
![Director Workbench](./images/导演工作台.png)
![Nine-Grid Storyboard](./images/镜头九宫格.png)
![Shots & Frames](./images/镜头与帧.png)
![Shots & Frames Detail](./images/镜头与帧1.png)

### Phase 04: Export
![Export](./images/成片导出.png)

### Prompt Management
![Prompt Management](./images/提示词管理.png)
## Core Philosophy: Keyframe-Driven

Traditional Text-to-Video models often struggle with specific camera movements and precise start/end states. BigBanana introduces the animation concept of **Keyframes**:

1.  **Draw First, Move Later**: First, generate precise Start and End frames.
2.  **Interpolation**: Use the Veo model to generate smooth video transitions between these two frames.
3.  **Asset Constraint**: All visual generation is strictly constrained by "Character Sheets" and "Scene Concepts" to prevent hallucinations or inconsistencies.

## Key Features

### Phase 01: Script & Storyboard
*   **Intelligent Breakdown**: Input a novel or story outline, and the AI automatically breaks it down into a standard script structure (Scenes, Time, Atmosphere).
*   **Visual Translation**: Automatically converts text descriptions into professional visual prompts.
*   **Pacing Control**: Set target durations (e.g., 30s Teaser, 3min Short), and the AI plans shot density accordingly.
*   **✨ Manual Editing (NEW)**:
    *   Edit character visual descriptions and shot prompts
    *   Edit character list for each shot (add/remove characters)
    *   Edit action descriptions and dialogues for each shot
    *   Ensure generated results meet expectations with precise control over every detail

### Phase 02: Assets & Casting
*   **Character Consistency**:
    *   Generate standard Reference Images for every character.
    *   **Wardrobe System**: Support for multiple looks (e.g., Casual, Combat, Injured) while maintaining facial identity based on a Base Look.
*   **Set Design**: Generate environmental reference images to ensure lighting consistency across different shots in the same location.

### Phase 03: Director Workbench
*   **Grid Storyboard**: Manage all shots in a panoramic view.
*   **Precise Control**:
    *   **Start Frame**: The strictly consistent starting image of the shot.
    *   **End Frame**: (Optional) Define the state at the end of the shot (e.g., character turns head, lighting shifts).
*   **Context Awareness**: When generating shots, the AI automatically reads the Context (Current Scene Image + Character's Specific Outfit Image) to solve continuity issues.
*   **Veo Video Generation**: Supports both Image-to-Video and Keyframe Interpolation modes.

### Phase 04: Export
*   **Timeline Preview**: Preview generated motion comic segments in a timeline format.
*   **Render Tracking**: Monitor API render progress in real-time.
*   **Asset Export**: Export all high-def keyframes and MP4 clips for post-production in Premiere/After Effects.

## Tech Stack

*   **Frontend**: React 19, Tailwind CSS (Sony Industrial Design Style)
*   **AI Models**:
    *   **Logic/Text**: `GPT-5.2`
    *   **Vision**: `gemini-3-pro-image-preview`
    *   **Video**: `veo_3_1_i2v_s_fast_fl_landscape` / `sora-2`
    *   **Video**: `veo-3.1-fast-generate-preview`
*   **Storage**: IndexedDB (Local browser database, privacy-focused, no backend dependency)

## Why Choose AntSK API?

This project deeply integrates [**AntSK API Platform**](https://api.antsk.cn/), delivering exceptional value for creators:

### 🎯 Full Model Coverage
* **Text Models**: GPT-5.2, GPT-5.1, Claude 3.5 Sonnet
* **Vision Models**: Gemini 3 Pro, Nano Banana Pro
* **Video Models**: Sora 2, Veo 3.1 (with keyframe interpolation)
* **Unified Access**: Single API for all models, no platform switching

### 💰 Unbeatable Pricing
* **Under 20% of Official Prices**: Save 80%+ on all models
* **Pay-As-You-Go**: No minimum spend, pay only for what you use
* **Enterprise-Grade Reliability**: 99.9% SLA, 24/7 technical support

### 🚀 Developer-Friendly
* **OpenAI-Compatible**: Zero migration cost for existing code
* **Comprehensive Docs**: Full API documentation and code examples
* **Real-Time Monitoring**: Visual usage stats and cost tracking

[**Sign Up for Free Credits**](https://api.antsk.cn/) →

---

## 💬 Join Our Community

Scan the QR code to join our **BigBanana Product Experience Group** on WeChat. Connect with fellow creators, share tips, and get the latest updates:

<div align="center">
<img src="./images/qrcode.jpg" width="300" alt="WeChat Group QR Code">
<p><i>Scan to join WeChat group</i></p>
</div>

---

### 🎨 Lightweight Creation Tools

For **quick one-off creative tasks**, try our online tool platform:

**[BigBanana Creation Studio](https://bigbanana.tree456.com/)** offers:
* 📷 **[AI Image Generation](https://bigbanana.tree456.com/gemini-image.html)**: Text-to-image with multiple styles
* 📊 **[AI PowerPoint](https://bigbanana.tree456.com/ppt-content.html)**: Generate presentations instantly
* 🎬 **[AI Video](https://bigbanana.tree456.com/ai-video-content.html)**: Intelligent video content generation
* 📱 **[Social Media Content](https://bigbanana.tree456.com/redink-content.html)**: Viral titles and posts for Xiaohongshu
* 📖 **[AI Novel Creation](https://bigbanana.tree456.com/novel-creation.html)**: Intelligent novel generation and continuation
* 🎨 **[AI Anime Generation](https://bigbanana.tree456.com/anime-content.html)**: Anime-style image creation
* 🎭 **No Installation**: Use directly in browser, instant access

**Best For**: Daily creation, rapid prototyping, idea validation  
**This Project Is For**: Systematic drama production, batch video generation, industrial workflows

## Getting Started

### Option 1: Local Development

```bash
# 1. Clone the repository
git clone https://github.com/shuyu-labs/BigBanana-AI-Director.git
cd BigBanana-AI-Director

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# Visit http://localhost:3000
```

### Option 2: Docker Deployment (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/shuyu-labs/BigBanana-AI-Director.git
cd BigBanana-AI-Director

# 2. Build and start with Docker Compose
docker-compose up -d --build

# 3. Open in browser
# Visit http://localhost:3005

# View logs
docker-compose logs -f

# Stop container
docker-compose down
```

### Option 3: Using Docker Commands

```bash
# 1. Clone the repository
git clone https://github.com/shuyu-labs/BigBanana-AI-Director.git
cd BigBanana-AI-Director

# 2. Build image
docker build -t bigbanana-ai .

# 3. Run container
docker run -d -p 3005:80 --name bigbanana-ai-app bigbanana-ai

# 4. Open in browser
# Visit http://localhost:3005

# View logs
docker logs -f bigbanana-ai-app

# Stop container
docker stop bigbanana-ai-app
```

### Other Commands

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Force rebuild Docker image without cache
docker-compose build --no-cache
docker-compose up -d --force-recreate
```

---

## Quick Start

1.  **Configure Key**: Launch the app and input your AntSK API Key. [**Buy API Key**](https://api.antsk.cn)
2.  **Input Story**: In Phase 01, enter your story idea and click "Generate Script".
3.  **Art Direction**: Go to Phase 02, generate character sheets and scene concepts.
4.  **Shot Production**: Go to Phase 03, generate keyframes for each shot.
5.  **Motion Generation**: Once keyframes are approved, batch generate the video clips.

---

## Project Origin

This project is based on [CineGen-AI](https://github.com/Will-Water/CineGen-AI) and has been further developed with enhanced features and optimizations.

Thanks to the original author for their open-source contribution!

---

## License

This project is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

- ✅ Personal learning and non-commercial use allowed
- ✅ Modification and derivative works allowed (under the same license)
- ❌ Commercial use prohibited (requires commercial license)

For commercial licensing, please contact: antskpro@qq.com

---
*Built for Creators, by BigBanana.*
