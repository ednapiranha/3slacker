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
let currentFont;

let loader = new THREE.TextureLoader();

exports.generate = function () {
  loader.load('aphextwin.png', function (texture) {
    function addFace() {
      let geometry = new THREE.SphereGeometry(18, 24, 32);
      let material = new THREE.MeshPhongMaterial({
        color: '#1eecff',
        reflectivity: 15,
        shininess: 11,
        map: texture
      });

      mesh = new THREE.Mesh(geometry, material);
      mesh.scale.y = 1.8;
      scene.add(mesh);
    };

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

    function drawGrids() {
      let size = 50, step = 4;
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

    function rotate() {
      line.rotation.x += SPEED * 1.8;
      line.rotation.y += SPEED;
      line.rotation.z += SPEED * 1.2;
    };

    let increase = true;

    function pulsate() {
      if (mesh.scale.z > 1.3) {
        increase = false;
      }

      if (mesh.scale.z < 1) {
        increase = true
      }

      if (increase) {
        mesh.scale.z += 0.01;
        mesh.scale.x += 0.01;
      } else {
        mesh.scale.z -= 0.01;
        mesh.scale.x -= 0.01;
      }
    }

    camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 1, 1000);
    camera.position.x = 100;

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

    addFace();
    setLighting();
    drawGrids();

    function render() {
      rotate();
      pulsate();
      renderer.render(scene, camera);
      controls.update();
      requestAnimationFrame(render);
    };

    render();
    renderer.setSize(WIDTH, HEIGHT);
  });
};

function writeText(text, time) {
  let incomingTxt = new THREE.TextGeometry(time + ': ' + text, {
    font: font
  });
  let material = new THREE.MeshPhongMaterial({
    color: '#1eecff',
    reflectivity: 15,
    shininess: 11
  });

  let txtMesh = new THREE.Mesh(incomingTxt, material);
  console.log(txtMesh)
  scene.add(txtMesh);
}

exports.setText = function (text, time) {
  if (!currentFont) {
    let loader = new THREE.FontLoader();

    loader.load('league_spartan_bold.js', function (font) {
      currentFont = font;
      writeText(text, time);
    });
  } else {
    writeText(text, time);
  }
};

window.onresize = function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};
