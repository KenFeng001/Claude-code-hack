import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  RefreshControl,
  SafeAreaView,
  Animated,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import * as Location from 'expo-location';
import { theme } from '../theme';
import { useUser } from '../context/UserContext';
import { generateFuelPlan } from '../utils/macroEngine';
import { getCountryFlag, getCountryName } from '../data/countryProfiles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RING_SIZE = 180;
const RING_STROKE = 12;

// ═══════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════

function SkeletonBlock({ width, height, style }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: theme.colors.skeleton,
          borderRadius: theme.borderRadius.md,
          opacity,
        },
        style,
      ]}
    />
  );
}

function LoadingSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <SkeletonBlock width={200} height={24} style={{ marginBottom: theme.spacing.lg }} />
      <SkeletonBlock width={RING_SIZE} height={RING_SIZE} style={{ borderRadius: RING_SIZE / 2, alignSelf: 'center', marginBottom: theme.spacing.xl }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: theme.spacing.xxl }}>
        <SkeletonBlock width={80} height={50} />
        <SkeletonBlock width={80} height={50} />
        <SkeletonBlock width={80} height={50} />
      </View>
      {[1, 2, 3].map(i => (
        <SkeletonBlock key={i} width="100%" height={140} style={{ marginBottom: theme.spacing.md }} />
      ))}
    </View>
  );
}

// ═══════════════════════════════════════
// ERROR BOUNDARY (functional fallback)
// ═══════════════════════════════════════

