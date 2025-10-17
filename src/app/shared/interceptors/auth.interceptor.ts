import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth';

// Modern functional interceptor for Angular 20
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);

  // Routes that require authentication
  const protectedRoutes = [
    '/v2/api/auth/validate',
    '/api/user/',
    '/v1/api/process/restricted',
    '/v2/api/process/restricted',
  ];

  // Check if the request URL matches any protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => request.url.includes(route) || (route.endsWith('/') && request.url.startsWith(route))
  );

  if (isProtectedRoute && authService.hasToken()) {
    const authHeaders = authService.getAuthHeaders();
    const authRequest = request.clone({
      setHeaders: authHeaders,
    });
    return next(authRequest);
  }

  return next(request);
};
