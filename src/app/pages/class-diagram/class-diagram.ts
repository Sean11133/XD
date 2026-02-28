import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MermaidDiagramComponent } from '../../shared/mermaid-diagram';

@Component({
  selector: 'app-class-diagram',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MermaidDiagramComponent],
  templateUrl: './class-diagram.html',
  styleUrl: './class-diagram.scss',
})
export class ClassDiagramComponent {
  /** 控制展開/收合各 Pattern 群組 */
  expandedGroup = signal<string | null>('composite');

  toggleGroup(group: string): void {
    this.expandedGroup.set(this.expandedGroup() === group ? null : group);
  }

  readonly compositeDiagram = `
classDiagram
  class FileSystemNode {
    <<abstract>>
    +id: number
    +name: string
    +tags: Set~TagType~
    +accept(visitor: IVisitor)* void
    +getSizeKB()* number
    +getFormattedSize() string
    +getIcon()* string
    +getTypeLabel()* string
    +getDetails()* string
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
    +add(node) void
    +remove(node) number
    +insertAt(node, index) void
    +getSizeKB() number
    +accept(visitor) void
  }
  class WordFile {
    +pages: number
    +accept(visitor) void
  }
  class ImageFile {
    +width: number
    +height: number
    +accept(visitor) void
  }
  class TextFile {
    +encoding: string
    +accept(visitor) void
  }

  FileSystemNode <|-- FileNode
  FileSystemNode <|-- Directory
  FileNode <|-- WordFile
  FileNode <|-- ImageFile
  FileNode <|-- TextFile
  Directory o-- FileSystemNode : children
`;

  readonly visitorDiagram = `
classDiagram
  class IVisitor {
    <<interface>>
    +visitDirectory(dir) void
    +visitWordFile(file) void
    +visitImageFile(file) void
    +visitTextFile(file) void
  }
  class BaseExportVisitor {
    <<abstract / Template Method>>
    #output: string
    #indentLevel: number
    #escape(text)* string
    #indent() string
    #formatDirectoryStart(name, count)* string
    #formatDirectoryEnd(name)* string
    #formatFile(name, details, isLast)* string
    #beginExport() void
    #endExport() void
    +getResult() string
    +reset() void
  }
  class XmlExportVisitor {
    #escape(text) string
    #formatDirectoryStart(name) string
    #formatDirectoryEnd(name) string
    #formatFile(name, details) string
    -sanitizeTagName(name) string
  }
  class JsonExportVisitor {
    #escape(text) string
    #formatDirectoryStart(name) string
    #formatDirectoryEnd(name) string
    #formatFile(name, details) string
    #beginExport() void
    #endExport() void
  }
  class MarkdownExportVisitor {
    #escape(text) string
    #indent() string
    #formatDirectoryStart(name) string
    #formatDirectoryEnd(name) string
    #formatFile(name, details) string
  }
  class ExtensionSearchVisitor {
    -results: string[]
    -targetExtension: string
    -subject: SearchSubjectService
    +getResults() string[]
    +visitDirectory(dir) void
    -checkFile(file) void
  }

  IVisitor <|.. BaseExportVisitor
  IVisitor <|.. ExtensionSearchVisitor
  BaseExportVisitor <|-- XmlExportVisitor
  BaseExportVisitor <|-- JsonExportVisitor
  BaseExportVisitor <|-- MarkdownExportVisitor
`;

