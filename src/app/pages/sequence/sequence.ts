import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MermaidDiagramComponent } from '../../shared/mermaid-diagram';

@Component({
  selector: 'app-sequence',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MermaidDiagramComponent],
  templateUrl: './sequence.html',
  styleUrl: './sequence.scss',
})
export class SequenceComponent {
  readonly searchSequence = `
sequenceDiagram
  participant App as :AppComponent
  participant FS as :FileSystemService
  participant V as :ExtSearchVisitor
  participant Dir as :Directory
  participant Sub as :SearchSubject

  App->>FS: 1: searchByExtension(root, ".docx")
  FS->>V: 2: <<create>> new(ext, subject)
  FS->>Dir: 3: root.accept(visitor)
  Dir->>V: 4: visitDirectory(this)
  V->>Sub: 5: notify({type:'visiting', node:dir})
  loop each child
    Dir->>Dir: 6: child.accept(visitor)
  end
  V->>Sub: 7: notify({type:'visiting', node:file})
  V->>Sub: 8: notify({type:'matched', node:file}) ✅
  FS->>Sub: 9: notify({type:'complete'})
  Sub-->>App: 10: [Observer] onSearchEvent — 更新 UI
  FS-->>App: return results[]
`;

  readonly sortUndoSequence = `
sequenceDiagram
  participant App as :AppComponent
  participant Cmd as :SortCommand
  participant Hist as :CommandHistory
  participant Strat as :SortByNameStrategy

  rect rgba(30, 80, 50, 0.3)
    Note over App,Strat: ▶ Execute Phase
    App->>Cmd: 1: new SortCommand(root, strategy)
    App->>Hist: 2: executeCommand(cmd)
    Hist->>Cmd: 3: cmd.execute()
    Cmd->>Strat: 4: strategy.sort(children)
    Strat-->>Cmd: return sortedNodes[]
  end

  rect rgba(80, 50, 20, 0.3)
    Note over App,Strat: ↩️ Undo Phase
    App->>Hist: 5: history.undo()
    Hist->>Cmd: 6: cmd.undo()
    Note over Cmd: 7: restore previousOrders
  end
`;
}
