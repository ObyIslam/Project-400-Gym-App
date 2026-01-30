import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';

const COLORS = {
  BACKGROUND_DARK: '#1E1E1E',
  CONTENT_CARD: '#333333',
  TEXT_LIGHT: '#FFFFFF',
};

interface Exercise {
  id: number;
  name: string;
  type: string;
}

interface Workout {
  id: number;
  name: string | null;
  exercises: Exercise[];
}

export default function HomeScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/workouts/user')
      .then((res) => res.json())
      .then((data: Workout[]) => {
        setWorkouts(data);
      })
      .catch((err) => console.error('Error fetching workouts:', err));
  }, []);

  const renderExercise = ({ item }: { item: Exercise }) => (
    <Text style={styles.exerciseText}>
      - {item.name} ({item.type})
    </Text>
  );

  const renderWorkout = ({ item, index }: { item: Workout; index: number }) => (
    <View style={styles.workoutCard}>
      <Text style={styles.workoutTitle}>
        {item.name ? item.name : `Workout ${index + 1}`}
      </Text>
      <FlatList
        data={item.exercises}
        keyExtractor={(ex) => ex.id.toString()}
        renderItem={renderExercise}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Title Bar */}
      <View style={styles.titleBar}>
        <Text style={styles.titleText}>Profile Page</Text>
      </View>

      {/* Workouts */}
      <ScrollView style={styles.workoutsContainer}>
        <Text style={styles.pageTitle}>Previous Workouts</Text>
        <FlatList
          data={workouts}
          keyExtractor={(w) => w.id.toString()}
          renderItem={renderWorkout}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No workouts logged yet.</Text>
          }
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_DARK,
  },
  titleBar: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.CONTENT_CARD,
    borderBottomWidth: 1,
    paddingTop: 10,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_LIGHT,
    marginBottom: 10,
  },
  workoutsContainer: {
    flex: 1,
    padding: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.TEXT_LIGHT,
    marginBottom: 15,
  },
  workoutCard: {
    backgroundColor: COLORS.CONTENT_CARD,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_LIGHT,
    marginBottom: 8,
  },
  exerciseText: {
    color: COLORS.TEXT_LIGHT,
    fontSize: 16,
    marginLeft: 5,
    marginBottom: 4,
  },
  emptyText: {
    color: COLORS.TEXT_LIGHT,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
});