  readonly commandDiagram = `
classDiagram
  class ICommand {
    <<interface>>
    +execute() void
    +undo() void
    +description: string
  }
  class CommandHistory {
    <<Invoker>>
    -undoStack: Signal~ICommand[]~
    -redoStack: Signal~ICommand[]~
    +executeCommand(cmd) void
    +undo() ICommand
    +redo() ICommand
    +getLastSortState() SortState
    +canUndo: Signal~boolean~
    +canRedo: Signal~boolean~
  }
  class SortCommand {
    -root: Directory
    -strategy: ISortStrategy
    -previousOrders: Map
    +sortType: SortType
    +ascending: boolean
    +execute() void
    +undo() void
  }
  class DeleteCommand {
    -node: FileSystemNode
    -parent: Directory
    -removedIndex: number
    +execute() void
    +undo() void
  }
  class TagCommand {
    -node: FileSystemNode
    -tag: TagType
    -action: TagAction
    -mediator: TagMediator
    +execute() void
    +undo() void
  }
  class RestoreSortCommand {
    -root: Directory
    -originalOrders: Map
    -sortedOrders: Map
    +execute() void
    +undo() void
  }
  class CopyCommand {
    -node: FileSystemNode
    -previousContent: FileSystemNode
    +execute() void
    +undo() void
  }
  class PasteCommand {
    -targetDir: Directory
    -pastedNode: FileSystemNode
    +execute() void
    +undo() void
  }
  class Clipboard {
    <<Singleton>>
    -instance$: Clipboard
    -content: FileSystemNode
    +getInstance()$ Clipboard
    +copy(node) string
    +paste() FileSystemNode
    +hasContent() boolean
    +clear() void
  }

  ICommand <|.. SortCommand
  ICommand <|.. DeleteCommand
  ICommand <|.. TagCommand
  ICommand <|.. RestoreSortCommand
  ICommand <|.. CopyCommand
  ICommand <|.. PasteCommand
  CommandHistory --> ICommand : executes
  SortCommand --> ISortStrategy : uses
  CopyCommand --> Clipboard : uses
  PasteCommand --> Clipboard : uses
  TagCommand --> TagMediator : uses
`;

  readonly strategyDiagram = `
classDiagram
  class ISortStrategy {
    <<interface>>
    +name: string
    +sort(nodes) FileSystemNode[]
  }
  class SortByNameStrategy {
    -ascending: boolean
    +name: string
    +sort(nodes) FileSystemNode[]
  }
  class SortBySizeStrategy {
    -ascending: boolean
    +name: string
    +sort(nodes) FileSystemNode[]
  }
  class SortByExtensionStrategy {
    -ascending: boolean
    +name: string
    +sort(nodes) FileSystemNode[]
  }
  class SortByTagStrategy {
    -ascending: boolean
    +name: string
    +sort(nodes) FileSystemNode[]
  }

  ISortStrategy <|.. SortByNameStrategy
  ISortStrategy <|.. SortBySizeStrategy
  ISortStrategy <|.. SortByExtensionStrategy
  ISortStrategy <|.. SortByTagStrategy
`;

  readonly observerDiagram = `
classDiagram
  class IObserver~T~ {
    <<interface>>
    +update(event: T) void
  }
  class ISubject~T~ {
    <<interface>>
    +attach(observer: IObserver~T~) void
    +detach(observer: IObserver~T~) void
    +notify(event: T) void
  }
  class SearchSubjectService {
    <<Subject>>
    -observers: Set~IObserver~
    -searchEvent$: Subject~SearchEvent~
    +events$: Observable~SearchEvent~
    +attach(observer) void
    +detach(observer) void
    +notify(event) void
  }
  class SearchEvent {
    +type: SearchEventType
    +node: FileSystemNode
    +message: string
  }
  class ConsoleObserver {
    <<Observer + Decorator>>
    -logs: string[]
    +update(event) void
    +getLogs() string[]
    +getOutput() string
    +clear() void
  }
  class SearchEventAdapter {
    <<Observer + Adapter>>
    -visited: number
    -matched: number
    -complete: boolean
    +update(event) void
    +getProgress() number
    +getVisitedCount() number
    +getMatchedCount() number
    +isSearchComplete() boolean
    +getSummary() string
  }
  class DemoComponent {
    <<Angular Observer>>
    -onSearchEvent(event) void
    subscribe → 即時更新 UI 高亮
  }

  ISubject~T~ <|.. SearchSubjectService : implements
  IObserver~T~ <|.. ConsoleObserver : implements
  IObserver~T~ <|.. SearchEventAdapter : implements
  SearchSubjectService --> SearchEvent : emits
  SearchSubjectService --> IObserver~T~ : notifies
  DemoComponent --> SearchSubjectService : subscribes(RxJS)
  ConsoleObserver ..> decorateLogEntry : 使用 Decorator 工廠
  SearchEventAdapter ..|> IDashboardDisplay : implements
`;

