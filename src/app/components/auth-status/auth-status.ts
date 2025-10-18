import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@shared/services/auth';
import { ErrorResponse, ValidateResponse } from '@shared/interfaces/login';

@Component({
  selector: 'app-auth-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-status.html',
  styleUrls: ['./auth-status.css'],
})
export class AuthStatus {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Computed signals from AuthService
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly hasValidToken = this.authService.hasValidToken;
  readonly token = this.authService.token;

  // Local component signals
  readonly validationMessage = signal<string>('');

  // Computed signal for displaying token
  readonly displayToken = computed(() => {
    const token = this.token();
    return token ? `${token.substring(0, 20)}...` : 'None';
  });

  logout() {
    this.authService.logout();
    this.validationMessage.set('Logged out successfully');
    this.router.navigate(['/login']);
  }

  validateToken() {
    this.authService.validateTokenV2().subscribe({
      next: (response: ValidateResponse) => {
        console.log('Validation response:', response);
        this.validationMessage.set(response.valid ? 'Token es Valido' : 'Token es invalido');
      },
      error: (error: ErrorResponse) => {
        this.validationMessage.set('Token validation failed: ' + error.error?.message);
        console.error('Validation error:', error.error);
      },
    });
  }

  procesoRestringidoV1() {
    this.authService.procesoRestrigidoV1().subscribe({
      next: (response) => {
        console.log('Restricted process V1 response:', response);
        this.validationMessage.set('Proceso restringido V1 ejecutado correctamente');
      },
      error: (error: ErrorResponse) => {
        this.validationMessage.set(`Restricted process V1: ${error.error?.message}`);
        console.error('Restricted process V1 error:', error.error);
      },
    });
  }

  procesoRestringidoV2() {
    this.authService.procesoRestrigidoV2().subscribe({
      next: (response) => {
        console.log('Restricted process V2 response:', response);
        this.validationMessage.set('Proceso restringido V2 ejecutado correctamente');
      },
      error: (error: ErrorResponse) => {
        this.validationMessage.set(`Restricted process V2: ${error.error?.message}`);
        console.error('Restricted process V2 error:', error.error);
      },
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToProcesses() {
    this.router.navigate(['/processes']);
  }
}
