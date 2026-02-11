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
    +name: string
    +highlightState: HighlightState
    +tags: Set~TagType~
    +accept(visitor: IVisitor) void
    +getSizeKB() number
    +getIcon() string
    +getTypeLabel() string
    +getDetails() string
    +getTagsArray() TagType[]
  }
  class FileNode {
    <<abstract>>
    +sizeKB: number
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
  class XmlExportVisitor {
    -xml: string
    -indentLevel: number
    +getResult() string
    +visitDirectory(dir) void
    +visitWordFile(file) void
  }
  class ExtensionSearchVisitor {
    -results: string[]
    -targetExtension: string
    -subject: SearchSubjectService
    +getResults() string[]
    +visitDirectory(dir) void
    -checkFile(file) void
  }

  IVisitor <|.. XmlExportVisitor
  IVisitor <|.. ExtensionSearchVisitor
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
    +canUndo: Signal~boolean~
    +canRedo: Signal~boolean~
  }
  class SortCommand {
    -root: Directory
    -strategy: ISortStrategy
    -previousOrders: Map
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
    +execute() void
    +undo() void
  }

  ICommand <|.. SortCommand
  ICommand <|.. DeleteCommand
  ICommand <|.. TagCommand
  CommandHistory --> ICommand : executes
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
    +sort(nodes) FileSystemNode[]
  }
  class SortBySizeStrategy {
    -ascending: boolean
    +sort(nodes) FileSystemNode[]
  }
  class SortByExtensionStrategy {
    -ascending: boolean
    +sort(nodes) FileSystemNode[]
  }
  class SortByTagStrategy {
    -ascending: boolean
    +sort(nodes) FileSystemNode[]
  }

  ISortStrategy <|.. SortByNameStrategy
  ISortStrategy <|.. SortBySizeStrategy
  ISortStrategy <|.. SortByExtensionStrategy
  ISortStrategy <|.. SortByTagStrategy
`;

  readonly observerDiagram = `
classDiagram
  class SearchSubjectService {
    <<Subject>>
    -searchEvent$: Subject~SearchEvent~
    +events$: Observable~SearchEvent~
    +notify(event) void
  }
  class SearchEvent {
    +type: SearchEventType
    +node: FileSystemNode
    +message: string
  }
  class AppComponent {
    <<Observer>>
    -onSearchEvent(event) void
    subscribe → 即時更新 UI
  }

  SearchSubjectService --> SearchEvent : emits
  AppComponent --> SearchSubjectService : subscribes
`;
}
