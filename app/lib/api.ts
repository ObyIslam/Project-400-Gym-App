import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = 'http://localhost:8080';

export async function authFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = await AsyncStorage.getItem('token');

  console.log('authFetch token:', token);
  console.log('authFetch url:', `${API_BASE}${endpoint}`);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  console.log('authFetch headers:', headers);

  return fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
}