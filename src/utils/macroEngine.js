import foodDatabase, { queryFoods } from '../data/foodDatabase';
import { getCountryProfile, getLanguageCodeForCountry, getCountryFlag, getCountryName } from '../data/countryProfiles';

// ═══════════════════════════════════════
// STEP 1: CALCULATE BMR & TDEE
// ═══════════════════════════════════════

function calculateBMR(weightKg, heightCm, age, sex) {
  const maleBMR = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
  const femaleBMR = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
  if (sex === 'male') return maleBMR;
  if (sex === 'female') return femaleBMR;
  return (maleBMR + femaleBMR) / 2; // 'other'
}

const ACTIVITY_MULTIPLIERS = {
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  'very high': 1.9,
};

function calculateTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.55;
  return Math.round(bmr * multiplier);
}

// ═══════════════════════════════════════
// STEP 2: GOAL ADJUSTMENTS
// ═══════════════════════════════════════

function applyGoalAdjustment(tdee, goal, weightKg) {
  let targetCalories = tdee;
  let proteinPerKg = 1.8;
  let carbBoost = 1.0;
  let fatBoost = 1.0;

  switch (goal) {
    case 'build':
      targetCalories = tdee + 300;
      proteinPerKg = 2.2;
      break;
    case 'recover':
      targetCalories = tdee + 100;
      proteinPerKg = 2.0;
      fatBoost = 1.15;
      break;
    case 'cut':
      targetCalories = tdee - 400;
      proteinPerKg = 2.4;
      break;
    case 'maintain':
      targetCalories = tdee;
      proteinPerKg = 1.8;
      break;
    case 'energise':
      targetCalories = tdee + 150;
      proteinPerKg = 1.8;
      carbBoost = 1.2;
      break;
    default:
      break;
  }

  const proteinGrams = Math.round(proteinPerKg * weightKg);
  const proteinCalories = proteinGrams * 4;
  const remainingCalories = targetCalories - proteinCalories;

  // Split remaining calories 50/50 between carbs and fat (by calories)
  let carbCalories = remainingCalories * 0.5 * carbBoost;
  let fatCalories = remainingCalories * 0.5 * fatBoost;

  // If boosts applied, adjust so we don't exceed targetCalories too much
  const totalAfterBoost = proteinCalories + carbCalories + fatCalories;
  if (totalAfterBoost > targetCalories * 1.05) {
    const scale = targetCalories / totalAfterBoost;
    carbCalories *= scale;
    fatCalories *= scale;
  }

  const carbGrams = Math.round(carbCalories / 4);
  const fatGrams = Math.round(fatCalories / 9);

  // Recalculate actual calories
  const actualCalories = (proteinGrams * 4) + (carbGrams * 4) + (fatGrams * 9);

  return {
    targetCalories: Math.round(targetCalories),
    dailyTargets: {
      protein: proteinGrams,
      carbs: carbGrams,
      fat: fatGrams,
      calories: actualCalories,
    },
  };
}

// ═══════════════════════════════════════
// STEP 3: SPLIT ACROSS MEALS
// ═══════════════════════════════════════

const MEAL_LABELS = {
  2: ['Lunch', 'Dinner'],
  3: ['Breakfast', 'Lunch', 'Dinner'],
  4: ['Breakfast', 'Pre-Session', 'Lunch', 'Dinner'],
  5: ['Breakfast', 'Pre-Session', 'Lunch', 'Post-Session', 'Dinner'],
};

