/* ══════════════════════════════════════════════════════════════
   GBA Web Emulator — script.js
   - Menu EmulatorJS désactivé
   - Contrôles tactiles mobiles custom
   ══════════════════════════════════════════════════════════════ */

/* ─── Config ROM ─── */
var AUTO_ROM = {
  path: 'PokemonEmeraude.gba',
  name: 'Pokémon Version Émeraude',
};

var emulatorStarted = false;
var currentBlobUrl  = null;

var romInput       = document.getElementById('rom-input');
var dropZone       = document.getElementById('drop-zone');
var romNameDisplay = document.getElementById('rom-name');
var btnRelancer    = document.getElementById('btn-relancer');

if (btnRelancer) {
  btnRelancer.addEventListener('click', function () { window.location.reload(); });
}

/* ─── Chargement auto ROM ─── */
romNameDisplay.textContent = '⏳ Chargement de Pokémon Émeraude…';

fetch(AUTO_ROM.path, { method: 'HEAD' })
  .then(function (res) {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    romNameDisplay.textContent = AUTO_ROM.name;
    launchEmulator(AUTO_ROM.path, AUTO_ROM.name);
  })
  .catch(function (err) {
    console.warn('[GBA] ROM introuvable :', err.message);
    romNameDisplay.textContent = '⚠️ Aucune ROM — chargez-en une ci-dessous';
    var details = document.querySelector('details');
    if (details) details.open = true;
  });

/* ─── Import manuel ─── */
romInput.addEventListener('change', function (e) {
  var file = e.target.files[0];
  if (file) processFile(file);
});

dropZone.addEventListener('dragover', function (e) {
  e.preventDefault();
  dropZone.style.borderColor = '#3b82f6';
});
dropZone.addEventListener('dragleave', function () {
  dropZone.style.borderColor = 'rgba(255,255,255,0.1)';
});
dropZone.addEventListener('drop', function (e) {
  e.preventDefault();
  dropZone.style.borderColor = 'rgba(255,255,255,0.1)';
  var file = e.dataTransfer.files[0];
  if (file) processFile(file);
});

function processFile(file) {
  if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
  currentBlobUrl = URL.createObjectURL(file);
  romNameDisplay.textContent = file.name;
  launchEmulator(currentBlobUrl, file.name.replace(/\.[^.]+$/, ''));
}

