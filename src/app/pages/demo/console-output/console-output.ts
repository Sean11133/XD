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
// 負責顯示 Observer 事件輸出
// ==========================================

@Component({
  selector: 'app-console-output',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="console-box">
      <div class="console-header">📡 Observer Console — 樹狀訪問即時進度</div>
      <pre class="console-content" #consoleContent>{{ content() }}</pre>
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
      white-space: pre-wrap;
      overflow-y: auto;
      flex: 1;
      font-size: 0.85rem;
      line-height: 1.5;
    }
  `,
})
export class ConsoleOutputComponent implements AfterViewChecked {
  /** 輸入：Console 顯示的內容 */
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
