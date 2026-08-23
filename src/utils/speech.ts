// Advanced Sweet & Realistic Female Voice Speech Engine for Patel CCTV Camera World
// Speaks first in gentle Hindi, then in fluent English with harmonious welcoming chime

// Audio Context for soft welcoming entrance chime
let audioCtx: AudioContext | null = null;

const playGentleWelcomeChime = async () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Harmonic bell chime notes (523.25Hz C5 -> 659.25Hz E5 -> 783.99Hz G5)
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, index) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.12);

      gain.gain.setValueAtTime(0.001, now + index * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.12, now + index * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + index * 0.12);
      osc.stop(now + index * 0.12 + 0.65);
    });
  } catch (e) {
    // Ignore audio context errors if not permitted
    console.debug('Chime audio context skipped:', e);
  }
};

// Helper to find the best sweet female voice for a given language code
const getBestFemaleVoice = (voices: SpeechSynthesisVoice[], langCode: 'hi' | 'en'): SpeechSynthesisVoice | null => {
  if (!voices || voices.length === 0) return null;

  const femaleKeywords = [
    'female', 'woman', 'girl', 'swara', 'kalpana', 'neerja', 'priya',
    'kavya', 'lekha', 'veena', 'google हिन्दी', 'google hi',
    'google uk english female', 'google us english female', 'samantha',
    'karen', 'moira', 'victoria', 'zira', 'aria', 'jenny', 'natural', 'neural'
  ];

  if (langCode === 'hi') {
    // 1. Preferred Hindi female voice
    const hindiVoices = voices.filter(v => 
      v.lang.toLowerCase().startsWith('hi') || 
      v.name.toLowerCase().includes('hindi') || 
      v.name.toLowerCase().includes('हिन्दी')
    );

    const hindiFemale = hindiVoices.find(v => 
      femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
    );
    if (hindiFemale) return hindiFemale;
    if (hindiVoices.length > 0) return hindiVoices[0];

    // Fallback if no Hindi voice installed on system: search for Indian English female
    const inFemale = voices.find(v => 
      v.lang.toLowerCase().includes('in') && 
      femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
    );
    if (inFemale) return inFemale;
  }

  if (langCode === 'en') {
    // 1. English Indian female voice (natural Indian accent)
    const enInFemale = voices.find(v => 
      (v.lang.toLowerCase() === 'en-in' || v.lang.toLowerCase().startsWith('en_in')) && 
      femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
    );
    if (enInFemale) return enInFemale;

    // 2. High-quality natural English female voice
    const enFemale = voices.find(v => 
      v.lang.toLowerCase().startsWith('en') && 
      femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
    );
    if (enFemale) return enFemale;

    // 3. Any English voice
    const anyEn = voices.find(v => v.lang.toLowerCase().startsWith('en'));
    if (anyEn) return anyEn;
  }

  return voices[0] || null;
};

// Global state callback for listening to speech events if needed
type SpeechStateListener = (isPlaying: boolean, currentLang: 'hi' | 'en' | null) => void;
const listeners: Set<SpeechStateListener> = new Set();

export const subscribeSpeechState = (listener: SpeechStateListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyState = (isPlaying: boolean, currentLang: 'hi' | 'en' | null) => {
  listeners.forEach(fn => fn(isPlaying, currentLang));
};

let isCurrentlySpeaking = false;

export const isSpeakingAudio = () => isCurrentlySpeaking;

export const stopWelcomeAudio = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    isCurrentlySpeaking = false;
    notifyState(false, null);
  }
};

/**
 * Main Welcome Speech Function
 * Step 1: Plays soft welcoming chime
 * Step 2: Speaks Hindi: "पटेल सीसीटीवी कैमरा वर्ल्ड में आपका स्वागत है।" in sweet female voice
 * Step 3: Speaks English: "Welcome to Patel CCTV Camera World." in sweet female voice
 */
