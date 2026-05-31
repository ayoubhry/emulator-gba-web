/* ─── Variables d'état ─── */
let loadedRomPath = null;
let loadedRomName = null;
let isEmulatorActive = false;

/* ─── ROM chargée automatiquement ───────────────────────────────
   Placez votre ROM dans Roms/ à la racine du dépôt.
   Le nom du fichier doit correspondre exactement à AUTO_ROM.path.
   ─────────────────────────────────────────────────────────────── */
const AUTO_ROM = {
  path: 'Roms/Pokemon - Version Emeraude.gba',
  name: 'Pokémon — Version Émeraude',
};

/* ─── Éléments DOM ─── */
const romInput       = document.getElementById('rom-input');
const dropZone       = document.getElementById('drop-zone');
const romInfoBox     = document.getElementById('rom-info');
const romNameDisplay = document.getElementById('rom-name');
const bootOverlay    = document.getElementById('overlay');
const powerLed       = document.getElementById('power-led');

/* ─── Chargement automatique au démarrage ─── */
window.addEventListener('DOMContentLoaded', autoLoadROM);

async function autoLoadROM() {
  romNameDisplay.textContent = '⏳  Chargement de Pokémon Émeraude…';

  try {
    const res = await fetch(AUTO_ROM.path);

    if (!res.ok) {
      throw new Error(
        `HTTP ${res.status} — vérifiez que le fichier existe bien à : ${AUTO_ROM.path}`
      );
    }

    // On garde le chemin HTTP direct (pas de blob) pour compatibilité EmulatorJS
    loadedRomPath = AUTO_ROM.path;
    loadedRomName = AUTO_ROM.name;
    romNameDisplay.textContent = AUTO_ROM.name;

    // Démarrage immédiat
    launchEmulator();

  } catch (err) {
    console.error('[GBA Emulator] Erreur de chargement automatique :', err);
    romNameDisplay.textContent = '❌  ' + err.message;

    // En cas d'erreur (ex: file:// local), on ouvre la section "Changer de jeu"
    const details = document.querySelector('details');
    if (details) details.open = true;
  }
}

/* ─── Import manuel (glisser-déposer ou sélection de fichier) ─── */
romInput.addEventListener('change', (e) => {
  if (e.target.files[0]) processFile(e.target.files[0]);
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.style.borderColor = 'var(--accent-blue)';
});

dropZone.addEventListener('dragleave', () => {
  dropZone.style.borderColor = 'rgba(255, 255, 255, 0.1)';
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.style.borderColor = 'rgba(255, 255, 255, 0.1)';
  if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
});

function processFile(file) {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!['.gba', '.zip', '.7z'].includes(extension)) {
    alert('Format non pris en charge. Veuillez importer une ROM .GBA ou compressée.');
    return;
  }

  // Pour les fichiers locaux (drag & drop), un blob URL est nécessaire
  if (loadedRomPath && loadedRomPath.startsWith('blob:')) {
    URL.revokeObjectURL(loadedRomPath);
  }

  loadedRomPath = URL.createObjectURL(file);
  loadedRomName = file.name;
  romNameDisplay.textContent = file.name;
}

/* ─── Lancement de l'émulateur ─── */
function launchEmulator() {
  if (!loadedRomPath) {
    alert('Veuillez d\'abord ajouter un fichier ROM valide.');
    return;
  }

  // Si l'émulateur tourne déjà, on recharge la page proprement
  if (isEmulatorActive) {
    window.location.reload();
    return;
  }

  bootOverlay.classList.add('active');

  setTimeout(() => {
    bootOverlay.classList.remove('active');
    powerLed.classList.add('on');
    startEmulatorCore();
  }, 2000);
}

/* ─── Démarrage du cœur EmulatorJS ─────────────────────────────
   IMPORTANT : le loader.js ne doit être injecté QU'UNE SEULE FOIS,
   APRÈS que toutes les variables window.EJS_* soient définies.
   C'est pourquoi il n'y a PAS de <script loader.js> dans index.html.
   ─────────────────────────────────────────────────────────────── */
function startEmulatorCore() {
  isEmulatorActive = true;

  // Suppression de l'écran de veille
  const idleScreen = document.getElementById('idle-screen');
  if (idleScreen) idleScreen.remove();

  /* ── Configuration de l'API EmulatorJS ── */
  window.EJS_player          = '#emulator-container';
  window.EJS_core            = 'mgba';
  window.EJS_gameUrl         = loadedRomPath;   // chemin HTTP ou blob URL
  window.EJS_pathtodata      = 'https://cdn.emulatorjs.org/stable/data/';
  window.EJS_startOnLoaded   = true;
  window.EJS_backgroundColor = '#0d1117';

  /* Mapping clavier AZERTY */
  window.EJS_defaultControls = {
    0: { value: 'KeyL' },       // Bouton A  → L
    1: { value: 'KeyM' },       // Bouton B  → M
    2: { value: 'ShiftLeft' },  // SELECT    → Maj Gauche
    3: { value: 'Enter' },      // START     → Entrée
    4: { value: 'KeyZ' },       // Haut      → Z
    5: { value: 'KeyS' },       // Bas       → S
    6: { value: 'KeyQ' },       // Gauche    → Q
    7: { value: 'KeyD' },       // Droite    → D
    8: { value: 'KeyI' },       // Gâchette L → I
    9: { value: 'KeyP' },       // Gâchette R → P
  };

  /* Boutons de la barre EmulatorJS */
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

  /* Injection unique du loader — déclenche l'émulateur */
  const coreLoader = document.createElement('script');
  coreLoader.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
  document.head.appendChild(coreLoader);
}