  readonly decoratorDiagram = `
classDiagram
  class ILogEntry {
    <<interface>>
    +render() string
  }
  class PlainLogEntry {
    <<ConcreteComponent>>
    -message: string
    +render() string
    -escapeHtml(text) string
  }
  class LogDecorator {
    <<abstract Decorator>>
    #wrapped: ILogEntry
    +render()* string
  }
  class IconDecorator {
    <<ConcreteDecorator>>
    -icon: string
    +render() string
  }
  class ColorDecorator {
    <<ConcreteDecorator>>
    -colorClass: string
    +render() string
  }
  class BoldDecorator {
    <<ConcreteDecorator>>
    +render() string
  }
  class decorateLogEntry {
    <<Factory Function>>
    +decorateLogEntry(message, category?) ILogEntry
    +detectLogCategory(message) LogCategory
  }

  ILogEntry <|.. PlainLogEntry
  ILogEntry <|.. LogDecorator
  LogDecorator <|-- IconDecorator
  LogDecorator <|-- ColorDecorator
  LogDecorator <|-- BoldDecorator
  LogDecorator o-- ILogEntry : wrapped
  decorateLogEntry ..> PlainLogEntry : creates
  decorateLogEntry ..> IconDecorator : creates
  decorateLogEntry ..> ColorDecorator : creates
  decorateLogEntry ..> BoldDecorator : creates
`;

  readonly adapterDiagram = `
classDiagram
  class IDashboardDisplay {
    <<Target Interface>>
    +getProgress() number
    +getVisitedCount() number
    +getMatchedCount() number
    +isSearchComplete() boolean
    +getCurrentNodeName() string
    +getSummary() string
  }
  class IObserver~T~ {
    <<Adaptee Interface>>
    +update(event: T) void
  }
  class SearchEventAdapter {
    <<Adapter>>
    -visited: number
    -matched: number
    -complete: boolean
    -expectedTotal: number
    +update(event) void
    +getProgress() number
    +getVisitedCount() number
    +getMatchedCount() number
    +isSearchComplete() boolean
    +getCurrentNodeName() string
    +getSummary() string
    +setExpectedTotal(total) void
    +reset() void
  }
  class DashboardPanelComponent {
    <<Client>>
    +adapter: IDashboardDisplay
  }
  class SearchSubjectService {
    <<Subject>>
    +notify(event) void
  }

  IDashboardDisplay <|.. SearchEventAdapter : implements
  IObserver~T~ <|.. SearchEventAdapter : implements
  DashboardPanelComponent --> IDashboardDisplay : 依賴目標介面
  SearchSubjectService --> SearchEventAdapter : notify(SearchEvent)
`;

  readonly singletonDiagram = `
classDiagram
  class Clipboard {
    <<Singleton>>
    -instance$: Clipboard
    -content: FileSystemNode
    -sourceName: string
    -constructor()
    +getInstance()$ Clipboard
    +copy(node) string
    +paste() FileSystemNode
    +hasContent() boolean
    +getSourceName() string
    +clear() void
    +resetInstance()$ void
  }
  class CopyCommand {
    <<uses Singleton>>
    -node: FileSystemNode
    +execute() void
    +undo() void
  }
  class PasteCommand {
    <<uses Singleton>>
    -targetDir: Directory
    +execute() void
    +undo() void
  }
  class FileManagerFacade {
    <<Client>>
    +copyNode(node) string
    +pasteNode(dir) string
    +getClipboard() Clipboard
  }

  Clipboard ..> Clipboard : getInstance()
  CopyCommand --> Clipboard : 存入剪貼簿
  PasteCommand --> Clipboard : 取出剪貼簿
  FileManagerFacade --> Clipboard : 查詢 hasContent()
  FileManagerFacade --> CopyCommand : creates
  FileManagerFacade --> PasteCommand : creates
  note for Clipboard "private constructor\\n確保全域唯一實例"
`;

