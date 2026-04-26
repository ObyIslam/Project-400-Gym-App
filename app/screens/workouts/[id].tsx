import { authFetch } from '@/app/lib/api';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
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

interface WorkoutSet {
  id?: number;
  reps: number | string;
  weight: number | string;
  completed: boolean;
}

interface WorkoutExercise {
  id: number;
  exercise: Exercise;
  sets: WorkoutSet[];
}

interface Workout {
  id: number;
  name: string;
  finished: boolean;
  exercises: WorkoutExercise[];
}

const FALLBACK_IMAGE_URL = 'https://placehold.co/240x240/png?text=Exercise';

export default function EditWorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadWorkout = async () => {
      try {
        const res = await authFetch('/api/workouts/user', {
          method: 'GET',
        });

        if (!res.ok) {
          const err = await res.text();
          console.error('Error fetching workout list:', res.status, err);
          return;
        }

        const data: Workout[] = await res.json();
        const found = data.find((w) => String(w.id) === String(id));

        if (found) {
          setWorkout({
            ...found,
            exercises: (found.exercises ?? []).map((ex) => ({
              ...ex,
              sets: (ex.sets ?? []).map((set) => ({
                ...set,
                reps: String(set.reps ?? ''),
                weight: String(set.weight ?? ''),
                completed: !!set.completed,
              })),
            })),
          });
        }
      } catch (err) {
        console.error('Error fetching workout:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadWorkout();
    }
  }, [id]);

  const updateSetReps = (exerciseId: number, setIndex: number, reps: string) => {
    setWorkout((prev) => {
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

  const updateSetWeight = (exerciseId: number, setIndex: number, weight: string) => {
    setWorkout((prev) => {
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
    setWorkout((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.map((item) =>
          item.id === exerciseId
            ? {
                ...item,
                sets: item.sets.map((set, index) =>
                  index === setIndex ? { ...set, completed: !set.completed } : set
                ),
              }
            : item
        ),
      };
    });
  };

  const addSet = (exerciseId: number) => {
    setWorkout((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.map((item) =>
          item.id === exerciseId
            ? {
                ...item,
                sets: [...item.sets, { reps: '', weight: '', completed: false }],
              }
            : item
        ),
      };
    });
  };

  const removeSet = (exerciseId: number, setIndex: number) => {
    setWorkout((prev) => {
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

  const saveWorkout = async () => {
    if (!workout) return;

    const payload = {
      ...workout,
      exercises: workout.exercises.map((item) => ({
        ...item,
        sets: item.sets.map((set) => ({
          ...set,
          reps: Number(set.reps) || 0,
          weight: Number(set.weight) || 0,
          completed: !!set.completed,
        })),
      })),
    };

    try {
      setSaving(true);

      const res = await authFetch(`/api/workouts/user/${workout.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('Update workout failed:', res.status, err);
        Alert.alert('Save failed', 'Could not update workout.');
        return;
      }

      Alert.alert('Saved', 'Workout saved');
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Update workout error:', err);
      Alert.alert('Save failed', 'Could not update workout.');
    } finally {
      setSaving(false);
    }
  };

  const renderExercise = ({ item }: { item: WorkoutExercise }) => (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: item.exercise.imageUrl ?? FALLBACK_IMAGE_URL }}
          style={styles.exerciseImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.cardBody}>
        <Text numberOfLines={2} style={styles.cardTitle}>
          {item.exercise.name || 'No Name'}
        </Text>
        <Text numberOfLines={1} style={styles.cardSub}>
          {item.exercise.category || 'Unknown muscle'}
        </Text>

        <View style={styles.setLabelsRow}>
          <Text style={styles.setLabelSpacer} />
          <Text style={styles.setInputLabel}>Reps</Text>
          <Text style={styles.setInputLabel}>Weight</Text>
          <Text style={styles.setLabelSpacer} />
          <Text style={styles.setLabelSpacer} />
        </View>

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

            <Pressable
              style={styles.checkboxContainer}
              onPress={() => toggleSetCompleted(item.id, setIndex)}
            >
              <View
                style={[
                  styles.checkbox,
                  set.completed && styles.checkboxChecked,
                ]}
              >
                {set.completed ? <Text style={styles.checkboxTick}>✓</Text> : null}
              </View>
            </Pressable>

            <Pressable
              style={({ pressed, hovered }) => [
                styles.removeSetBtn,
                (pressed || hovered) && styles.removeSetBtnActive,
              ]}
              onPress={() => removeSet(item.id, setIndex)}
            >
              <Text style={styles.removeSetText}>×</Text>
            </Pressable>
          </View>
        ))}

        <Pressable
          style={({ pressed, hovered }) => [
            styles.addSetBtn,
            (pressed || hovered) && styles.secondaryBtnActive,
          ]}
          onPress={() => addSet(item.id)}
        >
          <Text style={styles.addSetBtnText}>+ Add Set</Text>
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Loading workout…</Text>
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Workout not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{workout.name || 'Workout'}</Text>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Edit workout</Text>
        <Text style={styles.badge}>{workout.exercises?.length ?? 0}</Text>
      </View>

      <FlatList
        data={workout.exercises ?? []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExercise}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No exercises in this workout.</Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Pressable
        style={({ pressed, hovered }) => [
          styles.finishBtn,
          (pressed || hovered) && styles.finishBtnActive,
          saving && styles.finishBtnDisabled,
        ]}
        onPress={saveWorkout}
        disabled={saving}
      >
        <Text style={styles.finishBtnText}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG, padding: 16 },
  center: {
    flex: 1,
    backgroundColor: COLORS.BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    color: COLORS.TEXT,
    fontSize: 30,
    fontWeight: '900',
    marginTop: 6,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
    marginBottom: 12,
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
    borderRadius: 18,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    minHeight: 156,
  },
  imageWrap: {
    width: 104,
    alignSelf: 'stretch',
    backgroundColor: '#141414',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 14,
    paddingBottom: 10,
    borderRightWidth: 1,
    borderRightColor: COLORS.BORDER,
  },
  exerciseImage: {
    width: 86,
    height: 86,
    borderRadius: 12,
    backgroundColor: '#0B0B0B',
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  cardTitle: {
    color: COLORS.TEXT,
    fontSize: 17,
    fontWeight: '900',
  },
  cardSub: {
    color: COLORS.MUTED,
    fontSize: 13,
    marginTop: 4,
    fontWeight: '800',
    marginBottom: 10,
  },
  setLabelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  setLabelSpacer: {
    width: 24,
  },
  setInputLabel: {
    width: 52,
    color: COLORS.MUTED,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    width: '100%',
  },
  setNumberBox: {
    width: 24,
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
    fontSize: 11,
    fontWeight: '800',
  },
  smallInput: {
    width: 52,
    height: 36,
    backgroundColor: COLORS.CARD_2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    color: COLORS.TEXT,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  checkboxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 0,
    width: 24,
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
    width: 22,
    height: 22,
    borderRadius: 8,
    backgroundColor: COLORS.CARD_2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeSetBtnActive: {
    backgroundColor: '#1f1f1f',
  },
  removeSetText: {
    color: COLORS.TEXT,
    fontSize: 14,
    fontWeight: '900',
    marginTop: -1,
  },
  addSetBtn: {
    alignSelf: 'flex-start',
    marginTop: 2,
    marginBottom: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.CARD_2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
  },
  secondaryBtnActive: {
    backgroundColor: '#1f1f1f',
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
  finishBtnActive: {
    backgroundColor: '#2d69c5',
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