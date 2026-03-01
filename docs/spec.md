# 雲端檔案管理系統規格書（Spec）

## 1. 文件目的與範圍

本文件定義「雲端檔案管理系統（Cloud File Manager）」之前端應用規格，涵蓋：

- 功能需求（Use Case）
- Domain Model（Class Diagram）
- 狀態流轉（State Diagram）
- 資料模型（ER Diagram + Data Dictionary）
- 關鍵流程（Sequence Diagram）
- 架構與部署（Clean Architecture + C4 Container）

> 註：目前專案為 Angular SPA，尚未接入後端 API。ER 模型為可持久化設計基礎。

---

## 2. 系統邊界與角色

### 2.1 系統邊界

- 系統名稱：雲端檔案管理系統（Cloud File Manager）
- 邊界內：檔案樹瀏覽、搜尋、排序、標籤、複製貼上、匯出、Undo/Redo、事件通知與儀表板統計
- 邊界外：真實檔案儲存、身份驗證、資料庫落地、跨裝置同步

### 2.2 角色

- 主要角色（Primary Actor）：使用者
- 次要角色（Secondary Actor）：Observer（Console / Dashboard / UI 訂閱者）

---

## 3. Use Case Diagram（必要）

```mermaid
graph LR
  subgraph System["雲端檔案管理系統 Cloud File Manager"]
    UC1([瀏覽檔案階層])
    UC2([搜尋檔案])
    UC3([顯示搜尋進度])
    UC4([排序檔案])
    UC5([選擇排序策略])
    UC6([刪除檔案])
    UC7([標記檔案])
    UC8([撤銷 / 重做])
    UC9([匯出 XML / JSON / Markdown])
    UC10([計算總容量])
    UC11([即時通知觀察者])
    UC12([建立範例檔案樹])
  end

  User(("👤 使用者"))
  Observer(("👁 Observer"))

  User --> UC1
  User --> UC2
  User --> UC4
  User --> UC6
  User --> UC7
  User --> UC9
  User --> UC10
  User --> UC12

  Observer --> UC3
  Observer --> UC11

  UC2 -.->|include| UC3
  UC2 -.->|include| UC11
  UC4 -.->|include| UC5
  UC6 -.->|extend| UC8
  UC7 -.->|extend| UC8
  UC4 -.->|extend| UC8
```

---

## 4. 類別圖（Domain Model，必要）

```mermaid
classDiagram
  direction TB

  class FileSystemNode {
    <<abstract>>
    +id: number
    +name: string
    +tags: Set~TagType~
    +accept(visitor: IVisitor) void
    +clone() FileSystemNode
    +getSizeKB() number
    +getFormattedSize() string
    +getIcon() string
    +getTypeLabel() string
    +getDetails() string
    +getTagsArray() TagType[]
  }

  class FileNode {
    <<abstract>>
    +sizeKB: number
    +createdAt: Date
    +getSizeKB() number
  }

  class Directory {
    +children: FileSystemNode[]
    +add(node: FileSystemNode) void
    +remove(node: FileSystemNode) number
    +insertAt(index: number, node: FileSystemNode) void
  }

  class WordFile {
    +pages: number
  }

  class ImageFile {
    +width: number
    +height: number
  }

  class TextFile {
    +encoding: string
  }

  class TagMediator {
    -nodeToLabels: Map~number, Set~TagType~~
    -labelToNodeIds: Map~TagType, Set~number~~
    +addTag(node, tag) void
    +removeTag(node, tag) void
    +hasTag(node, tag) boolean
    +getLabelsForNode(node) Label[]
    +getNodesByLabel(type) FileSystemNode[]
    +syncFromTree(root) void
  }

  class FileManagerFacade {
    +buildSampleTree() Directory
    +searchByExtension(root, ext) string[]
    +sort(root, type, ascending) string
    +restoreSort(root, lastSortCommand) string
    +deleteNode(node, root) string | null
    +toggleTag(node, tag) string
    +copyNode(node) string
    +pasteNode(dir) string | null
    +formatLog(message) string
    +exportByFormat(root, format) string
  }

  FileSystemNode <|-- FileNode
  FileSystemNode <|-- Directory
  FileNode <|-- WordFile
  FileNode <|-- ImageFile
  FileNode <|-- TextFile
  Directory o-- FileSystemNode : children
  FileManagerFacade --> TagMediator
```

---

