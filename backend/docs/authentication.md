# Authentication - Backend

The OpenRubberDocks authentication system is based on JSON Web Tokens (JWT) using Passport strategies in NestJS. It relies heavily on **secure cookies** (httpOnly) to prevent Cross-Site Scripting (XSS) attacks.

## Architecture and Strategies

1. **Access Token (`Authentication` cookie)**:
   - Short-lived (e.g., 15 minutes).
   - Validated by the `JwtStrategy`.
   - Used to authenticate every request to protected resources.

2. **Refresh Token (`Refresh` cookie)**:
   - Long-lived (e.g., 7 days).
   - Validated by the `JwtRefreshStrategy` and verified against the hash stored in the database (`User.hashedRefreshToken`).
   - Used exclusively to request a new Access Token silently.

Both tokens store the `userUUID` property in their payload. The JWT strategies intercept the requests, automatically read the cookies, validate the signature, and then look up the UUID in the database.

## Endpoints

| Endpoint | Method | Guard/Strategy | Description |
| :--- | :--- | :--- | :--- |
| `/auth/login` | `POST` | None (Manual) | Receives credentials. If valid, generates both JWTs and sets them as `httpOnly` cookies. Returns user data. |
| `/auth/refresh`| `POST` | `jwt-refresh` | Validates the `Refresh` cookie. Generates and returns a new set of tokens (Access and Refresh), overwriting the old cookies. |
| `/auth/logout` | `POST` | `jwt` | Clears the cookies from the client (`clearCookie`) and removes the refresh token hash from the database to invalidate the session. |
| `/auth/me` | `GET` | `jwt` | Returns the currently logged-in user's data based on the access token. |

## Security Considerations
- Tokens are never exposed in the HTTP response body, nor in LocalStorage or SessionStorage.
- All cookies are configured with `httpOnly: true`, `sameSite: 'strict'`, and `secure: true` in production.
