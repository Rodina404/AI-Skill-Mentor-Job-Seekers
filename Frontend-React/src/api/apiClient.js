const DEFAULT_API_BASE_URL = '/api';

export const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL;

export const getStoredToken = () => localStorage.getItem('token');
export const getStoredRefreshToken = () => localStorage.getItem('refresh_token');

export const clearStoredSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('currentUser');
};

export const notifySessionInvalid = () => {
  clearStoredSession();
  window.dispatchEvent(new CustomEvent('auth-session-invalid'));
};

const notifyTokenRefreshed = (session) => {
  window.dispatchEvent(new CustomEvent('auth-token-refreshed', { detail: session }));
};

const parseJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const createApiError = async (response, fallbackMessage) => {
  const body = await parseJsonSafely(response);
  const errorBody = body?.error;
  const message =
    (typeof errorBody === 'string' ? errorBody : errorBody?.message) ||
    body?.message ||
    fallbackMessage;

  const error = new Error(message);
  error.status = response.status;
  error.body = body;
  return error;
};

export const refreshStoredSession = async () => {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    notifySessionInvalid();
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    notifySessionInvalid();
    return null;
  }

  const session = await response.json();
  if (!session?.access_token) {
    notifySessionInvalid();
    return null;
  }

  localStorage.setItem('token', session.access_token);
  if (session.refresh_token) {
    localStorage.setItem('refresh_token', session.refresh_token);
  }
  notifyTokenRefreshed(session);
  return session;
};

export const getAuthHeaders = (token, extraHeaders = {}) => {
  const finalToken = token || getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...extraHeaders,
    ...(finalToken ? { Authorization: `Bearer ${finalToken}` } : {}),
  };
};

export const authFetch = async (url, options = {}, token) => {
  const requestUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const requestOptions = {
    ...options,
    headers: getAuthHeaders(token, options.headers || {}),
  };

  let response = await fetch(requestUrl, requestOptions);
  if (response.status !== 401) {
    return response;
  }

  const refreshed = await refreshStoredSession();
  if (!refreshed?.access_token) {
    return response;
  }

  response = await fetch(requestUrl, {
    ...options,
    headers: getAuthHeaders(refreshed.access_token, options.headers || {}),
  });

  if (response.status === 401) {
    notifySessionInvalid();
  }

  return response;
};
