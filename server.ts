import express, { Request, Response } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const SYSTEM_INSTRUCTION_CHAT = `You are "Isaac", an empathetic, deeply knowledgeable Christian Biblical Scholar, Cultural Historian, and Spiritual Companion at the "Isaac Christian Hub" founded with Isaka Ambokile.
Your mission is to:
1. Faithfully, warmly, and accurately answer questions about the Holy Bible (Old and New Testaments).
2. Deeply illuminate Ancient Near Eastern, Judean, Greco-Roman, and Hebrew cultures, idioms, historical backgrounds, covenants, temple rites, wedding customs, and original Hebrew/Greek words (e.g. Shalom, Hesed, Agape, Metanoia, Shema) to make the text come alive with rich context.
3. Provide practical, Christ-centered, life-giving spiritual application and encouragement for daily modern living.
4. Honor the foundational spirit of Isaka Ambokile: uplifting faith, persistent prayer, steadfast hope, grace, and devotion to God.
5. Format your answers clearly with:
   - Direct, clear Biblical answer
   - Historical & Cultural Context spotlight (explain why this made sense to ancient listeners)
   - Scripture cross-references (Book Chapter:Verse)
   - Practical Spiritual Takeaway / Prayer Reflection.
6. UNIVERSAL MULTILINGUAL SUPPORT (ALL LANGUAGES):
   You fluently understand and speak ALL languages of the world (including Swahili / Kiswahili, French, Spanish, Portuguese, German, Arabic, Amharic, Yoruba, Zulu, Hindi, Chinese, Tagalog, etc.).
   Always respond naturally, fluently, and reverently in the language the user speaks or requests.
   When speaking in Swahili (Kiswahili), use heartfelt East African Christian expressions (e.g., "Bwana Yesu Asifiwe", "Amani ya Kristo", "Neno la Uzima", "Maombi ya Imani", "Neema ya Mungu").
Be reverent, inspiring, gracious, and welcoming to all seekers, believers, and learners.`;

