import * as THREE from "./vendor/three.module.js";

const canvas = document.querySelector("#game");
const audio = document.querySelector("#bgm");
const overlay = document.querySelector("#overlay");
const startBtn = document.querySelector("#startBtn");
const pauseBtn = document.querySelector("#pauseBtn");
const restartBtn = document.querySelector("#restartBtn");
const muteBtn = document.querySelector("#muteBtn");
const scoreEl = document.querySelector("#score");
const comboEl = document.querySelector("#combo");
const progressBar = document.querySelector("#progressBar");
const timeNow = document.querySelector("#timeNow");
const passCountEl = document.querySelector("#passCount");
const resultLine = document.querySelector("#resultLine");
const fallbackLyrics = document.querySelector("#lyricsFallback").textContent;
const mobileJoystick = document.querySelector("#mobileJoystick");
const joystickKnob = document.querySelector("#joystickKnob");

const TRACK_DURATION_FALLBACK = 239.92;
const TRAVEL_TIME = 5.2;
const DPR_LIMIT = 2;
const WORLD = {
  xMin: -8.2,
  xMax: 8.2,
  yMin: -2.8,
  yMax: 4.8,
  playerZ: 0,
  spawnZ: -92,
  hitZ: -1.2,
  passZ: 16,
  sceneryFarZ: -150,
  sceneryNearZ: 20,
};
const GROUND_Y = -4.35;
const ROAD_SEGMENT_LENGTH = 10;
const ROAD_SEGMENT_COUNT = 23;

const state = {
  width: 1,
  height: 1,
  dpr: 1,
  running: false,
  paused: false,
  finished: false,
  score: 0,
  combo: 0,
  passedLyrics: 0,
  nextLyric: 0,
  lastFrame: 0,
  pointer: { x: 0, y: 0.1, active: false },
  joystick: {
    active: false,
    pointerId: null,
    x: 0,
    y: 0,
  },
  player: {
    x: 0,
    y: 0.1,
    targetX: 0,
    targetY: 0.1,
    vx: 0,
    vy: 0,
    bank: 0,
    pitch: 0,
    thrust: 0,
    invincible: 0,
  },
  keys: new Set(),
  targets: [],
  particles: [],
  shockwaves: [],
  schedule: [],
  lyricLines: [],
  lyricsPromise: null,
  syncPromise: null,
  scheduleSource: "even",
  hasExplicitTiming: false,
  outro: {
    active: false,
    age: 0,
    duration: 2.55,
    startX: 0,
    startY: 0.1,
    startZ: WORLD.playerZ,
    startScale: 0.92,
    trailClock: 0,
  },
  shake: 0,
  scenery: makeScenery(),
};

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance",
});
renderer.setClearColor(0x120d0b, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x120d0b);
scene.fog = new THREE.FogExp2(0x1d100c, 0.014);

const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 240);
const cameraTarget = new THREE.Vector3(0, 0.8, -20);
const playerGroup = new THREE.Group();
const targetsGroup = new THREE.Group();
const environmentGroup = new THREE.Group();
const effectsGroup = new THREE.Group();
const tmpVector = new THREE.Vector3();

scene.add(environmentGroup, targetsGroup, effectsGroup, playerGroup);
buildLights();
buildPlayer();
buildEnvironment();

function buildLights() {
  scene.add(new THREE.HemisphereLight(0xb7a37a, 0x12080a, 1.6));

  const sun = new THREE.DirectionalLight(0xff9b5c, 2.4);
  sun.position.set(-8, 9, 3);
  scene.add(sun);

  const coldStreetLight = new THREE.PointLight(0x75e0d4, 1.7, 58);
  coldStreetLight.position.set(0, -1.2, -28);
  scene.add(coldStreetLight);

  const engineGlow = new THREE.PointLight(0xff8a68, 2.2, 24);
  engineGlow.position.set(0, -0.15, 2.1);
  playerGroup.add(engineGlow);
}

function buildPlayer() {
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xeaf8f2,
    roughness: 0.32,
    metalness: 0.38,
    emissive: 0x101820,
  });
  const wingMaterial = new THREE.MeshStandardMaterial({
    color: 0x75e0d4,
    roughness: 0.36,
    metalness: 0.25,
    emissive: 0x072625,
    side: THREE.DoubleSide,
  });
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xf3b85b,
    roughness: 0.44,
    metalness: 0.35,
    emissive: 0x261200,
  });
  const flameMaterial = new THREE.MeshBasicMaterial({
    color: 0xff8a68,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
  });

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.45, 4), bodyMaterial);
  nose.rotation.x = -Math.PI / 2;
  nose.position.z = -0.68;
  playerGroup.add(nose);

  const fuselage = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.44, 1.32), bodyMaterial);
  fuselage.position.z = 0.08;
  playerGroup.add(fuselage);

  const cockpit = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({
      color: 0x102a34,
      roughness: 0.2,
      metalness: 0.1,
      emissive: 0x0a3638,
    }),
  );
  cockpit.scale.set(1.0, 0.55, 1.4);
  cockpit.position.set(0, 0.22, -0.28);
  playerGroup.add(cockpit);

  const wingGeometry = new THREE.BufferGeometry();
  wingGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        -0.22, 0.02, -0.32,
        -2.45, -0.1, 0.52,
        -0.34, -0.04, 0.88,
        0.22, 0.02, -0.32,
        2.45, -0.1, 0.52,
        0.34, -0.04, 0.88,
      ],
      3,
    ),
  );
  wingGeometry.setIndex([0, 1, 2, 3, 4, 5]);
  wingGeometry.computeVertexNormals();
  playerGroup.add(new THREE.Mesh(wingGeometry, wingMaterial));

  const tailGeometry = new THREE.BufferGeometry();
  tailGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        0, 0.12, 0.52,
        -0.56, 0.04, 1.28,
        -0.08, 0.72, 1.02,
        0, 0.12, 0.52,
        0.56, 0.04, 1.28,
        0.08, 0.72, 1.02,
      ],
      3,
    ),
  );
  tailGeometry.setIndex([0, 1, 2, 3, 4, 5]);
  tailGeometry.computeVertexNormals();
  playerGroup.add(new THREE.Mesh(tailGeometry, goldMaterial));

  const engineLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.56, 12), goldMaterial);
  engineLeft.rotation.x = Math.PI / 2;
  engineLeft.position.set(-0.42, -0.08, 0.9);
  playerGroup.add(engineLeft);

  const engineRight = engineLeft.clone();
  engineRight.position.x = 0.42;
  playerGroup.add(engineRight);

  const flameLeft = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.82, 16), flameMaterial);
  flameLeft.rotation.x = Math.PI / 2;
  flameLeft.position.set(-0.42, -0.08, 1.36);
  flameLeft.name = "engineFlame";
  playerGroup.add(flameLeft);

  const flameRight = flameLeft.clone();
  flameRight.position.x = 0.42;
  flameRight.name = "engineFlame";
  playerGroup.add(flameRight);

  playerGroup.scale.setScalar(0.92);
  playerGroup.position.set(0, 0.1, WORLD.playerZ);
}

