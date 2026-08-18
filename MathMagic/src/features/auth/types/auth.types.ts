export type AuthMode = 'login' | 'register';
export type AuthViewMode = 'welcome' | 'auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  referredByCode?: string;
}
