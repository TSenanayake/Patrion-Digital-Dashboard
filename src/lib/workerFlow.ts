import type { Document, InfoBlock, Question } from "@/integrations/supabase/types";

export type WorkerPhase = 'language' | 'consent' | 'info' | 'documents' | 'register' | 'signature' | 'done';

export type DocSubPhase = 'reading' | 'questions';

export interface WorkerState {
  phase: WorkerPhase;
  docSubPhase: DocSubPhase;
  language: string | null;
  consentGiven: boolean;
  consentTimestamp: string | null;
  currentDocIndex: number;
  currentPersonIndex: number;
  currentQuestionIndex: number;
  hasScrolledToBottom: boolean;
  viewMode: 'smart' | 'original';
  verifiedPhone: string;
  signatureDataUrl: string | null;
  signCount: number;
  userId: string;
  regForm: { name: string; company: string; phone: string };
  translatedSections: Record<string, unknown[]>;
  translatedQuestions: Record<string, unknown[]>;
  translatedInfoBlocks: Record<string, string[]>;
  translationFailed: boolean;
  searchTerm: string;
  answer: string;
  wrongAnswer: boolean;
  questionsAnswered: { question_id: string; answer: string }[];
}

export const initialWorkerState: WorkerState = {
  phase: 'language',
  docSubPhase: 'reading',
  language: null,
  consentGiven: false,
  consentTimestamp: null,
  currentDocIndex: 0,
  currentPersonIndex: 0,
  currentQuestionIndex: 0,
  hasScrolledToBottom: false,
  viewMode: 'smart',
  verifiedPhone: '',
  signatureDataUrl: null,
  signCount: 0,
  userId: '',
  regForm: { name: '', company: '', phone: '' },
  translatedSections: {},
  translatedQuestions: {},
  translatedInfoBlocks: {},
  translationFailed: false,
  searchTerm: '',
  answer: '',
  wrongAnswer: false,
  questionsAnswered: [],
};

export type WorkerAction =
  | { type: 'SELECT_LANGUAGE'; language: string }
  | { type: 'ACCEPT_CONSENT'; infoBlocks: InfoBlock[]; documentCount: number }
  | { type: 'DECLINE_CONSENT' }
  | { type: 'NEXT_PHASE' }
  | { type: 'SELECT_DOCUMENT'; index: number }
  | { type: 'CONFIRM_DOC_READ' }
  | { type: 'GO_TO_QUESTIONS'; questions: Question[] }
  | { type: 'SET_ANSWER'; answer: string }
  | { type: 'WRONG_ANSWER' }
  | { type: 'CORRECT_ANSWER'; questionId: string; answerText: string }
  | { type: 'NEXT_QUESTION' }
  | { type: 'GO_BACK_TO_DOCUMENT' }
  | { type: 'NEXT_DOCUMENT'; totalDocuments: number }
  | { type: 'ALL_DOCS_COMPLETE' }
  | { type: 'SET_SIGNED' }
  | { type: 'NEXT_PERSON' }
  | { type: 'SET_TRANSLATED_SECTIONS'; cacheKey: string; sections: unknown[] }
  | { type: 'SET_TRANSLATED_QUESTIONS'; cacheKey: string; questions: unknown[] }
  | { type: 'SET_TRANSLATED_INFO_BLOCKS'; cacheKey: string; content: string[] }
  | { type: 'SET_TRANSLATION_FAILED' }
  | { type: 'SET_SEARCH_TERM'; term: string }
  | { type: 'SET_VIEW_MODE'; mode: 'smart' | 'original' }
  | { type: 'SET_SCROLLED' }
  | { type: 'SET_OTP_VERIFIED'; phone: string }
  | { type: 'SET_REGISTER_FORM'; field: 'name' | 'company' | 'phone'; value: string }
  | { type: 'SET_SIGNATURE'; dataUrl: string | null }
  | { type: 'SET_USER_ID'; userId: string }
  | { type: 'RESET_FOR_NEXT_PERSON' };