export const speakWelcomeAudio = async () => {
  if (typeof window === 'undefined') return;

  try {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported on this browser.');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    isCurrentlySpeaking = true;
    notifyState(true, 'hi');

    // 1. Play soft entrance chime
    await playGentleWelcomeChime();

    const startSpeechChain = () => {
      const voices = window.speechSynthesis.getVoices();

      // ---- STEP 1: HINDI SPEECH (प्यारी सी मधुर लड़की जैसी आवाज) ----
      const hindiText = "पटेल सीसीटीवी कैमरा वर्ल्ड में आपका हार्दिक स्वागत है।";
      const hindiUtterance = new SpeechSynthesisUtterance(hindiText);
      
      const hindiVoice = getBestFemaleVoice(voices, 'hi');
      if (hindiVoice) {
        hindiUtterance.voice = hindiVoice;
        hindiUtterance.lang = hindiVoice.lang || 'hi-IN';
      } else {
        hindiUtterance.lang = 'hi-IN';
      }

      // Sweet, gentle, natural human pitch and tempo
      hindiUtterance.rate = 0.88;   // Smooth relaxed pace (not robotic fast)
      hindiUtterance.pitch = 1.15;  // Sweet, friendly, warm female tone
      hindiUtterance.volume = 1.0;

      // ---- STEP 2: ENGLISH SPEECH (Follows immediately after Hindi) ----
      const englishText = "Welcome to Patel CCTV Camera World.";
      const englishUtterance = new SpeechSynthesisUtterance(englishText);
      
      const englishVoice = getBestFemaleVoice(voices, 'en');
      if (englishVoice) {
        englishUtterance.voice = englishVoice;
        englishUtterance.lang = englishVoice.lang || 'en-IN';
      } else {
        englishUtterance.lang = 'en-IN';
      }

      englishUtterance.rate = 0.88;
      englishUtterance.pitch = 1.12;
      englishUtterance.volume = 1.0;

      // When Hindi finishes, wait 350ms then speak English
      hindiUtterance.onend = () => {
        if (!isCurrentlySpeaking) return;
        notifyState(true, 'en');
        setTimeout(() => {
          if (!isCurrentlySpeaking) return;
          try {
            window.speechSynthesis.speak(englishUtterance);
          } catch (e) {
            console.warn('English speech error:', e);
            isCurrentlySpeaking = false;
            notifyState(false, null);
          }
        }, 350);
      };

      hindiUtterance.onerror = (e) => {
        console.warn('Hindi speech error, falling back to English:', e);
        notifyState(true, 'en');
        try {
          window.speechSynthesis.speak(englishUtterance);
        } catch {
          isCurrentlySpeaking = false;
          notifyState(false, null);
        }
      };

      englishUtterance.onend = () => {
        isCurrentlySpeaking = false;
        notifyState(false, null);
      };

      englishUtterance.onerror = () => {
        isCurrentlySpeaking = false;
        notifyState(false, null);
      };

      // Speak Hindi first
      window.speechSynthesis.speak(hindiUtterance);
    };

    // Ensure voices are loaded before speaking
    const availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices && availableVoices.length > 0) {
      startSpeechChain();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        startSpeechChain();
      };
      // Fallback timeout in case onvoiceschanged does not fire
      setTimeout(() => {
        if (isCurrentlySpeaking) {
          startSpeechChain();
        }
      }, 250);
    }
  } catch (err) {
    console.warn('Speech synthesis exception:', err);
    isCurrentlySpeaking = false;
    notifyState(false, null);
  }
};

/**
 * Security Warning Speech for Login
 * Speaks the anti-fraud notice verbatim in clear Hindi voice
 */
export const speakLoginSecurityWarningAudio = async (
  onStart?: () => void,
  onEnd?: () => void
): Promise<() => void> => {
  if (typeof window === 'undefined') return () => {};

  try {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported on this browser.');
      onEnd?.();
      return () => {};
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();
    isCurrentlySpeaking = true;
    notifyState(true, 'hi');

    // Play subtle caution alert chime
    await playGentleWelcomeChime();

    onStart?.();

    const warningHindiText = 
      "सावधानी नोट! कोई भी हमारे नाम का मिसयूज कर सकता है, तो कृपया नंबरों की जांच करके ही किसी का फोन या व्हाट्सएप पर मैसेज आए तो नंबरों की जांच करें उसके बाद ही उसके ऊपर भरोसा करें। " +
      "अगर यह नीचे दिया गया हुआ नंबर प्लस 91 74830 05197 के अलावा कोई दूसरा नंबर से आपको मैसेज करे, तो उससे पहले कंफर्म कर लीजिएगा कि कोई फ्रॉड तो नहीं है। " +
      "और अगर आपके साथ फ्रॉड हो तो नजदीकी पुलिस स्टेशन में रिपोर्ट दर्ज करें या फिर इस नंबर पर कॉल करें: 80009 51663। आपका धन्यवाद!";

    const warningUtterance = new SpeechSynthesisUtterance(warningHindiText);
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = getBestFemaleVoice(voices, 'hi');

    if (hindiVoice) {
      warningUtterance.voice = hindiVoice;
      warningUtterance.lang = hindiVoice.lang || 'hi-IN';
    } else {
      warningUtterance.lang = 'hi-IN';
    }

    // Natural, clear, authoritative tone for caution
    warningUtterance.rate = 0.86;
    warningUtterance.pitch = 1.05;
    warningUtterance.volume = 1.0;

    warningUtterance.onend = () => {
      isCurrentlySpeaking = false;
      notifyState(false, null);
      onEnd?.();
    };

    warningUtterance.onerror = (e) => {
      console.warn('Warning speech error:', e);
      isCurrentlySpeaking = false;
      notifyState(false, null);
      onEnd?.();
    };

    const startSpeak = () => {
      try {
        window.speechSynthesis.speak(warningUtterance);
      } catch (err) {
        console.warn('Failed to speak warning:', err);
        onEnd?.();
      }
    };

    if (voices && voices.length > 0) {
      startSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        startSpeak();
      };
      setTimeout(startSpeak, 250);
    }

    return () => {
      window.speechSynthesis.cancel();
      isCurrentlySpeaking = false;
      notifyState(false, null);
    };
  } catch (err) {
    console.warn('Security warning speech exception:', err);
    isCurrentlySpeaking = false;
    notifyState(false, null);
    onEnd?.();
    return () => {};
  }
};

