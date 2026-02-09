import { ProjectState, AssetLibraryItem } from '../types';

const DB_NAME = 'BigBananaDB';
const DB_VERSION = 2;
const STORE_NAME = 'projects';
const ASSET_STORE_NAME = 'assetLibrary';
const EXPORT_SCHEMA_VERSION = 1;

export interface IndexedDBExportPayload {
  schemaVersion: number;
  exportedAt: number;
  scope?: 'all' | 'project';
  dbName: string;
  dbVersion: number;
  stores: {
    projects: ProjectState[];
    assetLibrary: AssetLibraryItem[];
  };
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(ASSET_STORE_NAME)) {
        db.createObjectStore(ASSET_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

const isValidExportPayload = (data: unknown): data is IndexedDBExportPayload => {
  const payload = data as IndexedDBExportPayload;
  return !!(
    payload &&
    payload.stores &&
    Array.isArray(payload.stores.projects) &&
    Array.isArray(payload.stores.assetLibrary)
  );
};

export const exportIndexedDBData = async (): Promise<IndexedDBExportPayload> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME, ASSET_STORE_NAME], 'readonly');
    const projectStore = tx.objectStore(STORE_NAME);
    const assetStore = tx.objectStore(ASSET_STORE_NAME);

    const projectsRequest = projectStore.getAll();
    const assetsRequest = assetStore.getAll();

    projectsRequest.onerror = () => reject(projectsRequest.error);
    assetsRequest.onerror = () => reject(assetsRequest.error);

    tx.oncomplete = () => {
      resolve({
        schemaVersion: EXPORT_SCHEMA_VERSION,
        exportedAt: Date.now(),
        scope: 'all',
        dbName: DB_NAME,
        dbVersion: DB_VERSION,
        stores: {
          projects: (projectsRequest.result as ProjectState[]) || [],
          assetLibrary: (assetsRequest.result as AssetLibraryItem[]) || []
        }
      });
    };

    tx.onerror = () => reject(tx.error);
  });
};

export const exportProjectData = async (project: ProjectState): Promise<IndexedDBExportPayload> => {
  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: Date.now(),
    scope: 'project',
    dbName: DB_NAME,
    dbVersion: DB_VERSION,
    stores: {
      projects: [project],
      assetLibrary: []
    }
  };
};

export const importIndexedDBData = async (
  payload: unknown,
  options?: { mode?: 'merge' | 'replace' }
): Promise<{ projects: number; assets: number }> => {
  if (!isValidExportPayload(payload)) {
    throw new Error('导入文件格式不正确');
  }

  const mode = options?.mode || 'merge';
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME, ASSET_STORE_NAME], 'readwrite');
    const projectStore = tx.objectStore(STORE_NAME);
    const assetStore = tx.objectStore(ASSET_STORE_NAME);

    if (mode === 'replace') {
      projectStore.clear();
      assetStore.clear();
    }

    let projectsWritten = 0;
    let assetsWritten = 0;

    payload.stores.projects.forEach(project => {
      // Migration: veo-r2v 模型已下线，迁移为 veo
      if (project.shots) {
        project.shots.forEach((shot: any) => {
          if (shot.videoModel === 'veo-r2v') {
            shot.videoModel = 'veo';
          }
        });
      }
      const request = projectStore.put(project);
      request.onsuccess = () => {
        projectsWritten += 1;
      };
      request.onerror = () => reject(request.error);
    });

    payload.stores.assetLibrary.forEach(item => {
      const request = assetStore.put(item);
      request.onsuccess = () => {
        assetsWritten += 1;
      };
      request.onerror = () => reject(request.error);
    });

    tx.oncomplete = () => resolve({ projects: projectsWritten, assets: assetsWritten });
    tx.onerror = () => reject(tx.error);
  });
};

export const saveProjectToDB = async (project: ProjectState): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const p = { ...project, lastModified: Date.now() };
    const request = store.put(p);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const loadProjectFromDB = async (id: string): Promise<ProjectState> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => {
      if (request.result) {
        const project = request.result;
        // Migration: ensure renderLogs exists for old projects
        if (!project.renderLogs) {
          project.renderLogs = [];
        }
        // Migration: ensure scriptData.props exists for old projects
        if (project.scriptData && !project.scriptData.props) {
          project.scriptData.props = [];
        }
        // Migration: veo-r2v 模型已下线，迁移为 veo
        let migrated = false;
        if (project.shots) {
          project.shots.forEach((shot: any) => {
            if (shot.videoModel === 'veo-r2v') {
              shot.videoModel = 'veo';
              migrated = true;
            }
          });
        }
        // 如果发生了迁移，异步回写 IndexedDB，避免每次加载都重复执行
        if (migrated) {
          openDB().then(writeDb => {
            const writeTx = writeDb.transaction(STORE_NAME, 'readwrite');
            writeTx.objectStore(STORE_NAME).put(project);
            console.log(`🔄 项目 "${project.title}" 已迁移废弃的视频模型`);
          }).catch(() => { /* 回写失败不影响运行 */ });
        }
        resolve(project);
      }
      else reject(new Error("Project not found"));
    };
    request.onerror = () => reject(request.error);
  });
};

