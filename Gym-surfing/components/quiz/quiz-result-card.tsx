import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { PersonalityResult } from '@/types/quiz';

interface QuizResultCardProps {
  result: PersonalityResult;
  onRetake: () => void;
}

export function QuizResultCard({ result, onRetake }: QuizResultCardProps) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  return (
    <Animated.View entering={ZoomIn.duration(400)} style={styles.wrapper}>
      <View style={[styles.card, { backgroundColor: colors.bgLight, borderColor: colors.borderColor }]}>
        <Text style={styles.emoji}>{result.emoji}</Text>
        <Text style={[styles.archetype, { color: colors.accentCoral }]}>
          {result.archetype}
        </Text>
        <Text style={[styles.description, { color: colors.text }]}>
          {result.description}
        </Text>

        <View style={[styles.tipBox, { backgroundColor: colors.bgGray }]}>
          <Text style={[styles.tipLabel, { color: colors.textMuted }]}>
            MATCH TIP
          </Text>
          <Text style={[styles.tipText, { color: colors.text }]}>
            {result.matchTip}
          </Text>
        </View>

        <Pressable
          onPress={onRetake}
          style={[styles.retakeButton, { backgroundColor: colors.accentCoral }]}>
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
    borderWidth: 1,
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
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  tipBox: {
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  tipLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  retakeButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  retakeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
