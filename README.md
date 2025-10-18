# EDS Front SSO (Angular 20)

## Johan Moncada - Mauricio Rayo

Aplicación Angular para autenticación multi-login (documento, email y OTP) con señales (signals), guardas funcionales, interceptores y proxy a un backend Node/Nest en http://localhost:3000.

## Requisitos

- Node.js 18+
- Angular CLI 18/20+
- Backend EDS corriendo en http://localhost:3000

## Instalación

```bash
npm install
```

## Ejecutar en desarrollo (con proxy)

Asegúrate de tener el proxy configurado y el backend activo en el puerto 3000.

- Crear proxy.conf.json (si no existe) en la raíz del proyecto:

```json
{
  "/v1/api/*": { "target": "http://localhost:3000", "secure": false, "changeOrigin": true, "logLevel": "debug" },
  "/v2/api/*": { "target": "http://localhost:3000", "secure": false, "changeOrigin": true, "logLevel": "debug" },
  "/v3/api/*": { "target": "http://localhost:3000", "secure": false, "changeOrigin": true, "logLevel": "debug" },
  "/api/*":   { "target": "http://localhost:3000", "secure": false, "changeOrigin": true, "logLevel": "debug" }
}
```

## Servir la app

```bash
# Windows
ng serve --proxy-config proxy.conf.json
# o
npm start
```

## Estructura del proyecto

```bash
src/
  app/
    app.config.ts         # Providers globales (HttpClient + interceptores)
    app.routes.ts         # Rutas de la app
    app.ts, app.html      # Componente raíz
    components/
      login/              # UI de login multi-método
      auth-status/        # Estado de autenticación y validación de token
    shared/
      constants.ts        # Rutas de API centralizadas
      interfaces/login.ts # Tipos/Interfaces (peticiones y respuestas)
      services/auth.ts    # AuthService con signals y manejo de token
      interceptors/auth.interceptor.ts # Añade Authorization a peticiones protegidas
      guards/auth.guard.ts # Guarda funcional que redirige a /login
```

## Componentes

### LoginComponent (src/app/components/login)

- Formularios para login por:
  - v1: documento + contraseña
  - v2: email + contraseña
  - v3: OTP
- Usa el AuthService para realizar POST a:
  - /v1/api/auth/login
  - /v2/api/auth/login
  - /v3/api/auth/login
- Tras login exitoso, guarda el token y navega al dashboard (según implementación).

Control flow moderno:

- Uso de bloques `@if`/`@for` (en lugar de `*ngIf`/`*ngFor`), compatible y recomendado en Angular 20+.

### AuthStatus (src/app/components/auth-status)

- Muestra estado de autenticación y permite:
  - Validar token v2 (envía Authorization: Bearer)
  - Cerrar sesión
- Maneja y muestra mensajes de validación, incluyendo errores devueltos por el backend (por ejemplo, 401 Token inválido o expirado).

## Shared

### constants.ts

Centraliza endpoints:

- LOGIN_V1/V2/V3
- VALIDATE_V1/V2
- SEND_OTP
- USER/NOTIFICATIONS/PROCESS (si aplica)

Nota: En desarrollo, no necesitas BASE_URL si usas el proxy; las rutas comienzan con /v1/api..., /v2/api..., etc.

### interfaces/login.ts

- Tipos para requests: LoginV1Request, LoginV2Request, LoginV3Request
- Respuestas: LoginResponse, ValidateResponse, ErrorResponse
- Alias de tipos para multi-login.

### services/auth.ts (AuthService con Signals)

- Signals:
  - `_token: signal<string | null>`
  - `_isAuthenticated: signal<boolean>`
  - `hasValidToken: computed(() => !!_token())`
  - `Expuestos: token (readonly), isAuthenticated (readonly)`
- Métodos:
  - loginV1/loginV2/loginV3 y `login(credentials, type)`
  - validateTokenV1 (token en body)
  - validateTokenV2 (token en header Authorization)
  - sendOtpEmail
  - logout/clearAuth
  - getAuthHeaders (con Bearer)
- Manejo de expiración:
  - Si el backend responde 401, `handleError` limpia token y refresca las signals (UI reacciona de inmediato).

### interceptors/auth.interceptor.ts

- Interceptor funcional (Angular 20+) que:
  - Lee el token del AuthService
  - Agrega `Authorization: Bearer <token>` a peticiones protegidas (p. ej., /v2/api/*, /v1/api/process/*, etc., según tu implementación)
  - Puede manejar respuestas 401 de forma global si quieres reforzar el logout/redirect.

### guards/auth.guard.ts

- Guarda funcional (Angular 20+) que:
  - Permite acceso cuando `authService.isAuthenticated()` es true.
  - Si no, muestra un mensaje de “No autorizado” y redirige a `/login`.

## Rutas (src/app/app.routes.ts)

- Ejemplo típico:
  - path: '' → redirect a `/login`
  - path: 'login' → LoginComponent (pública)
  - path: 'dashboard' → AuthStatus (protegida por `authGuard`)
  - path: '**' → redirect a `/login`

## Flujo típico

1) Ejecuta el backend en 3000.  
2) `npm start` para levantar la app con proxy.  
3) Inicia sesión desde la página de login (v1/v2/v3).  
4) Navega al dashboard para validar token o cerrar sesión.  
5) Observa manejo de errores y estado de autenticación en tiempo real.
