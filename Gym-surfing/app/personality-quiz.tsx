import { useCallback, useEffect, useReducer, useRef } from 'react';
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native';

import { ChatBubble } from '@/components/quiz/chat-bubble';
import { AnswerChips } from '@/components/quiz/answer-chips';
import { TypingIndicator } from '@/components/quiz/typing-indicator';
import { QuizResultCard } from '@/components/quiz/quiz-result-card';
import { QUIZ_QUESTIONS, calculateResult } from '@/constants/quiz-data';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { AnswerOption, ChatMessage, QuizAnswer, PersonalityResult } from '@/types/quiz';

type Phase = 'typing' | 'awaiting-answer' | 'complete';

interface QuizState {
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  messages: ChatMessage[];
  phase: Phase;
  result: PersonalityResult | null;
}

type QuizAction =
  | { type: 'SHOW_TYPING' }
  | { type: 'ADD_BOT_MESSAGE'; text: string }
  | { type: 'ANSWER_SELECTED'; answer: AnswerOption; questionId: string }
  | { type: 'QUIZ_COMPLETE'; result: PersonalityResult }
  | { type: 'RESET' };

const initialState: QuizState = {
  currentQuestionIndex: 0,
  answers: [],
  messages: [],
  phase: 'typing',
  result: null,
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SHOW_TYPING':
      return { ...state, phase: 'typing' };
    case 'ADD_BOT_MESSAGE':
      return {
        ...state,
        phase: 'awaiting-answer',
        messages: [
          ...state.messages,
          {
            id: `bot-${state.currentQuestionIndex}`,
            sender: 'bot',
            text: action.text,
          },
        ],
      };
    case 'ANSWER_SELECTED': {
      const newAnswer: QuizAnswer = {
        questionId: action.questionId,
        selectedAnswerId: action.answer.id,
      };
      return {
        ...state,
        phase: 'typing',
        currentQuestionIndex: state.currentQuestionIndex + 1,
        answers: [...state.answers, newAnswer],
        messages: [
          ...state.messages,
          {
            id: `user-${state.currentQuestionIndex}`,
            sender: 'user',
            text: `${action.answer.emoji} ${action.answer.label}`,
          },
        ],
      };
    }
    case 'QUIZ_COMPLETE':
      return {
        ...state,
        phase: 'complete',
        result: action.result,
        messages: [
          ...state.messages,
          {
            id: 'bot-result-intro',
            sender: 'bot',
            text: "That's a wrap! Here's your gym personality...",
          },
        ],
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export default function PersonalityQuizScreen() {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const flatListRef = useRef<FlatList>(null);
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  // Show next bot message after typing delay
  useEffect(() => {
    if (state.phase !== 'typing') return;

    const delay = state.currentQuestionIndex === 0 ? 1000 : 800;
    const timer = setTimeout(() => {
      if (state.currentQuestionIndex >= QUIZ_QUESTIONS.length) {
        const result = calculateResult(state.answers);
        dispatch({ type: 'QUIZ_COMPLETE', result });
      } else {
        const question = QUIZ_QUESTIONS[state.currentQuestionIndex];
        dispatch({ type: 'ADD_BOT_MESSAGE', text: question.botMessage });
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [state.phase, state.currentQuestionIndex]);

  const handleAnswer = useCallback(
    (answer: AnswerOption) => {
      const question = QUIZ_QUESTIONS[state.currentQuestionIndex];
      dispatch({ type: 'ANSWER_SELECTED', answer, questionId: question.id });
    },
    [state.currentQuestionIndex]
  );

  const handleRetake = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const currentQuestion =
    state.currentQuestionIndex < QUIZ_QUESTIONS.length
      ? QUIZ_QUESTIONS[state.currentQuestionIndex]
      : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={state.messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatBubble message={item.text} sender={item.sender} />
        )}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={scrollToEnd}
        ListFooterComponent={
          <>
            {state.phase === 'typing' && <TypingIndicator />}
            {state.phase === 'complete' && state.result && (
              <QuizResultCard result={state.result} onRetake={handleRetake} />
            )}
          </>
        }
      />

      {state.phase === 'awaiting-answer' && currentQuestion && (
        <View style={[styles.chipsContainer, { borderTopColor: colors.borderColor }]}>
          <AnswerChips
            answers={currentQuestion.answers}
            onSelect={handleAnswer}
            disabled={false}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  chipsContainer: {
    borderTopWidth: 1,
    paddingBottom: 8,
  },
});