function buildEnvironment() {
  const ashGeometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  const rand = mulberry32(8503);
  for (let i = 0; i < 950; i += 1) {
    positions.push((rand() - 0.5) * 110, GROUND_Y + rand() * 22, WORLD.sceneryFarZ + rand() * 170);
    const warmth = rand();
    colors.push(0.36 + warmth * 0.34, 0.31 + warmth * 0.24, 0.27 + warmth * 0.18);
  }
  ashGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  ashGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const ash = new THREE.Points(
    ashGeometry,
    new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
    }),
  );
  ash.name = "ashfall";
  environmentGroup.add(ash);

  const skyGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 90),
    new THREE.MeshBasicMaterial({
      color: 0x5b2b1e,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    }),
  );
  skyGlow.position.set(0, 18, WORLD.sceneryFarZ - 8);
  skyGlow.name = "citySky";
  environmentGroup.add(skyGlow);

  const roadBase = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 260),
    new THREE.MeshStandardMaterial({
      color: 0x17120f,
      roughness: 0.98,
      metalness: 0.03,
    }),
  );
  roadBase.rotation.x = -Math.PI / 2;
  roadBase.position.set(0, GROUND_Y - 0.065, -62);
  roadBase.name = "roadBase";
  environmentGroup.add(roadBase);

  for (let index = 0; index < ROAD_SEGMENT_COUNT; index += 1) {
    environmentGroup.add(createRoadSegment(index, rand));
  }

  const horizon = new THREE.Group();
  const horizonMaterial = new THREE.MeshStandardMaterial({
    color: 0x151318,
    roughness: 0.9,
    metalness: 0.02,
    emissive: 0x070302,
  });
  for (let i = 0; i < 44; i += 1) {
    const height = 4 + rand() * 18;
    const width = 2.5 + rand() * 6;
    const tower = new THREE.Mesh(new THREE.BoxGeometry(width, height, 3.5 + rand() * 3), horizonMaterial);
    tower.position.set(-64 + i * 3 + rand() * 2, GROUND_Y + height / 2 - rand() * 1.2, -142 - rand() * 16);
    tower.rotation.z = (rand() - 0.5) * 0.1;
    horizon.add(tower);
  }
  horizon.name = "cityHorizon";
  environmentGroup.add(horizon);

  for (const item of state.scenery.cityObjects) {
    environmentGroup.add(createCityScenery(item));
  }
}

function createRoadSegment(index, rand) {
  const group = new THREE.Group();
  group.name = "roadSegment";
  group.position.z = WORLD.sceneryFarZ + index * ROAD_SEGMENT_LENGTH + ROAD_SEGMENT_LENGTH * 0.5;
  group.userData.base = {
    index,
    drift: 1.22 + (index % 4) * 0.015,
  };

  const half = ROAD_SEGMENT_LENGTH / 2;
  const stainMaterial = new THREE.MeshBasicMaterial({
    color: 0x0b0908,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  for (let i = 0; i < 4; i += 1) {
    const stain = new THREE.Mesh(new THREE.CircleGeometry(0.4 + rand() * 1.2, 10), stainMaterial.clone());
    stain.rotation.x = -Math.PI / 2;
    stain.scale.set(1 + rand() * 1.4, 0.55 + rand() * 0.8, 1);
    stain.position.set((rand() - 0.5) * 13.2, GROUND_Y + 0.052, -half + rand() * ROAD_SEGMENT_LENGTH);
    stain.rotation.z = rand() * Math.PI;
    group.add(stain);
  }

  const laneMaterial = new THREE.MeshBasicMaterial({
    color: 0xd8b774,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  for (let i = 0; i < 2; i += 1) {
    const lane = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 1.55), laneMaterial.clone());
    lane.rotation.x = -Math.PI / 2;
    lane.position.set(0, GROUND_Y + 0.062, -half + 2.1 + i * 4.3 + (index % 2) * 0.65);
    lane.rotation.z = (rand() - 0.5) * 0.025;
    group.add(lane);
  }

  const edgeMaterial = new THREE.MeshBasicMaterial({
    color: 0xc19a62,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  for (const x of [-7.35, 7.35]) {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.1, ROAD_SEGMENT_LENGTH + 0.9), edgeMaterial.clone());
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(x, GROUND_Y + 0.058, 0);
    group.add(edge);
  }

  return group;
}

function makeScenery() {
  const rand = mulberry32(31855);
  const cityObjects = [];
  for (let index = 0; index < 54; index += 1) {
    const side = rand() > 0.5 ? 1 : -1;
    cityObjects.push({
      kind: "building",
      x: side * (10 + rand() * 28),
      z: WORLD.sceneryFarZ + rand() * 170,
      width: 2.4 + rand() * 4.8,
      height: 5.5 + rand() * 18,
      depth: 3.8 + rand() * 5.8,
      ry: (rand() - 0.5) * 0.36,
      rz: (rand() - 0.5) * 0.12,
      drift: 0.45 + rand() * 0.45,
      seed: 5000 + index * 17,
    });
  }
  for (let index = 0; index < 7; index += 1) {
    const side = index % 2 === 0 ? -1 : 1;
    cityObjects.push({
      kind: "clockTower",
      x: side * (11 + rand() * 6),
      z: WORLD.sceneryFarZ + 10 + index * 24,
      height: 10 + rand() * 5,
      ry: side * -0.18 + (rand() - 0.5) * 0.18,
      drift: 0.62,
      seed: 7200 + index,
    });
  }
  for (let index = 0; index < 10; index += 1) {
    const side = rand() > 0.5 ? 1 : -1;
    cityObjects.push({
      kind: index % 3 === 0 ? "shrineVacancy" : index % 3 === 1 ? "vending" : "sign",
      x: side * (7.2 + rand() * 8.5),
      z: WORLD.sceneryFarZ + rand() * 170,
      ry: side * -0.35 + (rand() - 0.5) * 0.24,
      drift: 0.72 + rand() * 0.25,
      seed: 8300 + index * 23,
    });
  }
  for (let index = 0; index < 18; index += 1) {
    cityObjects.push({
      kind: "rustCloud",
      x: (rand() - 0.5) * 70,
      y: 5 + rand() * 10,
      z: WORLD.sceneryFarZ + rand() * 170,
      sx: 4 + rand() * 9,
      sy: 0.32 + rand() * 0.72,
      sz: 1.4 + rand() * 3.2,
      ry: rand() * Math.PI,
      drift: 0.18 + rand() * 0.24,
      seed: 9400 + index,
    });
  }
  cityObjects.push(
    {
      kind: "clockTower",
      x: -9.4,
      z: -36,
      height: 13.5,
      ry: 0.18,
      drift: 0.56,
      seed: 9901,
    },
    {
      kind: "vending",
      x: -6.9,
      z: -20,
      ry: 0.26,
      drift: 0.82,
      seed: 9902,
    },
    {
      kind: "shrineVacancy",
      x: 8.4,
      z: -28,
      ry: -0.32,
      drift: 0.72,
      seed: 9903,
    },
  );
  return { cityObjects };
}

function createCityScenery(item) {
  let group;
  if (item.kind === "clockTower") {
    group = createClockTower(item);
  } else if (item.kind === "vending") {
    group = createVendingMachine(item);
  } else if (item.kind === "shrineVacancy") {
    group = createShrineVacancy(item);
  } else if (item.kind === "sign") {
    group = createBrokenSign(item);
  } else if (item.kind === "rustCloud") {
    group = createRustCloud(item);
  } else {
    group = createRuinedBuilding(item);
  }
  group.name = "cityObject";
  group.position.set(item.x, 0, item.z);
  group.rotation.y = item.ry || 0;
  group.userData.base = item;
  return group;
}

function createRuinedBuilding(item) {
  const rand = mulberry32(item.seed);
  const group = new THREE.Group();
  const shell = new THREE.Group();
  shell.rotation.z = item.rz || 0;

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x222126,
    roughness: 0.93,
    metalness: 0.08,
    emissive: 0x080506,
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(item.width, item.height, item.depth), wallMaterial);
  body.position.y = GROUND_Y + item.height / 2;
  shell.add(body);

  const rows = Math.max(2, Math.min(8, Math.floor(item.height / 1.7)));
  const cols = Math.max(2, Math.min(5, Math.floor(item.width / 0.8)));
  const paneGeometry = new THREE.PlaneGeometry(item.width / (cols * 2.8), 0.38);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (rand() < 0.48) continue;
      const cool = rand() > 0.72;
      const pane = new THREE.Mesh(
        paneGeometry,
        new THREE.MeshBasicMaterial({
          color: cool ? 0x75e0d4 : 0xff9b5c,
          transparent: true,
          opacity: cool ? 0.34 : 0.22,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
      );
      pane.position.set(
        -item.width * 0.34 + (item.width * 0.68 * col) / Math.max(1, cols - 1),
        GROUND_Y + 1.15 + row * Math.min(1.65, item.height / (rows + 1)),
        item.depth / 2 + 0.025,
      );
      shell.add(pane);
    }
  }

  const chunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x24201c,
    roughness: 0.92,
    metalness: 0.04,
  });
  for (let i = 0; i < 5; i += 1) {
    const chunk = new THREE.Mesh(
      new THREE.BoxGeometry(0.35 + rand() * 0.8, 0.2 + rand() * 0.7, 0.35 + rand() * 1.2),
      chunkMaterial,
    );
    chunk.position.set(
      (rand() - 0.5) * item.width,
      GROUND_Y + item.height + (rand() - 0.2) * 0.7,
      (rand() - 0.5) * item.depth,
    );
    chunk.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
    shell.add(chunk);
  }

  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 1.6 + rand() * 2.4, 6),
    new THREE.MeshBasicMaterial({ color: 0x574238 }),
  );
  antenna.position.set((rand() - 0.5) * item.width * 0.5, GROUND_Y + item.height + 1.1, 0);
  antenna.rotation.z = (rand() - 0.5) * 0.35;
  shell.add(antenna);

  group.add(shell);
  return group;
}

