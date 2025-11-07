
async function serverLoadScores() {
  if (window.HFS && typeof HFS.customRestCall === 'function') {
    return await HFS.customRestCall('loadScores', {});
  }
  throw new Error('RetroRain leaderboard API is unavailable.');
}

async function serverSaveScore(name, score) {
  if (window.HFS && typeof HFS.customRestCall === 'function') {
    return await HFS.customRestCall('saveScore', { name, score });
  }
  throw new Error('RetroRain leaderboard API is unavailable.');
}


// Retro Rain — v3.7.16
if (location.pathname.startsWith('/~/admin')) {
} else {
  (function(){
    let display = document.getElementById('retroRain');
    if (!display) {
      display = document.createElement('canvas');
      display.id = 'retroRain';
      display.style.zIndex = "-1";
      display.style.pointerEvents = "none";
      document.body.prepend(display);
    }
    const scriptEl = document.currentScript;
    const baseUrl = scriptEl ? new URL('.', scriptEl.src).href : '';

    const CFG = (window.HFS && HFS.getPluginConfig) ? HFS.getPluginConfig() : {};
    const num = (v, d) => (typeof v === 'number' && !Number.isNaN(v)) ? v : d;
    const str = (v, d) => (typeof v === 'string' && v !== undefined) ? v : d;
    const bool = (v, d) => (typeof v === 'boolean') ? v : d;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const deg2rad = (d) => d * Math.PI / 180;

    const config = {
      pixelSize:    num(CFG.pixelSize, 3),
      intensity:    num(CFG.intensity, 140),
      gravity:      num(CFG.gravity, 900),
      wind:         num(CFG.wind, 0),
      dropSpeedMin: num(CFG.dropSpeedMin, 380),
      dropSpeedMax: num(CFG.dropSpeedMax, 680),
      trailLen:     num(CFG.trailLen, 3),
      trailSpacing: num(CFG.trailSpacing, 1),
      splashCountMin: num(CFG.splashCountMin, 5),
      splashCountMax: num(CFG.splashCountMax, 9),
      splashSpeedX: [ num(CFG.splashSpeedXMin, 120), num(CFG.splashSpeedXMax, 260) ],
      splashSpeedY: [ num(CFG.splashSpeedYMin, 220), num(CFG.splashSpeedYMax, 360) ],
      groundMargin: num(CFG.groundMargin, 8),
      maxDrops:     num(CFG.maxDrops, 600),
      maxParticles: num(CFG.maxParticles, 2000),
      palette: {
        bgTop:   str(CFG.bgTop, "#0a0f1f"),
        bgBottom:str(CFG.bgBottom, "#0d1428"),
        rain:    str(CFG.rainColor, "#9fd7ff"),
        foam:    str(CFG.foamColor, "#c9ecff"),
        glare:   str(CFG.glareColor, "#e8f6ff")
      },
      bg: {
        useImage:  bool(CFG.useBgImage, true),
        imageVfs:  str(CFG.bgImageVfs, ""),
        imageUri:  str(CFG.bgImageUri, ""),
        fit:       str(CFG.bgFit, "cover-bottom")
      },
      ui: {
        menuTransparent: bool(CFG.uiMenuTransparent, true),
        menuText: str(CFG.uiMenuText, "#e6f2ff"),
        pillBg: str(CFG.uiPillBg, "#334455"),
        menuBtnText: str(CFG.uiMenuBtnText, "#e6f2ff"),
        fileName: str(CFG.uiFileName, "#e6f2ff"),
        fileIconFilter: str(CFG.uiFileIconFilter, ""),
        fileComment: str(CFG.uiFileComment, "#a8b3c7"),
        fileDate: str(CFG.uiFileDate, "#8ea2bf"),
        fileBg: str(CFG.uiFileBg, "transparent"),
        fileBgAlt: str(CFG.uiFileBgAlt, "transparent"),
        fileHoverBg: str(CFG.uiFileHoverBg, "rgba(255,255,255,0.04)")
      },
      gold: {
        allowed:  bool(CFG.allowGoldMode, false),
        color:    str(CFG.goldColor, "#ffd54d"),
        side:     str(CFG.goldSide, "left"),
        intensity:num(CFG.goldIntensity, 240),
        speed:    num(CFG.goldJetSpeed, 900),
        coneDeg:  num(CFG.goldConeDeg, 7),
        nozzleY:  clamp(num(CFG.goldNozzleY, 0.5), 0, 1),
        insetPx:  num(CFG.goldNozzleInsetPx, 0),
        turbulence: num(CFG.goldTurbulence, 140),
        mouse:    bool(CFG.goldMouseControl, true),
        speedMin: num(CFG.goldSpeedMin, 300),
        speedMax: num(CFG.goldSpeedMax, 1400),
        mouseBoost: num(CFG.goldMouseBoost, 200),
        speedBoost: num(CFG.goldSpeedBoost, 200),
      },
      gust: {
        enabled: bool(CFG.gustEnabled, true),
        strengthMin: num(CFG.gustStrengthMin, 80),
        strengthMax: num(CFG.gustStrengthMax, 220),
        durMin: num(CFG.gustDurMinSec, 10),
        durMax: num(CFG.gustDurMaxSec, 20),
        calmMin: num(CFG.calmDurMinSec, 40),
        calmMax: num(CFG.calmDurMaxSec, 80),
        response: num(CFG.gustResponse, 1.2),
        current: 0, phase: 'calm', t: 0, dur: 0, target: 0
      },
      edgeSpawn: {
        threshold: num(CFG.edgeSpawnThreshold, 60),
        ramp:      num(CFG.edgeSpawnRamp, 200),
        topMin:    clamp(num(CFG.edgeSpawnTopMinShare, 0.25), 0, 1),
        margin:    num(CFG.edgeSpawnMarginPx, 12)
      },
      behavior: {
        startEnabled: bool(CFG.startEnabled, true),
        lockDpr: bool(CFG.lockDpr, false)
      },
      toggle: {
        show: bool(CFG.showToggle, true),
        imgVfs: str(CFG.toggleImageVfs, ""),
        size: num(CFG.toggleSizePx, 40),
        pos: str(CFG.togglePos, "br"),
        remember: bool(CFG.toggleRemember, true)
      }
    };
// v3.7.16 — initial intensity based on screen width: 300px = 10 drops/sec
(function(){
  try {
    var w = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 0);
    var buckets = Math.floor(w / 300);
    var init = Math.max(10, buckets * 10); // minimum 10 to keep rain visible on small screens
    config.intensity = init;
  } catch(e){ /* ignore */ }
})();

    const dctx = display.getContext('2d', { alpha: false });
    dctx.imageSmoothingEnabled = false;
    const px = document.createElement('canvas');
    const pctx = px.getContext('2d', { alpha: false });
    pctx.imageSmoothingEnabled = false;

    // Apply theme
    function applyTheme(){
      const id = "retroRainTheme";
      let el = document.getElementById(id);
      const css = `
:root{
  --rr-menu-text:${config.ui.menuText};
  --rr-pill-bg:${config.ui.pillBg};
  --rr-menu-btn-text:${config.ui.menuBtnText};
  --rr-file-name:${config.ui.fileName};
  --rr-file-comment:${config.ui.fileComment};
  --rr-file-date:${config.ui.fileDate};
  --rr-file-bg:${config.ui.fileBg};
  --rr-file-bg-alt:${config.ui.fileBgAlt};
  --rr-file-hover-bg:${config.ui.fileHoverBg};
}
header, .header, nav, .topbar, .toolbar, header *[class*="bar"], .hfs-topbar {
  ${config.ui.menuTransparent ? "background: transparent !important; backdrop-filter: none !important;" : ""}
  color: var(--rr-menu-text) !important;
}
header button, header .btn, .toolbar button, .toolbar .btn, nav button, nav .btn, .hfs-topbar button, .hfs-topbar .btn,
.breadcrumbs a, .breadcrumbs .btn, .breadcrumbs button,
.path a, .path .btn, .path button,
.pathbar a, .pathbar .btn, .pathbar button,
.address a, .address .btn, .address button,
.crumbs a, .crumbs .btn, .crumbs button
{
  background: var(--rr-pill-bg) !important;
  color: var(--rr-menu-btn-text) !important;
  border-color: transparent !important;
  border-radius: 999px !important;
}
header a, nav a, .toolbar a, .hfs-topbar a { color: var(--rr-menu-text) !important; }
header svg, nav svg, .toolbar svg, .hfs-topbar svg { fill: var(--rr-menu-text) !important; color: var(--rr-menu-text) !important; }

.file, .files .item, .file-row, .listing .row, .files-list .row, [class*="file-row"] { background: var(--rr-file-bg) !important; }
.file:nth-child(even), .files .item:nth-child(even), .file-row:nth-child(even), .listing .row:nth-child(even), .files-list .row:nth-child(even), [class*="file-row"]:nth-child(even) { background: var(--rr-file-bg-alt) !important; }
.file:hover, .files .item:hover, .file-row:hover, .listing .row:hover, .files-list .row:hover, [class*="file-row"]:hover { background: var(--rr-file-hover-bg) !important; }

.file .name, .file .title, .item .name, .row .name, .files .name, a.file, a.filename, [class*="file-name"] { color: var(--rr-file-name) !important; }
.file .comment, .item .comment, .row .comment, .files .comment, [class*="comment"] { color: var(--rr-file-comment) !important; }
.file .date, .item .date, .row .date, .files .date, time, [class*="date"] { color: var(--rr-file-date) !important; }`;
      if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
      if (el.textContent !== css) el.textContent = css;
    }
    applyTheme();

    // Pools
    const drops = [];
    const particles = [];

    // Background
    let bgImg = null;
    const defaultBg = baseUrl ? (baseUrl + 'fon.png') : '';
    const currentBgSrc = () => (config.bg.imageUri || config.bg.imageVfs || defaultBg || '');
    function ensureBg(force=false) {
      const src = currentBgSrc();
      if (!src || !config.bg.useImage) { bgImg = null; return; }
      if (!bgImg) { bgImg = new Image(); }
      if (force || bgImg.src !== src) bgImg.src = src;
    }
    ensureBg(true);

    // Toggle precipitation
    let precipEnabled = true;
    const LS_KEY = "retro_rain_enabled";
    if (config.toggle.remember) {
      try {
        const v = localStorage.getItem(LS_KEY);
        if (v === "0") precipEnabled = false;
        else if (v === "1") precipEnabled = true;
        else precipEnabled = config.behavior.startEnabled;
      } catch(_) { precipEnabled = config.behavior.startEnabled; }
    } else {
      precipEnabled = config.behavior.startEnabled;
    }
    function setPrecip(v){
      const next = !!v;
      if (next === precipEnabled) return;
      precipEnabled = next;
      if (!precipEnabled) { drops.length = 0; particles.length = 0; }
      if (!precipEnabled && mode !== 'rain') {
        mode = 'rain';
        try { layoutSideButtons && layoutSideButtons(); } catch(e) {}
      }
      if (config.toggle.remember) { try { localStorage.setItem(LS_KEY, precipEnabled ? "1" : "0"); } catch(_) {} }
      if (toggleEl) toggleEl.style.opacity = precipEnabled ? "1" : "0.6";
    }

    // Toggle button
    let toggleEl = null;
    if (config.toggle.show) {
      toggleEl = document.getElementById('retroRainToggle');
      if (!toggleEl) {
        toggleEl = document.createElement('div');
        toggleEl.id = 'retroRainToggle';
        const img = document.createElement('img');
        const defaultSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd7ff"/><stop offset="1" stop-color="#5aa9e6"/></linearGradient></defs><path d="M32 6C24 18 18 27 18 34a14 14 0 1028 0c0-7-6-16-14-28z" fill="url(#g)" stroke="#0a0f1f" stroke-width="2"/><path d="M10 54 L54 10" stroke="#ff5555" stroke-width="4" stroke-linecap="round"/></svg>');
        img.src = config.toggle.imgVfs || defaultSvg;
        toggleEl.appendChild(img);
        document.body.appendChild(toggleEl);
      }
      const s = config.toggle.size;
      toggleEl.style.width = s + 'px';
      toggleEl.style.height = s + 'px';
      const pad = 12;
      if (config.toggle.pos === 'br') { toggleEl.style.right = pad+'px'; toggleEl.style.bottom = pad+'px'; toggleEl.style.left=''; toggleEl.style.top=''; }
      else if (config.toggle.pos === 'bl') { toggleEl.style.left = pad+'px'; toggleEl.style.bottom = pad+'px'; toggleEl.style.right=''; toggleEl.style.top=''; }
      else if (config.toggle.pos === 'tr') { toggleEl.style.right = pad+'px'; toggleEl.style.top = pad+'px'; toggleEl.style.left=''; toggleEl.style.bottom=''; }
      else { toggleEl.style.left = pad+'px'; toggleEl.style.top = pad+'px'; toggleEl.style.right=''; toggleEl.style.bottom=''; }
      toggleEl.title = 'Toggle rain';
      toggleEl.style.opacity = precipEnabled ? "1" : "0.6";
      toggleEl.onclick = () => setPrecip(!precipEnabled);
      // Mini-game + Leaderboard buttons (visible only in gold mode; safe if 'mode' not yet defined)
      let miniBtn = document.getElementById('retroMiniBtn');
      let boardBtn = document.getElementById('retroBoardBtn');
      
if (!miniBtn) {
  miniBtn = document.createElement('div');
  miniBtn.id = 'retroMiniBtn';
  miniBtn.style.position = 'fixed';
  miniBtn.style.zIndex = '9999';
  miniBtn.style.cursor = 'pointer';
  miniBtn.style.userSelect = 'none';
  miniBtn.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,.35))';
  const label = document.createElement('div');
  label.textContent = 'Mini game';
  label.style.fontFamily = 'monospace';
  label.style.fontWeight = 'bold';
  label.style.fontSize = '14px';
  label.style.color = '#ffd54d';
  label.style.background = '#2e3344';
  label.style.border = '1px solid #0a0f1f';
  label.style.borderRadius = '6px';
  label.style.padding = '6px 10px';
  label.style.display = 'flex';
  label.style.alignItems = 'center';
  label.style.justifyContent = 'center';
  miniBtn.appendChild(label);
  document.body.appendChild(miniBtn);

      try { miniBtn.style.display = 'none'; } catch(e) {}
}
      // Ensure click handler is bound
      const tryStartGoldMode = () => {
        if (!precipEnabled) return;
        if (config.gold && config.gold.allowed){
          mode = 'gold';
          try { gameStartCountdown && gameStartCountdown(); } catch(e) {}
          try { layoutSideButtons && layoutSideButtons(); } catch(e) {}
        }
      };
      try { miniBtn.onclick = tryStartGoldMode; } catch(e) {}
    

      
if (!boardBtn) {
  boardBtn = document.createElement('div');
  boardBtn.id = 'retroBoardBtn';
  boardBtn.style.position = 'fixed';
  boardBtn.style.zIndex = '9999';
  boardBtn.style.cursor = 'pointer';
  boardBtn.style.userSelect = 'none';
  boardBtn.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,.35))';
  const label2 = document.createElement('div');
  label2.textContent = 'Top 10';
  label2.style.fontFamily = 'monospace';
  label2.style.fontWeight = 'bold';
  label2.style.fontSize = '14px';
  label2.style.color = '#e6f2ff';
  label2.style.background = '#2e3344';
  label2.style.border = '1px solid #0a0f1f';
  label2.style.borderRadius = '6px';
  label2.style.padding = '6px 10px';
  label2.style.display = 'flex';
  label2.style.alignItems = 'center';
  label2.style.justifyContent = 'center';
  boardBtn.appendChild(label2);
  document.body.appendChild(boardBtn);

      try { boardBtn.style.display = 'none'; } catch(e) {}
}
      // Ensure leaderboard click handler is bound
      try { boardBtn.onclick = () => { try { gameShowBoard && gameShowBoard(); } catch(e) {} }; } catch(e) {}
    

      function layoutSideButtons(){
        const s = config.toggle.size;
        const gap = 8;
        if (miniBtn){ miniBtn.style.width = s+'px'; miniBtn.style.height = s+'px'; }
        if (boardBtn){ boardBtn.style.width = s+'px'; boardBtn.style.height = s+'px'; }
        if (config.toggle.pos === 'br') {
          if (miniBtn){ miniBtn.style.right = (12 + s + gap) + 'px'; miniBtn.style.bottom = '12px'; miniBtn.style.left=''; miniBtn.style.top=''; }
          if (boardBtn){ boardBtn.style.right = (12 + 2*s + 2*gap) + 'px'; boardBtn.style.bottom = '12px'; boardBtn.style.left=''; boardBtn.style.top=''; }
        } else if (config.toggle.pos === 'bl') {
          if (miniBtn){ miniBtn.style.left = (12 + s + gap) + 'px'; miniBtn.style.bottom = '12px'; miniBtn.style.right=''; miniBtn.style.top=''; }
          if (boardBtn){ boardBtn.style.left = (12 + 2*s + 2*gap) + 'px'; boardBtn.style.bottom = '12px'; boardBtn.style.right=''; boardBtn.style.top=''; }
        } else if (config.toggle.pos === 'tr') {
          if (miniBtn){ miniBtn.style.right = (12 + s + gap) + 'px'; miniBtn.style.top = '12px'; miniBtn.style.left=''; miniBtn.style.bottom=''; }
          if (boardBtn){ boardBtn.style.right = (12 + 2*s + 2*gap) + 'px'; boardBtn.style.top = '12px'; boardBtn.style.left=''; boardBtn.style.bottom=''; }
        } else {
          if (miniBtn){ miniBtn.style.left = (12 + s + gap) + 'px'; miniBtn.style.top = '12px'; miniBtn.style.right=''; miniBtn.style.bottom=''; }
          if (boardBtn){ boardBtn.style.left = (12 + 2*s + 2*gap) + 'px'; boardBtn.style.top = '12px'; boardBtn.style.right=''; boardBtn.style.bottom=''; }
        }
        // SAFE visibility check (avoid TDZ on 'mode')
        let show = false;
        try {
          show = !!(precipEnabled && config.gold && config.gold.allowed && (mode === 'gold'));
        } catch (e) {
          show = false;
        }
        if (miniBtn) miniBtn.style.display = show ? 'block' : 'none';
        if (boardBtn) boardBtn.style.display = show ? 'block' : 'none';
        if (toggleEl) {
          toggleEl.style.display = show ? 'none' : '';
        }
      }
      layoutSideButtons();
      try { layoutSideButtons(); } catch(e) {}
      window.addEventListener('resize', layoutSideButtons, { passive: true });
      // Game overlay mask to hide HFS UI and intercept inputs
      let gameMask = document.getElementById('retroGameMask');
      let gameExit = document.getElementById('retroGameExit');
      if (!gameMask){
        gameMask = document.createElement('div');
        gameMask.id = 'retroGameMask';
        Object.assign(gameMask.style, { position:'fixed', inset:'0', zIndex:'100001', background:'transparent', display:'none', pointerEvents:'auto' });
        document.body.appendChild(gameMask);
      }
      if (!gameExit){
        gameExit = document.createElement('div');
        gameExit.id = 'retroGameExit';
        Object.assign(gameExit.style, {
          position:'fixed', right:'12px', top:'12px', width:'36px', height:'36px',
          zIndex:'100003', borderRadius:'6px', background:'#7a0d0d', color:'#fff',
          font:'bold 18px monospace', display:'none', alignItems:'center', justifyContent:'center',
          cursor:'pointer', userSelect:'none', boxShadow:'0 2px 6px rgba(0,0,0,.35)'
        });
        gameExit.textContent = '✕';
        document.body.appendChild(gameExit);
      }
      
      function hidePageUI(on){
        try{
          const keepIds = new Set(['retroGameExit','retroMiniBtn','retroBoardBtn']);
          const keepNodes = new Set();
          if (typeof display !== 'undefined' && display) keepNodes.add(display);
          if (typeof px !== 'undefined' && px) keepNodes.add(px);
          const body = document.body;
          for (const el of Array.from(body.children)){
            if (keepNodes.has(el) || keepIds.has(el.id)) continue;
            if (on){
              if (!el.getAttribute('data-retro-hidden')){
                el.setAttribute('data-retro-hidden','1');
                el.style.visibility = 'hidden';
                el.style.pointerEvents = 'none';
              }
            } else {
              if (el.getAttribute('data-retro-hidden')==='1'){
                el.removeAttribute('data-retro-hidden');
                el.style.visibility = '';
                el.style.pointerEvents = '';
              }
            }
          }
        }catch(_){}
      }
