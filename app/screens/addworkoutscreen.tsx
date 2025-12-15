import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

const COLORS = {
  BACKGROUND_DARK: '#1E1E1E',
  TEXT_LIGHT: '#FFFFFF',
};

export const layout = () => <Stack screenOptions={{
        headerShown: false,
      }} />;

export default function AddWorkoutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Add your workout here!</Text>
    </View>
  );
}

// Hide the header using Expo Router's static property
AddWorkoutScreen.options = {
  headerShown: false,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND_DARK, justifyContent: 'center', alignItems: 'center' },
  text: { color: COLORS.TEXT_LIGHT, fontSize: 20, fontWeight: 'bold' },
});
