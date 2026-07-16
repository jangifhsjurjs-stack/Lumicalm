class AudioSynthesizer {
  constructor() {
    this.audioCtx = null;
    this.windSource = null;
    this.windFilter = null;
    this.windGain = null;
    this.oscLeft = null;
    this.oscRight = null;
    this.pannerLeft = null;
    this.pannerRight = null;
    this.binauralGain = null;
    this.isActive = false;
    this.onLogCallback = null;
  }

  setLogCallback(callback) {
    this.onLogCallback = callback;
  }

  log(message, type = 'info') {
    if (this.onLogCallback) {
      this.onLogCallback(message, type);
    }
  }

  init() {
    if (this.audioCtx) return;

    this.log("Initializing Web Audio API Context...", "info");
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContextClass();
  }

  async start() {
    this.init();
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    if (this.isActive) return;
    this.isActive = true;
    this.log("Audio Synthesis Engine Started", "success");

    // 1. Set up Filtered White Noise (Wind Synthesizer)
    this.setupWindSynthesizer();

    // 2. Set up Binaural Beats (Theta Wave Synthesizer)
    this.setupBinauralSynthesizer();
  }

  setupWindSynthesizer() {
    // Generate a 2-second white noise buffer
    const bufferSize = 2 * this.audioCtx.sampleRate;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.windSource = this.audioCtx.createBufferSource();
    this.windSource.buffer = noiseBuffer;
    this.windSource.loop = true;

    // Create a lowpass filter to shape the noise into wind
    this.windFilter = this.audioCtx.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    this.windFilter.Q.value = 1.0;
    this.windFilter.frequency.value = 350; // Initial low frequency

    // Gain node for volume control
    this.windGain = this.audioCtx.createGain();
    this.windGain.gain.value = 0.05; // Soft initial sound

    // Connect nodes
    this.windSource.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.audioCtx.destination);

    this.windSource.start(0);
    this.log("Wind (Filtered White Noise) generator initialized", "info");
  }

  setupBinauralSynthesizer() {
    // Create oscillators for left and right ears
    this.oscLeft = this.audioCtx.createOscillator();
    this.oscRight = this.audioCtx.createOscillator();

    // Set frequencies: Left = 200Hz, Right = 210Hz (Diff = 10Hz Theta Wave)
    this.oscLeft.type = 'sine';
    this.oscLeft.frequency.value = 200;

    this.oscRight.type = 'sine';
    this.oscRight.frequency.value = 210;

    // Panners to direct frequencies to left and right channels
    this.pannerLeft = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : null;
    this.pannerRight = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : null;

    if (this.pannerLeft && this.pannerRight) {
      this.pannerLeft.pan.value = -1; // Full Left
      this.pannerRight.pan.value = 1; // Full Right
    }

    // Gain node for Binaural Beats volume (off by default)
    this.binauralGain = this.audioCtx.createGain();
    this.binauralGain.gain.value = 0.0; // Silenced initially

    // Connect
    if (this.pannerLeft && this.pannerRight) {
      this.oscLeft.connect(this.pannerLeft);
      this.pannerLeft.connect(this.binauralGain);

      this.oscRight.connect(this.pannerRight);
      this.pannerRight.connect(this.binauralGain);
    } else {
      // Fallback if StereoPanner is not supported (connect directly to gain, sounds less binaural but still dual-tone)
      this.oscLeft.connect(this.binauralGain);
      this.oscRight.connect(this.binauralGain);
    }

    this.binauralGain.connect(this.audioCtx.destination);

    this.oscLeft.start(0);
    this.oscRight.start(0);
    this.log("Binaural Beats (200Hz/210Hz Theta wave) oscillators initialized", "info");
  }

  // Modulate wind cutoff frequency and gain based on inhalation/exhalation
  // intensity: 0.0 (fully exhaled) to 1.0 (fully inhaled)
  setWindIntensity(intensity, duration = 0.5) {
    if (!this.isActive || !this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    
    // Wind frequency sweeps between 380Hz (quiet/exhaled) and 920Hz (full inhale)
    const targetFreq = 380 + (intensity * 540);
    // Wind volume peaks during inhale (0.15) and drops to a soft, audible level (0.04) during exhale
    const targetGain = 0.04 + (intensity * 0.11);

    this.windFilter.frequency.setTargetAtTime(targetFreq, now, duration / 3);
    this.windGain.gain.setTargetAtTime(targetGain, now, duration / 3);
  }

  // Fade Binaural beats (Theta wave) in and out
  // Active during Hold to focus user's brainwave frequency
  setBinauralBeats(active, duration = 0.5) {
    if (!this.isActive || !this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const targetGain = active ? 0.06 : 0.0; // Safe low level for binaural beats

    this.binauralGain.gain.setTargetAtTime(targetGain, now, duration / 3);
    
    if (active) {
      this.log("Binaural Beats (10Hz Theta Waves) activated", "success");
    } else {
      this.log("Binaural Beats deactivated", "info");
    }
  }

  stop() {
    if (!this.isActive) return;
    this.isActive = false;

    this.log("Stopping Audio Synthesis Engine...", "info");

    try {
      if (this.windSource) {
        this.windSource.stop();
        this.windSource.disconnect();
      }
      if (this.oscLeft) {
        this.oscLeft.stop();
        this.oscLeft.disconnect();
      }
      if (this.oscRight) {
        this.oscRight.stop();
        this.oscRight.disconnect();
      }
      if (this.windFilter) this.windFilter.disconnect();
      if (this.windGain) this.windGain.disconnect();
      if (this.pannerLeft) this.pannerLeft.disconnect();
      if (this.pannerRight) this.pannerRight.disconnect();
      if (this.binauralGain) this.binauralGain.disconnect();
    } catch (e) {
      this.log(`Error during audio cleanup: ${e.message}`, "warn");
    }

    this.windSource = null;
    this.oscLeft = null;
    this.oscRight = null;
    
    this.log("Audio Synthesis Engine Stopped", "info");
  }
}
