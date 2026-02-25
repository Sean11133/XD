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
  demo["demo : DemoComponent"]
  facade["facade : FileManagerFacade"]
  fsService["fsService : FileSystemService"]
  visitor["visitor : ExtensionSearchVisitor"]
  subject["subject : SearchSubjectService"]
  root["root : Directory"]
  file["file : WordFile"]

  demo -->|"1: searchByExtension(root, ext)"| facade
  facade -->|"1.1: viewState.resetTree(root)"| facade
  facade -->|"2: searchByExtension(root, ext)"| fsService
  fsService -->|"3: &lt;&lt;create&gt;&gt;"| visitor
  fsService -->|"4: root.accept(visitor)"| root
  root -->|"5: visitor.visitDirectory(this)"| visitor
  visitor -->|"6: subject.notify(visiting)"| subject
  root -->|"7: child.accept(visitor)"| file
  file -->|"8: visitor.visitWordFile(this)"| visitor
  visitor -->|"9: subject.notify(matched)"| subject
  subject -.->|"10: onSearchEvent [Observer 回調]"| demo
`;

  readonly sortDiagram = `
graph LR
  demo["demo : DemoComponent"]
  facade["facade : FileManagerFacade"]
  cmd["cmd : SortCommand"]
  history["history : CommandHistory"]
  strategy["strategy : SortByNameStrategy"]
  root["root : Directory"]

  demo -->|"1: sort(root, type, asc)"| facade
  facade -->|"1.1: createStrategy(type, asc)"| strategy
  facade -->|"2: &lt;&lt;create&gt;&gt;"| cmd
  facade -->|"3: history.executeCommand(cmd)"| history
  history -->|"4: cmd.execute()"| cmd
  cmd -->|"5: strategy.sort(children)"| strategy
  cmd -->|"6: dir.children = sorted"| root
`;
}
