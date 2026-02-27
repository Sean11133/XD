// ==========================================
// 建立型模式（Creational Patterns）— Barrel Export
//
// Factory Pattern：檔案節點工廠
// Singleton Pattern：全域剪貼簿
// ==========================================

export { FileFactory } from './file.factory';
export type {
  FileType,
  FileParams,
  WordFileParams,
  ImageFileParams,
  TextFileParams,
} from './file.factory';

export { Clipboard } from './clipboard.singleton';
