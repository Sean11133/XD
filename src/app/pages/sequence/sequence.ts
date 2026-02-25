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
  participant Demo as :DemoComponent
  participant Facade as :FileManagerFacade
  participant FS as :FileSystemService
  participant V as :ExtSearchVisitor
  participant Dir as :Directory
  participant Sub as :SearchSubject

  Demo->>Facade: 1: searchByExtension(root, ".docx")
  Facade->>Facade: 1.1: viewState.resetTree(root)
  Facade->>FS: 2: searchByExtension(root, ext)
  FS->>V: 3: <<create>> new(ext, subject)
  FS->>Dir: 4: root.accept(visitor)
  Dir->>V: 5: visitDirectory(this)
  V->>Sub: 6: notify({type:'visiting', node:dir})
  loop each child
    Dir->>Dir: 7: child.accept(visitor)
  end
  V->>Sub: 8: notify({type:'visiting', node:file})
  V->>Sub: 9: notify({type:'matched', node:file}) ✅
  FS->>Sub: 10: notify({type:'complete'})
  Sub-->>Demo: 11: [Observer] onSearchEvent — 更新 UI
  FS-->>Facade: return results[]
  Facade-->>Demo: return results[]
`;

  readonly sortUndoSequence = `
sequenceDiagram
  participant Demo as :DemoComponent
  participant Facade as :FileManagerFacade
  participant Cmd as :SortCommand
  participant Hist as :CommandHistory
  participant Strat as :SortByNameStrategy

  rect rgba(30, 80, 50, 0.3)
    Note over Demo,Strat: ▶ Execute Phase
    Demo->>Facade: 1: sort(root, type, ascending)
    Facade->>Facade: 1.1: createStrategy(type, ascending)
    Facade->>Cmd: 2: <<create>> new SortCommand(root, strategy, type, asc)
    Facade->>Hist: 3: executeCommand(cmd)
    Hist->>Cmd: 4: cmd.execute()
    Cmd->>Strat: 5: strategy.sort(children)
    Strat-->>Cmd: return sortedNodes[]
    Facade-->>Demo: return description
  end

  rect rgba(80, 50, 20, 0.3)
    Note over Demo,Strat: ↩️ Undo Phase
    Demo->>Hist: 6: history.undo()
    Hist->>Cmd: 7: cmd.undo()
    Note over Cmd: 8: restore previousOrders
    Demo->>Hist: 9: getLastSortState()
    Note over Demo: 10: syncSortStateAfterUndoRedo()
  end
`;
}
