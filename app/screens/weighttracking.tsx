import { authFetch } from '@/app/lib/api';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const COLORS = {
  BG: '#121212',
  CARD: '#1E1E1E',
  CARD_2: '#242424',
  BORDER: '#2E2E2E',
  TEXT: '#FFFFFF',
  MUTED: '#A9A9A9',
  ACCENT: '#357be6',
  DANGER: '#E74C3C',
};

type WeightEntry = {
  id: number;
  weightKg: number;
  entryDate: string;
  note: string | null;
};

const screenWidth = Dimensions.get('window').width;

export default function WeightTrackingScreen() {
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWeights = useCallback(async () => {
    try {
      const res = await authFetch('/api/profile/weights');

      if (!res.ok) {
        const err = await res.text();
        console.error('Fetch weights failed:', res.status, err);
        return;
      }

      const data: WeightEntry[] = await res.json();
      setWeights(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch weights error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadWeights();
    }, [loadWeights])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeights();
  };

  const deleteWeight = async (id: number) => {
    try {
      const res = await authFetch(`/api/profile/weights/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('Delete weight failed:', res.status, err);
        Alert.alert('Delete failed', 'Could not delete weight entry.');
        return;
      }

      setWeights((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Delete weight error:', err);
      Alert.alert('Delete failed', 'Could not delete weight entry.');
    }
  };

  const chartData = useMemo(() => {
    const labels = weights.map((item) => item.entryDate.slice(5));
    const data = weights.map((item) => item.weightKg);

    return {
      labels: labels.length > 0 ? labels : ['No Data'],
      datasets: [
        {
          data: data.length > 0 ? data : [0],
        },
      ],
    };
  }, [weights]);

  const latestWeight = weights.length > 0 ? weights[weights.length - 1].weightKg : null;
  const firstWeight = weights.length > 0 ? weights[0].weightKg : null;
  const totalChange =
    latestWeight != null && firstWeight != null
      ? Number((latestWeight - firstWeight).toFixed(1))
      : null;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Loading progress...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.TEXT}
        />
      }
    >
      <Text style={styles.title}>Weight Progress</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Latest</Text>
          <Text style={styles.summaryValue}>
            {latestWeight != null ? `${latestWeight} kg` : '-'}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Start</Text>
          <Text style={styles.summaryValue}>
            {firstWeight != null ? `${firstWeight} kg` : '-'}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Change</Text>
          <Text style={styles.summaryValue}>
            {totalChange != null
              ? `${totalChange > 0 ? '+' : ''}${totalChange} kg`
              : '-'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weight Graph</Text>

        {weights.length === 0 ? (
          <Text style={styles.emptyText}>No weight entries yet.</Text>
        ) : (
          <LineChart
            data={chartData}
            width={screenWidth - 52}
            height={220}
            yAxisSuffix="kg"
            chartConfig={{
              backgroundGradientFrom: COLORS.CARD,
              backgroundGradientTo: COLORS.CARD,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(53, 123, 230, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: COLORS.ACCENT,
              },
            }}
            bezier
            style={styles.chart}
          />
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>History</Text>

        {weights.length === 0 ? (
          <Text style={styles.emptyText}>No weight history yet.</Text>
        ) : (
          weights
            .slice()
            .reverse()
            .map((item) => (
              <View key={item.id} style={styles.historyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyWeight}>{item.weightKg} kg</Text>
                  <Text style={styles.historyDate}>{item.entryDate}</Text>
                  {!!item.note && <Text style={styles.historyNote}>{item.note}</Text>}
                </View>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteWeight(item.id)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  content: { padding: 18, paddingBottom: 30 },

  center: {
    flex: 1,
    backgroundColor: COLORS.BG,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: COLORS.MUTED,
    fontSize: 13,
    fontWeight: '700',
  },

  title: {
    color: COLORS.TEXT,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 18,
  },

  summaryCard: {
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  summaryItem: {
    flex: 1,
    backgroundColor: COLORS.CARD_2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingVertical: 12,
    alignItems: 'center',
  },

  summaryLabel: {
    color: COLORS.MUTED,
    fontSize: 12,
    fontWeight: '700',
  },

  summaryValue: {
    color: COLORS.TEXT,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
  },

  card: {
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  cardTitle: {
    color: COLORS.TEXT,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },

  chart: {
    borderRadius: 12,
  },

  emptyText: {
    color: COLORS.MUTED,
    fontSize: 13,
    fontWeight: '700',
  },

  historyRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },

  historyWeight: {
    color: COLORS.TEXT,
    fontSize: 15,
    fontWeight: '900',
  },

  historyDate: {
    color: COLORS.MUTED,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },

  historyNote: {
    color: COLORS.MUTED,
    fontSize: 12,
    marginTop: 4,
  },

  deleteBtn: {
    backgroundColor: COLORS.DANGER,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  deleteBtnText: {
    color: COLORS.TEXT,
    fontSize: 12,
    fontWeight: '800',
  },
});