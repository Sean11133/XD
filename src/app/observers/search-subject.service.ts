import { Injectable } from '@angular/core';
import { Subject, type Observable } from 'rxjs';

import type { SearchEvent } from './search-event.model';

// ==========================================
// Observer Pattern — Subject（被觀察者）
// 職責：管理搜尋事件流，通知所有訂閱的 Observer
//
// 在 GoF Observer Pattern 中：
//   Subject  = SearchSubjectService（持有 observers、發送通知）
//   Observer = 任何 subscribe() 的元件（TreeView、Console 等）
//
// Angular/RxJS 中 Subject 天然實作了 Observer Pattern：
//   subject.next()      → notify()
//   subject.subscribe() → attach(observer)
//   unsubscribe()       → detach(observer)
// ==========================================

@Injectable({ providedIn: 'root' })
export class SearchSubjectService {
  /**
   * RxJS Subject — Observer Pattern 的核心
   * 多個 Observer 可以同時 subscribe 這個 stream
   */
  private readonly searchEvent$ = new Subject<SearchEvent>();

  /**
   * 公開 Observable（唯讀），供 Observer 訂閱
   * 封裝原則：外部只能 subscribe，不能直接 next()
   */
  get events$(): Observable<SearchEvent> {
    return this.searchEvent$.asObservable();
  }

  /**
   * 發出事件 — 通知所有已訂閱的 Observer
   * 對應 GoF 的 notify() / notifyObservers()
   */
  notify(event: SearchEvent): void {
    this.searchEvent$.next(event);
  }
}
