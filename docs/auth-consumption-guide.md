# Authentication Consumption Guide (React + TypeScript)

Since authentication is implemented using **httpOnly Cookies**, consuming it from the frontend is significantly simplified in terms of security (you don't have to store or handle JWTs in your JavaScript code). However, it requires specific configuration in your HTTP client.

## 1. HTTP Client Configuration (Axios)

For the browser to send and receive authentication cookies, you must **always** include credentials in your requests.

```typescript
// src/api/axios.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000', // or your API URL
  withCredentials: true, // CRITICAL! This allows sending/receiving cookies
});
```

## 2. Endpoints and Use Cases

### A. Sign In (Login)

When the user enters their credentials, `/auth/login` is called. The backend will respond with the `Authentication` and `Refresh` cookies.

```typescript
import { api } from '../api/axios';

interface LoginCredentials {
  email: string; // Or rubberHandle
  pwd: string;
}

export const login = async (credentials: LoginCredentials) => {
  const response = await api.post('/auth/login', { data: { attributes: credentials } });
  // Cookies are automatically saved in the browser.
  // response.data will contain the public user information.
  return response.data;
};
```

### B. Get Current User (Me)

To check if a user is already logged in (for example, on page reload), we call `/auth/me`.

```typescript
export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
```

### C. Sign Out (Logout)

```typescript
export const logout = async () => {
  await api.post('/auth/logout');
  // Cookies have been cleared by the backend.
  // You should clear your React state (Context/Redux) here.
};
```

## 3. Silent Token Renewal (Refresh Interceptor)

The Access Token (`Authentication` cookie) expires quickly (e.g., 15 minutes). When an API request fails with a `401 Unauthorized`, we must attempt to renew it using the Refresh Token (`Refresh` cookie) and retry the failed request, **all silently for the user**.

```typescript
// src/api/axios.ts (Continued)
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and it's not a login or refresh request itself
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
      if (isRefreshing) {
        // If we are already refreshing, queue this request to retry later
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Silent call to the backend to renew cookies
        await api.post('/auth/refresh');
        
        isRefreshing = false;
        processQueue(null);

        // Retry the original request now that we have new cookies
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        // The refresh failed (the session expired completely). Redirect to login.
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

## 4. Usage in a React Component (Context)

A simplified example of how to use this in a React Context.

```tsx
// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, login, logout } from '../api/auth';

interface AuthContextType {
  user: any | null;
  signIn: (credentials: any) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On app load, attempt to fetch the user (cookies will do the work)
    getMe()
      .then((data) => setUser(data))
      .catch(() => setUser(null)) // No session or cookies expired
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (credentials: any) => {
    const data = await login(credentials);
    setUser(data);
  };

  const signOut = async () => {
    await logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```