function splitAcrossMeals(dailyTargets, mealsPerDay, goal) {
  const labels = MEAL_LABELS[mealsPerDay] || MEAL_LABELS[3];
  const meals = [];

  // Default: even distribution
  let proteinWeights = Array(mealsPerDay).fill(1 / mealsPerDay);
  let carbWeights = Array(mealsPerDay).fill(1 / mealsPerDay);
  let fatWeights = Array(mealsPerDay).fill(1 / mealsPerDay);

  // For 'build' and 'recover': weight protein toward earlier meals (not last)
  if ((goal === 'build' || goal === 'recover') && mealsPerDay >= 3) {
    const heavyMeals = Math.min(3, mealsPerDay - 1);
    const heavyWeight = 0.85 / heavyMeals;
    const lightWeight = 0.15 / (mealsPerDay - heavyMeals);
    proteinWeights = Array(mealsPerDay).fill(0).map((_, i) =>
      i < heavyMeals ? heavyWeight : lightWeight
    );
  }

  // For 'energise': weight carbs toward meal 1 and pre-session meal
  if (goal === 'energise' && mealsPerDay >= 3) {
    const boostIndices = [0];
    // Find pre-session meal
    const preSessionIdx = labels.findIndex(l => l.includes('Pre-Session'));
    if (preSessionIdx !== -1) boostIndices.push(preSessionIdx);
    else boostIndices.push(1); // second meal if no pre-session

    const boostWeight = 0.7 / boostIndices.length;
    const normalWeight = 0.3 / (mealsPerDay - boostIndices.length);
    carbWeights = Array(mealsPerDay).fill(0).map((_, i) =>
      boostIndices.includes(i) ? boostWeight : normalWeight
    );
  }

  for (let i = 0; i < mealsPerDay; i++) {
    meals.push({
      mealNumber: i + 1,
      label: labels[i] || `Meal ${i + 1}`,
      targets: {
        protein: Math.round(dailyTargets.protein * proteinWeights[i]),
        carbs: Math.round(dailyTargets.carbs * carbWeights[i]),
        fat: Math.round(dailyTargets.fat * fatWeights[i]),
        calories: 0, // calculated below
      },
    });
  }

  // Calculate calories for each meal
  meals.forEach(m => {
    m.targets.calories = (m.targets.protein * 4) + (m.targets.carbs * 4) + (m.targets.fat * 9);
  });

  return meals;
}

// ═══════════════════════════════════════
// STEP 4: FOOD MATCHING
// ═══════════════════════════════════════

function getLocalName(food, countryCode) {
  const langCode = getLanguageCodeForCountry(countryCode);
  return food.localNames[langCode] || food.name;
}

function calculateGramsNeeded(food, macroType, targetGrams) {
  const per100g = food.per100g[macroType];
  if (!per100g || per100g === 0) return 100;
  const grams = Math.round((targetGrams / per100g) * 100);
  return Math.max(20, Math.min(grams, 500)); // clamp between 20g and 500g
}

function getMacroContribution(food, grams) {
  const factor = grams / 100;
  return {
    protein: Math.round(food.per100g.protein * factor * 10) / 10,
    carbs: Math.round(food.per100g.carbs * factor * 10) / 10,
    fat: Math.round(food.per100g.fat * factor * 10) / 10,
    calories: Math.round(food.per100g.calories * factor),
  };
}

function selectFoodForRole(role, mealTargets, countryCode, dietaryRestrictions, budget, goal) {
  let categoryFilter;
  let primaryMacro;

  switch (role) {
    case 'protein':
      categoryFilter = (cat) => ['protein', 'legume', 'dairy'].includes(cat);
      primaryMacro = 'protein';
      break;
    case 'carb':
      categoryFilter = (cat) => ['carb', 'fruit'].includes(cat);
      primaryMacro = 'carbs';
      break;
    case 'fat':
      categoryFilter = (cat) => ['fat', 'vegetable'].includes(cat);
      primaryMacro = 'fat';
      break;
    default:
      categoryFilter = () => true;
      primaryMacro = 'protein';
  }

  // Query available foods
  let candidates = foodDatabase.filter(f =>
    f.availableIn.includes(countryCode) &&
    categoryFilter(f.category) &&
    !f.allergens.some(a => dietaryRestrictions.includes(a))
  );

  // Sort by relevance
  candidates.sort((a, b) => {
    let scoreA = a.athleteRating;
    let scoreB = b.athleteRating;

    // Prefer foods that match the goal
    const goalMap = {
      build: 'muscle gain',
      recover: 'recovery',
      cut: 'cutting',
      maintain: 'muscle gain',
      energise: 'energy',
    };
    const goalTerm = goalMap[goal] || 'energy';
    if (a.bestFor.includes(goalTerm)) scoreA += 2;
    if (b.bestFor.includes(goalTerm)) scoreB += 2;

    // Prefer cheap foods for low budget
    if (budget === 'low') {
      if (a.cheapIn.includes(countryCode)) scoreA += 2;
      if (b.cheapIn.includes(countryCode)) scoreB += 2;
    }

    // Prefer foods with higher macro density for the role
    if (primaryMacro === 'protein') {
      scoreA += a.per100g.protein / 10;
      scoreB += b.per100g.protein / 10;
    } else if (primaryMacro === 'carbs') {
      scoreA += a.per100g.carbs / 15;
      scoreB += b.per100g.carbs / 15;
    } else if (primaryMacro === 'fat') {
      scoreA += a.per100g.fat / 15;
      scoreB += b.per100g.fat / 15;
    }

    return scoreB - scoreA;
  });

  if (candidates.length === 0) return null;

  // Pick from top candidates with some variety (random from top 3)
  const topN = Math.min(3, candidates.length);
  const pick = candidates[Math.floor(Math.random() * topN)];

  return pick;
}

