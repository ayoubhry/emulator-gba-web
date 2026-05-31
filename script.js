/* ─── Variables d'état Globales ─── */
let loadedRomUrl = null;
let isEmulatorActive = false;

/* ─── ROM chargée automatiquement au démarrage ───────────────────
   Placez votre ROM dans le dossier Roms/ à la racine du dépôt.
   Le nom du fichier doit correspondre exactement à AUTO_ROM.path.
   ─────────────────────────────────────────────────────────────── */
const AUTO_ROM = {
  path: 'Roms/Pokemon - Version Emeraude.gba',
  name: 'Pokémon — Version Émeraude',
};

/* ─── Captures des Éléments DOM ─── */
const romInput       = document.getElementById('rom-input');
const dropZone       = document.getElementById('drop-zone');
const romInfoBox     = document.getElementById('rom-info');
const romNameDisplay = document.getElementById('rom-name');
const bootOverlay    = document.getElementById('overlay');
const powerLed       = document.getElementById('power-led');

/* ─── Chargement automatique au démarrage de la page ─── */
window.addEventListener('DOMContentLoaded', autoLoadROM);

async function autoLoadROM() {
  romNameDisplay.textContent = '⏳  Chargement de Pokémon Émeraude…';
  romInfoBox.style.opacity = '1';

  try {
    const res = await fetch(AUTO_ROM.path);

    if (!res.ok) {
      throw new Error(
        `HTTP ${res.status} — vérifiez que le fichier existe bien à : ${AUTO_ROM.path}`
      );
    }

    const blob = await res.blob();

    // Libération de l'éventuelle URL précédente
    if (loadedRomUrl) URL.revokeObjectURL(loadedRomUrl);
    loadedRomUrl = URL.createObjectURL(blob);

    romNameDisplay.textContent = AUTO_ROM.name;

    // Démarrage immédiat de l'émulateur sans interaction utilisateur
    launchEmulator();

  } catch (err) {
    console.error('[GBA Emulator] Erreur de chargement automatique :', err);
    romNameDisplay.textContent = '❌  ' + err.message;
  }
}

/* ─── Gestion de l'import manuel (fallback — changer de jeu) ─── */
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
    alert('Format non pris en charge. Veuillez importer une ROM au format .GBA ou compressée.');
    return;
  }

  if (loadedRomUrl) URL.revokeObjectURL(loadedRomUrl);

  loadedRomUrl = URL.createObjectURL(file);
  romNameDisplay.textContent = file.name;
  romInfoBox.style.opacity = '1';
}

/* ─── Lancement de la machine virtuelle ─── */
function launchEmulator() {
  if (!loadedRomUrl) {
    alert('Veuillez d\'abord ajouter un fichier de ROM valide.');
    return;
  }

  bootOverlay.classList.add('active');

  setTimeout(() => {
    bootOverlay.classList.remove('active');
    powerLed.classList.add('on');
    startEmulatorCore();
  }, 2000);
}

function startEmulatorCore() {
  isEmulatorActive = true;

  const idleScreen = document.getElementById('idle-screen');
  if (idleScreen) idleScreen.remove();

  /* Config globale de l'API EmulatorJS */
  window.EJS_player          = '#emulator-container';
  window.EJS_core            = 'mgba';
  window.EJS_gameUrl         = loadedRomUrl;
  window.EJS_pathtodata      = 'https://cdn.emulatorjs.org/stable/data/';
  window.EJS_startOnLoaded   = true;
  window.EJS_backgroundColor = '#0d1117';

  window.EJS_defaultControls = {
    0: { value: 'KeyL' },      // Bouton A  → L
    1: { value: 'KeyM' },      // Bouton B  → M
    2: { value: 'ShiftLeft' }, // SELECT    → Maj Gauche
    3: { value: 'Enter' },     // START     → Entrée
    4: { value: 'KeyZ' },      // Haut      → Z
    5: { value: 'KeyS' },      // Bas       → S
    6: { value: 'KeyQ' },      // Gauche    → Q
    7: { value: 'KeyD' },      // Droite    → D
    8: { value: 'KeyI' },      // Gâchette L → I
    9: { value: 'KeyP' },      // Gâchette R → P
  };

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

  const coreLoader = document.createElement('script');
  coreLoader.src = 'https://cdn.emulatorjs.org/stable/data/loader.js?v=' + Date.now();
  document.head.appendChild(coreLoader);
}