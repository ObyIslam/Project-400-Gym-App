import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace this with your laptop LAN IP when testing on a real phone.
// Example: http://192.168.1.25:8080
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

export async function authUpload(endpoint: string, formData: FormData) {
  const token = await AsyncStorage.getItem('token');

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  console.log('authUpload token:', token);
  console.log('authUpload url:', `${API_BASE}${endpoint}`);
  console.log('authUpload headers:', headers);

  return fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });
}
