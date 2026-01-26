import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

const COLORS = {
  BACKGROUND: '#1E1E1E',
  CARD: '#2A2A2A',
  TEXT: '#FFFFFF',
  BUTTON_BG: '#357be6',
  BUTTON_TEXT: '#FFFFFF',
  REMOVE_BG: '#E74C3C',
};

export const layout = () => <Stack screenOptions={{ headerShown: false }} />;

interface Workout {
  id: number;
  name: string;
  type: string;
}

export default function AddWorkoutScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [myWorkout, setMyWorkout] = useState<Workout[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterText, setFilterText] = useState('');

  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:8080/api/workouts')
      .then((res) => res.json())
      .then((data) => setWorkouts(data))
      .catch((err) => console.error(err));
  }, []);

  const addWorkout = (workout: Workout) => {
    if (!myWorkout.find((w) => w.id === workout.id)) {
      setMyWorkout([...myWorkout, workout]);
    }
  };

  const removeWorkout = (id: number) => {
    setMyWorkout(myWorkout.filter((w) => w.id !== id));
  };

  const filteredWorkouts = workouts.filter((w) =>
    w.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const renderMyWorkout = ({ item }: { item: Workout }) => (
    <View style={styles.cardRow}>
      <Text style={styles.cardText}>
        {item.name} ({item.type})
      </Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeWorkout(item.id)}
      >
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Workout</Text>
      <FlatList
        data={myWorkout}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMyWorkout}
        style={styles.list}
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
            <Text style={styles.modalTitle}>All Workouts</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercise..."
              placeholderTextColor="#aaa"
              value={filterText}
              onChangeText={setFilterText}
            />
            <FlatList
              data={filteredWorkouts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => addWorkout(item)}
                >
                  <Text style={styles.cardText}>
                    {item.name} ({item.type})
                  </Text>
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
        onPress={() => router.back()}
      >
        <Text style={styles.finishText}>Finish Workout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginVertical: 10,
  },
  list: { marginBottom: 20 },
  card: {
    backgroundColor: COLORS.CARD,
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  cardText: { color: COLORS.TEXT, fontWeight: 'bold', fontSize: 16 },
  cardRow: {
    backgroundColor: COLORS.CARD,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  removeButton: {
    backgroundColor: COLORS.REMOVE_BG,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  removeText: { color: COLORS.TEXT, fontWeight: 'bold' },
  finishButton: {
    backgroundColor: COLORS.BUTTON_BG,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  finishText: { color: COLORS.BUTTON_TEXT, fontWeight: 'bold', fontSize: 16 },
  addButton: {
    backgroundColor: COLORS.BUTTON_BG,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    color: COLORS.TEXT,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: COLORS.CARD,
    color: COLORS.TEXT,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  emptyText: { color: COLORS.TEXT, fontStyle: 'italic', textAlign: 'center' },
});
