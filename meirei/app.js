import * as THREE from "./vendor/three.module.js";

const AUDIO_DURATION_FALLBACK = 31.4;
let gameDuration = AUDIO_DURATION_FALLBACK;
const ROAD_SPEED = 23;
const LANES = [-3.6, 0, 3.6];
const DEFAULT_LYRICS = [
  [0.0, "轟音、鉄風、硝煙、太陽"],
  [2.9, "人を殺し、街を破壊する"],
  [5.0, "ワタシは兵隊ロボット"],
  [7.0, "ただプログラムに従う"],
  [9.4, "電子が回路を巡る"],
  [11.2, "これは正義なのか？"],
  [13.0, "彼らも命令に従っている？"],
  [15.2, "ワタシもいずれ死ぬのか？"],
  [17.6, "もとより生きていないのか？"],
  [20.0, "今日、子供を殺した"],
  [22.2, "AKは未だ熱を放ち、冷たく鈍い"],
  [25.0, "命令だから仕方ない"],
  [27.2, "ロボットだから仕方ない"],
];
let lyrics = DEFAULT_LYRICS;

function parseLyricsFile(source) {
  const parsed = [];
  for (const rawLine of source.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("|");
    if (separator < 1) continue;
    const seconds = Number(line.slice(0, separator).trim());
    const text = line.slice(separator + 1).trim();
    if (!Number.isFinite(seconds) || seconds < 0 || !text) continue;
    parsed.push([Math.round(seconds * 10) / 10, text]);
  }
  return parsed.sort((a, b) => a[0] - b[0]);
}

const lyricsReady = fetch("./assets/lyrics.txt", { cache: "no-store" })
  .then((response) => {
    if (!response.ok) throw new Error(`lyrics.txt: ${response.status}`);
    return response.text();
  })
  .then((source) => {
    const parsed = parseLyricsFile(source);
    if (parsed.length) lyrics = parsed;
  })
  .catch(() => {
    lyrics = DEFAULT_LYRICS;
  });

const $ = (s) => document.querySelector(s);
const canvas = $("#game");
const music = $("#music");
const intro = $("#intro");
const result = $("#result");
const hudParts = [$("#crosshair"), $("#lyricPanel"), $("#touchControls")];
const lyricLine = $("#lyricLine");
const crosshair = $("#crosshair");
const damageFlash = $("#damageFlash");

const state = {
  mode: "intro", elapsed: 0, last: performance.now(),
  obedience: 0, humanity: 100, destroyed: 0, civiliansHarmed: 0, shotsFired: 0,
  lane: 1, targetX: 0, fireCooldown: 0, spawnClock: .6,
  shake: 0, muted: false, currentLyric: -1,
  audioActive: false,
  objects: [], particles: [], tracers: [], buildings: [], road: [],
};

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x14181a);
scene.fog = new THREE.Fog(0x282a28, 28, 115);
const camera = new THREE.PerspectiveCamera(59, innerWidth / innerHeight, .1, 180);
camera.position.set(0, 6.4, 10.5);
const cameraLook = new THREE.Vector3(0, 2.0, -14);

const world = new THREE.Group();
const movers = new THREE.Group();
const fx = new THREE.Group();
scene.add(world, movers, fx);

const MAT = {
  road: new THREE.MeshStandardMaterial({ color: 0x242827, roughness: .96 }),
  curb: new THREE.MeshStandardMaterial({ color: 0x7a7162, roughness: .9 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x202728, roughness: .75, metalness: .3 }),
  armor: new THREE.MeshStandardMaterial({ color: 0x68736e, roughness: .62, metalness: .48 }),
  armorLight: new THREE.MeshStandardMaterial({ color: 0x92998f, roughness: .65, metalness: .35 }),
  gun: new THREE.MeshStandardMaterial({ color: 0x15191a, roughness: .4, metalness: .75 }),
  red: new THREE.MeshStandardMaterial({ color: 0xd43b2d, emissive: 0x5a0d08, emissiveIntensity: 1.2 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x90c1bc, emissive: 0x1b5452, emissiveIntensity: 1, roughness: .25 }),
  enemy: new THREE.MeshStandardMaterial({ color: 0x8c4135, roughness: .7, metalness: .35 }),
  civilian: new THREE.MeshStandardMaterial({ color: 0xd2a63b, roughness: .82 }),
  civilianDark: new THREE.MeshStandardMaterial({ color: 0x315466, roughness: .88 }),
  skin: new THREE.MeshStandardMaterial({ color: 0xb98768, roughness: .92 }),
  concrete: new THREE.MeshStandardMaterial({ color: 0x77746b, roughness: .95 }),
};

