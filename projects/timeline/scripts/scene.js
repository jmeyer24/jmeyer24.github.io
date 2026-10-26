import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { config, applyTime } from "./config";
import { updateGuiCamera } from "./gui";
// import { fragmentShader } from "./shader.frag.js";

let scene, camera, renderer, controls;
let sunMesh, earthMesh;
const timer = new THREE.Timer();

function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(config.color.background);

    camera = new THREE.PerspectiveCamera(
        27, // 70
        window.innerWidth / window.innerHeight,
        1, // 0.0001
        3500 // 1000
    );
    scene.add(camera);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    scene.add(new THREE.DirectionalLight(0xffffff, 1));

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, precision: "highp" });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);

    const geometry = new THREE.SphereGeometry();
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff });

    sunMesh = new THREE.Mesh(geometry, material);
    sunMesh.scale.setScalar(config.world.scaling);
    scene.add(sunMesh);

    earthMesh = new THREE.Mesh(geometry, material);
    scene.add(earthMesh);
}

function updateSunEarth() {
    const {
        cameraFocus: { time },
        world: { sunPosition, earthPosition, scaling, sunToEarthSizeFactor },
        geometry: { points, totalPoints },
    } = config

    const distance = controls.getDistance() ? controls.getDistance() : config.cameraFocus.distance;
    config.cameraFocus.distance = distance;

    // do interpolation of positions on timeline
    const a = Math.floor(time * totalPoints);
    const b = Math.ceil(time * totalPoints);
    const alpha = time * totalPoints - a;
    earthPosition.lerpVectors(points[a], points[b], alpha);
    sunPosition.set(0, earthPosition.getComponent(1), 0);

    // update objects position
    sunMesh.position.copy(sunPosition);
    earthMesh.position.copy(earthPosition);
    earthMesh.scale.setScalar(scaling * sunToEarthSizeFactor);
}

function updateCamera() {
    const {
        timeline: { daysPerYear },
        cameraFocus: { focusSun, day, distance },
        world: { sunPosition, earthPosition },
    } = config;

    // update camera position
    const theta = focusSun ? controls.getAzimuthalAngle() : Math.PI * (0.5 - 2 * ((day - 1) / daysPerYear));
    const phi = controls.getPolarAngle();
    config.cameraFocus.theta = theta;
    config.cameraFocus.phi = phi;
    camera.position
        .set(
            Math.sin(phi) * Math.sin(theta),
            Math.cos(phi),
            Math.sin(phi) * Math.cos(theta),
        )
        .multiplyScalar(distance)
        .add(focusSun ? sunPosition : earthPosition)

    // update camera target
    controls.target.copy(focusSun ? sunPosition : earthPosition);
    controls.update();
}

function updateScene() {
    updateSunEarth();
    updateCamera();
}

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    timer.update();

    if (config.animation.runTime) {
        // increment is in days per second
        const time = config.cameraFocus.time + timer.getDelta() * config.animation.timeIncrement / config.timeline.daysTillDeath;
        if (time < 1) {
            config.cameraFocus.time = time;
            applyTime();
            updateScene();
            updateGuiCamera();
        }
    }

    renderer.render(scene, camera);
}

export { scene, initScene, updateScene, resize, animate };