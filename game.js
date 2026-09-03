import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

/* ============================================================
   APEX DRIVE — ULTIMATE 3D RACING ENGINE
   ============================================================ */

const CONFIG = {
  MAX_SPEED: 92,
  REVERSE_SPEED: 25,
  ACCELERATION: 42,
  BRAKE_POWER: 70,
  FRICTION: 2.8,
  STEER_SPEED: 2.1,
  NITRO_POWER: 70,
  NITRO_DRAIN: 30,
  NITRO_RECHARGE: 7,
  TOTAL_LAPS: 3,
  AI_COUNT: 5,
  WORLD_SIZE: 2200
};

/* ============================================================
   BASIC SETUP
   ============================================================ */

const gameRoot = document.getElementById("game");

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x07101b);

scene.fog = new THREE.FogExp2(
  0x07101b,
  0.0012
);

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  4000
);

camera.position.set(0, 7, 15);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

renderer.toneMapping =
  THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.15;

gameRoot.appendChild(renderer.domElement);


/* ============================================================
   LIGHTING
   ============================================================ */

const hemisphere =
  new THREE.HemisphereLight(
    0xaed7ff,
    0x152016,
    2
  );

scene.add(hemisphere);

const sun =
  new THREE.DirectionalLight(
    0xffffff,
    3.2
  );

sun.position.set(
  -400,
  650,
  250
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -900;
sun.shadow.camera.right = 900;
sun.shadow.camera.top = 900;
sun.shadow.camera.bottom = -900;

scene.add(sun);


/* ============================================================
   MATERIAL HELPERS
   ============================================================ */

function material(
  color,
  roughness = 0.65,
  metalness = 0
) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness
  });
}

function cube(
  width,
  height,
  depth,
  mat
) {
  const mesh =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        depth
      ),
      mat
    );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}


/* ============================================================
   WORLD MATERIALS
   ============================================================ */

const roadMaterial =
  material(
    0x20252b,
    0.95,
    0
  );

const sidewalkMaterial =
  material(
    0x51545a,
    0.9
  );

const grassMaterial =
  material(
    0x10251a,
    1
  );

const lineMaterial =
  material(
    0xe6dfbf,
    0.55
  );

const darkMaterial =
  material(
    0x101419,
    0.4,
    0.7
  );


/* ============================================================
   GROUND
   ============================================================ */

const ground =
  cube(
    CONFIG.WORLD_SIZE,
    2,
    CONFIG.WORLD_SIZE,
    grassMaterial
  );

ground.position.y = -2;

scene.add(ground);


/* ============================================================
   CITY GRID
   ============================================================ */

const ROAD_WIDTH = 38;
const BLOCK_SIZE = 150;

const cityBuildings = [];
const streetLights = [];

for (
  let x = -1000;
  x <= 1000;
  x += BLOCK_SIZE
) {

  const road =
    cube(
      ROAD_WIDTH,
      0.5,
      2050,
      roadMaterial
    );

  road.position.set(
    x,
    -0.65,
    0
  );

  scene.add(road);

  const leftSidewalk =
    cube(
      7,
      0.7,
      2050,
      sidewalkMaterial
    );

  leftSidewalk.position.set(
    x - ROAD_WIDTH / 2 - 4,
    -0.45,
    0
  );

  scene.add(leftSidewalk);

  const rightSidewalk =
    cube(
      7,
      0.7,
      2050,
      sidewalkMaterial
    );

  rightSidewalk.position.set(
    x + ROAD_WIDTH / 2 + 4,
    -0.45,
    0
  );

  scene.add(rightSidewalk);
}


for (
  let z = -1000;
  z <= 1000;
  z += BLOCK_SIZE
) {

  const road =
    cube(
      2050,
      0.5,
      ROAD_WIDTH,
      roadMaterial
    );

  road.position.set(
    0,
    -0.65,
    z
  );

  scene.add(road);

  const topSidewalk =
    cube(
      2050,
      0.7,
      7,
      sidewalkMaterial
    );

  topSidewalk.position.set(
    0,
    -0.45,
    z - ROAD_WIDTH / 2 - 4
  );

  scene.add(topSidewalk);

  const bottomSidewalk =
    cube(
      2050,
      0.7,
      7,
      sidewalkMaterial
    );

  bottomSidewalk.position.set(
    0,
    -0.45,
    z + ROAD_WIDTH / 2 + 4
  );

  scene.add(bottomSidewalk);
}


/* ============================================================
   ROAD MARKINGS
   ============================================================ */

for (
  let x = -1000;
  x <= 1000;
  x += BLOCK_SIZE
) {

  for (
    let z = -980;
    z <= 980;
    z += 28
  ) {

    const marking =
      cube(
        0.7,
        0.08,
        13,
        lineMaterial
      );

    marking.position.set(
      x,
      -0.34,
      z
    );

    scene.add(marking);
  }
}