/* ─── Lancement émulateur ─── */
function launchEmulator(romUrl, romLabel) {
  if (emulatorStarted) { window.location.reload(); return; }
  emulatorStarted = true;

  localStorage.clear();

  var idle = document.getElementById('idle-screen');
  if (idle) idle.remove();

  window.EJS_player          = '#emulator-container';
  window.EJS_core            = 'gba';
  window.EJS_gameUrl         = romUrl;
  window.EJS_gameName        = romLabel || 'GBA Game';
  window.EJS_pathtodata      = 'https://cdn.emulatorjs.org/stable/data/';
  window.EJS_startOnLoaded   = true;
  window.EJS_backgroundColor = '#000000';
  window.EJS_color           = '#8b5cf6';
  window.EJS_language        = 'fr';

  /* ── DÉSACTIVER le menu contextuel d'EmulatorJS ── */
  window.EJS_Buttons = {
    playPause:    false,   // retire tous les boutons = plus de barre de menu
    restart:      false,
    mute:         false,
    volume:       false,
    fullscreen:   false,
    saveState:    false,
    loadState:    false,
    screenRecord: false,
    gamepad:      false,
    cheat:        false,
    screenshot:   false,
    cacheManager: false,
    contextMenu:  false,
  };

  /* ── Contrôles clavier ── */
  window.EJS_defaultControls = {
    0: {
      0:  { value: 'm'     },   // B
      1:  { value: ''      },   // Y (inutilisé)
      2:  { value: 'Shift' },   // SELECT
      3:  { value: 'Enter' },   // START
      4:  { value: 'z'     },   // HAUT
      5:  { value: 's'     },   // BAS
      6:  { value: 'q'     },   // GAUCHE
      7:  { value: 'd'     },   // DROITE
      8:  { value: 'k'     },   // A
      9:  { value: ''      },   // X (inutilisé)
      10: { value: 'i'     },   // L
      11: { value: 'p'     },   // R
    },
    1: {}, 2: {}, 3: {}
  };

  var script = document.createElement('script');
  script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
  script.async = false;
  document.body.appendChild(script);

  /* ── Bloquer clic droit sur l'écran ── */
  var screenEl = document.getElementById('screen-overlay');
  if (screenEl) {
    screenEl.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  /* ── Masquer la barre de menu EmulatorJS via MutationObserver ── */
  var observer = new MutationObserver(function () {
    var container = document.getElementById('emulator-container');
    if (!container) return;
    /* Sélecteurs connus de la barre EmulatorJS */
    var selectors = [
      '.ejs_menu_bar', '.ejs_menu', '[class*="ejs_menu"]',
      '.ejs_ctx_menu', '[class*="ctx_menu"]', '.ejs_control_bar',
      '[class*="control_bar"]', '.ejs_bottom_bar', '[class*="bottom_bar"]'
    ];
    selectors.forEach(function (sel) {
      container.querySelectorAll(sel).forEach(function (el) {
        el.style.setProperty('display',          'none',    'important');
        el.style.setProperty('visibility',       'hidden',  'important');
        el.style.setProperty('pointer-events',   'none',    'important');
        el.style.setProperty('opacity',          '0',       'important');
        el.style.setProperty('height',           '0',       'important');
        el.style.setProperty('overflow',         'hidden',  'important');
      });
    });
  });
  /* Observer le DOM jusqu'à ce que le container existe */
  var waitContainer = setInterval(function () {
    var c = document.getElementById('emulator-container');
    if (c) {
      clearInterval(waitContainer);
      observer.observe(c, { childList: true, subtree: true, attributes: true });
    }
  }, 200);
}

/* ══════════════════════════════════════════════════════════════
   CONTRÔLES TACTILES MOBILES
   Simule des keydown / keyup sur chaque appui tactile
   ══════════════════════════════════════════════════════════════ */

/* Simule un KeyboardEvent depuis un key name */
function fireKey(keyName, type) {
  var init = {
    key:      keyName,
    code:     keyToCode(keyName),
    keyCode:  keyToKeyCode(keyName),
    which:    keyToKeyCode(keyName),
    bubbles:  true,
    cancelable: true,
  };
  var evt = new KeyboardEvent(type, init);
  document.dispatchEvent(evt);
  /* aussi sur l'élément canvas d'EmulatorJS si présent */
  var canvas = document.querySelector('#emulator-container canvas');
  if (canvas) canvas.dispatchEvent(new KeyboardEvent(type, init));
}

function keyToCode(k) {
  var map = {
    'ArrowUp': 'ArrowUp', 'ArrowDown': 'ArrowDown',
    'ArrowLeft': 'ArrowLeft', 'ArrowRight': 'ArrowRight',
    'Enter': 'Enter', 'Shift': 'ShiftLeft',
    'z': 'KeyZ', 's': 'KeyS', 'q': 'KeyQ', 'd': 'KeyD',
    'k': 'KeyK', 'm': 'KeyM', 'i': 'KeyI', 'p': 'KeyP',
  };
  return map[k] || ('Key' + k.toUpperCase());
}

function keyToKeyCode(k) {
  var map = {
    'ArrowUp': 38, 'ArrowDown': 40, 'ArrowLeft': 37, 'ArrowRight': 39,
    'Enter': 13, 'Shift': 16,
    'z': 90, 's': 83, 'q': 81, 'd': 68,
    'k': 75, 'm': 77, 'i': 73, 'p': 80,
  };
  return map[k] || k.charCodeAt(0);
}

/* ── Bind simple bouton (touchstart / touchend) ── */
function bindButton(el) {
  var key = el.dataset.key;
  if (!key) return;

  function press(e) {
    e.preventDefault();
    el.classList.add('pressed');
    fireKey(key, 'keydown');
  }
  function release(e) {
    e.preventDefault();
    el.classList.remove('pressed');
    fireKey(key, 'keyup');
  }

  el.addEventListener('touchstart',  press,   { passive: false });
  el.addEventListener('touchend',    release, { passive: false });
  el.addEventListener('touchcancel', release, { passive: false });
  /* Souris aussi (debug desktop) */
  el.addEventListener('mousedown', press);
  el.addEventListener('mouseup',   release);
  el.addEventListener('mouseleave', release);
}

/* ── D-Pad : joystick multi-touch ── */
function initDpad() {
  var zone = document.getElementById('dpad-zone');
  if (!zone) return;

  var activeKeys = new Set();

  function getDirection(touch, rect) {
    var x = touch.clientX - rect.left;
    var y = touch.clientY - rect.top;
    var w = rect.width;
    var h = rect.height;
    var cx = w / 2, cy = h / 2;
    var dx = x - cx, dy = y - cy;
    var dirs = [];
    var threshold = Math.min(w, h) * 0.15;
    if (dy < -threshold) dirs.push('ArrowUp');
    if (dy >  threshold) dirs.push('ArrowDown');
    if (dx < -threshold) dirs.push('ArrowLeft');
    if (dx >  threshold) dirs.push('ArrowRight');
    return dirs;
  }

  function highlightDpad(dirs) {
    zone.querySelectorAll('.dpad-btn').forEach(function (btn) {
      btn.classList.remove('pressed');
    });
    dirs.forEach(function (dir) {
      var map = {
        'ArrowUp':    '.dpad-up',
        'ArrowDown':  '.dpad-down',
        'ArrowLeft':  '.dpad-left',
        'ArrowRight': '.dpad-right',
      };
      var el = zone.querySelector(map[dir]);
      if (el) el.classList.add('pressed');
    });
  }

  function updateDpad(e) {
    e.preventDefault();
    var rect = zone.getBoundingClientRect();
    var newDirs = new Set();

    for (var i = 0; i < e.touches.length; i++) {
      var t = e.touches[i];
      /* seulement si le touch est dans la zone dpad */
      if (t.clientX >= rect.left && t.clientX <= rect.right &&
          t.clientY >= rect.top  && t.clientY <= rect.bottom) {
        getDirection(t, rect).forEach(function (d) { newDirs.add(d); });
      }
    }

    /* Relâcher touches qui ne sont plus actives */
    activeKeys.forEach(function (k) {
      if (!newDirs.has(k)) { fireKey(k, 'keyup'); }
    });
    /* Appuyer nouvelles touches */
    newDirs.forEach(function (k) {
      if (!activeKeys.has(k)) { fireKey(k, 'keydown'); }
    });

    activeKeys.clear();
    newDirs.forEach(function (k) { activeKeys.add(k); });
    highlightDpad(Array.from(newDirs));
  }

  function releaseAll(e) {
    e.preventDefault();
    activeKeys.forEach(function (k) { fireKey(k, 'keyup'); });
    activeKeys.clear();
    highlightDpad([]);
  }

  zone.addEventListener('touchstart',  updateDpad, { passive: false });
  zone.addEventListener('touchmove',   updateDpad, { passive: false });
  zone.addEventListener('touchend',    releaseAll, { passive: false });
  zone.addEventListener('touchcancel', releaseAll, { passive: false });
}

/* ── Init tous les contrôles tactiles ── */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.touch-btn').forEach(bindButton);
  initDpad();
});
