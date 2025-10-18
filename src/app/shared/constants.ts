export class ApiConstants {
  // Base URLs
  static readonly BASE_URL = 'http://localhost:3000';

  // Auth endpoints
  static readonly LOGIN_V1 = '/v1/api/auth/login';
  static readonly LOGIN_V2 = '/v2/api/auth/login';
  static readonly LOGIN_V3 = '/v3/api/auth/login';

  static readonly VALIDATE_V1 = '/v1/api/auth/validate';
  static readonly VALIDATE_V2 = '/v2/api/auth/validate';

  static readonly SEND_OTP = '/v3/api/auth/otp-email';

  // User endpoints
  static readonly USER_CREATE = '/api/user/create';
  static readonly USER_GET = '/api/user/get';

  // Notifications endpoints
  static readonly NOTIFICATIONS_LIST = '/api/notifications/list';
  static readonly NOTIFICATIONS_SEND = '/api/notifications/send';

  // Process endpoints
  static readonly PROCESS_RESTRICTED_V1 = '/v1/api/process/restricted';
  static readonly PROCESS_RESTRICTED_V2 = '/v2/api/process/restricted';
}
