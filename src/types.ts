export type AppTab = 'home' | 'chat' | 'plans' | 'culture' | 'journal';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  mode?: string;
  scriptureReferences?: string[];
  culturalNote?: string;
}

export interface DailyMotivation {
  id: string;
  dateStr: string;
  founderQuote: string;
  verseReference: string;
  verseText: string;
  translation: string;
  morningMotivation: string;
  prayer: string;
  spokenDeclaration: string;
  culturalInsight: string;
  reflectionQuestion: string;
}

export interface StudyPlanDay {
  day: number;
  title: string;
  scripture: string;
  keyVerse: string;
  culturalContext: string;
  devotionalInsight: string;
  reflectionQuestion: string;
  prayer: string;
  completed?: boolean;
  userNotes?: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  theme: string;
  durationDays: number;
  dailyMinutes: number;
  category: 'culture' | 'faith' | 'peace' | 'wisdom' | 'leadership' | 'custom';
  founderDedication?: string;
  days: StudyPlanDay[];
  currentDay?: number;
  progressPercentage?: number;
}

export interface CulturalTopic {
  id: string;
  title: string;
  category: 'feasts' | 'customs' | 'languages' | 'geography' | 'temple';
  era: string;
  summary: string;
  originalTerm?: {
    term: string;
    transliteration: string;
    meaning: string;
  };
  historicalBackground: string;
  biblicalReferences: string[];
  christConnection: string;
  modernApplication: string;
}

export interface PrayerItem {
  id: string;
  title: string;
  request: string;
  category: 'family' | 'health' | 'faith' | 'work' | 'general';
  dateCreated: string;
  isAnswered: boolean;
  answeredDate?: string;
  answerNote?: string;
}