export function workerReducer(state: WorkerState, action: WorkerAction): WorkerState {
  switch (action.type) {
    case 'SELECT_LANGUAGE':
      return {
        ...state,
        language: action.language,
        phase: 'consent',
      };

    case 'ACCEPT_CONSENT':
      return {
        ...state,
        consentGiven: true,
        consentTimestamp: new Date().toISOString(),
        phase: action.infoBlocks.length > 0 ? 'info' : action.documentCount > 0 ? 'documents' : 'register',
      };

    case 'DECLINE_CONSENT':
      return state;

    case 'NEXT_PHASE':
      return { ...state, phase: getNextPhase(state.phase) };

    case 'SELECT_DOCUMENT':
      return {
        ...state,
        currentDocIndex: action.index,
        docSubPhase: 'reading',
        hasScrolledToBottom: false,
        searchTerm: '',
      };

    case 'CONFIRM_DOC_READ':
      return { ...state, hasScrolledToBottom: true };

    case 'GO_TO_QUESTIONS':
      return {
        ...state,
        docSubPhase: 'questions',
        currentQuestionIndex: 0,
        answer: '',
        wrongAnswer: false,
      };

    case 'SET_ANSWER':
      return { ...state, answer: action.answer, wrongAnswer: false };

    case 'WRONG_ANSWER':
      return { ...state, wrongAnswer: true, answer: '' };

    case 'CORRECT_ANSWER':
      return {
        ...state,
        questionsAnswered: [...state.questionsAnswered, { question_id: action.questionId, answer: action.answerText }],
      };

    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
        answer: '',
        wrongAnswer: false,
      };

    case 'GO_BACK_TO_DOCUMENT':
      return {
        ...state,
        docSubPhase: 'reading',
        wrongAnswer: false,
        hasScrolledToBottom: true,
      };

    case 'NEXT_DOCUMENT':
      if (state.currentDocIndex < action.totalDocuments - 1) {
        return {
          ...state,
          currentDocIndex: state.currentDocIndex + 1,
          docSubPhase: 'reading',
          currentQuestionIndex: 0,
          answer: '',
          wrongAnswer: false,
          hasScrolledToBottom: false,
        };
      }
      return { ...state, phase: 'register' };

    case 'ALL_DOCS_COMPLETE':
      return { ...state, phase: 'register' };

    case 'SET_SIGNED':
      return {
        ...state,
        signCount: state.signCount + 1,
        phase: 'done',
      };

    case 'NEXT_PERSON':
    case 'RESET_FOR_NEXT_PERSON':
      return {
        ...initialWorkerState,
        signCount: state.signCount,
        language: state.language,
      };

    case 'SET_TRANSLATED_SECTIONS':
      return {
        ...state,
        translatedSections: { ...state.translatedSections, [action.cacheKey]: action.sections },
      };

    case 'SET_TRANSLATED_QUESTIONS':
      return {
        ...state,
        translatedQuestions: { ...state.translatedQuestions, [action.cacheKey]: action.questions },
      };

    case 'SET_TRANSLATED_INFO_BLOCKS':
      return {
        ...state,
        translatedInfoBlocks: { ...state.translatedInfoBlocks, [action.cacheKey]: action.content },
      };

    case 'SET_TRANSLATION_FAILED':
      return { ...state, translationFailed: true };

    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.term };

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.mode };

    case 'SET_SCROLLED':
      return { ...state, hasScrolledToBottom: true };

    case 'SET_OTP_VERIFIED':
      return { ...state, verifiedPhone: action.phone };

    case 'SET_REGISTER_FORM':
      return { ...state, regForm: { ...state.regForm, [action.field]: action.value } };

    case 'SET_SIGNATURE':
      return { ...state, signatureDataUrl: action.dataUrl };

    case 'SET_USER_ID':
      return { ...state, userId: action.userId };

    default:
      return state;
  }
}

function getNextPhase(current: WorkerPhase): WorkerPhase {
  const phases: WorkerPhase[] = ['language', 'consent', 'info', 'documents', 'register', 'signature', 'done'];
  const idx = phases.indexOf(current);
  return idx < phases.length - 1 ? phases[idx + 1] : current;
}
