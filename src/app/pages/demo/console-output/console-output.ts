import {
  Component,
  ChangeDetectionStrategy,
  input,
  ElementRef,
  viewChild,
  AfterViewChecked,
} from '@angular/core';

// ==========================================
// ConsoleOutputComponent — Console 面板子元件
//
// 🎨 Day 5 整合 Decorator Pattern：
//   接收 HTML 格式日誌（經 Decorator 裝飾後的輸出），
//   用 [innerHTML] 渲染帶有圖標、顏色、粗體的訊息。
// ==========================================

@Component({
  selector: 'app-console-output',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="console-box">
      <div class="console-header">📡 Observer Console — 樹狀訪問即時進度</div>
      <div class="console-content" #consoleContent [innerHTML]="content()"></div>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .console-box {
      background: #000;
      border: 1px solid #333;
      border-radius: 4px;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .console-header {
      background: #333;
      padding: 5px 10px;
      font-size: 0.8rem;
      color: #fff;
      flex-shrink: 0;
    }
    .console-content {
      padding: 15px;
      margin: 0;
      color: #cccccc;
      overflow-y: auto;
      flex: 1;
      font-size: 0.85rem;
      line-height: 1.8;
    }

    /* ── Decorator Pattern — 日誌裝飾樣式 ── */
    :host ::ng-deep {
      .log-icon {
        display: inline-block;
        width: 1.5em;
        text-align: center;
      }
      .log-dim {
        color: #666;
      }
      .log-green {
        color: #64ffda;
      }
      .log-cyan {
        color: #00bcd4;
      }
      .log-blue {
        color: #82b1ff;
      }
      .log-yellow {
        color: #ffd740;
      }
      .log-default {
        color: #cccccc;
      }
    }
  `,
})
export class ConsoleOutputComponent implements AfterViewChecked {
  /** 輸入：Console 顯示的 HTML 內容（Decorator 渲染後） */
  content = input.required<string>();

  private consoleContent = viewChild<ElementRef>('consoleContent');

  /** 每次內容更新後自動捲動至底部 */
  ngAfterViewChecked(): void {
    const el = this.consoleContent()?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
