// ==========================================
// 工具函式 — 檔案大小格式化
// 自動將 KB 轉換為 MB / GB 等較高單位
// ==========================================

/**
 * 將 KB 數值格式化為人類可讀的字串
 * @param sizeKB 大小（KB）
 * @returns 格式化後的字串，例如 "500KB"、"2MB"、"1.5GB"
 */
export function formatSize(sizeKB: number): string {
  if (sizeKB < 1024) {
    // 小於 1024 KB，直接顯示 KB
    return Number.isInteger(sizeKB) ? `${sizeKB}KB` : `${sizeKB.toFixed(1)}KB`;
  }

  const sizeMB = sizeKB / 1024;
  if (sizeMB < 1024) {
    // 小於 1024 MB，顯示 MB
    return Number.isInteger(sizeMB) ? `${sizeMB}MB` : `${sizeMB.toFixed(1)}MB`;
  }

  const sizeGB = sizeMB / 1024;
  return Number.isInteger(sizeGB) ? `${sizeGB}GB` : `${sizeGB.toFixed(1)}GB`;
}
