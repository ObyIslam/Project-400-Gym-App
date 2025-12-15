import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import { useRouter } from 'expo-router';


const COLORS = {
  BACKGROUND_DARK: '#1E1E1E',
  CONTENT_CARD: '#333333',
  TEXT_LIGHT: '#FFFFFF',
  BUTTON_BG: '#357be6',
  BUTTON_TEXT: '#FFFFFF',
};

export default function HomeScreen() {
    const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.titleBar}>
        <Text style={styles.titleText}>Workout Page</Text>
      </View>
      {/* Workout Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.buttonWorkout} onPress={() => router.push('/screens/addworkoutscreen')}>
          <Text style={styles.buttonText}>Start Empty Workout</Text>
        </TouchableOpacity>
      </View>

      {/* Routines Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Routines</Text>
        <TouchableOpacity style={styles.button}>
          <View style={styles.buttonContent}>
            <Entypo name="book" size={20} color={COLORS.BUTTON_TEXT} />
            <Text style={[styles.buttonText, { marginLeft: 10 }]}>New Routine</Text>
          </View>
        </TouchableOpacity>
      </View>
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
  section: {
    marginBottom: 40,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_LIGHT,
    marginBottom: 15,
  },
  buttonText: {
    color: COLORS.BUTTON_TEXT,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft:10,
  },
  buttonWorkout: {
    marginTop: 50,
    backgroundColor: COLORS.BUTTON_BG,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    width: 220,
  },

  button: {
    backgroundColor: COLORS.BUTTON_BG,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    width: 220,
    
  },

  buttonContent: {
    flexDirection: 'row', 
    textAlign: 'center',
    justifyContent: 'center',
},

});