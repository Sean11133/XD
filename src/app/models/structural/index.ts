// ==========================================
// 結構型模式（Structural Patterns）— Barrel Export
//
// Composite Pattern：檔案系統節點階層
// Decorator Pattern：日誌訊息裝飾
// Adapter Pattern：搜尋事件轉儀表板介面
// ==========================================

export type { HighlightState } from './file-system-node.model';
export { FileSystemNode, FileNode } from './file-system-node.model';
export { Directory } from './directory.model';
export { WordFile } from './word-file.model';
export { ImageFile } from './image-file.model';
export { TextFile } from './text-file.model';
export { TagType, TAG_COLORS } from './tag.model';
export { formatSize } from './format-size.util';

// --- Decorator Pattern ---
export type { ILogEntry } from './log-entry.decorator';
export {
  PlainLogEntry,
  LogDecorator,
  IconDecorator,
  ColorDecorator,
  BoldDecorator,
} from './log-entry.decorator';
export { decorateLogEntry, detectLogCategory } from './log-decorator.factory';
export type { LogCategory } from './log-decorator.factory';

// --- Adapter Pattern ---
export type { IDashboardDisplay } from './search-event.adapter';
export { SearchEventAdapter } from './search-event.adapter';