function showGameMask(on){
        if (!gameMask || !gameExit) return;
        gameMask.style.display = on ? 'block' : 'none';
        hidePageUI(on);
        gameExit.style.display = on ? 'flex' : 'none';
        try {
          if (display) {
            display.style.position = on ? display.style.position : display.style.position
            display.style.left = on ? display.style.left : display.style.left
            display.style.top = on ? display.style.top : display.style.top
            display.style.zIndex = on ? '100002' : '';
            display.style.pointerEvents = on ? 'auto' : 'none';
          }
        } catch(e) {}
        if (toggleEl) toggleEl.style.display = on ? 'none' : '';
        if (miniBtn) miniBtn.style.display = on ? 'none' : '';
        if (boardBtn) boardBtn.style.display = on ? 'none' : '';
      }
      gameExit.onclick = () => {
        try { gameStop && gameStop(); } catch(e) {}
        game.state = 'idle';
        restoreGoldTweaks();
        resumeNormalRain();
        showGameMask(false);
      };

    
    }

    // Sizes
    
    // ==== Mini Game (Gold mode) ====
const toiletSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 72">
  <defs>
    <linearGradient id="bowl" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f9fbff"/>
      <stop offset="1" stop-color="#cdd8e4"/>
    </linearGradient>
    <linearGradient id="tank" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f5f8ff"/>
      <stop offset="1" stop-color="#c3ceda"/>
    </linearGradient>
  </defs>
  <g stroke="#7d8a96" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
    <path fill="url(#tank)" d="M74 4H94V46H70a8 8 0 0 1-8-8V20a16 16 0 0 1 12-16Z"/>
    <path fill="url(#bowl)" d="M10 20h48c6 0 10 5 10 11v17c0 14-12 24-28 24H24C14 72 6 64 6 54V32c0-7 4-12 10-12Z"/>
    <ellipse fill="#0b0f1e" cx="34" cy="36" rx="16" ry="7"/>
    <path fill="#b0beca" d="M18 62h34c4 0 6 3 6 7v3H12v-3c0-4 2-7 6-7Z"/>
    <rect fill="#b0beca" x="80" y="14" width="6" height="16" rx="2"/>
  </g>
