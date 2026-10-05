import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client setup following official guidelines
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Emergency Helplines Directory (Pakistan & Universal)
const EMERGENCY_HELPLINES = [
  {
    name: 'Police Emergency / Madadgar',
    number: '15',
    category: 'police',
    description: 'Immediate police response & emergency patrol dispatch',
    descriptionUrdu: 'فوری پولیس مدد اور ایمرجنسی پٹرولنگ',
  },
  {
    name: 'Women Protection & Harassment Helpline',
    number: '1043',
    category: 'women',
    description: 'Punjab / National Women Protection Authority & anti-harassment',
    descriptionUrdu: 'خواتین پر تشدد اور ہراسانی کے خلاف حکومتی ہیلپ لائن',
  },
  {
    name: 'Child Protection & Welfare Bureau',
    number: '1121',
    category: 'children',
    description: 'Missing children, child abuse, and emergency rescue',
    descriptionUrdu: 'گمشدہ اور خطرے میں گھرے بچوں کی حفاظت اور بازیابی',
  },
  {
    name: 'Rescue 1122 & Ambulance',
    number: '1122',
    category: 'medical',
    description: 'Emergency medical services, fire rescue, and road safety',
    descriptionUrdu: 'طبی ایمرجنسی، ایمبولینس اور فوری ریسکیو سروس',
  },
  {
    name: 'FIA Cyber Harassment Cell',
    number: '0800-39838',
    category: 'cyber',
    description: 'Online blackmail, cyberstalking, and digital threats against females',
    descriptionUrdu: 'آن لائن بلیک میلنگ اور سائبر ہراسانی کے خلاف رپورٹنگ',
  },
];

// Fallback logic for safety situation analysis
function generateFallbackSafetyAnalysis(situation: string, location: any) {
  const isSevere =
    situation.toLowerCase().includes('follow') ||
    situation.toLowerCase().includes('chhoro') ||
    situation.toLowerCase().includes('kidnap') ||
    situation.toLowerCase().includes('chora') ||
    situation.toLowerCase().includes('attack') ||
    situation.toLowerCase().includes('car') ||
    situation.toLowerCase().includes('gari') ||
    situation.toLowerCase().includes('rickshaw');

  return {
    threatLevel: isSevere ? 'critical' : 'moderate',
    threatScore: isSevere ? 88 : 45,
    immediateActionUrdu: isSevere
      ? 'فوری طور پر کسی بھی قریبی دکان، پیٹرول پمپ، یا روشن ہجوم والی جگہ میں داخل ہو جائیں۔ اونچی آواز میں رشتہ دار کا نام پکاریں یا فیک کال آن کریں!'
      : 'چوکنا رہیں، فون ہاتھ میں رکھیں، پراعتماد انداز میں چلیں اور ویران راستوں سے گریز کریں۔',
    immediateActionEnglish: isSevere
      ? 'Immediately step inside the nearest open shop, lighted pharmacy, or petrol pump. Trigger the Fake Call or loud alarm to deter the follower!'
      : 'Maintain high spatial awareness, avoid dark alleys, and share your live location with a trusted guardian.',
    recommendedCountermeasures: [
      'Enter the nearest populated store or petrol pump immediately',
      'Trigger the Fake Incoming Call ("Abu / Bhai is waiting at the corner")',
      'Turn on phone flashlight or loud alarm siren if approached',
      'Share live GPS link to your emergency WhatsApp group',
    ],
    emergencyDispatchMessage: `EMERGENCY SOS! I need help immediately. Situation: "${situation}". My location: Lat ${location?.lat || 'Live'}, Long ${location?.lng || 'Live'} (Map link: https://maps.google.com/?q=${location?.lat || '31.5204'},${location?.lng || '74.3587'}). Please call police and send help!`,
    deescalationPhrases: [
      'Main apne Abu ko call kar chuki hoon, wo samne khare hain!',
      'Door raho, sab dekh rahe hain, police arahi hai!',
      'Leave me alone, I am on a live video call with my family!',
    ],
  };
}