for (
  let z = -1000;
  z <= 1000;
  z += BLOCK_SIZE
) {

  for (
    let x = -980;
    x <= 980;
    x += 28
  ) {

    const marking =
      cube(
        13,
        0.08,
        0.7,
        lineMaterial
      );

    marking.position.set(
      x,
      -0.34,
      z
    );

    scene.add(marking);
  }
}


/* ============================================================
   BUILDINGS
   ============================================================ */

const buildingMaterials = [
  material(0x263341, 0.75),
  material(0x35404a, 0.7),
  material(0x242d39, 0.8),
  material(0x3d3c43, 0.75),
  material(0x233a3c, 0.7),
  material(0x303b51, 0.7)
];


function createBuilding(
  x,
  z,
  width,
  depth,
  height
) {

  const mat =
    buildingMaterials[
      Math.floor(
        Math.random() *
        buildingMaterials.length
      )
    ];

  const building =
    cube(
      width,
      height,
      depth,
      mat
    );

  building.position.set(
    x,
    height / 2 - 1,
    z
  );

  scene.add(building);

  cityBuildings.push(building);

  createWindows(
    building,
    width,
    depth,
    height
  );

  return building;
}


function createWindows(
  building,
  width,
  depth,
  height
) {

  const windowMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xffd978,
      emissive: 0xffa928,
      emissiveIntensity: 1.3
    });

  const rows =
    Math.min(
      12,
      Math.floor(height / 5)
    );

  const columns =
    Math.min(
      8,
      Math.floor(width / 5)
    );

  for (
    let row = 0;
    row < rows;
    row++
  ) {

    for (
      let col = 0;
      col < columns;
      col++
    ) {

      if (
        Math.random() < 0.25
      ) continue;

      const w =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            1.1,
            1.5,
            0.12
          ),
          windowMaterial
        );

      w.position.set(
        building.position.x -
          width / 2 +
          3 +
          col * 4.5,

        3 +
          row * 4.5,

        building.position.z +
          depth / 2 +
          0.08
      );

      scene.add(w);
    }
  }
}


for (
  let x = -925;
  x <= 925;
  x += BLOCK_SIZE
) {

  for (
    let z = -925;
    z <= 925;
    z += BLOCK_SIZE
  ) {

    if (
      Math.abs(x) < 190 &&
      Math.abs(z) < 190
    ) {
      continue;
    }

    const offset =
      ROAD_WIDTH / 2 +
      45;

    const positions = [
      [x - offset, z - offset],
      [x + offset, z - offset],
      [x - offset, z + offset],
      [x + offset, z + offset]
    ];

    positions.forEach(
      ([bx, bz]) => {

        const width =
          38 + Math.random() * 27;

        const depth =
          38 + Math.random() * 27;

        const height =
          18 + Math.random() * 85;

        createBuilding(
          bx +
            (Math.random() * 8 - 4),
          bz +
            (Math.random() * 8 - 4),
          width,
          depth,
          height
        );
      }
    );
  }
}


/* ============================================================
   STREET LIGHTS
   ============================================================ */

function createStreetLight(
  x,
  z
) {

  const group =
    new THREE.Group();

  const pole =
    cube(
      0.8,
      8,
      0.8,
      darkMaterial
    );

  pole.position.y = 3.5;

  group.add(pole);

  const arm =
    cube(
      3,
      0.45,
      0.45,
      darkMaterial
    );

  arm.position.set(
    1.3,
    7.2,
    0
  );

  group.add(arm);

  const lamp =
    new THREE.PointLight(
      0xffd58a,
      20,
      30
    );

  lamp.position.set(
    2.7,
    7,
    0
  );

  group.add(lamp);

  group.position.set(
    x,
    0,
    z
  );

  scene.add(group);

  streetLights.push(group);
}


for (
  let x = -900;
  x <= 900;
  x += 75
) {

  for (
    let z = -900;
    z <= 900;
    z += 75
  ) {

    if (
      Math.random() < 0.65
    ) {
      createStreetLight(
        x + 18,
        z + 18
      );
    }
  }
}


/* ============================================================
   RACING ROUTE
============================================================ */

const route = [

  new THREE.Vector3(
    -120, 0, 120
  ),

  new THREE.Vector3(
    -120, 0, -720
  ),

  new THREE.Vector3(
    420, 0, -720
  ),

  new THREE.Vector3(
    420, 0, 720
  ),

  new THREE.Vector3(
    -420, 0, 720
  ),

  new THREE.Vector3(
    -420, 0, 120
  ),

  new THREE.Vector3(
    -120, 0, 120
  )
];


/* ============================================================
   START/FINISH LINE
============================================================ */

function createStartLine() {

  const group =
    new THREE.Group();

  for (
    let x = -18;
    x <= 18;
    x += 4
  ) {

    const square =
      cube(
        4,
        0.08,
        6,
        ((x / 4) % 2 === 0)
          ? lineMaterial
          : darkMaterial
      );

    square.position.set(
      x,
      -0.25,
      120
    );

    group.add(square);
  }

  scene.add(group);
}

