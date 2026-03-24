export type TraitDimension =
  | 'workoutStyle'
  | 'foodStyle'
  | 'socialStyle'
  | 'vibe';

export interface AnswerOption {
  id: string;
  label: string;
  emoji: string;
  traitScores: Partial<Record<TraitDimension, string>>;
}

export interface QuizQuestion {
  id: string;
  botMessage: string;
  answers: AnswerOption[];
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswerId: string;
}

export interface PersonalityResult {
  archetype: string;
  emoji: string;
  description: string;
  traits: Partial<Record<TraitDimension, string>>;
  matchTip: string;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}
ce ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}
