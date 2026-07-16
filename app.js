// Lumicalm Central State Coordinator and Application Controller

// Preset Datasets
const DEFAULT_COLOR_THERAPIES = [
  {
    key: "circadian_blue",
    name: "Circadian Sync (460nm)",
    tagline: "แสงส่องพลังขับเคลื่อนความตื่นตัวและสมดุลเวลากลางวัน",
    hex: "#42a5f5",
    rgb: "66, 165, 245",
    cct: "6500K - Sky Blue Wave",
    rec: "ควรรับแสงคลื่นนี้ช่วง 06:00 - 12:00 เพื่อกดเมลาโทนินสูงสุดและฟื้นฟูวัฏจักรชีวิตประจำวัน",
    waveFreq: 8 // High frequency alert wave
  },
  {
    key: "stress_green",
    name: "Stress Reduction (525nm)",
    tagline: "คลื่นสีต้านกล้ามเนื้อหดเกร็งและลดการกระตุ้นประสาทซิมพาเทติก",
    hex: "#66bb6a",
    rgb: "102, 187, 106",
    cct: "5000K - Forest Green Wave",
    rec: "แสง 525nm ช่วยกระตุ้นระบบประสาทผ่อนคลายโดยไม่ต้องเพ่ง สามารถใช้ได้ตลอดทั้งวัน",
    waveFreq: 5.5 // Calming balanced wave
  },
  {
    key: "focus_orange",
    name: "Focus Sharpener (590nm)",
    tagline: "กระตุ้นคลื่นสมองเบต้าแบบนุ่มนวลเพื่อการจดจ่อสูงสุด",
    hex: "#ff8f00",
    rgb: "255, 143, 0",
    cct: "2700K - Sunset Amber Wave",
    rec: "กระตุ้นต่อมไพเนียลอย่างอ่อนโยน ช่วยประคองสมาธิให้นิ่งและไม่ทำให้สายตาล้า",
    waveFreq: 4 // Creative steady wave
  },
  {
    key: "calm_purple",
    name: "Deep Calming (400nm)",
    tagline: "คลื่นความถี่พลังอะเมทิสต์ สลายกระแสความวิตกกังวลในใจ",
    hex: "#ab47bc",
    rgb: "171, 71, 188",
    cct: "10000K - Amethyst Cosmic Wave",
    rec: "คลื่นแสงสั้นช่วยสร้างความรู้สึกเป็นเซน (Zen State) เหมาะมากสำหรับใช้ฝึกจิตก่อนเข้านอน",
    waveFreq: 3 // Deep slow restorative wave
  }
];

const DEFAULT_BREATHING_PRESETS = [
  {
    key: "box_breathing",
    name: "Box Breathing (หายใจแบบกล่อง)",
    tagline: "สลายความเครียดฉับพลันของหน่วยซีลเพื่อสติสูงสุด",
    phases: [
      { label: "หายใจเข้า Inhale",       duration: 4, type: "in"   },
      { label: "กลั้นหายใจ Hold Breath",  duration: 4, type: "hold" },
      { label: "หายใจออก Exhale",       duration: 4, type: "out"  },
      { label: "กลั้นหายใจ Hold Breath",  duration: 4, type: "hold" }
    ]
  },
  {
    key: "relaxing_478",
    name: "Relaxing 4-7-8 (ลดวิตกกังวล)",
    tagline: "กระตุ้นการหลับลึกอย่างเป็นธรรมชาติและบรรเทาความกังวล",
    phases: [
      { label: "หายใจเข้า Inhale",       duration: 4, type: "in"   },
      { label: "กลั้นหายใจ Hold Breath",  duration: 7, type: "hold" },
      { label: "หายใจออก Exhale",       duration: 8, type: "out"  }
    ]
  },
  {
    key: "energizing_5050",
    name: "Energizing 5-0-5-0 (อัดพลังสมอง)",
    tagline: "เติมอ็อกซิเจนเร่งด่วนสู่สมองเพื่อการทำงานและขจัดความเมื่อยล้า",
    phases: [
      { label: "หายใจเข้า Inhale",       duration: 5, type: "in"  },
      { label: "หายใจออก Exhale",       duration: 5, type: "out" }
    ]
  },
  {
    key: "deep_calm_4242",
    name: "Deep Calm 4-2-4-2 (ปรับสมดุล)",
    tagline: "คืนสมดุลระบบหัวใจ หลอดเลือด และระบบประสาทพาราซิมพาเทติก",
    phases: [
      { label: "หายใจเข้า Inhale",       duration: 4, type: "in"   },
      { label: "กลั้นหายใจ Hold Breath",  duration: 2, type: "hold" },
      { label: "หายใจออก Exhale",       duration: 4, type: "out"  },
      { label: "กลั้นหายใจ Hold Breath",  duration: 2, type: "hold" }
    ]
  }
];

// Helper to generate SVG Sine wave path string
function generateSineWavePath(frequency, amplitude, width, height) {
  let d = `M 0 ${height / 2}`;
  for (let x = 0; x <= width; x += 2) {
    const y = (height / 2) + Math.sin((x / width) * Math.PI * 2 * frequency) * amplitude;
    d += ` L ${x} ${y}`;
  }
  return d;
}

