import { useAuth } from '@/app/context/AuthContext';
import { API_BASE } from '@/app/lib/api';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const COLORS = {
  BG: '#121212', CARD: '#1E1E1E', BORDER: '#2E2E2E', TEXT: '#FFFFFF', MUTED: '#A9A9A9', ACCENT: '#357be6'
};

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Sign up failed', data?.message || 'Could not create account.');
        return;
      }
      await login(data.token, { userId: data.userId, name: data.name, email: data.email });
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Sign up failed', 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Your workouts will be saved under your own login.</Text>
        <TextInput style={styles.input} placeholder="Name" placeholderTextColor={COLORS.MUTED} value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor={COLORS.MUTED} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor={COLORS.MUTED} value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Account'}</Text>
        </TouchableOpacity>
        <Link href="/auth/login" asChild>
          <TouchableOpacity><Text style={styles.link}>Already have an account?</Text></TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: COLORS.CARD, borderColor: COLORS.BORDER, borderWidth: 1, borderRadius: 18, padding: 18 },
  title: { color: COLORS.TEXT, fontSize: 28, fontWeight: '900' },
  subtitle: { color: COLORS.MUTED, marginTop: 6, marginBottom: 16 },
  input: { backgroundColor: '#242424', color: COLORS.TEXT, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.BORDER },
  button: { backgroundColor: COLORS.ACCENT, borderRadius: 12, padding: 14, alignItems: 'center' },
  buttonText: { color: COLORS.TEXT, fontWeight: '900' },
  link: { color: COLORS.ACCENT, textAlign: 'center', marginTop: 16, fontWeight: '700' },
});
