import React, { useState } from 'react';
import { CulturalTopic } from '../types';
import { CULTURAL_ENCYCLOPEDIA } from '../data/mockBiblicalData';
import {
  Compass,
  Search,
  BookOpen,
  ScrollText,
  Sparkles,
  ArrowRight,
  Flame,
  Languages,
  Calendar,
  Layers,
  Check,
  Copy
} from 'lucide-react';

interface BiblicalCultureExplorerProps {
  onAskInChat: (question: string) => void;
}

export const BiblicalCultureExplorer: React.FC<BiblicalCultureExplorerProps> = ({
  onAskInChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTopic, setActiveTopic] = useState<CulturalTopic | null>(null);
  const [copiedTopic, setCopiedTopic] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'All Cultures & Customs' },
    { id: 'feasts', label: 'Biblical Feasts' },
    { id: 'customs', label: 'Ancient Customs' },
    { id: 'languages', label: 'Hebrew & Greek Studies' },
  ];

  const filteredTopics = CULTURAL_ENCYCLOPEDIA.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.originalTerm?.meaning && item.originalTerm.meaning.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTopic(true);
    setTimeout(() => setCopiedTopic(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 rounded-3xl border border-amber-800/40 p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Biblical Antiquity & Cultural Backgrounds</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-white">
            Biblical Cultures & Ancient Customs
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            The Bible was written in an Ancient Near Eastern and 1st-century Greco-Roman world. Uncovering original Hebrew terms, marriage rites, covenants, and temple ceremonies brings the words of Jesus into vivid 3D clarity!
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-stone-950 font-bold shadow-md'
                  : 'bg-stone-900/90 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customs, terms..."
            className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            onClick={() => setActiveTopic(topic)}
            className="group cursor-pointer bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-amber-600/50 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-amber-950/30 hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                  {topic.category.toUpperCase()}
                </span>
                <span className="text-[11px] text-stone-500">{topic.era}</span>
              </div>

              {topic.originalTerm && (
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold text-amber-200 font-serif">
                    {topic.originalTerm.term}
                  </span>
                  <span className="text-xs text-stone-400">
                    ({topic.originalTerm.transliteration} – "{topic.originalTerm.meaning}")
                  </span>
                </div>
              )}

              <h3 className="font-heading font-bold text-white text-lg group-hover:text-amber-300 transition-colors">
                {topic.title}
              </h3>

              <p className="text-stone-300 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                {topic.summary}
              </p>
            </div>

            <div className="pt-4 border-t border-stone-800/80 mt-4 flex items-center justify-between text-xs text-amber-400 font-semibold">
              <span>Explore Cultural Context</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Cultural Deep-Dive Modal */}
      {activeTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-amber-700/60 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-stone-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {activeTopic.category} • {activeTopic.era}
                </span>
                <h3 className="font-heading font-bold text-2xl text-white mt-1">
                  {activeTopic.title}
                </h3>
                {activeTopic.originalTerm && (
                  <div className="mt-1 flex items-center space-x-2 text-sm text-amber-200">
                    <span className="text-lg font-serif">{activeTopic.originalTerm.term}</span>
                    <span className="text-stone-400">({activeTopic.originalTerm.transliteration})</span>
                    <span className="text-stone-300 italic">— "{activeTopic.originalTerm.meaning}"</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setActiveTopic(null)}
                className="text-stone-400 hover:text-white p-1 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Historical Background */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center space-x-1.5">
                <ScrollText className="w-3.5 h-3.5" />
                <span>Ancient Historical Setting & Customs</span>
              </h4>
              <p className="text-stone-200 text-sm leading-relaxed bg-stone-950 p-4 rounded-2xl border border-stone-800">
                {activeTopic.historicalBackground}
              </p>
            </div>

            {/* Christ Connection */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Prophetic Fulfillment in Jesus Christ</span>
              </h4>
              <p className="text-amber-100 text-sm leading-relaxed bg-amber-950/30 p-4 rounded-2xl border border-amber-900/40">
                {activeTopic.christConnection}
              </p>
            </div>

            {/* Modern Application */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Spiritual Life Application Today</span>
              </h4>
              <p className="text-stone-300 text-sm leading-relaxed bg-stone-950 p-4 rounded-2xl border border-stone-800">
                {activeTopic.modernApplication}
              </p>
            </div>

            {/* Key Scriptures */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Scripture Citations:
              </span>
              <div className="flex flex-wrap gap-2">
                {activeTopic.biblicalReferences.map((ref, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-stone-800 text-stone-200 text-xs font-mono border border-stone-700"
                  >
                    {ref}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-800">
              <button
                onClick={() =>
                  handleCopyContent(
                    `${activeTopic.title}\n\nHistorical Background: ${activeTopic.historicalBackground}\n\nFulfillment in Christ: ${activeTopic.christConnection}\n\nModern Application: ${activeTopic.modernApplication}`
                  )
                }
                className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs text-amber-200 border border-stone-700 transition"
              >
                {copiedTopic ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Study Guide</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  const q = `Explain in deep biblical and cultural detail: ${activeTopic.title}. What was its significance in ancient times and how does it relate to Jesus?`;
                  setActiveTopic(null);
                  onAskInChat(q);
                }}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask Isaac AI to Deep-Dive</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
