import { Routes } from '@angular/router';
import { Login } from '@components/login/login';
import { AuthStatus } from '@components/auth-status/auth-status';
import { authGuard } from '@shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
    title: 'Login - Multi-SSO',
  },
  {
    path: 'dashboard',
    component: AuthStatus,
    canActivate: [authGuard],
    title: 'Dashboard - Multi-SSO',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