createStartLine();


/* ============================================================
   CAR MATERIALS
============================================================ */

function carMaterial(
  color
) {

  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.23,
    metalness: 0.8
  });
}


/* ============================================================
   CAR CREATION
============================================================ */

function createCar(
  color
) {

  const car =
    new THREE.Group();

  car.userData.velocity = 0;
  car.userData.steering = 0;
  car.userData.nitro = 100;

  const body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        6,
        1.2,
        10
      ),
      carMaterial(color)
    );

  body.position.y = 1.45;
  body.castShadow = true;

  car.add(body);


  const hood =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        5.5,
        0.65,
        3.3
      ),
      carMaterial(color)
    );

  hood.position.set(
    0,
    1.9,
    3.15
  );

  car.add(hood);


  const cabin =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        4.5,
        1.35,
        4.7
      ),
      new THREE.MeshStandardMaterial({
        color: 0x101820,
        roughness: 0.08,
        metalness: 0.65
      })
    );

  cabin.position.set(
    0,
    2.45,
    -0.4
  );

  cabin.castShadow = true;

  car.add(cabin);


  const windshield =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        4.15,
        0.85,
        0.15
      ),
      new THREE.MeshStandardMaterial({
        color: 0x27465a,
        roughness: 0.05,
        metalness: 0.5
      })
    );

  windshield.position.set(
    0,
    2.5,
    1.98
  );

  windshield.rotation.x =
    -0.15;

  car.add(windshield);


  const rearGlass =
    windshield.clone();

  rearGlass.position.z =
    -2.7;

  rearGlass.rotation.x =
    0.15;

  car.add(rearGlass);


  const wheelMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x08090b,
      roughness: 0.8,
      metalness: 0.1
    });


  car.userData.wheels = [];


  for (
    const x of [-3.05, 3.05]
  ) {

    for (
      const z of [-3.25, 3.25]
    ) {

      const wheel =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            1.25,
            1.25,
            0.85,
            20
          ),
          wheelMaterial
        );

      wheel.rotation.z =
        Math.PI / 2;

      wheel.position.set(
        x,
        1.05,
        z
      );

      wheel.castShadow = true;

      car.add(wheel);

      car.userData.wheels.push(
        wheel
      );
    }
  }


  const headlightMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xdff4ff,
      emissiveIntensity: 3
    });


  for (
    const x of [-1.8, 1.8]
  ) {

    const light =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.2,
          0.45,
          0.18
        ),
        headlightMaterial
      );

    light.position.set(
      x,
      1.65,
      5.05
    );

    car.add(light);
  }


  const tailMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xff1010,
      emissive: 0xff0000,
      emissiveIntensity: 2
    });


  for (
    const x of [-1.8, 1.8]
  ) {

    const tail =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.3,
          0.4,
          0.18
        ),
        tailMaterial
      );

    tail.position.set(
      x,
      1.65,
      -5.05
    );

    car.add(tail);
  }


  const exhaustGroup =
    new THREE.Group();

  for (
    const x of [-1.7, 1.7]
  ) {

    const flame =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          0.5,
          2.2,
          12
        ),
        new THREE.MeshBasicMaterial({
          color: 0x66d9ff,
          transparent: true,
          opacity: 0
        })
      );

    flame.rotation.x =
      -Math.PI / 2;

    flame.position.set(
      x,
      1,
      -5.8
    );

    exhaustGroup.add(flame);
  }

  car.add(exhaustGroup);

  car.userData.exhaust =
    exhaustGroup.children;

  return car;
}


/* ============================================================
   PLAYER
============================================================ */

const player =
  createCar(0x1976ff);

player.position.copy(
  route[0]
);

player.position.x = 0;
player.position.z = 150;

player.rotation.y =
  Math.PI;

scene.add(player);


/* ============================================================
   AI RACERS
============================================================ */

const aiColors = [
  0xff3028,
  0xffb400,
  0x8b46ff,
  0x00c994,
  0xff4c9c
];

const aiCars = [];


for (
  let i = 0;
  i < CONFIG.AI_COUNT;
  i++
) {

  const ai =
    createCar(
      aiColors[i]
    );

  ai.position.copy(
    route[0]
  );

  ai.position.x =
    (i - 2) * 8;

  ai.position.z =
    175 + i * 8;

  ai.rotation.y =
    Math.PI;

  ai.userData.routeProgress =
    i * 0.08;

  ai.userData.lap = 1;

  ai.userData.aiSpeed =
    48 + Math.random() * 13;

  scene.add(ai);

  aiCars.push(ai);
}


/* ============================================================
   GAME STATE
============================================================ */

const state = {

  running: false,

  paused: false,

  countdown: 3,

  raceStarted: false,

  finished: false,

  speed: 0,

  gear: 1,

  nitro: 100,

  lap: 1,

  checkpoint: 0,

  raceTime: 0,

  lapTime: 0,

  bestLap: Infinity,

  cameraMode: "chase",

  weather: "clear",

  selectedTrack: "city",

  coins: 2500,

  level: 1,

  position: 1,

  steering: 0

};


