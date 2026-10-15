import React, { useState } from 'react';
import { DailyMotivation, AppTab } from '../types';
import { speakText } from '../utils/audioUtils';
import {
  Sparkles,
  Play,
  Square,
  Copy,
  Check,
  Share2,
  BookMarked,
  Sunrise,
  ShieldCheck,
  ScrollText,
  MessageSquare,
  Compass,
  Heart,
  Flame,
  Send,
  Loader2,
  HelpCircle,
  ArrowDownToLine,
  Smartphone,
  Languages,
  Lightbulb
} from 'lucide-react';

interface HeroDailyMotivationProps {
  daily: DailyMotivation;
  selectedLanguage: string;
  onNavigateTab: (tab: AppTab) => void;
  onAskQuestionInChat: (question: string) => void;
  onOpenInstallModal: () => void;
}

export const HeroDailyMotivation: React.FC<HeroDailyMotivationProps> = ({
  daily,
  selectedLanguage,
  onNavigateTab,
  onAskQuestionInChat,
  onOpenInstallModal,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechController, setSpeechController] = useState<{ stop: () => void } | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Custom personal prayer generator state
  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);
  const [prayerNeed, setPrayerNeed] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [prayerLanguage, setPrayerLanguage] = useState(selectedLanguage);
  const [isGeneratingPrayer, setIsGeneratingPrayer] = useState(false);
  const [customPrayerResult, setCustomPrayerResult] = useState<any | null>(null);

  const handleToggleSpeech = () => {
    if (isPlayingAudio && speechController) {
      speechController.stop();
      setIsPlayingAudio(false);
      setSpeechController(null);
    } else {
      const textToRead = `${daily.verseReference}. ${daily.verseText}. Today's Daily Prayer: ${daily.prayer}. Spoken Faith Declaration: ${daily.spokenDeclaration}`;
      const controller = speakText(
        textToRead,
        () => setIsPlayingAudio(false),
        () => setIsPlayingAudio(true)
      );
      setSpeechController(controller);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleGenerateCustomPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerNeed.trim()) return;

    setIsGeneratingPrayer(true);
    try {
      const res = await fetch('/api/daily-prayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          need: prayerNeed,
          recipientName: recipientName.trim() || 'Beloved in Christ',
          language: prayerLanguage || selectedLanguage || 'English',
        }),
      });

      if (!res.ok) throw new Error('Failed to generate personalized prayer');
      const data = await res.json();
      setCustomPrayerResult(data);
    } catch (err) {
      console.error(err);
      alert('Could not generate personalized prayer at this moment. Please try again.');
    } finally {
      setIsGeneratingPrayer(false);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-stone-900 via-stone-900/90 to-stone-950 border border-amber-900/40 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-700/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5">
          {/* App Photo Showcase */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500 to-amber-700 opacity-60 blur-lg group-hover:opacity-90 transition duration-500" />
              <img
                src="/app-photo.jpg"
                alt="Isaac Christian Hub - Radiant Cross and Living Scripture"
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover shadow-2xl border-2 border-amber-400/60 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Founder Header Ribbon */}
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-950/80 to-stone-900 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-medium shadow-inner">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Welcome to Isaac Christian Hub</span>
            <span className="text-amber-500">•</span>
            <span className="text-amber-300 font-semibold">Led with Isaka Ambokile</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight font-heading leading-tight">
            Nourish Your Spirit with <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              Biblical Wisdom, Ancient Culture & Daily Prayer
            </span>
          </h1>

          <p className="text-stone-300 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Founded with <span className="text-amber-300 font-medium">Isaka Ambokile</span> to equip believers worldwide. Ask deep scripture & historical culture questions in <strong className="text-white">all languages</strong>, meditate on daily motivational prayers, and follow transformative study plans.
          </p>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('chat')}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold shadow-lg shadow-amber-900/30 transition-all hover:scale-105 active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask Bible & Culture AI (All Languages)</span>
            </button>

            <button
              onClick={() => setIsPrayerModalOpen(true)}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-stone-800/90 hover:bg-stone-800 text-amber-300 border border-amber-600/40 font-semibold transition-all hover:border-amber-400"
            >
              <Heart className="w-4 h-4 text-amber-400" />
              <span>Request Personal Prayer</span>
            </button>

            <button
              onClick={onOpenInstallModal}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white font-semibold border border-emerald-500/50 shadow-lg shadow-emerald-950/40 transition-all hover:scale-105 active:scale-95"
            >
              <ArrowDownToLine className="w-4 h-4 text-emerald-200" />
              <span>Download & Install App (Play Store)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Founder's Daily Motivational Word Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-950/40 rounded-2xl border border-amber-800/40 p-5 sm:p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex-shrink-0 flex items-center justify-center text-amber-300">
            <Sunrise className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
                Isaka Ambokile's Heart Message
              </span>
              <span className="text-stone-500">•</span>
              <span className="text-xs text-stone-400">Daily Spiritual Exhortation</span>
            </div>
            <p className="text-base sm:text-lg text-amber-100 font-scripture italic mt-1 leading-snug">
              "{daily.founderQuote}"
            </p>
          </div>
        </div>

        <button
          onClick={() => copyToClipboard(daily.founderQuote, 'founder')}
          className="flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-800 text-xs text-amber-300 border border-amber-800/40 transition"
        >
          {copiedType === 'founder' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Share Quote</span>
            </>
          )}
        </button>
      </div>

      {/* Daily Main Showcase: Verse of the Day + Daily Motivational Prayer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Verse of the Day & Morning Motivation */}
        <div className="lg:col-span-7 space-y-6">
          {/* Verse of the Day Card */}
          <div className="bg-stone-900/90 rounded-3xl border border-amber-800/40 p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide uppercase">
                  Scripture of the Day ({daily.translation})
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(`${daily.verseReference} (${daily.translation}): "${daily.verseText}"`, 'verse')}
                  className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-200 transition"
                  title="Copy Scripture"
                >
                  {copiedType === 'verse' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-amber-200 font-heading">
                {daily.verseReference}
              </h2>

              <blockquote className="text-lg sm:text-xl text-stone-100 font-scripture leading-relaxed italic border-l-4 border-amber-500 pl-4 py-1">
                "{daily.verseText}"
              </blockquote>

              {/* Morning Motivation commentary */}
              <div className="pt-3 border-t border-stone-800 space-y-2">
                <h4 className="text-xs uppercase tracking-wider text-amber-400/90 font-semibold flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Daily Motivation for Victory</span>
                </h4>
                <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                  {daily.morningMotivation}
                </p>
              </div>

              {/* Cultural Insight Spotlight Box */}
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-900/50 space-y-1.5">
                <div className="flex items-center space-x-2 text-amber-300 font-semibold text-xs tracking-wide">
                  <ScrollText className="w-4 h-4 text-amber-400" />
                  <span>Ancient Hebrew / Cultural Context</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-300 leading-normal">
                  {daily.culturalInsight}
                </p>
              </div>

              {/* Spoken Faith Declaration */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-amber-600/40 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400">
                    Daily Spoken Faith Declaration
                  </span>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    "{daily.spokenDeclaration}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Cultural Question Starters */}
          <div className="bg-stone-900/60 rounded-2xl border border-stone-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Explore Biblical Cultures with Isaac AI</span>
              </span>
              <button
                onClick={() => onNavigateTab('chat')}
                className="text-xs text-stone-400 hover:text-amber-300 underline"
              >
                Open Full Chat &rarr;
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                'Why was foot washing so culturally shocking in Jesus\' day?',
                'Explain the ancient Jewish wedding custom and the bridegroom.',
                'What does the "covenant of salt" mean in the Bible?',
                'How does original Hebrew "Hesed" differ from modern "love"?',
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onAskQuestionInChat(q)}
                  className="text-left p-3 rounded-xl bg-stone-800/80 hover:bg-stone-850 hover:border-amber-600/50 border border-stone-700/60 text-stone-200 transition group flex items-start space-x-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span className="line-clamp-2">{q}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Daily Motivational Prayer & Audio Reader */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-b from-stone-900 via-stone-900 to-amber-950/40 rounded-3xl border border-amber-700/50 p-6 sm:p-7 shadow-xl space-y-5">
            {/* Header of prayer */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Heart className="w-4 h-4 fill-amber-400/30" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-white">
                    Daily Motivational Prayer
                  </h3>
                  <p className="text-xs text-amber-300/80">
                    Curated with Isaka Ambokile
                  </p>
                </div>
              </div>

              {/* Listen Aloud Button */}
              <button
                onClick={handleToggleSpeech}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  isPlayingAudio
                    ? 'bg-amber-500 text-stone-950 shadow-md animate-pulse'
                    : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-700/50'
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Audio</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Listen Aloud</span>
                  </>
                )}
              </button>
            </div>

            {/* Prayer Text */}
            <div className="bg-stone-950/70 p-5 rounded-2xl border border-stone-800/80 text-stone-200 font-scripture text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {daily.prayer}
            </div>

            {/* Reflection question */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs text-stone-300">
              <span className="font-bold text-amber-300 block mb-1">
                Spiritual Meditation Question:
              </span>
              {daily.reflectionQuestion}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => copyToClipboard(daily.prayer, 'prayer')}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs text-amber-200 border border-stone-700 transition"
              >
                {copiedType === 'prayer' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Prayer Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Prayer</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsPrayerModalOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pray for My Need</span>
              </button>
            </div>
          </div>

          {/* Hub Pillars Card */}
          <div className="bg-stone-900/80 rounded-2xl border border-stone-800 p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Core Pillars of Isaac Christian Hub
            </h4>
            <div className="space-y-2 text-xs text-stone-300">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span><strong className="text-white">Pure Biblical Truth:</strong> Rooted strictly in Scripture without cultural distortion.</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span><strong className="text-white">Ancient Context:</strong> Understand Hebrew idioms, feasts, and Greco-Roman world.</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span><strong className="text-white">Daily Strength:</strong> Inspiring daily prayers and motivation led with Isaka Ambokile.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Prayer Generator Modal */}
      {isPrayerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-amber-700/60 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-bold text-xl text-white">
                  Personal Prayer Request
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsPrayerModalOpen(false);
                  setCustomPrayerResult(null);
                }}
                className="text-stone-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {!customPrayerResult ? (
              <form onSubmit={handleGenerateCustomPrayer} className="space-y-4">
                <p className="text-sm text-stone-300">
                  Bring your burden, trial, or praise to God. Isaac Christian Hub will craft a customized biblical prayer and faith declaration tailored for your specific season.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1">
                      Your Name (optional)
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Isaka, Sarah, David..."
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center space-x-1">
                      <Languages className="w-3.5 h-3.5 text-amber-400" />
                      <span>Prayer Language</span>
                    </label>
                    <select
                      value={prayerLanguage}
                      onChange={(e) => setPrayerLanguage(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="English">English</option>
                      <option value="Swahili">Kiswahili (Swahili)</option>
                      <option value="Spanish">Español (Spanish)</option>
                      <option value="French">Français (French)</option>
                      <option value="Portuguese">Português (Portuguese)</option>
                      <option value="German">Deutsch (German)</option>
                      <option value="Arabic">العربية (Arabic)</option>
                      <option value="Amharic">አማርኛ (Amharic)</option>
                      <option value="Yoruba">Yorùbá</option>
                      <option value="Zulu">isiZulu</option>
                      <option value="Hindi">हिन्दी (Hindi)</option>
                      <option value="Chinese">中文 (Chinese)</option>
                      <option value="Tagalog">Tagalog</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">
                    What need, battle, or prayer request are you presenting to God?
                  </label>
                  <textarea
                    rows={3}
                    value={prayerNeed}
                    onChange={(e) => setPrayerNeed(e.target.value)}
                    placeholder="e.g. Peace over an upcoming medical exam, restoration in my family, financial breakthrough, or finding purpose..."
                    required
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPrayerModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGeneratingPrayer || !prayerNeed.trim()}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold text-sm shadow-md transition"
                  >
                    {isGeneratingPrayer ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Crafting Prayer...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Prayer & Blessing</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-700/60">
                  <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
                    Scripture Anchor: {customPrayerResult.scriptureAnchor}
                  </span>
                  <p className="text-sm font-scripture italic text-amber-100 mt-1">
                    "{customPrayerResult.scriptureText}"
                  </p>
                </div>

                <div>
                  <h4 className="font-heading font-bold text-lg text-white">
                    {customPrayerResult.title}
                  </h4>
                  <p className="text-xs text-amber-300/80 mt-0.5">
                    {customPrayerResult.morningMotivation}
                  </p>
                </div>

                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 text-stone-200 font-scripture text-sm leading-relaxed whitespace-pre-line">
                  {customPrayerResult.prayer}
                </div>

                {customPrayerResult.declaration && (
                  <div className="p-3 rounded-xl bg-stone-900 border border-amber-500/40 text-xs">
                    <strong className="text-amber-400 block mb-0.5">Declaration to Speak Today:</strong>
                    <span className="text-white italic">"{customPrayerResult.declaration}"</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => copyToClipboard(customPrayerResult.prayer, 'custom-prayer')}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs text-amber-200 border border-stone-700"
                  >
                    {copiedType === 'custom-prayer' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Prayer</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setCustomPrayerResult(null);
                      setPrayerNeed('');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs"
                  >
                    Pray Another Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
