# ☁️ 雲端檔案管理系統 — Design Patterns Demo

> 以 **Angular 21** 打造的互動式範例專案，深入展示 **Composite Pattern**、**Visitor Pattern** 與 **Observer Pattern** 的實務應用。

[![Angular](https://img.shields.io/badge/Angular-21-dd0031?logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 目錄

- [專案概述](#-專案概述)
- [分層架構](#-分層架構)
- [設計模式詳解](#-設計模式詳解)
  - [Composite Pattern（組合模式）](#composite-pattern組合模式)
  - [Visitor Pattern（訪問者模式）](#visitor-pattern訪問者模式)
  - [Observer Pattern（觀察者模式）](#observer-pattern觀察者模式)
- [類別架構圖](#-類別架構圖)
- [技術棧](#-技術棧)
- [快速開始](#-快速開始)
- [專案結構](#-專案結構)
- [功能展示](#-功能展示)

---

## 🎯 專案概述

本專案模擬一個雲端檔案管理系統，使用者可以：

- 🌲 瀏覽巢狀目錄結構（Composite Pattern）
- 📊 計算所有檔案的總容量
- 📑 將整棵目錄樹匯出為 XML 格式（Visitor Pattern）
- 🔍 依副檔名搜尋檔案（Visitor + Observer Pattern）
- 📡 搜尋時即時高亮匹配節點 + Console 顯示樹狀走訪進度（Observer Pattern）

透過真實的業務情境來理解設計模式，而非僅止於抽象概念。

---

## 🧱 分層架構

本專案採用清晰的**分層架構（Layered Architecture）**，將關注點分離至不同目錄，確保可維護性與可擴展性。

```
┌──────────────────────────────────────────────────────────┐
│                    View Layer (Component)                 │
│           app.ts  ·  app.html  ·  app.scss               │
│    UI 呈現 + 事件綁定 + Observer 訂閱搜尋事件             │
├──────────────────────────────────────────────────────────┤
│                    Service Layer                         │
│              services/file-system.service.ts              │
│       封裝業務邏輯：建樹、計算容量、匯出、搜尋            │
├──────────────────────────────────────────────────────────┤
│                    Observer Layer                         │
│    observers/search-event.model.ts    (Event Model)      │
│    observers/search-subject.service.ts (Subject)          │
│       Observer Pattern：管理搜尋事件流與通知機制          │
├──────────────────────────────────────────────────────────┤
│                    Visitor Layer                          │
│    visitors/xml-export.visitor.ts                         │
│    visitors/extension-search.visitor.ts                   │
│       實作 Visitor Pattern 的具體操作邏輯                 │
├──────────────────────────────────────────────────────────┤
│                    Model Layer                           │
│    models/file-system-node.model.ts  (Abstract)          │
│    models/directory.model.ts         (Composite)         │
│    models/word-file.model.ts         (Leaf)              │
│    models/image-file.model.ts        (Leaf)              │
│    models/text-file.model.ts         (Leaf)              │
│    models/visitor.interface.ts        (Interface)         │
│       定義領域物件 + Composite Pattern 結構               │
└──────────────────────────────────────────────────────────┘
```

| 層級         | 目錄                               | 職責                                                        | 設計原則           |
| ------------ | ---------------------------------- | ----------------------------------------------------------- | ------------------ |
| **Model**    | `models/`                          | 定義領域物件（Composite Pattern 的節點階層 + Visitor 介面） | 單一職責、開放封閉 |
| **Visitor**  | `visitors/`                        | 實作具體 Visitor 操作，與 Model 解耦                        | 開放封閉、單一職責 |
| **Observer** | `observers/`                       | 管理搜尋事件流（Subject + Event），通知 UI 即時更新         | 觀察者、開放封閉   |
| **Service**  | `services/`                        | 封裝業務邏輯，透過 Angular DI 注入至 Component              | 依賴反轉           |
| **View**     | `app.ts` + `app.html` + `app.scss` | UI 呈現 + Observer 訂閱事件流，驅動高亮與進度顯示           | 關注點分離         |

### 分層優勢

- ✅ **關注點分離**：Model / 業務邏輯 / Observer / UI 各司其職
- ✅ **可測試性**：Service 可獨立進行單元測試，不依賴 DOM
- ✅ **可擴展性**：新增 Visitor 或 Model 不影響其他層
- ✅ **鬆耦合通知**：Observer Layer 讓 Visitor 與 UI 無直接依賴
- ✅ **Angular 最佳實踐**：使用 `inject()` + `providedIn: 'root'` 管理依賴

---

## 🏗 設計模式詳解

### Composite Pattern（組合模式）

> **意圖**：將物件組合成樹狀結構，使客戶端能以一致的方式處理「單一物件」與「物件群組」。

#### 問題場景

檔案系統中，**檔案**（Leaf）和**目錄**（Composite）具有不同結構，但客戶端希望統一操作它們——例如「計算大小」不需要區分是檔案還是目錄。

#### 類別角色對應

| 角色          | 類別                                | 職責                                                                                  |
| ------------- | ----------------------------------- | ------------------------------------------------------------------------------------- |
| **Component** | `FileSystemNode`                    | 抽象基類，定義統一介面 (`getSizeKB()`, `getIcon()`, `getTypeLabel()`, `getDetails()`) |
| **Leaf**      | `WordFile`, `ImageFile`, `TextFile` | 具體檔案節點，實作自身行為                                                            |
| **Composite** | `Directory`                         | 含有 `children: FileSystemNode[]`，遞迴委派操作                                       |

#### 核心程式碼

```typescript
// Component（抽象）
abstract class FileSystemNode {
  abstract getSizeKB(): number;
  abstract getIcon(): string;
  abstract getTypeLabel(): string;
  abstract getDetails(): string;
}

// Composite（目錄 — 遞迴計算）
class Directory extends FileSystemNode {
  children: FileSystemNode[] = [];

  getSizeKB(): number {
    return this.children.reduce((sum, child) => sum + child.getSizeKB(), 0);
  }
}

// Leaf（檔案 — 直接返回）
class WordFile extends FileNode {
  getSizeKB(): number {
    return this.sizeKB;
  }
}
```

#### 設計優勢

- ✅ **統一介面**：客戶端無需區分節點類型即可操作
- ✅ **開放封閉原則**：新增檔案類型（如 `PdfFile`）只需繼承，不修改現有程式碼
- ✅ **遞迴組合**：目錄可以無限巢狀

---

### Visitor Pattern（訪問者模式）

> **意圖**：在不修改既有類別的前提下，定義作用於物件結構的新操作。

#### 問題場景

若要對檔案樹執行「匯出 XML」、「搜尋副檔名」等新操作，直接在每個節點類別中添加方法將導致**類別膨脹**且違反**單一職責原則**。

#### 類別角色對應

| 角色                 | 類別                     | 職責                                                                              |
| -------------------- | ------------------------ | --------------------------------------------------------------------------------- |
| **Visitor（介面）**  | `IVisitor`               | 定義 `visitDirectory()`, `visitWordFile()`, `visitImageFile()`, `visitTextFile()` |
| **Concrete Visitor** | `XmlExportVisitor`       | 遍歷樹結構並產生 XML 字串                                                         |
| **Concrete Visitor** | `ExtensionSearchVisitor` | 依副檔名過濾並收集搜尋結果                                                        |
| **Element**          | 各 `FileSystemNode` 子類 | 實作 `accept(visitor)` — Double Dispatch                                          |

#### 核心程式碼

```typescript
// Visitor 介面
interface IVisitor {
  visitDirectory(dir: Directory): void;
  visitWordFile(file: WordFile): void;
  visitImageFile(file: ImageFile): void;
  visitTextFile(file: TextFile): void;
}

// Concrete Visitor — XML 匯出
class XmlExportVisitor implements IVisitor {
  visitDirectory(dir: Directory) {
    // 產生開標籤 → 遞迴子節點 → 產生閉標籤
    dir.children.forEach((child) => child.accept(this));
  }
  visitWordFile(file: WordFile) {
    /* 產生 XML 元素 */
  }
}

// Element — Double Dispatch
class WordFile extends FileNode {
  accept(visitor: IVisitor) {
    visitor.visitWordFile(this); // 關鍵：呼叫 Visitor 對應方法
  }
}
```

#### 設計優勢

- ✅ **開放封閉原則**：新增操作只需新建 Visitor，不改動節點類別
- ✅ **單一職責原則**：匯出邏輯與節點定義分離
- ✅ **Double Dispatch**：根據 Visitor 類型 + Element 類型決定正確行為

---

### Observer Pattern（觀察者模式）

> **意圖**：定義物件間的一對多依賴關係，當一個物件（Subject）狀態改變時，所有依賴它的物件（Observers）會自動收到通知並更新。

#### 問題場景

使用者在右側面板點下「🔍 搜尋」後，需要**同時**讓左側目錄樹即時高亮匹配節點，以及右下 Console 即時顯示樹狀走訪進度。若在 Visitor 中直接操作 UI，將導致**高度耦合**——Visitor 不應知道 UI 的存在。

#### 解決方案

```
搜尋觸發
    │
    ▼
┌──────────────────────────────┐
│  ExtensionSearchVisitor      │  ← Visitor 走訪每個節點時
│  （Visitor + 事件發送者）     │     透過 Subject 發出事件
└──────────────┬───────────────┘
               │ notify(event)
               ▼
┌──────────────────────────────┐
│  SearchSubjectService        │  ← Subject（被觀察者）
│  RxJS Subject 管理事件流     │     持有 Observer 清單
└──────────┬───────────────────┘
           │  events$
     ┌─────┴─────┐
     ▼           ▼
┌──────────┐ ┌──────────┐
│ TreeView │ │ Console  │  ← Observer（觀察者）
│ 高亮節點  │ │ 顯示進度  │     subscribe 後自動收到通知
└──────────┘ └──────────┘
```

#### 類別角色對應

| 角色                    | 類別 / 元件              | 職責                                                             |
| ----------------------- | ------------------------ | ---------------------------------------------------------------- |
| **Event（事件資料）**   | `SearchEvent`            | 定義事件類型：`visiting` / `matched` / `complete` + 攜帶節點資訊 |
| **Subject（被觀察者）** | `SearchSubjectService`   | 持有 RxJS `Subject`，提供 `notify()` 與 `events$` Observable     |
| **Observer（觀察者）**  | `App` Component          | 訂閱 `events$`，收到通知時更新 TreeView 高亮 & Console 進度      |
| **事件發送者**          | `ExtensionSearchVisitor` | 走訪節點時呼叫 `subject.notify()` 發出即時事件                   |

#### 核心程式碼

```typescript
// Event Model — 定義搜尋過程中的事件類型
interface SearchEvent {
  type: 'visiting' | 'matched' | 'complete';
  node?: FileSystemNode;
  message: string;
}

// Subject — 管理事件流（RxJS 天然實作 Observer Pattern）
@Injectable({ providedIn: 'root' })
class SearchSubjectService {
  private searchEvent$ = new Subject<SearchEvent>();

  get events$(): Observable<SearchEvent> {
    return this.searchEvent$.asObservable(); // 唯讀，外部只能訂閱
  }

  notify(event: SearchEvent): void {
    this.searchEvent$.next(event); // 通知所有 Observer
  }
}

// Visitor 走訪時透過 Subject 發出事件
class ExtensionSearchVisitor implements IVisitor {
  constructor(
    private ext: string,
    private subject?: SearchSubjectService,
  ) {}

  visitDirectory(dir: Directory): void {
    this.subject?.notify({ type: 'visiting', node: dir, message: `📂 進入: ${dir.name}` });
    dir.children.forEach((child) => child.accept(this));
  }
}

// Observer — Component 訂閱事件流
class App implements OnInit, OnDestroy {
  private subscription?: Subscription;

  ngOnInit() {
    this.subscription = this.searchSubject.events$.subscribe((event) => {
      // Observer 1：更新 TreeView 高亮
      if (event.node) event.node.highlightState = event.type === 'matched' ? 'matched' : 'visiting';
      // Observer 2：累加 Console 進度
      this.consoleLogs.push(event.message);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe(); // detach — 避免記憶體洩漏
  }
}
```

#### GoF 對應 RxJS

| GoF Observer Pattern | RxJS / Angular 對應           |
| -------------------- | ----------------------------- |
| `attach(observer)`   | `subject.subscribe(callback)` |
| `detach(observer)`   | `subscription.unsubscribe()`  |
| `notify()`           | `subject.next(event)`         |
| Observer 介面        | `subscribe()` 的 callback     |

#### 設計優勢

- ✅ **鬆耦合**：Visitor 不知道 UI 的存在，只透過 Subject 發送事件
- ✅ **一對多通知**：一個事件同時驅動多個 UI 區域（TreeView + Console）
- ✅ **可擴展**：未來新增 Observer（如 StatusBar、Notification）不需修改 Subject
- ✅ **RxJS 天然整合**：Angular 生態中 Observable/Subject 即是 Observer Pattern 的最佳實踐

---

## 📐 類別架構圖

```
┌─────────────────────────────────────────────────────────────────┐
│                     FileSystemNode (Abstract)                   │
│  ───────────────────────────────────────────────────────────    │
│  + name: string                                                 │
│  + highlightState: HighlightState    ← Observer Pattern UI 狀態 │
│  + accept(visitor: IVisitor): void                              │
│  + getSizeKB(): number                                          │
│  + getIcon(): string                                            │
│  + getTypeLabel(): string                                       │
│  + getDetails(): string                                         │
└──────────┬──────────────────────────────────┬───────────────────┘
           │                                  │
           ▼                                  ▼
┌──────────────────────┐          ┌──────────────────────────┐
│  FileNode (Abstract) │          │   Directory (Composite)  │
│  + sizeKB: number    │          │  + children: FSNode[]    │
│  + getSizeKB()       │          │  + add(node): void       │
└──────┬───────────────┘          │  + getSizeKB() → Σ child │
       │                          └──────────────────────────┘
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   WordFile   │ │  ImageFile   │ │   TextFile   │
│  + pages     │ │  + width     │ │  + encoding  │
│              │ │  + height    │ │              │
└──────────────┘ └──────────────┘ └──────────────┘

┌─────────────────────────────────────────┐
│          IVisitor (Interface)           │
│  + visitDirectory(dir)                  │
│  + visitWordFile(file)                  │
│  + visitImageFile(file)                 │
│  + visitTextFile(file)                  │
└──────────┬──────────────┬───────────────┘
           │              │
           ▼              ▼
┌──────────────────┐ ┌───────────────────────────────────┐
│ XmlExportVisitor │ │ ExtensionSearchVisitor            │
│  + getResult()   │ │  + getResults()                   │
└──────────────────┘ │  - subject?: SearchSubjectService │ ── notify() ──┐
                     └───────────────────────────────────┘               │
                                                                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     Observer Pattern                                     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────┐    ┌──────────────────────────────────┐ │
│  │   SearchEvent (Model)       │    │  SearchSubjectService (Subject)  │ │
│  │  + type: EventType          │    │  - searchEvent$: Subject<>       │ │
│  │  + node?: FileSystemNode    │◄───│  + events$: Observable<>         │ │
│  │  + message: string          │    │  + notify(event): void           │ │
│  └─────────────────────────────┘    └───────────────┬──────────────────┘ │
│                                                     │ subscribe()        │
│                                                     ▼                    │
│                                        ┌────────────────────────────┐    │
│                                        │  App Component (Observer)  │    │
│                                        │  + onSearchEvent(event)    │    │
│                                        │    → 更新 TreeView 高亮     │    │
│                                        │    → 累加 Console 進度      │    │
│                                        └────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠 技術棧

| 技術                | 版本 | 用途                                  |
| ------------------- | ---- | ------------------------------------- |
| **Angular**         | 21.x | 前端框架（Standalone Components）     |
| **TypeScript**      | 5.9  | 強型別語言                            |
| **RxJS**            | 7.8  | 響應式程式設計                        |
| **Angular Signals** | —    | 狀態管理（取代傳統 Zone.js 變更偵測） |

### Angular 現代特性使用

- ✅ `ChangeDetectionStrategy.OnPush` + Signals
- ✅ 新版控制流語法 `@if` / `@for`
- ✅ Standalone Component（無需 NgModule）

---

## 🚀 快速開始

### 前置需求

- **Node.js** ≥ 20.x
- **npm** ≥ 11.x

### 安裝與啟動

```bash
# 1. Clone 專案
git clone https://github.com/Sean11133/XD.git
cd design-pattern

# 2. 安裝依賴
npm install

# 3. 啟動開發伺服器
npm start
```

應用程式將在 `http://localhost:4200/` 啟動。

### 其他指令

```bash
npm run build    # 建置生產版本
npm run test     # 執行單元測試
npm run watch    # 開發模式 Watch Build
```

---

## 📁 專案結構

```
design-pattern/
├── src/
│   ├── app/
│   │   ├── models/                              # 🏗 Model 層
│   │   │   ├── visitor.interface.ts              #   IVisitor 介面定義
│   │   │   ├── file-system-node.model.ts         #   FileSystemNode + FileNode 抽象基類
│   │   │   ├── word-file.model.ts                #   WordFile (Leaf)
│   │   │   ├── image-file.model.ts               #   ImageFile (Leaf)
│   │   │   ├── text-file.model.ts                #   TextFile (Leaf)
│   │   │   ├── directory.model.ts                #   Directory (Composite)
│   │   │   └── index.ts                          #   Barrel export
│   │   │
│   │   ├── visitors/                             # 🔄 Visitor 層
│   │   │   ├── xml-export.visitor.ts             #   XML 匯出 Visitor
│   │   │   ├── extension-search.visitor.ts       #   副檔名搜尋 Visitor（+ Observer 事件發送）
│   │   │   └── index.ts                          #   Barrel export
│   │   │
│   │   ├── observers/                            # 📡 Observer 層
│   │   │   ├── search-event.model.ts             #   SearchEvent 事件資料定義
│   │   │   ├── search-subject.service.ts          #   SearchSubjectService（Subject）
│   │   │   └── index.ts                          #   Barrel export
│   │   │
│   │   ├── services/                             # ⚙️ Service 層
│   │   │   ├── file-system.service.ts            #   業務邏輯封裝
│   │   │   └── index.ts                          #   Barrel export
│   │   │
│   │   ├── app.ts                                # 👁 View 層 — Component
│   │   ├── app.html                              # 📄 Template
│   │   ├── app.scss                              # 🎨 Styles
│   │   ├── app.config.ts                         # Angular 應用設定
│   │   ├── app.routes.ts                         # 路由設定
│   │   └── app.spec.ts                           # 單元測試
│   │
│   ├── main.ts                                   # 應用進入點
│   ├── index.html                                # 主頁 HTML
│   └── styles.scss                               # 全域樣式
│
├── angular.json                                  # Angular CLI 設定
├── package.json                                  # 依賴管理
├── tsconfig.json                                 # TypeScript 設定
└── README.md                                     # 本文件
```

---

## 🎮 功能展示

| 功能                    | 使用的模式         | 說明                                                     |
| ----------------------- | ------------------ | -------------------------------------------------------- |
| 📊 **計算總容量**       | Composite          | 遞迴加總所有子節點的 `getSizeKB()`                       |
| 📑 **匯出 XML**         | Visitor            | `XmlExportVisitor` 遍歷樹並生成 XML                      |
| 🔍 **副檔名搜尋**       | Visitor + Observer | `ExtensionSearchVisitor` 走訪時透過 Subject 即時發送事件 |
| 🌲 **目錄樹顯示**       | Composite          | Angular Template 遞迴渲染巢狀結構                        |
| ✨ **搜尋即時高亮**     | Observer           | 節點 `highlightState` 隨事件更新，TreeView 即時反映      |
| 📡 **Console 走訪進度** | Observer           | 訂閱事件流，逐行顯示 Visitor 的樹狀走訪軌跡              |

---

## 🔄 如何擴展

### 新增檔案類型（不違反 OCP）

```typescript
// 1. 在 models/ 新增 pdf-file.model.ts
export class PdfFile extends FileNode {
  constructor(
    name: string,
    sizeKB: number,
    public pages: number,
  ) {
    super(name, sizeKB);
  }
  getIcon() {
    return '📕';
  }
  getTypeLabel() {
    return '[PDF 檔案]';
  }
  getDetails() {
    return `(頁數: ${this.pages}, 大小: ${this.sizeKB}KB)`;
  }
  accept(visitor: IVisitor) {
    visitor.visitPdfFile(this);
  }
}

// 2. 在 models/visitor.interface.ts 新增 visitPdfFile() 方法
// 3. 在 visitors/ 各 Visitor 實作中新增對應邏輯
// 4. 在 models/index.ts 匯出新類別
```

### 新增操作（不修改節點類別）

```typescript
// 在 visitors/ 新建 size-report.visitor.ts 即可
export class SizeReportVisitor implements IVisitor {
  // 實作各 visit 方法，產生大小報告
}

// 在 services/file-system.service.ts 新增呼叫方法
// Component 層只需在 app.ts 新增按鈕綁定
```

---

## 📚 參考資源

- [Refactoring Guru — Composite Pattern](https://refactoring.guru/design-patterns/composite)
- [Refactoring Guru — Visitor Pattern](https://refactoring.guru/design-patterns/visitor)
- [Refactoring Guru — Observer Pattern](https://refactoring.guru/design-patterns/observer)
- [Angular Official Documentation](https://angular.dev/)
- [RxJS — Subject](https://rxjs.dev/guide/subject)

---

## 📝 License

This project is licensed under the **MIT License**.
