'use strict';

const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE);

const SPEED = 0.001;
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const LIGHTING = '#eee';
const LIGHT_OPACITY = 0.9;

let scene = new THREE.Scene();
let camera;
let controls;
let renderer;
let mesh;
let line;
let increase = true;
let balloon = false;
let defaultScaleX;
let defaultScaleY;
let defaultScaleZ;

// This is where we create the face for our bot and apply the image texture.
function addFace(texture) {
  let geometry = new THREE.SphereGeometry(18, 24, 32);
  let material = new THREE.MeshPhongMaterial({
    color: '#1eecff',
    reflectivity: 15,
    shininess: 11,
    map: texture
  });

  mesh = new THREE.Mesh(geometry, material);
  mesh.scale.y = 1.8; // This makes the sphere longer so it's more face-like
  defaultScaleX = mesh.scale.x;
  defaultScaleY = mesh.scale.y;
  defaultScaleZ = mesh.scale.z;
  scene.add(mesh);
};

// We want the face to pulsate so it looks like it's breathing. We increase the scales
// until it reaches a maximum and then we reverse the action until it reaches the minimum.
function pulsate() {
  if (mesh.scale.z > 1.1) {
    increase = false;
  }

  if (mesh.scale.z < 1) {
    increase = true
  }

  if (increase) {
    mesh.scale.z += 0.001;
    mesh.scale.x += 0.001;
  } else {
    mesh.scale.z -= 0.001;
    mesh.scale.x -= 0.001;
  }
}

function startBalloon() {
  if (mesh.scale.z > 4) {
    balloon = false;
    mesh.scale.z = defaultScaleZ;
    mesh.scale.x = defaultScaleX;
    mesh.scale.y = defaultScaleY;
    return;
  }

  if (balloon) {
    mesh.scale.z += 0.01;
    mesh.scale.x += 0.01;
    mesh.scale.y += 0.01;
  }
}

// Set up all the lighting in the room for the objects.
function setLighting() {
  let directionalLight = new THREE.DirectionalLight(LIGHTING, LIGHT_OPACITY);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  directionalLight = new THREE.DirectionalLight(LIGHTING, LIGHT_OPACITY);
  directionalLight.position.set(-1, -1, -1);
  scene.add(directionalLight);

  directionalLight = new THREE.DirectionalLight(LIGHTING, LIGHT_OPACITY);
  directionalLight.position.set(0, 0, -1);
  scene.add(directionalLight);

  directionalLight = new THREE.DirectionalLight(LIGHTING, LIGHT_OPACITY);
  directionalLight.position.set(0, 0, 1);
  scene.add(directionalLight);
}

// These are gridlines we add around the face.
function drawGrids() {
  let size = 50;
  let step = 4;
  let geometry = new THREE.Geometry();

  for (let i = -size; i <= size; i += step) {
    geometry.vertices.push(new THREE.Vector3(-size, 0, i));
    geometry.vertices.push(new THREE.Vector3(-i, 0, size));
    geometry.vertices.push(new THREE.Vector3(i, 0, -size));
    geometry.vertices.push(new THREE.Vector3(0, size, -i));
    geometry.vertices.push(new THREE.Vector3(0, -size, i));
    geometry.vertices.push(new THREE.Vector3(0, i, size));
    geometry.vertices.push(new THREE.Vector3(0, i, -size));
  }

  let material = new THREE.LineDashedMaterial({
    color: '#8f69d1',
    dashSize: 15,
    gapSize: 5
  });

  line = new THREE.LineSegments(geometry, material);
  scene.add(line);
}

// This sets up the rotation speed for the gridlines.
function rotate() {
  line.rotation.x += SPEED * 1.8;
  line.rotation.y += SPEED;
  line.rotation.z += SPEED * 1.2;
};

// This is what we call to constantly re-render the objects and animate everything.
function render() {
  rotate();
  if (balloon) {
    startBalloon();
  } else {
    pulsate();
  }
  renderer.render(scene, camera);
  controls.update();
  requestAnimationFrame(render);
};

exports.generate = function () {
  // We need to wait until the image loads so that we can apply it as a texture. The image path is
  // the path relative to the root of the project. In this case it would be the build/ directory.
  let loader = new THREE.TextureLoader();

  loader.load('aphextwin.png', function (texture) {
    camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 1, 1000);
    camera.position.x = 100;

    // This allows us to rotate around the objects and zoom in and out.
    controls = new OrbitControls(camera);
    controls.enableZoom = true;
    controls.minDistance = 60;
    controls.maxDistance = 100;
    controls.autoRotate = false;

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });

    document.body.appendChild(renderer.domElement);

    addFace(texture);
    setLighting();
    drawGrids();

    render();
    renderer.setSize(WIDTH, HEIGHT);
  });
};

exports.startBallooning = function () {
  balloon = true;
  startBalloon();
};

// If the window is resized, we want all the 3d objects to scale accordingly.
window.onresize = function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};