## 5. 狀態圖（必要）

> 下圖描述「搜尋流程 + UI 呈現」的狀態變化。

```mermaid
stateDiagram-v2
  [*] --> Idle

  Idle --> Preparing : prepareSearch(root)
  Preparing --> Searching : searchByExtension(root, ext)

  state Searching {
    [*] --> Visiting
    Visiting --> Visiting : notify(visiting)
    Visiting --> Matched : notify(matched)
    Matched --> Visiting : next node
  }

  Searching --> Completed : notify(complete)
  Completed --> Idle : reset / next query

  Searching --> Failed : unexpected error
  Failed --> Idle : reset
```

---

## 6. ER Diagram（必要：Table Schema）

```mermaid
erDiagram
  NODE {
    BIGINT id PK
    VARCHAR name
    VARCHAR node_kind
    BIGINT parent_id FK
    TIMESTAMP created_at
    TIMESTAMP updated_at
  }

  FILE_TYPE {
    VARCHAR code PK
    VARCHAR display_name
    VARCHAR default_extension
    VARCHAR mime_pattern
  }

  FILE {
    BIGINT node_id PK,FK
    VARCHAR file_type_code FK
    DECIMAL size_kb
    VARCHAR extension
    VARCHAR mime_type
  }

  FILE_ATTRIBUTE {
    BIGINT file_node_id PK,FK
    VARCHAR attr_key PK
    VARCHAR value_text
    DECIMAL value_number
    BOOLEAN value_boolean
    JSON value_json
    VARCHAR unit
  }

  TAG {
    VARCHAR type PK
    VARCHAR display_name
    VARCHAR color
    VARCHAR icon
  }

  NODE_TAG {
    BIGINT node_id PK,FK
    VARCHAR tag_type PK,FK
    TIMESTAMP tagged_at
  }

  COMMAND_LOG {
    BIGINT id PK
    VARCHAR command_type
    TIMESTAMP occurred_at
    JSON payload
  }

  NODE ||--o| FILE : "is file"
  NODE ||--o{ NODE : "contains"
  FILE_TYPE ||--o{ FILE : "typed as"
  FILE ||--o{ FILE_ATTRIBUTE : "has attributes"

  NODE ||--o{ NODE_TAG : "has"
  TAG ||--o{ NODE_TAG : "labels"
```

---

## 7. Data Dictionary（必要）

### 7.1 NODE

| 欄位         | 型別      | 約束                                    | 說明                    |
| ------------ | --------- | --------------------------------------- | ----------------------- |
| `id`         | BIGINT    | PK, NOT NULL                            | 節點唯一識別碼          |
| `name`       | VARCHAR   | NOT NULL                                | 節點名稱                |
| `node_kind`  | VARCHAR   | NOT NULL, CHECK IN (`directory`,`file`) | 節點種類                |
| `parent_id`  | BIGINT    | FK -> `NODE.id`, NULLABLE               | 父節點；根節點為 `NULL` |
| `created_at` | TIMESTAMP | NOT NULL                                | 建立時間                |
| `updated_at` | TIMESTAMP | NOT NULL                                | 最後更新時間            |

### 7.2 FILE_TYPE

| 欄位                | 型別    | 約束         | 說明                                 |
| ------------------- | ------- | ------------ | ------------------------------------ |
| `code`              | VARCHAR | PK, NOT NULL | 型別代碼（`word`、`image`、`text`…） |
| `display_name`      | VARCHAR | NOT NULL     | 顯示名稱                             |
| `default_extension` | VARCHAR | NULLABLE     | 預設副檔名                           |
| `mime_pattern`      | VARCHAR | NULLABLE     | MIME 規則                            |

### 7.3 FILE

| 欄位             | 型別    | 約束                             | 說明                                   |
| ---------------- | ------- | -------------------------------- | -------------------------------------- |
| `node_id`        | BIGINT  | PK, FK -> `NODE.id`              | 檔案節點 ID（`NODE.node_kind = file`） |
| `file_type_code` | VARCHAR | FK -> `FILE_TYPE.code`, NOT NULL | 檔案型別                               |
| `size_kb`        | DECIMAL | NOT NULL, CHECK >= 0             | 檔案大小（KB）                         |
| `extension`      | VARCHAR | NOT NULL                         | 副檔名                                 |
| `mime_type`      | VARCHAR | NULLABLE                         | MIME Type                              |

