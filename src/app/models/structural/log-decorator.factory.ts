import type { SearchEventType } from '../behavioral/search-event.model';
import type { ILogEntry } from './log-entry.decorator';
import { PlainLogEntry, IconDecorator, ColorDecorator, BoldDecorator } from './log-entry.decorator';

// ==========================================
// Decorator Pattern — 日誌裝飾器工廠
//
// 依 SearchEventType 自動組合 Decorator 鏈：
//   visiting → Icon(🔍) + Color(dim)
//   matched  → Icon(✅) + Color(green) + Bold
//   complete → Icon(🏁) + Color(cyan) + Bold
//   system   → Icon(⚙️) + Color(blue)
//   command  → Icon(⚡) + Color(yellow)
//   default  → Icon(💬) + Color(default)
//
// 使用者不需知道 Decorator 細節，只需呼叫 decorateLogEntry()
// ==========================================

/** 日誌類型（擴展 SearchEventType，加入 system / command / default） */
export type LogCategory = SearchEventType | 'system' | 'command' | 'default';

/** 裝飾配置 — 每種類型對應的圖標、顏色 class、是否粗體 */
interface DecorateConfig {
  icon: string;
  colorClass: string;
  bold: boolean;
}

/** 各類型的裝飾配置表 */
const DECORATE_MAP: Record<LogCategory, DecorateConfig> = {
  visiting: { icon: '🔍', colorClass: 'dim', bold: false },
  matched: { icon: '✅', colorClass: 'green', bold: true },
  complete: { icon: '🏁', colorClass: 'cyan', bold: true },
  system: { icon: '⚙️', colorClass: 'blue', bold: false },
  command: { icon: '⚡', colorClass: 'yellow', bold: false },
  default: { icon: '💬', colorClass: 'default', bold: false },
};

/**
 * 偵測訊息關鍵字，自動判斷日誌類別
 * 依優先順序：matched > complete > visiting > command > system > default
 */
export function detectLogCategory(message: string): LogCategory {
  if (message.includes('匹配') || message.includes('MATCH') || message.includes('✅')) {
    return 'matched';
  }
  if (message.includes('完成') || message.includes('🏁')) {
    return 'complete';
  }
  if (message.includes('進入目錄') || message.includes('檢查') || message.includes('🔎')) {
    return 'visiting';
  }
  if (message.includes('[Command]') || message.includes('撤銷') || message.includes('重做')) {
    return 'command';
  }
  if (message.includes('[System]') || message.includes('計算') || message.includes('匯出')) {
    return 'system';
  }
  return 'default';
}

/**
 * Decorator Pattern — 組裝裝飾器鏈
 * 依類別疊加 Icon → Color → Bold（可選）
 *
 * @param message  原始訊息文字
 * @param category 日誌類別（可省略，自動偵測關鍵字）
 * @returns 已裝飾的 ILogEntry，呼叫 render() 取得 HTML
 */
export function decorateLogEntry(message: string, category?: LogCategory): ILogEntry {
  const cat = category ?? detectLogCategory(message);
  const config = DECORATE_MAP[cat];

  // 依序疊加裝飾器（最內層 → 最外層）
  let entry: ILogEntry = new PlainLogEntry(message);
  entry = new ColorDecorator(entry, config.colorClass);
  if (config.bold) {
    entry = new BoldDecorator(entry);
  }
  entry = new IconDecorator(entry, config.icon);

  return entry;
}
