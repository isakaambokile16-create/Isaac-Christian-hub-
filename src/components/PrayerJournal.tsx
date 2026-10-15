import React, { useState, useEffect } from 'react';
import { PrayerItem } from '../types';
import {
  BookmarkCheck,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Heart,
  Trash2,
  BookOpen,
  Calendar,
  ShieldCheck,
  Flame,
  Award
} from 'lucide-react';

interface JournalNote {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

interface PrayerJournalProps {
  initialSavedNotes?: JournalNote[];
  onOpenChat: () => void;
}

export const PrayerJournal: React.FC<PrayerJournalProps> = ({
  initialSavedNotes = [],
  onOpenChat,
}) => {
  // Prayer items persisted in localStorage
  const [prayers, setPrayers] = useState<PrayerItem[]>(() => {
    try {
      const saved = localStorage.getItem('isaac_hub_prayers');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return [
      {
        id: 'p-1',
        title: 'Peace & Wisdom in Daily Work',
        request: 'Seeking the guidance of the Holy Spirit to lead with Christ-like integrity, patience, and divine wisdom in all decisions.',
        category: 'work',
        dateCreated: 'Today',
        isAnswered: true,
        answeredDate: 'Answered with praise!',
        answerNote: 'God granted clarity and supernatural peace during a tense meeting. Praise Jesus!',
      },
      {
        id: 'p-2',
        title: 'Spiritual Renewal & Deep Prayer Life',
        request: 'That the Lord would ignite a fresh hunger for Scripture, consistent prayer time, and deeper intimacy with Him.',
        category: 'faith',
        dateCreated: 'Recent',
        isAnswered: false,
      },
    ];
  });

  const [notes, setNotes] = useState<JournalNote[]>(() => {
    try {
      const saved = localStorage.getItem('isaac_hub_journal_notes');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return initialSavedNotes;
  });

  // New prayer modal/form
  const [isAddingPrayer, setIsAddingPrayer] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newRequest, setNewRequest] = useState('');
  const [newCategory, setNewCategory] = useState<'family' | 'health' | 'faith' | 'work' | 'general'>('faith');

  // Answer note state for marking prayer answered
  const [answeringPrayerId, setAnsweringPrayerId] = useState<string | null>(null);
  const [answerNoteInput, setAnswerNoteInput] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('isaac_hub_prayers', JSON.stringify(prayers));
    } catch (e) {
      console.warn(e);
    }
  }, [prayers]);

  useEffect(() => {
    try {
      localStorage.setItem('isaac_hub_journal_notes', JSON.stringify(notes));
    } catch (e) {
      console.warn(e);
    }
  }, [notes]);

  const handleAddPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newRequest.trim()) return;

    const newItem: PrayerItem = {
      id: `p-${Date.now()}`,
      title: newTitle.trim(),
      request: newRequest.trim(),
      category: newCategory,
      dateCreated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      isAnswered: false,
    };

    setPrayers([newItem, ...prayers]);
    setNewTitle('');
    setNewRequest('');
    setIsAddingPrayer(false);
  };

  const handleConfirmAnswered = (id: string) => {
    setPrayers((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            isAnswered: true,
            answeredDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            answerNote: answerNoteInput.trim() || 'Answered by God\'s grace!',
          };
        }
        return p;
      })
    );
    setAnsweringPrayerId(null);
    setAnswerNoteInput('');
  };

  const handleDeletePrayer = (id: string) => {
    setPrayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const answeredCount = prayers.filter((p) => p.isAnswered).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 rounded-3xl border border-amber-800/40 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Spiritual Sanctuary & Remembrance</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-white">
            Personal Prayer & Study Journal
          </h2>
          <p className="text-stone-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            "And they overcame him by the blood of the Lamb and by the word of their testimony." Record your prayers, witness God's faithful answers, and revisit your saved Bible study notes.
          </p>
        </div>

        <button
          onClick={() => setIsAddingPrayer(!isAddingPrayer)}
          className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm shadow-lg shadow-amber-900/30 transition hover:scale-105 active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Prayer Request</span>
        </button>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-white">{prayers.length}</span>
            <p className="text-xs text-stone-400">Total Recorded Prayers</p>
          </div>
        </div>

        <div className="bg-stone-900/90 border border-emerald-900/40 rounded-2xl p-4 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-emerald-300">{answeredCount}</span>
            <p className="text-xs text-stone-400">Answered Prayers (Testimonies)</p>
          </div>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center text-amber-300">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-white">{notes.length}</span>
            <p className="text-xs text-stone-400">Saved Study Insights</p>
          </div>
        </div>
      </div>

      {/* Add Prayer Drawer / Form */}
      {isAddingPrayer && (
        <form
          onSubmit={handleAddPrayer}
          className="bg-stone-900 border border-amber-600/50 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="font-heading font-bold text-lg text-white flex items-center space-x-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>Record a New Prayer Intention</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingPrayer(false)}
              className="text-stone-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-amber-300 mb-1">
                Prayer Title *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Healing for Mom, Financial Breakthrough, Guidance in Career..."
                required
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="faith">Faith & Walk with God</option>
                <option value="family">Family & Relationships</option>
                <option value="health">Health & Healing</option>
                <option value="work">Work, Business & Studies</option>
                <option value="general">General Intercession</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-300 mb-1">
              Your Heartfelt Prayer & Scripture Promises to Stand Upon *
            </label>
            <textarea
              rows={3}
              value={newRequest}
              onChange={(e) => setNewRequest(e.target.value)}
              placeholder="Write out your prayer to God and any verses you are trusting..."
              required
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingPrayer(false)}
              className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md transition"
            >
              Save Prayer Request
            </button>
          </div>
        </form>
      )}

      {/* Answered Prayer Note Modal */}
      {answeringPrayerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-emerald-600/50 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-heading font-bold text-lg text-white">
                Testimony of Answered Prayer!
              </h3>
            </div>
            <p className="text-xs text-stone-300">
              How did the Lord move? Share a brief praise report or note of thanksgiving to commemorate this milestone.
            </p>
            <textarea
              rows={3}
              value={answerNoteInput}
              onChange={(e) => setAnswerNoteInput(e.target.value)}
              placeholder="e.g. God provided beyond what I asked for on Tuesday! To God be the glory."
              className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setAnsweringPrayerId(null)}
                className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmAnswered(answeringPrayerId)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
              >
                Mark as Answered 🙌
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Prayers on Left, Saved Study Notes on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left (7 cols): Prayer Requests */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
            <BookmarkCheck className="w-4 h-4" />
            <span>My Active & Answered Prayers</span>
          </h3>

          <div className="space-y-3">
            {prayers.length === 0 ? (
              <div className="text-center py-10 bg-stone-900/60 rounded-3xl border border-stone-800 p-6 space-y-2">
                <p className="text-stone-400 text-sm">No prayer requests recorded yet.</p>
                <button
                  onClick={() => setIsAddingPrayer(true)}
                  className="text-xs text-amber-400 underline font-semibold"
                >
                  Click here to add your first prayer request
                </button>
              </div>
            ) : (
              prayers.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-5 transition-all space-y-3 ${
                    item.isAnswered
                      ? 'bg-gradient-to-r from-stone-900 to-emerald-950/20 border-emerald-800/40'
                      : 'bg-stone-900/80 border-stone-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-stone-500">{item.dateCreated}</span>
                      </div>
                      <h4 className="font-heading font-bold text-white text-base mt-1">
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-1">
                      {!item.isAnswered ? (
                        <button
                          onClick={() => {
                            setAnsweringPrayerId(item.id);
                            setAnswerNoteInput('');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-emerald-900/40 text-stone-300 hover:text-emerald-300 border border-stone-700 text-xs transition"
                          title="Mark this prayer answered"
                        >
                          Mark Answered
                        </button>
                      ) : (
                        <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Answered!</span>
                        </span>
                      )}

                      <button
                        onClick={() => handleDeletePrayer(item.id)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 transition"
                        title="Delete prayer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-scripture">
                    {item.request}
                  </p>

                  {item.isAnswered && item.answerNote && (
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-xs text-emerald-200">
                      <strong className="block text-emerald-400 font-semibold mb-0.5">
                        Testimony:
                      </strong>
                      "{item.answerNote}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right (5 cols): Saved Study Notes & Isaka Ambokile Blessing */}
        <div className="lg:col-span-5 space-y-6">
          {/* Apostolic Blessing Card */}
          <div className="bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-950 rounded-3xl border border-amber-800/40 p-6 space-y-4 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-white text-base">
                  Benediction from Isaka Ambokile
                </h4>
                <p className="text-[11px] text-amber-300">Daily Faith Blessing</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-200 font-scripture italic leading-relaxed">
              "The Lord bless you and keep you; the Lord make His face shine upon you and be gracious to you; the Lord lift up His countenance upon you and give you His unbroken Shalom. Walk boldly in the confidence of the Cross today!"
            </p>
          </div>

          {/* Saved Study Notes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Saved Study Insights ({notes.length})</span>
              </h3>
              <button
                onClick={onOpenChat}
                className="text-xs text-amber-400 hover:underline"
              >
                Ask Isaac AI &rarr;
              </button>
            </div>

            {notes.length === 0 ? (
              <div className="p-6 rounded-2xl bg-stone-900/70 border border-stone-800 text-center space-y-2">
                <p className="text-xs text-stone-400">
                  When you chat with Isaac AI, tap "Save Note" on any answer to bookmark it directly into your spiritual notebook!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-heading font-bold text-white text-sm line-clamp-1">
                        {note.title}
                      </h5>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-stone-500 hover:text-red-400 p-1"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-stone-300 font-scripture line-clamp-4 leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
