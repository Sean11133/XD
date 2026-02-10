# ☁️ 雲端檔案管理系統 — Design Patterns Demo

> 以 **Angular 21** 打造的互動式範例專案，深入展示 **Composite Pattern** 與 **Visitor Pattern** 的實務應用。

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
- 🔍 依副檔名搜尋檔案（Visitor Pattern）

透過真實的業務情境來理解設計模式，而非僅止於抽象概念。

---

## 🧱 分層架構

本專案採用清晰的**分層架構（Layered Architecture）**，將關注點分離至不同目錄，確保可維護性與可擴展性。

```
┌──────────────────────────────────────────────────────────┐
│                    View Layer (Component)                 │
│           app.ts  ·  app.html  ·  app.scss               │
│         UI 呈現 + 事件綁定，委派 Service 處理邏輯         │
├──────────────────────────────────────────────────────────┤
│                    Service Layer                         │
│              services/file-system.service.ts              │
│       封裝業務邏輯：建樹、計算容量、匯出、搜尋            │
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

| 層級        | 目錄                               | 職責                                                        | 設計原則           |
| ----------- | ---------------------------------- | ----------------------------------------------------------- | ------------------ |
| **Model**   | `models/`                          | 定義領域物件（Composite Pattern 的節點階層 + Visitor 介面） | 單一職責、開放封閉 |
| **Visitor** | `visitors/`                        | 實作具體 Visitor 操作，與 Model 解耦                        | 開放封閉、單一職責 |
| **Service** | `services/`                        | 封裝業務邏輯，透過 Angular DI 注入至 Component              | 依賴反轉           |
| **View**    | `app.ts` + `app.html` + `app.scss` | 純 UI 呈現，所有邏輯委派給 Service                          | 關注點分離         |

### 分層優勢

- ✅ **關注點分離**：Model / 業務邏輯 / UI 各司其職
- ✅ **可測試性**：Service 可獨立進行單元測試，不依賴 DOM
- ✅ **可擴展性**：新增 Visitor 或 Model 不影響其他層
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

## 📐 類別架構圖

```
┌─────────────────────────────────────────────────────────────────┐
│                     FileSystemNode (Abstract)                   │
│  ───────────────────────────────────────────────────────────    │
│  + name: string                                                 │
│  + accept(visitor: IVisitor): void                              │
│  + getSizeKB(): number                                          │
│  + getIcon(): string                                            │
│  + getTypeLabel(): string                                       │
│  + getDetails(): string                                         │
└──────────┬──────────────────────────────────┬───────────────────┘
           │                                  │
           ▼                                  ▼
┌─────────────────────┐          ┌──────────────────────────┐
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
│          IVisitor (Interface)            │
│  + visitDirectory(dir)                   │
│  + visitWordFile(file)                   │
│  + visitImageFile(file)                  │
│  + visitTextFile(file)                   │
└──────────┬──────────────┬───────────────┘
           │              │
           ▼              ▼
┌──────────────────┐ ┌─────────────────────────┐
│ XmlExportVisitor │ │ ExtensionSearchVisitor   │
│  + getResult()   │ │  + getResults()          │
└──────────────────┘ └─────────────────────────┘
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
│   │   │   ├── extension-search.visitor.ts       #   副檔名搜尋 Visitor
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

| 功能              | 使用的模式 | 說明                                      |
| ----------------- | ---------- | ----------------------------------------- |
| 📊 **計算總容量** | Composite  | 遞迴加總所有子節點的 `getSizeKB()`        |
| 📑 **匯出 XML**   | Visitor    | `XmlExportVisitor` 遍歷樹並生成 XML       |
| 🔍 **副檔名搜尋** | Visitor    | `ExtensionSearchVisitor` 過濾特定類型檔案 |
| 🌲 **目錄樹顯示** | Composite  | Angular Template 遞迴渲染巢狀結構         |

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
- [Angular Official Documentation](https://angular.dev/)

---

## 📝 License

This project is licensed under the **MIT License**.