### 7.4 FILE_ATTRIBUTE

| 欄位            | 型別    | 約束                     | 說明                                                  |
| --------------- | ------- | ------------------------ | ----------------------------------------------------- |
| `file_node_id`  | BIGINT  | PK, FK -> `FILE.node_id` | 檔案節點 ID                                           |
| `attr_key`      | VARCHAR | PK, NOT NULL             | 屬性鍵（例如 `pages`、`width`、`height`、`encoding`） |
| `value_text`    | VARCHAR | NULLABLE                 | 文字值                                                |
| `value_number`  | DECIMAL | NULLABLE                 | 數值                                                  |
| `value_boolean` | BOOLEAN | NULLABLE                 | 布林值                                                |
| `value_json`    | JSON    | NULLABLE                 | 複合值                                                |
| `unit`          | VARCHAR | NULLABLE                 | 單位（例如 `px`）                                     |

### 7.5 TAG

| 欄位           | 型別    | 約束         | 說明                                       |
| -------------- | ------- | ------------ | ------------------------------------------ |
| `type`         | VARCHAR | PK, NOT NULL | 標籤鍵值（`urgent` / `work` / `personal`） |
| `display_name` | VARCHAR | NOT NULL     | 顯示名稱                                   |
| `color`        | VARCHAR | NOT NULL     | 顏色代碼                                   |
| `icon`         | VARCHAR | NOT NULL     | 圖示                                       |

### 7.6 NODE_TAG

| 欄位        | 型別      | 約束                 | 說明     |
| ----------- | --------- | -------------------- | -------- |
| `node_id`   | BIGINT    | PK, FK -> `NODE.id`  | 節點 ID  |
| `tag_type`  | VARCHAR   | PK, FK -> `TAG.type` | 標籤類型 |
| `tagged_at` | TIMESTAMP | NOT NULL             | 標記時間 |

### 7.7 COMMAND_LOG

| 欄位           | 型別      | 約束         | 說明                                               |
| -------------- | --------- | ------------ | -------------------------------------------------- |
| `id`           | BIGINT    | PK, NOT NULL | 日誌 ID                                            |
| `command_type` | VARCHAR   | NOT NULL     | 命令型別（Sort/Delete/Tag/Copy/Paste/RestoreSort） |
| `occurred_at`  | TIMESTAMP | NOT NULL     | 操作時間                                           |
| `payload`      | JSON      | NOT NULL     | 命令參數與快照                                     |

> 設計重點：新增檔案型別時，只需新增 `FILE_TYPE` 資料與對應 `FILE_ATTRIBUTE` 鍵值，不需新增資料表。

---

## 8. 架構與模型（必要）

### 8.1 Clean Architecture 對應

- **Entities**：`FileSystemNode`、`Directory`、`FileNode`、各檔案型別、`TagMediator`、Command/Strategy/Visitor 相關模型
- **Use Cases**：`FileManagerFacade`（整合操作）、`FileSystemService`（檔案樹與匯出/搜尋）、`CommandHistory`（交易歷史）
- **Interface Adapters**：`SearchEventAdapter`、`ConsoleObserver`、`DashboardObserver`
- **Frameworks & Drivers**：Angular Component / Router / Signals / RxJS Subject

### 8.2 系統架構圖（現況）

```mermaid
graph TB
  subgraph Client["Client Layer"]
    Browser["Web Browser"]
    DOM["Angular View / DOM"]
  end

  subgraph App["Application Layer"]
    Router["Angular Router"]
    Pages["Pages + Shared Components"]
    Facade["FileManagerFacade"]
    Svc["FileSystemService / CommandHistory / SearchSubjectService / ViewStateService"]
    Models["GoF Models (Creational / Structural / Behavioral)"]
  end

  subgraph Infra["Infrastructure (Future)"]
    API["REST API"]
    DB["Database"]
    Storage["Object Storage"]
  end

  Browser --> Router
  Router --> Pages
  Pages --> Facade
  Facade --> Svc
  Svc --> Models
  Svc -.-> API
  Models -.-> DB
  Models -.-> Storage
```

---

## 9. 序列圖（必要：關鍵流程）

### 9.1 搜尋副檔名流程