/* ============================================================
   INPUT
============================================================ */

const keys = {};

window.addEventListener(
  "keydown",
  event => {

    keys[event.code] = true;

    if (
      event.code === "Space"
    ) {
      event.preventDefault();
    }

    if (
      event.code === "KeyR"
    ) {
      resetRace();
    }

    if (
      event.code === "Escape"
    ) {
      togglePause();
    }
  }
);


window.addEventListener(
  "keyup",
  event => {
    keys[event.code] = false;
  }
);


/* ============================================================
   MOBILE INPUT
============================================================ */

function holdButton(
  id,
  key
) {

  const button =
    document.getElementById(id);

  if (!button) return;

  const down = event => {

    event.preventDefault();

    keys[key] = true;
  };

  const up = event => {

    event.preventDefault();

    keys[key] = false;
  };

  button.addEventListener(
    "pointerdown",
    down
  );

  button.addEventListener(
    "pointerup",
    up
  );

  button.addEventListener(
    "pointercancel",
    up
  );

  button.addEventListener(
    "pointerleave",
    up
  );
}


holdButton(
  "steerLeft",
  "KeyA"
);

holdButton(
  "steerRight",
  "KeyD"
);

holdButton(
  "accelerateButton",
  "KeyW"
);

holdButton(
  "brakeButton",
  "KeyS"
);

holdButton(
  "nitroButton",
  "Space"
);


/* ============================================================
   PLAYER PHYSICS
============================================================ */

function updatePlayer(
  delta
) {

  if (
    !state.raceStarted ||
    state.finished ||
    state.paused
  ) {
    return;
  }


  let acceleration = 0;


  if (
    keys.KeyW ||
    keys.ArrowUp
  ) {

    acceleration =
      CONFIG.ACCELERATION;
  }


  if (
    keys.KeyS ||
    keys.ArrowDown
  ) {

    acceleration =
      -CONFIG.BRAKE_POWER;
  }


  player.userData.velocity +=
    acceleration * delta;


  if (
    !keys.KeyW &&
    !keys.ArrowUp &&
    !keys.KeyS &&
    !keys.ArrowDown
  ) {

    player.userData.velocity *=
      Math.max(
        0,
        1 - CONFIG.FRICTION * delta
      );
  }


  player.userData.velocity =
    THREE.MathUtils.clamp(
      player.userData.velocity,
      -CONFIG.REVERSE_SPEED,
      CONFIG.MAX_SPEED
    );


  let steer = 0;


  if (
    keys.KeyA ||
    keys.ArrowLeft
  ) {
    steer -= 1;
  }


  if (
    keys.KeyD ||
    keys.ArrowRight
  ) {
    steer += 1;
  }


  state.steering = steer;


  const speedRatio =
    Math.min(
      Math.abs(
        player.userData.velocity
      ) / CONFIG.MAX_SPEED,
      1
    );


  player.rotation.y -=
    steer *
    CONFIG.STEER_SPEED *
    delta *
    speedRatio;


  /* NITRO */

  const boosting =
    keys.Space &&
    state.nitro > 0 &&
    player.userData.velocity > 10;


  if (boosting) {

    player.userData.velocity +=
      CONFIG.NITRO_POWER *
      delta;

    state.nitro -=
      CONFIG.NITRO_DRAIN *
      delta;

  } else {

    state.nitro +=
      CONFIG.NITRO_RECHARGE *
      delta;
  }


  state.nitro =
    THREE.MathUtils.clamp(
      state.nitro,
      0,
      100
    );


  /* MOVEMENT */

  player.translateZ(
    player.userData.velocity *
    delta
  );


  /* WHEELS */

  player.userData.wheels
    .forEach(
      wheel => {

        wheel.rotation.x -=
          player.userData.velocity *
          delta *
          0.7;
      }
    );


  /* EXHAUST */

  player.userData.exhaust
    .forEach(
      flame => {

        flame.material.opacity =
          boosting
            ? 0.85 +
              Math.random() * 0.15
            : 0;
      }
    );


  state.speed =
    Math.abs(
      player.userData.velocity
    ) * 3.6;


  state.gear =
    Math.max(
      1,
      Math.min(
        7,
        Math.floor(
          state.speed / 35
        ) + 1
      )
    );
}


/* ============================================================
   AI SYSTEM
============================================================ */

