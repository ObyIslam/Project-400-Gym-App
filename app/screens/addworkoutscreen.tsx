import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const COLORS = {
  BACKGROUND: '#1E1E1E',
  CARD: '#2A2A2A',
  TEXT: '#FFFFFF',
  BUTTON_BG: '#357be6',
  BUTTON_TEXT: '#FFFFFF',
  REMOVE_BG: '#E74C3C',
};

export const layout = () => <Stack screenOptions={{ headerShown: false }} />;

interface Exercise {
  id: number;
  name: string;
  category: string;
  description?: string | null;
  gifUrl?: string | null; 
}

interface WorkoutPayload {
  name: string;
  exercises: Exercise[];
}

export default function AddWorkoutScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [myWorkout, setMyWorkout] = useState<Exercise[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [workoutName, setWorkoutName] = useState('');

  const router = useRouter();
  const API_BASE = 'http://localhost:8080';

  useEffect(() => {
    fetch(`${API_BASE}/api/workouts/exercises`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setExercises(data);
        else console.error('Unexpected data format', data);
      })
      .catch((err) => console.error('Fetch exercises error:', err));
  }, []);

  const addExercise = (exercise: Exercise) => {
    if (!myWorkout.find((e) => e.id === exercise.id)) {
      setMyWorkout([...myWorkout, exercise]);
    }
  };

  const removeExercise = (id: number) => {
    setMyWorkout(myWorkout.filter((e) => e.id !== id));
  };

  const finishWorkout = () => {
    if (!workoutName) return alert('Please enter a workout name!');
    if (myWorkout.length === 0) return alert('Add at least one exercise!');

    const payload: WorkoutPayload = { name: workoutName, exercises: myWorkout };

    fetch(`${API_BASE}/api/workouts/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => {
        setMyWorkout([]);
        setWorkoutName('');
        router.back();
      })
      .catch((err) => console.error('Save error:', err));
  };

  const filteredExercises = exercises.filter(
    (e) => e.name && e.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const renderExerciseCard = (item: Exercise, showRemove = false) => (
    <View style={styles.card}>
      {item.gifUrl ? (
        <Image
          source={{ uri: item.gifUrl }}
          style={{ width: 200, height: 200 }}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={{ color: '#aaa' }}>No Image</Text>
        </View>
      )}

      <Text style={styles.cardText}>{item.name || 'No Name'}</Text>
      <Text style={styles.categoryText}>{item.category || 'No Category'}</Text>

      {item.description && (
        <ScrollView style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{item.description}</Text>
        </ScrollView>
      )}

      {showRemove && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeExercise(item.id)}
        >
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout Name</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Enter workout name..."
        placeholderTextColor="#aaa"
        value={workoutName}
        onChangeText={setWorkoutName}
      />

      <Text style={styles.title}>My Exercises</Text>
      <FlatList
        data={myWorkout}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => renderExerciseCard(item, true)}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No exercises added yet.</Text>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.finishText}>Add Exercise</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>All Exercises</Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Search exercise..."
              placeholderTextColor="#aaa"
              value={filterText}
              onChangeText={setFilterText}
            />

            <FlatList
              data={filteredExercises}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => addExercise(item)}>
                  {renderExerciseCard(item)}
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.finishButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.finishText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={[styles.finishButton, { marginTop: 20 }]}
        onPress={finishWorkout}
      >
        <Text style={styles.finishText}>Finish Workout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.TEXT, marginVertical: 10 },
  card: { backgroundColor: COLORS.CARD, padding: 15, marginBottom: 12, borderRadius: 12 },
  cardText: { color: COLORS.TEXT, fontWeight: 'bold', fontSize: 16, marginTop: 6 },
  categoryText: { color: '#aaa', fontSize: 14, marginTop: 2 },
  descriptionContainer: { maxHeight: 100, marginTop: 6 },
  descriptionText: { color: '#ccc', fontSize: 14 },
  exerciseImage: { width: '100%', height: 160, borderRadius: 10 },
  imagePlaceholder: { width: '100%', height: 160, borderRadius: 10, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  removeButton: { backgroundColor: COLORS.REMOVE_BG, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, marginTop: 10, alignSelf: 'flex-start' },
  removeText: { color: COLORS.TEXT, fontWeight: 'bold' },
  finishButton: { backgroundColor: COLORS.BUTTON_BG, padding: 15, borderRadius: 10, alignItems: 'center' },
  finishText: { color: COLORS.BUTTON_TEXT, fontWeight: 'bold', fontSize: 16 },
  addButton: { backgroundColor: COLORS.BUTTON_BG, padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', maxHeight: '85%', backgroundColor: COLORS.BACKGROUND, borderRadius: 12, padding: 20 },
  modalTitle: { color: COLORS.TEXT, fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  searchInput: { backgroundColor: COLORS.CARD, color: COLORS.TEXT, padding: 10, borderRadius: 8, marginBottom: 10 },
  emptyText: { color: COLORS.TEXT, fontStyle: 'italic', textAlign: 'center' },
});