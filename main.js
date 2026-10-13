/* ==========================================================
   PEACE O1 - UNIFIED CLIENT RUNTIME (main.js)
   Zero external dependencies • 100% native Web APIs
   ========================================================== */

(function () {
  'use strict';

  /* --- 1. LOCAL STORAGE & PERSISTENCE --- */
  const THEME_KEY = 'peace_o1_theme';
  const AUDIO_KEY = 'peace_o1_audio';

  const themes = ['', 'emerald', 'sunset', 'cyber'];
  const themeNames = {
    '': 'Violet Eclipse',
    'emerald': 'Emerald Dream',
    'sunset': 'Sunset Blaze',
    'cyber': 'Cyber Cyan'
  };

  let currentTheme = localStorage.getItem(THEME_KEY) || '';
  if (currentTheme) {
    document.body.setAttribute('data-theme', currentTheme);
  }

  let audioEnabled = localStorage.getItem(AUDIO_KEY) === 'true';
  let audioCtx = null;

  /* --- 2. SYNTHESIZED WEB AUDIO API --- */
  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type = 'sine', duration = 0.22, gainVal = 0.08) {
    if (!audioEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio tone failed', e);
    }
  }

  function playCelebrationChord() {
    if (!audioEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 major arpeggio
    notes.forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 'triangle', 0.35, 0.08), idx * 80);
    });
  }

  function playSuccessChime() {
    if (!audioEnabled) return;
    const notes = [440, 554.37, 659.25, 880]; // A Major chime
    notes.forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 'sine', 0.28, 0.07), idx * 70);
    });
  }

  /* --- 3. TOAST NOTIFICATION SYSTEM --- */
  let toastEl = document.getElementById('toast');
  let toastMsg = document.getElementById('toast-message');
  let toastTimeout = null;

  function showToast(message) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'toast';
      toastEl.className = 'toast';
      toastEl.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        <span id="toast-message"></span>
      `;
      document.body.appendChild(toastEl);
      toastMsg = document.getElementById('toast-message');
    }

    if (toastMsg) {
      toastMsg.textContent = message;
    }
    toastEl.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2800);
  }

  /* --- 4. CONTROLS (THEME & AUDIO TOGGLE) --- */
  function updateAudioButtonUI() {
    const soundBtn = document.getElementById('sound-btn');
    if (!soundBtn) return;
    const soundIconOff = document.getElementById('sound-icon-off');
    const soundIconOn = document.getElementById('sound-icon-on');
    const soundText = document.getElementById('sound-status-text');

    if (audioEnabled) {
      if (soundIconOff) soundIconOff.style.display = 'none';
      if (soundIconOn) soundIconOn.style.display = 'inline-block';
      if (soundText) soundText.textContent = 'Audio: Active';
    } else {
      if (soundIconOff) soundIconOff.style.display = 'inline-block';
      if (soundIconOn) soundIconOn.style.display = 'none';
      if (soundText) soundText.textContent = 'Audio: Muted';
    }
  }

  function cycleTheme() {
    let currentIndex = themes.indexOf(currentTheme);
    let nextIndex = (currentIndex + 1) % themes.length;
    currentTheme = themes[nextIndex];

    if (currentTheme) {
      document.body.setAttribute('data-theme', currentTheme);
    } else {
      document.body.removeAttribute('data-theme');
    }
    localStorage.setItem(THEME_KEY, currentTheme);
    playTone(460, 'triangle', 0.2, 0.08);
    showToast(`Aura: ${themeNames[currentTheme]}`);
  }

  function toggleAudio() {
    audioEnabled = !audioEnabled;
    localStorage.setItem(AUDIO_KEY, audioEnabled ? 'true' : 'false');
    updateAudioButtonUI();
    if (audioEnabled) {
      getAudioContext();
      playTone(660, 'sine', 0.2, 0.1);
      showToast('Sound enabled 🎵');
    } else {
      showToast('Sound muted 🔇');
    }
  }

  // Bind navbar controls
  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', cycleTheme);
  }

  const soundBtn = document.getElementById('sound-btn');
  if (soundBtn) {
    soundBtn.addEventListener('click', toggleAudio);
    updateAudioButtonUI();
  }

  /* --- 5. AMBIENT GLOW CURSOR TRACKING --- */
  const ambientGlow = document.getElementById('ambient-glow');
  if (ambientGlow) {
    window.addEventListener('mousemove', (e) => {
      ambientGlow.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
    });
  }

  /* --- 6. BACKGROUND STAR PARTICLES CANVAS --- */
  const bgCanvas = document.getElementById('bg-canvas');
  if (bgCanvas) {
    const bgCtx = bgCanvas.getContext('2d');
    let bgParticles = [];

    function resizeBgCanvas() {
      bgCanvas.width = window.innerWidth;
      bgCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeBgCanvas);
    resizeBgCanvas();

    class StarParticle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * bgCanvas.width;
        this.y = Math.random() * bgCanvas.height;
        this.radius = Math.random() * 1.6 + 0.4;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.alpha = Math.random() * 0.6 + 0.2;
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > bgCanvas.width || this.y < 0 || this.y > bgCanvas.height) {
          this.reset();
        }
        this.alpha += Math.sin(Date.now() * this.pulseSpeed) * 0.01;
      }
      draw() {
        bgCtx.save();
        bgCtx.beginPath();
        bgCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        bgCtx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(0.8, this.alpha))})`;
        bgCtx.shadowBlur = 8;
        bgCtx.shadowColor = '#818cf8';
        bgCtx.fill();
        bgCtx.restore();
      }
    }

    for (let i = 0; i < 65; i++) {
      bgParticles.push(new StarParticle());
    }

    function animateBg() {
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      bgParticles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateBg);
    }
    animateBg();
  }

  /* --- 7. CONFETTI CELEBRATION ENGINE --- */
  const confettiCanvas = document.getElementById('confetti-canvas');
  let confettiParticles = [];
  let confCtx = null;

  if (confettiCanvas) {
    confCtx = confettiCanvas.getContext('2d');
    function resizeConfetti() {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeConfetti);
    resizeConfetti();

    class Confetti {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 8 + 5;
        this.color = ['#38bdf8', '#a855f7', '#f43f5e', '#facc15', '#22c55e', '#6366f1'][Math.floor(Math.random() * 6)];
        this.vx = (Math.random() - 0.5) * 16;
        this.vy = Math.random() * -14 - 4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 12;
        this.opacity = 1;
        this.gravity = 0.45;
        this.drag = 0.985;
      }
      update() {
        this.vx *= this.drag;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        this.opacity -= 0.012;
      }
      draw() {
        confCtx.save();
        confCtx.translate(this.x, this.y);
        confCtx.rotate((this.rotation * Math.PI) / 180);
        confCtx.globalAlpha = Math.max(0, this.opacity);
        confCtx.fillStyle = this.color;
        confCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
        confCtx.restore();
      }
    }

    window.triggerConfettiAt = function (originX, originY) {
      for (let i = 0; i < 90; i++) {
        confettiParticles.push(new Confetti(originX, originY));
      }
      playCelebrationChord();
    };

    function renderConfetti() {
      confCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const p = confettiParticles[i];
        p.update();
        p.draw();
        if (p.opacity <= 0 || p.y > confettiCanvas.height) {
          confettiParticles.splice(i, 1);
        }
      }
      requestAnimationFrame(renderConfetti);
    }
    renderConfetti();
  }

  /* --- 8. LIVE CLOCK SYNCHRONIZATION --- */
  const clockElements = document.querySelectorAll('.live-time-display, #clock');
  function updateClock() {
    const timeStr = new Date().toLocaleTimeString();
    clockElements.forEach(el => {
      el.textContent = timeStr;
    });
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Export functions to global scope for page-specific scripts
  window.PeaceO1 = {
    playTone,
    playSuccessChime,
    playCelebrationChord,
    showToast,
    triggerConfetti: function (el) {
      if (!window.triggerConfettiAt) return;
      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;
      if (el) {
        const rect = el.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }
      window.triggerConfettiAt(x, y);
    }
  };

})();
