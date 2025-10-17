import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth';

@Component({
  selector: 'app-auth-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-status">
      <h3>Authentication Status</h3>
      <div class="status-info">
        <p><strong>Authenticated:</strong> {{ isAuthenticated() ? 'Yes' : 'No' }}</p>
        <p><strong>Has Token:</strong> {{ hasValidToken() ? 'Yes' : 'No' }}</p>
        <p><strong>Token:</strong> {{ displayToken() }}</p>
      </div>

      <div class="actions">
        @if (!isAuthenticated()) {
        <button (click)="navigateToLogin()">Go to Login</button>
        } @if (isAuthenticated()) {
        <button (click)="logout()">Logout</button>
        <button (click)="validateToken()">Validate Token</button>
        }
      </div>

      @if (validationMessage()) {
      <div class="validation-result">
        {{ validationMessage() }}
      </div>
      }
    </div>
  `,
  styles: [
    `
      .auth-status {
        max-width: 500px;
        margin: 20px auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #f9f9f9;
      }

      .status-info p {
        margin: 8px 0;
      }

      .actions {
        margin-top: 20px;
        display: flex;
        gap: 10px;
      }

      .actions button {
        padding: 10px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }

      .actions button:first-child {
        background: #007bff;
        color: white;
      }

      .actions button:nth-child(2) {
        background: #dc3545;
        color: white;
      }

      .actions button:last-child {
        background: #28a745;
        color: white;
      }

      .validation-result {
        margin-top: 15px;
        padding: 10px;
        border-radius: 4px;
        background: #e7f3ff;
        border: 1px solid #b3d9ff;
      }
    `,
  ],
})
export class AuthStatusComponent {
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
      next: (response) => {
        this.validationMessage.set(response.valid ? 'Token is valid' : 'Token is invalid');
      },
      error: (error) => {
        this.validationMessage.set('Token validation failed');
        console.error('Validation error:', error);
      },
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