// Canvas Reactor Core — 5-type specialised particle system
// Canvas Reactor Core — 5-type specialised particle system
class ReactorParticle {
  constructor(w, h, particleType, colorHex) {
    this.particleType = particleType;
    this.color = colorHex || '#66bb6a';
    this.life  = 1.0;
    this.alpha = 1.0;
    this.vx    = 0;
    this.vy    = 0;
    this.reset(w, h);
  }

  reset(w, h) {
    const cx = w / 2, cy = h / 2;

    switch (this.particleType) {

      case 'ambient': {
        // Slow floating dust — always visible
        const r     = 10 + Math.random() * 115;
        const angle = Math.random() * Math.PI * 2;
        this.x     = cx + Math.cos(angle) * r;
        this.y     = cy + Math.sin(angle) * r;
        this.vx    = (Math.random() - 0.5) * 0.20;
        this.vy    = (Math.random() - 0.5) * 0.20 - 0.05;
        this.size  = 0.4 + Math.random() * 0.8;
        this.decay = 0.002 + Math.random() * 0.003;
        this.alpha = 0.12 + Math.random() * 0.30;
        break;
      }

      case 'breath-in': {
        // INHALE: Spawns near center, expands outward rapidly (fast start)
        this.x     = cx + (Math.random() - 0.5) * 12;
        this.y     = cy + (Math.random() - 0.5) * 12;
        const angle = Math.random() * Math.PI * 2;
        this.speed = 2.4 + Math.random() * 2.2;
        this.vx    = Math.cos(angle) * this.speed;
        this.vy    = Math.sin(angle) * this.speed;
        this.size  = 0.8 + Math.random() * 1.1;
        this.decay = 0.006 + Math.random() * 0.008;
        break;
      }

      case 'release': {
        // EXHALE: Spawns at outer perimeter, drifts inward slowly (slow start)
        const radius = 95 + Math.random() * 45;
        const angle  = Math.random() * Math.PI * 2;
        this.x     = cx + Math.cos(angle) * radius;
        this.y     = cy + Math.sin(angle) * radius;
        this.speed = 0.35 + Math.random() * 0.45;
        this.vx    = 0;
        this.vy    = 0;
        this.size  = 0.8 + Math.random() * 1.3;
        this.decay = 0.007 + Math.random() * 0.009;
        break;
      }

      case 'spark': {
        // Bright white burst at transitions
        this.x  = cx + (Math.random() - 0.5) * 20;
        this.y  = cy + (Math.random() - 0.5) * 20;
        const angle = Math.random() * Math.PI * 2;
        const spd   = 2.2 + Math.random() * 3.8;
        this.vx    = Math.cos(angle) * spd;
        this.vy    = Math.sin(angle) * spd;
        this.size  = 1.1 + Math.random() * 1.8;
        this.decay = 0.04  + Math.random() * 0.03;
        this.color = '#e0f4ff';
        break;
      }

      case 'glow-dust': {
        // Orbits slowly around the rings
        this.orbitAngle   = Math.random() * Math.PI * 2;
        this.orbitRadius  = 125 + Math.random() * 45;
        this.x            = cx + Math.cos(this.orbitAngle) * this.orbitRadius;
        this.y            = cy + Math.sin(this.orbitAngle) * this.orbitRadius;
        this.angularSpeed = (0.004 + Math.random() * 0.010) * (Math.random() < 0.5 ? 1 : -1);
        this.size         = 0.6 + Math.random() * 1.1;
        this.decay        = 0.003 + Math.random() * 0.004;
        this.alpha        = 0.18  + Math.random() * 0.42;
        break;
      }

      default: {
        this.x = cx; this.y = cy;
        this.vx = 0; this.vy = 0;
        this.size = 1; this.decay = 0.02;
      }
    }
  }

  update(w, h) {
    this.life -= this.decay;
    if (this.life <= 0) return false;
    const cx = w / 2, cy = h / 2;

    switch (this.particleType) {
      case 'ambient':
        this.x += this.vx;
        this.y += this.vy;
        this.alpha = this.life * 0.4;
        break;

      case 'breath-in': {
        // INHALE: Starts quickly, then decelerates as it expands (Ease Out)
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.952;
        this.vy *= 0.952;
        this.alpha = this.life;
        break;
      }

      case 'release': {
        // EXHALE: Starts slowly, then decelerates/settles with a gentle downward drift (Ease In)
        const dx = cx - this.x, dy = cy - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 6) return false;
        
        this.speed *= 0.985;
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed + 0.14; // gentle downward drift
        this.x += this.vx;
        this.y += this.vy;
        this.alpha = this.life;
        break;
      }

      case 'spark':
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.92;
        this.vy *= 0.92;
        this.alpha = this.life * this.life;
        break;

      case 'glow-dust': {
        const lastX = this.x;
        const lastY = this.y;
        this.orbitAngle += this.angularSpeed;
        this.x = cx + Math.cos(this.orbitAngle) * this.orbitRadius;
        this.y = cy + Math.sin(this.orbitAngle) * this.orbitRadius;
        this.vx = this.x - lastX;
        this.vy = this.y - lastY;
        this.alpha = (0.15 + Math.sin(this.orbitAngle * 2) * 0.12 + 0.12) * this.life;
        break;
      }
    }
    return true;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
    ctx.strokeStyle = this.color;
    ctx.fillStyle   = this.color;
    ctx.shadowBlur  = this.size * (this.particleType === 'spark' ? 5 : 2.5);
    ctx.shadowColor = this.color;

