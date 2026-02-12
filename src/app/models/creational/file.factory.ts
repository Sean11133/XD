import type { FileNode } from '../structural/file-system-node.model';
import { WordFile } from '../structural/word-file.model';
import { ImageFile } from '../structural/image-file.model';
import { TextFile } from '../structural/text-file.model';
import { Directory } from '../structural/directory.model';

// ==========================================
// Creational Pattern — Factory
// 封裝檔案節點的建構邏輯，降低外部對具體類別的依賴
// ==========================================

/** 檔案類型 */
export type FileType = 'word' | 'image' | 'text';

/** 建構參數 */
export interface WordFileParams {
  name: string;
  sizeKB: number;
  pages: number;
  createdAt?: Date;
}

export interface ImageFileParams {
  name: string;
  sizeKB: number;
  width: number;
  height: number;
  createdAt?: Date;
}

export interface TextFileParams {
  name: string;
  sizeKB: number;
  encoding: string;
  createdAt?: Date;
}

export type FileParams = WordFileParams | ImageFileParams | TextFileParams;

/**
 * Factory Pattern — 檔案工廠
 * 透過統一介面建構各種檔案類型的物件
 */
export class FileFactory {
  static createWord(params: WordFileParams): WordFile {
    return new WordFile(params.name, params.sizeKB, params.pages, params.createdAt);
  }

  static createImage(params: ImageFileParams): ImageFile {
    return new ImageFile(params.name, params.sizeKB, params.width, params.height, params.createdAt);
  }

  static createText(params: TextFileParams): TextFile {
    return new TextFile(params.name, params.sizeKB, params.encoding, params.createdAt);
  }

  static createDirectory(name: string): Directory {
    return new Directory(name);
  }

  /**
   * 通用工廠方法 — 依 type 動態建立檔案
   */
  static create(type: FileType, params: FileParams): FileNode {
    switch (type) {
      case 'word':
        return FileFactory.createWord(params as WordFileParams);
      case 'image':
        return FileFactory.createImage(params as ImageFileParams);
      case 'text':
        return FileFactory.createText(params as TextFileParams);
    }
  }
}