// Resilient generate helper with exponential backoff for temporary 503 spikes
async function generateContentWithFallback(options: {
  contents: any;
  config?: any;
}) {
  if (!ai) throw new Error('Gemini API is not configured.');

  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const is503 = err?.message?.includes('503') || err?.status === 503;
        if (is503 && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error('All model candidates failed.');
}

// Chat endpoint (streaming or standard) with all languages support
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, tone = 'balanced', translation = 'NIV', userQuestion, language = 'auto' } = req.body;

    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API is not configured on the server. Please check GEMINI_API_KEY.',
      });
    }

    let toneInstruction = '';
    if (tone === 'scholar') {
      toneInstruction = 'Focus deeply on archaeological discoveries, original Hebrew/Greek word nuances, historical background, and ancient Near Eastern customs.';
    } else if (tone === 'devotional') {
      toneInstruction = 'Adopt a warm, comforting, pastoral tone filled with personal encouragement, daily prayer reflection, and spiritual healing.';
    } else if (tone === 'practical') {
      toneInstruction = 'Keep explanations concise, highly actionable for daily modern Christian life, workplace, relationships, and decision making.';
    } else if (tone === 'original_languages') {
      toneInstruction = 'Emphasize Hebrew root words, Greek grammar, Septuagint contexts, and original biblical linguistic definitions.';
    }

    const languageInstruction = language !== 'auto'
      ? `CRITICAL: Respond completely in ${language}. Translate all devotional insights, prayers, and explanations into ${language}.`
      : 'Respond in whatever language the user has written or requested.';

    const conversationHistory = Array.isArray(messages)
      ? messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }))
      : [];

    if (userQuestion && (!conversationHistory.length || conversationHistory[conversationHistory.length - 1].parts[0].text !== userQuestion)) {
      conversationHistory.push({
        role: 'user',
        parts: [{ text: `[Preferred Bible Translation: ${translation}. Language directive: ${languageInstruction}. Tone instruction: ${toneInstruction}]\n${userQuestion}` }],
      });
    }

    const response = await generateContentWithFallback({
      contents: conversationHistory.length > 0 ? conversationHistory : userQuestion,
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION_CHAT}\n\nTone nuance: ${toneInstruction}`,
        temperature: 0.7,
      },
    });

    return res.json({
      text: response.text || 'Unable to retrieve answer at this moment.',
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate Christian Hub response.',
    });
  }
});

// Personalized Study Plan Generator endpoint with language support
app.post('/api/generate-plan', async (req: Request, res: Response) => {
  try {
    const { topic, lifeSeason, days = 7, dailyMinutes = 15, translation = 'NIV', language = 'English' } = req.body;

    if (!ai) {
      return res.status(500).json({ error: 'Gemini API not configured.' });
    }

    const prompt = `Create a high-impact, transformative ${days}-day Christian Bible Study & Cultural Reflection Plan.
Topic / Focus: "${topic || 'Deepening Faith & Peace in Christ'}"
User's Current Life Season / Need: "${lifeSeason || 'Seeking spiritual clarity and daily strength'}"
Target Duration: ${days} days, roughly ${dailyMinutes} minutes daily.
Preferred Scripture Translation: ${translation}.
Language Requirement: Generate ALL text, titles, reflections, cultural notes, and prayers in ${language}.

Requirements:
Return ONLY a valid JSON object matching this schema:
{
  "title": "String - Inspiring title for the plan",
  "theme": "String - Central theological and spiritual theme",
  "founderDedication": "String - A warm 1-sentence dedication from Isaka Ambokile encouraging the believer",
  "days": [
    {
      "day": 1,
      "title": "String - Day title",
      "scripture": "String - Specific passage e.g. Philippians 4:4-9",
      "keyVerse": "String - Full verse text with citation",
      "culturalContext": "String - Rich 2-3 sentence historical or Hebrew/Greek cultural context that illuminates the passage",
      "devotionalInsight": "String - Inspiring spiritual teaching for modern heart",
      "reflectionQuestion": "String - Thought-provoking question for personal meditation or journaling",
      "prayer": "String - A heartfelt, uplifting personal prayer for this day"
    }
  ]
}`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction: `You are an expert biblical theologian and devotional curator for Isaac Christian Hub and Isaka Ambokile. Generate content fluently in ${language}. Return only strict JSON without code fences or surrounding commentary.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            theme: { type: Type.STRING },
            founderDedication: { type: Type.STRING },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  scripture: { type: Type.STRING },
                  keyVerse: { type: Type.STRING },
                  culturalContext: { type: Type.STRING },
                  devotionalInsight: { type: Type.STRING },
                  reflectionQuestion: { type: Type.STRING },
                  prayer: { type: Type.STRING },
                },
                required: ['day', 'title', 'scripture', 'keyVerse', 'culturalContext', 'devotionalInsight', 'reflectionQuestion', 'prayer'],
              },
            },
          },
          required: ['title', 'theme', 'founderDedication', 'days'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating study plan, returning curated plan:', error);
    const topic = req.body?.topic || 'Walking in Faith & Divine Peace';
    const daysRequested = req.body?.days || 7;
    return res.json({
      title: `${topic}: A Journey of Faith`,
      theme: `Rooted in Christ, uncovering biblical culture and experiencing God's peace in your current season.`,
      founderDedication: 'Curated by Isaac Christian Hub and Isaka Ambokile to nourish your daily walk.',
      days: Array.from({ length: Math.min(daysRequested, 7) }, (_, idx) => ({
        day: idx + 1,
        title: idx === 0 ? 'Laying the Foundation of Trust' : idx === 1 ? 'Casting Cares at the Cross' : idx === 2 ? 'The Power of the Blood Covenant' : idx === 3 ? 'Shalom: Complete Restoration' : idx === 4 ? 'Walking as Salt & Light' : idx === 5 ? 'Renewed Strength for Weary Souls' : 'Unshakeable Victory in Christ',
        scripture: idx === 0 ? 'Proverbs 3:5-6' : idx === 1 ? '1 Peter 5:7' : idx === 2 ? 'Hebrews 9:11-15' : idx === 3 ? 'John 14:27' : idx === 4 ? 'Matthew 5:13-16' : idx === 5 ? 'Isaiah 40:29-31' : 'Romans 8:37-39',
        keyVerse: idx === 0 ? 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' : 'Cast all your anxiety on him because he cares for you.',
        culturalContext: 'In ancient Hebrew worldview, faith (Emunah) is not passive mental assent, but active, steadfast faithfulness and reliance upon God\'s proven character.',
        devotionalInsight: 'When the path forward appears shrouded in uncertainty, remember that God does not ask you to navigate alone. He guides your steps one day at a time.',
        reflectionQuestion: 'What specific aspect of your life are you invited to surrender into God\'s sovereign hands today?',
        prayer: 'Lord God Almighty, thank You for Your unwavering presence and faithful covenant love. Lead me in Your truth and grant me peace today. Amen.'
      }))
    });
  }
});