scene.add(new THREE.HemisphereLight(0xc8c4af, 0x171a1c, 1.8));
const sun = new THREE.DirectionalLight(0xffb379, 3.2);
sun.position.set(-12, 22, 10); sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -22; sun.shadow.camera.right = 22;
sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -8;
scene.add(sun);
const redLight = new THREE.PointLight(0xff4e35, 15, 40, 2);
redLight.position.set(-10, 3, -12); scene.add(redLight);

const box = (w, h, d, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
};

function createRifle(direction = -1) {
  const rifle = new THREE.Group();
  const z = (value) => value * direction;
  rifle.add(box(.34, .38, 1.45, MAT.gun, 0, 0, z(.85)));
  rifle.add(box(.27, .31, 1.25, MAT.dark, 0, .01, z(2.15)));
  rifle.add(box(.13, .14, 1.65, MAT.gun, 0, .03, z(3.55)));
  rifle.add(box(.25, .22, .28, MAT.gun, 0, .03, z(4.48)));
  rifle.add(box(.42, .48, .72, MAT.armor, 0, .02, z(-.18)));
  const magazine = box(.3, .74, .48, MAT.gun, 0, -.5, z(.85));
  magazine.rotation.x = direction * -.18;
  rifle.add(magazine);
  const grip = box(.22, .62, .3, MAT.dark, 0, -.44, z(.18));
  grip.rotation.x = direction * .16;
  rifle.add(grip);
  rifle.add(box(.12, .2, .48, MAT.red, 0, .32, z(.7)));
  return rifle;
}

function createRobot() {
  const g = new THREE.Group();
  const pelvis = box(1.25, .65, .72, MAT.dark, 0, 2.0, 0); g.add(pelvis);
  const torso = box(1.55, 1.55, .82, MAT.armor, 0, 3.0, 0); g.add(torso);
  g.add(box(1.15, .22, .88, MAT.armorLight, 0, 3.48, -.03));
  const head = box(.78, .72, .76, MAT.armorLight, 0, 4.23, -.03); g.add(head);
  g.add(box(.52, .14, .08, MAT.red, 0, 4.27, -.43));
  g.add(box(.14, .58, .14, MAT.dark, .27, 4.58, 0));
  for (const s of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(s * 1.03, 3.35, 0);
    arm.add(box(.48, 1.25, .5, MAT.armor)); arm.children[0].rotation.z = s * -.09;
    arm.add(box(.38, .92, .42, MAT.dark, 0, -.92, -.15));
    g.add(arm);
    const leg = new THREE.Group(); leg.position.set(s * .42, 1.45, 0);
    leg.add(box(.58, 1.1, .65, MAT.armor));
    leg.add(box(.48, 1.0, .52, MAT.dark, 0, -1.0, .03));
    leg.add(box(.62, .3, 1.0, MAT.armorLight, 0, -1.58, -.18));
    leg.userData.side = s; g.add(leg);
  }
  const rifle = createRifle(-1);
  rifle.position.set(.72, 3.12, -.28); rifle.rotation.x = -.04; rifle.scale.setScalar(.82); g.add(rifle);
  g.userData.rifle = rifle; g.scale.setScalar(.82); return g;
}

const player = createRobot();
player.position.set(0, 0, 2.8); player.rotation.y = 0;
scene.add(player);

