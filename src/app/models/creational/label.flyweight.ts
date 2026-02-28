import { TagType, TAG_COLORS } from '../structural/tag.model';

// ==========================================
// Flyweight Pattern — Label（享元物件）+ LabelFactory（享元工廠）
//
// 核心概念：
//   - Label 是不可變的共享物件（intrinsic state）
//   - 每種 TagType 只會有一個 Label 實例（唯一性）
//   - LabelFactory 維護物件池（pool），確保同一類型回傳同一實例
//   - 外在狀態（extrinsic state）= 哪個節點掛了哪些標籤
//     → 由 TagMediator 管理（不存在 Label 內部）
// ==========================================

/** Flyweight — 標籤享元物件（不可變、共享） */
export class Label {
  constructor(
    /** 標籤類型（唯一鍵） */
    readonly type: TagType,
    /** 顯示名稱 */
    readonly displayName: string,
    /** 色碼 */
    readonly color: string,
    /** 圖示 */
    readonly icon: string,
  ) {}
}

/** Flyweight Factory — 標籤享元工廠（管理共享池） */
export class LabelFactory {
  /** 享元池：同一 TagType 永遠回傳相同 Label 實例 */
  private static readonly pool = new Map<TagType, Label>();

  /** private constructor 防止外部實例化 */
  private constructor() {}

  /**
   * 取得共享 Label 實例（Lazy Init）
   * 首次呼叫時建立，之後回傳同一物件
   */
  static getLabel(type: TagType): Label {
    if (!this.pool.has(type)) {
      this.pool.set(type, this.createLabel(type));
    }
    return this.pool.get(type)!;
  }

  /** 取得所有可用標籤（依序） */
  static getAllLabels(): Label[] {
    return [TagType.Urgent, TagType.Work, TagType.Personal].map((t) => this.getLabel(t));
  }

  /** 享元池大小（供測試驗證） */
  static getPoolSize(): number {
    return this.pool.size;
  }

  /** 重置享元池（測試用） */
  static resetPool(): void {
    this.pool.clear();
  }

  /** 建立 Label 實例（內部使用） */
  private static createLabel(type: TagType): Label {
    switch (type) {
      case TagType.Urgent:
        return new Label(type, '緊急', TAG_COLORS[TagType.Urgent], '🔴');
      case TagType.Work:
        return new Label(type, '工作', TAG_COLORS[TagType.Work], '🔵');
      case TagType.Personal:
        return new Label(type, '個人', TAG_COLORS[TagType.Personal], '🟢');
    }
  }
}
