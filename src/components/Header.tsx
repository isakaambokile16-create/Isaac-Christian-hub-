import React, { useState } from 'react';
import { AppTab } from '../types';
import { ambientPlayer } from '../utils/audioUtils';
import {
  BookOpen,
  MessageSquare,
  Sparkles,
  Compass,
  BookmarkCheck,
  Volume2,
  VolumeX,
  Menu,
  X,
  HeartHandshake,
  Download,
  Languages,
  Smartphone
} from 'lucide-react';

interface HeaderProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  selectedTranslation: string;
  onTranslationChange: (tr: string) => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  onOpenInstallModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  selectedTranslation,
  onTranslationChange,
  selectedLanguage,
  onLanguageChange,
  onOpenInstallModal,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleAmbient = () => {
    const playing = ambientPlayer.toggle();
    setIsPlayingAudio(playing);
  };

  const navItems: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Daily Prayer & Motivation', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'chat', label: 'Scripture & Culture AI', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'plans', label: 'Personalized Study Plans', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'culture', label: 'Biblical Cultures', icon: <Compass className="w-4 h-4" /> },
    { id: 'journal', label: 'Prayer Journal', icon: <BookmarkCheck className="w-4 h-4" /> },
  ];

  const availableLanguages = [
    { code: 'English', label: 'English' },
    { code: 'Swahili', label: 'Kiswahili (Swahili)' },
    { code: 'Spanish', label: 'Español (Spanish)' },
    { code: 'French', label: 'Français (French)' },
    { code: 'Portuguese', label: 'Português (Portuguese)' },
    { code: 'German', label: 'Deutsch (German)' },
    { code: 'Arabic', label: 'العربية (Arabic)' },
    { code: 'Amharic', label: 'አማርኛ (Amharic)' },
    { code: 'Yoruba', label: 'Yorùbá' },
    { code: 'Zulu', label: 'isiZulu' },
    { code: 'Hindi', label: 'हिन्दी (Hindi)' },
    { code: 'Chinese', label: '中文 (Chinese)' },
    { code: 'Tagalog', label: 'Tagalog (Filipino)' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur-md border-b border-amber-900/30">
      {/* Top Banner introducing Isaka Ambokile and Quick Controls */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-stone-900 px-3 sm:px-4 py-1.5 text-xs text-amber-200 border-b border-amber-800/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 truncate">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
            <span className="font-semibold tracking-wide truncate">
              Founded with <span className="text-amber-100 font-bold underline decoration-amber-400">Isaka Ambokile</span>
            </span>
            <span className="hidden md:inline text-amber-400/60">•</span>
            <span className="hidden md:inline text-stone-300 truncate">
              Biblical Truth, Ancient Cultures & Multilingual Prayer
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Ambient Peaceful Music Toggle */}
            <button
              onClick={toggleAmbient}
              title="Peaceful ambient prayer chords"
              className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-full border transition-all text-[11px] ${
                isPlayingAudio
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm shadow-amber-500/20'
                  : 'bg-stone-900/60 border-stone-700 text-stone-400 hover:text-amber-300'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Volume2 className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span className="hidden sm:inline">Pad: On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3 h-3" />
                  <span className="hidden sm:inline">Pad: Off</span>
                </>
              )}
            </button>

            {/* Language Selector (All Languages) */}
            <div className="flex items-center space-x-1">
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-stone-900/90 text-amber-200 text-[11px] rounded border border-amber-800/40 px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
              >
                {availableLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Translation selector */}
            <div className="hidden lg:flex items-center space-x-1">
              <span className="text-stone-400 text-[11px]">Bible:</span>
              <select
                value={selectedTranslation}
                onChange={(e) => onTranslationChange(e.target.value)}
                className="bg-stone-900/90 text-amber-200 text-[11px] rounded border border-amber-800/40 px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="NIV">NIV</option>
                <option value="ESV">ESV</option>
                <option value="KJV">KJV</option>
                <option value="NKJV">NKJV</option>
                <option value="NLT">NLT</option>
                <option value="CSB">CSB</option>
              </select>
            </div>

            {/* Download / Play Store Install Header Button */}
            <button
              onClick={onOpenInstallModal}
              className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 hover:bg-amber-400 font-bold text-[11px] shadow-sm transition hover:scale-105 active:scale-95"
              title="Download & Install Isaac Christian Hub (Play Store / Home Screen PWA)"
            >
              <Download className="w-3 h-3" />
              <span>Install App</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with Real Generated App Photo & Hub Branding */}
          <div
            onClick={() => onTabChange('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-lg border border-amber-500/50 group-hover:scale-105 transition-transform flex-shrink-0">
              <img
                src="/app-photo.jpg"
                alt="Isaac Christian Hub Emblem"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-lg sm:text-2xl font-bold tracking-tight text-white font-heading">
                  Isaac <span className="text-amber-400">Christian Hub</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-amber-300/80 tracking-wider uppercase font-semibold">
                Guidance & Prayer • Isaka Ambokile
              </p>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-900/20'
                      : 'text-stone-300 hover:text-amber-200 hover:bg-stone-900/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile actions */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={onOpenInstallModal}
              className="p-1.5 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/40 text-xs flex items-center space-x-1"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-stone-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-stone-900 border-b border-amber-900/40 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40'
                    : 'text-stone-300 hover:bg-stone-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
