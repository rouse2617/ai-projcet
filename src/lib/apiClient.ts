const API_BASE = '';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ===== Auth =====

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export function register(email: string, password: string, name?: string, company?: string, phone?: string) {
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, company, phone }),
  });
}

export function login(email: string, password: string) {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function saveToken(token: string) {
  localStorage.setItem('auth_token', token);
}

export function clearToken() {
  localStorage.removeItem('auth_token');
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

// ===== Quotes =====

export interface QuoteRecord {
  id: string;
  projectName: string;
  partDesc: string;
  inputJson: string;
  resultJson: string;
  totalCost: number;
  featuresJson: string;
  tags: string;
  createdAt: string;
}

export function fetchQuotes(search?: string, limit?: number) {
  const params = new URLSearchParams();
  if (search) params.set('q', search);
  if (limit) params.set('limit', String(limit));
  return request<{ quotes: QuoteRecord[] }>(`/api/quotes?${params}`);
}

export function saveQuoteToServer(data: {
  projectName: string;
  partDesc: string;
  input: unknown;
  result: unknown;
  features: unknown;
  tags?: string;
}) {
  return request<{ quote: QuoteRecord }>('/api/quotes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deleteQuoteFromServer(id: string) {
  return request<{ success: boolean }>(`/api/quotes/${id}`, { method: 'DELETE' });
}
