import { authFetch } from '@/app/lib/api';
import { Stack, useRouter } from 'expo-router';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
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
  reps: string;
  weight: string;
}

interface RoutineExercise {
  exercise: Exercise;
  sets: RoutineSet[];
}

interface RoutinePayload {
  name: string;
  exercises: {
    exercise: Exercise;
    sets: {
      reps: number;
      weight: number;
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
    <View style={styles.card}>
      <Image
        source={{ uri: item.imageUrl ?? FALLBACK_IMAGE_URL }}
        style={styles.exerciseImage}
        resizeMode="cover"
        onError={() => onImageError(item.id)}
      />

      <View style={styles.cardBody}>
        <Text numberOfLines={2} style={styles.cardTitle}>
          {item.name || 'No Name'}
        </Text>
        <Text numberOfLines={1} style={styles.cardSub}>
          {item.category || 'Unknown muscle'}
        </Text>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.smallBtn, styles.addBtn]}
            onPress={() => onAddExercise(item)}
            activeOpacity={0.85}
          >
            <Text style={styles.smallBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

type SelectedRoutineExerciseCardProps = {
  item: RoutineExercise;
  onImageError: (exerciseId: number) => void;
  onUpdateSetReps: (exerciseId: number, setIndex: number, reps: string) => void;
  onUpdateSetWeight: (exerciseId: number, setIndex: number, weight: string) => void;
  onAddSet: (exerciseId: number) => void;
  onRemoveSet: (exerciseId: number, setIndex: number) => void;
  onRemoveExercise: (exerciseId: number) => void;
};

const SelectedRoutineExerciseCard = memo(function SelectedRoutineExerciseCard({
  item,
  onImageError,
  onUpdateSetReps,
  onUpdateSetWeight,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
}: SelectedRoutineExerciseCardProps) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: item.exercise.imageUrl ?? FALLBACK_IMAGE_URL }}
        style={styles.exerciseImage}
        resizeMode="cover"
        onError={() => onImageError(item.exercise.id)}
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

            <TouchableOpacity
              style={styles.removeSetBtn}
              onPress={() => onRemoveSet(item.exercise.id, setIndex)}
              activeOpacity={0.85}
            >
              <Text style={styles.removeSetText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.cardActionsBetween}>
          <TouchableOpacity
            style={styles.addSetBtn}
            onPress={() => onAddSet(item.exercise.id)}
            activeOpacity={0.85}
          >
            <Text style={styles.addSetBtnText}>+ Add Set</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallBtn, styles.removeBtn]}
            onPress={() => onRemoveExercise(item.exercise.id)}
            activeOpacity={0.85}
          >
            <Text style={styles.smallBtnText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

export default function AddRoutineScreen() {
  const router = useRouter();

  const [routineName, setRoutineName] = useState('');
  const [myRoutine, setMyRoutine] = useState<RoutineExercise[]>([]);

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

      const res = await authFetch(endpoint, { method: 'GET' });

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
    const exists = myRoutine.some((e) => e.exercise.id === exercise.id);
    if (!exists) {
      setMyRoutine((prev) => [
        ...prev,
        {
          exercise,
          sets: [{ reps: '', weight: '' }],
        },
      ]);
    }
  };

  const removeExercise = (exerciseId: number) => {
    setMyRoutine((prev) => prev.filter((e) => e.exercise.id !== exerciseId));
  };

  const addSet = (exerciseId: number) => {
    setMyRoutine((prev) =>
      prev.map((item) =>
        item.exercise.id === exerciseId
          ? {
              ...item,
              sets: [...item.sets, { reps: '', weight: '' }],
            }
          : item
      )
    );
  };

  const removeSet = (exerciseId: number, setIndex: number) => {
    setMyRoutine((prev) =>
      prev.map((item) => {
        if (item.exercise.id !== exerciseId) return item;

        const updatedSets = item.sets.filter((_, index) => index !== setIndex);
        return {
          ...item,
          sets: updatedSets.length > 0 ? updatedSets : [{ reps: '', weight: '' }],
        };
      })
    );
  };

  const updateSetReps = (exerciseId: number, setIndex: number, reps: string) => {
    setMyRoutine((prev) =>
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

  const updateSetWeight = (exerciseId: number, setIndex: number, weight: string) => {
    setMyRoutine((prev) =>
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

  const saveRoutine = async () => {
    const name = routineName.trim();
    if (!name) return alert('Enter a routine name');
    if (myRoutine.length === 0) return alert('Add at least one exercise');

    const payload: RoutinePayload = {
      name,
      exercises: myRoutine.map((item) => ({
        exercise: item.exercise,
        sets: item.sets.map((set) => ({
          reps: Number(set.reps) || 0,
          weight: Number(set.weight) || 0,
        })),
      })),
    };

    try {
      const res = await authFetch('/api/routines', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('Save routine failed:', res.status, err);
        alert('Save failed.');
        return;
      }

      setMyRoutine([]);
      setRoutineName('');
      router.back();
    } catch (err) {
      console.error('Save routine error:', err);
      alert('Save failed. Check backend connection.');
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
    setMyRoutine((prev) =>
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
      <Text style={styles.header}>Create Routine</Text>

      <Text style={styles.label}>Routine name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Push Day Routine"
        placeholderTextColor={COLORS.MUTED}
        value={routineName}
        onChangeText={setRoutineName}
      />

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Routine exercises</Text>
        <Text style={styles.badge}>{myRoutine.length}</Text>
      </View>

      <FlatList
        data={myRoutine}
        keyExtractor={(item) => item.exercise.id.toString()}
        renderItem={({ item }) => (
          <SelectedRoutineExerciseCard
            item={item}
            onImageError={handleSelectedImageError}
            onUpdateSetReps={updateSetReps}
            onUpdateSetWeight={updateSetWeight}
            onAddSet={addSet}
            onRemoveSet={removeSet}
            onRemoveExercise={removeExercise}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No exercises added yet.</Text>
        }
        contentContainerStyle={myRoutine.length === 0 ? { flexGrow: 1 } : undefined}
      />

      <View style={styles.footerRow}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>Add exercises</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={saveRoutine}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Save routine</Text>
        </TouchableOpacity>
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
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
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
                  if (canLoadMore && !loadingMore) {
                    loadPage(page + 1, filterText);
                  }
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

  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },

  cardActionsBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },

  smallBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  addBtn: { backgroundColor: COLORS.ACCENT },
  removeBtn: { backgroundColor: COLORS.DANGER },

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