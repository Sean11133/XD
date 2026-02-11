import type { Directory } from '../structural/directory.model';
import type { FileSystemNode } from '../structural/file-system-node.model';
import type { ICommand } from './command.interface';

// ==========================================
// Command Pattern — Concrete Command（刪除命令）
//
// execute()：從父目錄移除指定節點
// undo()：將節點插回原位（使用保存的 parent + index）
// ==========================================

export class DeleteCommand implements ICommand {
  readonly description: string;

  /** 備份：被刪除節點在父目錄中的位置 */
  private removedIndex = -1;

  constructor(
    private node: FileSystemNode,
    private parent: Directory,
  ) {
    this.description = `刪除：${node.name}`;
  }

  execute(): void {
    this.removedIndex = this.parent.remove(this.node);
  }

  undo(): void {
    if (this.removedIndex !== -1) {
      this.parent.insertAt(this.node, this.removedIndex);
    }
  }
}
