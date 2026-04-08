import { authFetch } from '@/app/lib/api';
import Entypo from '@expo/vector-icons/Entypo';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
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
  SUCCESS: '#2E8B57',
  WARNING: '#E49B0F',
  DANGER: '#E74C3C',
};

type ExerciseAnalysisResponse = {
  id: number;
  exerciseType: string;
  mediaType: string;
  status: string;
  originalFilename?: string | null;
  contentType?: string | null;
  fileSize?: number | null;
  cameraAngle?: string | null;
  createdAt?: string | null;
  processedAt?: string | null;
  overallScore?: number | null;
  strengths?: string[];
  improvements?: string[];
  metrics?: Record<string, unknown> | null;
};

export default function ExerciseAnalysisResultScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [analysis, setAnalysis] = useState<ExerciseAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalysis = useCallback(async () => {
    if (!id) return;

    try {
      const response = await authFetch(`/api/exercise-analysis/${id}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch exercise analysis:', response.status, errorText);
        return;
      }

      const data: ExerciseAnalysisResponse = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Failed to load exercise analysis:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalysis();
  };

  const renderMetricValue = (value: unknown) => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (typeof value === 'number') {
      return Number.isInteger(value) ? String(value) : value.toFixed(1);
    }

    if (value == null) {
      return '-';
    }

    return String(value);
  };

  const score = analysis?.overallScore ?? null;
  const scoreLabel = score == null ? 'Pending' : score >= 80 ? 'Strong' : score >= 60 ? 'Solid' : 'Needs work';
  const scoreColor = score == null ? COLORS.WARNING : score >= 80 ? COLORS.SUCCESS : score >= 60 ? COLORS.WARNING : COLORS.DANGER;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.TEXT} />
        <Text style={styles.loadingText}>Loading analysis...</Text>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>No analysis found.</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.actionBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.TEXT} />
        }
      >
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.85}>
            <Entypo name="chevron-left" size={18} color={COLORS.TEXT} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Analysis Result</Text>
            <Text style={styles.subtitle}>Review the uploaded exercise feedback.</Text>
          </View>
        </View>

        <View style={styles.scoreCard}>
          <View>
            <Text style={styles.scoreTitle}>{analysis.exerciseType.replace(/_/g, ' ')}</Text>
            <Text style={styles.scoreSub}>
              {analysis.mediaType} • {analysis.cameraAngle?.replace(/_/g, ' ') || 'Unknown angle'}
            </Text>
          </View>

          <View style={[styles.scoreBadge, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreNumber, { color: scoreColor }]}>{score ?? '--'}</Text>
            <Text style={[styles.scoreLabel, { color: scoreColor }]}>{scoreLabel}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Submission</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={styles.infoValue}>{analysis.status}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>File</Text>
            <Text style={styles.infoValue}>{analysis.originalFilename || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Content Type</Text>
            <Text style={styles.infoValue}>{analysis.contentType || '-'}</Text>
          </View>
          <View style={styles.infoRowLast}>
            <Text style={styles.infoLabel}>Uploaded</Text>
            <Text style={styles.infoValue}>{analysis.createdAt || '-'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What you did well</Text>
          {analysis.strengths && analysis.strengths.length > 0 ? (
            analysis.strengths.map((item, index) => (
              <View key={`${item}-${index}`} style={styles.feedbackRow}>
                <Entypo name="check" size={16} color={COLORS.SUCCESS} />
                <Text style={styles.feedbackText}>{item}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No strengths available yet.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Where to improve</Text>
          {analysis.improvements && analysis.improvements.length > 0 ? (
            analysis.improvements.map((item, index) => (
              <View key={`${item}-${index}`} style={styles.feedbackRow}>
                <Entypo name="warning" size={16} color={COLORS.WARNING} />
                <Text style={styles.feedbackText}>{item}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No improvement notes available yet.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Metrics</Text>
          {analysis.metrics && Object.keys(analysis.metrics).length > 0 ? (
            Object.entries(analysis.metrics).map(([key, value]) => (
              <View key={key} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{key}</Text>
                <Text style={styles.infoValue}>{renderMetricValue(value)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No metrics available yet.</Text>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  content: { padding: 18, paddingBottom: 28 },
  center: {
    flex: 1,
    backgroundColor: COLORS.BG,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: { color: COLORS.TEXT, marginTop: 12, fontSize: 14, fontWeight: '700' },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, paddingTop: 10 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: COLORS.TEXT, fontSize: 28, fontWeight: '900' },
  subtitle: { color: COLORS.MUTED, fontSize: 13, marginTop: 4, fontWeight: '700' },
  scoreCard: {
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  scoreTitle: { color: COLORS.TEXT, fontSize: 20, fontWeight: '900' },
  scoreSub: { color: COLORS.MUTED, fontSize: 12, marginTop: 6, fontWeight: '700' },
  scoreBadge: {
    minWidth: 92,
    borderWidth: 2,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: { fontSize: 28, fontWeight: '900' },
  scoreLabel: { fontSize: 12, fontWeight: '800', marginTop: 4 },
  card: {
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  cardTitle: { color: COLORS.TEXT, fontSize: 16, fontWeight: '900', marginBottom: 12 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  infoRowLast: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingTop: 10 },
  infoLabel: { color: COLORS.MUTED, fontSize: 13, fontWeight: '700', flex: 1 },
  infoValue: { color: COLORS.TEXT, fontSize: 13, fontWeight: '800', flex: 1, textAlign: 'right' },
  feedbackRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 12 },
  feedbackText: { color: COLORS.TEXT, fontSize: 13, lineHeight: 20, fontWeight: '700', flex: 1 },
  emptyText: { color: COLORS.MUTED, fontSize: 13, fontWeight: '700' },
  actionBtn: {
    marginTop: 18,
    backgroundColor: COLORS.ACCENT,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionBtnText: { color: COLORS.TEXT, fontSize: 14, fontWeight: '900' },
});