// 1. Analyze Safety Situation via Gemini
app.post('/api/safety/analyze-situation', async (req: Request, res: Response) => {
  const { situation, location, userRole } = req.body;

  if (!situation) {
    return res.status(400).json({ error: 'Situation description is required.' });
  }

  if (ai && apiKey) {
    try {
      const prompt = `You are Hifazat AI, a specialized emergency safety intelligence advisor for women, young girls, and mothers with children facing dangerous, suspicious, or emergency situations (e.g. being followed on the street, unsafe taxi/rickshaw ride, kidnapping threat, domestic threat, missing child, harassment).

USER SITUATION:
"${situation}"
User Profile: ${userRole || 'Female / Mother / Young Girl'}
Location: ${JSON.stringify(location || {})}

Analyze the situation with utmost care for personal safety. Provide:
1. Threat level: 'critical' (immediate life/physical threat), 'high' (severe danger/stalking), 'moderate' (suspicious activity), or 'caution'.
2. Threat score (0 to 100).
3. Immediate actionable advice in clear Roman Urdu / simple Urdu so an ordinary Pakistani woman or girl can understand without hesitation.
4. Immediate actionable advice in simple English.
5. 4 concrete tactical countermeasures (e.g. entering shops, photographing vehicle, dialing 15, holding keys between knuckles).
6. Auto-generated emergency SOS dispatch text (in Roman Urdu/English) ready to send via WhatsApp or SMS to family/police with location link.
7. 3 assertive, deterrent spoken phrases in Roman Urdu the person can shout or say loudly to ward off harassers or alert bystanders.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are Hifazat AI safety engine. Output strictly valid JSON matching the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              threatLevel: { type: Type.STRING, description: 'critical, high, moderate, or caution' },
              threatScore: { type: Type.NUMBER, description: '0 to 100' },
              immediateActionUrdu: { type: Type.STRING },
              immediateActionEnglish: { type: Type.STRING },
              recommendedCountermeasures: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              emergencyDispatchMessage: { type: Type.STRING },
              deescalationPhrases: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'threatLevel',
              'threatScore',
              'immediateActionUrdu',
              'immediateActionEnglish',
              'recommendedCountermeasures',
              'emergencyDispatchMessage',
              'deescalationPhrases',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, ...parsed });
    } catch (err: any) {
      console.warn('Gemini safety analysis failed, using fallback:', err.message);
    }
  }

  const fallback = generateFallbackSafetyAnalysis(situation, location);
  return res.json({ success: true, ...fallback });
});

// 2. Fake Incoming Safety Call Generator
app.post('/api/safety/fake-call', async (req: Request, res: Response) => {
  const { callerType } = req.body; // 'father' | 'brother' | 'police' | 'mother'

  let callerName = 'Abu (Father)';
  let phoneNum = '+92 300 8472910';
  let dialogLines = [
    'Haan beta, main chowk pe khara hoon, tum kahan tak pohanchi ho?',
    'Main bike pe bas 2 minute main samne araha hoon.',
    'Aap wahi rukna kisi roshni wali dukan k bahar, main araha hoon.',
  ];

  if (callerType === 'brother') {
    callerName = 'Bhai (Brother)';
    phoneNum = '+92 321 4492019';
    dialogLines = [
      'Suno, main market k bahar pohonch gaya hoon, car samne khari hai.',
      'Koi masla to nahi? Main abhi tumhari taraf walk kar raha hoon.',
      'Haan bas 1 minute mein tumhare samne hoon!',
    ];
  } else if (callerType === 'police') {
    callerName = 'Police Patrol Officer (15)';
    phoneNum = '15 (Police Mobile)';
    dialogLines = [
      'G Assalam-o-Alaikum, Police Control se baat kar rahe hain.',
      'Aapki live GPS location track ho rahi hai, mobile van aapki gali k morr pe hai.',
      'Aap phone ka speaker on rakhein, hum 30 second mein wahan hain.',
    ];
  }

  res.json({
    success: true,
    callerName,
    phoneNum,
    dialogLines,
  });
});

// 3. Missing Child Rapid Alert & Search Broadcast
app.post('/api/safety/child-alert', async (req: Request, res: Response) => {
  const { childName, childAge, gender, lastSeenLocation, clothing, distinguishingFeatures, contactNumber } = req.body;

  if (ai && apiKey) {
    try {
      const prompt = `A child has gone missing or separated from parents in a public area (market, park, street, school).
Generate an urgent Missing Child Search & Rescue Broadcast:
Child Name: ${childName}
Age: ${childAge}
Gender: ${gender}
Last Seen Location: ${lastSeenLocation}
Clothing: ${clothing}
Distinguishing Features: ${distinguishingFeatures || 'None'}
Parent Contact: ${contactNumber}

Provide:
1. Urgent public alert poster text in Roman Urdu and English.
2. Immediate 0-30 minute search priority steps for the mother/parents (e.g. check exits, security CCTV, announce on mosque/mall mic).
3. Critical warning instructions for child safety.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              urgentPosterTitleUrdu: { type: Type.STRING },
              urgentPosterTitleEnglish: { type: Type.STRING },
              broadcastSummary: { type: Type.STRING },
              immediate0to30MinChecklist: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              safetyTipsForMother: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'urgentPosterTitleUrdu',
              'urgentPosterTitleEnglish',
              'broadcastSummary',
              'immediate0to30MinChecklist',
              'safetyTipsForMother',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, ...parsed });
    } catch (e: any) {
      console.warn('Child alert AI error:', e.message);
    }
  }

  // Fallback
  return res.json({
    success: true,
    urgentPosterTitleUrdu: `فورى تلاش برائے گمشدہ بچہ: ${childName}`,
    urgentPosterTitleEnglish: `URGENT MISSING CHILD ALERT: ${childName}`,
    broadcastSummary: `Child ${childName}, age ${childAge}, ${gender}, wearing ${clothing}. Last seen at ${lastSeenLocation}. If spotted, immediately contact ${contactNumber} or call Police 15 / Child Protection 1121!`,
    immediate0to30MinChecklist: [
      'Immediately alert the market/mall security guards to seal exit gates',
      'Make an announcement over the nearest Masjid / Mall loudspeaker',
      'Call Police 15 & Child Protection Bureau 1121 immediately',
      'Dispatch searchers in concentric rings: 100m, 300m, 500m radius',
      'Check nearby candy shops, ice-cream stalls, water bodies, or toy corners',
    ],
    safetyTipsForMother: [
      'One parent must stay stationary at the exact last-seen point so child can find you',
      'Share this digital alert immediately to family and community WhatsApp groups',
      'Demand immediate review of street/shop CCTV camera footage',
    ],
  });
});

// 4. Emergency Helplines API
app.get('/api/safety/helplines', (_req: Request, res: Response) => {
  res.json({
    success: true,
    helplines: EMERGENCY_HELPLINES,
  });
});

// Production vs Development Server mounting
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Hifazat AI Safety server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
