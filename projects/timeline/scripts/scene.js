import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import config, { updateGeometryConfig } from "./config";
import fragmentShader from "./shader.frag.js";

let scene, camera, renderer, controls;
let timeline;
const focusPosition = new THREE.Vector3();

function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(config.color.background);
    timeline = new THREE.Group();
    scene.add(timeline);

    camera = new THREE.PerspectiveCamera(
        27, // 70
        window.innerWidth / window.innerHeight,
        1, // 0.0001
        3500 // 1000
    );
    scene.add(camera);

    scene.add(new THREE.AmbientLight(0xffffff, 0.1));
    scene.add(new THREE.DirectionalLight(0x00ffff, 1));

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, precision: "highp" });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
}

function clearTimeline() {
    while (timeline.children.length > 0) {
        const obj = timeline.children[0];

        // Speicher freigeben
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
        }

        // Aus der Gruppe löschen
        timeline.remove(obj);
    }
}

function drawTimeline() {
    const { totalPoints, turns, growRadius, minRadius, height } = config.geometry;

    // const material = new THREE.ShaderMaterial({
    //     uniforms: config.uniforms,
    //     fragmentShader: fragmentShader,
    //     side: THREE.DoubleSide,
    // });
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff });

    // const geometry = new THREE.BoxGeometry();
    // const geometry = new THREE.BufferGeometry();

    // 1. Die mathematischen Punkte der Spirale berechnen
    config.geometry.points = [];

    for (let i = 0; i <= totalPoints; i++) {
        const lifePercentage = i / totalPoints
        const theta = lifePercentage * turns * Math.PI * 2;
        const x = (lifePercentage * growRadius + minRadius) * Math.cos(theta);
        const z = (lifePercentage * growRadius + minRadius) * Math.sin(theta);
        const y = (i / totalPoints) * height; // Zentriert auf der Y-Achse

        config.geometry.points.push(new THREE.Vector3(x, y, z));
    }

    // 2. Aus den Punkten einen 3D-Pfad (Kurve) erstellen
    const spiralCurve = new THREE.CatmullRomCurve3(config.geometry.points);

    // 3. Die TubeGeometry (Schlauch) generieren
    const tubeRadius = 0.3;      // Die Dicke deines "Zylinders"
    const tubularSegments = totalPoints; // Auflösung entlang der Spirale
    const radialSegments = 8;   // Auflösung des Zylinder-Querschnitts (Rundung)
    const closed = false;        // Ist die Spirale geschlossen?

    const geometry = new THREE.TubeGeometry(
        spiralCurve,
        tubularSegments,
        tubeRadius,
        radialSegments,
        closed
    );

    const mesh = new THREE.Mesh(geometry, material);
    timeline.add(mesh);
}

function updateTimeline() {
    clearTimeline();
    updateGeometryConfig();
    drawTimeline();
}

function updateCamera() {
    const {
        timeline: { daysPerYear, stretch },
        cameraFocus: { flyAlong, fromOutside, distance, time, year, day },
        geometry: { points, totalPoints },
    } = config;

    // do interpolation of positions on timeline
    const a = Math.floor(time * totalPoints);
    const b = Math.ceil(time * totalPoints);
    const alpha = time * totalPoints - a;
    focusPosition.lerpVectors(points[a], points[b], alpha);
    // focusPosition.subVectors(points[b], points[a]).multiplyScalar(alpha).add(points[a]);

    if (flyAlong) {
        const yearPercentage = ((day - 1) / daysPerYear); // in [0, 1-(1/365.25)]
        const focusTheta = yearPercentage * Math.PI * 2;

        camera.position
            .set(Math.cos(focusTheta), 0, Math.sin(focusTheta))
            .multiplyScalar((fromOutside ? 1 : -1) * distance)
            .add(focusPosition);
        controls.target.copy(focusPosition);
    }

    if (timeline.children.length == 2) {
        timeline.remove(timeline.children[1]);
    }
    const geometry = new THREE.SphereGeometry();
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const focusPoint = new THREE.Mesh(geometry, material);
    focusPoint.position.copy(focusPosition);
    timeline.add(focusPoint);

    controls.update();
}

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    // TODO: necessary?
    // if (controls.autoRotate == true || controls.enableDamping == true) {
    //     controls.update();
    // }
}

export { initScene, updateTimeline, updateCamera, resize, animate };