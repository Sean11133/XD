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
    Components["📦 Components\nApp / Demo"]
    Services["🛠️ Services\nFileSystem / Search"]
    Models["📐 Models\nComposite Tree"]
    Commands["⌨️ Commands\nSort / Delete / Tag"]
    Strategies["🔀 Strategies\nSort By *"]
    Observers["👁️ Observers\nRxJS"]
    Visitors["🚶 Visitors"]
    Router["🛤️ Angular Router\nLazy Loading"]
  end

  subgraph Backend["☁️ Backend / Infrastructure — Future"]
    API["🌐 REST API\nNode.js / .NET"]
    DB["🗃️ Database\nSQL / NoSQL"]
    Storage["📁 File Storage\nS3 / Azure Blob"]
    Auth["🔐 Auth Service\nOAuth / JWT"]
  end

  Browser --> Components
  DOM --> Services
  Services -.-> API
  Models -.-> DB
`;
}
