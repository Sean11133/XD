import { Injectable } from '@angular/core';

import type { FileSystemNode } from '../../models/structural/file-system-node.model';
import type { HighlightState } from '../../models/structural/file-system-node.model';
import { Directory } from '../../models/structural/directory.model';

// ==========================================
// ViewState Service — UI 狀態管理
//
// 將 highlightState 從 Domain Model 分離出來，
// 由此 Service 統一管理所有節點的 UI 高亮狀態。
// 使用 Map<number, HighlightState> 以節點 ID 為 key。
// ==========================================

@Injectable({ providedIn: 'root' })
export class ViewStateService {
  /** 節點 ID → 高亮狀態的映射 */
  private highlightStates = new Map<number, HighlightState>();

  /** 取得指定節點的高亮狀態 */
  getHighlightState(node: FileSystemNode): HighlightState {
    return this.highlightStates.get(node.id) ?? 'none';
  }

  /** 設定指定節點的高亮狀態 */
  setHighlightState(node: FileSystemNode, state: HighlightState): void {
    if (state === 'none') {
      this.highlightStates.delete(node.id);
    } else {
      this.highlightStates.set(node.id, state);
    }
  }

  /** 重置所有節點的高亮狀態 */
  resetAll(): void {
    this.highlightStates.clear();
  }

  /** 遞迴重置某棵樹的所有高亮狀態 */
  resetTree(node: FileSystemNode): void {
    this.highlightStates.delete(node.id);
    if (node instanceof Directory) {
      node.children.forEach((child) => this.resetTree(child));
    }
  }
}
