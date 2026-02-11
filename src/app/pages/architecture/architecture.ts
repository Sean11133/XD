import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MermaidDiagramComponent } from '../../shared/mermaid-diagram';

@Component({
  selector: 'app-architecture',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MermaidDiagramComponent],
  templateUrl: './architecture.html',
  styleUrl: './architecture.scss',
})
export class ArchitectureComponent {
  readonly architectureDiagram = `
graph TB
  subgraph Client["📱 Client Layer — Browser"]
    Browser["🌐 Web Browser\nChrome / Edge / Safari"]
    DOM["📊 DOM / View\nAngular Template"]
    SCSS["🎨 SCSS Styles\nDark Theme UI"]
    Vitest["🧪 Vitest\nUnit Testing"]
  end

  subgraph App["⚙️ Application Layer — Angular SPA"]
    direction TB
    Router["🛤️ Angular Router\nLazy Loading（7 頁）"]

    subgraph Pages["📄 pages/ + shared/"]
      Views["🖥️ View Components\nHome / UseCase / ClassDiagram\nCollaboration / Sequence\nArchitecture / Demo"]
      Mermaid["📊 MermaidDiagram\n共享元件"]
    end

    subgraph SvcLayer["⚙️ services/（依 GoF 三大分類）"]
      SvcCreational["🏗️ creational/\n（預留）"]
      SvcStructural["🧱 structural/\nFileSystemService"]
      SvcBehavioral["🎭 behavioral/\nCommandHistory\nSearchSubjectService"]
    end

    subgraph ModelLayer["📐 models/（依 GoF 三大分類）"]
      MdlCreational["🏗️ creational/\n（預留）"]
      MdlStructural["🧱 structural/\nFileSystemNode · Directory\nWordFile · ImageFile · TextFile\nTagType"]
      MdlBehavioral["🎭 behavioral/\nICommand · Sort/Delete/TagCommand\nISortStrategy · SortByName...\nIVisitor · XmlExport/SearchVisitor\nSearchEvent"]
    end
  end

  subgraph Backend["☁️ Backend / Infrastructure — Future"]
    API["🌐 REST API\nNode.js / .NET"]
    DB["🗃️ Database\nSQL / NoSQL"]
    Storage["📁 File Storage\nS3 / Azure Blob"]
    Auth["🔐 Auth Service\nOAuth / JWT"]
  end

  Browser --> Router
  Router --> Views
  Views --> SvcStructural
  Views --> SvcBehavioral
  SvcStructural --> MdlStructural
  SvcStructural --> MdlBehavioral
  SvcBehavioral --> MdlBehavioral
  SvcStructural -.-> API
  MdlStructural -.-> DB
`;
}
