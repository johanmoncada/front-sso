import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@shared/services/auth';
import {
  LoginType,
  LoginV1Request,
  LoginV2Request,
  LoginV3Request,
} from '@shared/interfaces/login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
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