  /** Flyweight Pattern — 標籤享元 */
  readonly flyweightDiagram = `
classDiagram
  class Label {
    <<Flyweight>>
    +type: TagType
    +displayName: string
    +color: string
    +icon: string
  }
  class LabelFactory {
    <<Flyweight Factory>>
    -pool$: Map~TagType Label~
    +getLabel(type)$ Label
    +getAllLabels()$ Label[]
    +getPoolSize()$ number
    +resetPool()$ void
    -createLabel(type)$ Label
  }
  class TagMediator {
    <<Client>>
    +getLabelsForNode(node) Label[]
  }
  class ToolbarComponent {
    <<Client>>
    +allLabels: Label[]
  }

  LabelFactory --> Label : creates / caches
  LabelFactory ..> LabelFactory : pool (Map)
  TagMediator --> LabelFactory : getLabel()
  ToolbarComponent --> LabelFactory : getAllLabels()
  note for LabelFactory "同一 TagType 永遠回傳\\n相同 Label 實例（唯一性）"
`;

  /** Mediator Pattern — 標籤中介者 */
  readonly mediatorDiagram = `
classDiagram
  class TagMediator {
    <<Mediator>>
    -nodeToLabels: Map~id Set~TagType~~
    -labelToNodeIds: Map~TagType Set~id~~
    -nodeRegistry: Map~id FileSystemNode~
    +addTag(node, type) void
    +removeTag(node, type) void
    +hasTag(node, type) boolean
    +getLabelsForNode(node) Label[]
    +getNodesByLabel(type) FileSystemNode[]
    +getTagCounts() Record
    +registerNode(node) void
    +unregisterNode(node) void
    +syncFromTree(root) void
  }
  class TagCommand {
    <<Command / Colleague>>
    -mediator: TagMediator
    +execute() void
    +undo() void
  }
  class FileManagerFacade {
    <<Client>>
    -tagMediator: TagMediator
    +toggleTag(node, tag) string
    +getTagMediator() TagMediator
    +syncTagMediator(root) void
  }
  class FileSystemNode {
    <<Colleague>>
    +tags: Set~TagType~
  }
  class Label {
    <<Flyweight>>
  }

  TagMediator --> FileSystemNode : 管理多對多
  TagMediator --> Label : 回傳 Flyweight
  TagCommand --> TagMediator : addTag / removeTag
  FileManagerFacade --> TagMediator : holds
  FileManagerFacade --> TagCommand : creates
  note for TagMediator "正向索引：node → labels\\n反向索引：label → nodes\\n集中管理多對多關係"
`;

  /** ER Diagram — 資料庫 Table Schema */
  readonly erDiagram = `
erDiagram
  DIRECTORY {
    int id PK
    string name
    int parent_id FK "NULL 表示根目錄"
  }

  WORD_FILE {
    int id PK
    string name
    float size_kb
    datetime created_at
    int pages
    int directory_id FK
  }

  IMAGE_FILE {
    int id PK
    string name
    float size_kb
    datetime created_at
    int width
    int height
    int directory_id FK
  }

  TEXT_FILE {
    int id PK
    string name
    float size_kb
    datetime created_at
    string encoding
    int directory_id FK
  }

  DIRECTORY ||--o{ DIRECTORY : "子目錄"
  DIRECTORY ||--o{ WORD_FILE : "包含"
  DIRECTORY ||--o{ IMAGE_FILE : "包含"
  DIRECTORY ||--o{ TEXT_FILE : "包含"
`;
}
