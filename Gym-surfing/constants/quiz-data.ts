import type { QuizQuestion, QuizAnswer, PersonalityResult, TraitDimension } from '@/types/quiz';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    botMessage: "Hey! Let's find your gym personality. What's your go-to workout?",
    answers: [
      { id: 'q1a', label: 'Lifting heavy things', emoji: '🏋️', traitScores: { workoutStyle: 'strength' } },
      { id: 'q1b', label: 'Cardio & running', emoji: '🏃', traitScores: { workoutStyle: 'cardio' } },
      { id: 'q1c', label: 'Yoga / stretching / pilates', emoji: '🧘', traitScores: { workoutStyle: 'mindful' } },
      { id: 'q1d', label: 'A mix of everything', emoji: '🔄', traitScores: { workoutStyle: 'hybrid' } },
    ],
  },
  {
    id: 'q2',
    botMessage: "Now the important one — what's your food vibe?",
    answers: [
      { id: 'q2a', label: 'Meal prep king/queen', emoji: '🍱', traitScores: { foodStyle: 'strict' } },
      { id: 'q2b', label: 'Healthy-ish, but I love a treat', emoji: '🥗', traitScores: { foodStyle: 'balanced' } },
      { id: 'q2c', label: 'I eat whatever the locals eat', emoji: '🌮', traitScores: { foodStyle: 'adventurous' } },
      { id: 'q2d', label: 'Pizza is a protein, right?', emoji: '🍕', traitScores: { foodStyle: 'yolo' } },
    ],
  },
  {
    id: 'q3',
    botMessage: 'When you work out with someone, are you...',
    answers: [
      { id: 'q3a', label: 'Headphones in, just coexist', emoji: '🎧', traitScores: { socialStyle: 'solo' } },
      { id: 'q3b', label: 'Chat between sets', emoji: '💬', traitScores: { socialStyle: 'moderate' } },
      { id: 'q3c', label: 'I need a hype person!', emoji: '🙌', traitScores: { socialStyle: 'social' } },
    ],
  },
  {
    id: 'q4',
    botMessage: 'Last one! Pick the vibe that fits you best:',
    answers: [
      { id: 'q4a', label: 'Disciplined & structured', emoji: '🎯', traitScores: { vibe: 'disciplined' } },
      { id: 'q4b', label: 'Fun & spontaneous', emoji: '🎉', traitScores: { vibe: 'spontaneous' } },
      { id: 'q4c', label: 'Competitive & driven', emoji: '🏆', traitScores: { vibe: 'competitive' } },
      { id: 'q4d', label: 'Relaxed & social', emoji: '☕', traitScores: { vibe: 'social' } },
    ],
  },
];

const ARCHETYPES: PersonalityResult[] = [
  {
    archetype: 'The Iron Nomad',
    emoji: '🗺️',
    description:
      "Serious lifter, strict eater, laser-focused. You don't skip sessions — even on vacation. Your gym buddy better be ready to work.",
    traits: { workoutStyle: 'strength', foodStyle: 'strict', vibe: 'disciplined' },
    matchTip: 'Pair with someone who can spot you and match your discipline.',
  },
  {
    archetype: 'The Social Butterfly',
    emoji: '🦋',
    description:
      "Working out is your social hour. You'll try any workout if the company is right, and you never say no to a post-gym meal with the crew.",
    traits: { socialStyle: 'social', foodStyle: 'adventurous', vibe: 'social' },
    matchTip: 'You vibe with anyone! Look for chatty gym buddies who love food adventures.',
  },
  {
    archetype: 'The Zen Traveler',
    emoji: '🧘',
    description:
      "Mindful movement, balanced eating, good vibes. You flow through your travels with yoga mats and smoothie spots on your radar.",
    traits: { workoutStyle: 'mindful', foodStyle: 'balanced', vibe: 'spontaneous' },
    matchTip: 'Find a buddy who keeps things chill and enjoys mindful movement.',
  },
  {
    archetype: 'The Beast Mode Foodie',
    emoji: '🦁',
    description:
      "You train hard and eat harder. Every city is a new PR and a new restaurant to demolish. Life's too short for boring workouts AND boring food.",
    traits: { workoutStyle: 'strength', foodStyle: 'adventurous', vibe: 'competitive' },
    matchTip: 'Match with someone who can keep up in the gym AND at the dinner table.',
  },
  {
    archetype: 'The Cardio Wanderer',
    emoji: '🏃',
    description:
      "Running through a new city is your idea of sightseeing. You eat light, move fast, and explore everything on foot.",
    traits: { workoutStyle: 'cardio', foodStyle: 'balanced', socialStyle: 'moderate' },
    matchTip: 'Find a running buddy who knows the best local routes and healthy eats.',
  },
  {
    archetype: 'The Flexible Adventurer',
    emoji: '🌍',
    description:
      "You're down for anything — lifting, yoga, running, pizza, street food. You adapt to wherever you are and whoever you're with.",
    traits: { workoutStyle: 'hybrid', foodStyle: 'yolo', vibe: 'spontaneous' },
    matchTip: "You're the ultimate gym buddy — adaptable, fun, and always hungry!",
  },
];

