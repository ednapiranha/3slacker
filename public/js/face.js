'use strict';

const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE);
const STLLoader = require('three-stl-loader')(THREE);

const SPEED = 0.001;
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const LIGHTING = '#eee';
const LIGHT_OPACITY = 0.95;

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
let textures = {};
let faceSphere;

// This is where we create the face for our bot and apply the image texture.
function setFace(geometry) {
  if (mesh) {
    scene.remove(mesh);
  }

  let material = new THREE.MeshPhongMaterial({
    color: '#39d3c3',
    reflectivity: 15,
    shininess: 16,
    specular: '#f2239d',
    wireframe: true
  });

  mesh = new THREE.Mesh(geometry, material);
  mesh.scale.z += 1;
  mesh.scale.x += 1;
  mesh.scale.y += 1;
  defaultScaleX = mesh.scale.x;
  defaultScaleY = mesh.scale.y;
  defaultScaleZ = mesh.scale.z;
  scene.add(mesh);
};

// We want the face to pulsate so it looks like it's breathing. We increase the scales
// until it reaches a maximum and then we reverse the action until it reaches the minimum.
function pulsate() {
  if (mesh.scale.z > 2.1) {
    increase = false;
  }

  if (mesh.scale.z < 1.8) {
    increase = true
  }

  if (increase) {
    mesh.scale.z += 0.001;
    mesh.scale.x += 0.004;
  } else {
    mesh.scale.z -= 0.001;
    mesh.scale.x -= 0.004;
  }
}

function startBalloon() {
  if (mesh.scale.z > 5) {
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

  directionalLight = new THREE.DirectionalLight(LIGHTING, LIGHT_OPACITY);
  directionalLight.position.set(1, 1, 0);
  scene.add(directionalLight);
}

// These are gridlines we add around the face.
function drawGrids(color) {
  if (line) {
    scene.remove(line);
  }

  let size = 60;
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
    color: color || '#8f69d1',
    dashSize: 15,
    gapSize: 5,
    opacity: 0.7
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
  let loader = new STLLoader();
  let count = 0;
  //let imageArr = ['face1.png', 'face2.png', 'face3.png', 'face4.png', 'face5.png'];
  let facesArr = ['face-default.stl', 'face-happy.stl', 'face-surprise.stl', 'face-sad.stl'];

  function preloadTextures(next) {
    facesArr.forEach((face) => {
      loader.load(face, function (geometry) {
        textures[face] = geometry;
        if (count === facesArr.length - 1) {
          return next(null, textures);
        }

        count++;
      });
    });
  }

  preloadTextures((err, textures) => {
    camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 1, 1000);
    camera.position.x = 100;

    // This allows us to rotate around the objects and zoom in and out.
    controls = new OrbitControls(camera);
    controls.enableZoom = true;
    controls.minDistance = 30;
    controls.maxDistance = 200;
    controls.autoRotate = false;


    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });

    document.body.appendChild(renderer.domElement);

    setFace(textures['face-default.stl']);
    setLighting();
    drawGrids();

    render();
    renderer.setSize(WIDTH, HEIGHT);
  });
};

exports.startBallooning = function () {
  balloon = true;
  setFace(textures['face-happy.stl']);
  startBalloon();
};

exports.setFace = function (mood) {
  switch (mood) {
    case 'happy':
      setFace(textures['face-happy.stl']);
      drawGrids('#ff6bd9');
      break;
    case 'sad':
      setFace(textures['face-sad.stl']);
      drawGrids('#111');
      break;
    case 'surprise':
      setFace(textures['face-surprise.stl']);
      drawGrids('#0f0');
      break;
    default:
      setFace(textures['face-default.stl']);
      drawGrids();
      break;
  }
};

// If the window is resized, we want all the 3d objects to scale accordingly.
window.onresize = function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};