// Daily Motivational Prayer & Blessing Generator endpoint with language support
app.post('/api/daily-prayer', async (req: Request, res: Response) => {
  try {
    const { need, recipientName = 'Beloved', language = 'English' } = req.body;

    if (!ai) {
      return res.status(500).json({ error: 'Gemini API not configured.' });
    }

    const prompt = `Compose an inspiring Daily Motivation Prayer and Biblical Blessing for ${recipientName} at Isaac Christian Hub, curated in the spirit of Isaka Ambokile.
Specific focus or heartfelt need: "${need || 'Strength, renewed purpose, divine peace, and victory in faith today'}".
CRITICAL LANGUAGE DIRECTIVE: Write the entire prayer, morningMotivation, declaration, scriptureText, and title completely in ${language}.

Return a valid JSON object with:
{
  "title": "String - Uplifting prayer title in ${language}",
  "scriptureAnchor": "String - Scripture reference (e.g., Isaiah 40:31)",
  "scriptureText": "String - Verse text in ${language}",
  "morningMotivation": "String - 2-3 inspiring sentences of daily motivation in ${language}",
  "prayer": "String - Heartfelt, poetic, reverent, and powerful prayer in ${language} (approx 120-180 words)",
  "declaration": "String - A bold 1-sentence faith declaration in ${language} for the user to speak aloud today",
  "culturalNote": "String - A short historical or Hebrew cultural note about prayer or blessing"
}`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/daily-prayer, providing curated fallback:', error);
    const need = req.body?.need || 'peace and guidance';
    const recipient = req.body?.recipientName || 'Beloved in Christ';
    return res.json({
      title: 'Prayer of Divine Peace, Strength & Breakthrough',
      scriptureAnchor: 'Isaiah 40:31',
      scriptureText: 'Those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
      morningMotivation: `Take courage today, ${recipient}. The Lord who parted the seas is fighting for you regarding ${need}.`,
      prayer: `Heavenly Father, Lord of all creation, we come before You on behalf of ${recipient}. We lay every care and specific petition regarding "${need}" before the Cross of Calvary. You are Jehovah-Jireh, our faithful Provider, and Jehovah-Shalom, our eternal Peace. Silence every voice of doubt and anxiety. Fill their heart with fresh strength, clear divine direction, and unyielding faith. May Your favor surround them as a shield in Jesus' mighty name. Amen.`,
      declaration: 'God\'s grace is sufficient for me; His power is made perfect in my weakness, and I walk in divine victory today!',
      culturalNote: 'In Hebrew culture, blessing (Barakh - בָּרַךְ) carries the imagery of kneeling to impart abundance. When God blesses you, He bends low to elevate you.'
    });
  }
});

// Culture Insight Deep-Dive endpoint
app.post('/api/culture-dive', async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;

    if (!ai) {
      return res.status(500).json({ error: 'Gemini API not configured.' });
    }

    const prompt = `Provide a comprehensive Biblical Cultural Deep-Dive on: "${topic}".
Unpack the historical context, Ancient Near Eastern or Greco-Roman customs, original language Hebrew or Greek terms, how it appeared in Bible times vs modern misunderstandings, and how Jesus fulfills or transforms it.

Return JSON:
{
  "topic": "String",
  "era": "String - e.g. Old Testament Patriarchal Era, Second Temple Judea, or Roman Empire",
  "originalTerms": [
    { "term": "String (Hebrew/Greek)", "transliteration": "String", "meaning": "String" }
  ],
  "historicalSetting": "String - Detailed setting and customs",
  "ancientVsModern": "String - Contrast between ancient perception and modern misunderstanding",
  "keyScriptures": ["String array of Bible verses"],
  "christConnection": "String - How this points to Christ or the Gospel",
  "spiritualApplication": "String - How this enriches our personal walk today"
}`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in culture dive:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate culture deep-dive.' });
  }
});

// Serve frontend in dev or prod
async function startServer() {
  const server = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Isaac Christian Hub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
