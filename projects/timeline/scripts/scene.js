import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { config, applyTime, updateUniformsConfig } from "./config";
import { updateGuiCamera } from "./gui";
import { helperFragmentShader, sunFragmentShader } from "./shader.frag.js";
import { vertexShader } from "./shader.vert.js";

let scene, camera, renderer, controls;
let sun, sunLight, earth;
const timer = new THREE.Timer();
const cameraDirection = new THREE.Vector3();

function initScene() {
    const {
        cameraFocus: { theta, phi, distance, focusSun },
        world: { sunPosition, earthPosition, scaling },
        color: { background },
    } = config

    scene = new THREE.Scene();
    scene.background = new THREE.Color(background);

    camera = new THREE.PerspectiveCamera(
        27, // 70
        window.innerWidth / window.innerHeight,
        1, // 0.0001
        3500 // 1000
    );
    camera.position
        .set(
            Math.sin(phi) * Math.sin(theta),
            Math.cos(phi),
            Math.sin(phi) * Math.cos(theta),
        )
        .multiplyScalar(distance)
        .add(focusSun ? sunPosition : earthPosition)
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, precision: "highp" });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    const sunMaterial = new THREE.ShaderMaterial({
        uniforms: config.uniforms,
        vertexShader: vertexShader,
        fragmentShader: sunFragmentShader,
        // fragmentShader: helperFragmentShader,
        side: THREE.DoubleSide,
        transparent: true,
    });
    const sunGeometry = new THREE.SphereGeometry(1, 128, 128);
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.scale.setScalar(scaling);
    scene.add(sun);

    const earthMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const earthGeometry = new THREE.SphereGeometry(1, 16, 16);
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    sunLight = new THREE.PointLight(0xffffff, 50000);
    sun.add(sunLight);
}

function updateSunEarth() {
    const {
        cameraFocus: { time },
        world: { sunPosition, earthPosition, scaling, sunToEarthSizeFactor },
        geometry: { points, totalPoints },
    } = config

    const distance = controls.getDistance();
    config.cameraFocus.distance = distance;

    // do interpolation of positions on timeline
    const a = Math.floor(time * totalPoints);
    const b = Math.ceil(time * totalPoints);
    const alpha = time * totalPoints - a;
    earthPosition.lerpVectors(points[a], points[b], alpha);
    sunPosition.set(0, earthPosition.getComponent(1), 0);

    // update objects position
    sun.position.copy(sunPosition);
    sun.rotateY(0.001);
    earth.position.copy(earthPosition);
    earth.scale.setScalar(scaling * sunToEarthSizeFactor);
}

function updateCamera() {
    const {
        timeline: { daysPerYear },
        cameraFocus: { flyAlong, focusSun, day, distance },
        world: { sunPosition, earthPosition },
    } = config;

    if (flyAlong) {
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

    // for the fragment shader
    camera.getWorldDirection(cameraDirection);
    config.uniforms.cameraDirection.value.copy(cameraDirection);
    updateUniformsConfig();

    renderer.render(scene, camera);
}

export { scene, initScene, updateScene, resize, animate };