import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth';
import {
  LoginType,
  LoginV1Request,
  LoginV2Request,
  LoginV3Request,
} from '../shared/interfaces/login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <h2>Multi-Login System</h2>

      <!-- Login Type Selector -->
      <div class="login-type-selector">
        @for (type of loginTypes; track type) {
        <button [class.active]="selectedLoginType() === type" (click)="selectLoginType(type)">
          {{ getLoginTypeLabel(type) }}
        </button>
        }
      </div>

      <!-- Login Forms -->
      <div class="login-forms">
        <!-- Document Login (v1) -->
        @if (selectedLoginType() === 'document') {
        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <h3>Login with Document</h3>
          <div class="form-group">
            <input
              type="text"
              [(ngModel)]="documentNumber"
              name="document"
              placeholder="Document Number"
              required
            />
          </div>
          <div class="form-group">
            <input
              type="password"
              [(ngModel)]="documentPassword"
              name="password"
              placeholder="Password"
              required
            />
          </div>
          <button type="submit" [disabled]="!loginForm.form.valid || loading()">
            {{ loading() ? 'Logging in...' : 'Login' }}
          </button>
        </form>
        }

        <!-- Email Login (v2) -->
        @if (selectedLoginType() === 'email') {
        <form (ngSubmit)="onLogin()" #emailForm="ngForm">
          <h3>Login with Email</h3>
          <div class="form-group">
            <input
              type="email"
              [(ngModel)]="emailAddress"
              name="email"
              placeholder="Email"
              required
            />
          </div>
          <div class="form-group">
            <input
              type="password"
              [(ngModel)]="emailPassword"
              name="password"
              placeholder="Password"
              required
            />
          </div>
          <button type="submit" [disabled]="!emailForm.form.valid || loading()">
            {{ loading() ? 'Logging in...' : 'Login' }}
          </button>
        </form>
        }

        <!-- OTP Login (v3) -->
        @if (selectedLoginType() === 'otp') {
        <div>
          <h3>Login with OTP</h3>

          <!-- Send OTP -->
          @if (!otpSent()) {
          <form (ngSubmit)="sendOtp()" #otpRequestForm="ngForm">
            <div class="form-group">
              <input
                type="email"
                [(ngModel)]="otpEmailAddress"
                name="otpEmail"
                placeholder="Email for OTP"
                required
              />
            </div>
            <button type="submit" [disabled]="!otpRequestForm.form.valid || loading()">
              {{ loading() ? 'Sending OTP...' : 'Send OTP' }}
            </button>
          </form>
          }

          <!-- Enter OTP -->
          @if (otpSent()) {
          <form (ngSubmit)="onLogin()" #otpForm="ngForm">
            <div class="form-group">
              <input
                type="text"
                [(ngModel)]="otpCode"
                name="otp"
                placeholder="Enter OTP"
                required
              />
            </div>
            <button type="submit" [disabled]="!otpForm.form.valid || loading()">
              {{ loading() ? 'Verifying...' : 'Verify OTP' }}
            </button>
            <button type="button" (click)="resetOtp()">Send New OTP</button>
          </form>
          }
        </div>
        }
      </div>

      <!-- Messages -->
      <div class="messages">
        @if (errorMessage()) {
        <div class="error">{{ errorMessage() }}</div>
        } @if (successMessage()) {
        <div class="success">{{ successMessage() }}</div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        max-width: 400px;
        margin: 50px auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
      }

      .login-type-selector {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
      }

      .login-type-selector button {
        flex: 1;
        padding: 10px;
        border: 1px solid #ccc;
        background: #f5f5f5;
        cursor: pointer;
        border-radius: 4px;
      }

      .login-type-selector button.active {
        background: #007bff;
        color: white;
      }

      .form-group {
        margin-bottom: 15px;
      }

      .form-group input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
      }

      button[type='submit'] {
        width: 100%;
        padding: 12px;
        background: #28a745;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-bottom: 10px;
      }

      button[type='submit']:disabled {
        background: #ccc;
        cursor: not-allowed;
      }

      button[type='button'] {
        width: 100%;
        padding: 8px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .error {
        color: #dc3545;
        padding: 10px;
        background: #f8d7da;
        border-radius: 4px;
        margin-top: 10px;
      }

      .success {
        color: #155724;
        padding: 10px;
        background: #d4edda;
        border-radius: 4px;
        margin-top: 10px;
      }

      h2,
      h3 {
        text-align: center;
        color: #333;
      }
    `,
  ],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Signals for component state
  readonly loginTypes: LoginType[] = ['document', 'email', 'otp'];
  readonly selectedLoginType = signal<LoginType>('document');

  readonly documentCredentials = signal<LoginV1Request>({ document: '', password: '' });
  readonly emailCredentials = signal<LoginV2Request>({ email: '', password: '' });
  readonly otpCredentials = signal<LoginV3Request>({ otp: '' });

  // Getters and setters for ngModel compatibility
  get documentNumber(): string {
    return this.documentCredentials().document;
  }
  set documentNumber(value: string) {
    this.documentCredentials.update((creds) => ({ ...creds, document: value }));
  }

  get documentPassword(): string {
    return this.documentCredentials().password;
  }
  set documentPassword(value: string) {
    this.documentCredentials.update((creds) => ({ ...creds, password: value }));
  }

  get emailAddress(): string {
    return this.emailCredentials().email;
  }
  set emailAddress(value: string) {
    this.emailCredentials.update((creds) => ({ ...creds, email: value }));
  }

  get emailPassword(): string {
    return this.emailCredentials().password;
  }
  set emailPassword(value: string) {
    this.emailCredentials.update((creds) => ({ ...creds, password: value }));
  }

  get otpCode(): string {
    return this.otpCredentials().otp;
  }
  set otpCode(value: string) {
    this.otpCredentials.update((creds) => ({ ...creds, otp: value }));
  }

  get otpEmailAddress(): string {
    return this.otpEmail();
  }
  set otpEmailAddress(value: string) {
    this.otpEmail.set(value);
  }

  readonly otpEmail = signal<string>('');
  readonly otpSent = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly successMessage = signal<string>('');

  selectLoginType(type: LoginType) {
    this.selectedLoginType.set(type);
    this.clearMessages();
    this.resetForms();
  }

  getLoginTypeLabel(type: LoginType): string {
    switch (type) {
      case 'document':
        return 'Document';
      case 'email':
        return 'Email';
      case 'otp':
        return 'OTP';
      default:
        return type;
    }
  }

  onLogin() {
    this.loading.set(true);
    this.clearMessages();

    let credentials: LoginV1Request | LoginV2Request | LoginV3Request;

    switch (this.selectedLoginType()) {
      case 'document':
        credentials = this.documentCredentials();
        break;
      case 'email':
        credentials = this.emailCredentials();
        break;
      case 'otp':
        credentials = this.otpCredentials();
        break;
      default:
        this.errorMessage.set('Invalid login type');
        this.loading.set(false);
        return;
    }

    this.authService.login(credentials, this.selectedLoginType()).subscribe({
      next: (response) => {
        this.successMessage.set(response.message || 'Login successful!');
        this.loading.set(false);
        // Navigate to dashboard after successful login
        console.log('Login successful:', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Login failed. Please try again.');
        this.loading.set(false);
        console.error('Login error:', error);
      },
    });
  }

  sendOtp() {
    if (!this.otpEmail()) {
      this.errorMessage.set('Please enter an email address');
      return;
    }

    this.loading.set(true);
    this.clearMessages();

    this.authService.sendOtpEmail(this.otpEmail()).subscribe({
      next: (response) => {
        this.otpSent.set(true);
        this.successMessage.set('OTP sent to your email!');
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Failed to send OTP. Please try again.');
        this.loading.set(false);
        console.error('OTP send error:', error);
      },
    });
  }

  resetOtp() {
    this.otpSent.set(false);
    this.otpCredentials.update((creds) => ({ ...creds, otp: '' }));
    this.clearMessages();
  }

  private clearMessages() {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  private resetForms() {
    this.documentCredentials.set({ document: '', password: '' });
    this.emailCredentials.set({ email: '', password: '' });
    this.otpCredentials.set({ otp: '' });
    this.otpEmail.set('');
    this.otpSent.set(false);
  }
}
