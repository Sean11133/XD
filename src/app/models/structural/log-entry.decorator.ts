// ==========================================
// Decorator Pattern — 日誌訊息裝飾器
//
// 🏗️ 結構型模式（Structural Pattern）
//
// GoF Decorator：動態為物件附加額外行為，不修改原始物件
//
// 角色對應：
//   Component（元件介面）    = ILogEntry
//   ConcreteComponent       = PlainLogEntry
//   Decorator（裝飾器基類）  = LogDecorator
//   ConcreteDecorator       = IconDecorator / ColorDecorator / BoldDecorator
//
// 核心精神：每個 Decorator 只負責一種裝飾（SRP），
//          可自由組合疊加，順序無關。
// ==========================================

/** 日誌條目介面 — Decorator Pattern 的 Component */
export interface ILogEntry {
  /** 產生格式化後的 HTML 字串 */
  render(): string;
}

/** 純文字日誌 — Concrete Component（最內層，無裝飾） */
export class PlainLogEntry implements ILogEntry {
  constructor(private readonly message: string) {}

  render(): string {
    return this.escapeHtml(this.message);
  }

  /** 跳脫 HTML 特殊字元，避免 XSS */
  private escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

/**
 * 裝飾器基類 — Decorator Pattern 的 Base Decorator
 * 持有一個 ILogEntry 參考，轉發 render() 呼叫
 */
export abstract class LogDecorator implements ILogEntry {
  constructor(protected readonly wrapped: ILogEntry) {}

  /** 子類別覆寫此方法，在 wrapped.render() 基礎上疊加裝飾 */
  abstract render(): string;
}

/**
 * 圖標裝飾器 — 依事件類型在訊息前加入醒目圖標
 * visiting → 🔍 / matched → ✅ / complete → 🏁 / 其它 → 💬
 */
export class IconDecorator extends LogDecorator {
  constructor(
    wrapped: ILogEntry,
    private readonly icon: string,
  ) {
    super(wrapped);
  }

  render(): string {
    return `<span class="log-icon">${this.icon}</span> ${this.wrapped.render()}`;
  }
}

/**
 * 顏色裝飾器 — 用 CSS class 包裹訊息，改變文字顏色
 * visiting → dim / matched → green / complete → cyan
 */
export class ColorDecorator extends LogDecorator {
  constructor(
    wrapped: ILogEntry,
    private readonly colorClass: string,
  ) {
    super(wrapped);
  }

  render(): string {
    return `<span class="log-${this.colorClass}">${this.wrapped.render()}</span>`;
  }
}

/**
 * 粗體裝飾器 — 將關鍵資訊加粗顯示
 * 用於 matched 和 complete 類型，突顯重要訊息
 */
export class BoldDecorator extends LogDecorator {
  render(): string {
    return `<strong>${this.wrapped.render()}</strong>`;
  }
}
