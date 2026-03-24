import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

const { width: SCREEN_W } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🏋️',
    title: 'Find Gyms\nAnywhere',
    subtitle: 'Discover nearby gyms and healthy food spots wherever you travel.',
    accent: '#FF8A00',
  },
  {
    id: '2',
    emoji: '🤝',
    title: 'Match With\nGym Buddies',
    subtitle: 'Take a quick personality quiz and get matched with local workout partners.',
    accent: '#D58085',
  },
  {
    id: '3',
    emoji: '📅',
    title: 'Schedule\nSessions',
    subtitle: 'Book gym sessions, track your workouts, and stay consistent on the road.',
    accent: '#8CB4D6',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      router.replace('/personality-quiz');
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Animated.View entering={FadeIn.duration(600)} style={styles.emojiWrap}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </Animated.View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.bottomSection}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex && { backgroundColor: '#FF8A00', width: 24 },
              ]}
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.nextBtn,
            { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextText}>
            {activeIndex === SLIDES.length - 1 ? 'Find My Gym Personality' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  skipBtn: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    color: '#8E8E93',
    fontSize: 15,
    fontWeight: '600',
  },
  slide: {
    width: SCREEN_W,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emojiWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#191919',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#FF8A00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
  },
  emoji: {
    fontSize: 56,
  },
  slideTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -1,
    lineHeight: 44,
    marginBottom: 16,
  },
  slideSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 50,
    gap: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333333',
  },
  nextBtn: {
    backgroundColor: '#FF8A00',
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