function createClockTower(item) {
  const group = new THREE.Group();
  const towerMaterial = new THREE.MeshStandardMaterial({
    color: 0x25201d,
    roughness: 0.94,
    metalness: 0.04,
    emissive: 0x060302,
  });
  const faceMaterial = new THREE.MeshBasicMaterial({
    color: 0xf7f0e3,
    transparent: true,
    opacity: 0.72,
    side: THREE.DoubleSide,
  });
  const handMaterial = new THREE.MeshBasicMaterial({ color: 0x120d0b });
  const height = item.height || 12;

  const tower = new THREE.Mesh(new THREE.BoxGeometry(2.1, height, 2.2), towerMaterial);
  tower.position.y = GROUND_Y + height / 2;
  tower.rotation.z = 0.06;
  group.add(tower);

  const face = new THREE.Mesh(new THREE.CircleGeometry(0.72, 36), faceMaterial);
  face.position.set(0, GROUND_Y + height - 2.4, 1.13);
  group.add(face);

  const longHand = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.74, 0.035), handMaterial);
  longHand.position.set(0, face.position.y + 0.08, 1.17);
  longHand.rotation.z = 0.08;
  group.add(longHand);

  const shortHand = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.5, 0.035), handMaterial);
  shortHand.position.set(0.12, face.position.y - 0.04, 1.18);
  shortHand.rotation.z = -1.15;
  group.add(shortHand);

  const crown = new THREE.Mesh(new THREE.ConeGeometry(1.35, 1.7, 4), towerMaterial);
  crown.position.y = GROUND_Y + height + 0.62;
  crown.rotation.y = Math.PI / 4;
  group.add(crown);

  return group;
}

function createVendingMachine(item) {
  const group = new THREE.Group();
  const shell = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 2.75, 0.82),
    new THREE.MeshStandardMaterial({
      color: 0x4c1f1f,
      roughness: 0.54,
      metalness: 0.18,
      emissive: 0x110304,
    }),
  );
  shell.position.y = GROUND_Y + 1.36;
  group.add(shell);

  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.92, 1.72),
    new THREE.MeshBasicMaterial({
      color: 0x75e0d4,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  panel.position.set(0, GROUND_Y + 1.62, 0.43);
  group.add(panel);

  const slit = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.08, 0.05), new THREE.MeshBasicMaterial({ color: 0x06090a }));
  slit.position.set(0, GROUND_Y + 0.58, 0.47);
  group.add(slit);

  const glow = new THREE.PointLight(0x75e0d4, 1.9, 13);
  glow.position.set(0, GROUND_Y + 1.55, 1.0);
  group.add(glow);

  return group;
}

function createShrineVacancy(item) {
  const group = new THREE.Group();
  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a3530,
    roughness: 0.95,
    metalness: 0.02,
  });
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.34, 1.8), stoneMaterial);
  base.position.y = GROUND_Y + 0.17;
  group.add(base);

  const pedestal = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.0, 1.0), stoneMaterial);
  pedestal.position.y = GROUND_Y + 0.84;
  pedestal.rotation.z = 0.07;
  group.add(pedestal);

  const missingHalo = new THREE.Mesh(
    new THREE.TorusGeometry(0.76, 0.025, 8, 52),
    new THREE.MeshBasicMaterial({
      color: 0xf3b85b,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  missingHalo.position.set(0, GROUND_Y + 1.72, 0.08);
  missingHalo.rotation.x = Math.PI / 2;
  group.add(missingHalo);

  const shardMaterial = new THREE.MeshStandardMaterial({ color: 0x26211e, roughness: 0.9 });
  for (let i = 0; i < 4; i += 1) {
    const shard = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.64), shardMaterial);
    shard.position.set((i - 1.5) * 0.5, GROUND_Y + 0.18, -0.9 + (i % 2) * 1.8);
    shard.rotation.set(0.2 * i, 0.4 * i, 0.6 * i);
    group.add(shard);
  }
  return group;
}