function buildMealItems(mealTargets, countryCode, dietaryRestrictions, budget, goal, usedFoodIds) {
  const items = [];
  let remainingProtein = mealTargets.protein;
  let remainingCarbs = mealTargets.carbs;
  let remainingFat = mealTargets.fat;

  // 1. Primary protein source
  const proteinFood = selectFoodForRole('protein', mealTargets, countryCode, dietaryRestrictions, budget, goal);
  if (proteinFood) {
    const grams = calculateGramsNeeded(proteinFood, 'protein', remainingProtein);
    const contribution = getMacroContribution(proteinFood, grams);
    items.push({
      foodId: proteinFood.id,
      foodName: proteinFood.name,
      localName: getLocalName(proteinFood, countryCode),
      gramsNeeded: grams,
      macroContribution: contribution,
      foundAt: proteinFood.foundAt,
      travelFriendly: proteinFood.travelFriendly,
    });
    remainingProtein -= contribution.protein;
    remainingCarbs -= contribution.carbs;
    remainingFat -= contribution.fat;
    usedFoodIds.add(proteinFood.id);
  }

  // 2. Primary carb source
  const carbFood = selectFoodForRole('carb', mealTargets, countryCode, dietaryRestrictions, budget, goal);
  if (carbFood) {
    const grams = calculateGramsNeeded(carbFood, 'carbs', Math.max(remainingCarbs, 10));
    const contribution = getMacroContribution(carbFood, grams);
    items.push({
      foodId: carbFood.id,
      foodName: carbFood.name,
      localName: getLocalName(carbFood, countryCode),
      gramsNeeded: grams,
      macroContribution: contribution,
      foundAt: carbFood.foundAt,
      travelFriendly: carbFood.travelFriendly,
    });
    remainingProtein -= contribution.protein;
    remainingCarbs -= contribution.carbs;
    remainingFat -= contribution.fat;
    usedFoodIds.add(carbFood.id);
  }

  // 3. Fat source or vegetable
  const fatFood = selectFoodForRole('fat', mealTargets, countryCode, dietaryRestrictions, budget, goal);
  if (fatFood) {
    const targetFat = Math.max(remainingFat, 5);
    const grams = fatFood.category === 'vegetable'
      ? Math.min(150, Math.max(80, calculateGramsNeeded(fatFood, 'fat', targetFat)))
      : calculateGramsNeeded(fatFood, 'fat', targetFat);
    const contribution = getMacroContribution(fatFood, grams);
    items.push({
      foodId: fatFood.id,
      foodName: fatFood.name,
      localName: getLocalName(fatFood, countryCode),
      gramsNeeded: grams,
      macroContribution: contribution,
      foundAt: fatFood.foundAt,
      travelFriendly: fatFood.travelFriendly,
    });
    usedFoodIds.add(fatFood.id);
  }

  return items;
}

function calculateMealTotals(items) {
  return items.reduce(
    (acc, item) => ({
      protein: Math.round((acc.protein + item.macroContribution.protein) * 10) / 10,
      carbs: Math.round((acc.carbs + item.macroContribution.carbs) * 10) / 10,
      fat: Math.round((acc.fat + item.macroContribution.fat) * 10) / 10,
      calories: acc.calories + item.macroContribution.calories,
    }),
    { protein: 0, carbs: 0, fat: 0, calories: 0 }
  );
}

// ═══════════════════════════════════════
// STEP 5: MEAL NOTES
// ═══════════════════════════════════════

