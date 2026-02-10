import type { FileSystemNode } from '../models/file-system-node.model';
import { TagType } from '../models/tag.model';
import type { ICommand } from './command.interface';

// ==========================================
// Command Pattern — Concrete Command（標籤命令）
//
// 支援兩種操作：新增標籤（add）/ 移除標籤（remove）
// execute()：對節點新增或移除標籤
// undo()：反向操作（新增→移除，移除→新增）
// ==========================================

export type TagAction = 'add' | 'remove';

export class TagCommand implements ICommand {
  readonly description: string;

  constructor(
    private node: FileSystemNode,
    private tag: TagType,
    private action: TagAction,
  ) {
    const actionLabel = action === 'add' ? '新增' : '移除';
    this.description = `${actionLabel}標籤：${node.name} → ${tag}`;
  }

  execute(): void {
    if (this.action === 'add') {
      this.node.tags.add(this.tag);
    } else {
      this.node.tags.delete(this.tag);
    }
  }

  undo(): void {
    // 反向操作
    if (this.action === 'add') {
      this.node.tags.delete(this.tag);
    } else {
      this.node.tags.add(this.tag);
    }
  }
}
