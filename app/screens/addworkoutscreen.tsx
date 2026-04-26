import { authFetch } from '@/app/lib/api';
import { Stack, useRouter } from 'expo-router';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
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
  reps: string;
  weight: string;
  completed: boolean;
}

interface WorkoutExercise {
  exercise: Exercise;
  sets: WorkoutSet[];
}

interface WorkoutPayload {
  name: string;
  exercises: {
    exercise: Exercise;
    sets: {
      reps: number;
      weight: number;
      completed: boolean;
    }[];
  }[];
}

interface PagedResponse<T> {
  count: number;
  page: number;
  limit: number;
  results: T[];
}

const FALLBACK_IMAGE_URL = 'https://placehold.co/240x240/png?text=Exercise';
const LIMIT = 80;

type ExerciseLibraryCardProps = {
  item: Exercise;
  onAddExercise: (exercise: Exercise) => void;
  onImageError: (exerciseId: number) => void;
};

const ExerciseLibraryCard = memo(function ExerciseLibraryCard({
  item,
  onAddExercise,
  onImageError,
}: ExerciseLibraryCardProps) {
  return (
    <View style={styles.libraryCard}>
      <View style={styles.libraryImageWrap}>
        <Image
          source={{ uri: item.imageUrl ?? FALLBACK_IMAGE_URL }}
          style={styles.libraryExerciseImage}
          resizeMode="cover"
          onError={() => onImageError(item.id)}
        />
      </View>

      <View style={styles.libraryCardBody}>
        <Text numberOfLines={2} style={styles.libraryCardTitle}>
          {item.name || 'No Name'}
        </Text>
        <Text numberOfLines={1} style={styles.libraryCardSub}>
          {item.category || 'Unknown muscle'}
        </Text>

        <View style={styles.libraryCardActions}>
          <Pressable
            style={({ pressed, hovered }) => [
              styles.smallBtn,
              styles.addBtn,
              (pressed || hovered) && styles.addBtnActive,
            ]}
            onPress={() => onAddExercise(item)}
          >
            <Text style={styles.smallBtnText}>Add</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
});

type SelectedExerciseCardProps = {
  item: WorkoutExercise;
  onImageError: (exerciseId: number) => void;
  onUpdateSetReps: (exerciseId: number, setIndex: number, reps: string) => void;
  onUpdateSetWeight: (
    exerciseId: number,
    setIndex: number,
    weight: string
  ) => void;
  onToggleSetCompleted: (exerciseId: number, setIndex: number) => void;
  onAddSet: (exerciseId: number) => void;
  onRemoveSet: (exerciseId: number, setIndex: number) => void;
  onRemoveExercise: (exerciseId: number) => void;
};

const SelectedExerciseCard = memo(function SelectedExerciseCard({
  item,
  onImageError,
  onUpdateSetReps,
  onUpdateSetWeight,
  onToggleSetCompleted,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
}: SelectedExerciseCardProps) {
  return (
    <View style={styles.selectedCard}>
      <View style={styles.selectedImageWrap}>
        <Image
          source={{ uri: item.exercise.imageUrl ?? FALLBACK_IMAGE_URL }}
          style={styles.selectedExerciseImage}
          resizeMode="cover"
          onError={() => onImageError(item.exercise.id)}
        />
      </View>

      <View style={styles.selectedCardBody}>
        <Text numberOfLines={2} style={styles.selectedCardTitle}>
          {item.exercise.name || 'No Name'}
        </Text>
        <Text numberOfLines={1} style={styles.selectedCardSub}>
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
              value={set.reps}
              onChangeText={(text) =>
                onUpdateSetReps(item.exercise.id, setIndex, text)
              }
            />

            <TextInput
              style={styles.smallInput}
              placeholder="KG"
              placeholderTextColor={COLORS.MUTED}
              keyboardType="numeric"
              value={set.weight}
              onChangeText={(text) =>
                onUpdateSetWeight(item.exercise.id, setIndex, text)
              }
            />

            <Pressable
              style={styles.checkboxContainer}
              onPress={() => onToggleSetCompleted(item.exercise.id, setIndex)}
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
              onPress={() => onRemoveSet(item.exercise.id, setIndex)}
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
          onPress={() => onAddSet(item.exercise.id)}
        >
          <Text style={styles.addSetBtnText}>+ Add Set</Text>
        </Pressable>

        <View style={styles.selectedCardActions}>
          <Pressable
            style={({ pressed, hovered }) => [
              styles.smallBtn,
              styles.removeBtn,
              (pressed || hovered) && styles.removeBtnActive,
            ]}
            onPress={() => onRemoveExercise(item.exercise.id)}
          >
            <Text style={styles.smallBtnText}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
});

export default function AddWorkoutScreen() {
  const router = useRouter();

  const [workoutName, setWorkoutName] = useState('');
  const [myWorkout, setMyWorkout] = useState<WorkoutExercise[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [filterText, setFilterText] = useState('');

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadingGuard = useRef(false);

  const canLoadMore = total === null || exercises.length < total;

  const loadPage = async (p: number, q?: string) => {
  if (loadingGuard.current) return;
  if (p !== 1 && !canLoadMore) return;

  loadingGuard.current = true;
  p === 1 ? setLoadingInitial(true) : setLoadingMore(true);

  try {
    const query = (q ?? '').trim();

    const endpoint =
      query.length > 0
        ? `/api/workouts/exercises?page=${p}&limit=${LIMIT}&q=${encodeURIComponent(query)}`
        : `/api/workouts/exercises?page=${p}&limit=${LIMIT}`;

    const res = await authFetch(endpoint);

    if (!res.ok) {
      const errText = await res.text();
      console.error('Fetch exercises failed:', res.status, errText);
      return;
    }

    const data: PagedResponse<Exercise> = await res.json();

    if (!data || !Array.isArray(data.results)) {
      console.error('Unexpected paged exercises response', data);
      return;
    }

    setTotal(data.count);
    setPage(data.page);

    setExercises((prev) => {
      const next = p === 1 ? [] : prev;
      const map = new Map<number, Exercise>(next.map((e) => [e.id, e]));
      for (const e of data.results) map.set(e.id, e);
      return Array.from(map.values());
    });
  } catch (err) {
    console.error('Fetch exercises error:', err);
  } finally {
    p === 1 ? setLoadingInitial(false) : setLoadingMore(false);
    loadingGuard.current = false;
  }
};

  useEffect(() => {
    loadPage(1);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setTotal(null);
      setPage(1);
      loadPage(1, filterText);
    }, 250);

    return () => clearTimeout(t);
  }, [filterText]);

  const addExercise = (exercise: Exercise) => {
    const exists = myWorkout.some((e) => e.exercise.id === exercise.id);
    if (!exists) {
      setMyWorkout((prev) => [
        ...prev,
        {
          exercise,
          sets: [{ reps: '', weight: '', completed: false }],
        },
      ]);
    }
  };

  const removeExercise = (exerciseId: number) => {
    setMyWorkout((prev) => prev.filter((e) => e.exercise.id !== exerciseId));
  };

  const addSet = (exerciseId: number) => {
    setMyWorkout((prev) =>
      prev.map((item) =>
        item.exercise.id === exerciseId
          ? {
              ...item,
              sets: [...item.sets, { reps: '', weight: '', completed: false }],
            }
          : item
      )
    );
  };

  const removeSet = (exerciseId: number, setIndex: number) => {
    setMyWorkout((prev) =>
      prev.map((item) => {
        if (item.exercise.id !== exerciseId) return item;

        const updatedSets = item.sets.filter((_, index) => index !== setIndex);

        return {
          ...item,
          sets:
            updatedSets.length > 0
              ? updatedSets
              : [{ reps: '', weight: '', completed: false }],
        };
      })
    );
  };

  const updateSetReps = (
    exerciseId: number,
    setIndex: number,
    reps: string
  ) => {
    setMyWorkout((prev) =>
      prev.map((item) =>
        item.exercise.id === exerciseId
          ? {
              ...item,
              sets: item.sets.map((set, index) =>
                index === setIndex ? { ...set, reps } : set
              ),
            }
          : item
      )
    );
  };

  const updateSetWeight = (
    exerciseId: number,
    setIndex: number,
    weight: string
  ) => {
    setMyWorkout((prev) =>
      prev.map((item) =>
        item.exercise.id === exerciseId
          ? {
              ...item,
              sets: item.sets.map((set, index) =>
                index === setIndex ? { ...set, weight } : set
              ),
            }
          : item
      )
    );
  };

  const toggleSetCompleted = (exerciseId: number, setIndex: number) => {
    setMyWorkout((prev) =>
      prev.map((item) =>
        item.exercise.id === exerciseId
          ? {
              ...item,
              sets: item.sets.map((set, index) =>
                index === setIndex
                  ? { ...set, completed: !set.completed }
                  : set
              ),
            }
          : item
      )
    );
  };

  const finishWorkout = async () => {
    const name = workoutName.trim();
    if (!name) return alert('Enter a workout name');
    if (myWorkout.length === 0) return alert('Add at least one exercise');

    const payload: WorkoutPayload = {
      name,
      exercises: myWorkout.map((item) => ({
        exercise: item.exercise,
        sets: item.sets.map((set) => ({
          reps: Number(set.reps) || 0,
          weight: Number(set.weight) || 0,
          completed: set.completed,
        })),
      })),
    };

    try {
      const res = await authFetch('/api/workouts/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('Save workout failed:', err);
        alert('Save failed. Check backend logs.');
        return;
      }

      setMyWorkout([]);
      setWorkoutName('');
      router.back();
    } catch (err) {
      console.error('Save workout error:', err);
      alert('Save failed. Check connection.');
    }
  };

  const filteredExercises = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter((e) => (e.name ?? '').toLowerCase().includes(q));
  }, [exercises, filterText]);

  const handleLibraryImageError = (exerciseId: number) => {
    setExercises((prev) =>
      prev.map((e) =>
        e.id === exerciseId ? { ...e, imageUrl: FALLBACK_IMAGE_URL } : e
      )
    );
  };

  const handleSelectedImageError = (exerciseId: number) => {
    setMyWorkout((prev) =>
      prev.map((e) =>
        e.exercise.id === exerciseId
          ? {
              ...e,
              exercise: {
                ...e.exercise,
                imageUrl: FALLBACK_IMAGE_URL,
              },
            }
          : e
      )
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Workout</Text>

      <Text style={styles.label}>Workout name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Push Day"
        placeholderTextColor={COLORS.MUTED}
        value={workoutName}
        onChangeText={setWorkoutName}
      />

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>My exercises</Text>
        <Text style={styles.badge}>{myWorkout.length}</Text>
      </View>

      <FlatList
        data={myWorkout}
        keyExtractor={(item) => item.exercise.id.toString()}
        renderItem={({ item }) => (
          <SelectedExerciseCard
            item={item}
            onImageError={handleSelectedImageError}
            onUpdateSetReps={updateSetReps}
            onUpdateSetWeight={updateSetWeight}
            onToggleSetCompleted={toggleSetCompleted}
            onAddSet={addSet}
            onRemoveSet={removeSet}
            onRemoveExercise={removeExercise}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No exercises added yet.</Text>
        }
        contentContainerStyle={
          myWorkout.length === 0 ? { flexGrow: 1 } : undefined
        }
      />

      <View style={styles.footerRow}>
        <Pressable
          style={({ pressed, hovered }) => [
            styles.secondaryBtn,
            (pressed || hovered) && styles.secondaryBtnActive,
          ]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.secondaryBtnText}>Add exercises</Text>
        </Pressable>

        <Pressable
          style={({ pressed, hovered }) => [
            styles.primaryBtn,
            (pressed || hovered) && styles.primaryBtnActive,
          ]}
          onPress={finishWorkout}
        >
          <Text style={styles.primaryBtnText}>Save workout</Text>
        </Pressable>
      </View>

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Exercise library</Text>
              <Pressable
                style={({ pressed, hovered }) => [
                  styles.modalClose,
                  (pressed || hovered) && styles.secondaryBtnActive,
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Search exercises..."
              placeholderTextColor={COLORS.MUTED}
              value={filterText}
              onChangeText={setFilterText}
            />

            {loadingInitial ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator />
                <Text style={styles.loadingText}>Loading exercises…</Text>
              </View>
            ) : (
              <FlatList
                data={filteredExercises}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <ExerciseLibraryCard
                    item={item}
                    onAddExercise={addExercise}
                    onImageError={handleLibraryImageError}
                  />
                )}
                onEndReached={() => {
                  if (canLoadMore && !loadingMore) loadPage(page + 1, filterText);
                }}
                onEndReachedThreshold={0.6}
                ListFooterComponent={
                  loadingMore ? (
                    <View style={styles.footerLoading}>
                      <ActivityIndicator />
                      <Text style={styles.loadingText}>Loading more…</Text>
                    </View>
                  ) : (
                    <View style={styles.footerHint}>
                      <Text style={styles.footerHintText}>
                        {total !== null
                          ? `${filteredExercises.length} / ${total} loaded`
                          : `${filteredExercises.length} loaded`}
                      </Text>
                    </View>
                  )
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG, padding: 18 },

  header: {
    color: COLORS.TEXT,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 10,
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
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
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

  libraryCard: {
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 12,
  },
  libraryImageWrap: {
    width: 92,
    alignSelf: 'stretch',
    backgroundColor: '#141414',
    borderRightWidth: 1,
    borderRightColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  libraryExerciseImage: {
    width: 74,
    height: 74,
    borderRadius: 12,
    backgroundColor: '#0B0B0B',
  },
  libraryCardBody: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  libraryCardTitle: {
    color: COLORS.TEXT,
    fontSize: 14,
    fontWeight: '900',
  },
  libraryCardSub: {
    color: COLORS.MUTED,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '800',
    marginBottom: 8,
  },
  libraryCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  selectedCard: {
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
  selectedImageWrap: {
    width: 104,
    alignSelf: 'stretch',
    backgroundColor: '#141414',
    borderRightWidth: 1,
    borderRightColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 14,
    paddingBottom: 10,
  },
  selectedExerciseImage: {
    width: 86,
    height: 86,
    borderRadius: 12,
    backgroundColor: '#0B0B0B',
  },
  selectedCardBody: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  selectedCardTitle: {
    color: COLORS.TEXT,
    fontSize: 17,
    fontWeight: '900',
  },
  selectedCardSub: {
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
  selectedCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
  },

  smallBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  addBtn: { backgroundColor: COLORS.ACCENT },
  removeBtn: { backgroundColor: COLORS.DANGER },
  addBtnActive: { backgroundColor: '#2d69c5' },
  removeBtnActive: { backgroundColor: '#d64233' },

  smallBtnText: {
    color: COLORS.ACCENT_TEXT,
    fontWeight: '900',
    fontSize: 12,
  },

  footerRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 10,
    paddingBottom: 8,
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: COLORS.ACCENT,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnActive: {
    backgroundColor: '#2d69c5',
  },

  primaryBtnText: {
    color: COLORS.ACCENT_TEXT,
    fontWeight: '900',
    fontSize: 15,
  },

  secondaryBtn: {
    flex: 1,
    backgroundColor: COLORS.CARD_2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryBtnActive: {
    backgroundColor: '#1f1f1f',
  },

  secondaryBtnText: {
    color: COLORS.TEXT,
    fontWeight: '900',
    fontSize: 15,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },

  modal: {
    width: '82%',
    maxHeight: '80%',
    backgroundColor: COLORS.BG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 18,
    padding: 14,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  modalTitle: {
    color: COLORS.TEXT,
    fontSize: 18,
    fontWeight: '900',
  },

  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.CARD_2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalCloseText: {
    color: COLORS.TEXT,
    fontSize: 22,
    fontWeight: '900',
    marginTop: -2,
  },

  loadingWrap: {
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  loadingText: {
    color: COLORS.MUTED,
    fontSize: 12,
    fontWeight: '800',
  },

  footerLoading: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  footerHint: {
    paddingVertical: 12,
    alignItems: 'center',
  },

  footerHintText: {
    color: COLORS.MUTED,
    fontSize: 12,
    fontWeight: '800',
  },
});