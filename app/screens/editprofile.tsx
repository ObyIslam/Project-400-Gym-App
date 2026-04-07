import { authFetch } from '@/app/lib/api';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const COLORS = {
  BG: '#121212',
  CARD: '#1E1E1E',
  BORDER: '#2E2E2E',
  TEXT: '#FFFFFF',
  MUTED: '#A9A9A9',
  ACCENT: '#357be6',
};

type ProfileResponse = {
  age: number | null;
  heightCm: number | null;
  startingWeightKg: number | null;
  goalWeightKg: number | null;
  dateOfBirth: string | null;
};

export default function EditProfileScreen() {
  const router = useRouter();

  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [startingWeightKg, setStartingWeightKg] = useState('');
  const [goalWeightKg, setGoalWeightKg] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await authFetch('/api/profile');

        if (!res.ok) {
          const err = await res.text();
          console.error('Load profile failed:', res.status, err);
          return;
        }

        const data: ProfileResponse = await res.json();
        setAge(data.age != null ? String(data.age) : '');
        setHeightCm(data.heightCm != null ? String(data.heightCm) : '');
        setStartingWeightKg(
          data.startingWeightKg != null ? String(data.startingWeightKg) : ''
        );
        setGoalWeightKg(data.goalWeightKg != null ? String(data.goalWeightKg) : '');
        setDateOfBirth(data.dateOfBirth ?? '');
      } catch (err) {
        console.error('Load profile error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const saveProfile = async () => {
    try {
      setSaving(true);

      const payload = {
        age: age.trim() ? Number(age) : null,
        heightCm: heightCm.trim() ? Number(heightCm) : null,
        startingWeightKg: startingWeightKg.trim() ? Number(startingWeightKg) : null,
        goalWeightKg: goalWeightKg.trim() ? Number(goalWeightKg) : null,
        dateOfBirth: dateOfBirth.trim() ? dateOfBirth : null,
      };

      const res = await authFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('Save profile failed:', res.status, err);
        Alert.alert('Save failed', 'Could not update profile.');
        return;
      }

      Alert.alert('Saved', 'Profile updated successfully.');
      router.back();
    } catch (err) {
      console.error('Save profile error:', err);
      Alert.alert('Save failed', 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Edit Profile</Text>

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        placeholder="Enter age"
        placeholderTextColor={COLORS.MUTED}
      />

      <Text style={styles.label}>Height (cm)</Text>
      <TextInput
        style={styles.input}
        value={heightCm}
        onChangeText={setHeightCm}
        keyboardType="numeric"
        placeholder="Enter height in cm"
        placeholderTextColor={COLORS.MUTED}
      />

      <Text style={styles.label}>Starting Weight (kg)</Text>
      <TextInput
        style={styles.input}
        value={startingWeightKg}
        onChangeText={setStartingWeightKg}
        keyboardType="numeric"
        placeholder="Enter starting weight"
        placeholderTextColor={COLORS.MUTED}
      />

      <Text style={styles.label}>Goal Weight (kg)</Text>
      <TextInput
        style={styles.input}
        value={goalWeightKg}
        onChangeText={setGoalWeightKg}
        keyboardType="numeric"
        placeholder="Enter goal weight"
        placeholderTextColor={COLORS.MUTED}
      />

      <Text style={styles.label}>Date of Birth</Text>
      <TextInput
        style={styles.input}
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={COLORS.MUTED}
      />

      <TouchableOpacity
        style={[styles.button, saving && styles.buttonDisabled]}
        onPress={saveProfile}
        disabled={saving}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Profile'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  content: { padding: 18, paddingBottom: 30 },

  center: {
    flex: 1,
    backgroundColor: COLORS.BG,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: COLORS.MUTED,
    fontSize: 13,
    fontWeight: '700',
  },

  title: {
    color: COLORS.TEXT,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 18,
  },

  label: {
    color: COLORS.MUTED,
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '700',
  },

  input: {
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    color: COLORS.TEXT,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 14,
  },

  button: {
    backgroundColor: COLORS.ACCENT,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: COLORS.TEXT,
    fontWeight: '900',
    fontSize: 15,
  },
});