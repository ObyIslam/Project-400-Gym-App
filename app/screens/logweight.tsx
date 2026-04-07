import { authFetch } from '@/app/lib/api';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
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

export default function LogWeightScreen() {
  const router = useRouter();

  const [weightKg, setWeightKg] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const saveWeight = async () => {
    if (!weightKg.trim()) {
      Alert.alert('Missing weight', 'Please enter your weight.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        weightKg: Number(weightKg),
        entryDate: entryDate.trim() ? entryDate : null,
        note: note.trim() ? note : null,
      };

      const res = await authFetch('/api/profile/weights', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('Add weight failed:', res.status, err);
        Alert.alert('Save failed', 'Could not add weight entry.');
        return;
      }

      Alert.alert('Saved', 'Weight entry added.');
      router.back();
    } catch (err) {
      console.error('Add weight error:', err);
      Alert.alert('Save failed', 'Could not add weight entry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log Weight</Text>

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        value={weightKg}
        onChangeText={setWeightKg}
        keyboardType="numeric"
        placeholder="e.g. 82.4"
        placeholderTextColor={COLORS.MUTED}
      />

      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.input}
        value={entryDate}
        onChangeText={setEntryDate}
        placeholder="YYYY-MM-DD (leave blank for today)"
        placeholderTextColor={COLORS.MUTED}
      />

      <Text style={styles.label}>Note</Text>
      <TextInput
        style={styles.input}
        value={note}
        onChangeText={setNote}
        placeholder="Optional note"
        placeholderTextColor={COLORS.MUTED}
      />

      <TouchableOpacity
        style={[styles.button, saving && styles.buttonDisabled]}
        onPress={saveWeight}
        disabled={saving}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Weight'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
    padding: 18,
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