    // Draw premium motion trail if particle is moving
    if (this.vx !== 0 || this.vy !== 0) {
      ctx.lineWidth = this.size;
      ctx.lineCap   = 'round';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx * 3.2, this.y - this.vy * 3.2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}


class LunicalmApp {
  constructor() {
    this.audioSynthesizer = new AudioSynthesizer();
    this.geminiService = new GeminiService();
    
    // Core State
    this.isPlaying = false;
    this.currentColor = DEFAULT_COLOR_THERAPIES[1]; // Stress green default
    this.currentTechnique = DEFAULT_BREATHING_PRESETS[0]; // Box default
    this.currentPhaseIndex = 0;
    this.secondsRemaining = 0;
    this.timerInterval = null;
    
    // Smooth countdown timing
    this.phaseStartTime = 0;
    this.phaseDurationMs = 0;

    // Stat Trackers
    this.stats = {
      completedSessions: parseInt(localStorage.getItem('lunicalm_sessions') || '0'),
      totalMinutes: parseFloat(localStorage.getItem('lunicalm_minutes') || '0.0')
    };

    // Keep logs
    this.logs = [];

    // Particle system state
    this.canvas          = null;
    this.ctx             = null;
    this.particles       = [];
    this.starsDriftAngle = 0;
    this.parallaxX       = 0;
    this.parallaxY       = 0;
  }

  init() {
    // 1. Setup Audio Synth Log Hook
    this.audioSynthesizer.setLogCallback((msg, type) => this.logConsole(msg, type));

    // 2. Load cached API key
    const savedKey = localStorage.getItem('lunicalm_gemini_key');
    if (savedKey) {
      document.getElementById('gemini-api-key').value = savedKey;
      this.geminiService.setApiKey(savedKey);
      this.updateApiStatusIndicator('online');
      this.logConsole("API Key loaded successfully from LocalStorage", "success");
    } else {
      this.updateApiStatusIndicator('offline');
      this.logConsole("No API Key configured. Offline Clinical Mode ready.", "warn");
    }

    // 3. Render Preset Lists
    this.renderPresets();

    // 4. Bind Event Listeners
    this.bindEvents();

    // 5. Initial Apply Default State
    this.applyColorTherapy(this.currentColor);
    this.applyBreathingTechnique(this.currentTechnique);
    this.updateStatsDisplay();

    // 6. Initialize Particle System
    this.initParticles();

    this.logConsole("Lumicalm Web System fully initialized and ready", "success");
  }

  logConsole(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logObj = { timestamp, message, type };
    this.logs.unshift(logObj);

    const consolePane = document.getElementById('dev-console');
    if (consolePane) {
      const line = document.createElement('div');
      line.className = `console-line ${type}`;
      line.innerHTML = `<span class="timestamp">[${timestamp}]</span><span class="text">${message}</span>`;
      consolePane.prepend(line);

      if (consolePane.children.length > 100) {
        consolePane.removeChild(consolePane.lastChild);
      }
    }
  }

