/**
 * Audio utilities for Isaac Christian Hub:
 * - Peaceful ambient Web Audio prayer pad (reverent, gentle, calming)
 * - Text-to-speech prayer & scripture reader
 */

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: any = null;
  private masterGain: GainNode | null = null;

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public start() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.ctx) {
        this.ctx = new AudioContextClass();
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.isPlaying = true;
      this.playPeacefulChord();

      // Cycle gentle chord progression every 6 seconds
      this.intervalId = setInterval(() => {
        if (this.isPlaying) {
          this.playPeacefulChord();
        }
      }, 5500);
    } catch (e) {
      console.warn('Ambient audio could not be initialized:', e);
    }
  }

  private chordProgressions = [
    [130.81, 196.0, 261.63, 329.63, 392.0], // C major 9 (warm, sacred)
    [110.0, 164.81, 220.0, 261.63, 329.63], // A minor 7 (peaceful, contemplative)
    [87.31, 130.81, 174.61, 220.0, 261.63], // F major 7 (hopeful, majestic)
    [98.0, 146.83, 196.0, 246.94, 293.66],  // G sus / add 9 (reverent resolution)
  ];
  private chordIndex = 0;

  private playPeacefulChord() {
    if (!this.ctx || !this.masterGain) return;
    const notes = this.chordProgressions[this.chordIndex % this.chordProgressions.length];
    this.chordIndex++;

    const now = this.ctx.currentTime;
    const duration = 6.0;

    notes.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const noteGain = this.ctx!.createGain();

      // Soft warm sine + triangle blend
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Slow attack, long warm sustain, gentle release
      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.03, now + 1.8);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + duration + 0.5);
    });
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + 0.8);
      } catch (e) {
        // ignore
      }
    }
  }
}

export const ambientPlayer = new AmbientAudioEngine();

/**
 * Text to speech reader for prayers & scriptures
 */
export function speakText(
  text: string,
  onEnd?: () => void,
  onStart?: () => void
): { stop: () => void } {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    alert('Speech synthesis is not supported on your browser.');
    return { stop: () => {} };
  }

  window.speechSynthesis.cancel();

  const cleanText = text
    .replace(/[#*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 0.88; // Gentle, reverent pace
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  // Look for a pleasant English voice
  const warmVoice = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.includes('Natural') ||
        v.name.includes('Serena') ||
        v.name.includes('Daniel') ||
        v.name.includes('Google') ||
        v.name.includes('Samantha'))
  );
  if (warmVoice) {
    utterance.voice = warmVoice;
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);

  return {
    stop: () => {
      window.speechSynthesis.cancel();
      if (onEnd) onEnd();
    },
  };
}
