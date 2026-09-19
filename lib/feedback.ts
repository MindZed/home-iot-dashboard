// lib/feedback.ts
// Micro-haptic vibration and Web Audio API synthesized mechanical sound feedback.
// Zero external sound asset dependencies. Ultra-low latency (<2ms).

class FeedbackEngine {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private hapticsEnabled: boolean = true;
  private isInitialized: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const storedSound = localStorage.getItem("homeiot_sound_enabled");
      const storedHaptics = localStorage.getItem("homeiot_haptics_enabled");
      this.soundEnabled = storedSound !== null ? storedSound === "true" : true;
      this.hapticsEnabled = storedHaptics !== null ? storedHaptics === "true" : true;
    }
  }

  private initAudio() {
    if (this.isInitialized && this.audioCtx) return;
    if (typeof window === "undefined") return;

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        this.isInitialized = true;
      }
    } catch {
      // AudioContext unavailable
    }
  }

  public isSoundOn(): boolean {
    return this.soundEnabled;
  }

  public setSoundOn(enabled: boolean) {
    this.soundEnabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("homeiot_sound_enabled", String(enabled));
      window.dispatchEvent(new CustomEvent("homeiot_feedback_change"));
    }
  }

  public isHapticsOn(): boolean {
    return this.hapticsEnabled;
  }

  public setHapticsOn(enabled: boolean) {
    this.hapticsEnabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("homeiot_haptics_enabled", String(enabled));
      window.dispatchEvent(new CustomEvent("homeiot_feedback_change"));
    }
  }

  /**
   * Triggers device vibration pattern if supported on the device.
   */
  public triggerHaptic(type: "light" | "medium" | "heavy" | "selection" | "success" = "light") {
    if (!this.hapticsEnabled) return;
    if (typeof window === "undefined" || !("vibrate" in navigator)) return;

    try {
      switch (type) {
        case "selection":
          navigator.vibrate(8);
          break;
        case "light":
          navigator.vibrate(14);
          break;
        case "medium":
          navigator.vibrate(25);
          break;
        case "heavy":
          navigator.vibrate(40);
          break;
        case "success":
          navigator.vibrate([15, 35, 20]);
          break;
      }
    } catch {
      // Ignore vibration error
    }
  }

  /**
   * Synthesizes a crisp, mechanical physical relay switch click.
   */
  public playSwitchClick(targetStateOn: boolean) {
    this.triggerHaptic(targetStateOn ? "medium" : "light");
    if (!this.soundEnabled) return;

    this.initAudio();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }

    const now = this.audioCtx.currentTime;

    // Dual-transient mechanical click:
    // 1. Sharp impulse tick (micro-contact closure)
    const osc1 = this.audioCtx.createOscillator();
    const gain1 = this.audioCtx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(targetStateOn ? 2200 : 1800, now);
    osc1.frequency.exponentialRampToValueAtTime(targetStateOn ? 350 : 250, now + 0.012);

    gain1.gain.setValueAtTime(0.22, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

    osc1.connect(gain1);
    gain1.connect(this.audioCtx.destination);

    osc1.start(now);
    osc1.stop(now + 0.015);

    // 2. Resonant mechanical relay armature thud
    const osc2 = this.audioCtx.createOscillator();
    const gain2 = this.audioCtx.createGain();

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(targetStateOn ? 750 : 540, now + 0.003);
    osc2.frequency.exponentialRampToValueAtTime(targetStateOn ? 180 : 120, now + 0.035);

    gain2.gain.setValueAtTime(0.18, now + 0.003);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc2.connect(gain2);
    gain2.connect(this.audioCtx.destination);

    osc2.start(now + 0.003);
    osc2.stop(now + 0.04);
  }

  /**
   * Synthesizes a micro-click for the 360° rotary timer dial ticks.
   */
  public playDialTick() {
    this.triggerHaptic("selection");
    if (!this.soundEnabled) return;

    this.initAudio();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(2600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.008);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.01);
  }

  /**
   * Warm ambient chord for 1-Tap Scene activations.
   */
  public playSceneChime() {
    this.triggerHaptic("success");
    if (!this.soundEnabled) return;

    this.initAudio();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }

    const now = this.audioCtx.currentTime;
    // Harmonic triad: C5 (523Hz), E5 (659Hz), G5 (784Hz)
    const freqs = [523.25, 659.25, 783.99];

    freqs.forEach((freq, idx) => {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.28);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.3);
    });
  }

  /**
   * Clean tap for navigation tabs.
   */
  public playNavTap() {
    this.triggerHaptic("light");
    if (!this.soundEnabled) return;

    this.initAudio();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.015);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  }
}

export const feedback = new FeedbackEngine();
