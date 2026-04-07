import { useAuth } from '@/app/context/AuthContext';
import { authFetch } from '@/app/lib/api';
import Entypo from '@expo/vector-icons/Entypo';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const COLORS = {
  BG: '#121212',
  CARD: '#1E1E1E',
  CARD_2: '#242424',
  BORDER: '#2E2E2E',
  TEXT: '#FFFFFF',
  MUTED: '#A9A9A9',
  ACCENT: '#357be6',
  DANGER: '#E74C3C',
};

type ProfileResponse = {
  userId: number;
  name: string;
  email: string;
  age: number | null;
  heightCm: number | null;
  startingWeightKg: number | null;
  goalWeightKg: number | null;
  dateOfBirth: string | null;
  latestWeightKg: number | null;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const res = await authFetch('/api/profile');

      if (!res.ok) {
        const err = await res.text();
        console.error('Fetch profile failed:', res.status, err);
        return;
      }

      const data: ProfileResponse = await res.json();
      setProfile(data);
    } catch (err) {
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadProfile();
    }, [loadProfile])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  const currentWeight = profile?.latestWeightKg ?? profile?.startingWeightKg ?? null;
  const startingWeight = profile?.startingWeightKg ?? null;
  const goalWeight = profile?.goalWeightKg ?? null;

  let progressText = 'No progress data yet';
  if (currentWeight != null && startingWeight != null) {
    const diff = Number((currentWeight - startingWeight).toFixed(1));
    progressText =
      diff === 0
        ? 'No change yet'
        : diff > 0
        ? `Up ${diff} kg from start`
        : `Down ${Math.abs(diff)} kg from start`;
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.TEXT}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Entypo name="user" size={34} color={COLORS.TEXT} />
        </View>
        <Text style={styles.name}>{profile?.name ?? 'Your Profile'}</Text>
        <Text style={styles.subText}>{profile?.email ?? 'No email'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personal Info</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Age</Text>
          <Text style={styles.value}>{profile?.age ?? '-'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Height</Text>
          <Text style={styles.value}>
            {profile?.heightCm != null ? `${profile.heightCm} cm` : '-'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Date of Birth</Text>
          <Text style={styles.value}>{profile?.dateOfBirth ?? '-'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weight Goals</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Starting Weight</Text>
          <Text style={styles.value}>
            {startingWeight != null ? `${startingWeight} kg` : '-'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Current Weight</Text>
          <Text style={styles.value}>
            {currentWeight != null ? `${currentWeight} kg` : '-'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Goal Weight</Text>
          <Text style={styles.value}>
            {goalWeight != null ? `${goalWeight} kg` : '-'}
          </Text>
        </View>

        <View style={[styles.infoRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
          <Text style={styles.label}>Progress</Text>
          <Text style={styles.value}>{progressText}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Actions</Text>

        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/screens/editprofile')}
        >
          <Text style={styles.actionBtnText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/screens/logweight')}
        >
          <Text style={styles.actionBtnText}>Log Weight</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/screens/weighttracking')}
        >
          <Text style={styles.actionBtnText}>View Progress</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.85}
          onPress={handleLogout}
        >
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  content: { padding: 18, paddingBottom: 24 },

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

  header: {
    alignItems: 'center',
    marginBottom: 18,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  name: {
    color: COLORS.TEXT,
    fontSize: 22,
    fontWeight: '900',
  },

  subText: {
    marginTop: 4,
    color: COLORS.MUTED,
    fontSize: 13,
    fontWeight: '600',
  },

  card: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 16,
    marginBottom: 14,
  },

  cardTitle: {
    color: COLORS.TEXT,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },

  label: {
    color: COLORS.MUTED,
    fontSize: 14,
    fontWeight: '700',
  },

  value: {
    color: COLORS.TEXT,
    fontSize: 14,
    fontWeight: '800',
    flexShrink: 1,
    textAlign: 'right',
  },

  actionBtn: {
    backgroundColor: COLORS.ACCENT,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },

  actionBtnText: {
    color: COLORS.TEXT,
    fontSize: 14,
    fontWeight: '900',
  },

  logoutBtn: {
    backgroundColor: COLORS.DANGER,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },

  logoutBtnText: {
    color: COLORS.TEXT,
    fontSize: 14,
    fontWeight: '900',
  },
});