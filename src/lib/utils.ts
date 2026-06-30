import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 根据视频时长（秒）与各工具时间占比，计算预估耗时并格式化为展示文案。
 * 用于 tool_call 卡片右上角展示；无视频时长或未知工具时返回 undefined。
 */
export function getToolEstimatedTimeFromVideoDuration(
  toolName: string,
  videoDurationSeconds: number | undefined
): string | undefined {
  if (videoDurationSeconds == null || !Number.isFinite(videoDurationSeconds) || videoDurationSeconds <= 0) {
    return undefined;
  }
  const videoMin = videoDurationSeconds / 60;
  const round = (n: number) => Math.max(0, Math.round(n));
  /** 预估分钟数 [低, 高]，或固定 [x, x] */
  let minLow: number;
  let minHigh: number;
  switch (toolName) {
    case "create_session_dir":
      minLow = 0;
      minHigh = 1;
      break;
    case "asr_whisperx":
      // 语音识别约 0.3~0.5 倍视频时长
      minLow = round(videoMin * 0.3);
      minHigh = round(videoMin * 0.5);
      break;
    case "video_scene_split":
      minLow = round(videoMin * 0.05);
      minHigh = round(videoMin * 0.15) || 1;
      break;
    case "video_scene_export":
      minLow = round(videoMin * 0.1);
      minHigh = round(videoMin * 0.2) || 1;
      break;
    case "video_rough_cut":
      minLow = round(videoMin * 0.2);
      minHigh = round(videoMin * 0.35) || 1;
      break;
    case "video_fine_cut":
      minLow = round(videoMin * 0.15);
      minHigh = round(videoMin * 0.3) || 1;
      break;
    case "video_merge_planner":
      minLow = 0;
      minHigh = 2;
      break;
    case "video_merge_export":
      minLow = round(videoMin * 0.15);
      minHigh = round(videoMin * 0.3) || 1;
      break;
    case "visual_overlay_format":
    case "visual_overlay_editor":
      minLow = round(videoMin * 0.1) || 1;
      minHigh = round(videoMin * 0.2) || 2;
      break;
    default:
      return undefined;
  }
  if (minLow === minHigh) {
    return minLow < 1 ? "~1 min" : `~${minLow} min`;
  }
  return `${minLow}-${minHigh} min`;
}

/**
 * Generate a UUID with fallback for environments where crypto.randomUUID is not available
 */
export function generateUUID(): string {
  // Try to use native crypto.randomUUID if available
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback implementation using Math.random()
  // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
