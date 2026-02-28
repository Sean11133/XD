import type { FileSystemNode } from '../structural/file-system-node.model';
import { Directory } from '../structural/directory.model';
import { TagType } from '../structural/tag.model';
import { LabelFactory } from '../creational/label.flyweight';
import type { Label } from '../creational/label.flyweight';

// ==========================================
// Mediator Pattern — TagMediator（標籤中介者）
//
// 核心概念：
//   - 集中管理「標籤 ↔ 檔案」的多對多關係
//   - 正向索引：node.id → Set<TagType>
//   - 反向索引：TagType → Set<node.id>
//   - 所有標籤操作都透過 Mediator，不直接存取 node.tags
//   - Mediator 同步 node.tags 以維持向後相容
//
// 使用 Flyweight：
//   - 查詢回傳 Label 物件（非 TagType），由 LabelFactory 提供共享實例
//
// 為何不用 Angular DI？
//   - TagMediator 是純 TypeScript 類別，方便單元測試
//   - 由 Facade 持有實例，生命週期跟隨 Facade
// ==========================================

export class TagMediator {
  /** 正向索引：node.id → 該節點的標籤集合 */
  private nodeToLabels = new Map<number, Set<TagType>>();

  /** 反向索引：TagType → 擁有此標籤的節點 ID 集合 */
  private labelToNodeIds = new Map<TagType, Set<number>>();

  /** 節點註冊表：node.id → FileSystemNode（方便反查回傳實際物件） */
  private nodeRegistry = new Map<number, FileSystemNode>();

  /** 對節點新增標籤（同時更新正向、反向索引與 node.tags） */
  addTag(node: FileSystemNode, type: TagType): void {
    // 正向索引
    if (!this.nodeToLabels.has(node.id)) {
      this.nodeToLabels.set(node.id, new Set());
    }
    this.nodeToLabels.get(node.id)!.add(type);

    // 反向索引
    if (!this.labelToNodeIds.has(type)) {
      this.labelToNodeIds.set(type, new Set());
    }
    this.labelToNodeIds.get(type)!.add(node.id);

    // 註冊節點參考
    this.nodeRegistry.set(node.id, node);

    // 同步 node.tags（向後相容：SortByTagStrategy、TreeView 仍讀 node.tags）
    node.tags.add(type);
  }

  /** 移除節點的標籤（同時更新所有索引與 node.tags） */
  removeTag(node: FileSystemNode, type: TagType): void {
    this.nodeToLabels.get(node.id)?.delete(type);
    this.labelToNodeIds.get(type)?.delete(node.id);

    // 同步 node.tags
    node.tags.delete(type);
  }

  /** 判斷節點是否有特定標籤 */
  hasTag(node: FileSystemNode, type: TagType): boolean {
    return this.nodeToLabels.get(node.id)?.has(type) ?? false;
  }

  /** 取得節點的所有標籤（回傳 Flyweight Label 物件） */
  getLabelsForNode(node: FileSystemNode): Label[] {
    const types = this.nodeToLabels.get(node.id);
    if (!types || types.size === 0) return [];
    return Array.from(types).map((t) => LabelFactory.getLabel(t));
  }

  /** 反向查詢：取得所有擁有特定標籤的節點 */
  getNodesByLabel(type: TagType): FileSystemNode[] {
    const ids = this.labelToNodeIds.get(type);
    if (!ids) return [];
    return Array.from(ids)
      .map((id) => this.nodeRegistry.get(id))
      .filter((n): n is FileSystemNode => n !== undefined);
  }

  /** 取得各標籤的即時數量（O(1) — 直接從反向索引讀取） */
  getTagCounts(): Record<TagType, number> {
    const counts = {} as Record<TagType, number>;
    for (const type of [TagType.Urgent, TagType.Work, TagType.Personal]) {
      counts[type] = this.labelToNodeIds.get(type)?.size ?? 0;
    }
    return counts;
  }

  /** 註冊既有節點（同步 node.tags 到 Mediator 索引，不修改 node.tags） */
  registerNode(node: FileSystemNode): void {
    this.nodeRegistry.set(node.id, node);
    for (const tag of node.tags) {
      if (!this.nodeToLabels.has(node.id)) {
        this.nodeToLabels.set(node.id, new Set());
      }
      this.nodeToLabels.get(node.id)!.add(tag);

      if (!this.labelToNodeIds.has(tag)) {
        this.labelToNodeIds.set(tag, new Set());
      }
      this.labelToNodeIds.get(tag)!.add(node.id);
    }
  }

  /** 移除節點的所有標籤記錄（用於節點刪除時） */
  unregisterNode(node: FileSystemNode): void {
    const types = this.nodeToLabels.get(node.id);
    if (types) {
      for (const type of types) {
        this.labelToNodeIds.get(type)?.delete(node.id);
      }
    }
    this.nodeToLabels.delete(node.id);
    this.nodeRegistry.delete(node.id);
  }

  /** 從樹結構同步所有節點（遍歷整棵樹，重建完整索引） */
  syncFromTree(root: FileSystemNode): void {
    this.nodeToLabels.clear();
    this.labelToNodeIds.clear();
    this.nodeRegistry.clear();
    this.walkTree(root);
  }

  /** 遞迴走訪樹（內部使用） */
  private walkTree(node: FileSystemNode): void {
    this.registerNode(node);
    if (node instanceof Directory) {
      for (const child of node.children) {
        this.walkTree(child);
      }
    }
  }
}
