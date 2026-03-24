import { StyleSheet, View } from 'react-native';
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { Text } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ChatBubbleProps {
  message: string;
  sender: 'bot' | 'user';
}

export function ChatBubble({ message, sender }: ChatBubbleProps) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const isBot = sender === 'bot';

  return (
    <Animated.View
      entering={isBot ? FadeInLeft.duration(300) : FadeInRight.duration(300)}
      style={[
        styles.container,
        isBot ? styles.botContainer : styles.userContainer,
      ]}>
      <View
        style={[
          styles.bubble,
          isBot ? styles.botBubble : styles.userBubble,
          {
            backgroundColor: isBot ? colors.bubbleBot : colors.bubbleUser,
          },
        ]}>
        <Text
          style={[
            styles.text,
            { color: isBot ? colors.bubbleBotText : colors.bubbleUserText },
          ]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  botContainer: {
    alignItems: 'flex-start',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  botBubble: {
    borderRadius: 20,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    borderRadius: 20,
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
});
