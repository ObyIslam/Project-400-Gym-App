import { useAuth } from '@/app/context/AuthContext';
import { authFetch } from '@/app/lib/api';
import Entypo from '@expo/vector-icons/Entypo';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const COLORS = {
  BG: '#121212',
  CARD: '#1E1E1E',
  CARD_2: '#242424',
  BORDER: '#2E2E2E',
  TEXT: '#FFFFFF',
  MUTED: '#A9A9A9',
  ACCENT: '#357be6',
  ACCENT_TEXT: '#FFFFFF',
};

interface RoutineSet {
  id?: number;
  reps?: number | null;
  weight?: number | null;
  completed?: boolean;
}

interface Exercise {
  id: number;
  name: string;
  category?: string | null;
}

interface RoutineExercise {
  id: number;
  exercise: Exercise;
  sets: RoutineSet[];
}

interface Routine {
  id: number;
  name: string;
  exercises: RoutineExercise[];
}

export default function HomeScreen() {
  const router = useRouter();
  const { token, isLoading } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);

  const loadRoutines = async () => {
    if (!token) return;

    try {
      const res = await authFetch('/api/routines/user', {
        method: 'GET',
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Fetch routines failed:', res.status, errText);
        return;
      }

      const data: Routine[] = await res.json();

      if (Array.isArray(data)) {
        setRoutines(data);
      } else {
        console.error('Unexpected routines response', data);
      }
    } catch (err) {
      console.error('Error fetching routines:', err);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!token) return;

    loadRoutines();
  }, [token, isLoading]);

  const renderRoutine = ({ item }: { item: Routine }) => {
    const exerciseCount = item.exercises?.length ?? 0;

    return (
      <Pressable
        style={({ pressed, hovered }) => [
          styles.savedRoutineItem,
          (pressed || hovered) && styles.secondaryPressState,
        ]}
        onPress={() => router.push(`/screens/routine/${item.id}`)}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.savedRoutineTitle}>{item.name}</Text>
          <Text style={styles.savedRoutineMeta}>
            {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
          </Text>
        </View>

        <Entypo name="chevron-right" size={18} color={COLORS.MUTED} />
      </Pressable>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Workout</Text>
        <Text style={styles.topSubtitle}>Start a workout or manage routines</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.iconCircle}>
            <Entypo name="plus" size={18} color={COLORS.ACCENT_TEXT} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Start a workout</Text>
            <Text style={styles.cardSub}>
              Build a workout from the exercise library.
            </Text>
          </View>
        </View>

        <Pressable
          style={({ pressed, hovered }) => [
            styles.primaryBtn,
            (pressed || hovered) && styles.primaryBtnActive,
          ]}
          onPress={() => router.push('/screens/addworkoutscreen')}
        >
          <Text style={styles.primaryBtnText}>Start Empty Workout</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.iconCircleAlt}>
            <Entypo name="book" size={18} color={COLORS.TEXT} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Routines</Text>
            <Text style={styles.cardSub}>Save templates to reuse later.</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed, hovered }) => [
            styles.secondaryBtn,
            (pressed || hovered) && styles.secondaryPressState,
          ]}
          onPress={() => router.push('/screens/addroutinescreen')}
        >
          <View style={styles.btnRow}>
            <Entypo name="book" size={18} color={COLORS.TEXT} />
            <Text style={styles.secondaryBtnText}>New Routine</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.iconCircleAlt}>
            <Entypo name="camera" size={18} color={COLORS.TEXT} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Exercise Form Analysis</Text>
            <Text style={styles.cardSub}>
              Upload a side-view image or video and get AI feedback.
            </Text>
          </View>
        </View>

        <Pressable
          style={({ pressed, hovered }) => [
            styles.secondaryBtn,
            (pressed || hovered) && styles.secondaryPressState,
          ]}
          onPress={() => router.push('/screens/exercise-analysis' as any)}
        >
          <View style={styles.btnRow}>
            <Entypo name="camera" size={18} color={COLORS.TEXT} />
            <Text style={styles.secondaryBtnText}>Analyze Exercise</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.iconCircleAlt}>
            <Entypo name="folder" size={18} color={COLORS.TEXT} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Saved Routines</Text>
            <Text style={styles.cardSub}>Your saved workout templates.</Text>
          </View>
        </View>

        {routines.length === 0 ? (
          <Text style={styles.emptyText}>No routines saved yet.</Text>
        ) : (
          <FlatList
            data={routines}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRoutine}
            scrollEnabled={false}
            contentContainerStyle={{ paddingTop: 4 }}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  content: { padding: 16, paddingBottom: 22 },

  topBar: {
    paddingTop: 14,
    paddingBottom: 16,
    marginBottom: 12,
  },

  topTitle: {
    color: COLORS.TEXT,
    fontSize: 28,
    fontWeight: '900',
  },

  topSubtitle: {
    marginTop: 4,
    color: COLORS.MUTED,
    fontSize: 13,
    fontWeight: '700',
  },

  card: {
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },

  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },

  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconCircleAlt: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.CARD_2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTitle: {
    color: COLORS.TEXT,
    fontSize: 16,
    fontWeight: '900',
  },

  cardSub: {
    marginTop: 4,
    color: COLORS.MUTED,
    fontSize: 12,
    fontWeight: '700',
  },

  primaryBtn: {
    backgroundColor: COLORS.ACCENT,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnActive: { backgroundColor: '#2d69c5' },

  primaryBtnText: {
    color: COLORS.ACCENT_TEXT,
    fontWeight: '900',
    fontSize: 15,
  },

  secondaryBtn: {
    backgroundColor: COLORS.CARD_2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryPressState: { backgroundColor: '#1f1f1f' },

  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  secondaryBtnText: {
    color: COLORS.TEXT,
    fontWeight: '900',
    fontSize: 15,
  },

  savedRoutineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.CARD_2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
  },

  savedRoutineTitle: {
    color: COLORS.TEXT,
    fontSize: 14,
    fontWeight: '800',
  },

  savedRoutineMeta: {
    marginTop: 4,
    color: COLORS.MUTED,
    fontSize: 12,
    fontWeight: '700',
  },

  emptyText: {
    color: COLORS.MUTED,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
});