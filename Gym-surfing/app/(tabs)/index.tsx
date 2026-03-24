import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          GymSurf
        </ThemedText>
        <ThemedText style={{ color: colors.textMuted }}>
          Find your gym buddy anywhere
        </ThemedText>
      </View>

      <Pressable
        onPress={() => router.push('/personality-quiz')}
        style={({ pressed }) => [
          styles.quizCard,
          {
            backgroundColor: pressed ? '#E05A3D' : colors.accentCoral,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}>
        <Text style={styles.quizCardEmoji}>💪</Text>
        <Text style={styles.quizCardTitle}>Discover Your Gym Personality</Text>
        <Text style={styles.quizCardSubtitle}>
          Take a quick quiz to find your perfect gym buddy match
        </Text>
        <View style={styles.quizCardArrow}>
          <Text style={styles.arrowText}>Start Quiz →</Text>
        </View>
      </Pressable>

      <ThemedView style={styles.infoSection}>
        <ThemedText type="subtitle">How it works</ThemedText>
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, { backgroundColor: colors.accentCoral }]}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <ThemedText>Take the personality quiz</ThemedText>
        </View>
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, { backgroundColor: colors.accentYellow }]}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <ThemedText>Get matched with local gym buddies</ThemedText>
        </View>
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, { backgroundColor: colors.accentCoral }]}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <ThemedText>Work out together!</ThemedText>
        </View>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    marginBottom: 4,
  },
  quizCard: {
    borderRadius: 24,
    padding: 28,
    marginBottom: 32,
  },
  quizCardEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  quizCardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  quizCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: 16,
  },
  quizCardArrow: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  arrowText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  infoSection: {
    gap: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
