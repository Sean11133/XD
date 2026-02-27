import type { IObserver } from '../behavioral/observer.interface';
import type { SearchEvent } from '../behavioral/search-event.model';

// ==========================================
// Adapter Pattern — 搜尋事件轉儀表板介面
//
// 🏗️ 結構型模式（Structural Pattern）
//
// GoF Adapter：將一個介面轉換成客戶端期望的另一個介面
//
// 問題：Subject 發出 SearchEvent（type + node + message），
//       但 Dashboard 需要 IDashboardDisplay（進度百分比 + 統計數據）
//       兩者參數結構完全不同，無法直接對接。
//
// 解法：SearchEventAdapter 同時實作 IObserver<SearchEvent>（被適配端）
//       和 IDashboardDisplay（目標端），在內部做介面轉換。
//
// 角色對應：
//   Target（目標介面）  = IDashboardDisplay
//   Adaptee（被適配端） = SearchEvent / IObserver<SearchEvent>
//   Adapter（適配器）   = SearchEventAdapter
//   Client（使用端）    = DashboardPanelComponent
// ==========================================

/** 目標介面 — Dashboard 元件期望的資料格式 */
export interface IDashboardDisplay {
  /** 進度百分比（0 ~ 100） */
  getProgress(): number;
  /** 已訪問節點數 */
  getVisitedCount(): number;
  /** 已匹配檔案數 */
  getMatchedCount(): number;
  /** 搜尋是否完成 */
  isSearchComplete(): boolean;
  /** 目前正在處理的節點名稱 */
  getCurrentNodeName(): string | null;
  /** 進度摘要文字 */
  getSummary(): string;
}

/**
 * Adapter — 將 SearchEvent 串流轉換為 IDashboardDisplay
 *
 * 同時實作 IObserver（接收 Subject 事件）與 IDashboardDisplay（提供 Dashboard 資料），
 * 在 update() 中累積事件，透過 IDashboardDisplay 方法輸出轉換後的格式。
 */
export class SearchEventAdapter implements IObserver<SearchEvent>, IDashboardDisplay {
  private visited = 0;
  private matched = 0;
  private complete = false;
  private currentNode: string | null = null;

  /** 預估的總節點數（由外部注入，計算百分比用） */
  private expectedTotal: number;

  /**
   * @param expectedTotal 預估的檔案樹節點總數，用於計算進度百分比
   */
  constructor(expectedTotal = 10) {
    this.expectedTotal = expectedTotal;
  }

  // ─── IObserver<SearchEvent> 實作（被適配端介面） ───

  /**
   * 接收 SearchEvent，內部轉換為 Dashboard 可用的統計資料
   * 這就是 Adapter 的核心 — 介面轉換邏輯
   */
  update(event: SearchEvent): void {
    switch (event.type) {
      case 'visiting':
        this.visited++;
        this.currentNode = event.node?.name ?? null;
        break;
      case 'matched':
        this.visited++;
        this.matched++;
        this.currentNode = event.node?.name ?? null;
        break;
      case 'complete':
        this.complete = true;
        this.currentNode = null;
        break;
    }
  }

  // ─── IDashboardDisplay 實作（目標介面） ───

  /** 進度百分比：依已訪問數 / 預估總數計算，完成時固定 100% */
  getProgress(): number {
    if (this.complete) return 100;
    if (this.expectedTotal <= 0) return 0;
    return Math.min(Math.round((this.visited / this.expectedTotal) * 100), 99);
  }

  getVisitedCount(): number {
    return this.visited;
  }

  getMatchedCount(): number {
    return this.matched;
  }

  isSearchComplete(): boolean {
    return this.complete;
  }

  getCurrentNodeName(): string | null {
    return this.currentNode;
  }

  /** 進度摘要 — 提供給 Dashboard 的人類可讀文字 */
  getSummary(): string {
    if (this.complete) {
      return `搜尋完成！已訪問 ${this.visited} 個節點，匹配 ${this.matched} 個檔案`;
    }
    return `搜尋中... ${this.getProgress()}% — 已訪問 ${this.visited} 個節點，匹配 ${this.matched} 個`;
  }

  /** 更新預估總節點數（搜尋開始前呼叫） */
  setExpectedTotal(total: number): void {
    this.expectedTotal = total;
  }

  /** 重置（新搜尋開始前呼叫） */
  reset(): void {
    this.visited = 0;
    this.matched = 0;
    this.complete = false;
    this.currentNode = null;
  }
}