function updateAI(
  ai,
  delta
) {

  if (
    !state.raceStarted ||
    state.finished ||
    state.paused
  ) {
    return;
  }


  const total =
    route.length;


  ai.userData.routeProgress +=
    (
      ai.userData.aiSpeed *
      delta
    ) / 120;


  if (
    ai.userData.routeProgress >=
    total
  ) {

    ai.userData.routeProgress -=
      total;

    ai.userData.lap++;

    if (
      ai.userData.lap >
      CONFIG.TOTAL_LAPS
    ) {

      ai.userData.lap =
        CONFIG.TOTAL_LAPS;
    }
  }


  const index =
    Math.floor(
      ai.userData.routeProgress
    );


  const nextIndex =
    (
      index + 1
    ) % route.length;


  const target =
    route[nextIndex];


  const desired =
    Math.atan2(
      target.x -
        ai.position.x,

      target.z -
        ai.position.z
    );


  const difference =
    Math.atan2(
      Math.sin(
        desired -
        ai.rotation.y
      ),

      Math.cos(
        desired -
        ai.rotation.y
      )
    );


  ai.rotation.y +=
    THREE.MathUtils.clamp(
      difference,
      -delta * 2.5,
      delta * 2.5
    );


  ai.translateZ(
    ai.userData.aiSpeed *
    delta
  );


  ai.userData.wheels
    .forEach(
      wheel => {

        wheel.rotation.x -=
          ai.userData.aiSpeed *
          delta *
          0.7;
      }
    );
}


/* ============================================================
   POSITION SYSTEM
============================================================ */

function calculateProgress(
  car
) {

  let closest =
    Infinity;

  let index = 0;

  for (
    let i = 0;
    i < route.length - 1;
    i++
  ) {

    const distance =
      car.position.distanceTo(
        route[i]
      );

    if (
      distance < closest
    ) {

      closest = distance;
      index = i;
    }
  }

  return index;
}


function updatePosition() {

  const playerProgress =
    state.lap * 100 +
    calculateProgress(
      player
    );


  let position = 1;


  aiCars.forEach(
    ai => {

      const progress =
        ai.userData.lap *
          100 +
        calculateProgress(
          ai
        );

      if (
        progress >
        playerProgress
      ) {
        position++;
      }
    }
  );


  state.position =
    Math.min(
      6,
      position
    );
}


/* ============================================================
   CHECKPOINTS + LAPS
============================================================ */

function updateRaceProgress() {

  const target =
    route[
      state.checkpoint + 1
    ] || route[0];


  const distance =
    player.position.distanceTo(
      target
    );


  if (
    distance < 65
  ) {

    state.checkpoint++;


    if (
      state.checkpoint >=
      route.length - 1
    ) {

      state.checkpoint = 0;

      completeLap();
    }
  }
}


function completeLap() {

  const currentLap =
    state.lapTime;


  if (
    currentLap <
    state.bestLap
  ) {

    state.bestLap =
      currentLap;
  }


  state.lapTime = 0;

  state.lap++;


  showMessage(
    `LAP ${Math.min(
      state.lap,
      CONFIG.TOTAL_LAPS
    )}`,
    1600
  );


  if (
    state.lap >
    CONFIG.TOTAL_LAPS
  ) {

    finishRace();
  }
}


/* ============================================================
   COLLISION SYSTEM
============================================================ */

function checkCarCollisions() {

  aiCars.forEach(
    ai => {

      const distance =
        player.position.distanceTo(
          ai.position
        );


      if (
        distance < 7
      ) {

        const direction =
          player.position
            .clone()
            .sub(ai.position)
            .normalize();


        player.position.add(
          direction.multiplyScalar(
            0.8
          )
        );


        player.userData.velocity *=
          0.55;


        ai.userData.aiSpeed *=
          0.94;
      }
    }
  );
}


/* ============================================================
   CAMERA
============================================================ */

const desiredCamera =
  new THREE.Vector3();

const cameraLook =
  new THREE.Vector3();


function updateCamera(
  delta
) {

  const forward =
    new THREE.Vector3(
      0,
      0,
      1
    );

  forward.applyQuaternion(
    player.quaternion
  );


  if (
    state.cameraMode ===
    "close"
  ) {

    desiredCamera
      .copy(player.position)
      .add(
        forward
          .clone()
          .multiplyScalar(-10)
      );

    desiredCamera.y += 4.5;

  } else if (
    state.cameraMode ===
    "hood"
  ) {

    desiredCamera
      .copy(player.position)
      .add(
        forward
          .clone()
          .multiplyScalar(2)
      );

    desiredCamera.y += 2.7;

  } else {

    desiredCamera
      .copy(player.position)
      .add(
        forward
          .clone()
          .multiplyScalar(-18)
      );

    desiredCamera.y += 8;
  }


  camera.position.lerp(
    desiredCamera,
    1 -
      Math.pow(
        0.001,
        delta
      )
  );


  cameraLook
    .copy(player.position);

  cameraLook.y += 2;


  camera.lookAt(
    cameraLook
  );
}


/* ============================================================
   MINIMAP
============================================================ */

const mapCanvas =
  document.getElementById(
    "miniMap"
  );

const mapContext =
  mapCanvas
    ? mapCanvas.getContext("2d")
    : null;


