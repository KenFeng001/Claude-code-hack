import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeInLeft,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function TypingIndicator() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const pulse = (delay: number) =>
      withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0.3, { duration: 400 })
          ),
          -1
        )
      );
    dot1.value = pulse(0);
    dot2.value = pulse(150);
    dot3.value = pulse(300);
  }, []);

  const dotStyle1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const dotStyle2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const dotStyle3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <Animated.View entering={FadeInLeft.duration(200)} style={styles.container}>
      <View style={[styles.bubble, { backgroundColor: colors.bubbleBot }]}>
        <Animated.View style={[styles.dot, { backgroundColor: colors.bubbleBotText }, dotStyle1]} />
        <Animated.View style={[styles.dot, { backgroundColor: colors.bubbleBotText }, dotStyle2]} />
        <Animated.View style={[styles.dot, { backgroundColor: colors.bubbleBotText }, dotStyle3]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
