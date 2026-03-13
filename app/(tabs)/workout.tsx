import Entypo from '@expo/vector-icons/Entypo';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = {
  BG: '#121212',
  CARD: '#1E1E1E',
  CARD_2: '#242424',
  BORDER: '#2E2E2E',
  TEXT: '#FFFFFF',
  MUTED: '#A9A9A9',
  ACCENT: '#357be6',
  ACCENT_TEXT: '#FFFFFF',
};

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Workout</Text>
        <Text style={styles.topSubtitle}>Start a workout or manage routines</Text>
      </View>

      {/* Primary Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.iconCircle}>
            <Entypo name="plus" size={18} color={COLORS.ACCENT_TEXT} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Start a workout</Text>
            <Text style={styles.cardSub}>
              Build a workout from the exercise library.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/screens/addworkoutscreen')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Start Empty Workout</Text>
        </TouchableOpacity>
      </View>

      {/* Routines Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.iconCircleAlt}>
            <Entypo name="book" size={18} color={COLORS.TEXT} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Routines</Text>
            <Text style={styles.cardSub}>
              Save templates to reuse later.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/screens/addroutinescreen')}
        >
          <View style={styles.btnRow}>
            <Entypo name="book" size={18} color={COLORS.TEXT} />
            <Text style={styles.secondaryBtnText}>New Routine</Text>
          </View>
        </TouchableOpacity>

        {/* Optional: small note */}
        <Text style={styles.noteText}>
          Tip: create routines for Push/Pull/Legs.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG, padding: 18 },

  topBar: {
    paddingTop: 14,
    paddingBottom: 16,
    marginBottom: 12,
  },

  topTitle: {
    color: COLORS.TEXT,
    fontSize: 28,
    fontWeight: '900',
  },

  topSubtitle: {
    marginTop: 4,
    color: COLORS.MUTED,
    fontSize: 13,
    fontWeight: '700',
  },

  card: {
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },

  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },

  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconCircleAlt: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.CARD_2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTitle: {
    color: COLORS.TEXT,
    fontSize: 16,
    fontWeight: '900',
  },

  cardSub: {
    marginTop: 4,
    color: COLORS.MUTED,
    fontSize: 12,
    fontWeight: '700',
  },

  primaryBtn: {
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
    backgroundColor: COLORS.CARD_2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  secondaryBtnText: {
    color: COLORS.TEXT,
    fontWeight: '900',
    fontSize: 15,
  },

  noteText: {
    marginTop: 10,
    color: COLORS.MUTED,
    fontSize: 12,
    fontWeight: '700',
  },
});