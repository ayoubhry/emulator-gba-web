/* ══════════════════════════════════════════════════════════════
   GBA Web Emulator — script.js  (contrôles corrigés)
   ══════════════════════════════════════════════════════════════ */

/* ─── Config ROM auto ─── */
var AUTO_ROM = {
  path: 'PokemonEmeraude.gba',      // On a enlevé "Roms/" car le jeu est à la racine !
  name: 'Pokémon Version Émeraude',
};

/* ─── État global ─── */
var emulatorStarted = false;
var currentBlobUrl  = null;

/* ─── Captures DOM ─── */
var romInput       = document.getElementById('rom-input');
var dropZone       = document.getElementById('drop-zone');
var romNameDisplay = document.getElementById('rom-name');
var powerLed       = document.getElementById('power-led');
var btnRelancer    = document.getElementById('btn-relancer');

/* ─── Bouton Relancer ─── */
if (btnRelancer) {
  btnRelancer.addEventListener('click', function () {
    window.location.reload();
  });
}

/* ─── Chargement automatique de la ROM ─── */
romNameDisplay.textContent = '⏳  Chargement de Pokémon Émeraude…';

fetch(AUTO_ROM.path, { method: 'HEAD' })
  .then(function (res) {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    romNameDisplay.textContent = AUTO_ROM.name;
    launchEmulator(AUTO_ROM.path, AUTO_ROM.name);
  })
  .catch(function (err) {
    console.warn('[GBA] ROM auto introuvable :', err.message);
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
  /* ─── Chargement automatique de la ROM (Désactivé pour diagnostic) ─── */
  romNameDisplay.textContent = '⚠️ Mode manuel — Glissez votre jeu ci-dessous';
  var details = document.querySelector('details');
  if (details) details.open = true;

// Le bloc "fetch(AUTO_ROM.path)..." est retiré pour bloquer le lancement automatique défectueux
  launchEmulator(currentBlobUrl, file.name.replace(/\.[^.]+$/, ''));
}

/* ─── Lancement de l'émulateur ─── */
function launchEmulator(romUrl, romLabel) {
  if (emulatorStarted) { window.location.reload(); return; }
  emulatorStarted = true;

  localStorage.clear();

  if (powerLed) powerLed.classList.add('on');
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

  /*
   * ══════════════════════════════════════════════════════════
   *  MAPPING DES CONTRÔLES — FORMAT OFFICIEL EmulatorJS
   *  Source : https://emulatorjs.org/docs4devs/control-mapping
   *
   *  Structure : EJS_defaultControls = { joueur: { index: { value: event.key } } }
   *  Les "value" sont les noms exacts de event.key (sensible à la casse !)
   *
   *  Index GBA (RetroArch) :
   *    0 = B        → touche M
   *    1 = Y        → (inutilisé sur GBA, on le laisse vide)
   *    2 = SELECT   → Maj gauche (Shift)
   *    3 = START    → Entrée (Enter)
   *    4 = UP       → Z
   *    5 = DOWN     → S
   *    6 = LEFT     → Q
   *    7 = RIGHT    → D
   *    8 = A        → L
   *    9 = X        → (inutilisé sur GBA)
   *   10 = L        → I
   *   11 = R        → P
   * ══════════════════════════════════════════════════════════
   */
  window.EJS_defaultControls = {
    0: {                              // Joueur 1
      0:  { value: 'm'       },      // Bouton B   → M
      1:  { value: ''        },      // Y          → (vide)
      2:  { value: 'Shift'   },      // SELECT     → Maj ⇧
      3:  { value: 'Enter'   },      // START      → Entrée ↵
      4:  { value: 'z'       },      // HAUT       → Z
      5:  { value: 's'       },      // BAS        → S
      6:  { value: 'q'       },      // GAUCHE     → Q
      7:  { value: 'd'       },      // DROITE     → D
      8:  { value: 'k'       },      // Bouton A   → K
      9:  { value: ''        },      // X          → (vide)
      10: { value: 'i'       },      // Gâchette L → I
      11: { value: 'p'       },      // Gâchette R → P
    },
    1: {},
    2: {},
    3: {}
  };

  window.EJS_Buttons = {
    playPause:    true,
    restart:      true,
    mute:         true,
    volume:       true,
    fullscreen:   true,
    saveState:    true,
    loadState:    true,
    screenRecord: false,
    gamepad:      true,
    cheat:        false,
    screenshot:   true,
    cacheManager: false,
  };

  var script   = document.createElement('script');
  script.src   = 'https://cdn.emulatorjs.org/stable/data/loader.js';
  script.async = false;
  document.body.appendChild(script);
}