  bindEvents() {
    // Tab Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const item = e.currentTarget.closest('.nav-item');
        const tabId = item.dataset.tab;
        this.switchTab(tabId);
      });
    });

    // Breathing Controller Buttons
    document.getElementById('play-btn').addEventListener('click', () => this.toggleBreathing());
    document.getElementById('reset-btn').addEventListener('click', () => this.resetBreathing());

    // Audio Engine Toggle Switch
    document.getElementById('audio-switch').addEventListener('change', (e) => {
      this.toggleAudioEngine(e.target.checked);
    });

    // API Key Save Event
    document.getElementById('gemini-api-key').addEventListener('input', (e) => {
      const key = e.target.value.trim();
      localStorage.setItem('lunicalm_gemini_key', key);
      this.geminiService.setApiKey(key);
      if (key) {
        this.updateApiStatusIndicator('online');
        this.logConsole("Gemini API Key updated", "info");
      } else {
        this.updateApiStatusIndicator('offline');
        this.logConsole("Gemini API Key cleared. Switch to Offline Mode.", "warn");
      }
    });

    // AI Therapist Generate button
    document.getElementById('ai-generate-btn').addEventListener('click', () => this.runAiTherapist());

    // Developer Spec Tab switchers
    document.getElementById('spec-tab-kotlin-service').addEventListener('click', () => {
      this.showSpecCode('kotlin-service');
    });
    document.getElementById('spec-tab-kotlin-main').addEventListener('click', () => {
      this.showSpecCode('kotlin-main');
    });
  }

  switchTab(tabId) {
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.dataset.tab === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    document.querySelectorAll('.tab-panel').forEach(panel => {
      if (panel.id === `tab-pane-${tabId}`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    this.logConsole(`Switched tab to: ${tabId.toUpperCase()}`, "info");

    if (tabId === 'ai' && this.lastAiProfile) {
      setTimeout(() => this.animateInfographic(this.lastAiProfile.infographic), 100);
    }
  }

  updateApiStatusIndicator(status) {
    const dot = document.getElementById('api-dot');
    const label = document.getElementById('api-status-label');
    
    dot.className = 'status-dot';
    dot.classList.add(status);

    if (status === 'online') {
      label.innerText = 'Connected (Gemini Online)';
    } else if (status === 'simulated') {
      label.innerText = 'Clinical Simulator (Offline Mode)';
    } else {
      label.innerText = 'Clinical Simulator (Offline)';
    }
  }

  applyColorTherapy(color) {
    this.currentColor = color;
    
    document.documentElement.style.setProperty('--cct-color', color.hex);
    document.documentElement.style.setProperty('--cct-color-rgb', color.rgb);
    document.documentElement.style.setProperty('--cct-glow', `rgba(${color.rgb}, 0.35)`);

    document.body.style.backgroundImage = `
      radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.06) 0%, transparent 40%),
      radial-gradient(circle at 90% 80%, rgba(${color.rgb}, 0.08) 0%, transparent 40%)
    `;

    document.getElementById('active-therapy-title').innerText = color.name;
    document.getElementById('active-therapy-tagline').innerText = color.tagline;
    document.getElementById('therapy-cct-label').innerText = color.cct;
    document.getElementById('therapy-recommendation').innerText = color.rec;

    // Apply color updates directly to custom notches and gauge glow
    document.querySelectorAll('.hud-tick').forEach(tick => {
      tick.style.background = color.hex;
      tick.style.boxShadow = `0 0 8px ${color.hex}`;
    });

    this.logConsole(`Applied chromotherapy wavelength color: ${color.name}`, "info");
  }

  applyBreathingTechnique(tech) {
    this.currentTechnique  = tech;
    this.currentPhaseIndex = 0;
    this.secondsRemaining  = tech.phases[0].duration;

    // Smooth gauge resets
    this.phaseStartTime  = 0;
    this.phaseDurationMs = 0;

    this.updateCountdown(this.secondsRemaining);
    this.updatePhaseLabel(tech.phases[0].label);

    // Reset CSS phase state to idle
    const panel = document.querySelector('.canvas-panel');
    if (panel) panel.setAttribute('data-phase', 'idle');

    document.querySelectorAll('.premium-preset-card').forEach(card => {
      if (card.dataset.key === tech.key) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    this.logConsole(`Applied breathing rhythm preset: ${tech.name}`, "info");

    const orb = document.getElementById('breath-orb');
    if (orb) {
      orb.className = 'reactor-core';
      orb.style.transform = 'scale(1.0)';
    }
  }

  renderPresets() {
    // 1. Render Chromotherapy Waves Grid
    const colorGrid = document.getElementById('chromotherapy-presets');
    colorGrid.innerHTML = '';
    DEFAULT_COLOR_THERAPIES.forEach(color => {
      const card = document.createElement('div');
      card.className = `premium-preset-card ${this.currentColor.key === color.key ? 'active' : ''}`;
      card.dataset.key = color.key;
      card.style.borderLeftColor = color.hex;
      
      const wavePathD = generateSineWavePath(color.waveFreq || 4, 8, 300, 20);

      card.innerHTML = `
        <div class="premium-card-header">
          <div class="premium-card-title-group">
            <div class="premium-card-name">${color.name}</div>
            <div class="premium-card-desc">${color.tagline}</div>
          </div>
          <span class="premium-card-badge" style="color: ${color.hex}; background: rgba(${color.rgb}, 0.1); border: 1px solid rgba(${color.rgb}, 0.25);">
            ${color.cct.split(' ')[0]}
          </span>
        </div>
        
        <!-- Interactive Glowing Sine Wave -->
        <div class="wave-preview-box">
          <svg class="wave-preview-svg" viewBox="0 0 300 20" preserveAspectRatio="none">
            <path class="wave-path" d="${wavePathD}" stroke="${color.hex}"></path>
          </svg>
        </div>

        <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.75rem;">
          <strong>คำแนะนำ:</strong> ${color.rec}
        </div>
      `;
      
      card.addEventListener('click', () => {
        this.applyColorTherapy(color);
        document.querySelectorAll('#chromotherapy-presets .premium-preset-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
      colorGrid.appendChild(card);
    });

    // 2. Render Breathing Rhythm Presets Grid
    const rhythmGrid = document.getElementById('breathing-presets');
    rhythmGrid.innerHTML = '';
    DEFAULT_BREATHING_PRESETS.forEach(tech => {
      const card = document.createElement('div');
      card.className = `premium-preset-card ${this.currentTechnique.key === tech.key ? 'active' : ''}`;
      card.dataset.key = tech.key;
      
      // Calculate total cycle duration
      const totalSeconds = tech.phases.reduce((sum, p) => sum + p.duration, 0);

      // Render timeline pills
      const timelineHtml = tech.phases.map(p => {
        let icon = '';
        if (p.type === 'in') {
          icon = `<svg class="phase-pill-icon" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
        } else if (p.type === 'out') {
          icon = `<svg class="phase-pill-icon" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
        } else {
          icon = `<svg class="phase-pill-icon" fill="none" stroke="currentColor" stroke-width="3.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle></svg>`;
        }
        const cleanLabel = p.label;
        return `
          <div class="phase-pill ${p.type}">
            ${icon}
            <span>${cleanLabel} ${p.duration}s</span>
          </div>
        `;
      }).join('');

      card.innerHTML = `
        <div class="premium-card-header">
          <div class="premium-card-title-group">
            <div class="premium-card-name">${tech.name}</div>
            <div class="premium-card-desc">${tech.tagline}</div>
          </div>
          <span class="premium-card-badge" style="color: #60a5fa; background: rgba(96, 165, 250, 0.1); border: 1px solid rgba(96, 165, 250, 0.25);">
            รอบละ ${totalSeconds} วิ
          </span>
        </div>

        <!-- Horizontal Phase Timeline visualizer -->
        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: -0.25rem;">โครงสร้างจังหวะฝึก:</div>
        <div class="breathing-timeline">
          ${timelineHtml}
        </div>
      `;
      
      card.addEventListener('click', () => {
        this.applyBreathingTechnique(tech);
      });
      rhythmGrid.appendChild(card);
    });
  }

  toggleAudioEngine(isChecked) {
    if (isChecked) {
      this.audioSynthesizer.start();
      if (this.isPlaying) {
        const phase = this.currentTechnique.phases[this.currentPhaseIndex];
        this.syncAudioToPhase(phase);
      } else {
        this.audioSynthesizer.setWindIntensity(0.1, 1);
        this.audioSynthesizer.setBinauralBeats(false);
      }
    } else {
      this.audioSynthesizer.stop();
    }
  }

  toggleBreathing() {
    if (this.isPlaying) {
      this.stopBreathing();
    } else {
      this.startBreathing();
    }
  }

  startBreathing() {
    this.isPlaying = true;
    document.getElementById('play-btn-text').innerText = 'หยุดชั่วคราว';
    document.getElementById('play-btn-icon').innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
    document.getElementById('circadian-ring').classList.add('breathing');

    this.logConsole(`Starting Breathing Practice: ${this.currentTechnique.name}`, "info");
    
    this.stats.completedSessions += 1;
    localStorage.setItem('lunicalm_sessions', this.stats.completedSessions);

    this.runPhase();

    this.timerInterval = setInterval(() => {
      this.secondsRemaining--;

      // Anticipation glow flash on the last second of each phase
      if (this.secondsRemaining === 1) {
        const orb = document.getElementById('breath-orb');
        if (orb) {
          orb.classList.add('anticipating');
          setTimeout(() => orb && orb.classList.remove('anticipating'), 900);
        }
      }

      this.updateCountdown(this.secondsRemaining);

      this.stats.totalMinutes += (1 / 60);
      localStorage.setItem('lunicalm_minutes', this.stats.totalMinutes.toFixed(2));
      this.updateStatsDisplay();

      if (this.secondsRemaining <= 0) {
        const prevIndex = this.currentPhaseIndex;
        this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.currentTechnique.phases.length;

        // Spawn sparks + ripple ring on every cycle completion
        if (this.currentPhaseIndex === 0 && prevIndex > 0) {
          this.spawnSparks();
          this.triggerCycleRipple();
        }

        // Transitional phase state (brief hold/rest between cycles)
        const panel = document.querySelector('.canvas-panel');
        if (panel) panel.setAttribute('data-phase', 'transition');

        // Natural 200ms hold between breathing phases
        setTimeout(() => {
          if (this.isPlaying) {
            this.runPhase();
          }
        }, 200);
      }
    }, 1000);
  }

  runPhase() {
    const phase = this.currentTechnique.phases[this.currentPhaseIndex];
    this.secondsRemaining = phase.duration;

    // Record timing for gauge arc progress
    this.phaseStartTime  = Date.now();
    this.phaseDurationMs = phase.duration * 1000;

    // Animated label + countdown update
    this.updateCountdown(this.secondsRemaining);
    this.updatePhaseLabel(phase.label);

    // Drive all CSS phase-state animations via data-phase
    this.setPhaseState(phase.type, phase.duration);

    this.logConsole(`Phase Shift → [${phase.label}] | Duration: ${phase.duration}s`, "info");

    const orb = document.getElementById('breath-orb');
    if (orb) {
      orb.className = 'reactor-core';
      const cssPhase = phase.type === 'in' ? 'inhale' : phase.type === 'out' ? 'exhale' : 'hold';
      orb.classList.add(cssPhase);

      if (phase.type === 'in') {
        orb.style.transitionTimingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)';
        orb.style.transitionDuration = `${phase.duration}s`;
        orb.style.transform = 'scale(1.08)'; // Expanded 8%
      } else if (phase.type === 'out') {
        orb.style.transitionTimingFunction = 'cubic-bezier(0.55, 0.085, 0.68, 0.53)';
        orb.style.transitionDuration = `${phase.duration}s`;
        orb.style.transform = 'scale(1.0)'; // Contracted to base
      } else if (phase.type === 'hold') {
        orb.style.transitionTimingFunction = 'cubic-bezier(0.25, 0.05, 0.1, 1.0)';
        orb.style.transitionDuration = '0.8s';
        orb.style.transform = 'scale(1.04)'; // Held at 4%
      }
    }

    this.syncAudioToPhase(phase);
  }

  syncAudioToPhase(phase) {
    if (!document.getElementById('audio-switch').checked) return;

    if (phase.type === 'in') {
      this.audioSynthesizer.setWindIntensity(1.0, phase.duration);
      this.audioSynthesizer.setBinauralBeats(false);
    } else if (phase.type === 'out') {
      this.audioSynthesizer.setWindIntensity(0.1, phase.duration); // Soft but audible exhalation
      this.audioSynthesizer.setBinauralBeats(false);
    } else if (phase.type === 'hold') {
      this.audioSynthesizer.setWindIntensity(0.3, 0.5);
      this.audioSynthesizer.setBinauralBeats(true, phase.duration);
    }
  }

  stopBreathing() {
    this.isPlaying = false;
    clearInterval(this.timerInterval);
    this.timerInterval  = null;
    this.phaseStartTime = 0;

    // Reset CSS phase state
    const panel = document.querySelector('.canvas-panel');
    if (panel) panel.setAttribute('data-phase', 'idle');

    document.getElementById('play-btn-text').innerText = 'ฝึกการหายใจ';
    document.getElementById('play-btn-icon').innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    document.getElementById('circadian-ring').classList.remove('breathing');

    this.logConsole("Breathing Practice Paused", "info");

    if (document.getElementById('audio-switch').checked) {
      this.audioSynthesizer.setWindIntensity(0.1, 1);
      this.audioSynthesizer.setBinauralBeats(false);
    }

    const orb = document.getElementById('breath-orb');
    if (orb) {
      orb.className = 'reactor-core';
      orb.style.transitionDuration = '1s';
      orb.style.transform = 'scale(1.0)';
    }
  }

  resetBreathing() {
    this.stopBreathing();
    this.applyBreathingTechnique(this.currentTechnique);
    this.logConsole("Breathing Session Reset", "info");
  }

  // ===== UNIFIED ANIMATION CONTROL METHODS =====

  /** Sets data-phase on the canvas panel — drives ALL CSS phase-state selectors */
  setPhaseState(phaseType, durationSecs) {
    const panel = document.querySelector('.canvas-panel');
    if (!panel) return;
    const cssPhase = phaseType === 'in' ? 'inhale' : phaseType === 'out' ? 'exhale' : 'hold';
    panel.style.setProperty('--phase-duration', `${durationSecs}s`);
    panel.setAttribute('data-phase', cssPhase);
  }

  /** Animates the bilingual phase label with a smooth fade-slide transition */
  updatePhaseLabel(label) {
    const phaseEl = document.getElementById('phase-name');
    const thaiEl  = document.getElementById('phase-name-thai');

    // Split Thai (before first English word) from English part
    const words    = label.split(' ');
    const splitIdx = words.findIndex(w => /^[A-Za-z]/.test(w));
    const boundary = splitIdx < 0 ? words.length : splitIdx;
    const thaiPart = words.slice(0, boundary).join(' ');
    const engPart  = words.slice(boundary).join(' ');

    // Fade out current text
    if (phaseEl) phaseEl.classList.add('label-exit');
    if (thaiEl)  thaiEl.classList.add('label-exit');

    setTimeout(() => {
      if (phaseEl) {
        phaseEl.textContent = engPart || thaiPart;
        phaseEl.classList.remove('label-exit');
        phaseEl.classList.add('label-enter');
        setTimeout(() => phaseEl && phaseEl.classList.remove('label-enter'), 350);
      }
      if (thaiEl) {
        thaiEl.textContent = thaiPart;
        thaiEl.classList.remove('label-exit');
        thaiEl.classList.add('label-enter');
        setTimeout(() => thaiEl && thaiEl.classList.remove('label-enter'), 350);
      }
    }, 150);
  }

  /** Cross-fades the countdown number for a smooth, bouncy reveal */
  updateCountdown(num) {
    const aEl = document.getElementById('timer-count');
    const bEl = document.getElementById('timer-count-b');

    if (!bEl) {
      if (aEl) aEl.textContent = num;
      return;
    }

    // Promote new number via B element
    bEl.textContent = num;
    bEl.classList.remove('counter-hidden');
    if (aEl) aEl.classList.add('counter-hidden');

    setTimeout(() => {
      if (aEl) {
        aEl.textContent = num;
        aEl.classList.remove('counter-hidden');
        aEl.classList.add('counter-bounce');
        setTimeout(() => aEl && aEl.classList.remove('counter-bounce'), 320);
      }
      bEl.classList.add('counter-hidden');
    }, 180);
  }

  /** Triggers the energy-ring ripple animation on breathing cycle completion */
  triggerCycleRipple() {
    const ring = document.getElementById('energy-ripple-ring');
    if (!ring) return;
    ring.classList.remove('ripple');
    void ring.offsetWidth; // force reflow to restart animation
    ring.classList.add('ripple');
    setTimeout(() => ring && ring.classList.remove('ripple'), 800);
  }

  /** Spawns bright spark particles at phase transitions */
  spawnSparks() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w   = this.canvas.width  / dpr;
    const h   = this.canvas.height / dpr;
    for (let i = 0; i < 8; i++) {
      this.particles.push(new ReactorParticle(w, h, 'spark', this.currentColor.hex));
    }
  }

  /** Sets up subtle mouse-parallax offset for the star layer */
  initParallax() {
    const panel = document.querySelector('.canvas-panel');
    if (!panel) return;
    panel.addEventListener('mousemove', (e) => {
      const rect = panel.getBoundingClientRect();
      this.parallaxX = ((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)) * 6;
      this.parallaxY = ((e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)) * 6;
    });
    panel.addEventListener('mouseleave', () => {
      this.parallaxX = 0;
      this.parallaxY = 0;
    });
  }

  updateStatsDisplay() {
    document.getElementById('stat-sessions-val').innerText = this.stats.completedSessions;
    document.getElementById('stat-minutes-val').innerText = Math.round(this.stats.totalMinutes);
  }

  async runAiTherapist() {
    const inputArea = document.getElementById('ai-feeling-input');
    const text = inputArea.value.trim();

    if (!text) {
      this.logConsole("No sentiment input provided for AI Mindful Therapist", "warn");
      alert("กรุณากรอกความรู้สึกหรือระดับความเครียดของคุณก่อนส่งวิเคราะห์");
      return;
    }

    const btn = document.getElementById('ai-generate-btn');
    btn.disabled = true;
    btn.innerText = 'วิเคราะห์คลื่นพลังงาน...';
    this.logConsole(`Sending feeling to Gemini AI Mindful Therapist: "${text}"`, "info");

    this.resetInfographic();

    const result = await this.geminiService.generateTherapyProfile(text);
    
    btn.disabled = false;
    btn.innerText = 'สังเคราะห์คลื่นบำบัดเฉพาะบุคคล';

    this.updateApiStatusIndicator(result.mode);

    if (result.profile) {
      this.lastAiProfile = result.profile;
      this.displayAiTherapyResults(result.profile);
    } else {
      this.logConsole("Therapy synthesis failed. Try again.", "error");
    }
  }

  displayAiTherapyResults(profile) {
    this.logConsole(`AI Synthesized profile: "${profile.techniqueName}"`, "success");

    document.getElementById('ai-therapy-name').innerText = profile.techniqueName;
    document.getElementById('ai-therapy-tagline').innerText = profile.tagline;
    document.getElementById('ai-therapy-reason').innerText = profile.colorReason;
    document.getElementById('ai-therapy-affirmation').innerText = `"${profile.affirmation}"`;

    const cleanHex = profile.colorHex.trim();
    let computedRgb = "102, 187, 106"; // Fallback Green
    
    if (/^#[0-9A-F]{6}$/i.test(cleanHex)) {
      const r = parseInt(cleanHex.substring(1, 3), 16);
      const g = parseInt(cleanHex.substring(3, 5), 16);
      const b = parseInt(cleanHex.substring(5, 7), 16);
      computedRgb = `${r}, ${g}, ${b}`;
    }

    const compiledColor = {
      key: "ai_custom_" + Date.now(),
      name: profile.techniqueName,
      tagline: profile.tagline,
      hex: cleanHex,
      rgb: computedRgb,
      cct: "AI Wave Spectrum",
      rec: "ปรับแต่งตามจังหวะชีพจรวิเคราะห์โดย AI Mindful Therapist"
    };

    this.animateInfographic(profile.infographic);

    const actionBtnArea = document.getElementById('ai-action-area');
    actionBtnArea.innerHTML = '';
    
    const applyBtn = document.createElement('button');
    applyBtn.className = 'btn-primary';
    applyBtn.style.background = cleanHex;
    const brightness = (parseInt(computedRgb.split(',')[0]) * 299 + parseInt(computedRgb.split(',')[1]) * 587 + parseInt(computedRgb.split(',')[2]) * 114) / 1000;
    applyBtn.style.color = brightness > 125 ? '#070913' : '#ffffff';
    applyBtn.innerHTML = `
      <svg style="width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
      เริ่มต้นฝึกจังหวะนี้ทันที
    `;
    
    applyBtn.addEventListener('click', () => {
      this.applyColorTherapy(compiledColor);
      
      const compiledTechnique = {
        key: "ai_tech_" + Date.now(),
        name: profile.techniqueName,
        tagline: profile.tagline,
        phases: profile.phases
      };

      this.applyBreathingTechnique(compiledTechnique);
      this.switchTab('canvas');
    });

    actionBtnArea.appendChild(applyBtn);
  }

  resetInfographic() {
    document.getElementById('cortisol-fill').style.width = '0%';
    document.getElementById('vagal-fill').style.width = '0%';
    document.getElementById('hr-fill').style.width = '0%';
  }

  animateInfographic(info) {
    if (!info) return;

    document.getElementById('info-title-text').innerText = info.title;
    document.getElementById('cortisol-label').innerText = info.cortisolLabel;
    document.getElementById('cortisol-value').innerText = `${info.cortisolBarPercent}%`;
    
    document.getElementById('vagal-label').innerText = info.vagalLabel;
    document.getElementById('vagal-value').innerText = `${info.vagalBarPercent}%`;
    
    document.getElementById('hr-label').innerText = info.hrLabel;
    document.getElementById('hr-value').innerText = `${info.hrBarPercent}%`;
    
    document.getElementById('info-shift-label').innerText = info.shiftLabel;
    document.getElementById('info-session-time').innerText = `การฝึก: ${info.recommendedTime}`;

    setTimeout(() => {
      document.getElementById('cortisol-fill').style.width = `${info.cortisolBarPercent}%`;
      document.getElementById('vagal-fill').style.width = `${info.vagalBarPercent}%`;
      document.getElementById('hr-fill').style.width = `${info.hrBarPercent}%`;
    }, 50);
  }

  initParticles() {
    this.canvas = document.getElementById('core-particles');
    if (!this.canvas) return;
    this.ctx       = this.canvas.getContext('2d');
    this.particles = [];

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.initParallax();
    this.animateCore();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width  = rect.width  * (window.devicePixelRatio || 1);
    this.canvas.height = rect.height * (window.devicePixelRatio || 1);
    this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }

  animateCore() {
    requestAnimationFrame(() => this.animateCore());
    if (!this.canvas || !this.ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w   = this.canvas.width  / dpr;
    const h   = this.canvas.height / dpr;

    // Completely transparent clear every frame — removes the black square!
    this.ctx.clearRect(0, 0, w, h);

    // --- Gauge arc progress ---
    const gauge = document.getElementById('hud-progress-arc');
    if (gauge) {
      if (this.isPlaying && this.phaseStartTime > 0) {
        const elapsed = Date.now() - this.phaseStartTime;
        const pct     = Math.min(1, elapsed / this.phaseDurationMs);
        gauge.style.strokeDashoffset = 534 * pct;
      } else {
        gauge.style.strokeDashoffset = 0;
      }
    }

    // --- Star layer slow drift + parallax ---
    this.starsDriftAngle = ((this.starsDriftAngle || 0) + 0.004) % 360;
    const starsEl = document.querySelector('.canvas-panel .bg-stars');
    if (starsEl) {
      const px = (this.parallaxX || 0) * 0.6;
      const py = (this.parallaxY || 0) * 0.6;
      starsEl.style.transform = `rotate(${this.starsDriftAngle}deg) translate(${px}px, ${py}px)`;
    }

    // --- Particle emission ---
    const currentPhase = this.isPlaying
      ? this.currentTechnique.phases[this.currentPhaseIndex]
      : null;
    const phaseType = currentPhase ? currentPhase.type : null;

    // Count existing particles by type
    const counts = {};
    this.particles.forEach(p => { counts[p.particleType] = (counts[p.particleType] || 0) + 1; });

    // Ambient dust — always present
    if ((counts['ambient']   || 0) < 12 && Math.random() < 0.18) {
      this.particles.push(new ReactorParticle(w, h, 'ambient',    this.currentColor.hex));
    }
    // Glow dust — orbits rings, always present
    if ((counts['glow-dust'] || 0) <  7 && Math.random() < 0.12) {
      this.particles.push(new ReactorParticle(w, h, 'glow-dust',  this.currentColor.hex));
    }
    // Phase-specific directional particles
    if (this.isPlaying) {
      if (phaseType === 'in'  && (counts['breath-in'] || 0) < 22 && Math.random() < 0.38) {
        this.particles.push(new ReactorParticle(w, h, 'breath-in', this.currentColor.hex));
      } else if (phaseType === 'out' && (counts['release'] || 0) < 18 && Math.random() < 0.32) {
        this.particles.push(new ReactorParticle(w, h, 'release',   this.currentColor.hex));
      }
      // Hold: only ambient + glow-dust continue floating
    }

    // Update and draw all particles
    this.particles = this.particles.filter(p => {
      const alive = p.update(w, h);
      if (alive) p.draw(this.ctx);
      return alive;
    });
  }



  showSpecCode(file) {
    const pane = document.getElementById('spec-code-pane');
    const tabs = document.querySelectorAll('.spec-tab');
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (file === 'kotlin-service') {
      document.getElementById('spec-tab-kotlin-service').classList.add('active');
      pane.innerText = `// File: app/src/main/java/com/example/GeminiService.kt
package com.example

import com.squareup.moshi.JsonClass
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Query
import java.util.concurrent.TimeUnit

@JsonClass(generateAdapter = true)
data class GeminiRequest(
    val contents: List<GeminiContent>,
    val systemInstruction: GeminiContent? = null,
    val generationConfig: GeminiGenerationConfig? = null
)

@JsonClass(generateAdapter = true)
data class AiTherapyProfile(
    val colorHex: String,
    val colorReason: String,
    val techniqueName: String,
    val tagline: String,
    val phases: List<AiPhase>,
    val affirmation: String,
    val infographic: AiInfographic? = null
)`;
    } else if (file === 'kotlin-main') {
      document.getElementById('spec-tab-kotlin-main').classList.add('active');
      pane.innerText = `// File: app/src/main/java/com/example/MainActivity.kt
// (Excerpt of Core Clinical Specs)

data class ColorTherapy(
    val key: String,
    val name: String,
    val tagline: String,
    val hex: String,
    val moods: List<String>,
    val rec: String,
    val cct: String
)

data class BreathingPhase(
    val label: String,
    val duration: Int,
    val type: String // "in" = หายใจเข้า, "out" = หายใจออก, "hold" = กลั้นหายใจ
)

val DEFAULT_COLOR_THERAPIES = listOf(
    ColorTherapy(
        key = "circadian_blue",
        name = "Circadian Sync (460nm)",
        hex = "#42a5f5"
    ),
    ColorTherapy(
        key = "stress_green",
        name = "Stress Reduction (525nm)",
        hex = "#66bb6a"
    )
)`;
    }
  }
}

// Map both names for HTML compatibility
window.LumicalmApp = LunicalmApp;
window.LunicalmApp = LunicalmApp;
