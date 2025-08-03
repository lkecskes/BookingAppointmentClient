import { provideHttpClient } from '@angular/common/http';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register/register.component').then(
        (m) => m.RegisterComponent
      ),
    providers: [provideHttpClient()],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login/login.component').then(
        (m) => m.LoginComponent
      ),
    providers: [provideHttpClient()],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
