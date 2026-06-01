/* ══════════════════════════════════════════════════════════════
   GBA Web Emulator — script.js
   Placé juste avant </body> → le DOM est déjà parsé quand ce
   script s'exécute. PAS de "defer", PAS de DOMContentLoaded.
   ══════════════════════════════════════════════════════════════ */

/* ─── Config ROM auto ─── */
var AUTO_ROM = {
  path: 'Roms/Pok\u00e9mon - Version Emeraude.gba',
  name: 'Pokémon — Version Émeraude',
};

/* ─── État global ─── */
var emulatorStarted = false;
var currentBlobUrl  = null;

/* ─── Captures DOM (script placé avant </body> → DOM déjà disponible) ─── */
var romInput       = document.getElementById('rom-input');
var dropZone       = document.getElementById('drop-zone');
var romNameDisplay = document.getElementById('rom-name');
var bootOverlay    = document.getElementById('overlay');
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

fetch(AUTO_ROM.path)
  .then(function (res) {
    if (!res.ok) {
      throw new Error('HTTP ' + res.status + ' — fichier introuvable : ' + AUTO_ROM.path);
    }
    romNameDisplay.textContent = AUTO_ROM.name;
    launchEmulator(AUTO_ROM.path, AUTO_ROM.name);
  })
  .catch(function (err) {
    console.error('[GBA] Erreur chargement auto :', err);
    romNameDisplay.textContent = '❌  ' + err.message;
    // Ouvrir automatiquement la section drag & drop en fallback
    var details = document.querySelector('details');
    if (details) details.open = true;
  });

/* ─── Import manuel : sélecteur de fichier ─── */
romInput.addEventListener('change', function (e) {
  var file = e.target.files[0];
  if (file) processFile(file);
});

/* ─── Import manuel : drag & drop ─── */
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

/* ─── Traitement d'un fichier local ─── */
function processFile(file) {
  var ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (['.gba', '.zip', '.7z'].indexOf(ext) === -1) {
    alert('Format non pris en charge. Utilisez .gba, .zip ou .7z');
    return;
  }
  // Révoquer le blob URL précédent pour éviter les fuites mémoire
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = null;
  }
  currentBlobUrl = URL.createObjectURL(file);
  romNameDisplay.textContent = file.name;
  launchEmulator(currentBlobUrl, file.name);
}

/* ══════════════════════════════════════════════════════════════
   launchEmulator
   ──────────────────────────────────────────────────────────────
   RÈGLES CRITIQUES EmulatorJS (v4+) :
   1. Toutes les variables window.EJS_* doivent être définies
      AVANT l'injection de loader.js.
   2. loader.js ne doit être injecté QU'UNE SEULE FOIS par page.
   3. Le core GBA = "gba" (mgba est aussi accepté selon la doc).
   4. EJS_player doit pointer vers un élément VIDE dans le DOM.
   ══════════════════════════════════════════════════════════════ */
function launchEmulator(romUrl, romLabel) {
  // Garde-fou : une seule instance par chargement de page
  if (emulatorStarted) {
    window.location.reload();
    return;
  }
  emulatorStarted = true;

  // Overlay de boot
  bootOverlay.classList.add('active');

  setTimeout(function () {
    bootOverlay.classList.remove('active');
    powerLed.classList.add('on');

    // Supprimer l'écran idle AVANT que l'émulateur ne prenne la place
    var idle = document.getElementById('idle-screen');
    if (idle) idle.remove();

    /* ── Variables EmulatorJS ── */
    window.EJS_player          = '#game';
    window.EJS_core            = 'gba';        // "gba" = core officiel GBA
    window.EJS_gameUrl         = romUrl;        // URL HTTP relative ou blob://
    window.EJS_gameName        = romLabel;      // utilisé pour les saves/screenshots
    window.EJS_pathtodata      = 'https://cdn.emulatorjs.org/stable/data/';
    window.EJS_startOnLoaded   = true;
    window.EJS_backgroundColor = '#000000';
    window.EJS_color           = '#8b5cf6';    // couleur accent de l'UI EmulatorJS

    /* Mapping AZERTY — API interne EJS (non garantie entre versions) */
    window.EJS_defaultControls = {
      0: { value: 'KeyL' },       // Bouton A
      1: { value: 'KeyM' },       // Bouton B
      2: { value: 'ShiftLeft' },  // SELECT
      3: { value: 'Enter' },      // START
      4: { value: 'KeyZ' },       // Haut
      5: { value: 'KeyS' },       // Bas
      6: { value: 'KeyQ' },       // Gauche
      7: { value: 'KeyD' },       // Droite
      8: { value: 'KeyI' },       // Gâchette L
      9: { value: 'KeyP' },       // Gâchette R
    };

    /* Boutons barre EmulatorJS */
    window.EJS_Buttons = {
      playPause:    false,
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

    /* ── Injection unique du loader.js (APRÈS toutes les EJS_*) ── */
    var script    = document.createElement('script');
    script.src    = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    script.async  = false;  // s'assure d'une exécution séquentielle
    document.body.appendChild(script);

  }, 1800);
}