function ErrorState({ message, onRetry }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ═══════════════════════════════════════
// MACRO PILL BADGE
// ═══════════════════════════════════════

function MacroPill({ label, value, unit, color }) {
  return (
    <View style={[styles.macroPill, { borderColor: color }]}>
      <Text style={[styles.macroPillValue, { color }]}>{Math.round(value)}</Text>
      <Text style={styles.macroPillUnit}>{unit || 'g'}</Text>
      <Text style={styles.macroPillLabel}>{label}</Text>
    </View>
  );
}

// ═══════════════════════════════════════
// MACRO RING (plain Animated Views)
// ═══════════════════════════════════════

function MacroRing({ dailyTargets }) {
  const total = dailyTargets.protein + dailyTargets.carbs + dailyTargets.fat;
  const proteinPct = total > 0 ? dailyTargets.protein / total : 0.33;
  const carbsPct = total > 0 ? dailyTargets.carbs / total : 0.33;
  const fatPct = total > 0 ? dailyTargets.fat / total : 0.34;

  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [animValue]);

  // Build arc segments as colored border views
  const segments = [
    { pct: proteinPct, color: theme.colors.protein, label: 'Protein' },
    { pct: carbsPct, color: theme.colors.carbs, label: 'Carbs' },
    { pct: fatPct, color: theme.colors.fat, label: 'Fat' },
  ];

  return (
    <View style={styles.ringContainer}>
      <View style={styles.ringOuter}>
        {/* Background ring */}
        <View style={styles.ringBg} />

        {/* Colored arc segments using conic-gradient simulation */}
        {segments.map((seg, idx) => {
          const startAngle = segments.slice(0, idx).reduce((acc, s) => acc + s.pct * 360, 0);
          const sweepAngle = seg.pct * 360;
          return (
            <View
              key={seg.label}
              style={[
                styles.ringSegment,
                {
                  borderColor: seg.color,
                  borderWidth: RING_STROKE,
                  transform: [{ rotate: `${startAngle}deg` }],
                },
              ]}
            >
              <View
                style={{
                  position: 'absolute',
                  width: RING_SIZE,
                  height: RING_SIZE,
                  borderRadius: RING_SIZE / 2,
                  borderWidth: RING_STROKE,
                  borderColor: 'transparent',
                  borderTopColor: seg.color,
                  borderRightColor: sweepAngle > 90 ? seg.color : 'transparent',
                  borderBottomColor: sweepAngle > 180 ? seg.color : 'transparent',
                  borderLeftColor: sweepAngle > 270 ? seg.color : 'transparent',
                }}
              />
            </View>
          );
        })}

        {/* Center text */}
        <View style={styles.ringCenter}>
          <Text style={styles.ringCalories}>{dailyTargets.calories}</Text>
          <Text style={styles.ringCalLabel}>kcal</Text>
        </View>
      </View>

      {/* Macro stat blocks */}
      <View style={styles.macroStatsRow}>
        <View style={styles.macroStat}>
          <View style={[styles.macroStatDot, { backgroundColor: theme.colors.protein }]} />
          <Text style={styles.macroStatValue}>{dailyTargets.protein}g</Text>
          <Text style={styles.macroStatLabel}>Protein</Text>
        </View>
        <View style={styles.macroStat}>
          <View style={[styles.macroStatDot, { backgroundColor: theme.colors.carbs }]} />
          <Text style={styles.macroStatValue}>{dailyTargets.carbs}g</Text>
          <Text style={styles.macroStatLabel}>Carbs</Text>
        </View>
        <View style={styles.macroStat}>
          <View style={[styles.macroStatDot, { backgroundColor: theme.colors.fat }]} />
          <Text style={styles.macroStatValue}>{dailyTargets.fat}g</Text>
          <Text style={styles.macroStatLabel}>Fat</Text>
        </View>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════
// MEAL CARD
// ═══════════════════════════════════════

function MealCard({ meal }) {
  return (
    <View style={styles.mealCard}>
      <View style={styles.mealCardHeader}>
        <Text style={styles.mealCardTitle}>
          Meal {meal.mealNumber} — {meal.label}
        </Text>
      </View>

      {/* Meal macro pills */}
      <View style={styles.mealPillRow}>
        <MacroPill label="P" value={meal.mealTotals.protein} color={theme.colors.protein} />
        <MacroPill label="C" value={meal.mealTotals.carbs} color={theme.colors.carbs} />
        <MacroPill label="F" value={meal.mealTotals.fat} color={theme.colors.fat} />
        <MacroPill label="cal" value={meal.mealTotals.calories} unit="" color={theme.colors.calories} />
      </View>

      {/* Food items */}
      {meal.items.map((item, idx) => (
        <View key={`${item.foodId}-${idx}`} style={styles.foodItem}>
          <View style={styles.foodItemHeader}>
            <Text style={styles.foodItemName}>{item.foodName}</Text>
            {item.travelFriendly && <Text style={styles.travelBadge}>🎒</Text>}
          </View>
          <Text style={styles.foodItemLocal}>{item.localName}</Text>
          <Text style={styles.foodItemGrams}>{item.gramsNeeded}g</Text>
          <Text style={styles.foodItemMacros}>
            P: {item.macroContribution.protein}g · C: {item.macroContribution.carbs}g · F: {item.macroContribution.fat}g · {item.macroContribution.calories} kcal
          </Text>
          <View style={styles.locationTags}>
            {item.foundAt.slice(0, 2).map(loc => (
              <View key={loc} style={styles.locationBadge}>
                <Text style={styles.locationBadgeText}>{loc}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      {/* Meal notes */}
      {meal.mealNotes ? (
        <View style={styles.mealNoteBox}>
          <Text style={styles.mealNoteText}>💡 {meal.mealNotes}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ═══════════════════════════════════════
// SUPPLEMENT CARD
// ═══════════════════════════════════════

function SupplementCard({ supplement }) {
  return (
    <View style={styles.supplementCard}>
      <Text style={styles.supplementName}>{supplement.name}</Text>
      <Text style={styles.supplementReason}>{supplement.reason}</Text>
      <Text style={styles.supplementTiming}>⏰ {supplement.timing}</Text>
      <Text style={styles.supplementFind}>📍 {supplement.whereToFind}</Text>
    </View>
  );
}

// ═══════════════════════════════════════
// SHOPPING LIST MODAL
// ═══════════════════════════════════════

function ShoppingListModal({ visible, onClose, shoppingList }) {
  const [checked, setChecked] = useState({});

  const toggleCheck = (item) => {
    setChecked(prev => ({ ...prev, [item]: !prev[item] }));
  };

  // Group by first foundAt location
  const grouped = {};
  (shoppingList || []).forEach(item => {
    const loc = (item.foundAt && item.foundAt[0]) || 'Other';
    if (!grouped[loc]) grouped[loc] = [];
    grouped[loc].push(item);
  });

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.shoppingModalContent}>
          <View style={styles.shoppingModalHeader}>
            <Text style={styles.shoppingModalTitle}>Shopping List</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.shoppingModalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.shoppingList}>
            {Object.entries(grouped).map(([location, items]) => (
              <View key={location} style={styles.shoppingGroup}>
                <Text style={styles.shoppingGroupTitle}>
                  {location.charAt(0).toUpperCase() + location.slice(1)}
                </Text>
                {items.map((item, idx) => (
                  <TouchableOpacity
                    key={`${item.item}-${idx}`}
                    style={styles.shoppingItem}
                    onPress={() => toggleCheck(`${item.item}-${idx}`)}
                  >
                    <View style={[styles.checkbox, checked[`${item.item}-${idx}`] && styles.checkboxChecked]}>
                      {checked[`${item.item}-${idx}`] && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <View style={styles.shoppingItemInfo}>
                      <Text style={[styles.shoppingItemName, checked[`${item.item}-${idx}`] && styles.strikethrough]}>
                        {item.item}
                      </Text>
                      <Text style={styles.shoppingItemLocal}>{item.localName}</Text>
                    </View>
                    <Text style={styles.shoppingItemCost}>{item.estimatedCost}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ═══════════════════════════════════════
// MAIN FUEL SCREEN
// ═══════════════════════════════════════

export default function FuelScreen() {
  const { userProfile } = useUser();
  const [fuelPlan, setFuelPlan] = useState(null);
  const [countryCode, setCountryCode] = useState('ES');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Detect country from location
  const detectCountry = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return 'ES'; // fallback
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      const [result] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (result && result.isoCountryCode) {
        return result.isoCountryCode;
      }
      return 'ES';
    } catch {
      return 'ES';
    }
  }, []);

  // Generate the plan
  const loadPlan = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      const code = await detectCountry();
      setCountryCode(code);

      const plan = generateFuelPlan(userProfile, code);
      
      if (isRefresh) {
        // Animate fade out and in
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
      }

      setFuelPlan(plan);
    } catch (e) {
      setError(e.message || 'Failed to generate fuel plan');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userProfile, detectCountry, fadeAnim]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPlan(true);
  }, [loadPlan]);

  // ── LOADING STATE ──
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSkeleton />
      </SafeAreaView>
    );
  }

  // ── ERROR STATE ──
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState message={error} onRetry={() => loadPlan()} />
      </SafeAreaView>
    );
  }

  // ── EMPTY STATE ──
  if (!fuelPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🍽️</Text>
          <Text style={styles.emptyTitle}>No fuel plan yet</Text>
          <Text style={styles.emptySubtitle}>Complete onboarding to get your personalized plan.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const flag = getCountryFlag(countryCode);
  const countryName = getCountryName(countryCode);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Fuel Plan</Text>
        <View style={styles.headerRight}>
          <Text style={styles.headerCountry}>{flag} {countryName}</Text>
          <TouchableOpacity onPress={() => loadPlan(true)} style={styles.refreshBtn}>
            <Text style={styles.refreshIcon}>↻</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Macro target strip */}
      <View style={styles.macroStrip}>
        <MacroPill label="Protein" value={fuelPlan.dailyTargets.protein} color={theme.colors.protein} />
        <MacroPill label="Carbs" value={fuelPlan.dailyTargets.carbs} color={theme.colors.carbs} />
        <MacroPill label="Fat" value={fuelPlan.dailyTargets.fat} color={theme.colors.fat} />
        <MacroPill label="Calories" value={fuelPlan.dailyTargets.calories} unit="" color={theme.colors.calories} />
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Macro Ring */}
          <MacroRing dailyTargets={fuelPlan.dailyTargets} />

          {/* Meal Cards */}
          <Text style={styles.sectionTitle}>Meals</Text>
          {fuelPlan.meals.map(meal => (
            <MealCard key={meal.mealNumber} meal={meal} />
          ))}

          {/* Supplement Strip */}
          {fuelPlan.supplementSuggestions.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Supplements</Text>
              <FlatList
                horizontal
                data={fuelPlan.supplementSuggestions}
                keyExtractor={(item, idx) => `${item.name}-${idx}`}
                renderItem={({ item }) => <SupplementCard supplement={item} />}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.supplementStrip}
              />
            </>
          )}

          {/* Accuracy badge */}
          <View style={styles.accuracyBadge}>
            <Text style={styles.accuracyText}>
              Plan accuracy: {fuelPlan.macroAccuracy}% match to targets
            </Text>
          </View>

          {/* Spacer for bottom button */}
          <View style={{ height: 80 }} />
        </ScrollView>
      </Animated.View>

      {/* Fixed shopping list button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.shoppingBtn} onPress={() => setShowShoppingList(true)}>
          <Text style={styles.shoppingBtnText}>🛒 View Shopping List</Text>
        </TouchableOpacity>
      </View>

      {/* Shopping List Modal */}
      <ShoppingListModal
        visible={showShoppingList}
        onClose={() => setShowShoppingList(false)}
        shoppingList={fuelPlan.shoppingList}
      />
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════
// STYLES
// ═══════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerCountry: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIcon: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.refreshIcon,
  },

  // Macro strip
  macroStrip: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },

  // Macro pill
  macroPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.pillBackground,
    borderWidth: 1,
  },
  macroPillValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  macroPillUnit: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
  },
  macroPillLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
  },

  // Scroll content
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
  },

  // Ring
  ringContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  ringOuter: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  ringBg: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_STROKE,
    borderColor: theme.colors.surface,
  },
  ringSegment: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
  },
  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCalories: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  ringCalLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
  },
  macroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xxl,
  },
  macroStat: {
    alignItems: 'center',
  },
  macroStatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: theme.spacing.xs,
  },
  macroStatValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  macroStatLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
  },

  // Section title
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },

  // Meal card
  mealCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  mealCardHeader: {
    marginBottom: theme.spacing.sm,
  },
  mealCardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  mealPillRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },

  // Food item
  foodItem: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  foodItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  foodItemName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    flex: 1,
  },
  travelBadge: {
    fontSize: theme.fontSize.md,
    backgroundColor: theme.colors.travelBadge,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  foodItemLocal: {
    fontSize: theme.fontSize.sm,
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  foodItemGrams: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  foodItemMacros: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  locationTags: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  locationBadge: {
    backgroundColor: theme.colors.locationBadge,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  locationBadgeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
  },

  // Meal note
  mealNoteBox: {
    backgroundColor: theme.colors.calloutBackground,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.calloutBorder,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  mealNoteText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },

  // Supplement strip
  supplementStrip: {
    gap: theme.spacing.md,
    paddingRight: theme.spacing.xl,
  },
  supplementCard: {
    backgroundColor: theme.colors.supplementCard,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: SCREEN_WIDTH * 0.7,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  supplementName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  supplementReason: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 18,
  },
  supplementTiming: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
    marginBottom: 2,
  },
  supplementFind: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
  },

  // Accuracy
  accuracyBadge: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.pill,
  },
  accuracyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  shoppingBtn: {
    backgroundColor: theme.colors.text,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  shoppingBtnText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },

  // Shopping modal
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.modalOverlay,
    justifyContent: 'flex-end',
  },
  shoppingModalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  shoppingModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  shoppingModalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  shoppingModalClose: {
    fontSize: theme.fontSize.xxl,
    color: theme.colors.textTertiary,
  },
  shoppingList: {
    paddingHorizontal: theme.spacing.xl,
  },
  shoppingGroup: {
    marginTop: theme.spacing.lg,
  },
  shoppingGroupTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  shoppingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  checkmark: {
    color: theme.colors.background,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  shoppingItemInfo: {
    flex: 1,
  },
  shoppingItemName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  shoppingItemLocal: {
    fontSize: theme.fontSize.sm,
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
  },
  shoppingItemCost: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: theme.colors.textTertiary,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  errorTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  errorMessage: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  retryBtn: {
    backgroundColor: theme.colors.text,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.borderRadius.lg,
  },
  retryBtnText: {
    color: theme.colors.background,
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.md,
  },

  // Skeleton
  skeletonContainer: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl,
  },
});