</svg>`;
const toiletSprite = new Image();
toiletSprite.decoding = 'async';
toiletSprite.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(toiletSvg);
const toiletSpriteRatios = {
  viewW: 96,
  viewH: 72,
  opening: {
    left: 20/96,
    top: 20/72,
    width: 34/96,
    height: 16/72
  },
  splashY: 40/72
};

const toiletHitbox = {
  offsetX: 2,
  offsetY: 2,
  widthScale: 1.75,
  heightScale: 1.8,
  show: false
};

let game = {
      state:'idle', score:0, time:0, countdown:0, enterName:'', enterBlink:0,
      board:{ list:[], loading:false, error:false },
      toilet:{
        x: 20, vx: 60,
        w: 90, h: 54,
        sprite: toiletSprite,
        openRatio: toiletSpriteRatios.opening,
        splashYRatio: toiletSpriteRatios.splashY,
        collideTopRatio: 0.35,
        nextDirT: 0, nextSpdT: 0, nextBurstT: 0
      }
    };

    function loadLeaderboard(){
      const boardState = { list:[], loading:true, error:false };
      game.board = boardState;
      serverLoadScores()
        .then(list=>{
          if (game.board !== boardState) return;
          boardState.list = Array.isArray(list)?list:[];
          boardState.loading=false;
        })
        .catch(err=>{
          if (game.board !== boardState) return;
          console.warn('RetroRain leaderboard load failed', err);
          boardState.loading=false;
          boardState.error=true;
        });
      return boardState;
    }

    function gameStartCountdown(){
      game.state='countdown'; game.score=0; game.time=60.0; game.countdown=3.0; game.enterName=''; game.enterBlink=0;
      try { goldIntensityBackup = config.gold.intensity; goldMouseBoostBackup = config.gold.mouseBoost; goldSpeedBoostBackup = config.gold.speedBoost; } catch(_) {}
      config.gold.intensity = 20;
      config.gold.mouseBoost = 20;
      config.gold.speedBoost = Math.max(40, Math.round(config.gold.speedBoost*0.4));
      const minX = 12;
      const maxX = Math.max(minX, pxW - game.toilet.w - 12);
      const span = Math.max(0, maxX - minX);
      game.toilet.x = minX + (span > 0 ? Math.random() * span : 0);
      game.toilet.vx = (Math.random()<0.5?-1:1) * (80 + Math.random()*80);
      game.toilet.nextDirT = 0.6 + Math.random()*2.0;
      game.toilet.nextSpdT = 0.5 + Math.random()*1.5;
      game.toilet.nextBurstT = 1.2 + Math.random()*3.0;
      boostReserve = BOOST_MAX_TIME;
      boostActive = false;
      boostStrength = 0;
    }
    function gameShowBoard(){
      game.state='board';
      loadLeaderboard();
      resumeNormalRain();
      restoreGoldTweaks();
    }
    function gameUpdate(dt){
      if (game.state==='countdown'){ game.countdown -= dt; if (game.countdown <= 0){ game.state='running'; } return; }
      if (game.state!=='running') return;
      const t=game.toilet; t.nextDirT-=dt; t.nextSpdT-=dt; t.nextBurstT-=dt;
      if (t.nextDirT<=0){ t.vx *= (Math.random()<0.5?-1:1); t.nextDirT = 0.8 + Math.random()*2.0; }
      if (t.nextSpdT<=0){ const s = 60 + Math.random()*160; t.vx = Math.sign(t.vx) * s; t.nextSpdT = 0.6 + Math.random()*1.4; }
      if (t.nextBurstT<=0){ const mul=1.8+Math.random()*1.4; t.vx*=mul; setTimeout(()=>{ t.vx/=mul; }, 250+(Math.random()*200|0)); t.nextBurstT = 1.0 + Math.random()*3.0; }
      t.x += t.vx * dt; const minX=6, maxX=Math.max(6, pxW - t.w - 6);
      if (t.x<minX){ t.x=minX; t.vx=Math.abs(t.vx); } if (t.x>maxX){ t.x=maxX; t.vx=-Math.abs(t.vx); }
      game.time -= dt;
      if (game.time<=0){
        game.time=0;
        game.state='enter';
        loadLeaderboard();
        resumeNormalRain();
        restoreGoldTweaks();
        return;
      }
    }
    function gameRegisterHit(){ if (game.state==='running') game.score++; }

    function getToiletSpriteRect(){
      if (!game || !game.toilet) return null;
      const t = game.toilet;
      return {
        left: t.x,
        top: groundY - t.h,
        right: t.x + t.w,
        bottom: groundY
      };
    }

    function getToiletBounds(){
      const spriteRect = getToiletSpriteRect();
      if (!spriteRect) return null;
      if (!game || !game.toilet) return null;
      const t = game.toilet;
      const clip = clamp(typeof t.collideTopRatio === 'number' ? t.collideTopRatio : 0, 0, 0.95);
      const top = spriteRect.top + clip * t.h;
      return { left: spriteRect.left, top, right: spriteRect.right, bottom: spriteRect.bottom };
    }

    function applyToiletHitboxAdjust(rect){
      if (!rect || !toiletHitbox) return rect;
      const hb = toiletHitbox;
      const sx = (typeof hb.widthScale === 'number') ? hb.widthScale : 1;
      const sy = (typeof hb.heightScale === 'number') ? hb.heightScale : 1;
      const w = Math.max(1, (rect.right - rect.left) * sx);
      const h = Math.max(1, (rect.bottom - rect.top) * sy);
      const cx = (rect.left + rect.right) / 2 + (hb.offsetX || 0);
      const cy = (rect.top + rect.bottom) / 2 + (hb.offsetY || 0);
      const left = cx - w / 2;
      const top = cy - h / 2;
      return { left, top, right: left + w, bottom: top + h };
    }

    function getToiletOpeningRect(){
      const spriteRect = getToiletSpriteRect();
      if (!spriteRect || !game || !game.toilet) return null;
      const t = game.toilet;
      const flip = (typeof goldSide!=='undefined' ? (goldSide==='right') : false);
      const ratio = t.openRatio;
      if (ratio && typeof ratio.left === 'number') {
        const width = (ratio.width || 0.3) * t.w;
        const height = (ratio.height || 0.18) * t.h;
        const baseLeft = ratio.left * t.w;
        const left = flip
          ? spriteRect.left + (t.w - baseLeft - width)
          : spriteRect.left + baseLeft;
        const top = spriteRect.top + ratio.top * t.h;
        return applyToiletHitboxAdjust({ left, top, right: left + width, bottom: top + height });
      }
      const offsetX = (typeof t.openOffsetX === 'number') ? t.openOffsetX : ((t.w - (t.openW || t.w * 0.4)) / 2);
      const offsetY = (typeof t.openOffsetY === 'number') ? t.openOffsetY : Math.max(2, t.h * 0.25);
      const openW = t.openW || t.w * 0.4;
      const openH = t.openH || t.h * 0.2;
      const left = flip ? (spriteRect.left + (t.w - offsetX - openW)) : (spriteRect.left + offsetX);
      const top = spriteRect.top + offsetY;
      return applyToiletHitboxAdjust({ left, top, right: left + openW, bottom: top + openH });
    }

    function handleToiletCollision(drop){
      if (!drop || !game || game.state!=='running') return false;
      const bounds = getToiletBounds();
      const spriteRect = getToiletSpriteRect();
      if (!bounds || !spriteRect) return false;
      const xx = drop.x;
      const yy = drop.y;
      if (xx < bounds.left || xx > bounds.right || yy < bounds.top || yy > bounds.bottom) return false;
      const opening = getToiletOpeningRect();
      const t = game.toilet;
      let hitOpening = false;
      if (opening) {
        const tol = 1.5;
        hitOpening = (
          xx >= opening.left - tol &&
          xx <= opening.right + tol &&
          yy >= opening.top - tol &&
          yy <= opening.bottom + tol
        );
      }
      if (hitOpening) {
        gameRegisterHit();
      }
      const splashPivot = (typeof t.splashYRatio === 'number')
        ? Math.min(bounds.bottom - 2, spriteRect.top + t.h * t.splashYRatio)
        : (opening ? opening.bottom : (bounds.bottom - 2));
      const splashBase = hitOpening
        ? splashPivot
        : Math.min(bounds.bottom - 1, Math.max(bounds.top + 2, yy));
      explode(xx, splashBase);
      return true;
    }

    function gameDrawToilet(){
      const t=game.toilet; const x=t.x|0, w=t.w|0, h=t.h|0; const bowlTop=(groundY-h)|0;
      const opening = getToiletOpeningRect();
      const sprite = t && t.sprite;
      const flip = (typeof goldSide!=='undefined' ? (goldSide==='right') : false);
      if (sprite && sprite.complete) {
        pctx.save();
        if (flip) {
          pctx.scale(-1, 1);
          pctx.drawImage(sprite, -(x + w), bowlTop, w, h);
        } else {
          pctx.drawImage(sprite, x, bowlTop, w, h);
        }
        pctx.restore();
      } else {
        // fallback simple bowl
        pctx.fillStyle = '#d7e0e9';
        for (let yy=bowlTop; yy<groundY; yy++) { for (let xx=x; xx<x+w; xx++) pctx.fillRect(xx, yy, 1, 1); }
      }
      if (opening && toiletHitbox && toiletHitbox.show) {
        const ox = Math.round(opening.left);
        const oy = Math.round(opening.top);
        const oW = Math.max(1, Math.round(opening.right - opening.left));
        const oH = Math.max(1, Math.round(opening.bottom - opening.top));
        pctx.save();
        pctx.strokeStyle = '#ff5ef1';
        pctx.setLineDash([2, 2]);
        pctx.strokeRect(ox + 0.5, oy + 0.5, oW - 1, oH - 1);
        pctx.restore();
      }
    }
    function renderLeaderboardOverlay(opts={}){
      const board = game.board || { list:[], loading:false, error:false };
      const heading = opts.heading || 'ТАБЛИЦА ЛИДЕРОВ (ТОП 10)';
      const headingY = (typeof opts.headingY === 'number') ? opts.headingY : 80;
      const lineHeight = opts.lineHeight || 28;
      const titleSize = opts.headingFontSize || 32;
      const bodySize = opts.bodyFontSize || 24;
      const color = opts.color || '#e6f2ff';
      dctx.fillStyle = color;
      dctx.textAlign = 'center';
      dctx.font = `bold ${titleSize}px monospace`;
      dctx.fillText(heading, display.width/2, headingY);
      dctx.font = `bold ${bodySize}px monospace`;
      const baseY = headingY + lineHeight;
      if (board.loading) {
        dctx.fillText('Загрузка рекордов...', display.width/2, baseY);
      } else if (board.error) {
        dctx.fillText('Таблица недоступна', display.width/2, baseY);
      } else {
        const list = Array.isArray(board.list) ? board.list : [];
        if (!list.length) {
          dctx.fillText('Пока нет записей', display.width/2, baseY);
        } else {
            for (let i=0;i<Math.min(10,list.length);i++){
              const entry = list[i] || {};
              const name = String(entry.name || 'PLAYER').padEnd(6,' ');
            const score = typeof entry.score === 'number' ? entry.score : 0;
            const row = (i+1)+'. '+name+'  '+score;
            dctx.fillText(row, display.width/2, baseY + i*lineHeight);
          }
        }
      }
    }

    function drawBoostIndicator(baseY){
      if (!config.gold.allowed || mode !== 'gold') return;
      if (!game || game.state !== 'running') return;
      const ratio = clamp(boostReserve / Math.max(BOOST_MAX_TIME, 0.0001), 0, 1);
      const panelWidth = Math.min(240, display.width * 0.35);
      const panelHeight = 72;
      const sideLeft = (typeof goldSide !== 'undefined') ? (goldSide === 'left') : true;
      const pad = 24;
      const x = sideLeft ? pad : (display.width - pad - panelWidth);
      const maxY = display.height - panelHeight - 20;
      const y = Math.min(maxY, baseY);
      dctx.save();
      dctx.fillStyle = 'rgba(9, 9, 20, 0.88)';
      dctx.strokeStyle = '#ffa726';
      dctx.lineWidth = 3;
      dctx.shadowColor = 'rgba(255, 167, 38, 0.5)';
      dctx.shadowBlur = 14;
      dctx.fillRect(x, y, panelWidth, panelHeight);
      dctx.shadowBlur = 0;
      dctx.strokeRect(x, y, panelWidth, panelHeight);
      dctx.fillStyle = '#ffa726';
      dctx.textAlign = 'center';
      dctx.font = '700 18px monospace';
      dctx.fillText('Поднатужиться', x + panelWidth / 2, y + 26);
      const barX = x + 18;
      const barY = y + panelHeight - 28;
      const barW = panelWidth - 36;
      const barH = 16;
      dctx.fillStyle = 'rgba(255,255,255,0.1)';
      dctx.fillRect(barX, barY, barW, barH);
      const fillW = Math.max(0, barW * ratio);
      const grad = dctx.createLinearGradient(barX, barY, barX + barW, barY);
      grad.addColorStop(0, '#ffd180');
      grad.addColorStop(1, '#ff6f00');
      dctx.fillStyle = grad;
      dctx.fillRect(barX, barY, fillW, barH);
      dctx.strokeStyle = 'rgba(255,255,255,0.35)';
      dctx.lineWidth = 2;
      dctx.strokeRect(barX, barY, barW, barH);
      dctx.restore();
    }

    function gameDrawOverlay(){
      if (game.state==='countdown'){ dctx.save(); dctx.fillStyle='rgba(0,0,0,0.35)'; dctx.fillRect(0,0,display.width,display.height);
        dctx.fillStyle='#ffd54d'; dctx.textAlign='center'; dctx.textBaseline='middle'; dctx.font='bold '+Math.floor(display.height*0.25)+'px monospace';
        const v=Math.ceil(Math.max(0,game.countdown)); const txt=(v>0)?String(v):'START'; dctx.fillText(txt, display.width/2, display.height/2); dctx.restore(); }
      else if (game.state==='running'){
        dctx.save();
        const marginTop = Math.max(48, display.height * 0.08);
        const hudWidth = Math.min(display.width * 0.7, 520);
        const hudHeight = 120;
        const hudX = (display.width - hudWidth) / 2;
        const hudY = marginTop;
        const panelGradient = dctx.createLinearGradient(hudX, hudY, hudX, hudY + hudHeight);
        panelGradient.addColorStop(0, 'rgba(8,12,30,0.95)');
        panelGradient.addColorStop(1, 'rgba(18,20,46,0.8)');
        dctx.shadowColor = '#00f7ff';
        dctx.shadowBlur = 18;
        dctx.fillStyle = panelGradient;
        dctx.fillRect(hudX, hudY, hudWidth, hudHeight);
        dctx.shadowBlur = 0;
        dctx.lineWidth = 4;
        dctx.strokeStyle = '#00eaff';
        dctx.strokeRect(hudX + 2, hudY + 2, hudWidth - 4, hudHeight - 4);
        dctx.fillStyle = '#00e1ff';
        dctx.fillRect(hudX + 18, hudY + hudHeight - 14, hudWidth - 36, 3);
        dctx.fillStyle = '#f5fbff';
        dctx.textAlign = 'center';
        dctx.font = `900 ${Math.min(48, hudHeight * 0.42)}px monospace`;
        const scoreText = `СЧЁТ ${String(game.score).padStart(3,'0')}`;
        dctx.fillText(scoreText, display.width / 2, hudY + hudHeight * 0.47);
        dctx.fillStyle = '#ffd54d';
        dctx.font = `900 ${Math.min(54, hudHeight * 0.5)}px monospace`;
        const timeVal = Math.max(0, Math.ceil(game.time));
        const timeText = `ВРЕМЯ ${String(timeVal).padStart(2,'0')}с`;
        dctx.fillText(timeText, display.width / 2, hudY + hudHeight * 0.85);
        drawBoostIndicator(hudY + hudHeight + 20);
        dctx.restore();
      }
      else if (game.state === 'enter') {
        dctx.save();
        dctx.fillStyle='rgba(0,0,0,0.55)';
        dctx.fillRect(0,0,display.width,display.height);
        dctx.fillStyle='#ffd54d';
        dctx.textAlign='center';
        dctx.font='bold 34px monospace';
        dctx.fillText(`ВАШ СЧЁТ: ${game.score}`, display.width/2, display.height*0.22);
        dctx.font='bold 28px monospace';
        dctx.fillText('Введите имя (A–Z, 0–9, до 6 символов):', display.width/2, display.height*0.28);
        dctx.font='bold 48px monospace';
        const blink=((game.enterBlink%1)<0.5)? '_' : ' ';
        dctx.fillText(game.enterName+blink, display.width/2, display.height*0.38);
        dctx.font='bold 18px monospace';
        dctx.fillStyle='#e6f2ff';
        dctx.fillText('Enter — сохранить, Esc — пропустить', display.width/2, display.height*0.44);
        renderLeaderboardOverlay({
          heading:'ТАБЛИЦА ЛИДЕРОВ (ТОП 10)',
          headingY: display.height*0.6,
          lineHeight: 24,
          headingFontSize: 26,
          bodyFontSize: 20
        });
        dctx.restore();
      }
      else if (game.state==='board'){
        dctx.save();
        dctx.fillStyle='rgba(0,0,0,0.6)';
        dctx.fillRect(0,0,display.width,display.height);
        renderLeaderboardOverlay({ headingY: 80 });
        dctx.restore();
      }
    }
    // buttons events
    if (typeof miniBtn!=='undefined' && miniBtn) miniBtn.onclick = ()=>{ if (!precipEnabled) return; if (config.gold && config.gold.allowed){ mode='gold'; gameStartCountdown(); layoutSideButtons(); } };
    if (typeof boardBtn!=='undefined' && boardBtn) boardBtn.onclick = ()=>{ gameShowBoard(); };

    let pxW = 0, pxH = 0, groundY = 0;
    function resize() {
      const cssW = Math.max(1, Math.floor(window.innerWidth));
      const cssH = Math.max(1, Math.floor(window.innerHeight));
      const dpr0 = (window.devicePixelRatio || 1);
      const dprTarget = Math.max(1, Math.min(2, dpr0));
      const dprFinal = config.behavior.lockDpr ? 1 : dprTarget;
      display.width  = cssW * dprFinal;
      display.height = cssH * dprFinal;
      display.style.width = cssW + 'px';
      display.style.height = cssH + 'px';
      pxW = Math.max(64, Math.floor(cssW / config.pixelSize));
      pxH = Math.max(36, Math.floor(cssH / config.pixelSize));
      px.width = pxW;
      px.height = pxH;
      groundY = pxH - config.groundMargin;
      dctx.imageSmoothingEnabled = false;
      pctx.imageSmoothingEnabled = false;
    }
    resize();
    let resizeQueued = false;
    window.addEventListener('resize', () => {
      if (resizeQueued) return;
      resizeQueued = true;
      requestAnimationFrame(() => { resizeQueued = false; resize(); applyTheme(); });
    }, { passive: false, capture: true });

    // Mouse
        // Mouse
    const mouse = { x: 0, y: 0, has: false };
    let leftDown = false;
    let goldBoost = 0;
    const BOOST_MAX_TIME = 1;
    const BOOST_RECOVER_TIME = 2;
    const BOOST_INTENSITY_FULL = 40;
    const BOOST_SPEED_FULL = 60;
    let boostReserve = BOOST_MAX_TIME;
    let boostActive = false;
    let boostStrength = 0;
    let mouseWind = 0;
    let mouseWindHoldSec = 0;
    let lastClientX = 0;
    function toPxSpace(clientX, clientY){
      return { x: clientX / config.pixelSize, y: clientY / config.pixelSize };
    }
    window.addEventListener('mousemove', (e) => {
      const dx = (typeof e.movementX === 'number') ? e.movementX : (e.clientX - lastClientX);
      lastClientX = e.clientX;
      const p = toPxSpace(e.clientX, e.clientY);
      mouse.x = p.x; mouse.y = p.y; mouse.has = true;
      if (leftDown && mode === 'rain') {
        mouseWind += dx * 12;
        if (mouseWind > 300) mouseWind = 300; else if (mouseWind < -300) mouseWind = -300;
      }
    }, { passive: false, capture: true });
    window.addEventListener('mouseleave', () => { mouse.has = false; }, { passive: false, capture: true });
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        leftDown = true;
      }
    }, { passive: false, capture: true });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) { leftDown = false; goldBoost = 0; mouseWindHoldSec = 1.0; }
    }, { passive: false, capture: true });


    // Mode
    let mode = 'rain';
    let goldIntensityBackup=null, goldMouseBoostBackup=null, goldSpeedBoostBackup=null;

    function restoreGoldTweaks(){
      try {
        if (goldIntensityBackup!=null) { config.gold.intensity = goldIntensityBackup; }
        if (goldMouseBoostBackup!=null) { config.gold.mouseBoost = goldMouseBoostBackup; }
        if (goldSpeedBoostBackup!=null) { config.gold.speedBoost = goldSpeedBoostBackup; }
      } catch(_){}
      goldIntensityBackup = null;
      goldMouseBoostBackup = null;
      goldSpeedBoostBackup = null;
    }

    function resumeNormalRain(){
      if (mode !== 'rain') {
        mode = 'rain';
        try { layoutSideButtons && layoutSideButtons(); } catch(e) {}
      }
    }

    try { layoutSideButtons && layoutSideButtons(); } catch(e) {}
    try { layoutSideButtons && layoutSideButtons(); } catch(e) {}
    let goldSide = String(CFG.goldSide || 'left');
    let spawnAcc = 0;
    let jetSpawnAcc = 0;

    const rnd = (min, max) => Math.random() * (max - min) + min;
    const rndi = (min, max) => (Math.random() * (max - min + 1) + min) | 0;
    const sign = () => (Math.random() < 0.5 ? -1 : 1);

    function pick(a,b){ return rnd(a, Math.max(a,b)); }
    function effectiveWind(){ return config.wind + (config.gust.enabled ? config.gust.current : 0); }
    function updateGust(dt){
      if (!config.gust.enabled) { config.gust.current = 0; return; }
      if (config.gust.phase === 'calm') {
        config.gust.t -= dt;
        if (config.gust.t <= 0) {
          config.gust.phase = 'gust';
          config.gust.dur = pick(config.gust.durMin, config.gust.durMax);
          config.gust.t = config.gust.dur;
          config.gust.target = sign() * pick(config.gust.strengthMin, config.gust.strengthMax);
        }
        config.gust.current = 0;
      } else {
        config.gust.t -= dt;
        const p = 1 - Math.max(0, config.gust.t) / Math.max(0.0001, config.gust.dur);
        const shape = Math.sin(Math.PI * p);
        config.gust.current = config.gust.target * shape;
        if (config.gust.t <= 0) {
          config.gust.phase = 'calm';
          config.gust.t = pick(config.gust.calmMin, config.gust.calmMax);
          config.gust.target = 0;
          config.gust.current = 0;
        }
      }
    }
    config.gust.phase = 'calm';
    config.gust.t = pick(config.gust.calmMin, config.gust.calmMax);

    function updateBoostMeter(dt){
      const regenRate = BOOST_MAX_TIME / Math.max(BOOST_RECOVER_TIME, 0.001);
      const clampReserve = (v) => Math.max(0, Math.min(BOOST_MAX_TIME, v));
      if (!config.gold.allowed || mode !== 'gold') {
        boostActive = false;
        boostStrength = 0;
        boostReserve = clampReserve(boostReserve + regenRate * dt);
        goldBoost = 0;
        return;
      }
      if (!game || game.state !== 'running') {
        boostReserve = BOOST_MAX_TIME;
        boostActive = leftDown;
        boostStrength = boostActive ? 1 : 0;
        goldBoost = boostActive ? BOOST_INTENSITY_FULL : 0;
        return;
      }
      const epsilon = 0.001;
      const isBarFull = boostReserve >= BOOST_MAX_TIME - epsilon;
      const wantBoost = leftDown && boostReserve > 0;
      const wasActive = boostActive;
      if (wantBoost) {
        boostActive = true;
        if (!wasActive) {
          boostStrength = isBarFull ? 1 : 0.5;
        }
        boostReserve = clampReserve(boostReserve - dt);
        if (boostReserve <= 0) {
          boostReserve = 0;
          boostActive = false;
          boostStrength = 0;
        }
      } else {
        boostActive = false;
        boostStrength = 0;
        if (!leftDown) {
          boostReserve = clampReserve(boostReserve + regenRate * dt);
        }
      }
      const intensityBonus = boostActive
        ? (boostStrength >= 1 ? BOOST_INTENSITY_FULL : BOOST_INTENSITY_FULL / 2)
        : 0;
      goldBoost = intensityBonus;
    }

    // Spawning
    function spawnDrop() {
      if (drops.length >= config.maxDrops) return;
      const envWind = effectiveWind();
      const m = config.edgeSpawn.margin;
      const absW = Math.abs(envWind);
      const sideLeft = envWind > 0; // wind to right => upwind is left
      const useSideW = absW >= config.edgeSpawn.threshold;

      // Wind factor 0..1
      const t = useSideW ? Math.min(1, (absW - config.edgeSpawn.threshold) / Math.max(1, config.edgeSpawn.ramp)) : 0;

      // Split without increasing total: at max wind side share = maxShare; top share keeps at least topMin
      const sideShare = Math.min(config.edgeSpawn.maxShare || 0.5, t * (config.edgeSpawn.maxShare || 0.5));
      const topShare  = Math.max(config.edgeSpawn.topMin, 1 - sideShare);
      const useSide = (Math.random() > topShare); // derive from topShare to ensure exact complement

      let x, y, vx, vy;
      if (useSide) {
        const extra = Math.random() * Math.max(0, config.edgeSpawn.extraDist || 0);
        const jitter = (Math.random() - 0.5) * (config.edgeSpawn.jitter || 0);
        x = sideLeft ? (-m - extra + jitter) : (pxW + m + extra + jitter);
        y = Math.random() * pxH; // uniform along the whole edge
        vy = rnd(config.dropSpeedMin, config.dropSpeedMax);
        vx = envWind + rnd(-10, 10);
      } else {
        x = rnd(-m, pxW + m); // uniform across entire width + margins
        y = -m;               // always a bit above the top edge
        vy = rnd(config.dropSpeedMin, config.dropSpeedMax);
        vx = envWind + rnd(-10, 10);
      }
      drops.push({ x, y, vx, vy });
    }function spawnGoldJet() {
      if (drops.length >= config.maxDrops) return;
      const sideLeft = goldSide === 'left';
      const y0 = Math.max(0, Math.min(pxH-1, Math.floor(pxH * config.gold.nozzleY)));
      const x0 = sideLeft ? Math.max(-2, -2 + config.gold.insetPx) : Math.min(pxW + 2, pxW + 2 - config.gold.insetPx);
      let dir, speed;
      if (config.gold.mouse && mouse.has) {
        const dx = mouse.x - x0;
        const dy = mouse.y - y0;
        dir = Math.atan2(dy, dx);
        const dist = Math.hypot(dx, dy);
        const diag = Math.hypot(pxW, pxH);
        const t = clamp(dist / Math.max(1, diag), 0, 1);
        speed = config.gold.speedMin + t * (config.gold.speedMax - config.gold.speedMin);
      } else {
        const baseAngle = sideLeft ? 0 : Math.PI;
        const downAngle = Math.PI / 10;
        dir = baseAngle + (sideLeft ? 1 : -1) * downAngle;
        speed = config.gold.speed;
      }
            if (boostActive) {
              const baseBoost = (game && game.state==='running')
                ? Math.max(40, Math.round(config.gold.speedBoost*0.3))
                : config.gold.speedBoost;
              const bonusSpeed = (boostStrength >= 1 ? BOOST_SPEED_FULL : BOOST_SPEED_FULL / 2);
              speed += baseBoost + bonusSpeed;
            }
const coneBase = deg2rad(config.gold.coneDeg);
      const cone = (game && game.state==='running') ? (coneBase*0.6) : coneBase;
      dir += rnd(-cone, cone);
      const vx = Math.cos(dir) * speed;
      const vy = Math.sin(dir) * speed;
      drops.push({ x: x0, y: y0, vx, vy, gold: true });
    }

    function explode(x, y) {
      const count = rndi(config.splashCountMin, config.splashCountMax);
      for (let i = 0; i < count && particles.length < config.maxParticles; i++) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        const vx = dir * rnd(config.splashSpeedX[0], config.splashSpeedX[1]);
        const vy = -rnd(config.splashSpeedY[0], config.splashSpeedY[1]) * 0.9;
        const life = rnd(0.28, 0.5);
        particles.push({ x, y, vx, vy, life, age: 0 });
      }
      if (particles.length < config.maxParticles - 4) {
        const glow = 4;
        for (let i = -glow; i <= glow; i++) {
          particles.push({ x: x + i * 0.6, y: y - 1, vx: 0, vy: -rnd(40, 90), life: 0.12, age: 0, glow: true });
        }
      }
    }

    function update(dt) {
      gameUpdate(dt);
      game.enterBlink += dt;
      updateBoostMeter(dt);

      // decay mouse-induced wind
      if (leftDown) {
        // no decay while controlling
      } else if (mouseWindHoldSec > 0) {
        mouseWindHoldSec -= dt; if (mouseWindHoldSec < 0) mouseWindHoldSec = 0;
      } else {
        mouseWind *= Math.exp(-0.6 * dt); // slow decay
      }

      updateGust(dt);
      const envWind = effectiveWind() + (mode === 'rain' ? mouseWind : 0);

      if (mode === 'rain' || !config.gold.allowed) {
        spawnAcc += config.intensity * dt;
        const toSpawn = spawnAcc | 0;
        spawnAcc -= toSpawn;
        for (let i = 0; i < toSpawn; i++) spawnDrop();
      } else {
        jetSpawnAcc += (config.gold.intensity + goldBoost) * dt;
        const toSpawn = jetSpawnAcc | 0;
        jetSpawnAcc -= toSpawn;
        for (let i = 0; i < toSpawn; i++) spawnGoldJet();
      }

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        if (!d.gold) {
          d.vx += (envWind - d.vx) * clamp(config.gust.response, 0, 10) * dt;
        } else {
          const T = config.gold.turbulence;
          if (T > 0) {
            d.vx += (Math.random()*2 - 1) * T * dt;
            d.vy += (Math.random()*2 - 1) * (T * 0.3) * dt;
          }
        }
        d.vy += config.gravity * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;

        if (d.gold && handleToiletCollision(d)) {
          drops[i] = drops[drops.length - 1]; drops.pop();
          continue;
        }

        if (d.x < -20 - config.edgeSpawn.margin || d.x > pxW + 20 + config.edgeSpawn.margin || d.y > groundY + 3) {
          if (d.y >= groundY) explode(d.x, groundY);
          drops[i] = drops[drops.length - 1];
          drops.pop();
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age += dt;
        if (p.age >= p.life) {
          particles[i] = particles[particles.length - 1];
          particles.pop();
          continue;
        }
        p.vy += config.gravity * 1.1 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.y >= groundY + 1) {
          particles[i] = particles[particles.length - 1];
          particles.pop();
        }
      }
    }

    function drawBackground() {
      if (config.bg.useImage && currentBgSrc()) {
        ensureBg();
        const iw = (bgImg && (bgImg.naturalWidth || bgImg.width)) || 0;
        const ih = (bgImg && (bgImg.naturalHeight || bgImg.height)) || 0;
        if (iw && ih) {
          const canvasRatio = pxW / pxH;
          const imgRatio = iw / ih;
          let dw=pxW, dh=pxH, sx=0, sy=0, sw=iw, sh=ih;
          if (imgRatio > canvasRatio) { sh = ih; sw = ih*canvasRatio; sx = (iw - sw)/2; }
          else {
            sw = iw; sh = iw/canvasRatio;
            const anchor = (config.bg.fit === 'cover-bottom') ? 'bottom' : (config.bg.fit === 'cover-top' ? 'top' : 'center');
            if (anchor === 'bottom') sy = ih - sh;
            else if (anchor === 'top') sy = 0;
            else sy = (ih - sh)/2;
          }
          pctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, pxW, pxH);
          return;
        }
      }
      const g = pctx.createLinearGradient(0, 0, 0, pxH);
      g.addColorStop(0, config.palette.bgTop);
      g.addColorStop(1, config.palette.bgBottom);
      pctx.fillStyle = g;
      pctx.fillRect(0, 0, pxW, pxH);
      pctx.globalAlpha = 0.06;
      pctx.fillStyle = '#000';
      for (let y = 0; y < pxH; y += 2) pctx.fillRect(0, y, pxW, 1);
      pctx.globalAlpha = 1;
    }

    function draw() {
      pctx.fillStyle = (mode === 'gold') ? config.gold.color : config.palette.rain;
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        const len = Math.hypot(d.vx, d.vy) || 1;
        const ux = (d.vx / len) * config.trailSpacing;
        const uy = (d.vy / len) * config.trailSpacing;
        for (let t = 0; t < config.trailLen; t++) {
          const xx = (d.x - ux * t) | 0;
          const yy = (d.y - uy * t) | 0;
          if (yy >= 0 && yy < pxH && xx >= 0 && xx < pxW) pctx.fillRect(xx, yy, 1, 1);
        }
      }
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const xx = p.x | 0, yy = p.y | 0;
        if (yy < 0 || yy >= pxH || xx < 0 || xx >= pxW) continue;
        const fade = 1 - (p.age / p.life);
        pctx.globalAlpha = Math.max(0.25, fade);
        pctx.fillStyle = p.glow
          ? config.palette.glare
          : (mode === 'gold' ? config.gold.color : (fade > 0.5 ? config.palette.foam : config.palette.rain));
        pctx.fillRect(xx, yy, 1, 1);
      }
      pctx.globalAlpha = 1;
      pctx.globalAlpha = 0.12;
      pctx.fillStyle = '#cde7ff';
      pctx.fillRect(0, groundY + 1, pxW, 1);
      pctx.globalAlpha = 1;
    }

    function blitToScreen() {
      dctx.clearRect(0, 0, display.width, display.height);
      dctx.drawImage(px, 0, 0, pxW, pxH, 0, 0, display.width, display.height);
    }

    function frame(now) {
      const dt = Math.min(0.04, (now - (frame._last||now)) / 1000);
      frame._last = now;
      drawBackground();
      if (precipEnabled) { update(dt); draw(); }
      else { updateGust(dt); }
      if (game && game.state === 'running') { try { gameDrawToilet && gameDrawToilet(); } catch(e) {} }
      blitToScreen();
      gameDrawOverlay();
      try { showGameMask && showGameMask(game && game.state && game.state !== 'idle'); } catch(e) {}
      try { layoutSideButtons && layoutSideButtons(); } catch(e) {}
      requestAnimationFrame(frame);
    }

    window.addEventListener('keydown', (e) => {
      
      
      
      // --blockArrows during game
      if (typeof game !== 'undefined' && game && game.state === 'running') {
        if (e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
          e.preventDefault(); e.stopPropagation(); return;
        }
      }
if (typeof game !== 'undefined' && game && game.state === 'running') {
        if (e.code === 'ArrowUp' || e.code === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); return; }
      }
// Mini‑game name entry capture
      if (typeof game !== 'undefined' && game && game.state === 'enter') {
        if (e.key === 'Enter') {
          const upper = game.enterName.trim().toUpperCase();
          const sanitized = upper.replace(/[^A-Z0-9]/g, '');
          const name = (sanitized.slice(0,6) || 'PLAYER');
          game.state = 'board';
          const boardState = { list: [], loading: true, error: false };
          game.board = boardState;
          serverSaveScore(name, game.score).then(list => {
            if (game.board !== boardState) return;
            try { boardState.list = Array.isArray(list) ? list : []; } catch(_) { boardState.list = []; }
            boardState.loading = false;
          }).catch(err => {
            if (game.board !== boardState) return;
            console.warn('RetroRain leaderboard save failed', err);
            boardState.loading = false;
            boardState.error = true;
          });
          resumeNormalRain();
          restoreGoldTweaks();
          return;
        } else if (e.key === 'Escape') {
          game.state = 'board';
          loadLeaderboard();
          resumeNormalRain();
          restoreGoldTweaks();
          return;
        } else if (e.key === 'Backspace') {
          game.enterName = game.enterName.slice(0, -1); return;
        } else {
          const raw = (e.key || '').trim();
          if (raw.length === 1) {
            const ch = raw.toUpperCase();
            if (/^[A-Z0-9]$/.test(ch) && game.enterName.length < 6) { game.enterName += ch; return; }
          }
        }
} else if (typeof game !== 'undefined' && game && game.state === 'board') {
        if (e.key === 'Escape') {
          game.state = 'idle';
          restoreGoldTweaks();
          resumeNormalRain();
          return;
        }
      }
if (e.code === 'ArrowUp') {
        if (config.gold.allowed && mode === 'gold') { config.gold.intensity = Math.min(800, config.gold.intensity + 10); }
        else { config.intensity = Math.min(500, config.intensity + 10); }
      } else if (e.code === 'ArrowDown') {
        if (config.gold.allowed && mode === 'gold') { config.gold.intensity = Math.max(0, config.gold.intensity - 10); }
        else { config.intensity = Math.max(0, config.intensity - 10); }
      } else if (e.code === 'ArrowLeft') {
        if (precipEnabled && config.gold.allowed) {
          if (mode === 'gold' && goldSide === 'left') { mode = 'rain'; layoutSideButtons(); }
          else { goldSide = 'left'; mode = 'gold'; layoutSideButtons(); }
        }
      } else if (e.code === 'ArrowRight') {
        if (precipEnabled && config.gold.allowed) {
          if (mode === 'gold' && goldSide === 'right') { mode = 'rain'; layoutSideButtons(); }
          else { goldSide = 'right'; mode = 'gold'; layoutSideButtons(); }
        }
      }
    }, { passive: false, capture: true });
    // Mouse wheel: adjust intensity like ArrowUp/ArrowDown (step 10)
    window.addEventListener('wheel', (e) => {
      
      if (typeof game !== 'undefined' && game && game.state === 'running') { e.preventDefault(); e.stopPropagation(); return; }
const step = 10;
      const dir = (e.deltaY < 0) ? 1 : -1; // wheel up -> increase
      if (config.gold.allowed && mode === 'gold') {
        config.gold.intensity = Math.max(0, Math.min(800, config.gold.intensity + dir * step));
      } else {
        config.intensity = Math.max(0, Math.min(500, config.intensity + dir * step));
      }
    }, { passive: false, capture: true });


    try { layoutSideButtons && layoutSideButtons(); } catch(e) {}
      requestAnimationFrame(frame);
  })();
}
