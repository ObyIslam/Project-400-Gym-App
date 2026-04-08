import { authUpload } from '@/app/lib/api';
import Entypo from '@expo/vector-icons/Entypo';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image, Platform, ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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
};

type PickerAsset = {
  uri: string;
  type?: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  width?: number;
  height?: number;
  duration?: number | null;
};

const EXERCISE_OPTIONS = [
  'SQUAT',
  'DEADLIFT',
  'BENCH_PRESS',
  'LUNGE',
  'OVERHEAD_PRESS',
  'OTHER',
] as const;

const CAMERA_ANGLES = ['SIDE', 'FRONT', 'FORTY_FIVE', 'UNKNOWN'] as const;

export default function ExerciseAnalysisScreen() {
  const router = useRouter();
  const [selectedExercise, setSelectedExercise] = useState<(typeof EXERCISE_OPTIONS)[number]>('SQUAT');
  const [cameraAngle, setCameraAngle] = useState<(typeof CAMERA_ANGLES)[number]>('SIDE');
  const [media, setMedia] = useState<PickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);

  const mediaLabel = useMemo(() => {
    if (!media) return null;

    const sizeMb = media.fileSize ? `${(media.fileSize / (1024 * 1024)).toFixed(1)} MB` : null;
    const kind = media.type === 'video' ? 'Video' : 'Image';

    return [kind, sizeMb].filter(Boolean).join(' • ');
  }, [media]);

  const requestMedia = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to upload exercise media.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: false,
      quality: 1,
      videoMaxDuration: 20,
    });

    if (!result.canceled && result.assets.length > 0) {
      setMedia(result.assets[0] as PickerAsset);
    }
  };

  const buildMimeType = (asset: PickerAsset) => {
    if (asset.mimeType) return asset.mimeType;

    if (asset.type === 'video') return 'video/mp4';
    return 'image/jpeg';
  };

  const buildFileName = (asset: PickerAsset) => {
    if (asset.fileName) return asset.fileName;

    const extension = asset.type === 'video' ? 'mp4' : 'jpg';
    return `exercise-upload.${extension}`;
  };

  const handleUpload = async () => {
    if (!media) {
      Alert.alert('No media selected', 'Choose an image or video first.');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('exerciseType', selectedExercise);
      formData.append('mediaType', media.type === 'video' ? 'VIDEO' : 'IMAGE');
      formData.append('cameraAngle', cameraAngle);

      if (Platform.OS === 'web') {
        const response = await fetch(media.uri);
        const blob = await response.blob();
        formData.append('file', blob, buildFileName(media));
      } else {
        formData.append('file', {
          uri: media.uri,
          type: buildMimeType(media),
          name: buildFileName(media),
        } as any);
      }

      console.log('exerciseType', selectedExercise);
      console.log('mediaType', media.type === 'video' ? 'VIDEO' : 'IMAGE');
      console.log('cameraAngle', cameraAngle);
      console.log('file uri', media.uri);
      console.log('file type', buildMimeType(media));
      console.log('file name', buildFileName(media));

      const response = await authUpload('/api/exercise-analysis/upload', formData);

      console.log('upload response status', response.status);
      console.log('upload response ok', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('upload response text', errorText);
        throw new Error(errorText || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      router.push({
        pathname: '/screens/exercise-analysis-result/[id]' as any,
        params: { id: String(data.id) },
      });
    } catch (error: any) {
      console.error('Exercise analysis upload failed:', error);
      Alert.alert('Upload failed', error?.message || 'Could not upload exercise media.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Exercise Form Analysis</Text>
        <Text style={styles.subtitle}>
          Upload a clear image or short video and get feedback on your exercise form.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Entypo name="info" size={18} color={COLORS.TEXT} />
          </View>
          <Text style={styles.cardTitle}>Best upload tips</Text>
        </View>

        <Text style={styles.tip}>• Keep your full body in frame.</Text>
        <Text style={styles.tip}>• Use a side angle for squats and deadlifts.</Text>
        <Text style={styles.tip}>• Use good lighting and avoid shaky video.</Text>
        <Text style={styles.tip}>• Keep videos short, around 5 to 20 seconds.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Exercise</Text>
        <View style={styles.optionGrid}>
          {EXERCISE_OPTIONS.map((option) => {
            const selected = selectedExercise === option;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.optionChip, selected && styles.optionChipActive]}
                onPress={() => setSelectedExercise(option)}
                activeOpacity={0.85}
              >
                <Text style={[styles.optionChipText, selected && styles.optionChipTextActive]}>
                  {option.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Camera angle</Text>
        <View style={styles.optionGrid}>
          {CAMERA_ANGLES.map((option) => {
            const selected = cameraAngle === option;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.optionChip, selected && styles.optionChipActive]}
                onPress={() => setCameraAngle(option)}
                activeOpacity={0.85}
              >
                <Text style={[styles.optionChipText, selected && styles.optionChipTextActive]}>
                  {option.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderBetween}>
          <Text style={styles.cardTitle}>Selected media</Text>
          {media ? (
            <TouchableOpacity onPress={() => setMedia(null)} activeOpacity={0.85}>
              <Text style={styles.clearText}>Remove</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {media ? (
          <>
            {media.type === 'video' ? (
              <View style={styles.videoPreview}>
                <Entypo name="video-camera" size={40} color={COLORS.TEXT} />
                <Text style={styles.videoPreviewText}>Video selected</Text>
              </View>
            ) : (
              <Image source={{ uri: media.uri }} style={styles.previewImage} resizeMode="cover" />
            )}

            <Text style={styles.mediaName}>{media.fileName || 'exercise-upload'}</Text>
            {mediaLabel ? <Text style={styles.mediaMeta}>{mediaLabel}</Text> : null}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Entypo name="image" size={30} color={COLORS.MUTED} />
            <Text style={styles.emptyStateText}>No image or video selected yet.</Text>
          </View>
        )}

        <TouchableOpacity style={styles.secondaryBtn} onPress={requestMedia} activeOpacity={0.85}>
          <View style={styles.btnRow}>
            <Entypo name="upload" size={18} color={COLORS.TEXT} />
            <Text style={styles.secondaryBtnText}>Choose Image or Video</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, (!media || uploading) && styles.primaryBtnDisabled]}
        onPress={handleUpload}
        disabled={!media || uploading}
        activeOpacity={0.85}
      >
        {uploading ? (
          <View style={styles.btnRow}>
            <ActivityIndicator color={COLORS.TEXT} />
            <Text style={styles.primaryBtnText}>Uploading...</Text>
          </View>
        ) : (
          <View style={styles.btnRow}>
            <Entypo name="camera" size={18} color={COLORS.TEXT} />
            <Text style={styles.primaryBtnText}>Upload for Analysis</Text>
          </View>
        )}
      </TouchableOpacity>
    </ScrollView>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  content: { padding: 18, paddingBottom: 28 },
  header: { paddingTop: 12, paddingBottom: 10 },
  title: { color: COLORS.TEXT, fontSize: 28, fontWeight: '900' },
  subtitle: { color: COLORS.MUTED, fontSize: 13, marginTop: 6, lineHeight: 20, fontWeight: '600' },
  card: {
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardHeaderBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.CARD_2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { color: COLORS.TEXT, fontSize: 16, fontWeight: '900' },
  sectionTitle: { color: COLORS.TEXT, fontSize: 14, fontWeight: '800' },
  sectionSpacing: { marginTop: 16 },
  tip: { color: COLORS.MUTED, fontSize: 13, lineHeight: 20, marginBottom: 4, fontWeight: '600' },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  optionChip: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.CARD_2,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionChipActive: {
    backgroundColor: COLORS.ACCENT,
    borderColor: COLORS.ACCENT,
  },
  optionChipText: { color: COLORS.TEXT, fontSize: 12, fontWeight: '800' },
  optionChipTextActive: { color: COLORS.TEXT },
  clearText: { color: COLORS.WARNING, fontSize: 13, fontWeight: '800' },
  emptyState: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 10,
  },
  emptyStateText: { color: COLORS.MUTED, fontSize: 13, fontWeight: '700' },
  previewImage: { width: '100%', height: 240, borderRadius: 16, marginBottom: 12 },
  videoPreview: {
    height: 180,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.CARD_2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 10,
  },
  videoPreviewText: { color: COLORS.TEXT, fontSize: 15, fontWeight: '800' },
  mediaName: { color: COLORS.TEXT, fontSize: 14, fontWeight: '800' },
  mediaMeta: { color: COLORS.MUTED, fontSize: 12, marginTop: 4, marginBottom: 12, fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: COLORS.CARD_2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: COLORS.ACCENT,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: { color: COLORS.TEXT, fontSize: 15, fontWeight: '900' },
  secondaryBtnText: { color: COLORS.TEXT, fontSize: 14, fontWeight: '800' },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
