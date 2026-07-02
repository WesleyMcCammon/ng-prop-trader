import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'news-alerts',
    loadComponent: () =>
      import('./features/news-alerts/news-alerts.component').then(m => m.NewsAlertsComponent)
  },
  {
    path: 'instruments',
    data: { showAll: false },
    loadComponent: () =>
      import('./features/instruments/instruments.component').then(m => m.InstrumentsComponent)
  },
  {
    path: 'indicators',
    loadComponent: () =>
      import('./features/indicators/indicators.component').then(m => m.IndicatorsComponent)
  },
  {
    path: 'market',
    loadComponent: () =>
      import('./features/market/market.component').then(m => m.MarketComponent)
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
