import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const COLORS = {
  BACKGROUND_DARK: '#1E1E1E', 
  CONTENT_CARD: '#333333',    
  TEXT_LIGHT: '#FFFFFF',          
};

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.titleBar}>
        <Text style={styles.titleText}>Profile Page</Text>
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

});