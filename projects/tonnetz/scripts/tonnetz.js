import * as THREE from "three";

import { config } from "./config";
import { camera } from "./scene";
import { getVisibleHeight, computeScalingFromHeight } from "./utilities";

let tonnetz, mesh;

function initTonnetz() {
    tonnetz = new THREE.Group();
    camera.add(tonnetz);
    tonnetz.position.z = -1;
}

function clearTonnetz() {
    while (tonnetz.children.length > 0) {
        const obj = tonnetz.children[0];
        // clear gpu memory
        obj.geometry && obj.geometry.dispose();
        obj.material && Array.isArray(obj.material) ? obj.material.forEach(m => m.dispose()) : obj.material.dispose()
        // remove from group
        tonnetz.remove(obj);
    }
}

function drawTonnetz() {
    const {
        display: { vertices, indices, notesPerRow, height }
    } = config;

    // as they are list references, they get cleared to empty lists
    vertices.length = 0;
    indices.length = 0;

    // compute vertices for a parallelogram of even-sided triangles
    const segments = notesPerRow - 1;
    for (let i = 0; i <= segments; i++) {
        const y = (i / segments - 0.5) * height;

        for (let j = 0; j <= segments; j++) {
            const x = ((j - i / 2) / segments - 0.25);

            vertices.push(x, -y, 0);
        }
    }

    // generate indices (data for element array buffer)
    for (let i = 0; i < segments; i++) {
        for (let j = 0; j < segments; j++) {
            const a = i * (notesPerRow) + j;
            const b = (i + 1) * (notesPerRow) + j;
            const c = (i + 1) * (notesPerRow) + (j + 1);

            indices.push(a, b, c);
        }
    }

    // draw the tonnetz
    const geometry = new THREE.BufferGeometry();
    const bufferVertices = indices.map((i) => vertices.slice(i * 3, (i + 1) * 3)).flat();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(bufferVertices, 3));
    const color = new THREE.Color(config.color.major);
    const bufferColor = new Array(indices.length).fill(color.toArray()).flat()
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(bufferColor, 3));

    const material = new THREE.MeshBasicMaterial({ vertexColors: true });

    mesh = new THREE.Mesh(geometry, material)
    tonnetz.add(mesh);
}

function scaleTonnetz() {
    const scaling = computeScalingFromHeight(getVisibleHeight(camera.fov));
    mesh.scale.set(scaling, scaling, 1);
}

function redrawTonnetz() {
    clearTonnetz();
    drawTonnetz();
    scaleTonnetz();
}

export { initTonnetz, drawTonnetz, redrawTonnetz, scaleTonnetz };