import { authFetch } from '@/app/lib/api';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
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
  ACCENT_TEXT: '#FFFFFF',
  DANGER: '#E74C3C',
  SUCCESS: '#2E8B57',
};

export const layout = () => <Stack screenOptions={{ headerShown: false }} />;

interface Exercise {
  id: number;
  externalId?: string | null;
  name: string;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
}

interface RoutineSet {
  id?: number;
  reps: number | string;
  weight: number | string;
  completed?: boolean;
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

const FALLBACK_IMAGE_URL = 'https://placehold.co/240x240/png?text=Exercise';

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingWorkout, setSavingWorkout] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadRoutine = async () => {
      try {
        const res = await authFetch(`/api/routines/${id}`, {
          method: 'GET',
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error('Fetch routine failed:', res.status, errText);
          return;
        }

        const data: Routine = await res.json();

        if (data && data.id) {
          setRoutine({
            ...data,
            exercises: (data.exercises ?? []).map((ex) => ({
              ...ex,
              sets: (ex.sets ?? []).map((set) => ({
                ...set,
                reps: String(set.reps ?? ''),
                weight: String(set.weight ?? ''),
                completed: set.completed ?? false,
              })),
            })),
          });
        }
      } catch (err) {
        console.error('Error fetching routine:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, [id]);

  const updateSetReps = (exerciseId: number, setIndex: number, reps: string) => {
    setRoutine((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        exercises: prev.exercises.map((item) =>
          item.id === exerciseId
            ? {
                ...item,
                sets: item.sets.map((set, index) =>
                  index === setIndex ? { ...set, reps } : set
                ),
              }
            : item
        ),
      };
    });
  };

  const updateSetWeight = (
    exerciseId: number,
    setIndex: number,
    weight: string
  ) => {
    setRoutine((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        exercises: prev.exercises.map((item) =>
          item.id === exerciseId
            ? {
                ...item,
                sets: item.sets.map((set, index) =>
                  index === setIndex ? { ...set, weight } : set
                ),
              }
            : item
        ),
      };
    });
  };

  const toggleSetCompleted = (exerciseId: number, setIndex: number) => {
    setRoutine((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        exercises: prev.exercises.map((item) =>
          item.id === exerciseId
            ? {
                ...item,
                sets: item.sets.map((set, index) =>
                  index === setIndex
                    ? { ...set, completed: !set.completed }
                    : set
                ),
              }
            : item
        ),
      };
    });
  };

  const addSet = (exerciseId: number) => {
    setRoutine((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        exercises: prev.exercises.map((item) =>
          item.id === exerciseId
            ? {
                ...item,
                sets: [
                  ...item.sets,
                  { reps: '', weight: '', completed: false },
                ],
              }
            : item
        ),
      };
    });
  };

  const removeSet = (exerciseId: number, setIndex: number) => {
    setRoutine((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        exercises: prev.exercises.map((item) => {
          if (item.id !== exerciseId) return item;

          const updatedSets = item.sets.filter((_, index) => index !== setIndex);

          return {
            ...item,
            sets:
              updatedSets.length > 0
                ? updatedSets
                : [{ reps: '', weight: '', completed: false }],
          };
        }),
      };
    });
  };

  const finishRoutineWorkout = async () => {
    if (!routine) return;

    if (!routine.exercises || routine.exercises.length === 0) {
      Alert.alert('No exercises', 'This routine has no exercises to save.');
      return;
    }

    const payload = {
      name: routine.name,
      exercises: routine.exercises.map((item) => ({
        exercise: item.exercise,
        sets: item.sets.map((set) => ({
          reps: Number(set.reps) || 0,
          weight: Number(set.weight) || 0,
          completed: !!set.completed,
        })),
      })),
    };

    try {
      setSavingWorkout(true);

      const res = await authFetch('/api/workouts/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('Save workout from routine failed:', res.status, err);
        Alert.alert('Save failed', 'Could not save workout.');
        return;
      }

      Alert.alert('Saved', 'Workout saved from routine.');
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Save workout from routine error:', err);
      Alert.alert('Save failed', 'Could not save workout.');
    } finally {
      setSavingWorkout(false);
    }
  };

  const renderExercise = ({ item }: { item: RoutineExercise }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.exercise.imageUrl ?? FALLBACK_IMAGE_URL }}
        style={styles.exerciseImage}
        resizeMode="cover"
      />

      <View style={styles.cardBody}>
        <Text numberOfLines={2} style={styles.cardTitle}>
          {item.exercise.name || 'No Name'}
        </Text>
        <Text numberOfLines={1} style={styles.cardSub}>
          {item.exercise.category || 'Unknown muscle'}
        </Text>

        {item.sets.map((set, setIndex) => (
          <View key={setIndex} style={styles.setRow}>
            <View style={styles.setNumberBox}>
              <Text style={styles.setNumberText}>{setIndex + 1}</Text>
            </View>

            <TextInput
              style={styles.smallInput}
              placeholder="Reps"
              placeholderTextColor={COLORS.MUTED}
              keyboardType="numeric"
              value={String(set.reps ?? '')}
              onChangeText={(text) => updateSetReps(item.id, setIndex, text)}
            />

            <TextInput
              style={styles.smallInput}
              placeholder="KG"
              placeholderTextColor={COLORS.MUTED}
              keyboardType="numeric"
              value={String(set.weight ?? '')}
              onChangeText={(text) => updateSetWeight(item.id, setIndex, text)}
            />

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => toggleSetCompleted(item.id, setIndex)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkbox,
                  set.completed && styles.checkboxChecked,
                ]}
              >
                {set.completed ? <Text style={styles.checkboxTick}>✓</Text> : null}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.removeSetBtn}
              onPress={() => removeSet(item.id, setIndex)}
              activeOpacity={0.85}
            >
              <Text style={styles.removeSetText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addSetBtn}
          onPress={() => addSet(item.id)}
          activeOpacity={0.85}
        >
          <Text style={styles.addSetBtnText}>+ Add Set</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Loading routine…</Text>
      </View>
    );
  }

  if (!routine) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Routine not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{routine.name || 'Routine'}</Text>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Routine exercises</Text>
        <Text style={styles.badge}>{routine.exercises?.length ?? 0}</Text>
      </View>

      <FlatList
        data={routine.exercises ?? []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExercise}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No exercises in this routine.</Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <TouchableOpacity
        style={[styles.finishBtn, savingWorkout && styles.finishBtnDisabled]}
        onPress={finishRoutineWorkout}
        activeOpacity={0.85}
        disabled={savingWorkout}
      >
        <Text style={styles.finishBtnText}>
          {savingWorkout ? 'Saving...' : 'Finish Workout'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG, padding: 18 },

  center: {
    flex: 1,
    backgroundColor: COLORS.BG,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    color: COLORS.TEXT,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 10,
    marginBottom: 18,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    marginBottom: 10,
  },

  sectionTitle: {
    color: COLORS.TEXT,
    fontSize: 18,
    fontWeight: '800',
  },

  badge: {
    color: COLORS.TEXT,
    backgroundColor: COLORS.CARD_2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    fontWeight: '900',
  },

  emptyText: {
    color: COLORS.MUTED,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    fontWeight: '700',
  },

  loadingText: {
    color: COLORS.MUTED,
    marginTop: 10,
    fontSize: 13,
    fontWeight: '700',
  },

  card: {
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 12,
  },

  exerciseImage: {
    width: 92,
    height: 92,
    backgroundColor: '#0B0B0B',
  },

  cardBody: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  cardTitle: {
    color: COLORS.TEXT,
    fontSize: 15,
    fontWeight: '900',
  },

  cardSub: {
    color: COLORS.MUTED,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '800',
    marginBottom: 10,
  },

  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },

  setNumberBox: {
    width: 28,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.CARD_2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  setNumberText: {
    color: COLORS.TEXT,
    fontSize: 12,
    fontWeight: '800',
  },

  smallInput: {
    width: 70,
    height: 36,
    backgroundColor: COLORS.CARD_2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    color: COLORS.TEXT,
    fontSize: 14,
    textAlign: 'center',
    padding: 4,
  },

  checkboxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.CARD_2,
  },

  checkboxChecked: {
    backgroundColor: COLORS.SUCCESS,
    borderColor: COLORS.SUCCESS,
  },

  checkboxTick: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },

  removeSetBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.CARD_2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  removeSetText: {
    color: COLORS.TEXT,
    fontSize: 16,
    fontWeight: '900',
    marginTop: -1,
  },

  addSetBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.CARD_2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
  },

  addSetBtnText: {
    color: COLORS.TEXT,
    fontSize: 12,
    fontWeight: '800',
  },

  finishBtn: {
    backgroundColor: COLORS.ACCENT,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },

  finishBtnDisabled: {
    opacity: 0.7,
  },

  finishBtnText: {
    color: COLORS.ACCENT_TEXT,
    fontWeight: '900',
    fontSize: 15,
  },
});