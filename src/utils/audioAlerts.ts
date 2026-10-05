// Web Audio API synthesized siren and ringtone generator (zero external assets needed)

let audioCtx: AudioContext | null = null;
let sirenOscillator: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;
let sirenInterval: any = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Loud Emergency Siren (Police / Alarm wail)
export function startEmergencySiren() {
  stopEmergencySiren();
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, ctx.currentTime);

    gain.gain.setValueAtTime(0.7, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();

    sirenOscillator = osc;
    sirenGain = gain;

    // Modulate pitch up and down like an emergency siren
    let frequency = 600;
    let direction = 1;
    sirenInterval = setInterval(() => {
      if (!sirenOscillator || !audioCtx) return;
      frequency += direction * 35;
      if (frequency >= 1200) direction = -1;
      if (frequency <= 550) direction = 1;
      sirenOscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    }, 40);
  } catch (err) {
    console.warn('Could not start siren audio:', err);
  }
}

export function stopEmergencySiren() {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  if (sirenOscillator) {
    try {
      sirenOscillator.stop();
      sirenOscillator.disconnect();
    } catch (e) {}
    sirenOscillator = null;
  }
  if (sirenGain) {
    try {
      sirenGain.disconnect();
    } catch (e) {}
    sirenGain = null;
  }
}

// 2. Realistic Phone Ringtone Generator
let ringtoneOsc1: OscillatorNode | null = null;
let ringtoneOsc2: OscillatorNode | null = null;
let ringInterval: any = null;

export function startPhoneRingtone() {
  stopPhoneRingtone();
  try {
    const ctx = getAudioContext();

    const playRingBurst = () => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(440, ctx.currentTime); // Standard phone ring frequencies
      osc2.frequency.setValueAtTime(480, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.8);
      osc2.stop(ctx.currentTime + 1.8);
    };

    playRingBurst();
    ringInterval = setInterval(() => {
      playRingBurst();
    }, 3000);
  } catch (e) {
    console.warn('Ringtone error:', e);
  }
}

export function stopPhoneRingtone() {
  if (ringInterval) {
    clearInterval(ringInterval);
    ringInterval = null;
  }
}

// 3. Speech Synthesis for Fake Call Voice
export function speakCallLine(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 0.9;
  utterance.lang = 'ur-PK'; // Urdu or fallback
  window.speechSynthesis.speak(utterance);
}
