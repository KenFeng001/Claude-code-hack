import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import type { PersonalityResult } from '@/types/quiz';

interface QuizResultCardProps {
  result: PersonalityResult;
  onRetake: () => void;
}

export function QuizResultCard({ result, onRetake }: QuizResultCardProps) {
  const router = useRouter();

  return (
    <Animated.View entering={ZoomIn.duration(400)} style={styles.wrapper}>
      <View style={styles.card}>
        <Text style={styles.emoji}>{result.emoji}</Text>
        <Text style={styles.archetype}>{result.archetype}</Text>
        <Text style={styles.description}>{result.description}</Text>

        <View style={styles.tipBox}>
          <Text style={styles.tipLabel}>MATCH TIP</Text>
          <Text style={styles.tipText}>{result.matchTip}</Text>
        </View>

        <Pressable
          onPress={() => router.replace('/(tabs)')}
          style={({ pressed }) => [
            styles.continueButton,
            { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
        >
          <Text style={styles.continueText}>Let's Go 🏋️</Text>
        </Pressable>

        <Pressable onPress={onRetake} style={styles.retakeButton}>
          <Text style={styles.retakeText}>Retake Quiz</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  card: {
    borderRadius: 24,
    backgroundColor: '#191919',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 28,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  archetype: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FF8A00',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  tipBox: {
    borderRadius: 16,
    backgroundColor: '#252525',
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  tipLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#8E8E93',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#FF8A00',
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '700',
  },
  retakeButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  retakeText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
  },
});