function updateMiniMap() {

  if (!mapContext)
    return;


  const width =
    mapCanvas.width;

  const height =
    mapCanvas.height;


  mapContext.clearRect(
    0,
    0,
    width,
    height
  );


  mapContext.fillStyle =
    "#080c13";

  mapContext.fillRect(
    0,
    0,
    width,
    height
  );


  mapContext.strokeStyle =
    "#777";

  mapContext.lineWidth =
    4;


  mapContext.beginPath();


  route.forEach(
    (point, index) => {

      const x =
        width / 2 +
        point.x / 10;

      const y =
        height / 2 +
        point.z / 10;


      if (
        index === 0
      ) {
        mapContext.moveTo(
          x,
          y
        );
      } else {
        mapContext.lineTo(
          x,
          y
        );
      }
    }
  );


  mapContext.stroke();


  const px =
    width / 2 +
    player.position.x / 10;

  const py =
    height / 2 +
    player.position.z / 10;


  mapContext.fillStyle =
    "#ffffff";

  mapContext.beginPath();

  mapContext.arc(
    px,
    py,
    5,
    0,
    Math.PI * 2
  );

  mapContext.fill();


  aiCars.forEach(
    ai => {

      const ax =
        width / 2 +
        ai.position.x / 10;

      const ay =
        height / 2 +
        ai.position.z / 10;


      mapContext.fillStyle =
        "#ff3b30";

      mapContext.beginPath();

      mapContext.arc(
        ax,
        ay,
        3,
        0,
        Math.PI * 2
      );

      mapContext.fill();
    }
  );
}


/* ============================================================
   UI
============================================================ */

function setText(
  id,
  value
) {

  const element =
    document.getElementById(id);

  if (
    element
  ) {
    element.textContent =
      value;
  }
}


function formatTime(
  seconds
) {

  const minutes =
    Math.floor(
      seconds / 60
    );

  const secs =
    seconds % 60;

  return (
    String(minutes)
      .padStart(2, "0") +
    ":" +
    secs.toFixed(3)
      .padStart(6, "0")
  );
}


function updateHUD() {

  setText(
    "speed",
    Math.round(
      state.speed
    )
  );

  setText(
    "gear",
    state.gear
  );

  setText(
    "positionNumber",
    state.position
  );

  setText(
    "lapNumber",
    Math.min(
      state.lap,
      CONFIG.TOTAL_LAPS
    )
  );

  setText(
    "checkpointNumber",
    state.checkpoint + 1
  );

  setText(
    "raceTime",
    formatTime(
      state.raceTime
    )
  );

  setText(
    "bestTime",
    state.bestLap === Infinity
      ? "--:--.---"
      : formatTime(
          state.bestLap
        )
  );

  setText(
    "nitroPercent",
    `${Math.round(
      state.nitro
    )}%`
  );


  const nitroBar =
    document.getElementById(
      "nitroBar"
    );

  if (
    nitroBar
  ) {

    nitroBar.style.width =
      `${state.nitro}%`;
  }
}


/* ============================================================
   MESSAGE SYSTEM
============================================================ */

let messageTimer = null;


function showMessage(
  text,
  duration = 1200
) {

  const element =
    document.getElementById(
      "raceMessage"
    );

  if (!element)
    return;


  element.textContent =
    text;

  element.classList.add(
    "show"
  );


  clearTimeout(
    messageTimer
  );


  messageTimer =
    setTimeout(
      () => {

        element.classList.remove(
          "show"
        );

      },
      duration
    );
}


/* ============================================================
   COUNTDOWN
============================================================ */

async function countdown() {

  const element =
    document.getElementById(
      "countdown"
    );

  if (!element)
    return;


  state.raceStarted =
    false;


  for (
    let number = 3;
    number >= 1;
    number--
  ) {

    element.textContent =
      number;

    element.classList.add(
      "active"
    );

    await wait(
      900
    );
  }


  element.textContent =
    "GO!";

  await wait(
    700
  );


  element.classList.remove(
    "active"
  );


  state.raceStarted =
    true;
}


function wait(
  milliseconds
) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        milliseconds
      )
  );
}


/* ============================================================
   START RACE
============================================================ */

async function startRace() {

  const menu =
    document.getElementById(
      "mainMenu"
    );

  if (menu) {
    menu.classList.add(
      "hidden"
    );
  }


  const hud =
    document.getElementById(
      "hud"
    );

  if (hud) {
    hud.classList.add(
      "visible"
    );
  }


  const mobile =
    document.getElementById(
      "mobileControls"
    );

  if (mobile) {
    mobile.classList.add(
      "visible"
    );
  }


  resetRace();

  await countdown();

  state.running =
    true;
}


/* ============================================================
   RESET
============================================================ */

function resetRace() {

  player.position.copy(
    route[0]
  );

  player.position.x = 0;
  player.position.z = 150;

  player.rotation.y =
    Math.PI;

  player.userData.velocity =
    0;


  state.speed = 0;
  state.nitro = 100;
  state.lap = 1;
  state.checkpoint = 0;
  state.raceTime = 0;
  state.lapTime = 0;
  state.finished = false;
  state.paused = false;


  aiCars.forEach(
    (ai, index) => {

      ai.position.copy(
        route[0]
      );

      ai.position.x =
        (index - 2) * 8;

      ai.position.z =
        175 + index * 8;

      ai.rotation.y =
        Math.PI;

      ai.userData.routeProgress =
        index * 0.08;

      ai.userData.lap =
        1;

      ai.userData.aiSpeed =
        48 + Math.random() * 13;
    }
  );


  const finish =
    document.getElementById(
      "finishScreen"
    );

  if (finish) {
    finish.classList.remove(
      "visible"
    );
  }
}