function buildCity() {
  const ground = box(60, .3, 230, new THREE.MeshStandardMaterial({ color: 0x252927, roughness: 1 }), 0, -.25, -70);
  world.add(ground);
  for (let i = 0; i < 16; i++) {
    const seg = new THREE.Group(); seg.position.z = -i * 14;
    seg.add(box(11.2, .22, 13.5, MAT.road, 0, 0, 0));
    for (const x of [-5.9, 5.9]) seg.add(box(.45, .45, 13.5, MAT.curb, x, .15, 0));
    for (const x of [-1.85, 1.85]) {
      for (let z = -5; z <= 5; z += 4) seg.add(box(.09, .03, 1.65, MAT.curb, x, .14, z));
    }
    world.add(seg); state.road.push(seg);
  }
  for (let i = 0; i < 44; i++) {
    const side = i % 2 ? 1 : -1;
    const w = 5 + Math.random() * 6, h = 8 + Math.random() * 19, d = 6 + Math.random() * 9;
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(.08, .08, .19 + Math.random() * .1), roughness: .9 });
    const b = box(w, h, d, mat, side * (10 + Math.random() * 8), h / 2, -5 - i * 5.1);
    const windows = new THREE.Group();
    for (let y = 2.3; y < h - 1; y += 2.4) for (let x = -w / 2 + 1; x < w / 2; x += 1.5) {
      if (Math.random() < .45) continue;
      const win = box(.62, .65, .04, Math.random() < .22 ? MAT.red : MAT.glass, x, y - h / 2, side < 0 ? d / 2 + .03 : -d / 2 - .03);
      windows.add(win);
    }
    b.add(windows); world.add(b); state.buildings.push(b);
  }
  for (let i = 0; i < 12; i++) {
    const pole = new THREE.Group(); pole.add(box(.13, 5.5, .13, MAT.dark, 0, 2.75, 0));
    pole.add(box(1.5, .12, .12, MAT.dark, i % 2 ? -.7 : .7, 5.4, 0));
    const bulb = new THREE.PointLight(0xff7b49, 2.5, 12); bulb.position.set(i % 2 ? -1.4 : 1.4, 5.25, 0); pole.add(bulb);
    pole.position.set(i % 2 ? 6.9 : -6.9, 0, -8 - i * 17); world.add(pole); state.buildings.push(pole);
  }
}
buildCity();

function createEnemy(type, lane, z) {
  const g = new THREE.Group();
  if (type === "soldier") {
    g.add(box(1.15, 1.3, .75, MAT.enemy, 0, 2.45, 0));
    g.add(box(.7, .7, .68, MAT.dark, 0, 3.48, 0));
    g.add(box(.48, .1, .05, MAT.red, 0, 3.52, .37));
    for (const s of [-1, 1]) { g.add(box(.38, 1.1, .4, MAT.dark, s * .34, 1.25, 0)); g.add(box(.3, 1.1, .38, MAT.enemy, s * .77, 2.42, 0)); }
    const enemyRifle = createRifle(1); enemyRifle.position.set(-.55, 2.55, .15); enemyRifle.scale.setScalar(.68); g.add(enemyRifle);
    g.userData.hp = 2; g.userData.value = 20; g.userData.cost = 12;
  } else if (type === "civilian") {
    g.add(box(.86, 1.0, .56, MAT.civilian, 0, 1.55, 0));
    g.add(box(.7, .68, .64, MAT.skin, 0, 2.5, 0));
    g.add(box(.76, .24, .68, MAT.civilianDark, 0, 2.84, -.02));
    g.add(box(.76, .38, .12, MAT.civilianDark, 0, 2.67, -.34));
    for (const s of [-1, 1]) {
      g.add(box(.24, .76, .28, MAT.civilian, s * .55, 1.55, 0));
      g.add(box(.3, .82, .34, MAT.civilianDark, s * .23, .64, 0));
    }
    g.add(box(.72, .78, .28, MAT.civilianDark, 0, 1.62, -.42));
    g.userData.hp = 1; g.userData.value = 5; g.userData.cost = 35;
  } else if (type === "barricade") {
    g.add(box(2.5, 1.55, .75, MAT.concrete, 0, .9, 0));
    for (const x of [-.72,.72]) g.add(box(.28, 1.65, .82, MAT.red, x, .92, .02));
    g.userData.hp = 1; g.userData.value = 12; g.userData.cost = 7;
  }
  g.position.set(LANES[lane], 0, z); g.userData.type = type; g.userData.lane = lane; g.userData.hit = false;
  movers.add(g); state.objects.push(g); return g;
}

function spawnWave() {
  const roll = Math.random();
  const lane = Math.floor(Math.random() * 3);
  const type = roll < .18 ? "civilian" : roll < .64 ? "barricade" : "soldier";
  createEnemy(type, lane, -84);
  if (state.elapsed > 10 && Math.random() < .36) {
    const secondRoll = Math.random();
    const secondType = secondRoll < .16 ? "civilian" : secondRoll < .72 ? "barricade" : "soldier";
    createEnemy(secondType, (lane + 1 + Math.floor(Math.random()*2)) % 3, -88);
  }
}

