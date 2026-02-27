import type { FileSystemNode } from '../structural/file-system-node.model';
import { Clipboard } from '../creational/clipboard.singleton';
import type { ICommand } from './command.interface';

// ==========================================
// Command Pattern — Concrete Command（複製命令）
// Singleton Pattern — 使用 Clipboard 全域剪貼簿
//
// execute()：將選取的節點深拷貝至 Clipboard
// undo()：清空 Clipboard（還原為複製前的剪貼簿狀態）
// ==========================================

export class CopyCommand implements ICommand {
  readonly description: string;

  /** 備份：複製前剪貼簿中的舊內容（供 undo 還原） */
  private previousContent: FileSystemNode | null = null;
  private previousSourceName: string | null = null;

  constructor(private node: FileSystemNode) {
    this.description = `複製：${node.name}`;
  }

  execute(): void {
    const clipboard = Clipboard.getInstance();

    // 備份舊剪貼簿內容
    this.previousContent = clipboard.hasContent() ? clipboard.paste() : null;
    this.previousSourceName = clipboard.getSourceName();

    // 將節點複製到剪貼簿
    clipboard.copy(this.node);
  }

  undo(): void {
    const clipboard = Clipboard.getInstance();

    // 還原到複製前的剪貼簿狀態
    clipboard.clear();
    if (this.previousContent) {
      clipboard.copy(this.previousContent);
    }
  }
}
