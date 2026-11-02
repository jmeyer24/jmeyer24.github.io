import * as THREE from "three";

import { config, updateGeometryConfig } from "./config.js";
import { scene } from "./scene.js";

let timeline;

function initTimeline() {
    timeline = new THREE.Group();
    scene.add(timeline);
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
    const {
        totalPoints, turns, growRadius, minRadius, height, tubeRadius, tubularSegments, radialSegments
    } = config.geometry;

    // const material = new THREE.ShaderMaterial({
    //     uniforms: config.uniforms,
    //     fragmentShader: fragmentShader,
    //     side: THREE.DoubleSide,
    // });
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff });

    config.geometry.points = [];
    for (let i = 0; i <= totalPoints; i++) {
        const lifePercentage = i / totalPoints
        const theta = lifePercentage * turns * Math.PI * 2;
        const x = (lifePercentage * growRadius + minRadius) * Math.cos(theta);
        const z = (lifePercentage * growRadius + minRadius) * Math.sin(theta);
        const y = (i / totalPoints) * height; // Zentriert auf der Y-Achse

        config.geometry.points.push(new THREE.Vector3(x, y, z));
    }

    if (!config.timeline.draw) {
        return;
    }

    const spiralCurve = new THREE.CatmullRomCurve3(config.geometry.points);
    const geometry = new THREE.TubeGeometry(spiralCurve, tubularSegments, tubeRadius, radialSegments, false);

    const mesh = new THREE.Mesh(geometry, material);
    timeline.add(mesh);
}

function updateTimeline() {
    clearTimeline();
    updateGeometryConfig();
    drawTimeline();
}

export { initTimeline, updateTimeline }