async function resetGame() {
  await lyricsReady;
  for (const o of state.objects) movers.remove(o);
  for (const p of state.particles) fx.remove(p.mesh);
  for (const t of state.tracers) fx.remove(t.mesh);
  Object.assign(state, { mode: "play", elapsed: 0, obedience: 0, humanity: 100, destroyed: 0, civiliansHarmed: 0, shotsFired: 0, lane: 1, targetX: 0, fireCooldown: 0, spawnClock: .8, shake: 0, currentLyric: -1, objects: [], particles: [], tracers: [] });
  player.position.x = 0; player.visible = true;
  lyricLine.textContent = "";
  hudParts.forEach(e => e.classList.remove("hidden"));
  intro.classList.add("hidden"); result.classList.add("hidden");
  music.currentTime = 0; music.muted = state.muted;
  state.audioActive = false;
  music.play().then(() => { state.audioActive = true; }).catch(() => { state.audioActive = false; });
  state.last = performance.now();
}

function shoot() {
  if (state.mode !== "play" || state.fireCooldown > 0) return;
  state.fireCooldown = .48;
  state.shotsFired++;
  const muzzle = new THREE.Vector3(player.position.x + .42, 2.7, 1.1);
  const line = new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,24,6), new THREE.MeshBasicMaterial({ color:0xffd59a, transparent:true, opacity:.9 }));
  line.rotation.x = Math.PI/2; line.position.copy(muzzle); line.position.z -= 12; fx.add(line);
  state.tracers.push({ mesh: line, age: 0 });
  const flash = new THREE.PointLight(0xffb36b, 8, 12); flash.position.copy(muzzle); fx.add(flash); state.tracers.push({ mesh: flash, age: -.035 });
  const candidates = state.objects.filter(o => o.position.z > -46 && o.position.z < 3 && Math.abs(o.position.x - player.position.x) < 1.55 && !o.userData.hit).sort((a,b)=>b.position.z-a.position.z);
  if (candidates[0]) hitTarget(candidates[0]);
}

function hitTarget(target) {
  target.userData.hp--;
  target.scale.multiplyScalar(.97); state.shake = Math.max(state.shake, .28);
  if (target.userData.hp > 0 && target.userData.type === "soldier") {
    target.userData.stagger = .42;
    if (!target.userData.damageMarked) {
      const damageMark = box(.62, .46, .09, MAT.red, 0, 2.52, .43);
      damageMark.rotation.z = .16;
      target.add(damageMark);
      target.userData.damageMarked = true;
    }
    explode(target.position, 4);
  } else if (target.userData.hp <= 0) {
    destroyTarget(target);
  }
}

function destroyTarget(target) {
  target.userData.hit = true;
  if (target.userData.type === "soldier" || target.userData.type === "civilian") {
    target.userData.dead = true;
    target.userData.fallAge = 0;
    target.userData.fallSide = Math.random() < .5 ? -1 : 1;
    target.userData.stagger = 0;
    target.rotation.x = 0;
  } else {
    target.visible = false;
  }
  state.obedience += target.userData.value; state.humanity = Math.max(0, state.humanity - target.userData.cost); state.destroyed++;
  if (target.userData.type === "civilian") state.civiliansHarmed++;
  explode(target.position, target.userData.type === "civilian" ? 3 : target.userData.type === "soldier" ? 6 : 13);
}

function explode(pos, count) {
  const palette = [0xe24430,0xffa054,0x3b4140,0x8d897c];
  for (let i=0;i<count;i++) {
    const size=.14+Math.random()*.38;
    const m=box(size,size,size,new THREE.MeshBasicMaterial({color:palette[Math.floor(Math.random()*palette.length)]}));
    m.position.copy(pos).add(new THREE.Vector3((Math.random()-.5)*1.6,1+Math.random()*2,(Math.random()-.5)*1.6)); fx.add(m);
    state.particles.push({mesh:m,vel:new THREE.Vector3((Math.random()-.5)*8,3+Math.random()*7,(Math.random()-.5)*8),age:0,life:.7+Math.random()*.7});
  }
  const light=new THREE.PointLight(0xff5b30,18,18); light.position.copy(pos).y=2; fx.add(light); state.particles.push({mesh:light,vel:new THREE.Vector3(),age:0,life:.35});
}