```mermaid
sequenceDiagram
  participant Demo as DemoComponent
  participant Facade as FileManagerFacade
  participant FS as FileSystemService
  participant Visitor as ExtensionSearchVisitor
  participant Dir as Directory
  participant Subject as SearchSubjectService

  Demo->>Facade: searchByExtension(root, ".docx")
  Facade->>Facade: viewState.resetTree(root)
  Facade->>FS: searchByExtension(root, ext)
  FS->>Visitor: create Visitor(ext, subject)
  FS->>Dir: root.accept(visitor)
  Dir->>Visitor: visitDirectory(this)
  Visitor->>Subject: notify(visiting)
  loop each child
    Dir->>Dir: child.accept(visitor)
  end
  Visitor->>Subject: notify(matched)
  FS->>Subject: notify(complete)
  Subject-->>Demo: onSearchEvent / UI 即時更新
  FS-->>Facade: results[]
  Facade-->>Demo: results[]
```

### 9.2 排序 + Undo 流程

```mermaid
sequenceDiagram
  participant Demo as DemoComponent
  participant Facade as FileManagerFacade
  participant Hist as CommandHistory
  participant Cmd as SortCommand
  participant Strat as ISortStrategy

  Demo->>Facade: sort(root, type, ascending)
  Facade->>Facade: createStrategy(type, ascending)
  Facade->>Cmd: create SortCommand(...)
  Facade->>Hist: executeCommand(cmd)
  Hist->>Cmd: execute()
  Cmd->>Strat: sort(nodes)
  Strat-->>Cmd: sortedNodes

  Demo->>Hist: undo()
  Hist->>Cmd: undo()
  Demo->>Hist: getLastSortState()
```

---

## 10. 容器/部署概觀（必要：C4 Model）

### 10.1 C4 Container Diagram

```mermaid
graph TB
  Person["Person: 使用者"]

  subgraph C1["Software System: Cloud File Manager"]
    C_Web["Container: Angular SPA\nTech: Angular 21 + TypeScript\nResponsibility: UI + Use Cases + Pattern Orchestration"]
    C_API["Container: Backend API (Future)\nTech: Node/.NET\nResponsibility: Auth, Persistence, Query"]
    C_DB["Container: Database (Future)\nTech: PostgreSQL/MySQL\nResponsibility: Nodes, Tags, Command Logs"]
    C_Storage["Container: Object Storage (Future)\nTech: S3/Azure Blob\nResponsibility: Binary/File Objects"]
  end

  Person --> C_Web
  C_Web -. HTTP/JSON .-> C_API
  C_API --> C_DB
  C_API --> C_Storage
```

### 10.2 部署拓撲（現況 + 未來）

```mermaid
graph LR
  Dev["Developer Machine"] -->|npm start| LocalSPA["Angular Dev Server"]
  User["Browser User"] -->|HTTPS| GH["GitHub Pages docs/"]

  GH -. future integration .-> API["Backend API"]
  API --> DB["RDBMS"]
  API --> OBJ["Object Storage"]
```

---

## 11. 非功能需求（摘要）

- 可測試性：核心邏輯可在無 DOM 下單元測試
- 可擴展性：新增檔案型別、排序策略、匯出格式不應修改既有核心類別（OCP）
- 可維護性：Facade 降低 UI 對底層模式耦合
- 一致性：所有使用者操作（排序/刪除/標籤/貼上）需具備可撤銷能力

---

## 12. 追溯矩陣（Use Case → Pattern）

| Use Case     | 核心 Pattern                   | 主要類別                                              |
| ------------ | ------------------------------ | ----------------------------------------------------- |
| 瀏覽檔案階層 | Composite                      | `Directory`, `FileSystemNode`                         |
| 搜尋檔案     | Visitor + Observer             | `ExtensionSearchVisitor`, `SearchSubjectService`      |
| 顯示搜尋進度 | Adapter + Observer             | `SearchEventAdapter`, `ConsoleObserver`               |
| 排序檔案     | Strategy + Command             | `ISortStrategy`, `SortCommand`                        |
| 刪除檔案     | Command                        | `DeleteCommand`, `CommandHistory`                     |
| 標記檔案     | Mediator + Flyweight + Command | `TagMediator`, `LabelFactory`, `TagCommand`           |
| 複製/貼上    | Singleton + Command            | `Clipboard`, `CopyCommand`, `PasteCommand`            |
| 匯出         | Visitor + Template Method      | `BaseExportVisitor`, `Xml/Json/MarkdownExportVisitor` |
| 統一對外入口 | Facade                         | `FileManagerFacade`                                   |