function generateMealNote(mealLabel, countryCode, items) {
  const profile = getCountryProfile(countryCode);
  if (!profile) return '';

  const noteMap = {
    ES: {
      Breakfast: 'In Spain, most cafés serve "tostada con tomate" — ask for eggs on the side.',
      Lunch: 'Order a "menú del día" and ask for "pollo a la plancha" as the main.',
      Dinner: 'Dinner in Spain starts at 9pm. Grab "pechuga a la plancha con ensalada" at any bar.',
      'Pre-Session': 'Pick up a banana and rice cakes from any Mercadona.',
      'Post-Session': 'A tortilla española (potato omelette) has great protein and carbs post-session.',
    },
    MA: {
      Breakfast: 'Moroccan breakfast: eggs, msemen (flatbread), olive oil, and mint tea — skip the sugar in the tea.',
      Lunch: 'Ask for "djaj meshwi" (grilled chicken) with salad at any local restaurant.',
      Dinner: 'Tagine is great but ask for less oil. Add a side of lentil soup for protein.',
      'Pre-Session': 'Dates and almonds from the souk are the perfect pre-session fuel.',
      'Post-Session': 'Sardines with bread make a quick post-session meal — available everywhere.',
    },
  };

  const countryNotes = noteMap[countryCode];
  if (countryNotes && countryNotes[mealLabel]) {
    return countryNotes[mealLabel];
  }

  // Generic notes
  const genericNotes = {
    Breakfast: 'Start the day with protein and slow carbs for sustained energy.',
    Lunch: 'Make lunch your biggest meal — this is the main fuelling window.',
    Dinner: 'Keep dinner moderate; focus on protein and vegetables.',
    'Pre-Session': 'Eat 60-90 minutes before training. Focus on fast carbs and moderate protein.',
    'Post-Session': 'Hit protein within 30 minutes of finishing. Add fast carbs for recovery.',
  };
  return genericNotes[mealLabel] || 'Balance protein, carbs, and fats for optimal fuelling.';
}

// ═══════════════════════════════════════
// STEP 6: SUPPLEMENTS
// ═══════════════════════════════════════

function generateSupplementSuggestions(dailyTargets, countryCode, goal, dietaryRestrictions) {
  const profile = getCountryProfile(countryCode);
  const suggestions = [];

  // Whey protein if protein target > 150g and dairy is allowed
  if (dailyTargets.protein > 150 && !dietaryRestrictions.includes('dairy')) {
    suggestions.push({
      name: 'Whey Protein Isolate',
      reason: `Your daily protein target is ${dailyTargets.protein}g — a shake makes hitting this realistic.`,
      timing: 'Post-workout or between meals',
      whereToFind: profile ? profile.supplementStores.join(', ') : 'Health stores or pharmacies',
    });
  }

  // Creatine for build/recover goals
  if (goal === 'build' || goal === 'recover') {
    suggestions.push({
      name: 'Creatine Monohydrate (5g/day)',
      reason: 'Proven to increase strength and recovery. Most researched supplement.',
      timing: 'Any time daily, with water',
      whereToFind: profile ? profile.supplementStores.join(', ') : 'Health stores or pharmacies',
    });
  }

  // Magnesium for high activity
  if (goal === 'recover' || goal === 'energise') {
    suggestions.push({
      name: 'Magnesium Glycinate (400mg)',
      reason: 'Supports muscle recovery and sleep quality, often depleted in athletes.',
      timing: 'Before bed',
      whereToFind: profile ? profile.supplementStores.slice(0, 2).join(', ') : 'Pharmacy',
    });
  }

  // Electrolytes for endurance/energy
  if (goal === 'energise') {
    suggestions.push({
      name: 'Electrolyte Tabs',
      reason: 'Replace sodium and potassium lost through sweat during sessions.',
      timing: 'During and after activity',
      whereToFind: profile ? profile.supplementStores.slice(0, 2).join(', ') : 'Pharmacy or health store',
    });
  }

  // Vitamin D if relevant
  suggestions.push({
    name: 'Vitamin D3 (2000 IU)',
    reason: 'Supports bone health, immunity, and performance. Many athletes are deficient.',
    timing: 'With breakfast (fat-containing meal)',
    whereToFind: profile ? profile.supplementStores.slice(0, 2).join(', ') : 'Pharmacy',
  });

  return suggestions;
}

// ═══════════════════════════════════════
// STEP 7: SHOPPING LIST
// ═══════════════════════════════════════

