import { provideHttpClient } from '@angular/common/http';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register/register.component')
        .then(m => m.RegisterComponent),
        providers: [provideHttpClient()] // 👈 add this here

  },
  { path: '',   redirectTo: 'register', pathMatch: 'full' },
  { path: '**', redirectTo: 'register' }
];