export const getAllProjectsMetadata = async (): Promise<ProjectState[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll(); 
    request.onsuccess = () => {
       const projects = request.result as ProjectState[];
       // Sort by last modified descending
       projects.sort((a, b) => b.lastModified - a.lastModified);
       resolve(projects);
    };
    request.onerror = () => reject(request.error);
  });
};

// =========================
// Asset Library Operations
// =========================

export const saveAssetToLibrary = async (item: AssetLibraryItem): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ASSET_STORE_NAME, 'readwrite');
    const store = tx.objectStore(ASSET_STORE_NAME);
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllAssetLibraryItems = async (): Promise<AssetLibraryItem[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ASSET_STORE_NAME, 'readonly');
    const store = tx.objectStore(ASSET_STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const items = (request.result as AssetLibraryItem[]) || [];
      items.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(items);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteAssetFromLibrary = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ASSET_STORE_NAME, 'readwrite');
    const store = tx.objectStore(ASSET_STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * 从IndexedDB中删除项目及其所有关联资源
 * 由于所有媒体资源（图片、视频）都以Base64格式存储在项目对象内部，
 * 删除项目记录时会自动清理所有相关资源：
 * - 角色参考图 (Character.referenceImage)
 * - 角色变体参考图 (CharacterVariation.referenceImage)
 * - 场景参考图 (Scene.referenceImage)
 * - 关键帧图像 (Keyframe.imageUrl)
 * - 视频片段 (VideoInterval.videoUrl)
 * - 渲染日志 (RenderLog[])
 * @param id - 项目ID
 */
export const deleteProjectFromDB = async (id: string): Promise<void> => {
  console.log(`🗑️ 开始删除项目: ${id}`);
  
  const db = await openDB();
  
  // 先获取项目信息以便记录删除的资源统计
  let project: ProjectState | null = null;
  try {
    project = await loadProjectFromDB(id);
  } catch (e) {
    console.warn('无法加载项目信息，直接删除');
  }
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => {
      if (project) {
        // 统计被删除的资源
        let resourceCount = {
          characters: 0,
          characterVariations: 0,
          scenes: 0,
          props: 0,
          keyframes: 0,
          videos: 0,
          renderLogs: project.renderLogs?.length || 0
        };
        
        if (project.scriptData) {
          resourceCount.characters = project.scriptData.characters.filter(c => c.referenceImage).length;
          resourceCount.scenes = project.scriptData.scenes.filter(s => s.referenceImage).length;
          resourceCount.props = (project.scriptData.props || []).filter(p => p.referenceImage).length;
          
          // 统计角色变体
          project.scriptData.characters.forEach(c => {
            if (c.variations) {
              resourceCount.characterVariations += c.variations.filter(v => v.referenceImage).length;
            }
          });
        }
        
        if (project.shots) {
          project.shots.forEach(shot => {
            if (shot.keyframes) {
              resourceCount.keyframes += shot.keyframes.filter(kf => kf.imageUrl).length;
            }
            if (shot.interval?.videoUrl) {
              resourceCount.videos++;
            }
          });
        }
        
        console.log(`✅ 项目已删除: ${project.title}`);
        console.log(`📊 清理的资源统计:`, resourceCount);
        console.log(`   - 角色参考图: ${resourceCount.characters}个`);
        console.log(`   - 角色变体图: ${resourceCount.characterVariations}个`);
        console.log(`   - 场景参考图: ${resourceCount.scenes}个`);
        console.log(`   - 道具参考图: ${resourceCount.props}个`);
        console.log(`   - 关键帧图像: ${resourceCount.keyframes}个`);
        console.log(`   - 视频片段: ${resourceCount.videos}个`);
        console.log(`   - 渲染日志: ${resourceCount.renderLogs}条`);
      } else {
        console.log(`✅ 项目已删除: ${id}`);
      }
      
      resolve();
    };
    
    request.onerror = () => {
      console.error(`❌ 删除项目失败: ${id}`, request.error);
      reject(request.error);
    };
  });
};

/**
 * Convert a File object (image) to Base64 data URL
 * @param file - Image file to convert
 * @returns Promise<string> - Base64 data URL (e.g., "data:image/png;base64,...")
 */
export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('只支持图片文件'));
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      reject(new Error('图片大小不能超过 10MB'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    
    reader.onerror = () => {
      reject(new Error('图片读取失败'));
    };
    
    reader.readAsDataURL(file);
  });
};

// Initial template for new projects
export const createNewProjectState = (): ProjectState => {
  const id = 'proj_' + Date.now().toString(36);
  return {
    id,
    title: '未命名项目',
    createdAt: Date.now(),
    lastModified: Date.now(),
    stage: 'script',
    targetDuration: '60s', // Default duration now 60s
    language: '中文', // Default language
    visualStyle: 'live-action', // Default visual style
    shotGenerationModel: 'gpt-5.1', // Default model
    rawScript: `标题：示例剧本

场景 1
外景。夜晚街道 - 雨夜
霓虹灯在水坑中反射出破碎的光芒。
侦探（30岁,穿着风衣）站在街角,点燃了一支烟。

侦探
这雨什么时候才会停？`,
    scriptData: null,
    shots: [],
    isParsingScript: false,
    renderLogs: [], // Initialize empty render logs array
  };
};
