/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO – HOURAOUI Ayoub
   main.js · Version 1.1
   Vanilla JS — Aucune dépendance externe
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   1. CANVAS BACKGROUND (Hero — Particules connectées)
───────────────────────────────────────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const ACCENT = '0, 200, 255';
  let width, height, particles;

  const CONFIG = {
    particleCount: 60,
    maxDist:       140,
    speed:         0.35,
    radius:        1.5,
  };

  function resize() {
    width  = canvas.width  = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x:  Math.random() * width,
      y:  Math.random() * height,
      vx: (Math.random() - 0.5) * CONFIG.speed,
      vy: (Math.random() - 0.5) * CONFIG.speed,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.particleCount }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width)  p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.maxDist) {
          const alpha = 1 - dist / CONFIG.maxDist;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${ACCENT}, ${alpha * 0.35})`;
          ctx.lineWidth   = 0.7;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, CONFIG.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT}, 0.6)`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  init();
  draw();
  window.addEventListener('resize', resize);
})();


/* ─────────────────────────────────────────────────────────────
   2. TYPEWRITER EFFECT (Hero subtitle)
───────────────────────────────────────────────────────────── */
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const phrases = [
    'BTS SIO · Option SISR',
    'Infrastructure & Réseaux',
    'Cybersécurité',
    'Windows Server & Linux',
    'Recherche de stage',
  ];

  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;
  let paused    = false;

  function type() {
    const current = phrases[phraseIdx];

    if (!deleting) {
      el.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        paused = true;
        setTimeout(() => { paused = false; deleting = true; requestAnimationFrame(tick); }, 2200);
        return;
      }
    } else {
      el.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting  = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
    }

    setTimeout(tick, deleting ? 45 : 85);
  }

  function tick() {
    if (!paused) type();
  }

  setTimeout(tick, 800);
})();


