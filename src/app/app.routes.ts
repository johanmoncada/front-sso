import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { AuthStatusComponent } from './components/auth-status.component';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login - Multi-SSO',
  },
  {
    path: 'dashboard',
    component: AuthStatusComponent,
    canActivate: [authGuard],
    title: 'Dashboard - Multi-SSO',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