/* ============================================================
   FINISH
============================================================ */

function finishRace() {

  state.finished =
    true;

  state.running =
    false;


  player.userData.velocity =
    0;


  const reward =
    Math.max(
      100,
      700 -
        (state.position - 1) *
        100
    );


  state.coins +=
    reward;


  setText(
    "finalPosition",
    state.position
  );

  setText(
    "finalTime",
    formatTime(
      state.raceTime
    )
  );

  setText(
    "finalLap",
    state.bestLap === Infinity
      ? "--:--.---"
      : formatTime(
          state.bestLap
        )
  );

  setText(
    "finalReward",
    `+${reward} 🪙`
  );


  setText(
    "playerCoins",
    state.coins
  );


  const screen =
    document.getElementById(
      "finishScreen"
    );

  if (screen) {
    screen.classList.add(
      "visible"
    );
  }
}


/* ============================================================
   PAUSE
============================================================ */

function togglePause() {

  if (
    !state.running ||
    state.finished
  ) {
    return;
  }


  state.paused =
    !state.paused;


  const pause =
    document.getElementById(
      "pauseScreen"
    );


  if (
    state.paused
  ) {

    pause?.classList.add(
      "visible"
    );

  } else {

    pause?.classList.remove(
      "visible"
    );
  }
}


/* ============================================================
   MENU SYSTEM
============================================================ */

function openScreen(
  id
) {

  const screen =
    document.getElementById(
      id
    );

  if (screen) {
    screen.classList.add(
      "visible"
    );
  }
}


function closeScreen(
  id
) {

  const screen =
    document.getElementById(
      id
    );

  if (screen) {
    screen.classList.remove(
      "visible"
    );
  }
}


/* ============================================================
   MENU EVENTS
============================================================ */

document
  .getElementById(
    "startRaceButton"
  )
  ?.addEventListener(
    "click",
    startRace
  );


document
  .getElementById(
    "garageButton"
  )
  ?.addEventListener(
    "click",
    () =>
      openScreen(
        "garageScreen"
      )
  );


document
  .getElementById(
    "tracksButton"
  )
  ?.addEventListener(
    "click",
    () =>
      openScreen(
        "tracksScreen"
      )
  );


document
  .getElementById(
    "settingsButton"
  )
  ?.addEventListener(
    "click",
    () =>
      openScreen(
        "settingsScreen"
      )
  );


document
  .querySelectorAll(
    "[data-close]"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () =>
          closeScreen(
            button.dataset.close
          )
      );
    }
  );


document
  .getElementById(
    "pauseButton"
  )
  ?.addEventListener(
    "click",
    togglePause
  );


document
  .getElementById(
    "resumeButton"
  )
  ?.addEventListener(
    "click",
    togglePause
  );


document
  .getElementById(
    "pauseRestartButton"
  )
  ?.addEventListener(
    "click",
    () => {

      closeScreen(
        "pauseScreen"
      );

      resetRace();

      countdown();
    }
  );


document
  .getElementById(
    "pauseMenuButton"
  )
  ?.addEventListener(
    "click",
    () => {

      closeScreen(
        "pauseScreen"
      );

      document
        .getElementById(
          "hud"
        )
        ?.classList.remove(
          "visible"
        );

      document
        .getElementById(
          "mobileControls"
        )
        ?.classList.remove(
          "visible"
        );

      document
        .getElementById(
          "mainMenu"
        )
        ?.classList.remove(
          "hidden"
        );

      state.running =
        false;
    }
  );


document
  .getElementById(
    "restartButton"
  )
  ?.addEventListener(
    "click",
    () => {

      closeScreen(
        "finishScreen"
      );

      resetRace();

      countdown();
    }
  );


document
  .getElementById(
    "menuButton"
  )
  ?.addEventListener(
    "click",
    () => {

      closeScreen(
        "finishScreen"
      );

      document
        .getElementById(
          "hud"
        )
        ?.classList.remove(
          "visible"
        );

      document
        .getElementById(
          "mobileControls"
        )
        ?.classList.remove(
          "visible"
        );

      document
        .getElementById(
          "mainMenu"
        )
        ?.classList.remove(
          "hidden"
        );
    }
  );


/* ============================================================
   CAR SELECTION
============================================================ */

