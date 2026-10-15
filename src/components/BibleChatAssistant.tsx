import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { speakText } from '../utils/audioUtils';
import {
  Send,
  Loader2,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Bookmark,
  RotateCcw,
  BookOpen,
  Compass,
  Heart,
  Scale,
  Languages,
  Flame,
  Info
} from 'lucide-react';

interface BibleChatAssistantProps {
  selectedTranslation: string;
  selectedLanguage?: string;
  initialQuestion?: string;
  onClearInitialQuestion?: () => void;
  onSaveToJournal?: (title: string, content: string) => void;
}

export const BibleChatAssistant: React.FC<BibleChatAssistantProps> = ({
  selectedTranslation,
  selectedLanguage = 'auto',
  initialQuestion,
  onClearInitialQuestion,
  onSaveToJournal,
}) => {
  const [chatLanguage, setChatLanguage] = useState(selectedLanguage);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Grace and peace to you in Christ Jesus! I am **Isaac**, your Biblical & Cultural Study Companion at the **Isaac Christian Hub**, founded with **Isaka Ambokile**.\n\n🌍 **Multilingual Assistant:** You may ask questions in **ANY language** of the world (including Kiswahili, English, Français, Español, Português, العربية, etc.) and I will gladly respond in that language!\n\nWhether you are curious about ancient Jewish wedding customs, the meaning of Greek or Hebrew idioms, deep theological paradoxes, or how to apply God's Word to anxiety and daily decisions—I am here to explore Scripture and ancient cultures with you.\n\nWhat would you like to discover today?`,
      timestamp: Date.now(),
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTone, setActiveTone] = useState<'balanced' | 'scholar' | 'devotional' | 'practical' | 'original_languages'>('scholar');
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [speechController, setSpeechController] = useState<{ stop: () => void } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle incoming initial question from prompt pills on other tabs
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim().length > 0) {
      sendMessage(initialQuestion);
      if (onClearInitialQuestion) {
        onClearInitialQuestion();
      }
    }
  }, [initialQuestion]);

  const stopCurrentSpeech = () => {
    if (speechController) {
      speechController.stop();
      setSpeechController(null);
      setCurrentlySpeakingId(null);
    }
  };

  const handleToggleSpeakMessage = (msgId: string, text: string) => {
    if (currentlySpeakingId === msgId) {
      stopCurrentSpeech();
    } else {
      stopCurrentSpeech();
      const ctrl = speakText(
        text,
        () => {
          setCurrentlySpeakingId(null);
          setSpeechController(null);
        },
        () => {
          setCurrentlySpeakingId(msgId);
        }
      );
      setSpeechController(ctrl);
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSaveToJournal = (id: string, text: string) => {
    if (onSaveToJournal) {
      const firstLine = text.split('\n')[0].replace(/[#*]/g, '').trim().slice(0, 40);
      onSaveToJournal(firstLine || 'Biblical Study Note', text);
      setSavedId(id);
      setTimeout(() => setSavedId(null), 2500);
    }
  };

  const sendMessage = async (questionToSend?: string) => {
    const text = questionToSend || inputQuestion;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          tone: activeTone,
          translation: selectedTranslation,
          userQuestion: text.trim(),
          language: chatLanguage,
        }),
      });

      if (!res.ok) {
        throw new Error('Server returned an error');
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.text || 'Unable to retrieve answer.',
        timestamp: Date.now(),
        mode: activeTone,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'model',
        content: `I apologize, but I could not connect to the study service at this moment. Please ensure your connection is active and try again.\n\n*"Trust in the Lord with all your heart, and do not lean on your own understanding."* (Proverbs 3:5)`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    stopCurrentSpeech();
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        content: `Chat history cleared. What Scripture passage, ancient culture question, or prayer theme can we explore together now?`,
        timestamp: Date.now(),
      },
    ]);
  };

  const toneOptions = [
    { id: 'scholar', label: 'Ancient Culture & History', icon: <Compass className="w-3.5 h-3.5" />, desc: 'Ancient Near East, Second Temple Judaism, Roman rule, Archaeology' },
    { id: 'devotional', label: 'Pastoral & Devotional', icon: <Heart className="w-3.5 h-3.5" />, desc: 'Spiritual encouragement, heart healing, daily prayer reflections' },
    { id: 'practical', label: 'Daily Life Application', icon: <Flame className="w-3.5 h-3.5" />, desc: 'Modern living, workplace, family, ethics, overcoming anxiety' },
    { id: 'original_languages', label: 'Hebrew & Greek Etymology', icon: <Languages className="w-3.5 h-3.5" />, desc: 'Root word studies, idioms, Septuagint & Greek grammatical nuances' },
  ];

  const suggestedQuestions = [
    { title: '🇹🇿 Kiswahili: Agano la Chumvi', query: 'Nielezee kwa undani maana ya "Agano la Chumvi" (Covenant of Salt) katika muktadha wa utamaduni wa Biblia.' },
    { title: '🇬🇧 The Ancient Wedding', query: 'Explain the ancient Jewish wedding custom and how Jesus fulfills it as the Bridegroom.' },
    { title: '🇹🇿 Kiswahili: Ushindi dhidi ya Wasiwasi', query: 'Biblia inatufundisha nini kuhusu kushinda wasiwasi, hofu na magumu ya maisha?' },
    { title: '🇬🇧 Washing Feet Scandal', query: 'Why was foot washing in John 13 culturally scandalous in 1st century Roman Judea?' },
    { title: '🇪🇸 Español: Significado de Shalom', query: 'Explica el significado bíblico y cultural de la palabra hebrea "Shalom".' },
    { title: '🇫🇷 Français: Le Voile Déchiré', query: 'Quelle est la signification spirituelle et culturelle du voile déchiré dans le Temple?' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Banner introducing the Chatbot */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 rounded-2xl border border-amber-800/40 p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-amber-500/50 shadow-md flex-shrink-0">
            <img
              src="/app-photo.jpg"
              alt="Isaac AI"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-heading font-bold text-white">
                Conversational Scripture & Culture Guide
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Isaac AI
              </span>
            </div>
            <p className="text-xs text-stone-300">
              Anchored in biblical truth & ancient historical context • Curated with Isaka Ambokile
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Language selector for chat */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-stone-950 border border-amber-800/50 text-xs">
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={chatLanguage}
              onChange={(e) => setChatLanguage(e.target.value)}
              className="bg-transparent text-amber-200 text-xs focus:outline-none font-semibold cursor-pointer"
            >
              <option value="auto">🌍 Auto-Detect (Any Language)</option>
              <option value="Swahili">🇹🇿 Kiswahili (Swahili)</option>
              <option value="English">🇬🇧 English</option>
              <option value="Spanish">🇪🇸 Español (Spanish)</option>
              <option value="French">🇫🇷 Français (French)</option>
              <option value="Portuguese">🇵🇹 Português (Portuguese)</option>
              <option value="German">🇩🇪 Deutsch (German)</option>
              <option value="Arabic">🇸🇦 العربية (Arabic)</option>
              <option value="Amharic">🇪🇹 አማርኛ (Amharic)</option>
              <option value="Yoruba">🇳🇬 Yorùbá</option>
              <option value="Zulu">🇿🇦 isiZulu</option>
              <option value="Hindi">🇮🇳 हिन्दी (Hindi)</option>
              <option value="Chinese">🇨🇳 中文 (Chinese)</option>
              <option value="Tagalog">🇵🇭 Tagalog</option>
            </select>
          </div>

          <button
            onClick={handleResetChat}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-800/90 hover:bg-stone-800 text-stone-300 hover:text-white text-xs border border-stone-700 transition"
            title="Clear and restart conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Perspective / Tone Switcher */}
      <div className="bg-stone-900/80 rounded-2xl border border-stone-800 p-3 sm:p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span className="font-semibold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Select Isaac's Study Lens:</span>
          </span>
          <span className="text-[11px] text-stone-400">
            Current Translation: <strong className="text-amber-200">{selectedTranslation}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {toneOptions.map((opt) => {
            const isSelected = activeTone === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setActiveTone(opt.id as any)}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-amber-600/20 border-amber-500/60 text-amber-200 shadow-sm'
                    : 'bg-stone-800/60 border-stone-700/60 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center space-x-1.5 text-xs font-semibold">
                  {opt.icon}
                  <span className="truncate">{opt.label}</span>
                </div>
                <p className="text-[10px] text-stone-400 line-clamp-1 mt-1">
                  {opt.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggested Quick Question Chips */}
      {messages.length <= 2 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            Curated Questions & Cultural Inquiries:
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => sendMessage(sq.query)}
                className="px-3 py-1.5 rounded-full bg-stone-900/90 hover:bg-stone-800 border border-amber-800/40 text-stone-300 hover:text-amber-200 text-xs transition flex items-center space-x-1.5"
              >
                <span className="text-amber-400">✦</span>
                <span>{sq.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="bg-stone-900/90 rounded-3xl border border-stone-800 min-h-[460px] max-h-[600px] overflow-y-auto p-4 sm:p-6 space-y-5 shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md ${
                  isUser
                    ? 'bg-amber-600 text-stone-950 font-bold'
                    : 'bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100 border border-amber-600/40'
                }`}
              >
                {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[78%] space-y-2`}>
                <div
                  className={`p-4 rounded-2xl text-sm sm:text-base leading-relaxed ${
                    isUser
                      ? 'bg-amber-600/90 text-stone-950 font-medium rounded-tr-none'
                      : 'bg-stone-950/80 border border-stone-800 text-stone-200 rounded-tl-none font-scripture'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>

                {/* Model Message Action Toolbar */}
                {!isUser && msg.id !== 'welcome' && msg.id !== 'welcome-reset' && (
                  <div className="flex items-center space-x-2 text-xs text-stone-400 pt-1">
                    <button
                      onClick={() => handleToggleSpeakMessage(msg.id, msg.content)}
                      className="p-1.5 rounded-lg hover:bg-stone-800 hover:text-amber-300 transition flex items-center space-x-1"
                      title={currentlySpeakingId === msg.id ? 'Stop listening' : 'Read aloud'}
                    >
                      {currentlySpeakingId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[11px] text-amber-400">Stop Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Listen</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => copyMessage(msg.id, msg.content)}
                      className="p-1.5 rounded-lg hover:bg-stone-800 hover:text-amber-300 transition flex items-center space-x-1"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[11px] text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Copy</span>
                        </>
                      )}
                    </button>

                    {onSaveToJournal && (
                      <button
                        onClick={() => handleSaveToJournal(msg.id, msg.content)}
                        className="p-1.5 rounded-lg hover:bg-stone-800 hover:text-amber-300 transition flex items-center space-x-1"
                        title="Save to Study Journal"
                      >
                        {savedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-[11px] text-amber-400">Saved to Journal!</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Save Note</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3 animate-fade-in">
            <div className="w-9 h-9 rounded-xl bg-amber-800/40 border border-amber-600/30 flex items-center justify-center text-amber-300">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-stone-300 text-sm flex items-center space-x-3">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Examining Scripture, Hebrew/Greek roots, and ancient context...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="relative"
      >
        <div className="flex items-center rounded-2xl bg-stone-900 border border-amber-800/50 focus-within:border-amber-500 shadow-xl overflow-hidden p-1.5 pl-4 transition">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask a question about Bible passages, ancient cultures, Greek/Hebrew meanings, or life guidance..."
            disabled={isLoading}
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-stone-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={isLoading || !inputQuestion.trim()}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 font-bold text-sm transition shadow-md flex-shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Ask Isaac</span>
          </button>
        </div>
      </form>
    </div>
  );
};
