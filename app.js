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

    // Emotional Insight Session State
    this.sessionState = {
      primaryEmotion: null,
      secondaryEmotions: [],
      emotionIntensity: 0,
      situation: '',
      thought: '',
      facts: '',
      interpretations: '',
      goal: '',
      selectedCopingOption: '',
      reflection: '',
      selectedSkill: null,
      nextStep: '',
      pauseNotice: '',
      pauseReflect: '',
      pauseChoose: '',
      completedModules: []
    };
  }

  init() {
    // 1. Setup Audio Synth Log Hook
    this.audioSynthesizer.setLogCallback((msg, type) => this.logConsole(msg, type));

    // 2. Initialize Text-Based Sentiment Analysis Engine
    this.logConsole("Text-Based Sentiment Analysis Engine active", "success");

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
    // 1. Drawer Opening/Closing Events (Registered FIRST with defensive null checks)
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    const backdrop = document.getElementById('drawer-backdrop');

    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', (e) => {
        if (e) e.stopPropagation();
        this.openDrawer();
      });
    }
    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener('click', (e) => {
        if (e) e.stopPropagation();
        this.closeDrawer();
      });
    }
    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeDrawer());
    }

    // Close on Escape key press
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeDrawer();
      }
    });

    // 2. Tab Navigation Events (closes drawer after selection)
    document.querySelectorAll('.nav-btn').forEach(btn => {
      if (btn) {
        btn.addEventListener('click', (e) => {
          const item = e.currentTarget.closest('.nav-item');
          if (item) {
            const tabId = item.dataset.tab;
            if (tabId === 'ai') {
              this.openFeelingModal();
            } else if (tabId) {
              this.switchTab(tabId);
            }
            this.closeDrawer();
          }
        });
      }
    });

    // 3. Breathing Controller Buttons with null checks
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
      playBtn.addEventListener('click', () => this.toggleBreathing());
    }

    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetBreathing());
    }

    // 4. Audio Engine Toggle Switch with null check
    const audioSwitch = document.getElementById('audio-switch');
    if (audioSwitch) {
      audioSwitch.addEventListener('change', (e) => {
        this.toggleAudioEngine(e.target.checked);
      });
    }

    // 5. AI Therapist Generate button with null check
    const aiGenerateBtn = document.getElementById('ai-generate-btn');
    if (aiGenerateBtn) {
      aiGenerateBtn.addEventListener('click', () => this.runAiTherapist());
    }

    // 6. Feeling Selector Modal Pop-up Init
    this.initFeelingModal();

    // 7. Feedback Panel initialization
    this.initFeedback();
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
      setTimeout(() => this.renderInsightPanel(this.lastAiProfile.emotionProfile), 100);
    }
  }

  openDrawer() {
    const drawer = document.getElementById('sidebar-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (drawer) {
      drawer.classList.add('open');
      drawer.style.transform = 'translateX(0)';
    }
    if (backdrop) {
      backdrop.classList.add('active');
      backdrop.style.opacity = '1';
      backdrop.style.pointerEvents = 'auto';
    }
    this.logConsole("Drawer opened", "info");
  }

  closeDrawer() {
    const drawer = document.getElementById('sidebar-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (drawer) {
      drawer.classList.remove('open');
      drawer.style.transform = '';
    }
    if (backdrop) {
      backdrop.classList.remove('active');
      backdrop.style.opacity = '';
      backdrop.style.pointerEvents = '';
    }
    this.logConsole("Drawer closed", "info");
  }

  initFeedback() {
    this.feedbackRating = 0;
    const starBtns = document.querySelectorAll('.star-btn');

    // Hover interaction: light up stars up to the hovered one
    starBtns.forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        const hoverVal = parseInt(btn.dataset.star);
        starBtns.forEach(s => {
          const val = parseInt(s.dataset.star);
          s.classList.toggle('hovered', val <= hoverVal);
          s.classList.remove('selected');
        });
      });

      btn.addEventListener('mouseleave', () => {
        starBtns.forEach(s => {
          s.classList.remove('hovered');
          // Restore the selected state
          s.classList.toggle('selected', parseInt(s.dataset.star) <= this.feedbackRating);
        });
      });

      // Click: lock in the rating
      btn.addEventListener('click', () => {
        this.feedbackRating = parseInt(btn.dataset.star);
        starBtns.forEach(s => {
          s.classList.toggle('selected', parseInt(s.dataset.star) <= this.feedbackRating);
          s.classList.remove('hovered');
        });
      });
    });

    // Submit button
    const submitBtn = document.getElementById('feedback-submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitFeedback());
    }

    // Reset form button (shown on success overlay)
    const resetBtn = document.getElementById('feedback-reset-form-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const overlay = document.getElementById('feedback-success-overlay');
        if (overlay) overlay.style.display = 'none';
        // Reset form state
        this.feedbackRating = 0;
        starBtns.forEach(s => s.classList.remove('selected', 'hovered'));
        const textarea = document.getElementById('feedback-text-input');
        if (textarea) textarea.value = '';
      });
    }
  }

  submitFeedback() {
    const textarea = document.getElementById('feedback-text-input');
    const comment = textarea ? textarea.value.trim() : '';

    if (this.feedbackRating === 0) {
      // Gently shake the stars to prompt a rating
      const container = document.getElementById('stars-container');
      if (container) {
        container.style.animation = 'none';
        container.offsetHeight; // trigger reflow
        container.style.animation = 'numberBounce 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97)';
      }
      return;
    }

    // Persist to LocalStorage
    const entry = {
      rating: this.feedbackRating,
      comment,
      timestamp: new Date().toISOString()
    };
    const existing = JSON.parse(localStorage.getItem('lunicalm_feedback') || '[]');
    existing.push(entry);
    localStorage.setItem('lunicalm_feedback', JSON.stringify(existing));

    // Show success overlay
    const overlay = document.getElementById('feedback-success-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
    }

    this.logConsole(`Feedback submitted: ${this.feedbackRating} stars`, 'success');
  }

  updateApiStatusIndicator(status) {
    const dot = document.getElementById('api-dot');
    const label = document.getElementById('api-status-label');
    
    if (dot) {
      dot.className = 'status-dot';
      dot.classList.add(status || 'online');
    }
    if (label) {
      label.innerText = 'ระบบวิเคราะห์สภาวะอารมณ์ด้วยข้อความ (Text-Based Sentiment Analyzer)';
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
      orb.className = 'reactor-core moon-orb';
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
      orb.className = 'reactor-core moon-orb';
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
      orb.className = 'reactor-core moon-orb';
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
      this.logConsole("No sentiment input provided for Mindful Therapist", "warn");
      alert("กรุณากรอกความรู้สึกหรือสภาวะอารมณ์ของคุณก่อนวิเคราะห์");
      return;
    }

    const btn = document.getElementById('ai-generate-btn');
    btn.disabled = true;
    btn.innerText = 'วิเคราะห์สภาวะอารมณ์...';
    this.logConsole(`Analyzing text sentiment: "${text}"`, "info");

    const result = await this.geminiService.generateTherapyProfile(text);
    
    btn.disabled = false;
    btn.innerText = 'วิเคราะห์และปรับแต่งคลื่นผ่อนคลาย';

    this.updateApiStatusIndicator(result.mode);

    if (result.profile) {
      this.lastAiProfile = result.profile;
      
      // Initialize Session State from detected profile
      const ep = result.profile.emotionProfile || {};
      this.sessionState = {
        primaryEmotion: ep.primary || { label: 'เครียด', labelEn: 'Stressed', intensity: 7 },
        secondaryEmotions: ep.secondary || [],
        emotionIntensity: (ep.primary && ep.primary.intensity) || 7,
        situation: text,
        thought: '',
        facts: '',
        interpretations: '',
        goal: '',
        selectedCopingOption: '',
        reflection: '',
        selectedSkill: null,
        nextStep: '',
        pauseNotice: '',
        pauseReflect: '',
        pauseChoose: '',
        completedModules: []
      };

      this.displayAiTherapyResults(result.profile);
      this.renderInsightPanel(ep);
    } else {
      this.logConsole("Sentiment analysis processing failed. Try again.", "error");
    }
  }

  /* --- Feeling Selector Pop-up Modal Methods --- */
  openFeelingModal() {
    const backdrop = document.getElementById('feeling-modal-backdrop');
    if (backdrop) {
      backdrop.style.display = 'flex';
      const textInput = document.getElementById('popup-feeling-text');
      if (textInput) {
        textInput.focus();
      }
    }
  }

  closeFeelingModal() {
    const backdrop = document.getElementById('feeling-modal-backdrop');
    if (backdrop) {
      backdrop.style.display = 'none';
    }
  }

  initFeelingModal() {
    const backdrop = document.getElementById('feeling-modal-backdrop');
    const closeBtn = document.getElementById('feeling-modal-close');
    const cancelBtn = document.getElementById('feeling-modal-cancel');
    const submitBtn = document.getElementById('feeling-modal-submit');
    const textInput = document.getElementById('popup-feeling-text');
    const presetBtns = document.querySelectorAll('.feeling-preset-btn');

    if (closeBtn) closeBtn.addEventListener('click', () => this.closeFeelingModal());
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.closeFeelingModal();
        this.switchTab('ai');
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.closeFeelingModal();
      });
    }

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (textInput) {
          textInput.value = btn.dataset.emotion || '';
          textInput.focus();
        }
      });

      btn.addEventListener('dblclick', () => {
        if (textInput) textInput.value = btn.dataset.emotion || '';
        this.submitFeelingModal();
      });
    });

    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitFeelingModal());
    }
  }

  submitFeelingModal() {
    const textInput = document.getElementById('popup-feeling-text');
    const aiInput = document.getElementById('ai-feeling-input');
    const val = textInput ? textInput.value.trim() : '';

    if (val && aiInput) {
      aiInput.value = val;
    }

    this.closeFeelingModal();
    this.switchTab('ai');

    if (val) {
      this.runAiTherapist();
    }
  }

  displayAiTherapyResults(profile) {
    this.logConsole(`Text Sentiment analysis generated profile: "${profile.techniqueName}"`, "success");

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
      cct: "Relaxation Spectrum",
      rec: "วิเคราะห์และปรับแต่งสภาวะผ่อนคลายตามข้อความอารมณ์"
    };

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

  /* Deprecated compatibility method */
  resetInfographic() {}
  animateInfographic() {}

  // ==========================================
  // EMOTIONAL INSIGHT ENGINE & ADAPTIVE SYSTEM
  // ==========================================

  renderInsightPanel(emotionProfile) {
    const emptyState = document.getElementById('insight-empty-state');
    const loadedState = document.getElementById('insight-loaded-state');
    const moduleSlot = document.getElementById('insight-module-slot');

    if (emptyState) emptyState.style.display = 'none';
    if (moduleSlot) moduleSlot.style.display = 'none';
    if (loadedState) loadedState.style.display = 'flex';

    // Category Badge
    const badgeMap = {
      stress: 'ความเครียด & วิตกกังวล',
      sleep: 'ความอ่อนล้า & สภาวะนอนหลับ',
      focus: 'สมาธิ & ความฟุ้งซ่าน',
      energy: 'ความเฉื่อยชา & พลังงานต่ำ',
      anger: 'ความหงุดหงิด & อารมณ์ร้อน',
      sadness: 'ความเศร้า & ความเปราะบาง',
      calm: 'สภาวะทั่วไป'
    };
    const badgeEl = document.getElementById('insight-category-badge');
    if (badgeEl) badgeEl.textContent = badgeMap[emotionProfile.category] || 'วิเคราะห์สภาวะอารมณ์';

    // Emotion Chips
    const chipGroup = document.getElementById('emotion-chip-group');
    if (chipGroup) {
      chipGroup.innerHTML = '';
      
      const primary = this.sessionState.primaryEmotion || emotionProfile.primary || { label: 'วิตกกังวล', intensity: 7 };
      const secondaries = this.sessionState.secondaryEmotions.length > 0 ? this.sessionState.secondaryEmotions : (emotionProfile.secondary || []);

      // Primary chip
      const pChip = document.createElement('div');
      pChip.className = 'emotion-chip chip-primary';
      pChip.innerHTML = `
        <div class="chip-header">
          <span class="chip-name">${primary.label}</span>
          <span class="chip-tag">หลัก (${primary.intensity}/10)</span>
        </div>
        <div class="chip-intensity-bar">
          <div class="chip-intensity-fill" style="width: ${primary.intensity * 10}%"></div>
        </div>
      `;
      chipGroup.appendChild(pChip);

      // Secondary chips
      secondaries.forEach(sec => {
        const sChip = document.createElement('div');
        sChip.className = 'emotion-chip chip-secondary';
        sChip.innerHTML = `
          <div class="chip-header">
            <span class="chip-name">${sec.label}</span>
            <span class="chip-tag">รอง (${sec.intensity}/10)</span>
          </div>
          <div class="chip-intensity-bar">
            <div class="chip-intensity-fill" style="width: ${sec.intensity * 10}%; background: rgba(255,255,255,0.3);"></div>
          </div>
        `;
        chipGroup.appendChild(sChip);
      });
    }

    // Reflection text
    const reflEl = document.getElementById('insight-reflection-text');
    if (reflEl) reflEl.textContent = `"${emotionProfile.reflection || 'สภาวะจิตใจอยู่ในเกณฑ์ที่สามารถผ่อนคลายและทำความเข้าใจได้อย่างนุ่มนวล'}"`;

    // Adaptive Recommendations
    const recsGroup = document.getElementById('insight-recs-group');
    if (recsGroup) {
      recsGroup.innerHTML = '';
      const recs = this.getAdaptiveRecommendations(emotionProfile);
      
      recs.forEach(rec => {
        const card = document.createElement('div');
        card.className = 'rec-card';
        card.innerHTML = `
          <div class="rec-card-icon">${rec.icon}</div>
          <div class="rec-card-content">
            <div class="rec-card-title">${rec.title}</div>
            <div class="rec-card-desc">${rec.desc}</div>
          </div>
          <div class="rec-card-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        `;
        card.addEventListener('click', () => this.openModule(rec.id));
        recsGroup.appendChild(card);
      });
    }
  }

  getAdaptiveRecommendations(emotionProfile) {
    const state = this.sessionState;
    const completed = state.completedModules || [];
    const recs = [];

    // All available module metadata definitions
    const modules = {
      m4: {
        id: 'm4',
        title: 'System #4 — สำรวจและจำแนกอารมณ์ที่หลากหลาย',
        desc: 'เมื่อมีความรู้สึกเกิดขึ้นหลายอย่างพร้อมกัน ลองระบุอารมณ์หลัก อารมณ์รอง และระดับความเข้มข้น',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8"></path></svg>'
      },
      m5: {
        id: 'm5',
        title: 'System #5 — สำรวจความคิดที่เชื่อมโยงกับอารมณ์',
        desc: 'ความคิดใดแล่นเข้ามาในหัวเมื่อคุณรู้สึกเช่นนี้? สำรวจสถานการณ์ อารมณ์ และความคิด',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'
      },
      m6: {
        id: 'm6',
        title: 'System #6 — แยกแยะข้อเท็จจริงกับการตีความ',
        desc: 'สิ่งที่เกิดขึ้นจริงแน่ๆ กับสิ่งที่คุณกำลังคาดเดาหรือตีความ มีส่วนใดที่แตกต่างกัน?',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"></path></svg>'
      },
      m8: {
        id: 'm8',
        title: 'System #8 — เข้าสู่ Pause Mode (ชะลอจังหวะ)',
        desc: 'เมื่ออารมณ์มีความเข้มข้นสูง ลองหยุดพักชั่วครู่ รับรู้สภาวะ และตั้งสติก่อนตัดสินใจ',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
      },
      m9: {
        id: 'm9',
        title: 'System #9 — พื้นที่เขียนระบายความคิด (Release Space)',
        desc: 'เขียนสิ่งที่คุณอยากปลดปล่อยได้อย่างอิสระ ปราศจากการตัดสินหรือการประเมิน',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>'
      },
      m10: {
        id: 'm10',
        title: 'System #10 — ระบุสิ่งที่สำคัญที่สุดสำหรับคุณ',
        desc: 'อะไรคือเป้าหมาย คุณค่า หรือสิ่งที่คุณต้องการให้เกิดขึ้นในสถานการณ์นี้?',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'
      },
      m7: {
        id: 'm7',
        title: 'System #7 — เลือกทางเลือกในการรับมือ (Coping Options)',
        desc: 'สำรวจทางเลือก 2–4 แนวทางที่คุณอาจเลือกทำ หรือเลือกที่จะยังไม่ทำสิ่งใดในตอนนี้',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>'
      },
      m14: {
        id: 'm14',
        title: 'System #14 — รับคำแนะนำที่สะท้อนใจไร้การตัดสิน',
        desc: 'ประมวลสรุปสภาวะเพื่อสร้างความเข้าใจในตนเองอย่างอ่อนโยน',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
      },
      m12: {
        id: 'm12',
        title: 'System #12 — เรียนรู้ทักษะจัดการอารมณ์แบบกระชับ',
        desc: 'ฝึกทักษะทางอารมณ์ 1 อย่าง เช่น การตั้งชื่ออารมณ์ การแยกข้อเท็จจริง หรือการแบ่งขั้นตอน',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>'
      },
      m15: {
        id: 'm15',
        title: 'System #15 — สรุปผลการสำรวจและขั้นตอนถัดไป',
        desc: 'สรุปสิ่งที่คุณได้พบ ได้สำรวจ ได้เลือก และข้อเสนอแนะขั้นตอนถัดไปอย่างผ่อนคลาย',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>'
      }
    };

    // Rule 1: High Emotional Intensity (>= 8) -> Recommend Pause Mode & Release Space
    if (state.emotionIntensity >= 8 && !completed.includes('m8')) {
      recs.push(modules.m8);
    }
    if (state.emotionIntensity >= 7 && !completed.includes('m9')) {
      recs.push(modules.m9);
    }

    // Rule 2: Multiple Emotions Detected -> Recommend Emotion Breakdown & Thought Exploration
    if (state.secondaryEmotions.length > 0 && !completed.includes('m4')) {
      recs.push(modules.m4);
    }
    if (!completed.includes('m5')) {
      recs.push(modules.m5);
    }

    // Rule 3: Stress/Anger/Sadness -> Recommend Fact vs Interpretation & Identify What Matters
    if (['stress', 'anger', 'sadness'].includes(emotionProfile.category) && !completed.includes('m6')) {
      recs.push(modules.m6);
    }
    if (!completed.includes('m10')) {
      recs.push(modules.m10);
    }

    // Rule 4: Explored thoughts/emotions -> Coping Options
    if ((completed.includes('m5') || completed.includes('m6') || completed.includes('m10')) && !completed.includes('m7')) {
      recs.push(modules.m7);
    }

    // Rule 5: Selected coping or released -> Guidance & Practical Skill
    if ((completed.includes('m7') || completed.includes('m9')) && !completed.includes('m14')) {
      recs.push(modules.m14);
    }
    if (completed.length >= 2 && !completed.includes('m12')) {
      recs.push(modules.m12);
    }

    // Rule 6: Final continuity layer -> Next Steps
    if (completed.length >= 2 && !completed.includes('m15')) {
      recs.push(modules.m15);
    }

    // Filter out already completed modules if we have enough options
    let filtered = recs.filter(r => !completed.includes(r.id));
    if (filtered.length === 0) {
      // Fallback if all recommended are completed
      filtered = [modules.m12, modules.m15].filter(r => !completed.includes(r.id));
      if (filtered.length === 0) filtered = [modules.m15];
    }

    // Return max 3 recommendations
    return filtered.slice(0, 3);
  }

  openModule(moduleId) {
    const loadedState = document.getElementById('insight-loaded-state');
    const moduleSlot = document.getElementById('insight-module-slot');

    if (loadedState) loadedState.style.display = 'none';
    if (moduleSlot) {
      moduleSlot.style.display = 'flex';
      moduleSlot.innerHTML = '';

      // Render header with Back button
      const header = document.createElement('div');
      header.className = 'module-header';
      header.innerHTML = `
        <div class="module-title-group">
          <span class="module-badge">Active Module</span>
          <span class="module-title" id="module-title-text"> Emotional Support Module</span>
        </div>
        <button class="module-back-btn" id="module-back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          ย้อนกลับสู่ Emotional Insight
        </button>
      `;
      moduleSlot.appendChild(header);

      document.getElementById('module-back-btn').addEventListener('click', () => this.closeModule());

      const body = document.createElement('div');
      body.className = 'module-body';
      body.id = 'module-body-content';
      moduleSlot.appendChild(body);

      // Route to individual module renderer
      switch (moduleId) {
        case 'm4':  this.renderModule4_EmotionBreakdown(body); break;
        case 'm5':  this.renderModule5_ThoughtExploration(body); break;
        case 'm6':  this.renderModule6_FactVsInterpretation(body); break;
        case 'm7':  this.renderModule7_CopingOptions(body); break;
        case 'm8':  this.renderModule8_PauseMode(body); break;
        case 'm9':  this.renderModule9_ReleaseSpace(body); break;
        case 'm10': this.renderModule10_WhatMatters(body); break;
        case 'm12': this.renderModule12_PracticalSkills(body); break;
        case 'm14': this.renderModule14_NonJudgmentalGuidance(body); break;
        case 'm15': this.renderModule15_NextSteps(body); break;
        default:    this.closeModule(); break;
      }
    }
  }

  closeModule() {
    const loadedState = document.getElementById('insight-loaded-state');
    const moduleSlot = document.getElementById('insight-module-slot');

    if (moduleSlot) moduleSlot.style.display = 'none';
    if (loadedState) loadedState.style.display = 'flex';

    if (this.lastAiProfile) {
      this.renderInsightPanel(this.lastAiProfile.emotionProfile);
    }
  }

  markModuleCompleted(moduleId) {
    if (!this.sessionState.completedModules.includes(moduleId)) {
      this.sessionState.completedModules.push(moduleId);
    }
  }

  // --- MODULE 4: Emotion Breakdown ---
  renderModule4_EmotionBreakdown(container) {
    document.getElementById('module-title-text').textContent = 'System #4 — Emotion Breakdown (สำรวจอารมณ์สะสม)';
    
    container.innerHTML = `
      <div class="module-prompt">
        "ดูเหมือนคุณกำลังมีความรู้สึกหลายอย่างเกิดขึ้นพร้อมกัน คุณสามารถเลือกและยืนยันอารมณ์หลัก/รองเพื่อทำความเข้าใจตนเองได้ดีขึ้น"
      </div>

      <div class="module-input-group">
        <label class="module-input-label">อารมณ์หลักที่คุณรู้สึกเด่นที่สุด (Primary Feeling)</label>
        <input type="text" class="module-text-input" id="m4-primary-input" value="${this.sessionState.primaryEmotion ? this.sessionState.primaryEmotion.label : 'วิตกกังวล'}" />
      </div>

      <div class="module-input-group">
        <label class="module-input-label">ระดับความเข้มข้นของอารมณ์ (Intensity: 1-10)</label>
        <div style="display:flex; align-items:center; gap:1rem;">
          <input type="range" min="1" max="10" value="${this.sessionState.emotionIntensity || 7}" id="m4-intensity-slider" style="flex-grow:1; accent-color:#a78bfa; cursor:pointer;" />
          <span id="m4-intensity-val" style="font-weight:700; color:#c4b5fd; min-width:45px;">${this.sessionState.emotionIntensity || 7}/10</span>
        </div>
      </div>

      <div class="module-input-group">
        <label class="module-input-label">ความรู้สึกรองอื่นๆ ที่เกิดขึ้นร่วมกัน (Secondary Feelings)</label>
        <input type="text" class="module-text-input" id="m4-secondary-input" value="${this.sessionState.secondaryEmotions.map(e => e.label).join(', ') || 'เครียดสะสม, กดดัน'}" placeholder="ระบุอารมณ์รองแยกด้วยเครื่องหมายจุลภาค..." />
      </div>

      <div class="module-action-row">
        <button class="btn-primary" id="m4-save-btn" style="background:#a78bfa; color:#fff;">
          บันทึกและอัปเดตสภาวะอารมณ์
        </button>
      </div>
    `;

    const slider = document.getElementById('m4-intensity-slider');
    const valText = document.getElementById('m4-intensity-val');
    slider.addEventListener('input', (e) => valText.textContent = `${e.target.value}/10`);

    document.getElementById('m4-save-btn').addEventListener('click', () => {
      const prim = document.getElementById('m4-primary-input').value.trim();
      const inten = parseInt(slider.value, 10);
      const secs = document.getElementById('m4-secondary-input').value.split(',').map(s => s.trim()).filter(Boolean);

      this.sessionState.primaryEmotion = { label: prim, intensity: inten };
      this.sessionState.emotionIntensity = inten;
      this.sessionState.secondaryEmotions = secs.map(s => ({ label: s, intensity: Math.max(1, inten - 2) }));

      this.markModuleCompleted('m4');
      this.closeModule();
    });
  }

  // --- MODULE 5: Thought Exploration ---
  renderModule5_ThoughtExploration(container) {
    document.getElementById('module-title-text').textContent = 'System #5 — Thought Exploration (สำรวจความคิด)';

    container.innerHTML = `
      <div class="module-prompt">
        "ความคิดอะไรที่เกิดขึ้นในหัวเมื่อคุณรู้สึกเช่นนี้? การเขียนความคิดออกมาช่วยให้คุณมองเห็นสภาวะจิตใจได้ชัดเจนขึ้น"
      </div>

      <div class="module-input-group">
        <label class="module-input-label">สถานการณ์ที่เกิดขึ้น (Situation)</label>
        <input type="text" class="module-text-input" id="m5-situation" value="${this.sessionState.situation || ''}" placeholder="เกิดอะไรขึ้น หรือเรื่องอะไรที่ทำให้คุณรู้สึกเช่นนี้..." />
      </div>

      <div class="module-input-group">
        <label class="module-input-label">ความคิดที่แล่นเข้ามาในหัว (Automatic Thought)</label>
        <textarea class="module-textarea" id="m5-thought" placeholder="ฉันคิดว่า... เช่น กังวลว่าจะทำได้ไม่ดี หรือ คิดว่าคนอื่นจะไม่เข้าใจ...">${this.sessionState.thought || ''}</textarea>
      </div>

      <div class="module-action-row">
        <button class="btn-primary" id="m5-save-btn" style="background:#a78bfa; color:#fff;">
          บันทึกการสำรวจความคิด
        </button>
      </div>
    `;

    document.getElementById('m5-save-btn').addEventListener('click', () => {
      this.sessionState.situation = document.getElementById('m5-situation').value.trim();
      this.sessionState.thought = document.getElementById('m5-thought').value.trim();

      this.markModuleCompleted('m5');
      this.closeModule();
    });
  }

  // --- MODULE 6: Fact vs Interpretation ---
  renderModule6_FactVsInterpretation(container) {
    document.getElementById('module-title-text').textContent = 'System #6 — Fact vs. Interpretation (แยกแยะข้อเท็จจริง)';

    container.innerHTML = `
      <div class="module-prompt">
        "การแยกแยะสิ่งที่เกิดขึ้นจริง ออกจากสิ่งที่เราคาดเดาหรือตีความ ช่วยลดความเครียดที่เกินจริงได้อย่างละมุน"
      </div>

      <div class="module-input-group">
        <label class="module-input-label">ส่วนใดคือข้อเท็จจริงที่คุณแน่ใจ 100% (What you know for certain)</label>
        <textarea class="module-textarea" id="m6-facts" placeholder="เช่น เขายังไม่ได้ตอบข้อความ หรือ งานยังทำไม่เสร็จ...">${this.sessionState.facts || ''}</textarea>
      </div>

      <div class="module-input-group">
        <label class="module-input-label">ส่วนใดคือการตีความ คาดเดา หรือสมมติฐานในหัว (Interpretation or prediction)</label>
        <textarea class="module-textarea" id="m6-interpretations" placeholder="เช่น คิดว่าเขาไม่พอใจ หรือ คิดว่าผลลัพธ์จะออกมาแย่...">${this.sessionState.interpretations || ''}</textarea>
      </div>

      <div class="module-action-row">
        <button class="btn-primary" id="m6-save-btn" style="background:#a78bfa; color:#fff;">
          บันทึกการแยกแยะ
        </button>
      </div>
    `;

    document.getElementById('m6-save-btn').addEventListener('click', () => {
      this.sessionState.facts = document.getElementById('m6-facts').value.trim();
      this.sessionState.interpretations = document.getElementById('m6-interpretations').value.trim();

      this.markModuleCompleted('m6');
      this.closeModule();
    });
  }

  // --- MODULE 7: Coping Options ---
  renderModule7_CopingOptions(container) {
    document.getElementById('module-title-text').textContent = 'System #7 — Coping Options (ทางเลือกในการรับมือ)';

    const options = [
      'ย่อยสถานการณ์ออกเป็นขั้นตอนเล็กๆ ที่ทำได้ง่าย',
      'หยุดพักชั่วคราวและถอยออกมาตั้งหลัก',
      'เขียนสกัดความคิดหรือสิ่งที่อยากพูดลงในกระดาษ',
      'พูดคุยระบายกับคนที่คุณไว้วางใจ',
      'ฝึกหายใจปรับสมดุลอารมณ์ให้สงบลงก่อน',
      'ยังไม่ต้องตัดสินใจทำอะไรในเวลานี้ (Do nothing for now)',
      'ยังไม่ต้องการเลือกทางเลือกใดในตอนนี้ (I don\'t want to choose right now)'
    ];

    const optionBtns = options.map((opt, i) => `
      <button class="module-option-btn" data-opt="${opt}">
        <span>${i + 1}. ${opt}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;color:var(--text-muted)"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
    `).join('');

    container.innerHTML = `
      <div class="module-prompt">
        "นี่คือทางเลือกที่เป็นไปได้ คุณเป็นผู้ครอบครองการตัดสินใจเสมอ โปรดเลือกทางเลือกที่รู้สึกผ่อนคลายที่สุดสำหรับคุณในตอนนี้:"
      </div>

      <div class="module-option-list">
        ${optionBtns}
      </div>
    `;

    container.querySelectorAll('.module-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sessionState.selectedCopingOption = btn.dataset.opt;
        this.markModuleCompleted('m7');
        this.closeModule();
      });
    });
  }

  // --- DYNAMIC PAUSE ACTIONS ENGINE ---
  getDynamicPauseActions(emotion = '', reflectText = '', situation = '') {
    const combined = `${emotion} ${reflectText} ${situation}`.toLowerCase();
    const shortEmotion = (emotion || 'ความรู้สึกนี้').trim();

    // 1. Detect emotion archetype
    const isAnger = /(โกรธ|โมโห|หงุดหงิด|ฉุนเฉียว|แค้น|เดือด|ร้อนใจ|เคือง|ไม่พอใจ|อารมณ์เสีย|anger|angry|frustrat)/i.test(combined);
    const isAnxiety = /(กังวล|กลัว|หวาด|ตระหนก|ระแวง|พะวง|แพนิค|ใจสั่น|anxious|anxiety|panic|fear|worry)/i.test(combined);
    const isSadness = /(เศร้า|เสียใจ|ผิดหวัง|ท้อ|ดิ่ง|ร้องไห้|น้อยใจ|เจ็บปวด|หม่นหมอง|sad|depress|hurt|sorrow)/i.test(combined);
    const isExhaustion = /(เหนื่อย|ล้า|เพลีย|หมดแรง|หมดพลัง|ง่วง|ไม่ไหว|หมดไฟ|ล้าสะสม|burnout|exhaust|tired|fatigue)/i.test(combined);
    const isConfusion = /(สับสน|ฟุ้งซ่าน|คิดมาก|คิดวน|ตื้อ|มึน|ตัน|จัดการไม่ได้|จับต้นชนปลาย|confus|overthink)/i.test(combined);
    
    // 2. Detect context clues
    const isInterpersonal = /(คน|แฟน|เพื่อน|หัวหน้า|ลูกน้อง|ลูกค้า|พ่อ|แม่|พี่|น้อง|เขา|เธอ|ทะเลาะ|พูด|ตอบ|ข้อความ|แชท|ไลน์|พิมพ์|ด่า|ว่า|ตำหนิ|ไม่เข้าใจ|วิจารณ์|เถียง)/i.test(combined);
    const isWorkOrTask = /(งาน|ส่งงาน|เดดไลน์|การบ้าน|สอบ|โปรเจกต์|ประชุม|พรีเซนต์|แก้|ทำไม่ทัน|ผิดพลาด|ลูกค้า|เจ้านาย|เอกสาร|deadline|task|work)/i.test(combined);
    const isUrgent = /(ด่วน|รีบ|ทันที|เดี๋ยวนี้|ช้าไม่ได้|ฉุกเฉิน|รีบร้อน|ตอนนี้เลย|urgent|hurry|rush|now)/i.test(combined);
    const hasPhysicalArousal = /(ใจสั่น|หัวใจเต้น|แน่นหน้าอก|หายใจไม่อิ่ม|ปวดหัว|ร้อน|มือสั่น|เกร็ง|ตัวชา|สั่น)/i.test(combined);

    // Dimension 1: Somatic & Nervous System Regulation
    let act1 = '';
    if (hasPhysicalArousal) {
      act1 = `วางมือทาบอก สูดหายใจเข้าลึก 4 วิ กลั้น 4 วิ ผ่อนออก 6 วิ เพื่อคลายอาการสั่นและตึงแน่นในร่างกาย`;
    } else if (isAnger) {
      act1 = `สูดหายใจเข้าสั้น 1 วินาที แล้วผ่อนลมออกทางปากยาวๆ 6 วินาที เพื่อระบายความร้อนรุ่มของ${shortEmotion}`;
    } else if (isAnxiety) {
      act1 = `ฝึกเทคนิคการหายใจแบบ 4-7-8 เพื่อลดอัตราการเต้นของหัวใจและระงับสัญญาณเตือนภัยของสมอง`;
    } else if (isExhaustion) {
      act1 = `ทิ้งน้ำหนักตัวลงบนพนักพิง หลับตาลง 2 นาที ปล่อยให้กล้ามเนื้อใบหน้าและไหล่คลายตัวอย่างอิสระ`;
    } else if (isSadness) {
      act1 = `วางมือทั้งสองข้างทาบอกอย่างนุ่มนวล หายใจเข้าช้าๆ เพื่อส่งความอบอุ่นและสร้างความรู้สึกปลอดภัยให้ตนเอง`;
    } else if (isConfusion) {
      act1 = `ใช้เทคนิค Grounding สังเกตสิ่งรอบตัว 3 สิ่งที่เห็น 2 สิ่งที่สัมผัสได้ และฟัง 1 เสียง เพื่อดึงสติกลับสู่ปัจจุบัน`;
    } else {
      act1 = `สูดลมหายใจเข้าลึกๆ ยืดอกขึ้น แล้วทิ้งไหล่ลงขณะผ่อนลมหายใจออกยาวๆ 3 ครั้งติดต่อกัน`;
    }

    // Dimension 2: Pacing & Boundary Cushion
    let act2 = '';
    if (isInterpersonal && (isUrgent || isAnger)) {
      act2 = `เว้นระยะห่างจากการพิมพ์หรือตอบโต้บทสนทนานี้อย่างน้อย 10 นาที เพื่อไม่ให้ตอบสนองด้วยอารมณ์ชั่ววูบ`;
    } else if (isInterpersonal) {
      act2 = `บอกอีกฝ่ายหรือคนรอบข้างอย่างสุภาพว่า 'ขอเวลาคิดทบทวนสักครู่ แล้วจะติดต่อกลับ' เพื่อลดแรงกดดัน`;
    } else if (isWorkOrTask && (isUrgent || isAnxiety)) {
      act2 = `หยุดมองภาพรวมทั้งหมดที่ทำให้ตื่นตระหนก แล้วเลือกทำชิ้นงานที่เล็กที่สุดเพียงชิ้นเดียวใน 15 นาทีข้างหน้า`;
    } else if (isWorkOrTask) {
      act2 = `แยกสิ่งที่จำเป็นต้องทำด่วนจริงๆ ออกจากสิ่งที่คิดไปเอง แล้วอนุญาตให้ตัวเองพักเบรกสั้นๆ ก่อนเริ่มต่อ`;
    } else if (isUrgent) {
      act2 = `ตั้งเวลาหยุดพัก 5 นาที บอกตัวเองว่าเรื่องนี้ยังไม่จำเป็นต้องได้ข้อสรุปที่สมบูรณ์แบบในวินาทีนี้`;
    } else if (isConfusion) {
      act2 = `หยุดค้นหาข้อมูลหรือคิดวิเคราะห์เรื่องนี้ชั่วคราว จนกว่าความรู้สึกสับสนในใจจะค่อยๆ คลี่คลาย`;
    } else {
      act2 = `ชะลอการตัดสินใจในเรื่องนี้ไว้ก่อน โดยยังไม่ลงมือทำสิ่งใดจนกว่าคลื่นอารมณ์จะสงบลง`;
    }

    // Dimension 3: Cognitive Externalization & Clarity
    let act3 = '';
    if (isInterpersonal) {
      act3 = `เขียนคำพูดหรือความรู้สึกอัดอั้นที่อยากระบายลงในกระดาษส่วนตัว เพื่อตรวจทานความต้องการที่แท้จริงก่อนสื่อสาร`;
    } else if (isWorkOrTask) {
      act3 = `จดสิ่งที่ต้องทำทั้งหมดลงกระดาษ แล้วขีดฆ่าสิ่งที่ไม่จำเป็นต้องทำในวันนี้ออกไปให้ชัดเจน`;
    } else if (isAnxiety) {
      act3 = `จดบันทึก 'สิ่งที่แย่ที่สุดที่กลัว' เทียบกับ 'ข้อเท็จจริงที่เกิดขึ้นจริง' เพื่อตัดวงจรความคิดปรุงแต่งเกินจริง`;
    } else if (isAnger) {
      act3 = `เขียนระบายสิ่งที่ทำให้โมโหอย่างตรงไปตรงมาลงในสมุดส่วนตัว โดยไม่ต้องตรวจทานหรือคำนึงถึงความสละสลวย`;
    } else if (isSadness) {
      act3 = `เขียนสิ่งที่ทำให้รู้สึกเจ็บปวดหรือผิดหวังออกมาสั้นๆ เพื่อให้ความรู้สึกนั้นมีพื้นที่ได้รับการรับรู้`;
    } else if (isConfusion) {
      act3 = `จดแยก 1 สิ่งที่ฉัน 'ควบคุมได้เอง' ออกจากสิ่งที่ไม่สามารถควบคุมได้ในสถานการณ์นี้`;
    } else {
      act3 = `เขียนสิ่งที่แล่นวนเวียนอยู่ในหัวออกมาใส่กระดาษ เพื่อปลดปล่อยสมองจากการแบกรับความคิดไว้คนเดียว`;
    }

    // Dimension 4: Environmental Shift & Behavioral Action
    let act4 = '';
    if (isWorkOrTask || isConfusion) {
      act4 = `ลุกออกจากโต๊ะทำงาน เดินไปดื่มน้ำเย็น 1 แก้ว หรือมองออกไปนอกหน้าต่างเพื่อตัดวงจรความตึงเครียดของสมอง`;
    } else if (isInterpersonal) {
      act4 = `ปลีกตัวออกมาอยู่ในพื้นที่เงียบส่วนตัว เช่น สูดอากาศในพื้นที่โล่ง เพื่อรีเซ็ตพลังงานของตนเอง`;
    } else if (isExhaustion) {
      act4 = `เปลี่ยนอิริยาบถ ลุกขึ้นยืดเหยียดกล้ามเนื้อเบาๆ หรือล้างหน้าด้วยน้ำเย็นเพื่อคืนความตื่นตัวอย่างอ่อนโยน`;
    } else if (isAnger) {
      act4 = `ขยับร่างกาย ขยับแขนขา หรือเดินเร็วๆ 2-3 นาที เพื่อระบายฮอร์โมนความเครียดและอะดรีนาลีนออกจากกล้ามเนื้อ`;
    } else if (isSadness) {
      act4 = `เปิดเพลงบรรเลงเบาๆ หรือทำสิ่งอ่อนโยน เช่น จิบเครื่องดื่มอุ่นๆ เพื่อปลอบประโลมจิตใจ`;
    } else {
      act4 = `ปรับเปลี่ยนสภาพแวดล้อมรอบตัว เปิดหน้าต่างรับอากาศใหม่ หรือขยับตัวออกจากจุดเดิมชั่วคราว`;
    }

    // Dimension 5: Mindful Acceptance & Self-Compassion
    let act5 = '';
    if (isAnxiety) {
      act5 = `อนุญาตให้ตัวเองรู้สึก${shortEmotion}ได้ แต่จะไม่ปล่อยให้อารมณ์นี้มาบงการการกระทำในวินาทีนี้`;
    } else if (isAnger) {
      act5 = `ยอมรับว่าฉันมีสิทธิ์โกรธ แต่ฉันมีอำนาจและอิสระเต็มที่ในการเลือกตอบสนองอย่างสงบและมีวุฒิภาวะ`;
    } else if (isSadness) {
      act5 = `โอบรับความเปราะบางของตนเอง เตือนใจว่า 'ไม่เป็นไรเลยที่วันนี้ฉันจะรู้สึกอ่อนแอลงบ้าง'`;
    } else if (isExhaustion) {
      act5 = `อนุญาตให้ตัวเองได้พักผ่อนอย่างแท้จริง โดยไม่รู้สึกผิดที่ยังไม่ได้ทำทุกอย่างให้สำเร็จในตอนนี้`;
    } else if (isConfusion) {
      act5 = `ยอมรับว่าไม่จำเป็นต้องรู้ทุกคำตอบในตอนนี้ 'ค่อยๆ ก้าวไปทีละก้าวตามความเป็นจริง'`;
    } else if (isWorkOrTask) {
      act5 = `เตือนสติตนเองว่า 'คุณค่าของฉันไม่ได้ขึ้นอยู่กับความเร่งรีบ ฉันทำดีที่สุดเท่าที่ทำได้ในตอนนี้แล้ว'`;
    } else {
      act5 = `โอบรับสภาวะปัจจุบันอย่างเมตตาตนเอง โดยไม่บังคับจิตใจให้ต้องหายจาก${shortEmotion}ในทันที`;
    }

    return [act1, act2, act3, act4, act5];
  }

  // --- MODULE 8: Pause Mode ---
  renderModule8_PauseMode(container) {
    document.getElementById('module-title-text').textContent = 'System #8 — Pause Mode (พื้นที่หยุดพักและตั้งสติ)';

    const emotionOptions = ['วิตกกังวล', 'เครียดสะสม', 'โกรธ/หงุดหงิด', 'อัดอั้น/กดดัน', 'สับสน/ฟุ้งซ่าน', 'เหนื่อยล้า/ท้อ'];
    const initialEmotion = (this.sessionState.pauseNotice || (this.sessionState.primaryEmotion && this.sessionState.primaryEmotion.label) || '').trim();
    const initialReflect = (this.sessionState.pauseReflect || this.sessionState.thought || '').trim();
    const initialSituation = (this.sessionState.situation || '').trim();

    // Generate initial dynamic 5 options
    const initialOptions = this.getDynamicPauseActions(initialEmotion, initialReflect, initialSituation);
    let selectedAction = this.sessionState.pauseChoose || this.sessionState.selectedCopingOption || initialOptions[0];
    if (!initialOptions.includes(selectedAction)) {
      selectedAction = initialOptions[0];
    }

    const emotionChipsHtml = emotionOptions.map(em => `
      <button type="button" class="pause-chip-btn ${initialEmotion === em ? 'active' : ''}" data-val="${em}">
        ${em}
      </button>
    `).join('');

    const actionOptionsHtml = initialOptions.map(act => `
      <button type="button" class="pause-action-btn ${selectedAction === act ? 'active' : ''}" data-act="${act}">
        <span>${act}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;flex-shrink:0;margin-left:0.5rem;"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </button>
    `).join('');

    container.innerHTML = `
      <div class="module-prompt" style="border-left: 3px solid #f472b6;">
        "สภาวะอารมณ์ในเวลานี้มีความเข้มข้นสูง การหยุดพักและชะลอจังหวะจะช่วยให้คุณรับรู้ตนเองได้อย่างชัดเจนก่อนตัดสินใจ"
      </div>

      <div style="display:flex; flex-direction:column; gap:1rem;">
        <!-- Step 1: Notice -->
        <div class="pause-card-step">
          <div class="pause-step-num">1</div>
          <div class="pause-step-content">
            <div class="pause-step-header">
              <span class="pause-step-name">Notice — สังเกต</span>
              <span class="pause-instruction-badge">→ เลือกอารมณ์ / พิมพ์คำตอบ</span>
            </div>
            <div class="pause-step-question">“ตอนนี้ฉันกำลังรู้สึกอะไร?”</div>
            <div class="pause-chips-grid" id="pause-notice-chips">
              ${emotionChipsHtml}
            </div>
            <input type="text" class="module-text-input" id="pause-notice-input" value="${initialEmotion}" placeholder="หรือพิมพ์ระบุความรู้สึกของคุณที่นี่..." />
          </div>
        </div>

        <!-- Step 2: Reflect -->
        <div class="pause-card-step">
          <div class="pause-step-num">2</div>
          <div class="pause-step-content">
            <div class="pause-step-header">
              <span class="pause-step-name">Reflect — ทบทวน</span>
              <span class="pause-instruction-badge">→ เขียนสิ่งที่คิด</span>
            </div>
            <div class="pause-step-question">“เกิดอะไรขึ้น และจำเป็นต้องตอบสนองทันทีหรือไม่?”</div>
            <textarea class="module-textarea" id="pause-reflect-input" placeholder="เขียนสิ่งที่คิด เช่น สถานการณ์ที่เกิดขึ้นตอนนี้ และจำเป็นต้องรีบตัดสินใจตอนนี้หรือไม่...">${initialReflect}</textarea>
          </div>
        </div>

        <!-- Step 3: Choose -->
        <div class="pause-card-step">
          <div class="pause-step-num">3</div>
          <div class="pause-step-content">
            <div class="pause-step-header">
              <span class="pause-step-name">Choose — เลือก</span>
              <span class="pause-instruction-badge">→ เลือกการกระทำ</span>
            </div>
            <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:0.25rem;">
              <div class="pause-step-question">“ฉันเลือกที่จะตอบสนองอย่างไร?”</div>
              <span class="pause-dynamic-badge" style="font-size:0.7rem; color:#c4b5fd; display:inline-flex; align-items:center; gap:0.25rem;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
                ปรับตามบริบทของคุณอัตโนมัติ
              </span>
            </div>
            <div class="pause-action-list" id="pause-choose-options">
              ${actionOptionsHtml}
            </div>
          </div>
        </div>
      </div>

      <div class="module-action-row" style="margin-top:0.85rem;">
        <button class="btn-primary" id="m8-done-btn" style="background: linear-gradient(135deg, #a78bfa, #818cf8); color: #fff; display:flex; align-items:center; gap:0.5rem;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
          บันทึกและเสร็จสิ้นการหยุดพัก
        </button>
      </div>
    `;

    const noticeInput = document.getElementById('pause-notice-input');
    const reflectInput = document.getElementById('pause-reflect-input');
    const chipBtns = container.querySelectorAll('.pause-chip-btn');
    const optionsContainer = document.getElementById('pause-choose-options');

    // Dynamic Options Re-renderer
    const updateDynamicOptions = () => {
      const em = (noticeInput ? noticeInput.value.trim() : '') || initialEmotion;
      const ref = (reflectInput ? reflectInput.value.trim() : '') || initialReflect;
      const sit = this.sessionState.situation || initialSituation;

      const dynamicOptions = this.getDynamicPauseActions(em, ref, sit);
      if (!dynamicOptions.includes(selectedAction)) {
        selectedAction = dynamicOptions[0];
      }

      if (optionsContainer) {
        optionsContainer.innerHTML = dynamicOptions.map(act => `
          <button type="button" class="pause-action-btn ${selectedAction === act ? 'active' : ''}" data-act="${act}">
            <span>${act}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;flex-shrink:0;margin-left:0.5rem;"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </button>
        `).join('');

        optionsContainer.querySelectorAll('.pause-action-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            optionsContainer.querySelectorAll('.pause-action-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedAction = btn.dataset.act;
          });
        });
      }
    };

    // Debounced updater for typing in inputs
    let debounceTimer = null;
    const debouncedUpdate = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(updateDynamicOptions, 260);
    };

    // Interactivity: Step 1 Emotion chips
    chipBtns.forEach(chip => {
      chip.addEventListener('click', () => {
        chipBtns.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        if (noticeInput) {
          noticeInput.value = chip.dataset.val;
          noticeInput.focus();
        }
        updateDynamicOptions();
      });
    });

    if (noticeInput) {
      noticeInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        chipBtns.forEach(c => {
          c.classList.toggle('active', c.dataset.val === val);
        });
        debouncedUpdate();
      });
    }

    // Interactivity: Step 2 Reflect input
    if (reflectInput) {
      reflectInput.addEventListener('input', () => {
        debouncedUpdate();
      });
    }

    // Interactivity: Step 3 Initial buttons binding
    if (optionsContainer) {
      optionsContainer.querySelectorAll('.pause-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          optionsContainer.querySelectorAll('.pause-action-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          selectedAction = btn.dataset.act;
        });
      });
    }

    // Save & Complete Button
    document.getElementById('m8-done-btn').addEventListener('click', () => {
      const noticeVal = noticeInput ? noticeInput.value.trim() : initialEmotion;
      const reflectVal = reflectInput ? reflectInput.value.trim() : '';

      this.sessionState.pauseNotice = noticeVal;
      this.sessionState.pauseReflect = reflectVal;
      this.sessionState.pauseChoose = selectedAction;

      if (noticeVal) {
        if (!this.sessionState.primaryEmotion) {
          this.sessionState.primaryEmotion = { label: noticeVal, intensity: 7 };
        } else {
          this.sessionState.primaryEmotion.label = noticeVal;
        }
      }

      if (reflectVal && !this.sessionState.thought) {
        this.sessionState.thought = reflectVal;
      }

      if (selectedAction) {
        this.sessionState.selectedCopingOption = selectedAction;
      }

      this.markModuleCompleted('m8');
      this.logConsole(`Pause Mode completed: [Notice: ${noticeVal || '-'}] [Action: ${selectedAction || '-'}]`, "info");
      this.closeModule();
    });
  }

  // --- MODULE 9: Release Space ---
  renderModule9_ReleaseSpace(container) {
    document.getElementById('module-title-text').textContent = 'System #9 — Release Space (พื้นที่เขียนระบาย)';

    container.innerHTML = `
      <div class="module-prompt">
        "เขียนสิ่งที่คุณอยากระบายออกได้อย่างอิสระ ไม่มีความถูกหรือผิด ปราศจากการตัดสินหรือการประเมินใดๆ"
      </div>

      <div class="module-input-group">
        <textarea class="module-textarea" id="m9-reflection" style="min-height:120px;" placeholder="ระบายความรู้สึก ความอัดอั้น หรือสิ่งที่อยู่ในใจของคุณที่นี่...">${this.sessionState.reflection || ''}</textarea>
      </div>

      <div class="module-action-row">
        <button class="btn-primary" id="m9-save-btn" style="background:#a78bfa; color:#fff;">
          บันทึกการระบายความคิด
        </button>
      </div>

      <div id="m9-feedback-response" style="display:none; padding:0.85rem; border-radius:10px; background:rgba(167,139,250,0.1); border:1px solid rgba(167,139,250,0.2); font-size:0.85rem; color:#c4b5fd; line-height:1.5;"></div>
    `;

    document.getElementById('m9-save-btn').addEventListener('click', () => {
      const text = document.getElementById('m9-reflection').value.trim();
      this.sessionState.reflection = text;
      
      const resp = document.getElementById('m9-feedback-response');
      resp.style.display = 'block';
      resp.textContent = 'ขอบคุณที่ถ่ายทอดและปลดปล่อยความรู้สึกออกมา การรับรู้และอนุญาตให้ตนเองได้ระบายเป็นก้าวสำคัญของการดูแลจิตใจ';

      this.markModuleCompleted('m9');
      setTimeout(() => this.closeModule(), 1800);
    });
  }

  // --- MODULE 10: Identify What Matters ---
  renderModule10_WhatMatters(container) {
    document.getElementById('module-title-text').textContent = 'System #10 — Identify What Matters (ระบุสิ่งที่สำคัญ)';

    container.innerHTML = `
      <div class="module-prompt">
        "อะไรคือสิ่งที่สำคัญที่สุดสำหรับคุณในสถานการณ์นี้? การรับรู้เป้าหมายหรือคุณค่าช่วยให้คุณมองเห็นทางออกที่ชัดเจนขึ้น"
      </div>

      <div class="module-input-group">
        <label class="module-input-label">สิ่งที่สำคัญที่สุด หรือสิ่งที่คุณอยากให้เกิดขึ้นจริง (Core Value / Desired Goal)</label>
        <textarea class="module-textarea" id="m10-goal" placeholder="เช่น อยากให้เกิดความเข้าใจตรงกัน หรือ อยากได้พื้นที่คลายความกังวล...">${this.sessionState.goal || ''}</textarea>
      </div>

      <div class="module-action-row">
        <button class="btn-primary" id="m10-save-btn" style="background:#a78bfa; color:#fff;">
          บันทึกความต้องการหลัก
        </button>
      </div>
    `;

    document.getElementById('m10-save-btn').addEventListener('click', () => {
      this.sessionState.goal = document.getElementById('m10-goal').value.trim();
      this.markModuleCompleted('m10');
      this.closeModule();
    });
  }

  // --- MODULE 12: Practical Skills ---
  renderModule12_PracticalSkills(container) {
    document.getElementById('module-title-text').textContent = 'System #12 — Practical Skills (ทักษะทางอารมณ์)';

    const skills = [
      {
        name: 'Naming Emotions (การเรียกชื่ออารมณ์)',
        why: 'การใส่ชื่อเรียกให้อารมณ์อย่างเจาะจง ช่วยลดการตื่นตัวของสมองส่วนอารมณ์ (Amygdala)',
        how: 'เมื่อรู้สึกปั่นป่วน ลองทักทายตนเองในใจว่า "นี่คือความกังวล" หรือ "นี่คือความตึงเครียด"'
      },
      {
        name: 'Separating Facts from Interpretations (การแยกข้อเท็จจริง)',
        why: 'ลดการสร้างเรื่องราวที่เกินจริงในความคิดซึ่งกระตุ้นความกังวลให้บานปลาย',
        how: 'ถามตนเองว่า "มีส่วนใดบ้างที่ฉันรู้แน่ชัด 100% โดยไม่ต้องคาดเดา?"'
      },
      {
        name: 'The 3-Second Micro Pause (การหยุดพัก 3 วินาที)',
        why: 'ช่วยคืนอำนาจการตัดสินใจให้สมองส่วนหน้าก่อนส่งปฏิกิริยาตอบโต้',
        how: 'สูดหายใจเข้าช้าๆ นับ 1... 2... 3... ก่อนเริ่มพูดหรือพิมพ์ข้อความ'
      }
    ];

    const currentSkill = skills[Math.floor(Math.random() * skills.length)];
    this.sessionState.selectedSkill = currentSkill;

    container.innerHTML = `
      <div class="skill-card-body">
        <div style="font-family:var(--font-title); font-size:1.1rem; font-weight:700; color:#c4b5fd;">
          ${currentSkill.name}
        </div>

        <div class="skill-field">
          <span class="skill-field-title">ทำไมทักษะนี้จึงช่วยคุณ:</span>
          <span class="skill-field-text">${currentSkill.why}</span>
        </div>

        <div class="skill-field">
          <span class="skill-field-title">วิธีทดลองฝึกใช้งาน:</span>
          <span class="skill-field-text">${currentSkill.how}</span>
        </div>
      </div>

      <div class="module-action-row">
        <button class="btn-primary" id="m12-try-btn" style="background:#a78bfa; color:#fff;">
          ลองนำทักษะนี้ไปปรับใช้
        </button>
      </div>
    `;

    document.getElementById('m12-try-btn').addEventListener('click', () => {
      this.markModuleCompleted('m12');
      this.closeModule();
    });
  }

  // --- MODULE 14: Non-Judgmental Guidance ---
  renderModule14_NonJudgmentalGuidance(container) {
    document.getElementById('module-title-text').textContent = 'System #14 — Non-Judgmental Guidance (คำแนะนำสะท้อนใจ)';

    const prim = this.sessionState.primaryEmotion ? this.sessionState.primaryEmotion.label : 'สภาวะอารมณ์สะสม';
    const cop = this.sessionState.selectedCopingOption || 'การหยุดพักและดูแลจิตใจตนเอง';

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:0.85rem; background:rgba(255,255,255,0.02); border:1px solid var(--glass-border); padding:1rem; border-radius:14px; line-height:1.6; font-size:0.88rem; color:var(--text-secondary);">
        <div><strong style="color:#c4b5fd;">1. รับรองความรู้สึก (Validate):</strong> "เป็นเรื่องธรรมชาติสมเหตุสมผลที่คุณจะรู้สึก ${prim} ในสถานการณ์นี้"</div>
        <div><strong style="color:#c4b5fd;">2. สะท้อนสภาวะ (Reflect):</strong> "คุณกำลังใส่ใจและพยายามจัดการสภาวะจิตใจด้วยความตั้งใจดี"</div>
        <div><strong style="color:#c4b5fd;">3. ความชัดเจน (Clarify):</strong> "สิ่งที่คุณเลือกและให้ความสำคัญคือ ${cop}"</div>
        <div><strong style="color:#c4b5fd;">4. เปิดกว้างทางเลือก (Offer Options):</strong> "คุณสามารถปรับจังหวะให้ช้าลงและโอบรับตนเองได้เสมอ"</div>
      </div>

      <div class="module-action-row">
        <button class="btn-primary" id="m14-done-btn" style="background:#a78bfa; color:#fff;">
          รับรู้ข้อสรุป
        </button>
      </div>
    `;

    document.getElementById('m14-done-btn').addEventListener('click', () => {
      this.markModuleCompleted('m14');
      this.closeModule();
    });
  }

  // --- MODULE 15: Next Steps ---
  renderModule15_NextSteps(container) {
    document.getElementById('module-title-text').textContent = 'System #15 — Next Steps & Summary (สรุปและขั้นตอนถัดไป)';

    const state = this.sessionState;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:0.75rem;">
        <div class="summary-block">
          <div class="summary-block-title">สิ่งที่สังเกตพบ (What you noticed)</div>
          <div class="summary-item"><span class="summary-item-label">อารมณ์หลัก:</span> ${state.primaryEmotion ? state.primaryEmotion.label : 'สภาวะทั่วไป'} (${state.emotionIntensity}/10)</div>
          ${state.situation ? `<div class="summary-item"><span class="summary-item-label">สถานการณ์:</span> ${state.situation}</div>` : ''}
        </div>

        <div class="summary-block">
          <div class="summary-block-title">สิ่งที่คุณได้สำรวจ (What you explored)</div>
          ${state.thought ? `<div class="summary-item"><span class="summary-item-label">ความคิด:</span> ${state.thought}</div>` : ''}
          ${state.facts ? `<div class="summary-item"><span class="summary-item-label">ข้อเท็จจริง:</span> ${state.facts}</div>` : ''}
          ${state.goal ? `<div class="summary-item"><span class="summary-item-label">เป้าหมายสำคัญ:</span> ${state.goal}</div>` : ''}
        </div>

        <div class="summary-block">
          <div class="summary-block-title">สิ่งที่เลือกทำ (What you chose)</div>
          <div class="summary-item"><span class="summary-item-label">การรับมือ:</span> ${state.selectedCopingOption || 'พักผ่อนปรับจังหวะลมหายใจ'}</div>
          ${state.selectedSkill ? `<div class="summary-item"><span class="summary-item-label">ทักษะที่ฝึก:</span> ${state.selectedSkill.name}</div>` : ''}
        </div>
      </div>

      <div class="module-prompt" style="margin-top:0.5rem;">
        <strong>ขั้นตอนแนะนำถัดไป (Optional Next Actions):</strong><br>
        • สลับไปหน้า "ฝึกหายใจโต้ตอบ" เพื่อรับคลื่นแสงและจังหวะลมหายใจ<br>
        • พักสายตาและทบทวนความรู้สึกอย่างผ่อนคลาย
      </div>

      <div class="module-action-row">
        <button class="btn-primary" id="m15-done-btn" style="background:#a78bfa; color:#fff;">
          เสร็จสิ้นเซสชันการดูแลใจ
        </button>
      </div>
    `;

    document.getElementById('m15-done-btn').addEventListener('click', () => {
      this.markModuleCompleted('m15');
      this.closeModule();
    });
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
