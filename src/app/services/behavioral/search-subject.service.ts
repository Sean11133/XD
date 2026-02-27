import { Injectable } from '@angular/core';
import { Subject, type Observable } from 'rxjs';

import type { SearchEvent } from '../../models/behavioral/search-event.model';
import type { IObserver, ISubject } from '../../models/behavioral/observer.interface';

// ==========================================
// Observer Pattern — Subject（發佈端 / 被觀察者）
// 職責：管理觀察者清單與搜尋事件流，廣播通知所有 Observer
//
// 🎭 行為型模式（Behavioral Pattern）
//
// 實作 GoF ISubject<T> 介面：
//   attach(observer) → 註冊觀察者
//   detach(observer) → 移除觀察者
//   notify(event)    → 廣播事件
//
// 同時保留 RxJS Observable（events$）供 Angular 元件訂閱，
// 兩種方式並存，確保向後相容。
//
// 核心精神：發佈端與接收端完全解耦，
//          可各自獨立開發、獨立測試。
// ==========================================

@Injectable({ providedIn: 'root' })
export class SearchSubjectService implements ISubject<SearchEvent> {
  /** GoF Observer 清單 — 顯式管理的觀察者集合 */
  private readonly observers = new Set<IObserver<SearchEvent>>();

  /**
   * RxJS Subject — 同時提供串流式訂閱
   * 與 GoF observers 並行，Angular 元件可用 pipe() 操作
   */
  private readonly searchEvent$ = new Subject<SearchEvent>();

  /**
   * 公開 Observable（唯讀），供 Angular 元件訂閱
   * 封裝原則：外部只能 subscribe，不能直接 next()
   */
  get events$(): Observable<SearchEvent> {
    return this.searchEvent$.asObservable();
  }

  /**
   * 註冊觀察者（GoF attach）
   * Observer 註冊後，每次 notify() 都會收到事件
   */
  attach(observer: IObserver<SearchEvent>): void {
    this.observers.add(observer);
  }

  /**
   * 移除觀察者（GoF detach）
   * 移除後不再收到後續事件
   */
  detach(observer: IObserver<SearchEvent>): void {
    this.observers.delete(observer);
  }

  /**
   * 廣播事件 — 通知所有已註冊的 Observer
   * 同時推送至 GoF observers 與 RxJS stream
   */
  notify(event: SearchEvent): void {
    // GoF Observer：迭代所有觀察者，呼叫 update()
    for (const observer of this.observers) {
      observer.update(event);
    }
    // RxJS stream：向後相容 Angular 元件的 subscribe()
    this.searchEvent$.next(event);
  }
}
