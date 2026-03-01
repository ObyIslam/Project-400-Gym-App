import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
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
};

interface Exercise {
  id: number;
  name: string;
  category?: string | null;
}

interface Workout {
  id: number;
  name: string | null;
  finished?: boolean;
  exercises: Exercise[];
}

const API_BASE =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

export default function HomeScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadWorkouts = () => {
    return fetch(`${API_BASE}/api/workouts/user`)
      .then((res) => res.json())
      .then((data: Workout[]) => {
        if (Array.isArray(data)) setWorkouts(data);
        else console.error('Unexpected workouts response', data);
      })
      .catch((err) => console.error('Error fetching workouts:', err));
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
    setRefreshing(false);
  };

  const stats = useMemo(() => {
    const totalWorkouts = workouts.length;
    const totalExercises = workouts.reduce((sum, w) => sum + (w.exercises?.length ?? 0), 0);
    return { totalWorkouts, totalExercises };
  }, [workouts]);

  const renderExercise = ({ item }: { item: Exercise }) => (
    <View style={styles.exerciseRow}>
      <View style={styles.bullet} />
      <Text numberOfLines={1} style={styles.exerciseText}>
        {item.name || 'Unnamed exercise'}
      </Text>
      {!!item.category && (
        <View style={styles.pill}>
          <Text style={styles.pillText}>{item.category}</Text>
        </View>
      )}
    </View>
  );

  const renderWorkout = ({ item, index }: { item: Workout; index: number }) => {
    const title = item.name?.trim() ? item.name : `Workout ${index + 1}`;
    const count = item.exercises?.length ?? 0;

    return (
      <View style={styles.workoutCard}>
        <View style={styles.workoutHeader}>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={styles.workoutTitle}>
              {title}
            </Text>
            <Text style={styles.workoutMeta}>
              {count} {count === 1 ? 'exercise' : 'exercises'}
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{count}</Text>
          </View>
        </View>

        {count === 0 ? (
          <Text style={styles.emptyExercisesText}>No exercises saved.</Text>
        ) : (
          <FlatList
            data={item.exercises}
            keyExtractor={(ex) => ex.id.toString()}
            renderItem={renderExercise}
            scrollEnabled={false}
            contentContainerStyle={{ paddingTop: 8 }}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Home</Text>
      </View>

      <FlatList
        data={workouts}
        keyExtractor={(w) => w.id.toString()}
        renderItem={renderWorkout}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.TEXT}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No workouts yet</Text>
            <Text style={styles.emptySub}>
              Create a workout to see it here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },

  topBar: {
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    backgroundColor: COLORS.BG,
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
    fontWeight: '600',
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
  },

  workoutCard: {
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  workoutTitle: {
    color: COLORS.TEXT,
    fontSize: 16,
    fontWeight: '900',
  },

  workoutMeta: {
    marginTop: 4,
    color: COLORS.MUTED,
    fontSize: 12,
    fontWeight: '700',
  },

  countBadge: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: COLORS.CARD_2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  countBadgeText: {
    color: COLORS.TEXT,
    fontWeight: '900',
    fontSize: 13,
  },

  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    gap: 10,
  },

  bullet: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: COLORS.ACCENT,
  },

  exerciseText: {
    flex: 1,
    color: COLORS.TEXT,
    fontSize: 13,
    fontWeight: '700',
  },

  pill: {
    backgroundColor: COLORS.CARD_2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  pillText: {
    color: COLORS.MUTED,
    fontSize: 11,
    fontWeight: '800',
  },

  emptyExercisesText: {
    marginTop: 10,
    color: COLORS.MUTED,
    fontSize: 13,
    fontWeight: '700',
  },

  emptyWrap: {
    marginTop: 40,
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 16,
    padding: 16,
  },

  emptyTitle: {
    color: COLORS.TEXT,
    fontSize: 16,
    fontWeight: '900',
  },

  emptySub: {
    marginTop: 6,
    color: COLORS.MUTED,
    fontSize: 13,
    fontWeight: '700',
  },
});