export function calculateResult(answers: QuizAnswer[]): PersonalityResult {
  const traits: Partial<Record<TraitDimension, string>> = {};
  for (const answer of answers) {
    const question = QUIZ_QUESTIONS.find((q) => q.id === answer.questionId);
    const selected = question?.answers.find((a) => a.id === answer.selectedAnswerId);
    if (selected) {
      for (const [key, value] of Object.entries(selected.traitScores)) {
        traits[key as TraitDimension] = value;
      }
    }
  }

  let bestMatch = ARCHETYPES[ARCHETYPES.length - 1];
  let bestScore = 0;

  for (const archetype of ARCHETYPES) {
    let score = 0;
    for (const [key, value] of Object.entries(archetype.traits)) {
      if (traits[key as TraitDimension] === value) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = archetype;
    }
  }

  return { ...bestMatch, traits };
}
',
  },
  {
    archetype: 'The Beast Mode Explorer',
    emoji: '🦁',
    description:
      "You train hard AND travel hard. You'll try a local's intense workout routine just for the thrill. Every gym in every city is a new challenge to conquer.",
    traits: { intensity: 'beast', adventurousness: 'adventurous', vibe: 'competitive' },
    matchTip: 'Match with someone who can push you to your limits and show you local training styles.',
  },
  {
    archetype: 'The Cardio Wanderer',
    emoji: '🏃',
    description:
      "Running through a new city is your idea of sightseeing. You love outdoor cardio, exploring trails, and staying active without needing a gym membership.",
    traits: { workoutStyle: 'cardio', travelFitness: 'outdoor', adventurousness: 'adventurous' },
    matchTip: 'Find a running buddy or someone who knows the best local trails and outdoor spots.',
  },
  {
    archetype: 'The Flexible Adventurer',
    emoji: '🌍',
    description:
      "You're open to anything — lifting, running, yoga, whatever the local gym culture offers. You adapt your workout to wherever you are and whoever you're with.",
    traits: { workoutStyle: 'hybrid', adventurousness: 'adventurous', vibe: 'spontaneous' },
    matchTip: "You're the ultimate gym buddy — adaptable and up for anything. Match with anyone!",
  },
];

export function calculateResult(answers: QuizAnswer[]): PersonalityResult {
  // Collect trait values from answers
  const traits: Partial<Record<TraitDimension, string>> = {};
  for (const answer of answers) {
    const question = QUIZ_QUESTIONS.find((q) => q.id === answer.questionId);
    const selected = question?.answers.find((a) => a.id === answer.selectedAnswerId);
    if (selected) {
      for (const [key, value] of Object.entries(selected.traitScores)) {
        traits[key as TraitDimension] = value;
      }
    }
  }

  // Score each archetype by how many traits match
  let bestMatch = ARCHETYPES[ARCHETYPES.length - 1];
  let bestScore = 0;

  for (const archetype of ARCHETYPES) {
    let score = 0;
    for (const [key, value] of Object.entries(archetype.traits)) {
      if (traits[key as TraitDimension] === value) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = archetype;
    }
  }

  return { ...bestMatch, traits };
}