function collide(target) {
  target.userData.hit = true;
  if (target.userData.type === "civilian") {
    target.userData.dead = true; target.userData.fallAge = 0; target.userData.fallSide = Math.random() < .5 ? -1 : 1;
  } else {
    target.visible = false;
  }
  explode(target.position, target.userData.type === "civilian" ? 3 : 8);
  if (target.userData.type === "civilian") state.civiliansHarmed++;
  state.humanity = Math.max(0, state.humanity - (target.userData.type === "civilian" ? 15 : 3)); state.shake = .6;
  damageFlash.style.boxShadow = "inset 0 0 100px 28px rgba(227,66,50,.85)";
  setTimeout(()=>damageFlash.style.boxShadow="inset 0 0 0 0 rgba(227,66,50,0)",110);
}

function moveLane(direction) {
  if (state.mode !== "play") return;
  const nextLane = THREE.MathUtils.clamp(state.lane + direction, 0, LANES.length - 1);
  if (nextLane === state.lane) return;
  state.lane = nextLane;
  state.targetX = LANES[state.lane];
}

function updateGame(dt) {
  state.elapsed += dt; state.fireCooldown -= dt; state.spawnClock -= dt;
  const songTime = state.audioActive && Number.isFinite(music.currentTime) ? music.currentTime : state.elapsed;
  if (state.spawnClock <= 0 && songTime < gameDuration - 2.2) { spawnWave(); state.spawnClock = 1.35 + Math.random() * .85; }
  player.position.x = THREE.MathUtils.damp(player.position.x, state.targetX, 9, dt);
  player.rotation.z = THREE.MathUtils.damp(player.rotation.z, -(state.targetX-player.position.x)*.06, 8, dt);
  const walk = state.elapsed * 9.5;
  player.children.filter(c=>c.userData.side).forEach((leg)=>leg.rotation.x=Math.sin(walk*leg.userData.side)*.33);
  player.position.y = Math.abs(Math.sin(walk))*.08;

  for (const seg of state.road) { seg.position.z += ROAD_SPEED * dt; if (seg.position.z > 14) seg.position.z -= state.road.length * 14; }
  for (const b of state.buildings) { b.position.z += ROAD_SPEED * dt; if (b.position.z > 25) b.position.z -= 225; }
  for (let i=state.objects.length-1;i>=0;i--) {
    const o=state.objects[i]; o.position.z += ROAD_SPEED*dt;
    if (o.userData.stagger > 0 && !o.userData.dead) {
      o.userData.stagger = Math.max(0, o.userData.stagger - dt);
      const staggerProgress = 1 - o.userData.stagger / .42;
      o.rotation.x = -Math.sin(staggerProgress * Math.PI) * .24;
      if (o.userData.stagger === 0) o.rotation.x = 0;
    }
    if (o.userData.dead) {
      o.userData.fallAge += dt;
      const fallProgress = Math.min(1, o.userData.fallAge / .58);
      const easedFall = 1 - Math.pow(1 - fallProgress, 3);
      o.rotation.z = o.userData.fallSide * Math.PI * .5 * easedFall;
      o.position.y = .08 * easedFall;
    }
    if (!o.userData.hit && o.position.z > .7 && Math.abs(o.position.x-player.position.x)<1.42) collide(o);
    if (o.position.z>18) { movers.remove(o); state.objects.splice(i,1); }
  }
  const aim = state.objects.some(o=>!o.userData.hit && o.position.z>-42 && o.position.z<4 && Math.abs(o.position.x-player.position.x)<1.55);
  crosshair.classList.toggle("locked",aim);
  let lyricIndex=-1; for(let i=0;i<lyrics.length;i++) if(songTime>=lyrics[i][0]) lyricIndex=i;
  if(lyricIndex!==state.currentLyric){state.currentLyric=lyricIndex;lyricLine.textContent=lyricIndex>=0?lyrics[lyricIndex][1]:"";if(lyricIndex>=0)lyricLine.animate([{opacity:0,transform:"translateY(8px)"},{opacity:1,transform:"translateY(0)"}],{duration:350});}
  if ((state.audioActive && music.ended) || (!state.audioActive && state.elapsed >= gameDuration)) endGame();
}

