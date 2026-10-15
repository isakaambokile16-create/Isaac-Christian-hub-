/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppTab } from './types';
import { INITIAL_DAILY_MOTIVATIONS } from './data/mockBiblicalData';
import { Header } from './components/Header';
import { HeroDailyMotivation } from './components/HeroDailyMotivation';
import { BibleChatAssistant } from './components/BibleChatAssistant';
import { PersonalizedStudyPlans } from './components/PersonalizedStudyPlans';
import { BiblicalCultureExplorer } from './components/BiblicalCultureExplorer';
import { PrayerJournal } from './components/PrayerJournal';
import { PlayStoreInstallModal } from './components/PlayStoreInstallModal';
import { AndroidInstallBanner } from './components/AndroidInstallBanner';
import { useOnlineStatus } from './hooks/usePWAInstall';
import {
  Cross,
  HeartHandshake,
  Flame,
  Sparkles,
  BookOpen,
  MessageSquare,
  Compass,
  BookmarkCheck,
  Download,
  Languages,
  Smartphone
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('home');
  const [selectedTranslation, setSelectedTranslation] = useState<string>('NIV');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    try {
      return localStorage.getItem('isaac_hub_lang') || 'English';
    } catch {
      return 'English';
    }
  });
  const [chatInitialQuestion, setChatInitialQuestion] = useState<string>('');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const isOnline = useOnlineStatus();

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    try {
      localStorage.setItem('isaac_hub_lang', lang);
    } catch {
      // ignore
    }
  };

  // Daily motivation item
  const dailyMotivation = INITIAL_DAILY_MOTIVATIONS[0];

  // Saved notes across chat and journal
  const [savedNotes, setSavedNotes] = useState<Array<{ id: string; title: string; content: string; timestamp: number }>>(() => {
    try {
      const saved = localStorage.getItem('isaac_hub_journal_notes');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return [
      {
        id: 'note-sample-1',
        title: 'The Meaning of Shalom (שָׁלוֹם)',
        content: 'Shalom is far more than peace as absence of strife—it implies complete restoration, wholeness, safety, and sound health in relationship with God and community.',
        timestamp: Date.now(),
      },
    ];
  });

  const handleAskQuestionInChat = (question: string) => {
    setChatInitialQuestion(question);
    setCurrentTab('chat');
  };

  const handleSaveToJournal = (title: string, content: string) => {
    const newNote = {
      id: `note-${Date.now()}`,
      title,
      content,
      timestamp: Date.now(),
    };
    const updated = [newNote, ...savedNotes];
    setSavedNotes(updated);
    try {
      localStorage.setItem('isaac_hub_journal_notes', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        selectedTranslation={selectedTranslation}
        onTranslationChange={setSelectedTranslation}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentTab === 'home' && (
          <HeroDailyMotivation
            daily={dailyMotivation}
            selectedLanguage={selectedLanguage}
            onNavigateTab={setCurrentTab}
            onAskQuestionInChat={handleAskQuestionInChat}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
          />
        )}

        {currentTab === 'chat' && (
          <BibleChatAssistant
            selectedTranslation={selectedTranslation}
            selectedLanguage={selectedLanguage}
            initialQuestion={chatInitialQuestion}
            onClearInitialQuestion={() => setChatInitialQuestion('')}
            onSaveToJournal={handleSaveToJournal}
          />
        )}

        {currentTab === 'plans' && (
          <PersonalizedStudyPlans
            selectedTranslation={selectedTranslation}
            selectedLanguage={selectedLanguage}
          />
        )}

        {currentTab === 'culture' && (
          <BiblicalCultureExplorer
            onAskInChat={handleAskQuestionInChat}
          />
        )}

        {currentTab === 'journal' && (
          <PrayerJournal
            initialSavedNotes={savedNotes}
            onOpenChat={() => setCurrentTab('chat')}
          />
        )}
      </main>

      {/* Offline Status Toast */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center space-x-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-stone-950 shadow-2xl animate-pulse">
          <span className="w-2 h-2 rounded-full bg-white" />
          <span>Offline Mode Active — Cached Scripture & Prayers Available</span>
        </div>
      )}

      {/* Android 1-Tap Install Banner */}
      <AndroidInstallBanner onOpenModal={() => setIsInstallModalOpen(true)} />

      {/* Google Play Store / PWA Install Modal */}
      <PlayStoreInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-amber-900/30 bg-stone-950/95 py-10 text-stone-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <img
                src="/app-photo.jpg"
                alt="Isaac Christian Hub Emblem"
                className="w-10 h-10 rounded-xl object-cover border border-amber-500/40 shadow"
              />
              <div>
                <span className="font-heading font-bold text-white text-base">
                  Isaac Christian Hub
                </span>
                <p className="text-[11px] text-amber-300/80">
                  Dedicated in fellowship with Isaka Ambokile • Universal Multilingual Access
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <button onClick={() => setCurrentTab('home')} className="hover:text-amber-300 transition">
                Daily Motivation & Prayer
              </button>
              <button onClick={() => setCurrentTab('chat')} className="hover:text-amber-300 transition">
                Scripture & Culture AI
              </button>
              <button onClick={() => setCurrentTab('plans')} className="hover:text-amber-300 transition">
                Personalized Study Plans
              </button>
              <button onClick={() => setCurrentTab('culture')} className="hover:text-amber-300 transition">
                Biblical Cultures
              </button>
              <button onClick={() => setCurrentTab('journal')} className="hover:text-amber-300 transition">
                Prayer Journal
              </button>
              <button
                onClick={() => setIsInstallModalOpen(true)}
                className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-bold transition"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Install on Phone</span>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[11px]">
            <p className="font-scripture italic text-center sm:text-left">
              "Your word is a lamp to my feet and a light to my path." — Psalm 119:105
            </p>
            <p className="text-center sm:text-right">
              Isaac Christian Hub • Soli Deo Gloria • PWA & Play Store Ready
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
