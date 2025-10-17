import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  LoginRequest,
  LoginV1Request,
  LoginV2Request,
  LoginV3Request,
  LoginResponse,
  ValidateResponse,
  LoginType,
} from '../interfaces/login';
import { ApiConstants } from '@shared/constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly http = inject(HttpClient);

  // Computed signal for token
  private readonly _token = signal<string | null>(this.getStoredToken());

  // Computed signal to check if user has valid token
  public readonly hasValidToken = computed(() => !!this._token());

  // Signal for authentication state (initialized after token signals)
  private readonly _isAuthenticated = signal<boolean>(!!this.getStoredToken());

  // Public readonly signals
  public readonly isAuthenticated = this._isAuthenticated.asReadonly();
  public readonly token = this._token.asReadonly();
  /**
   * Login with document and password (v1)
   */
  loginV1(credentials: LoginV1Request): Observable<LoginResponse> {
    console.log('Attempting login with credentials:', credentials);
    return this.http
      .post<LoginResponse>(`${ApiConstants.BASE_URL}${ApiConstants.LOGIN_V1}`, credentials)
      .pipe(tap((response) => this.handleLoginSuccess(response)));
  }

  /**
   * Login with email and password (v2)
   */
  loginV2(credentials: LoginV2Request): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${ApiConstants.BASE_URL}${ApiConstants.LOGIN_V2}`, credentials)
      .pipe(tap((response) => this.handleLoginSuccess(response)));
  }

  /**
   * Login with OTP (v3)
   */
  loginV3(credentials: LoginV3Request): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${ApiConstants.BASE_URL}${ApiConstants.LOGIN_V3}`, credentials)
      .pipe(tap((response) => this.handleLoginSuccess(response)));
  }

  /**
   * Generic login method that routes to appropriate version
   */
  login(credentials: LoginRequest, loginType: LoginType): Observable<LoginResponse> {
    switch (loginType) {
      case 'document':
        return this.loginV1(credentials as LoginV1Request);
      case 'email':
        return this.loginV2(credentials as LoginV2Request);
      case 'otp':
        return this.loginV3(credentials as LoginV3Request);
      default:
        throw new Error('Invalid login type');
    }
  }

  /**
   * Validate token (v1) - sends token in body
   */
  validateTokenV1(): Observable<ValidateResponse> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token available');
    }
    return this.http.post<ValidateResponse>(`${ApiConstants.BASE_URL}${ApiConstants.VALIDATE_V1}`, {
      token,
    });
  }

  /**
   * Validate token (v2) - sends token in Authorization header
   */
  validateTokenV2(): Observable<ValidateResponse> {
    return this.http.post<ValidateResponse>(`${ApiConstants.BASE_URL}${ApiConstants.LOGIN_V2}`, {});
  }

  /**
   * Send OTP via email
   */
  sendOtpEmail(email: string): Observable<any> {
    return this.http.post(`${ApiConstants.BASE_URL}${ApiConstants.SEND_OTP}`, {
      channel: 'email',
      email: email,
    });
  }

  /**
   * Get auth info for different versions
   */
  getAuthInfoV1(): Observable<any> {
    return this.http.get(`${ApiConstants.BASE_URL}${ApiConstants.LOGIN_V1}`);
  }

  getAuthInfoV2(): Observable<any> {
    return this.http.get(`${ApiConstants.BASE_URL}${ApiConstants.LOGIN_V2}`);
  }

  getAuthInfoV3(): Observable<any> {
    return this.http.get(`${ApiConstants.BASE_URL}${ApiConstants.LOGIN_V3}`);
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this._token.set(null);
    this._isAuthenticated.set(false);
  }

  /**
   * Get stored token from localStorage
   */
  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get current token value
   */
  getToken(): string | null {
    return this._token();
  }

  /**
   * Check if user has a token
   */
  hasToken(): boolean {
    return !!this._token();
  }

  /**
   * Handle successful login response
   */
  private handleLoginSuccess(response: LoginResponse): void {
    console.log('Login successful, response:', response);
    if (response.access_token) {
      localStorage.setItem(this.TOKEN_KEY, response.access_token);
      this._token.set(response.access_token);
      this._isAuthenticated.set(true);
    }
  }

  /**
   * Get authorization header for HTTP requests
   */
  getAuthHeaders(): { [key: string]: string } {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
