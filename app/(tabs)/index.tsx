import { useAuth } from '@/app/context/AuthContext';
import { authFetch } from '@/app/lib/api';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
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

interface Exercise {
  id: number;
  name: string;
  category?: string | null;
}

interface WorkoutSet {
  id?: number;
  reps?: number | null;
  weight?: number | null;
  completed: boolean;
}

interface WorkoutExercise {
  id: number;
  exercise: Exercise;
  sets: WorkoutSet[];
}

interface Workout {
  id: number;
  name: string | null;
  finished?: boolean;
  exercises: WorkoutExercise[];
}

export default function HomeScreen() {
  const router = useRouter();
  const { token, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isNarrow = width < 380;
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [refreshing, setRefreshing] = useState(false);

    const loadWorkouts = async () => {
    if (!token) return;

    try {
      const res = await authFetch('/api/workouts/user', {
        method: 'GET',
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Fetch workouts failed:', res.status, errText);
        return;
      }

      const data: Workout[] = await res.json();

      if (Array.isArray(data)) {
        setWorkouts(data);
      } else {
        console.error('Unexpected workouts response:', data);
      }
    } catch (err) {
      console.error('Error fetching workouts:', err);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!token) return;

    loadWorkouts();
  }, [token, isLoading]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
    setRefreshing(false);
  };

  const deleteWorkout = async (id: number) => {
    try {
      const res = await authFetch(`/api/workouts/user/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('Delete workout failed:', res.status, err);
        return;
      }

      setWorkouts((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error('Delete workout error:', err);
    }
  };

  const renderSet = ({ item }: { item: WorkoutSet }) => (
    <View style={styles.setChip}>
      <Text style={styles.setChipText}>{item.reps ?? 0} reps</Text>
      <Text style={styles.setChipDivider}>•</Text>
      <Text style={styles.setChipText}>{item.weight ?? 0} kg</Text>
    </View>
  );

  const renderExercise = ({ item }: { item: WorkoutExercise }) => {
    const setCount = item.sets?.length ?? 0;

    return (
      <View style={styles.exerciseBlock}>
        <View style={styles.exerciseHeader}>
          <View style={styles.exerciseTitleWrap}>
            <Text numberOfLines={1} style={styles.exerciseText}>
              {item.exercise?.name || 'Unnamed exercise'}
            </Text>
          </View>

          {!!item.exercise?.category && (
            <View style={styles.pill}>
              <Text style={styles.pillText}>{item.exercise.category}</Text>
            </View>
          )}
        </View>

        <View style={styles.exerciseMetaRow}>
          <Text style={styles.exerciseMeta}>
            {setCount} {setCount === 1 ? 'set' : 'sets'}
          </Text>
        </View>

        <FlatList
          data={item.sets ?? []}
          keyExtractor={(_, index) => `${item.id}-set-${index}`}
          renderItem={renderSet}
          scrollEnabled={false}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.setsList}
        />
      </View>
    );
  };

  const renderWorkout = ({ item, index }: { item: Workout; index: number }) => {
    const title = item.name?.trim() ? item.name : `Workout ${index + 1}`;
    const exerciseCount = item.exercises?.length ?? 0;
    const totalSetCount =
      item.exercises?.reduce((sum, ex) => sum + (ex.sets?.length ?? 0), 0) ?? 0;

    return (
      <View style={styles.workoutCard}>
        <View style={styles.workoutHeader}>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={styles.workoutTitle}>
              {title}
            </Text>
            <View style={styles.workoutStatsRow}>
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>
                  {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
                </Text>
              </View>
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>
                  {totalSetCount} {totalSetCount === 1 ? 'set' : 'sets'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{exerciseCount}</Text>
          </View>
        </View>

        <View style={styles.workoutActionsRow}>
          <Pressable
            style={({ pressed, hovered }) => [
              styles.editBtn,
              (pressed || hovered) && styles.editBtnActive,
            ]}
            onPress={() => router.push(`/screens/workouts/${item.id}`)}
          >
            <Text style={styles.editBtnText}>Open Workout</Text>
          </Pressable>

          <Pressable
            style={({ pressed, hovered }) => [
              styles.deleteBtn,
              (pressed || hovered) && styles.deleteBtnActive,
            ]}
            onPress={() => deleteWorkout(item.id)}
          >
            <Text style={styles.deleteBtnText}>Delete</Text>
          </Pressable>
        </View>

        {exerciseCount === 0 ? (
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
      <View style={[styles.topBar, isNarrow && styles.topBarCompact]}>
        <Text style={styles.topTitle}>Home</Text>
      </View>

      <FlatList
        data={workouts}
        keyExtractor={(w) => w.id.toString()}
        renderItem={renderWorkout}
        contentContainerStyle={[styles.listContent, isNarrow && styles.listContentCompact]}
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
  topBarCompact: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },

  topTitle: {
    color: COLORS.TEXT,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    includeFontPadding: false,
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
  },
  listContentCompact: {
    paddingHorizontal: 14,
    paddingTop: 12,
  },

  workoutCard: {
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },

  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  workoutTitle: {
    color: COLORS.TEXT,
    fontSize: 20,
    fontWeight: '900',
  },

  workoutStatsRow: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    backgroundColor: COLORS.CARD_2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metaChipText: {
    color: COLORS.MUTED,
    fontSize: 11,
    fontWeight: '800',
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

  workoutActionsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },

  deleteBtn: {
    backgroundColor: COLORS.DANGER,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    minWidth: 84,
    alignItems: 'center',
  },
  deleteBtnActive: { backgroundColor: '#d64233' },

  deleteBtnText: {
    color: COLORS.TEXT,
    fontSize: 12,
    fontWeight: '800',
  },

  exerciseBlock: {
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingTop: 10,
    marginTop: 10,
  },

  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  exerciseTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  exerciseText: {
    flex: 1,
    color: COLORS.TEXT,
    fontSize: 14,
    fontWeight: '800',
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

  exerciseMetaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },

  exerciseMeta: {
    color: COLORS.MUTED,
    fontSize: 12,
    fontWeight: '700',
  },

  setsList: {
    paddingTop: 10,
    gap: 8,
  },

  setChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD_2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },

  setChipText: {
    color: COLORS.TEXT,
    fontSize: 12,
    fontWeight: '800',
  },

  setChipDivider: {
    color: COLORS.MUTED,
    fontSize: 12,
    fontWeight: '800',
    marginHorizontal: 8,
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

  editBtn: {
    backgroundColor: COLORS.ACCENT,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  editBtnActive: { backgroundColor: '#2d69c5' },

  editBtnText: {
    color: COLORS.TEXT,
    fontSize: 12,
    fontWeight: '800',
  },
});