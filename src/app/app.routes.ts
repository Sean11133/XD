import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'use-case',
    loadComponent: () => import('./pages/use-case/use-case').then((m) => m.UseCaseComponent),
  },
  {
    path: 'class-diagram',
    loadComponent: () =>
      import('./pages/class-diagram/class-diagram').then((m) => m.ClassDiagramComponent),
  },
  {
    path: 'collaboration',
    loadComponent: () =>
      import('./pages/collaboration/collaboration').then((m) => m.CollaborationComponent),
  },
  {
    path: 'sequence',
    loadComponent: () => import('./pages/sequence/sequence').then((m) => m.SequenceComponent),
  },
  {
    path: 'architecture',
    loadComponent: () =>
      import('./pages/architecture/architecture').then((m) => m.ArchitectureComponent),
  },
  {
    path: 'demo',
    loadComponent: () => import('./pages/demo/demo').then((m) => m.DemoComponent),
  },
  { path: '**', redirectTo: '' },
];
