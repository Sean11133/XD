import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MermaidDiagramComponent } from '../../shared/mermaid-diagram';

@Component({
  selector: 'app-collaboration',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MermaidDiagramComponent],
  templateUrl: './collaboration.html',
  styleUrl: './collaboration.scss',
})
export class CollaborationComponent {
  readonly searchDiagram = `
graph LR
  app["app : AppComponent"]
  fsService["fsService : FileSystemService"]
  visitor["visitor : ExtensionSearchVisitor"]
  subject["subject : SearchSubjectService"]
  root["root : Directory"]
  file["file : WordFile"]

  app -->|"1: searchByExtension(root, ext)"| fsService
  fsService -->|"2: &lt;&lt;create&gt;&gt;"| visitor
  fsService -->|"3: root.accept(visitor)"| root
  root -->|"4: visitor.visitDirectory(this)"| visitor
  visitor -->|"5: subject.notify(visiting)"| subject
  root -->|"6: child.accept(visitor)"| file
  file -->|"7: visitor.visitWordFile(this)"| visitor
  visitor -->|"8: subject.notify(matched)"| subject
  subject -.->|"9: onSearchEvent [Observer 回調]"| app
`;

  readonly sortDiagram = `
graph LR
  app["app : AppComponent"]
  cmd["cmd : SortCommand"]
  history["history : CommandHistory"]
  strategy["strategy : SortByNameStrategy"]
  root["root : Directory"]

  app -->|"1: &lt;&lt;create&gt;&gt;"| cmd
  app -->|"2: history.executeCommand(cmd)"| history
  history -->|"3: cmd.execute()"| cmd
  cmd -->|"4: strategy.sort(children)"| strategy
  cmd -->|"5: dir.children = sorted"| root
`;
}
