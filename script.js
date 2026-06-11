/* ══════════════════════════════════════════════════════════════
   SNES Web Emulator — script.js
   ══════════════════════════════════════════════════════════════ */

/* ─── Coordonnées de l'écran TV dans l'image source (1536×1024) ─── */
var SCREEN = { left: 460, top: 155, right: 1128, bottom: 620 };
var IMG_W  = 1536;
var IMG_H  = 1024;

/* ─── Positionnement pixel-perfect de l'overlay sur l'image ─── */
function positionScreenOverlay() {
  var img     = document.getElementById('snes-img');
  var overlay = document.getElementById('screen-overlay');
  if (!img || !overlay) return;

  var renderedW = img.offsetWidth;
  var renderedH = img.offsetHeight;
  if (renderedW === 0 || renderedH === 0) return;

  var scaleX = renderedW / IMG_W;
  var scaleY = renderedH / IMG_H;

  overlay.style.left   = Math.round(SCREEN.left   * scaleX) + 'px';
  overlay.style.top    = Math.round(SCREEN.top     * scaleY) + 'px';
  overlay.style.width  = Math.round((SCREEN.right  - SCREEN.left)   * scaleX) + 'px';
  overlay.style.height = Math.round((SCREEN.bottom - SCREEN.top)    * scaleY) + 'px';
}

var img = document.getElementById('snes-img');
if (img.complete) {
  positionScreenOverlay();
} else {
  img.addEventListener('load', positionScreenOverlay);
}
window.addEventListener('resize', positionScreenOverlay);

/* ─── Auto-load ROM ─── */
var AUTO_ROM_NAME = 'Super Mario World.sfc';
var AUTO_ROM_URL  = encodeURIComponent(AUTO_ROM_NAME);   /* "Super%20Mario%20World.sfc" */
var AUTO_ROM_LABEL = 'Super Mario World';

var emulatorStarted = false;
var currentBlobUrl  = null;

var romInput       = document.getElementById('rom-input');
var dropZone       = document.getElementById('drop-zone');
var romNameDisplay = document.getElementById('rom-name');
var btnRelancer    = document.getElementById('btn-relancer');

if (btnRelancer) {
  btnRelancer.addEventListener('click', function () { window.location.reload(); });
}

romNameDisplay.textContent = '⏳ Chargement de Super Mario World…';

fetch(AUTO_ROM_URL, { method: 'HEAD' })
  .then(function (res) {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    romNameDisplay.textContent = AUTO_ROM_LABEL;
    launchEmulator(AUTO_ROM_URL, AUTO_ROM_LABEL);
  })
  .catch(function (err) {
    console.warn('[SNES] ROM auto introuvable :', err.message);
    romNameDisplay.textContent = '⚠️ Aucune ROM — chargez-en une ci-dessous';
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

/* ─── Lancement de l'émulateur ─── */
function launchEmulator(romUrl, romLabel) {
  if (emulatorStarted) { window.location.reload(); return; }
  emulatorStarted = true;

  localStorage.clear();

  var idle = document.getElementById('idle-screen');
  if (idle) idle.remove();

  window.EJS_player          = '#emulator-container';
  window.EJS_core            = 'snes';
  window.EJS_gameUrl         = romUrl;
  window.EJS_gameName        = romLabel || 'SNES Game';
  window.EJS_pathtodata      = 'https://cdn.emulatorjs.org/stable/data/';
  window.EJS_startOnLoaded   = true;
  window.EJS_backgroundColor = '#000000';
  window.EJS_color           = '#7164da';
  window.EJS_language        = 'fr';

  window.EJS_defaultControls = {
    0: {
      0:  { value: 'm'     },   // B
      1:  { value: 'j'     },   // Y
      2:  { value: 'Shift' },   // SELECT
      3:  { value: 'Enter' },   // START
      4:  { value: 'z'     },   // HAUT
      5:  { value: 's'     },   // BAS
      6:  { value: 'q'     },   // GAUCHE
      7:  { value: 'd'     },   // DROITE
      8:  { value: 'k'     },   // A
      9:  { value: 'i'     },   // X
      10: { value: 'u'     },   // L
      11: { value: 'o'     },   // R
    },
    1: {}, 2: {}, 3: {}
  };

  window.EJS_Buttons = {
    playPause: true, restart: true, mute: true, volume: true,
    fullscreen: true, saveState: true, loadState: true,
    screenRecord: false, gamepad: true, cheat: false,
    screenshot: true, cacheManager: false,
  };

  var script = document.createElement('script');
  script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
  script.async = false;
  document.body.appendChild(script);
}
