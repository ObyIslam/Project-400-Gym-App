import Entypo from '@expo/vector-icons/Entypo';
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
};

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Entypo name="user" size={36} color={COLORS.TEXT} />
        </View>
        <Text style={styles.name}>Your Profile</Text>
        <Text style={styles.subText}>Track progress and stay consistent</Text>
      </View>

      {/* Stats Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Stats</Text>

        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Routines</Text>
          </View>
        </View>
      </View>

      {/* Actions Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Settings</Text>

        <TouchableOpacity style={styles.actionRow} activeOpacity={0.8}>
          <Entypo name="cog" size={18} color={COLORS.TEXT} />
          <Text style={styles.actionText}>Account Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow} activeOpacity={0.8}>
          <Entypo name="bar-graph" size={18} color={COLORS.TEXT} />
          <Text style={styles.actionText}>Progress Tracking</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow} activeOpacity={0.8}>
          <Entypo name="log-out" size={18} color="#E74C3C" />
          <Text style={[styles.actionText, { color: '#E74C3C' }]}>
            Log Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
    padding: 18,
  },

  header: {
    alignItems: 'center',
    marginBottom: 20,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  name: {
    color: COLORS.TEXT,
    fontSize: 22,
    fontWeight: '900',
  },

  subText: {
    marginTop: 4,
    color: COLORS.MUTED,
    fontSize: 13,
    fontWeight: '600',
  },

  card: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 16,
    marginBottom: 16,
  },

  cardTitle: {
    color: COLORS.TEXT,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 14,
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statBox: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    color: COLORS.TEXT,
    fontSize: 20,
    fontWeight: '900',
  },

  statLabel: {
    marginTop: 4,
    color: COLORS.MUTED,
    fontSize: 12,
    fontWeight: '600',
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    gap: 12,
  },

  actionText: {
    color: COLORS.TEXT,
    fontSize: 14,
    fontWeight: '700',
  },
});