function createBrokenSign(item) {
  const group = new THREE.Group();
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x26272a, roughness: 0.7, metalness: 0.45 });
  const panelMaterial = new THREE.MeshBasicMaterial({
    color: 0x1c2428,
    transparent: true,
    opacity: 0.86,
    side: THREE.DoubleSide,
  });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 2.7, 8), poleMaterial);
  pole.position.y = GROUND_Y + 1.3;
  pole.rotation.z = 0.18;
  group.add(pole);

  const panel = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.82, 0.08), panelMaterial);
  panel.position.set(0.25, GROUND_Y + 2.35, 0);
  panel.rotation.z = -0.16;
  group.add(panel);

  const flicker = new THREE.Mesh(
    new THREE.PlaneGeometry(1.55, 0.08),
    new THREE.MeshBasicMaterial({
      color: 0xff6f8e,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  flicker.position.set(0.25, GROUND_Y + 2.34, 0.07);
  group.add(flicker);
  return group;
}

function createRustCloud(item) {
  const group = new THREE.Group();
  const cloud = new THREE.Mesh(
    new THREE.SphereGeometry(1, 18, 8),
    new THREE.MeshStandardMaterial({
      color: 0x6c5141,
      roughness: 1,
      metalness: 0,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    }),
  );
  cloud.position.y = item.y;
  cloud.scale.set(item.sx, item.sy, item.sz);
  cloud.rotation.y = item.ry || 0;
  group.add(cloud);
  return group;
}

function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function resize() {
  state.dpr = Math.min(window.devicePixelRatio || 1, DPR_LIMIT);
  state.width = Math.max(320, window.innerWidth);
  state.height = Math.max(420, window.innerHeight);
  renderer.setPixelRatio(state.dpr);
  renderer.setSize(state.width, state.height, false);
  camera.aspect = state.width / state.height;
  camera.updateProjectionMatrix();
}

async function loadLyrics() {
  let raw = fallbackLyrics;
  try {
    const response = await fetch("./assets/lyrics.txt", { cache: "no-store" });
    if (response.ok) {
      raw = await response.text();
    }
  } catch {
    raw = fallbackLyrics;
  }
  const parsed = parseLyrics(raw);
  state.hasExplicitTiming = parsed.timed.length > 0;
  state.lyricLines = parsed.lines;
  if (state.hasExplicitTiming) {
    state.schedule = parsed.timed;
    state.scheduleSource = "timed";
  } else {
    state.schedule = autoSchedule(parsed.lines);
    state.scheduleSource = "even";
    queueAudioSync();
  }
}

function parseLyrics(raw) {
  const lines = [];
  const timed = [];
  raw
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .forEach((line) => {
      if (!line) return;
      const lrc = line.match(/^\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]\s*(.+)$/);
      const secondsTimed = line.match(/^(\d+(?:\.\d)?)\s*\|\s*(.+)$/);
      const plainTimed = line.match(/^(\d{1,2}):(\d{2}(?:\.\d+)?)\s+(.+)$/);
      if (lrc) {
        timed.push({
          time: Number(lrc[1]) * 60 + Number(lrc[2]) + fractionToSeconds(lrc[3]),
          text: lrc[4].trim(),
        });
      } else if (secondsTimed) {
        timed.push({
          time: Number(secondsTimed[1]),
          text: secondsTimed[2].trim(),
        });
      } else if (plainTimed) {
        timed.push({
          time: Number(plainTimed[1]) * 60 + Number(plainTimed[2]),
          text: plainTimed[3].trim(),
        });
      } else {
        lines.push(line);
      }
    });
  timed.sort((a, b) => a.time - b.time);
  return { lines: timed.length > 0 ? timed.map((item) => item.text) : lines, timed };
}

function fractionToSeconds(value = "") {
  if (!value) return 0;
  return Number(`0.${value.padEnd(3, "0").slice(0, 3)}`);
}

function autoSchedule(lines, durationOverride = null) {
  const duration = Number.isFinite(durationOverride)
    ? durationOverride
    : Number.isFinite(audio.duration)
      ? audio.duration
      : TRACK_DURATION_FALLBACK;
  const clean = lines.filter(Boolean);
  if (clean.length === 0) return [];
  const start = 6.5;
  const end = Math.max(start + clean.length * 2.1, duration - 9);
  return spreadSchedule(clean, start, end);
}

function spreadSchedule(lines, start, end) {
  const clean = lines.filter(Boolean);
  const span = Math.max(1, end - start);
  return clean.map((text, index) => ({
    time: start + (span * index) / Math.max(1, clean.length - 1),
    text,
  }));
}

function rebuildAutoScheduleIfNeeded() {
  if (!state.hasExplicitTiming && state.scheduleSource !== "audio") {
    state.schedule = autoSchedule(state.lyricLines);
    state.scheduleSource = "even";
    queueAudioSync();
  }
}

function queueAudioSync() {
  if (state.hasExplicitTiming || state.syncPromise || state.lyricLines.length === 0) {
    return state.syncPromise;
  }
  state.syncPromise = analyzeAudioTiming(state.lyricLines)
    .then((schedule) => {
      if (!state.hasExplicitTiming && schedule.length > 0) {
        state.schedule = schedule;
        state.scheduleSource = "audio";
        if (!state.running && !state.finished) {
          resultLine.textContent = "AUTO SYNC READY";
        }
      }
    })
    .catch(() => {
      state.scheduleSource = "even";
    });
  return state.syncPromise;
}

async function analyzeAudioTiming(lines) {
  const clean = lines.filter(Boolean);
  if (clean.length === 0) return [];
  const DecodeContext =
    window.OfflineAudioContext ||
    window.webkitOfflineAudioContext ||
    window.AudioContext ||
    window.webkitAudioContext;
  if (!DecodeContext) return [];

  const response = await fetch("./assets/bgm.wav", { cache: "force-cache" });
  if (!response.ok) return [];
  const arrayBuffer = await response.arrayBuffer();
  const context =
    DecodeContext === window.OfflineAudioContext ||
    DecodeContext === window.webkitOfflineAudioContext
      ? new DecodeContext(1, 1, 44100)
      : new DecodeContext();

  try {
    const audioBuffer = await decodeAudioBuffer(context, arrayBuffer);
    const cues = extractCueCandidates(audioBuffer);
    return buildAudioScheduleFromCues(clean, cues, audioBuffer.duration);
  } finally {
    if (typeof context.close === "function") {
      context.close();
    }
  }
}

function decodeAudioBuffer(context, arrayBuffer) {
  return new Promise((resolve, reject) => {
    const promise = context.decodeAudioData(arrayBuffer.slice(0), resolve, reject);
    if (promise && typeof promise.then === "function") {
      promise.then(resolve, reject);
    }
  });
}

function extractCueCandidates(audioBuffer) {
  const frameDuration = 0.055;
  const hop = Math.max(512, Math.floor(audioBuffer.sampleRate * frameDuration));
  const frameCount = Math.max(1, Math.floor(audioBuffer.length / hop));
  const channelCount = Math.min(2, audioBuffer.numberOfChannels);
  const channels = Array.from({ length: channelCount }, (_, index) =>
    audioBuffer.getChannelData(index),
  );
  const rms = [];

  for (let frame = 0; frame < frameCount; frame += 1) {
    const start = frame * hop;
    const end = Math.min(audioBuffer.length, start + hop);
    let sum = 0;
    let count = 0;
    for (let sample = start; sample < end; sample += 2) {
      let mixed = 0;
      for (const channel of channels) {
        mixed += channel[sample] || 0;
      }
      mixed /= channelCount || 1;
      sum += mixed * mixed;
      count += 1;
    }
    rms.push(Math.sqrt(sum / Math.max(1, count)));
  }

  const smoothed = rms.map((_, index) => {
    let total = 0;
    let count = 0;
    for (let offset = -2; offset <= 2; offset += 1) {
      const value = rms[index + offset];
      if (Number.isFinite(value)) {
        total += value;
        count += 1;
      }
    }
    return total / Math.max(1, count);
  });

  const scores = smoothed.map((value, index) => {
    const before = averageWindow(smoothed, index - 10, index - 2);
    const previous = smoothed[Math.max(0, index - 2)] || 0;
    const rise = Math.max(0, value - previous);
    const contrast = Math.max(0, value - before);
    return rise * 2.2 + contrast * 1.4 + value * 0.12;
  });

  const scoreThreshold = Math.max(percentile(scores, 0.78), 0.0009);
  const energyGate = Math.max(percentile(smoothed, 0.42), percentile(smoothed, 0.8) * 0.18);
  const minGap = 0.35;
  const peaks = [];

  for (let index = 1; index < scores.length - 1; index += 1) {
    if (smoothed[index] < energyGate) continue;
    if (scores[index] < scoreThreshold) continue;
    if (scores[index] < scores[index - 1] || scores[index] < scores[index + 1]) continue;

    const peak = {
      time: (index * hop) / audioBuffer.sampleRate,
      score: scores[index],
    };
    const previousPeak = peaks[peaks.length - 1];
    if (previousPeak && peak.time - previousPeak.time < minGap) {
      if (peak.score > previousPeak.score) {
        peaks[peaks.length - 1] = peak;
      }
    } else {
      peaks.push(peak);
    }
  }

  if (peaks.length >= 8) return peaks;
  return extractEnergyFallbackPeaks(smoothed, hop, audioBuffer.sampleRate);
}

function extractEnergyFallbackPeaks(smoothed, hop, sampleRate) {
  const threshold = percentile(smoothed, 0.72);
  const minGap = 0.55;
  const peaks = [];
  for (let index = 1; index < smoothed.length - 1; index += 1) {
    if (smoothed[index] < threshold) continue;
    if (smoothed[index] < smoothed[index - 1] || smoothed[index] < smoothed[index + 1]) continue;
    const peak = {
      time: (index * hop) / sampleRate,
      score: smoothed[index],
    };
    const previousPeak = peaks[peaks.length - 1];
    if (previousPeak && peak.time - previousPeak.time < minGap) {
      if (peak.score > previousPeak.score) peaks[peaks.length - 1] = peak;
    } else {
      peaks.push(peak);
    }
  }
  return peaks;
}

function buildAudioScheduleFromCues(lines, cues, duration) {
  const clean = lines.filter(Boolean);
  if (clean.length === 0) return [];
  if (cues.length < Math.min(8, clean.length)) {
    return autoSchedule(clean, duration);
  }

  const fallback = autoSchedule(clean, duration);
  const span = Math.max(1, fallback[fallback.length - 1].time - fallback[0].time);
  const averageGap = span / Math.max(1, clean.length - 1);
  const window = clamp(averageGap * 0.9, 2.4, 8.5);
  const minGap = clamp(averageGap * 0.28, 0.55, 1.85);
  let lastTime = fallback[0].time - minGap;

  return fallback.map((entry, index) => {
    const expected = entry.time;
    const nextExpected = fallback[index + 1]?.time ?? duration - 4;
    const lower = Math.max(2.5, lastTime + minGap, expected - window);
    const upper = Math.min(duration - 2, nextExpected - minGap * 0.2, expected + window);
    const best = cues
      .filter((cue) => cue.time >= lower && cue.time <= upper)
      .map((cue) => ({
        ...cue,
        rank: cue.score - (Math.abs(cue.time - expected) / window) * cue.score * 0.38,
      }))
      .sort((a, b) => b.rank - a.rank)[0];
    const time = best ? best.time : clamp(expected, lastTime + minGap, duration - 2);
    lastTime = time;
    return { time, text: entry.text };
  });
}

function averageWindow(values, start, end) {
  let total = 0;
  let count = 0;
  for (let index = Math.max(0, start); index <= Math.min(values.length - 1, end); index += 1) {
    total += values[index];
    count += 1;
  }
  return total / Math.max(1, count);
}

function percentile(values, amount) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = clamp(Math.floor((sorted.length - 1) * amount), 0, sorted.length - 1);
  return sorted[index];
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function startGame() {
  if (state.lyricsPromise) {
    await Promise.race([state.lyricsPromise, wait(1800)]);
  }
  if (!state.hasExplicitTiming && state.syncPromise && state.scheduleSource !== "audio") {
    const label = startBtn.textContent;
    startBtn.disabled = true;
    startBtn.textContent = "SYNC...";
    resultLine.textContent = "AUTO SYNC...";
    await Promise.race([state.syncPromise, wait(4200)]);
    startBtn.disabled = false;
    startBtn.textContent = label;
  }
  resetGame();
  audio.currentTime = 0;
  audio
    .play()
    .then(() => {
      state.running = true;
      state.paused = false;
      overlay.classList.add("is-hidden");
      requestAnimationFrame(frame);
    })
    .catch(() => {
      resultLine.textContent =
        "音声の再生がブロックされました。もう一度 START を押してください。";
    });
}

function resetGame() {
  state.score = 0;
  state.combo = 0;
  state.passedLyrics = 0;
  state.nextLyric = 0;
  state.lastFrame = performance.now();
  state.finished = false;
  state.targets.forEach(disposeTarget);
  state.particles.forEach(disposeEffect);
  state.shockwaves.forEach(disposeEffect);
  state.targets.length = 0;
  state.particles.length = 0;
  state.shockwaves.length = 0;
  state.shake = 0;
  state.outro.active = false;
  state.outro.age = 0;
  state.outro.trailClock = 0;
  state.player.x = 0;
  state.player.y = 0.1;
  state.player.targetX = 0;
  state.player.targetY = 0.1;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.bank = 0;
  state.player.pitch = 0;
  state.player.thrust = 0;
  state.player.invincible = 0;
  state.pointer.x = 0;
  state.pointer.y = 0.1;
  resetJoystick();
  playerGroup.position.set(0, 0.1, WORLD.playerZ);
  playerGroup.rotation.set(0, 0, 0);
  playerGroup.scale.setScalar(0.92);
  playerGroup.children
    .filter((child) => child.name === "engineFlame")
    .forEach((flame) => {
      flame.scale.set(1, 1, 1);
      flame.material.opacity = 0.72;
    });
  updateHud();
}

function togglePause() {
  if (!state.running || state.finished) return;
  state.paused = !state.paused;
  pauseBtn.textContent = state.paused ? "▶" : "II";
  if (state.paused) {
    if (!state.outro.active) audio.pause();
  } else {
    if (!state.outro.active) audio.play();
    state.lastFrame = performance.now();
    requestAnimationFrame(frame);
  }
}

function restart() {
  audio.pause();
  startGame();
}

function frame(now) {
  if (!state.running || state.paused) return;
  const dt = Math.min(0.05, (now - state.lastFrame) / 1000 || 0);
  state.lastFrame = now;
  update(dt, now / 1000);
  render(now / 1000);
  if (state.running && !state.paused) {
    requestAnimationFrame(frame);
  }
}

function update(dt, time) {
  const current = audio.currentTime;
  const duration = getTrackDuration();
  if (state.outro.active) {
    updateFinalDash(dt);
    updateCamera(dt);
    updateEnvironment(dt, time);
    updateEffects(dt, current);
    updateHud();
    if (state.outro.age >= state.outro.duration) {
      finish(true);
    }
    return;
  }
  spawnDueLyrics(current);
  updatePlayer(dt);
  updateCamera(dt);
  updateTargets(dt, current);
  updateEnvironment(dt, time);
  updateEffects(dt, current);
  updateHud();

  if (!state.finished && (audio.ended || audio.currentTime >= duration - 0.04)) {
    startFinalDash();
  }
}

function startFinalDash() {
  if (state.outro.active || state.finished) return;
  state.targets.forEach(disposeTarget);
  state.targets.length = 0;

  state.outro.active = true;
  state.outro.age = 0;
  state.outro.startX = state.player.x;
  state.outro.startY = state.player.y;
  state.outro.startZ = playerGroup.position.z;
  state.outro.startScale = playerGroup.scale.x || 0.92;
  state.outro.trailClock = 0;
  state.player.thrust = 1.4;
  state.shake = Math.max(state.shake, 0.9);
}

function updateFinalDash(dt) {
  const outro = state.outro;
  outro.age += dt;
  const p = clamp(outro.age / outro.duration, 0, 1);
  const launch = easeInCubic(p);
  const flare = Math.max(0, 1 - Math.abs(p - 0.18) / 0.18);
  const yLift = Math.sin(p * Math.PI) * 0.42;
  const x = lerp(outro.startX, 0, p * 0.58);
  const y = lerp(outro.startY, 1.15, p * 0.42) + yLift;
  const z = outro.startZ - 20 * p - 190 * launch;
  const scale = Math.max(0.018, outro.startScale * (1 - 0.96 * easeOutCubic(p)));

  state.player.x = x;
  state.player.y = y;
  state.player.targetX = x;
  state.player.targetY = y;
  state.player.thrust += (3.4 - state.player.thrust) * Math.min(1, dt * 5.8);
  state.shake = Math.max(state.shake, (1 - p) * 0.82);

  playerGroup.position.set(x, y, z);
  playerGroup.rotation.set(-0.2 - p * 0.42, 0, Math.sin(p * Math.PI * 5) * 0.05 * (1 - p));
  playerGroup.scale.setScalar(scale);
  playerGroup.children
    .filter((child) => child.name === "engineFlame")
    .forEach((flame) => {
      const pulse = 1 + Math.sin(performance.now() * 0.045) * 0.16;
      flame.scale.set(1.35 + p * 1.2, (3.2 + p * 5.8 + flare * 2.2) * pulse, 1.35 + p);
      flame.material.opacity = 0.92;
    });

  outro.trailClock += dt;
  while (outro.trailClock > 0.018 && p < 0.96) {
    outro.trailClock -= 0.018;
    addTurboTrail(playerGroup.position, p);
  }
}

function updatePlayer(dt) {
  const keyboardHorizontal =
    (isDown("ArrowRight") || isDown("KeyD") ? 1 : 0) -
    (isDown("ArrowLeft") || isDown("KeyA") ? 1 : 0);
  const keyboardVertical =
    (isDown("ArrowUp") || isDown("KeyW") ? 1 : 0) -
    (isDown("ArrowDown") || isDown("KeyS") ? 1 : 0);
  const horizontal = clamp(keyboardHorizontal + state.joystick.x, -1, 1);
  const vertical = clamp(keyboardVertical + state.joystick.y, -1, 1);
  const hasDirectionalInput = horizontal !== 0 || vertical !== 0;
  const boost = isDown("Space") ? 1 : 0;
  const player = state.player;

  if (hasDirectionalInput) {
    player.targetX = clamp(player.targetX + horizontal * dt * (8.8 + boost * 4.2), WORLD.xMin, WORLD.xMax);
    player.targetY = clamp(player.targetY + vertical * dt * (6.6 + boost * 2.8), WORLD.yMin, WORLD.yMax);
    state.pointer.x = player.targetX;
    state.pointer.y = player.targetY;
  } else if (!isMobileControlMode()) {
    player.targetX = state.pointer.x;
    player.targetY = state.pointer.y;
  } else {
    state.pointer.x = player.targetX;
    state.pointer.y = player.targetY;
  }

  const oldX = player.x;
  const oldY = player.y;
  const chase = Math.min(1, dt * (5.4 + boost * 4.8));
  player.x += (player.targetX - player.x) * chase;
  player.y += (player.targetY - player.y) * chase;
  player.x = clamp(player.x, WORLD.xMin, WORLD.xMax);
  player.y = clamp(player.y, WORLD.yMin, WORLD.yMax);
  player.vx = (player.x - oldX) / Math.max(dt, 0.001);
  player.vy = (player.y - oldY) / Math.max(dt, 0.001);
  player.bank += (clamp(-player.vx * 0.13, -0.9, 0.9) - player.bank) * Math.min(1, dt * 8);
  player.pitch += (clamp(player.vy * 0.11, -0.55, 0.55) - player.pitch) * Math.min(1, dt * 7);
  player.thrust += (boost - player.thrust) * Math.min(1, dt * 10);
  player.invincible = Math.max(0, player.invincible - dt);
  state.shake = Math.max(0, state.shake - dt * 8);

  playerGroup.position.set(player.x, player.y, WORLD.playerZ);
  playerGroup.rotation.set(player.pitch, 0, player.bank);
  playerGroup.children
    .filter((child) => child.name === "engineFlame")
    .forEach((flame) => {
      const pulse = 1 + Math.sin(performance.now() * 0.02) * 0.1 + player.thrust * 0.65;
      flame.scale.set(1, pulse, 1);
      flame.material.opacity = 0.72 + player.thrust * 0.28;
    });
}

function updateCamera(dt) {
  const player = state.player;
  const shake = state.shake;
  const shakeX = (Math.random() - 0.5) * shake * 0.22;
  const shakeY = (Math.random() - 0.5) * shake * 0.16;
  if (state.outro.active) {
    const p = clamp(state.outro.age / state.outro.duration, 0, 1);
    const desired = tmpVector.set(shakeX * 0.8, 3.1 + p * 0.9 + shakeY, 12.6 + p * 2.6);
    camera.position.lerp(desired, Math.min(1, dt * 4.2));
    cameraTarget.set(playerGroup.position.x * 0.25, playerGroup.position.y * 0.4 + 0.3, playerGroup.position.z - 8);
    camera.lookAt(cameraTarget);
    return;
  }
  const desired = tmpVector.set(
    player.x * 0.24 + shakeX,
    player.y * 0.38 + 3.2 + shakeY,
    11.8 - player.thrust * 1.2,
  );
  camera.position.lerp(desired, Math.min(1, dt * 4.8));
  cameraTarget.set(player.x * 0.48, player.y * 0.28 + 0.8, -22);
  camera.lookAt(cameraTarget);
}

function updateTargets(dt, current) {
  for (const target of state.targets) {
    target.age += dt;
    target.progress = 1 - (target.arriveAt - current) / target.travel;
    updateTargetObject(target);

    if (!target.dead && !target.missed && !target.passedThrough && canPassThrough(target)) {
      passThroughTarget(target);
    }

    if (!target.dead && !target.missed && target.passedThrough && target.progress >= 1) {
      burstPassedTarget(target);
    }

    if (!target.dead && !target.missed && !target.passedThrough && target.progress >= 1.08) {
      missTarget(target);
    }

    if (target.dead) target.deathAge += dt;
  }

  for (let i = state.targets.length - 1; i >= 0; i -= 1) {
    const target = state.targets[i];
    if ((target.dead && target.deathAge > 0.46) || (target.missed && target.progress > 1.42)) {
      disposeTarget(target);
      state.targets.splice(i, 1);
    }
  }
}

function updateTargetObject(target) {
  const p = clamp(target.progress, -0.06, 1.42);
  const approach = clamp(p, 0, 1);
  const eased = approach * approach * (3 - 2 * approach);
  const pass = p <= 1 ? 0 : clamp((p - 1) / 0.42, 0, 1);
  const z = p <= 1 ? lerp(WORLD.spawnZ, WORLD.hitZ, eased) : lerp(WORLD.hitZ, WORLD.passZ, pass);
  const scale = 0.5 + eased * 0.92 + pass * 0.38;
  if (target.dead && target.freezePosition) {
    target.group.position.copy(target.freezePosition);
    target.group.scale.setScalar(target.freezeScale || scale);
  } else {
    target.group.position.set(target.x, target.y, z);
    target.group.scale.setScalar(scale);
  }
  target.group.quaternion.copy(camera.quaternion);
  target.group.rotation.z += target.tilt + Math.sin(target.age * 2.4 + target.id) * 0.04;

  const missedFade = target.missed ? clamp((target.progress - 1.28) / 0.14, 0, 1) : 0;
  const alpha = target.dead ? Math.max(0, 1 - target.deathAge / 0.46) : 1 - missedFade;
  target.group.children.forEach((child) => {
    if (child.material) {
      child.material.opacity = (child.userData.baseOpacity ?? 1) * alpha;
      if (child.material.color) {
        child.material.color.setHex(target.passedThrough ? 0xb9fff6 : 0xffffff);
      }
    }
  });
}

function canPassThrough(target) {
  if (target.progress < 0.86 || target.progress > 1.12) return false;
  if (state.player.invincible > 0) return false;
  const dx = target.group.position.x - state.player.x;
  const dy = target.group.position.y - state.player.y;
  const dz = target.group.position.z - WORLD.playerZ;
  const lateral = Math.hypot(dx, dy);
  return dz > -6.5 && dz < 2.5 && lateral < target.hitRadius + 1.25 + state.player.thrust * 0.35;
}

function passThroughTarget(target) {
  target.passedThrough = true;
  state.player.invincible = 0.08;
  state.shake = Math.max(state.shake, 0.24);
}

function burstPassedTarget(target) {
  target.freezePosition = target.group.position.clone();
  target.freezeScale = target.group.scale.x;
  target.dead = true;
  target.deathAge = 0;
  state.combo += 1;
  state.passedLyrics = Math.min(state.schedule.length, state.passedLyrics + 1);
  state.score = state.passedLyrics;
  state.shake = Math.max(state.shake, 0.48);
  burstAt(target.group.position, 0x75e0d4, 46, 1.25);
  burstAt(target.group.position, 0xf3b85b, 24, 0.82);
  addShockwave(target.group.position, 0x75e0d4);
}

function missTarget(target) {
  target.missed = true;
  state.combo = 0;
}

function updateEnvironment(dt, time) {
  const speed = 15 + state.player.thrust * 8 + (state.outro.active ? 72 + state.outro.age * 34 : 0);
  const ash = environmentGroup.getObjectByName("ashfall");
  if (ash) {
    const positions = ash.geometry.attributes.position;
    for (let i = 0; i < positions.count; i += 1) {
      let z = positions.getZ(i) + speed * dt * 1.8;
      let y = positions.getY(i) - dt * (0.18 + (i % 7) * 0.035);
      let x = positions.getX(i) + Math.sin(time * 0.35 + i) * dt * 0.04;
      if (z > WORLD.sceneryNearZ || y < GROUND_Y - 0.2) {
        z = WORLD.sceneryFarZ - Math.random() * 24;
        y = GROUND_Y + 6 + Math.random() * 16;
        x = (Math.random() - 0.5) * 110;
      }
      positions.setX(i, x);
      positions.setY(i, y);
      positions.setZ(i, z);
    }
    positions.needsUpdate = true;
  }

  environmentGroup.children.forEach((child) => {
    if (["ashfall", "roadBase", "cityHorizon", "citySky"].includes(child.name)) return;
    if (child.name === "roadSegment") {
      const base = child.userData.base || {};
      child.position.z += speed * dt * (base.drift || 1.24);
      while (child.position.z > WORLD.sceneryNearZ + ROAD_SEGMENT_LENGTH) {
        child.position.z -= ROAD_SEGMENT_LENGTH * ROAD_SEGMENT_COUNT;
      }
      return;
    }
    if (child.name !== "cityObject") return;

    const base = child.userData.base || {};
    child.position.z += speed * dt * (base.drift || 0.65);
    if (base.kind === "rustCloud") {
      child.position.x += Math.sin(time * 0.23 + (base.seed || 0)) * dt * 0.32;
      child.rotation.y += dt * 0.018;
    }
    if (base.kind === "vending" || base.kind === "sign") {
      const pulse = 0.72 + Math.sin(time * 5.7 + (base.seed || 0)) * 0.12;
      child.traverse((part) => {
        if (part.material?.transparent && part.material.color) {
          part.material.opacity = clamp(pulse, 0.24, 0.86);
        }
      });
    }
    if (child.position.z > WORLD.sceneryNearZ) {
      resetCityObject(child);
    }
  });
}

function resetCityObject(object) {
  const base = object.userData.base || {};
  const side = Math.random() > 0.5 ? 1 : -1;
  if (base.kind === "rustCloud") {
    base.x = (Math.random() - 0.5) * 70;
    base.z = WORLD.sceneryFarZ - Math.random() * 48;
  } else if (base.kind === "building" || base.kind === "clockTower") {
    base.x = side * (10 + Math.random() * 28);
    base.z = WORLD.sceneryFarZ - Math.random() * 40;
    base.ry = side * -0.08 + (Math.random() - 0.5) * 0.28;
  } else {
    base.x = side * (7.2 + Math.random() * 8.5);
    base.z = WORLD.sceneryFarZ - Math.random() * 35;
    base.ry = side * -0.35 + (Math.random() - 0.5) * 0.24;
  }
  object.position.set(base.x, 0, base.z);
  object.rotation.y = base.ry || 0;
}

function updateEffects(dt, current) {
  for (const particle of state.particles) {
    particle.age += dt;
    particle.velocity.y -= dt * 1.6;
    particle.mesh.position.addScaledVector(particle.velocity, dt);
    particle.mesh.material.opacity = Math.max(0, 1 - particle.age / particle.life);
    particle.mesh.scale.multiplyScalar(0.992);
  }
  for (let i = state.particles.length - 1; i >= 0; i -= 1) {
    if (state.particles[i].age >= state.particles[i].life) {
      disposeEffect(state.particles[i]);
      state.particles.splice(i, 1);
    }
  }

  for (const wave of state.shockwaves) {
    wave.age += dt;
    const p = wave.age / wave.life;
    wave.mesh.scale.setScalar(0.6 + p * 5.2);
    wave.mesh.material.opacity = Math.max(0, 1 - p) * 0.72;
    wave.mesh.quaternion.copy(camera.quaternion);
  }
  for (let i = state.shockwaves.length - 1; i >= 0; i -= 1) {
    if (state.shockwaves[i].age >= state.shockwaves[i].life) {
      disposeEffect(state.shockwaves[i]);
      state.shockwaves.splice(i, 1);
    }
  }
}

function spawnDueLyrics(current) {
  while (
    state.nextLyric < state.schedule.length &&
    state.schedule[state.nextLyric].time - TRAVEL_TIME <= current
  ) {
    const entry = state.schedule[state.nextLyric];
    const lane = chooseLane(state.nextLyric);
    const group = createLyricTarget(entry.text);
    const target = {
      id: state.nextLyric,
      text: entry.text,
      arriveAt: entry.time,
      travel: TRAVEL_TIME,
      x: lane.x,
      y: lane.y,
      tilt: lane.tilt,
      age: 0,
      deathAge: 0,
      progress: 0,
      dead: false,
      missed: false,
      passedThrough: false,
      group,
      hitRadius: lane.hitRadius,
    };
    targetsGroup.add(group);
    state.targets.push(target);
    state.nextLyric += 1;
  }
}

function chooseLane(index) {
  const portraitAmount = clamp((0.82 - state.width / state.height) / 0.36, 0, 1);
  const xRadius = lerp(6.7, 2.15, portraitAmount);
  const yRadius = lerp(3.25, 1.65, portraitAmount);
  const centerY = lerp(0.9, 0.55, portraitAmount);
  const xJitter = lerp(0.7, 0.22, portraitAmount);
  const yJitter = lerp(0.35, 0.14, portraitAmount);
  const lanePattern = [
    [-0.82, 0.46],
    [0.72, -0.08],
    [-0.28, -0.72],
    [0.36, 0.8],
    [-0.95, -0.58],
    [0.92, 0.22],
    [0.02, 0.96],
    [-0.56, -0.34],
    [0.54, 0.6],
  ];
  const [xLane, yLane] = lanePattern[index % lanePattern.length];
  return {
    x: xLane * xRadius + Math.sin(index * 1.7) * xJitter,
    y: centerY + yLane * yRadius + Math.cos(index * 1.23) * yJitter,
    tilt: Math.sin(index * 2.21) * 0.12,
    hitRadius: 1.35 + (index % 4) * 0.08,
  };
}

function createLyricTarget(text) {
  const textureData = makeLyricTexture(text);
  const texture = new THREE.CanvasTexture(textureData.canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const group = new THREE.Group();
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(textureData.width, textureData.height),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  panel.userData.baseOpacity = 1;
  panel.userData.texture = texture;
  group.add(panel);

  return group;
}

function makeLyricTexture(text) {
  const canvas2d = document.createElement("canvas");
  canvas2d.width = 1024;
  canvas2d.height = 256;
  const ctx = canvas2d.getContext("2d");
  ctx.clearRect(0, 0, canvas2d.width, canvas2d.height);

  let fontSize = 78;
  do {
    ctx.font = `900 ${fontSize}px "Yu Gothic UI", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif`;
    fontSize -= 2;
  } while (fontSize > 38 && ctx.measureText(text).width > 840);

  const textWidth = ctx.measureText(text).width;
  const panelWidth = clamp(textWidth + 154, 430, 960);
  const panelHeight = 136;
  const x = (canvas2d.width - panelWidth) / 2;
  const y = (canvas2d.height - panelHeight) / 2;

  const gradient = ctx.createLinearGradient(x, y, x + panelWidth, y + panelHeight);
  gradient.addColorStop(0, "rgba(6, 10, 16, 0.88)");
  gradient.addColorStop(0.55, "rgba(12, 18, 27, 0.8)");
  gradient.addColorStop(1, "rgba(34, 22, 24, 0.86)");
  ctx.fillStyle = gradient;
  roundRect2d(ctx, x, y, panelWidth, panelHeight, 24);
  ctx.fill();

  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(255, 224, 150, 0.72)";
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(117, 224, 212, 0.32)";
  roundRect2d(ctx, x + 10, y + 10, panelWidth - 20, panelHeight - 20, 18);
  ctx.stroke();

  ctx.shadowColor = "rgba(243, 184, 91, 0.7)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "#fff7df";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas2d.width / 2, canvas2d.height / 2 + 2, panelWidth - 70);
  ctx.shadowBlur = 0;

  return {
    canvas: canvas2d,
    width: panelWidth / 118,
    height: panelHeight / 118,
  };
}

function roundRect2d(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function burstAt(position, color, count, force = 1) {
  const geometry = new THREE.SphereGeometry(0.055, 8, 6);
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const lift = (Math.random() - 0.35) * 1.8;
    const speed = (2.8 + Math.random() * 6.4) * force;
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 1,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry.clone(), material);
    mesh.position.copy(position);
    effectsGroup.add(mesh);
    state.particles.push({
      mesh,
      velocity: new THREE.Vector3(Math.cos(angle) * speed, lift, Math.sin(angle) * speed - 1.5),
      age: 0,
      life: 0.42 + Math.random() * 0.42,
    });
  }
}

function addTurboTrail(position, intensity) {
  const trailLength = 3.2 + intensity * 8.5;
  const scale = playerGroup.scale.x || 1;
  [-1, 1].forEach((side) => {
    const offset = new THREE.Vector3(side * 0.42 * scale, -0.08 * scale, 1.25 * scale)
      .applyQuaternion(playerGroup.quaternion)
      .add(position);
    offset.x += (Math.random() - 0.5) * 0.16;
    offset.y += (Math.random() - 0.5) * 0.14;

    const material = new THREE.MeshBasicMaterial({
      color: side < 0 ? 0x75e0d4 : 0xf3b85b,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.055 + intensity * 0.055, 0.055, trailLength), material);
    mesh.position.copy(offset);
    effectsGroup.add(mesh);
    state.particles.push({
      mesh,
      velocity: new THREE.Vector3((Math.random() - 0.5) * 0.55, (Math.random() - 0.5) * 0.36, 34 + intensity * 46),
      age: 0,
      life: 0.18 + Math.random() * 0.18,
    });
  });
}

function addShockwave(position, color) {
  const mesh = new THREE.Mesh(
    new THREE.RingGeometry(0.96, 1.08, 72),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  mesh.position.copy(position);
  mesh.quaternion.copy(camera.quaternion);
  effectsGroup.add(mesh);
  state.shockwaves.push({ mesh, age: 0, life: 0.36 });
}

function disposeTarget(target) {
  target.group.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (child.material.map) child.material.map.dispose();
      child.material.dispose();
    }
  });
  targetsGroup.remove(target.group);
}