/* ─────────────────────────────────────────────────────────────
   3. NAVBAR — Scroll + Active link + Mobile menu
───────────────────────────────────────────────────────────── */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const navLinks  = document.querySelectorAll('.nav__link');
  const burgerBtn = document.getElementById('burgerBtn');
  const navMenu   = document.getElementById('navLinks');
  const sections  = document.querySelectorAll('main section[id]');

  function highlightActiveLink() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    highlightActiveLink();
  }

  function closeMenu() {
    navMenu.classList.remove('open');
    burgerBtn.classList.remove('open');
    document.body.style.overflow = '';
  }

  burgerBtn.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    burgerBtn.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  navLinks.forEach(link => link.addEventListener('click', closeMenu));

  document.addEventListener('click', e => {
    if (!navbar.contains(e.target) && navMenu.classList.contains('open')) closeMenu();
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ─────────────────────────────────────────────────────────────
   4. SCROLL ANIMATIONS (Intersection Observer)
───────────────────────────────────────────────────────────── */
(function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0, 10);
        setTimeout(() => entry.target.classList.add('in-view'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();


/* ─────────────────────────────────────────────────────────────
   5. SMOOTH SCROLL (Fallback pour ancres)
───────────────────────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ─────────────────────────────────────────────────────────────
   6. FOOTER — Année dynamique
───────────────────────────────────────────────────────────── */
(function initFooterYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ─────────────────────────────────────────────────────────────
   7. SKILL CARDS — Staggered entry delay
───────────────────────────────────────────────────────────── */
(function initSkillStagger() {
  document.querySelectorAll('.skill-card[data-animate]').forEach((card, i) => {
    if (!card.dataset.delay) card.dataset.delay = i * 80;
  });
})();


/* ─────────────────────────────────────────────────────────────
   8. PROJECT CARDS — Staggered entry delay
───────────────────────────────────────────────────────────── */
(function initProjectStagger() {
  document.querySelectorAll('.project-card[data-animate]').forEach((card, i) => {
    if (!card.dataset.delay) card.dataset.delay = i * 80;
  });
})();


/* ─────────────────────────────────────────────────────────────
   9. THEME TOGGLE (Clair / Sombre)
───────────────────────────────────────────────────────────── */
(function initThemeToggle() {
  const html    = document.documentElement;
  const toggles = [
    document.getElementById('themeToggle'),
    document.getElementById('themeToggleMobile'),
  ].filter(Boolean);

  const saved = localStorage.getItem('theme');
  if (saved) html.setAttribute('data-theme', saved);

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') || 'light';
      setTheme(current === 'light' ? 'dark' : 'light');
    });
  });
})();


/* ─────────────────────────────────────────────────────────────
   10. SOCIAL SIDEBAR — Apparition au scroll
───────────────────────────────────────────────────────────── */
(function initSocialSidebar() {
  const sidebar = document.getElementById('socialSidebar');
  if (!sidebar) return;

  function onScroll() {
    sidebar.classList.toggle('visible', window.scrollY > 200);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ─────────────────────────────────────────────────────────────
   11. AUDIO BACKGROUND + ASSISTANT GIF
   ─────────────────────────────────────────────────────────────
   Structure assets requise :
     assets/audio/background.mp3     → musique de fond
     assets/audio/sfx/sfx1.mp3       → son 1 au clic (tes propres sons)
     assets/audio/sfx/sfx2.mp3       → son 2
     assets/audio/sfx/sfx3.mp3       → son 3
     assets/img/assistant.gif        → ton GIF animé
───────────────────────────────────────────────────────────── */
(function initAssistant() {

  /* ── Éléments DOM ── */
  const audio     = document.getElementById('bgMusic');
  const audioBtn  = document.getElementById('audioControl');
  const audioIcon = document.getElementById('audioIcon');
  const assistant = document.getElementById('assistant');
  const bubble    = document.getElementById('speechBubble');
  const bubbleText= document.getElementById('speechText');

  if (!assistant || !bubble) return;

  /* ── Sons custom (place tes fichiers dans assets/audio/sfx/) ── */
  const SFX_FILES = [
    'assets/audio/sfx/sfx1.mp3',
    'assets/audio/sfx/sfx2.mp3',
    'assets/audio/sfx/sfx3.mp3',
  ];
  // Pré-charge les objets Audio pour éviter le délai
  const sfxPool = SFX_FILES.map(src => {
    const a = new Audio(src);
    a.volume = 0.7;
    return a;
  });

  function playRandomSfx() {
    const sfx = sfxPool[Math.floor(Math.random() * sfxPool.length)];
    sfx.currentTime = 0;
    sfx.play().catch(() => {}); // silencieux si fichier absent
  }

  /* ── Messages affichés dans la bulle ── */
  const MESSAGES = [
    'Salut ! Bienvenue sur mon portfolio 👋',
    'Besoin d\'infos ? Contacte-moi !',
    'BTS SIO SISR · Lycée Jean Rostand · Caen',
    'Je suis à la recherche d\'un stage ou d\'une alternance !',
    'Passionné par les réseaux et la cybersécurité 🔐',
    'N\'hésite pas à télécharger mon CV ⬇️',
    'Portfolio fait maison en HTML / CSS / JS ✨',
    'Stack : Linux · Docker · Windows Server · Kali 🐧',
  ];

  let lastMsgIdx  = -1;
  let hideTimer   = null;
  let isShowing   = false;

  function getRandomMessage() {
    let idx;
    do { idx = Math.floor(Math.random() * MESSAGES.length); }
    while (idx === lastMsgIdx && MESSAGES.length > 1);
    lastMsgIdx = idx;
    return MESSAGES[idx];
  }

  /* ── Affiche la bulle avec effet de frappe ── */
  function showBubble(message) {
    // Annule le timer de fermeture en cours
    clearTimeout(hideTimer);

    // Affiche d'abord les points de chargement
    bubbleText.innerHTML =
      '<span class="typing-dots">' +
        '<span></span><span></span><span></span>' +
      '</span>';
    bubble.classList.remove('speech-bubble--hidden');
    isShowing = true;

    // Après un court délai : affiche le texte lettre par lettre
    setTimeout(() => {
      bubbleText.textContent = '';
      let i = 0;
      const interval = setInterval(() => {
        bubbleText.textContent += message[i];
        i++;
        if (i >= message.length) {
          clearInterval(interval);
          // Auto-fermeture après lecture
          hideTimer = setTimeout(hideBubble, 3500);
        }
      }, 38);
    }, 600);
  }

  /* ── Cache la bulle ── */
  function hideBubble() {
    bubble.classList.add('speech-bubble--hidden');
    isShowing = false;
  }

  /* ── Clic sur l'assistant ── */
  assistant.addEventListener('click', () => {
    playRandomSfx();

    // Animation de rebond
    assistant.classList.remove('bounce');
    void assistant.offsetWidth; // reset pour re-déclencher l'animation
    assistant.classList.add('bounce');
    assistant.addEventListener('animationend', () => {
      assistant.classList.remove('bounce');
    }, { once: true });

    // Affiche la bulle
    showBubble(getRandomMessage());
  });

  /* ── Clic en dehors → ferme la bulle ── */
  document.addEventListener('click', e => {
    if (isShowing && !assistant.contains(e.target) && !bubble.contains(e.target)) {
      clearTimeout(hideTimer);
      hideBubble();
    }
  });

/* ─────────────────────────────────────────────────────────────
   12. INDICATEUR DE PROGRESSION DU SCROLL
───────────────────────────────────────────────────────────── */
(function initScrollProgress() {
  const progressBar = document.getElementById('scrollProgress');
  if (!progressBar) return;

  function updateProgress() {
    const scrollTotal = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (scrollTotal / height) * 100;
    progressBar.style.width = scrolled + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress(); // Initialisation au chargement
})();

/* ─────────────────────────────────────────────────────────────
   13. BOUTON RETOUR EN HAUT
───────────────────────────────────────────────────────────── */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  function toggleBtn() {
    // Le bouton apparaît après 400px de scroll
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', toggleBtn, { passive: true });
  toggleBtn(); // Vérification initiale
})();

/* ─────────────────────────────────────────────────────────────
   14. BOUTON DE PARTAGE (Web Share API)
───────────────────────────────────────────────────────────── */
(function initShareBtn() {
  const shareBtn = document.getElementById('sharePortfolio');
  if (!shareBtn) return;

  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: 'Ayoub HOURAOUI | Portfolio',
      text: 'Découvrez le portfolio d\'Ayoub Houraoui (Infrastructure, Réseaux & Cybersécurité)',
      url: window.location.href
    };

    // Vérifie si le navigateur supporte l'API de partage native (très utile sur mobile)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Partage annulé ou erreur :', err);
      }
    } else {
      // Fallback pour les navigateurs PC non compatibles : copie le lien dans le presse-papiers
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Lien copié dans le presse-papiers !');
      }).catch(err => {
        console.error('Erreur lors de la copie du lien : ', err);
      });
    }
  });
})();

