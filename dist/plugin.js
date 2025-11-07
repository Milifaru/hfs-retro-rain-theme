// HFS plugin: retro-rain
// v3.7.11 — Fix JS syntax (and→&&, True/False→true/false).

exports.description = "Retro rain theme by Milifaru for HFS";
exports.isTheme = "dark";
exports.version = 4.2;
exports.apiRequired = [8, 12.94];
exports.repo = "Milifaru/hfs-retro-rain-theme";
exports.preview = ["https://raw.githubusercontent.com/Milifaru/hfs-retro-rain-theme/main/preview.png"];

exports.config = {
  pixelSize: { type: "number", label: "Pixel size", defaultValue: 3, min: 1, max: 8, frontend: true },
  intensity: { type: "number", label: "Rain intensity (drops/sec)", defaultValue: 140, min: 0, max: 500, frontend: true },
  gravity: { type: "number", label: "Gravity", defaultValue: 900, min: 0, max: 3000, frontend: true },
  wind: { type: "number", label: "Base wind (px/s)", defaultValue: 0, min: -800, max: 800, frontend: true },
  dropSpeedMin: { type: "number", label: "Drop speed min", defaultValue: 380, min: 0, max: 1500, frontend: true },
  dropSpeedMax: { type: "number", label: "Drop speed max", defaultValue: 680, min: 0, max: 2000, frontend: true },
  trailLen: { type: "number", label: "Drop trail length (pixels)", defaultValue: 3, min: 0, max: 12, frontend: true },
  trailSpacing: { type: "number", label: "Trail spacing (px per step)", defaultValue: 1, min: 0.5, max: 4, step: 0.1, frontend: true },

  splashCountMin: { type: "number", label: "Splash count min", defaultValue: 5, min: 0, max: 30, frontend: true },
  splashCountMax: { type: "number", label: "Splash count max", defaultValue: 9, min: 0, max: 60, frontend: true },
  splashSpeedXMin: { type: "number", label: "Splash speed X min", defaultValue: 120, min: 0, max: 1000, frontend: true },
  splashSpeedXMax: { type: "number", label: "Splash speed X max", defaultValue: 260, min: 0, max: 1500, frontend: true },
  splashSpeedYMin: { type: "number", label: "Splash speed Y min", defaultValue: 220, min: 0, max: 1200, frontend: true },
  splashSpeedYMax: { type: "number", label: "Splash speed Y max", defaultValue: 360, min: 0, max: 1500, frontend: true },
  groundMargin: { type: "number", label: "Ground margin (px)", defaultValue: 8, min: 0, max: 100, frontend: true },
  maxDrops: { type: "number", label: "Max drops (cap)", defaultValue: 600, min: 10, max: 5000, frontend: true },
  maxParticles: { type: "number", label: "Max particles (cap)", defaultValue: 2000, min: 10, max: 20000, frontend: true },

  useBgImage: { type: "boolean", label: "Use background image", defaultValue: true, frontend: true },
  bgImageVfs: { type: "vfs_path", label: "Background image (VFS path, overrides default)", files: "*.png|*.jpg|*.jpeg|*.webp|*.gif", folders: false, frontend: true },
  bgImageUri: { type: "string", label: "Background image (URL)", defaultValue: "", frontend: true },
  bgFit: { type: "select", label: "Image fit", options: {"Cover":"cover","Cover (bottom)":"cover-bottom","Cover (top)":"cover-top","Contain":"contain","Contain (bottom)":"contain-bottom","Contain (top)":"contain-top","Stretch":"stretch","Tile":"tile","Tile X":"tile-x","Tile Y":"tile-y"}, defaultValue: "cover-bottom", frontend: true },
  bgTop: { type: "color", label: "Background top color (fallback)", defaultValue: "#0a0f1f", frontend: true },
  bgBottom: { type: "color", label: "Background bottom color (fallback)", defaultValue: "#0d1428", frontend: true },

  rainColor: { type: "color", label: "Rain color", defaultValue: "#9fd7ff", frontend: true },
  foamColor: { type: "color", label: "Splash color", defaultValue: "#c9ecff", frontend: true },
  glareColor: { type: "color", label: "Glare color", defaultValue: "#e8f6ff", frontend: true },

  uiMenuTransparent: { type: "boolean", label: "Top menu background transparent", defaultValue: true, frontend: true },
  uiMenuText: { type: "color", label: "Top menu text color", defaultValue: "#e6f2ff", frontend: true },
  uiPillBg: { type: "color", label: "Pill buttons background (menu & breadcrumbs)", defaultValue: "#334455", frontend: true },
  uiMenuBtnText: { type: "color", label: "Top menu button text color", defaultValue: "#e6f2ff", frontend: true },

  uiFileName: { type: "color", label: "File name text color", defaultValue: "#e6f2ff", frontend: true },
  uiFileIconFilter: { type: "string", label: "File icon CSS filter", defaultValue: "", frontend: true },
  uiFileComment: { type: "color", label: "File comment color", defaultValue: "#a8b3c7", frontend: true },
  uiFileDate: { type: "color", label: "File date color", defaultValue: "#8ea2bf", frontend: true },
  uiFileBg: { type: "string", label: "File row background (css)", defaultValue: "transparent", frontend: true },
  uiFileBgAlt: { type: "string", label: "File row background (alt/even rows)", defaultValue: "transparent", frontend: true },
  uiFileHoverBg: { type: "string", label: "File row hover background (css)", defaultValue: "rgba(255,255,255,0.04)", frontend: true },

  allowGoldMode: { type: "boolean", label: "Enable Gold spray mode (toggle with ←/→)", defaultValue: false, frontend: true },
  goldColor: { type: "color", label: "Gold color", defaultValue: "#ffd54d", frontend: true },
  goldSide: { type: "select", label: "Gold spray side (default)", options: {"Left":"left","Right":"right"}, defaultValue: "left", frontend: true },
  goldIntensity: { type: "number", label: "Gold spray intensity", defaultValue: 240, min: 0, max: 800, frontend: true },
  goldJetSpeed: { type: "number", label: "Gold spray speed (used if mouse control is off)", defaultValue: 900, min: 0, max: 3000, frontend: true },
  goldConeDeg: { type: "number", label: "Gold cone spread (deg)", defaultValue: 7, min: 0, max: 45, frontend: true },
  goldNozzleY: { type: "number", label: "Gold nozzle Y (0..1 of height)", defaultValue: 0.5, min: 0, max: 1, step: 0.01, frontend: true },
  goldNozzleInsetPx: { type: "number", label: "Gold nozzle inset (px from edge)", defaultValue: 0, min: 0, max: 50, frontend: true },
  goldTurbulence: { type: "number", label: "Gold turbulence (px/s^2)", defaultValue: 140, min: 0, max: 800, frontend: true },
  goldMouseControl: { type: "boolean", label: "Gold by mouse (direction & strength)", defaultValue: true, frontend: true },
  goldSpeedMin: { type: "number", label: "Gold speed min (mouse)", defaultValue: 300, min: 0, max: 3000, frontend: true },
  goldSpeedMax: { type: "number", label: "Gold speed max (mouse)", defaultValue: 1400, min: 0, max: 4000, frontend: true },
  goldMouseBoost: { type: "number", label: "Gold LMB intensity boost", defaultValue: 200, min: 0, max: 1000, frontend: true },
  goldSpeedBoost: { type: "number", label: "Gold LMB speed boost", defaultValue: 200, min: 0, max: 2000, frontend: true },

  gustEnabled: { type: "boolean", label: "Wind gusts (periodic)", defaultValue: true, frontend: true },
  gustStrengthMin: { type: "number", label: "Gust strength min (px/s)", defaultValue: 80, frontend: true },
  gustStrengthMax: { type: "number", label: "Gust strength max (px/s)", defaultValue: 220, frontend: true },
  gustDurMinSec: { type: "number", label: "Gust duration min (sec)", defaultValue: 10, frontend: true },
  gustDurMaxSec: { type: "number", label: "Gust duration max (sec)", defaultValue: 20, frontend: true },
  calmDurMinSec: { type: "number", label: "Calm duration min (sec)", defaultValue: 40, frontend: true },
  calmDurMaxSec: { type: "number", label: "Calm duration max (sec)", defaultValue: 80, frontend: true },
  gustResponse: { type: "number", label: "Drop response to gust (1/s)", defaultValue: 1.2, step: 0.1, frontend: true },

  edgeSpawnThreshold: { type: "number", label: "Side-spawn threshold |wind| (px/s)", defaultValue: 60, frontend: true },
  edgeSpawnRamp: { type: "number", label: "Side-spawn ramp (px/s to reach max share)", defaultValue: 200, frontend: true },
  edgeSpawnTopMinShare: { type: "number", label: "Top spawn MIN share at strong wind (0..1)", defaultValue: 0.25, step: 0.01, frontend: true },
  edgeSpawnMarginPx: { type: "number", label: "Off-screen spawn margin (px)", defaultValue: 12, frontend: true },
  edgeSpawnMaxShare: { type: "number", label: "Side-spawn MAX share (0..1)", defaultValue: 0, min: 0, max: 1, step: 0.01, frontend: true },
  edgeSpawnExtraDistPx: { type: "number", label: "Side-spawn extra upstream distance (px)", defaultValue: 80, min: 0, max: 600, frontend: true },
  edgeSpawnJitterPx: { type: "number", label: "Side-spawn horizontal jitter (px)", defaultValue: 8, min: 0, max: 50, frontend: true },

  startEnabled: { type: "boolean", label: "Start with rain enabled", defaultValue: true, frontend: true },
  lockDpr: { type: "boolean", label: "Lock DPR to 1 (ignore browser zoom)", defaultValue: false, frontend: true },

  showToggle: { type: "boolean", label: "Show image button to toggle rain for everyone", defaultValue: true, frontend: true },
  toggleImageVfs: { type: "vfs_path", label: "Toggle button image (VFS path)", files: "*.png|*.jpg|*.jpeg|*.webp|*.gif|*.svg", folders: false, frontend: true },
  toggleSizePx: { type: "number", label: "Toggle button size (px)", defaultValue: 40, min: 24, max: 128, frontend: true },
  togglePos: { type: "select", label: "Toggle button position", options: {"Bottom right":"br","Bottom left":"bl","Top right":"tr","Top left":"tl"}, defaultValue: "br", frontend: true },
  toggleRemember: { type: "boolean", label: "Remember user choice in this browser", defaultValue: true, frontend: true }
};

exports.frontend_js = ["rain.js"];
exports.frontend_css = "rain.css";


const fs = require('fs');
const path = require('path');
let _apiRef = null;
exports.init = function(api){ _apiRef = api; };

const SCORE_FILE = path.join(__dirname, 'leaderboard.json');
function readScores(){
  try { return JSON.parse(fs.readFileSync(SCORE_FILE,'utf8')); } catch(e){ return []; }
}
function writeScores(list){
  try { fs.writeFileSync(SCORE_FILE, JSON.stringify(list, null, 2)); } catch(e) {}
}

exports.customRest = {
  async loadScores(){
    return readScores();
  },
  async saveScore({ name, score }){
    name = String(name||'PLAYER').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);
    score = Math.max(0, Math.floor(Number(score)||0));
    const list = readScores();
    list.push({ name, score });
    list.sort((a,b)=>b.score-a.score);
    while (list.length>10) list.pop();
    writeScores(list);
    return list;
  }
};