function disposeEffect(effect) {
  if (!effect.mesh) return;
  effect.mesh.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
  });
  effectsGroup.remove(effect.mesh);
}

function render(time) {
  renderer.render(scene, camera);
}

function finish(cleared) {
  state.finished = true;
  state.running = false;
  audio.pause();
  const best = Math.max(Number(localStorage.getItem("lyricStarflightBestPass") || 0), state.score);
  localStorage.setItem("lyricStarflightBestPass", String(best));
  const total = state.schedule.length || 0;
  resultLine.textContent = cleared
    ? `CLEAR  PASS ${state.passedLyrics.toLocaleString()}/${total.toLocaleString()}  BEST ${best.toLocaleString()}`
    : `GAME OVER  PASS ${state.passedLyrics.toLocaleString()}/${total.toLocaleString()}  BEST ${best.toLocaleString()}`;
  startBtn.textContent = "RESTART";
  overlay.classList.remove("is-hidden");
}

function updateHud() {
  const total = state.schedule.length || 0;
  const gauge = total > 0 ? clamp(state.passedLyrics / total, 0, 1) : 0;
  scoreEl.textContent = state.passedLyrics.toLocaleString();
  comboEl.textContent = `${Math.round(gauge * 100)}%`;
  passCountEl.textContent = `${state.passedLyrics}/${total}`;
  progressBar.style.width = `${gauge * 100}%`;
  timeNow.textContent = formatTime(audio.currentTime || 0);
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const min = Math.floor(safe / 60);
  const sec = Math.floor(safe % 60);
  return `${min}:${String(sec).padStart(2, "0")}`;
}

