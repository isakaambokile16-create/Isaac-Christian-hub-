import React, { useState, useEffect } from 'react';
import { StudyPlan, StudyPlanDay } from '../types';
import { CURATED_STUDY_PLANS } from '../data/mockBiblicalData';
import { speakText } from '../utils/audioUtils';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Scroll,
  Heart,
  HelpCircle,
  Play,
  Square,
  Plus,
  Loader2,
  Trash2,
  Share2,
  BookMarked,
  Save,
  Check,
  Languages
} from 'lucide-react';

interface PersonalizedStudyPlansProps {
  selectedTranslation: string;
  selectedLanguage?: string;
}

export const PersonalizedStudyPlans: React.FC<PersonalizedStudyPlansProps> = ({
  selectedTranslation,
  selectedLanguage = 'English',
}) => {
  // Store user's active and custom plans in localStorage
  const [plans, setPlans] = useState<StudyPlan[]>(() => {
    try {
      const saved = localStorage.getItem('isaac_hub_study_plans');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load plans from localStorage', e);
    }
    return CURATED_STUDY_PLANS;
  });

  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => plans[0]?.id || 'plan-ancient-world');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);

  // New Custom Plan Form State
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [customSeason, setCustomSeason] = useState('');
  const [customDays, setCustomDays] = useState<number>(7);
  const [customMinutes, setCustomMinutes] = useState<number>(15);
  const [customLanguage, setCustomLanguage] = useState(selectedLanguage);
  const [isGenerating, setIsGenerating] = useState(false);

  // Speech & Note State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechController, setSpeechController] = useState<{ stop: () => void } | null>(null);
  const [noteSavedMessage, setNoteSavedMessage] = useState(false);

  // Save to localStorage whenever plans change
  useEffect(() => {
    try {
      localStorage.setItem('isaac_hub_study_plans', JSON.stringify(plans));
    } catch (e) {
      console.warn('Could not save plans', e);
    }
  }, [plans]);

  const activePlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const activeDay: StudyPlanDay | undefined = activePlan?.days?.find((d) => d.day === selectedDayNumber) || activePlan?.days?.[0];

  const handleToggleCompleteDay = (dayNum: number) => {
    setPlans((prevPlans) =>
      prevPlans.map((p) => {
        if (p.id !== activePlan.id) return p;
        const updatedDays = p.days.map((d) => {
          if (d.day === dayNum) {
            return { ...d, completed: !d.completed };
          }
          return d;
        });

        const completedCount = updatedDays.filter((d) => d.completed).length;
        const progressPercentage = Math.round((completedCount / updatedDays.length) * 100);

        return {
          ...p,
          days: updatedDays,
          progressPercentage,
        };
      })
    );
  };

  const handleUpdateNotes = (notes: string) => {
    setPlans((prevPlans) =>
      prevPlans.map((p) => {
        if (p.id !== activePlan.id) return p;
        const updatedDays = p.days.map((d) => {
          if (d.day === selectedDayNumber) {
            return { ...d, userNotes: notes };
          }
          return d;
        });
        return { ...p, days: updatedDays };
      })
    );
  };

  const handleSaveNotesFeedback = () => {
    setNoteSavedMessage(true);
    setTimeout(() => setNoteSavedMessage(false), 2000);
  };

  const handleToggleReadDay = () => {
    if (!activeDay) return;
    if (isPlayingAudio && speechController) {
      speechController.stop();
      setIsPlayingAudio(false);
      setSpeechController(null);
    } else {
      const textToRead = `${activeDay.title}. Scripture: ${activeDay.scripture}. Key Verse: ${activeDay.keyVerse}. Cultural Context: ${activeDay.culturalContext}. Devotional Insight: ${activeDay.devotionalInsight}. Closing Prayer: ${activeDay.prayer}`;
      const ctrl = speakText(
        textToRead,
        () => setIsPlayingAudio(false),
        () => setIsPlayingAudio(true)
      );
      setSpeechController(ctrl);
    }
  };

  const handleGenerateCustomPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: customTopic,
          lifeSeason: customSeason,
          days: customDays,
          dailyMinutes: customMinutes,
          translation: selectedTranslation,
          language: customLanguage,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate study plan');
      const data = await res.json();

      const newPlan: StudyPlan = {
        id: `plan-custom-${Date.now()}`,
        title: data.title || customTopic,
        theme: data.theme || customTopic,
        durationDays: data.days?.length || customDays,
        dailyMinutes: customMinutes,
        category: 'custom',
        founderDedication: data.founderDedication || 'Personalized study plan created with Isaac Christian Hub and Isaka Ambokile.',
        days: data.days || [],
        progressPercentage: 0,
      };

      setPlans((prev) => [newPlan, ...prev]);
      setSelectedPlanId(newPlan.id);
      setSelectedDayNumber(1);
      setIsCreatingPlan(false);
      setCustomTopic('');
      setCustomSeason('');
    } catch (err: any) {
      console.error(err);
      alert('Could not generate personalized plan at this moment. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('Are you sure you want to delete this study plan?')) {
      const updated = plans.filter((p) => p.id !== planId);
      setPlans(updated);
      if (selectedPlanId === planId) {
        setSelectedPlanId(updated[0]?.id || '');
        setSelectedDayNumber(1);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 rounded-3xl border border-amber-800/40 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <BookMarked className="w-3.5 h-3.5" />
            <span>Spiritual Growth Pathways</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-white">
            Personalized Bible Study Plans
          </h2>
          <p className="text-stone-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Journey day-by-day through Scripture paired with rich historical context, Hebrew/Greek cultural illuminations, guided reflections, and prayers curated with <strong className="text-amber-300">Isaka Ambokile</strong>.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingPlan(!isCreatingPlan)}
          className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm shadow-lg shadow-amber-900/30 transition hover:scale-105 active:scale-95 flex-shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isCreatingPlan ? 'View Library' : 'Create Custom AI Plan'}</span>
        </button>
      </div>

      {/* Custom AI Plan Generator Form Drawer */}
      {isCreatingPlan && (
        <div className="bg-stone-900 border border-amber-600/50 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl animate-fade-in">
          <div className="border-b border-stone-800 pb-3">
            <h3 className="text-xl font-heading font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Generate a Tailored Christian Study Plan</span>
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Isaac AI will craft an authentic day-by-day curriculum addressing your current spiritual season and questions.
            </p>
          </div>

          <form onSubmit={handleGenerateCustomPlan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">
                  Topic or Focus of Study *
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. Navigating Fear & Uncertain Futures, Walking in Christ's Humility, Biblical Leadership, Hebrew Words of Praise..."
                  required
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">
                  Your Current Life Season or Need
                </label>
                <input
                  type="text"
                  value={customSeason}
                  onChange={(e) => setCustomSeason(e.target.value)}
                  placeholder="e.g. Starting a new business, overcoming burnout, seeking discernment, family healing..."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">
                  Plan Duration
                </label>
                <select
                  value={customDays}
                  onChange={(e) => setCustomDays(parseInt(e.target.value, 10))}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value={3}>3 Days (Quick Boost)</option>
                  <option value={5}>5 Days (Weekly Journey)</option>
                  <option value={7}>7 Days (Complete Week)</option>
                  <option value={14}>14 Days (Two Weeks Deep)</option>
                  <option value={21}>21 Days (Habit Builder)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">
                  Daily Time
                </label>
                <select
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(parseInt(e.target.value, 10))}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value={5}>5 Minutes</option>
                  <option value={10}>10 Minutes</option>
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center space-x-1">
                  <Languages className="w-3.5 h-3.5 text-amber-400" />
                  <span>Plan Language (All Languages)</span>
                </label>
                <select
                  value={customLanguage}
                  onChange={(e) => setCustomLanguage(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-medium"
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

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingPlan(false)}
                className="px-4 py-2.5 rounded-xl text-stone-400 hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating || !customTopic.trim()}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold text-sm shadow-md transition"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Plan with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate My Plan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Plan Selection Cards Carousel / Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
          Available Study Plans ({plans.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p) => {
            const isSelected = p.id === selectedPlanId;
            const completedCount = p.days.filter((d) => d.completed).length;
            const pct = Math.round((completedCount / (p.days.length || 1)) * 100);

            return (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedPlanId(p.id);
                  setSelectedDayNumber(1);
                }}
                className={`cursor-pointer rounded-2xl p-5 border transition-all text-left relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-stone-900 to-amber-950/40 border-amber-500/80 shadow-lg shadow-amber-950/50 ring-1 ring-amber-500/30'
                    : 'bg-stone-900/80 border-stone-800 hover:border-stone-700 hover:bg-stone-900'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span className="flex items-center space-x-1 text-amber-400 font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{p.durationDays} Days</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{p.dailyMinutes} min/day</span>
                    </span>
                  </div>

                  <h4 className="font-heading font-bold text-white text-base line-clamp-1">
                    {p.title}
                  </h4>
                  <p className="text-xs text-stone-300 line-clamp-2">
                    {p.theme}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="pt-4 space-y-1.5 border-t border-stone-800/80 mt-3">
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>Progress: {completedCount}/{p.days.length} days</span>
                    <span className="font-bold text-amber-300">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {p.category === 'custom' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlan(p.id);
                    }}
                    className="absolute top-3 right-3 text-stone-500 hover:text-red-400 p-1"
                    title="Delete custom plan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Plan Active Runner Interface */}
      {activePlan && (
        <div className="bg-stone-900/90 rounded-3xl border border-amber-800/40 p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Active Plan Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-stone-800 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Active Study Plan
                </span>
                <span className="text-stone-500">•</span>
                <span className="text-xs text-stone-400">
                  {activePlan.durationDays} Days Total
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-1">
                {activePlan.title}
              </h3>
              {activePlan.founderDedication && (
                <p className="text-xs text-amber-200/80 italic mt-1">
                  "{activePlan.founderDedication}"
                </p>
              )}
            </div>

            {/* Read Day Aloud button */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleToggleReadDay}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                  isPlayingAudio
                    ? 'bg-amber-500 text-stone-950 border-amber-400 animate-pulse'
                    : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border-stone-700'
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
                    <span>Listen to Day {selectedDayNumber}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Day Navigation Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
            {activePlan.days.map((d) => {
              const isCurrent = d.day === selectedDayNumber;
              const isCompleted = d.completed;
              return (
                <button
                  key={d.day}
                  onClick={() => setSelectedDayNumber(d.day)}
                  className={`flex-shrink-0 flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                    isCurrent
                      ? 'bg-amber-600 text-stone-950 border-amber-500 shadow-md'
                      : isCompleted
                      ? 'bg-stone-950 text-emerald-400 border-emerald-900/60'
                      : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-800'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 opacity-50" />
                  )}
                  <span>Day {d.day}</span>
                </button>
              );
            })}
          </div>

          {/* Active Day Content Details */}
          {activeDay && (
            <div className="space-y-6 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-950/70 p-4 rounded-2xl border border-stone-800">
                <div>
                  <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                    Day {activeDay.day} of {activePlan.durationDays}
                  </span>
                  <h4 className="text-xl font-heading font-bold text-white mt-0.5">
                    {activeDay.title}
                  </h4>
                  <p className="text-xs text-amber-300/90 font-mono mt-0.5">
                    Passage: {activeDay.scripture} ({selectedTranslation})
                  </p>
                </div>

                <button
                  onClick={() => handleToggleCompleteDay(activeDay.day)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-sm ${
                    activeDay.completed
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-600/30'
                      : 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{activeDay.completed ? 'Completed ✓ (Tap to Undo)' : 'Mark Day Completed'}</span>
                </button>
              </div>

              {/* Key Scripture Quote */}
              <div className="p-5 rounded-2xl bg-amber-950/30 border-l-4 border-amber-500 border-stone-800/80 space-y-2">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wide">
                  Key Scripture Memory Verse:
                </span>
                <blockquote className="text-base sm:text-lg text-white font-scripture italic leading-relaxed">
                  "{activeDay.keyVerse}"
                </blockquote>
              </div>

              {/* Cultural Context Spotlight */}
              <div className="p-5 rounded-2xl bg-stone-950/90 border border-amber-900/40 space-y-2">
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <Scroll className="w-4 h-4 text-amber-400" />
                  <span>Ancient Hebrew / Greco-Roman Cultural Context</span>
                </div>
                <p className="text-stone-300 text-sm leading-relaxed">
                  {activeDay.culturalContext}
                </p>
              </div>

              {/* Devotional Insight */}
              <div className="p-5 rounded-2xl bg-stone-950/90 border border-stone-800 space-y-2">
                <div className="flex items-center space-x-2 text-stone-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Devotional Teaching for Modern Hearts</span>
                </div>
                <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                  {activeDay.devotionalInsight}
                </p>
              </div>

              {/* Reflection Question & Daily Prayer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5">
                  <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>Personal Reflection Question</span>
                  </div>
                  <p className="text-stone-300 text-xs sm:text-sm">
                    {activeDay.reflectionQuestion}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5">
                  <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
                    <Heart className="w-4 h-4 text-amber-400" />
                    <span>Closing Guided Prayer</span>
                  </div>
                  <p className="text-stone-300 text-xs sm:text-sm font-scripture italic">
                    "{activeDay.prayer}"
                  </p>
                </div>
              </div>

              {/* User Personal Journal Notes for this day */}
              <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>My Day {activeDay.day} Journal Notes & Insights</span>
                  </span>
                  {noteSavedMessage && (
                    <span className="text-xs text-emerald-400 flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Notes Saved!</span>
                    </span>
                  )}
                </div>

                <textarea
                  rows={3}
                  value={activeDay.userNotes || ''}
                  onChange={(e) => handleUpdateNotes(e.target.value)}
                  onBlur={handleSaveNotesFeedback}
                  placeholder="Record what the Holy Spirit revealed to you today, your prayers, or personal commitments..."
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