const cars = [

  {
    name: "APEX GT",
    color: 0x1976ff,
    speed: 92,
    acceleration: 88,
    handling: 84,
    nitro: 95
  },

  {
    name: "VORTEX R",
    color: 0xff3028,
    speed: 97,
    acceleration: 91,
    handling: 79,
    nitro: 90
  },

  {
    name: "PHANTOM X",
    color: 0x8b46ff,
    speed: 94,
    acceleration: 95,
    handling: 92,
    nitro: 88
  },

  {
    name: "STORM GT",
    color: 0x00c994,
    speed: 89,
    acceleration: 86,
    handling: 97,
    nitro: 93
  }

];


document
  .querySelectorAll(
    ".carCard"
  )
  .forEach(
    card => {

      card.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              ".carCard"
            )
            .forEach(
              c =>
                c.classList.remove(
                  "selected"
                )
            );


          card.classList.add(
            "selected"
          );


          const car =
            cars[
              Number(
                card.dataset.car
              )
            ];


          if (!car)
            return;


          setText(
            "selectedCarName",
            car.name
          );

          setText(
            "carSpeed",
            car.speed
          );

          setText(
            "carAcceleration",
            car.acceleration
          );

          setText(
            "carHandling",
            car.handling
          );

          setText(
            "carNitro",
            car.nitro
          );
        }
      );
    }
  );


/* ============================================================
   CAMERA SETTINGS
============================================================ */

document
  .getElementById(
    "cameraMode"
  )
  ?.addEventListener(
    "change",
    event => {

      state.cameraMode =
        event.target.value;
    }
  );


/* ============================================================
   WEATHER
============================================================ */

let rainGroup = null;


function createRain() {

  rainGroup =
    new THREE.Group();


  const count = 1600;

  const geometry =
    new THREE.BufferGeometry();

  const positions =
    new Float32Array(
      count * 3
    );


  for (
    let i = 0;
    i < count;
    i++
  ) {

    positions[i * 3] =
      (Math.random() - 0.5) *
      1800;

    positions[i * 3 + 1] =
      Math.random() *
      300;

    positions[i * 3 + 2] =
      (Math.random() - 0.5) *
      1800;
  }


  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      positions,
      3
    )
  );


  const material =
    new THREE.PointsMaterial({
      color: 0x9bcfff,
      size: 1.5,
      transparent: true,
      opacity: 0.6
    });


  const rain =
    new THREE.Points(
      geometry,
      material
    );


  rainGroup.add(
    rain
  );

  scene.add(
    rainGroup
  );
}


createRain();


function updateWeather(
  delta
) {

  if (!rainGroup)
    return;


  if (
    state.weather ===
    "rain"
  ) {

    rainGroup.visible =
      true;

    rainGroup.rotation.x +=
      delta * 0.1;

  } else {

    rainGroup.visible =
      false;
  }
}


/* ============================================================
   GAME LOOP
============================================================ */

const clock =
  new THREE.Clock();


function gameLoop() {

  requestAnimationFrame(
    gameLoop
  );


  const delta =
    Math.min(
      clock.getDelta(),
      0.05
    );


  if (
    state.running &&
    state.raceStarted &&
    !state.paused &&
    !state.finished
  ) {

    state.raceTime +=
      delta;

    state.lapTime +=
      delta;

    updatePlayer(
      delta
    );

    aiCars.forEach(
      ai =>
        updateAI(
          ai,
          delta
        )
    );

    updateRaceProgress();

    checkCarCollisions();

    updatePosition();
  }


  updateCamera(
    delta
  );

  updateHUD();

  updateMiniMap();

  updateWeather(
    delta
  );


  renderer.render(
    scene,
    camera
  );
}


/* ============================================================
   RESIZE
============================================================ */

window.addEventListener(
  "resize",
  () => {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  }
);


/* ============================================================
   LOADING
============================================================ */

function loadingSequence() {

  const bar =
    document.getElementById(
      "loadingBar"
    );

  const text =
    document.getElementById(
      "loadingText"
    );


  let progress = 0;


  const interval =
    setInterval(
      () => {

        progress +=
          Math.random() *
          12;


        if (
          progress >= 100
        ) {

          progress = 100;

          clearInterval(
            interval
          );


          if (text) {
            text.textContent =
              "WORLD READY";
          }


          setTimeout(
            () => {

              document
                .getElementById(
                  "loadingScreen"
                )
                ?.classList.add(
                  "hidden"
                );

            },
            500
          );

        } else {

          if (text) {

            const messages = [
              "BUILDING CITY...",
              "LOADING CARS...",
              "GENERATING TRACK...",
              "CALIBRATING PHYSICS...",
              "STARTING ENGINE..."
            ];

            text.textContent =
              messages[
                Math.floor(
                  progress / 25
                )
              ] ||
              messages[0];
          }
        }


        if (bar) {
          bar.style.width =
            `${progress}%`;
        }

      },
      120
    );
}


loadingSequence();


/* ============================================================
   INITIALIZE
============================================================ */

setText(
  "playerCoins",
  state.coins
);

setText(
  "garageCoins",
  state.coins
);

setText(
  "playerLevel",
  state.level
);

updateHUD();

gameLoop();
