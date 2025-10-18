export type LoginRequest = LoginV1Request | LoginV2Request | LoginV3Request;

export type LoginType = 'document' | 'email' | 'otp';

export interface LoginV1Request {
  document: string;
  password: string;
}

export interface LoginV2Request {
  email: string;
  password: string;
}

export interface LoginV3Request {
  otp: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  expires_in: string;
}

export interface ValidateResponse {
  valid?: boolean;
  message?: string;
  paiload?: Paiload;
}

export interface Paiload {
  sub: string;
  name: string;
  iat: number;
  exp: number;
}

export interface ErrorResponse {
  message?: string;
  statusCode?: number;
}

export interface Response {
  message?: string;
  version?: string;
}