/* ─────────────────────────────────────────────────────────────
   15. EASTER EGG : KONAMI CODE -> EMULATORJS (AUTO-LOAD)
───────────────────────────────────────────────────────────── */
(function initEasterEgg() {
  const konamiCode = [
    'ArrowUp', 'ArrowUp', 
    'ArrowDown', 'ArrowDown', 
    'ArrowLeft', 'ArrowRight', 
    'ArrowLeft', 'ArrowRight', 
    'b', 'a', 'Enter'
  ];
  
  let keyHistory = [];
  const overlay = document.getElementById('easterEggOverlay');
  const closeBtn = document.getElementById('closeEasterEgg');
  const iframe = document.getElementById('dsIframe');

  if (!overlay || !closeBtn || !iframe) return;

  window.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('hidden')) return;

    keyHistory.push(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    keyHistory = keyHistory.slice(-konamiCode.length);

    const isCodeComplete = konamiCode.every((key, index) => key === keyHistory[index]);

    if (isCodeComplete) {
      console.log("Konami Code validé ! Chargement de l'émulateur...");
      
      // On charge ton fichier HTML local contenant EmulatorJS et la ROM
      if (!iframe.src || iframe.src === window.location.href) {
        iframe.src = "emulator.html";
      }
      
      overlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden'; 
      keyHistory = []; 
    }
  });

  closeBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    document.body.style.overflow = ''; 
    
    // On vide l'iframe pour stopper l'émulateur (arrête le jeu et le son)
    iframe.src = "";
  });
})();

  /* ────────────────────────────────────────────────────────
     Musique de fond : premier clic sur la page → lecture
  ──────────────────────────────────────────────────────── */
  if (audio) {
    document.addEventListener('click', () => {
      audio.play()
        .then(() => { audioIcon.className = 'fa-solid fa-volume-high'; })
        .catch(() => {});
    }, { once: true });

    audioBtn && audioBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (audio.paused) {
        audio.play();
        audioIcon.className = 'fa-solid fa-volume-high';
      } else {
        audio.pause();
        audioIcon.className = 'fa-solid fa-volume-xmark';
      }
    });
  }

})();

