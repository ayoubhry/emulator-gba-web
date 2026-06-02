# 🎮 GameBoy Advance - Web Emulator

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-00c8ff?style=flat-square&logo=github)](https://ayoubhry.github.io/emulator-gba-web/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](#)

Un émulateur **Game Boy Advance** au design moderne tournant entièrement dans le navigateur, hébergé de manière sécurisée sur GitHub Pages. Il charge automatiquement une ROM par défaut dès l'ouverture de la page — **sans installation, sans plugin**.

> 🚀 **[JOUER MAINTENANT](https://ayoubhry.github.io/emulator-gba-web/)**

Propulsé par [EmulatorJS](https://emulatorjs.org/) et le cœur d'émulation **mGBA WebAssembly**.

---

## ✨ Fonctionnalités

* ⚡ **Chargement Automatique :** Le jeu (par défaut *Pokémon Version Émeraude*) démarre instantanément sans aucune action requise.
* 🕹️ **Design Pixel-Perfect :** Une interface en CSS pur modélisant fidèlement la console GBA (croix directionnelle, boutons A/B, gâchettes L/R, indicateur LED).
* 🔄 **Changement de ROM à la volée :** Glissez-déposez n'importe quel fichier `.gba`, `.zip` ou `.7z` dans la zone dédiée pour changer de jeu instantanément.
* 💾 **Sauvegardes Intégrées :** Gestion des *Save States* (sauvegardes d'état) directement via l'interface d'EmulatorJS.
* 🎮 **Support Manette :** Compatible nativement avec l'API Gamepad des navigateurs.
* 📱 **Responsive Design :** S'adapte intelligemment aux petits comme aux grands écrans.

---

## ⌨️ Contrôles par défaut (Clavier)

Les touches sont mappées pour une utilisation optimale sur clavier (disposition AZERTY). 

| Action Console | Touche Clavier |
| :--- | :--- |
| **Croix Directionnelle** (↑ ↓ ← →) | `Z` `S` `Q` `D` |
| **Bouton A** | `L` |
| **Bouton B** | `M` |
| **Gâchette L** | `I` |
| **Gâchette R** | `P` |
| **START** | `Entrée ↵` |
| **SELECT** | `Maj ⇧` (Shift) |
| **Plein écran / Menu Émulateur** | Géré par l'UI EmulatorJS (Barre de contrôle) |

> 💡 *Note : Les contrôles peuvent être reconfigurés à tout moment via l'icône de manette dans le menu inférieur de l'émulateur.*

---

## 🛠️ Installation & Utilisation en Local

Si vous souhaitez forker le projet [ayoubhry/emulator-gba-web](https://github.com/ayoubhry/emulator-gba-web) et l'exécuter sur votre propre machine :

### 1. Cloner le dépôt
```bash
git clone [https://github.com/ayoubhry/emulator-gba-web.git](https://github.com/ayoubhry/emulator-gba-web.git)
cd emulator-gba-web
