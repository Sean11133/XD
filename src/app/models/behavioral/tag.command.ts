import type { FileSystemNode } from '../structural/file-system-node.model';
import { TagType } from '../structural/tag.model';
import type { ICommand } from './command.interface';
import type { TagMediator } from './tag.mediator';
import { LabelFactory } from '../creational/label.flyweight';

// ==========================================
// Command Pattern — Concrete Command（標籤命令）
// Mediator Pattern — 透過 TagMediator 執行標籤操作
//
// 支援兩種操作：新增標籤（add）/ 移除標籤（remove）
// execute()：透過 Mediator 新增或移除標籤（同步 node.tags）
// undo()：透過 Mediator 反向操作
//
// Flyweight Pattern：
//   description 使用 LabelFactory 取得 Label 享元的 displayName
//
// 若未傳入 mediator，退化為直接操作 node.tags（向後相容）
// ==========================================

export type TagAction = 'add' | 'remove';

export class TagCommand implements ICommand {
  readonly description: string;

  constructor(
    private node: FileSystemNode,
    private tag: TagType,
    private action: TagAction,
    private mediator?: TagMediator,
  ) {
    const label = LabelFactory.getLabel(tag);
    const actionLabel = action === 'add' ? '新增' : '移除';
    this.description = `${actionLabel}標籤：${node.name} → ${label.icon} ${label.displayName}`;
  }

  execute(): void {
    if (this.action === 'add') {
      this.mediator ? this.mediator.addTag(this.node, this.tag) : this.node.tags.add(this.tag);
    } else {
      this.mediator
        ? this.mediator.removeTag(this.node, this.tag)
        : this.node.tags.delete(this.tag);
    }
  }

  undo(): void {
    // 反向操作
    if (this.action === 'add') {
      this.mediator
        ? this.mediator.removeTag(this.node, this.tag)
        : this.node.tags.delete(this.tag);
    } else {
      this.mediator ? this.mediator.addTag(this.node, this.tag) : this.node.tags.add(this.tag);
    }
  }
}
