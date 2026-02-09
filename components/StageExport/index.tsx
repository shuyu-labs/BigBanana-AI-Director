import React, { useState, useRef, useEffect } from 'react';
import { Film } from 'lucide-react';
import { ProjectState } from '../../types';
import { downloadMasterVideo, downloadSourceAssets } from '../../services/exportService';
import { exportProjectData, importIndexedDBData } from '../../services/storageService';
import { STYLES } from './constants';
import {
  calculateEstimatedDuration,
  calculateProgress,
  getCompletedShots,
  collectRenderLogs,
  hasDownloadableAssets
} from './utils';
import StatusPanel from './StatusPanel';
import TimelineVisualizer from './TimelineVisualizer';
import ActionButtons from './ActionButtons';
import SecondaryOptions from './SecondaryOptions';
import VideoPlayerModal from './VideoPlayerModal';
import RenderLogsModal from './RenderLogsModal';
import { useAlert } from '../GlobalAlert';

interface Props {
  project: ProjectState;
}

const StageExport: React.FC<Props> = ({ project }) => {
  const { showAlert } = useAlert();
  const completedShots = getCompletedShots(project);
  const progress = calculateProgress(project);
  const estimatedDuration = calculateEstimatedDuration(project);

  // Download state
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadPhase, setDownloadPhase] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Source Assets Download state
  const [isDownloadingAssets, setIsDownloadingAssets] = useState(false);
  const [assetsPhase, setAssetsPhase] = useState('');
  const [assetsProgress, setAssetsProgress] = useState(0);

  // Render Logs Modal state
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Video Preview Player state
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const [isDataExporting, setIsDataExporting] = useState(false);
  const [isDataImporting, setIsDataImporting] = useState(false);

  // Auto-play when shot changes
  useEffect(() => {
    const video = videoRef.current;
    if (video && showVideoPlayer) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.warn('Auto-play failed:', err);
            setIsPlaying(false);
          });
      }
    }
  }, [currentShotIndex, showVideoPlayer]);

  // Video player handlers
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handlePrevShot = () => {
    if (currentShotIndex > 0) {
      setCurrentShotIndex(prev => prev - 1);
    }
  };

  const handleNextShot = () => {
    if (currentShotIndex < completedShots.length - 1) {
      setCurrentShotIndex(prev => prev + 1);
    }
  };

  const openVideoPlayer = () => {
    if (completedShots.length > 0) {
      setCurrentShotIndex(0);
      setShowVideoPlayer(true);
      setIsPlaying(true);
    }
  };

  const closeVideoPlayer = () => {
    setShowVideoPlayer(false);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Handle master video download
  const handleDownloadMaster = async () => {
    if (isDownloading || progress < 100) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      await downloadMasterVideo(project, (phase, prog) => {
        setDownloadPhase(phase);
        setDownloadProgress(prog);
      });
      
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadPhase('');
        setDownloadProgress(0);
      }, 2000);
    } catch (error) {
      console.error('Download failed:', error);
      showAlert(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`, { type: 'error' });
      setIsDownloading(false);
      setDownloadPhase('');
      setDownloadProgress(0);
    }
  };

  // Handle source assets download
  const handleDownloadAssets = async () => {
    if (isDownloadingAssets) return;
    
    if (!hasDownloadableAssets(project)) {
      showAlert('没有可下载的资源。请先生成角色、场景或镜头素材。', { type: 'warning' });
      return;
    }
    
    setIsDownloadingAssets(true);
    setAssetsProgress(0);
    
    try {
      await downloadSourceAssets(project, (phase, prog) => {
        setAssetsPhase(phase);
        setAssetsProgress(prog);
      });
      
      setTimeout(() => {
        setIsDownloadingAssets(false);
        setAssetsPhase('');
        setAssetsProgress(0);
      }, 2000);
    } catch (error) {
      console.error('Assets download failed:', error);
      showAlert(`下载源资源失败: ${error instanceof Error ? error.message : '未知错误'}`, { type: 'error' });
      setIsDownloadingAssets(false);
      setAssetsPhase('');
      setAssetsProgress(0);
    }
  };

  const handleExportData = async () => {
    if (isDataExporting) return;

    setIsDataExporting(true);
    try {
      const payload = await exportProjectData(project);
      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const a = document.createElement('a');
      a.href = url;
      a.download = `bigbanana_project_${project.id}_${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showAlert('当前项目已导出，备份文件已下载。', { type: 'success' });
    } catch (error) {
      console.error('Export failed:', error);
      showAlert(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`, { type: 'error' });
    } finally {
      setIsDataExporting(false);
    }
  };

  const handleImportData = () => {
    if (isDataImporting) return;
    importInputRef.current?.click();
  };

  const handleImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      showAlert('请选择 .json 备份文件。', { type: 'warning' });
      return;
    }

    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const projectCount = payload?.stores?.projects?.length || 0;
      const assetCount = payload?.stores?.assetLibrary?.length || 0;
      const confirmMessage = `将导入 ${projectCount} 个项目和 ${assetCount} 个资产。若 ID 冲突将覆盖现有数据。是否继续？`;

      showAlert(confirmMessage, {
        type: 'warning',
        showCancel: true,
        onConfirm: async () => {
          try {
            setIsDataImporting(true);
            const result = await importIndexedDBData(payload, { mode: 'merge' });
            showAlert(`导入完成：项目 ${result.projects} 个，资产 ${result.assets} 个。`, { type: 'success' });
          } catch (error) {
            console.error('Import failed:', error);
            showAlert(`导入失败: ${error instanceof Error ? error.message : '未知错误'}`, { type: 'error' });
          } finally {
            setIsDataImporting(false);
          }
        }
      });
    } catch (error) {
      console.error('Import failed:', error);
      showAlert(`导入失败: ${error instanceof Error ? error.message : '未知错误'}`, { type: 'error' });
    }
  };

  return (
    <div className={STYLES.container}>
      {/* Header */}
      <div className={STYLES.header.container}>
        <div className="flex items-center gap-4">
          <h2 className={STYLES.header.title}>
            <Film className="w-5 h-5 text-[var(--accent)]" />
            成片与导出
            <span className={STYLES.header.subtitle}>Rendering & Export</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={STYLES.header.status}>
            Status: {progress === 100 ? 'READY' : 'IN PROGRESS'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 md:p-12">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Main Status Panel */}
          <div>
            <StatusPanel 
              project={project}
              progress={progress}
              estimatedDuration={estimatedDuration}
            />
            
            {/* Timeline Visualizer */}
            <TimelineVisualizer shots={project.shots} />
            
            {/* Action Buttons */}
            <ActionButtons
              completedShotsCount={completedShots.length}
              totalShots={project.shots.length}
              progress={progress}
              downloadState={{
                isDownloading,
                phase: downloadPhase,
                progress: downloadProgress
              }}
              onPreview={openVideoPlayer}
              onDownloadMaster={handleDownloadMaster}
            />
          </div>

          {/* Secondary Options */}
          <SecondaryOptions
            assetsDownloadState={{
              isDownloading: isDownloadingAssets,
              phase: assetsPhase,
              progress: assetsProgress
            }}
            onDownloadAssets={handleDownloadAssets}
            onShowLogs={() => setShowLogsModal(true)}
            onExportData={handleExportData}
            onImportData={handleImportData}
            isDataExporting={isDataExporting}
            isDataImporting={isDataImporting}
          />

        </div>
      </div>

      {/* Video Preview Player Modal */}
      {showVideoPlayer && completedShots.length > 0 && (
        <VideoPlayerModal
          completedShots={completedShots}
          currentShotIndex={currentShotIndex}
          isPlaying={isPlaying}
          project={project}
          onClose={closeVideoPlayer}
          onPlayPause={handlePlayPause}
          onPrevShot={handlePrevShot}
          onNextShot={handleNextShot}
          onShotChange={setCurrentShotIndex}
          videoRef={videoRef}
        />
      )}

      {/* Render Logs Modal */}
      {showLogsModal && (
        <RenderLogsModal
          logs={collectRenderLogs(project)}
          expandedLogId={expandedLogId}
          onClose={() => setShowLogsModal(false)}
          onToggleExpand={(logId) => setExpandedLogId(expandedLogId === logId ? null : logId)}
        />
      )}

      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImportFileChange}
      />
    </div>
  );
};

export default StageExport;