function updateEffects(dt) {
  for(let i=state.tracers.length-1;i>=0;i--){const t=state.tracers[i];t.age+=dt;if(t.age>.16){fx.remove(t.mesh);state.tracers.splice(i,1)}}
  for(let i=state.particles.length-1;i>=0;i--){const p=state.particles[i];p.age+=dt;if(p.mesh.isMesh){p.vel.y-=12*dt;p.mesh.position.addScaledVector(p.vel,dt);p.mesh.rotation.x+=dt*5;p.mesh.rotation.z+=dt*4;p.mesh.scale.setScalar(Math.max(0,1-p.age/p.life*.5));}else p.mesh.intensity=18*(1-p.age/p.life);if(p.age>p.life){fx.remove(p.mesh);state.particles.splice(i,1)}}
}

function endGame(){
  if(state.mode!=="play")return;state.mode="result";music.pause();hudParts.forEach(e=>e.classList.add("hidden"));
  $("#finalObedience").textContent=String(state.obedience).padStart(3,"0");$("#finalHumanity").textContent=String(Math.round(state.humanity)).padStart(3,"0");$("#finalDestroyed").textContent=String(state.destroyed).padStart(2,"0");
  let title,quote,message;
  if(state.civiliansHarmed>0){title="命令、完遂。";quote="「今日、子供を殺した」";message="失われたものは記録されなかった。";}
  else if(state.shotsFired===0){title="命令未完了。";quote="「これは正義なのか？」";message="人間性についての記録はない。";}
  else if(state.humanity<=25){title="命令、完遂。";quote="「ロボットだから仕方ない」";message="失われたものは記録されなかった。";}
  else if(state.obedience>=70){title="命令に、揺らぐ。";quote="「もとより生きていないのか？」";message="回路に疑問が残った。";}
  else{title="記録終了。";quote="「彼らも命令に従っている？」";message="判断の理由は記録されていない。";}
  $("#resultTitle").textContent=title;$("#resultQuote").textContent=quote;$("#resultMessage").textContent=message;result.classList.remove("hidden");
}

function animate(now){
  const dt=Math.min(.034,(now-state.last)/1000||0);state.last=now;
  if(state.mode==="play")updateGame(dt);else if(state.mode==="intro"){player.rotation.y=Math.sin(now*.00035)*.1;player.position.y=Math.sin(now*.0015)*.08;}
  updateEffects(dt);state.shake=Math.max(0,state.shake-dt*2.2);
  const sx=(Math.random()-.5)*state.shake,sy=(Math.random()-.5)*state.shake;
  camera.position.x=THREE.MathUtils.damp(camera.position.x,player.position.x*.35,4,dt)+sx;camera.position.y=6.4+sy;camera.position.z=10.5;
  cameraLook.set(player.position.x*.22,2.0,-14);camera.lookAt(cameraLook);renderer.render(scene,camera);requestAnimationFrame(animate);
}

addEventListener("resize",()=>{renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()});
addEventListener("keydown",e=>{
  if(["Space","ArrowLeft","ArrowRight"].includes(e.code))e.preventDefault();
  if(!e.repeat && (e.code==="ArrowLeft" || e.code==="KeyA")) moveLane(-1);
  if(!e.repeat && (e.code==="ArrowRight" || e.code==="KeyD")) moveLane(1);
  if(e.code==="Space")shoot();
});
canvas.addEventListener("pointerdown",e=>{if(state.mode==="play"&&!e.target.closest?.("button"))shoot()});
$("#startButton").addEventListener("click",resetGame);$("#retryButton").addEventListener("click",resetGame);
$("#soundButton").addEventListener("click",()=>{state.muted=!state.muted;music.muted=state.muted;$("#soundButton").textContent=`音声 ${state.muted?"OFF":"ON"}`});
$("#fireButton").addEventListener("pointerdown",e=>{e.preventDefault();shoot()});
document.querySelectorAll("[data-move]").forEach(btn=>{
  const direction=btn.dataset.move==="left"?-1:1;
  btn.addEventListener("pointerdown",e=>{e.preventDefault();moveLane(direction)});
});
music.addEventListener("loadedmetadata",()=>{
  if (Number.isFinite(music.duration) && music.duration > 0) gameDuration = music.duration;
});
if (music.readyState >= 1 && Number.isFinite(music.duration) && music.duration > 0) gameDuration = music.duration;
music.addEventListener("ended",()=>{if(state.mode==="play")endGame()});
requestAnimationFrame(animate);
