import type { Directory } from '../structural/directory.model';
import type { ImageFile } from '../structural/image-file.model';
import type { TextFile } from '../structural/text-file.model';
import type { WordFile } from '../structural/word-file.model';

/**
 * Visitor Pattern — 訪問者介面
 * 定義對每種檔案系統節點的操作方法（Double Dispatch）
 */
export interface IVisitor {
  visitDirectory(dir: Directory): void;
  visitWordFile(file: WordFile): void;
  visitImageFile(file: ImageFile): void;
  visitTextFile(file: TextFile): void;
}
