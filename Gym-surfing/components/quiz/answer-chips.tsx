import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { AnswerOption } from '@/types/quiz';

interface AnswerChipsProps {
  answers: AnswerOption[];
  onSelect: (answer: AnswerOption) => void;
  disabled: boolean;
}

export function AnswerChips({ answers, onSelect, disabled }: AnswerChipsProps) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  const handlePress = (answer: AnswerOption) => {
    if (disabled) return;
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelect(answer);
  };

  if (disabled) return null;

  return (
    <Animated.View
      entering={FadeInUp.delay(200).duration(300)}
      exiting={FadeOut.duration(200)}
      style={styles.container}>
      {answers.map((answer) => (
        <Pressable
          key={answer.id}
          onPress={() => handlePress(answer)}
          style={({ pressed }) => [
            styles.chip,
            {
              backgroundColor: pressed ? colors.chipActiveBg : colors.chipBg,
              borderColor: pressed ? colors.chipActiveBg : colors.chipBorder,
            },
          ]}>
          {({ pressed }) => (
            <Text
              style={[
                styles.chipText,
                { color: pressed ? colors.chipActiveText : colors.text },
              ]}>
              {answer.emoji} {answer.label}
            </Text>
          )}
        </Pressable>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