function getTrackDuration() {
  return Number.isFinite(audio.duration) ? audio.duration : TRACK_DURATION_FALLBACK;
}

function pointerFromEvent(event) {
  if (isMobileControlMode() && event.pointerType !== "mouse") {
    state.pointer.active = false;
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const nx = clamp((event.clientX - rect.left) / rect.width, 0, 1);
  const ny = clamp((event.clientY - rect.top) / rect.height, 0, 1);
  state.pointer.x = lerp(WORLD.xMin, WORLD.xMax, nx);
  state.pointer.y = lerp(WORLD.yMax, WORLD.yMin, ny);
  state.player.targetX = state.pointer.x;
  state.player.targetY = state.pointer.y;
}

function isMobileControlMode() {
  return window.matchMedia("(pointer: coarse) and (max-width: 900px)").matches;
}

function updateJoystickFromEvent(event) {
  if (!mobileJoystick || !joystickKnob) return;
  const rect = mobileJoystick.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const maxDistance = rect.width * 0.32;
  const rawX = event.clientX - centerX;
  const rawY = event.clientY - centerY;
  const distance = Math.hypot(rawX, rawY);
  const limit = distance > maxDistance && distance > 0 ? maxDistance / distance : 1;
  const knobX = rawX * limit;
  const knobY = rawY * limit;

  state.joystick.x = clamp(knobX / maxDistance, -1, 1);
  state.joystick.y = clamp(-knobY / maxDistance, -1, 1);
  joystickKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
  mobileJoystick.classList.add("is-active");
}

function resetJoystick() {
  state.joystick.active = false;
  state.joystick.pointerId = null;
  state.joystick.x = 0;
  state.joystick.y = 0;
  if (joystickKnob) {
    joystickKnob.style.transform = "translate(-50%, -50%)";
  }
  mobileJoystick?.classList.remove("is-active");
}

function isDown(code) {
  return state.keys.has(code);
}

function isGameKey(code) {
  return [
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "KeyA",
    "KeyD",
    "KeyW",
    "KeyS",
    "Space",
  ].includes(code);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeInCubic(t) {
  return t * t * t;
}

function easeOutCubic(t) {
  const inv = 1 - t;
  return 1 - inv * inv * inv;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

window.addEventListener("resize", resize);
canvas.addEventListener("pointermove", pointerFromEvent);
canvas.addEventListener("pointerdown", (event) => {
  if (isMobileControlMode() && event.pointerType !== "mouse") {
    state.pointer.active = false;
    return;
  }
  state.pointer.active = true;
  pointerFromEvent(event);
  canvas.setPointerCapture?.(event.pointerId);
});
canvas.addEventListener("pointerup", () => {
  state.pointer.active = false;
});
canvas.addEventListener("pointercancel", () => {
  state.pointer.active = false;
});
if (mobileJoystick) {
  mobileJoystick.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    state.joystick.active = true;
    state.joystick.pointerId = event.pointerId;
    updateJoystickFromEvent(event);
    try {
      mobileJoystick.setPointerCapture?.(event.pointerId);
    } catch {
      // Some synthetic browser events do not have an active pointer to capture.
    }
  });
  mobileJoystick.addEventListener("pointermove", (event) => {
    if (!state.joystick.active || state.joystick.pointerId !== event.pointerId) return;
    event.preventDefault();
    updateJoystickFromEvent(event);
  });
  mobileJoystick.addEventListener("pointerup", (event) => {
    if (state.joystick.pointerId !== event.pointerId) return;
    event.preventDefault();
    resetJoystick();
  });
  mobileJoystick.addEventListener("pointercancel", resetJoystick);
  mobileJoystick.addEventListener("lostpointercapture", resetJoystick);
  mobileJoystick.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
}
window.addEventListener("blur", resetJoystick);
window.addEventListener("keydown", (event) => {
  if (isGameKey(event.code)) {
    event.preventDefault();
    state.keys.add(event.code);
  }
  if (event.key.toLowerCase() === "p") togglePause();
  if (event.key.toLowerCase() === "r") restart();
});
window.addEventListener("keyup", (event) => {
  state.keys.delete(event.code);
});
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", restart);
muteBtn.addEventListener("click", () => {
  audio.muted = !audio.muted;
  muteBtn.textContent = audio.muted ? "×" : "♪";
});
audio.addEventListener("loadedmetadata", () => {
  rebuildAutoScheduleIfNeeded();
});

resize();
state.lyricsPromise = loadLyrics().then(() => {
  rebuildAutoScheduleIfNeeded();
  updateCamera(1);
  render(0);
});
