import type { FileSystemNode } from '../structural/file-system-node.model';
import type { Directory } from '../structural/directory.model';
import { Clipboard } from '../creational/clipboard.singleton';
import type { ICommand } from './command.interface';

// ==========================================
// Command Pattern — Concrete Command（貼上命令）
// Singleton Pattern — 從 Clipboard 全域剪貼簿取出節點
//
// execute()：從 Clipboard 取出深拷貝副本，加入目標目錄
// undo()：從目標目錄移除已貼上的節點
// ==========================================

export class PasteCommand implements ICommand {
  readonly description: string;

  /** 實際貼上的節點（execute 時建立，undo 時移除） */
  private pastedNode: FileSystemNode | null = null;

  constructor(private targetDir: Directory) {
    const clipboard = Clipboard.getInstance();
    const sourceName = clipboard.getSourceName() ?? '(空)';
    this.description = `貼上：${sourceName} → ${targetDir.name}`;
  }

  execute(): void {
    const clipboard = Clipboard.getInstance();
    const node = clipboard.paste();

    if (!node) {
      throw new Error('剪貼簿為空，無法貼上');
    }

    this.pastedNode = node;
    this.targetDir.add(node);
  }

  undo(): void {
    if (this.pastedNode) {
      this.targetDir.remove(this.pastedNode);
      this.pastedNode = null;
    }
  }
}