function generateShoppingList(meals, countryCode) {
  const profile = getCountryProfile(countryCode);
  const currency = profile ? profile.currency : 'EUR';
  const itemMap = {};

  meals.forEach(meal => {
    meal.items.forEach(item => {
      if (itemMap[item.foodId]) {
        itemMap[item.foodId].gramsNeeded += item.gramsNeeded;
      } else {
        itemMap[item.foodId] = { ...item };
      }
    });
  });

  const costEstimates = {
    low: { EUR: '€0.50-1.50', USD: '$0.50-2.00', MAD: '5-15 MAD', AUD: 'A$1-3', IDR: '5,000-15,000 IDR', THB: '20-60 THB', MXN: '15-40 MXN', JPY: '100-300 ¥', ZAR: 'R10-30' },
    mid: { EUR: '€1.50-3.00', USD: '$2.00-5.00', MAD: '15-40 MAD', AUD: 'A$3-6', IDR: '15,000-40,000 IDR', THB: '60-150 THB', MXN: '40-100 MXN', JPY: '300-600 ¥', ZAR: 'R30-60' },
    high: { EUR: '€3.00-6.00', USD: '$5.00-10.00', MAD: '40-80 MAD', AUD: 'A$6-12', IDR: '40,000-100,000 IDR', THB: '150-400 THB', MXN: '100-250 MXN', JPY: '600-1200 ¥', ZAR: 'R60-120' },
  };

  return Object.values(itemMap).map(item => {
    // Rough cost tier based on food type
    const food = foodDatabase.find(f => f.id === item.foodId);
    let tier = 'mid';
    if (food && food.cheapIn.includes(countryCode)) tier = 'low';
    if (food && food.category === 'fat' && !food.cheapIn.includes(countryCode)) tier = 'high';

    const costMap = costEstimates[tier];
    const estimatedCost = costMap[currency] || costMap['EUR'] || '~€2';

    return {
      item: item.foodName,
      localName: item.localName,
      estimatedCost,
      foundAt: item.foundAt,
    };
  });
}

// ═══════════════════════════════════════
// MAIN: generateFuelPlan
// ═══════════════════════════════════════

export function generateFuelPlan(userProfile, countryCode) {
  const {
    weightKg,
    heightCm,
    age,
    sex,
    activityLevel,
    goal,
    mealsPerDay,
    dietaryRestrictions,
    budget,
  } = userProfile;

  // Step 1: BMR & TDEE
  const bmr = calculateBMR(weightKg, heightCm, age, sex);
  const userTDEE = calculateTDEE(bmr, activityLevel);

  // Step 2: Goal adjustment
  const { targetCalories, dailyTargets } = applyGoalAdjustment(userTDEE, goal, weightKg);

  // Step 3: Split across meals
  const mealSlots = splitAcrossMeals(dailyTargets, mealsPerDay, goal);

  // Step 4: Match foods to each meal
  const usedFoodIds = new Set();
  const meals = mealSlots.map(slot => {
    const items = buildMealItems(slot.targets, countryCode, dietaryRestrictions || [], budget, goal, usedFoodIds);
    const mealTotals = calculateMealTotals(items);
    const mealNotes = generateMealNote(slot.label, countryCode, items);

    return {
      mealNumber: slot.mealNumber,
      label: slot.label,
      items,
      mealTotals,
      mealNotes,
    };
  });

  // Per-meal average targets (for display)
  const perMealTargets = {
    protein: Math.round(dailyTargets.protein / mealsPerDay),
    carbs: Math.round(dailyTargets.carbs / mealsPerDay),
    fat: Math.round(dailyTargets.fat / mealsPerDay),
    calories: Math.round(dailyTargets.calories / mealsPerDay),
  };

  // Step 5: Supplements
  const supplementSuggestions = generateSupplementSuggestions(
    dailyTargets, countryCode, goal, dietaryRestrictions || []
  );

  // Step 6: Shopping list
  const shoppingList = generateShoppingList(meals, countryCode);

  // Step 7: Daily totals (actual from plan)
  const dailyTotals = meals.reduce(
    (acc, meal) => ({
      protein: Math.round((acc.protein + meal.mealTotals.protein) * 10) / 10,
      carbs: Math.round((acc.carbs + meal.mealTotals.carbs) * 10) / 10,
      fat: Math.round((acc.fat + meal.mealTotals.fat) * 10) / 10,
      calories: acc.calories + meal.mealTotals.calories,
    }),
    { protein: 0, carbs: 0, fat: 0, calories: 0 }
  );

  // Macro accuracy — how close the plan is to targets
  const proteinAccuracy = dailyTargets.protein > 0
    ? Math.min(100, (dailyTotals.protein / dailyTargets.protein) * 100) : 100;
  const carbAccuracy = dailyTargets.carbs > 0
    ? Math.min(100, (dailyTotals.carbs / dailyTargets.carbs) * 100) : 100;
  const fatAccuracy = dailyTargets.fat > 0
    ? Math.min(100, (dailyTotals.fat / dailyTargets.fat) * 100) : 100;
  const macroAccuracy = Math.round((proteinAccuracy + carbAccuracy + fatAccuracy) / 3);

  // Country info
  const countryName = getCountryName(countryCode);

  return {
    userTDEE,
    targetCalories,
    dailyTargets,
    perMealTargets,
    country: countryName,
    meals,
    supplementSuggestions,
    shoppingList,
    dailyTotals,
    macroAccuracy,
  };
}

export default generateFuelPlan;
