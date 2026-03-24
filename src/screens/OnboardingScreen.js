import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { theme } from '../theme';
import { useUser } from '../context/UserContext';

const STEPS = [
  { key: 'welcome', title: 'GymSurf', subtitle: 'Stay active. Stay connected.' },
  { key: 'sex', title: 'What is your sex?', options: ['male', 'female', 'other'] },
  { key: 'age', title: 'How old are you?', input: 'number', placeholder: '28' },
  { key: 'weightKg', title: 'Your weight (kg)?', input: 'number', placeholder: '75' },
  { key: 'heightCm', title: 'Your height (cm)?', input: 'number', placeholder: '178' },
  { key: 'activityType', title: 'What do you do?', options: ['surfer', 'gym', 'outdoor'] },
  { key: 'activityLevel', title: 'How active are you?', options: ['light', 'moderate', 'high', 'very high'] },
  { key: 'goal', title: 'What\'s your goal?', options: ['build', 'recover', 'cut', 'maintain', 'energise'] },
  { key: 'mealsPerDay', title: 'Meals per day?', options: [2, 3, 4, 5] },
  { key: 'budget', title: 'Your food budget?', options: ['low', 'mid', 'high'] },
  {
    key: 'dietaryRestrictions',
    title: 'Any allergies?',
    multiSelect: ['gluten', 'dairy', 'nuts', 'eggs', 'soy', 'fish', 'shellfish'],
  },
];

export default function OnboardingScreen() {
  const { setUserProfile, setOnboardingComplete } = useUser();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    sex: 'male',
    age: 28,
    weightKg: 75,
    heightCm: 178,
    activityType: 'surfer',
    activityLevel: 'high',
    goal: 'build',
    mealsPerDay: 4,
    budget: 'mid',
    dietaryRestrictions: [],
  });
  const [inputValue, setInputValue] = useState('');

  const current = STEPS[step];

  function handleOption(value) {
    setAnswers(prev => ({ ...prev, [current.key]: value }));
    advance();
  }

  function handleMultiToggle(value) {
    setAnswers(prev => {
      const arr = prev.dietaryRestrictions || [];
      const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
      return { ...prev, dietaryRestrictions: next };
    });
  }

  function handleInputSubmit() {
    const num = parseInt(inputValue, 10);
    if (!isNaN(num) && num > 0) {
      setAnswers(prev => ({ ...prev, [current.key]: num }));
      setInputValue('');
      advance();
    }
  }

  function advance() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  }

  function finishOnboarding() {
    setUserProfile(answers);
    setOnboardingComplete(true);
  }

  if (current.key === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.logo}>GymSurf</Text>
          <Text style={styles.tagline}>{current.subtitle}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(1)}>
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.stepContainer}>
        <Text style={styles.stepIndicator}>
          {step} / {STEPS.length - 1}
        </Text>
        <Text style={styles.questionTitle}>{current.title}</Text>

        {current.options && (
          <View style={styles.optionsContainer}>
            {current.options.map(opt => (
              <TouchableOpacity
                key={String(opt)}
                style={[
                  styles.optionBtn,
                  answers[current.key] === opt && styles.optionBtnActive,
                ]}
                onPress={() => handleOption(opt)}
              >
                <Text
                  style={[
                    styles.optionText,
                    answers[current.key] === opt && styles.optionTextActive,
                  ]}
                >
                  {String(opt).charAt(0).toUpperCase() + String(opt).slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {current.input === 'number' && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              placeholder={current.placeholder}
              placeholderTextColor={theme.colors.textTertiary}
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={handleInputSubmit}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleInputSubmit}>
              <Text style={styles.primaryBtnText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}

        {current.multiSelect && (
          <View style={styles.optionsContainer}>
            {current.multiSelect.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.optionBtn,
                  (answers.dietaryRestrictions || []).includes(opt) && styles.optionBtnActive,
                ]}
                onPress={() => handleMultiToggle(opt)}
              >
                <Text
                  style={[
                    styles.optionText,
                    (answers.dietaryRestrictions || []).includes(opt) && styles.optionTextActive,
                  ]}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: theme.spacing.xl }]}
              onPress={advance}
            >
              <Text style={styles.primaryBtnText}>
                {step === STEPS.length - 1 ? 'Finish' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step > 1 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xxl,
  },
  logo: {
    fontSize: theme.fontSize.hero,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  tagline: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xxxl,
  },
  stepContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.xxxl,
  },
  stepIndicator: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.md,
  },
  questionTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xxl,
  },
  optionsContainer: {
    gap: theme.spacing.md,
  },
  optionBtn: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  optionBtnActive: {
    backgroundColor: theme.colors.text,
    borderColor: theme.colors.text,
  },
  optionText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    textAlign: 'center',
  },
  optionTextActive: {
    color: theme.colors.background,
  },
  inputContainer: {
    gap: theme.spacing.lg,
  },
  textInput: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: theme.colors.text,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  backBtn: {
    marginTop: theme.spacing.xxl,
    alignItems: 'center',
  },
  backBtnText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
});
