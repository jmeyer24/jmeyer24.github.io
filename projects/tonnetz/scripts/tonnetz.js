import * as THREE from "three";

import { config } from "./config";
import { camera } from "./scene";
import { indexedReadyForBuffer, getVisibleHeight } from "./utilities";

let tonnetz;

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
        display: { vertices, normals, indices, segments, notesPerRow },
        note: { defaultIndices, names }
    } = config;

    // generate vertices and normals for a simple grid geometry
    vertices.length = 0;
    normals.length = 0;
    indices.length = 0;

    // compute a patch of even-sided triangles
    const equilateralTriangleScaling = Math.sqrt(0.75);
    const tonnetzWidth = 1.5;

    const scalingHeight = getVisibleHeight(camera.fov);
    const scaling = Math.min(scalingHeight / equilateralTriangleScaling, scalingHeight * camera.aspect / tonnetzWidth);
    for (let i = 0; i <= segments; i++) {
        const y = (i / segments - 0.5) * equilateralTriangleScaling * scaling;

        for (let j = 0; j <= segments; j++) {
            const x = ((j - i / 2) / segments - 0.25) * scaling;

            vertices.push(x, -y, 0);
            normals.push(0, 0, 1);
        }
    }

    // generate indices (data for element array buffer)
    for (let i = 0; i < segments; i++) {
        for (let j = 0; j < segments; j++) {
            const a = i * (notesPerRow) + (j + 1);
            const b = i * (notesPerRow) + j;
            const c = (i + 1) * (notesPerRow) + j;
            const d = (i + 1) * (notesPerRow) + (j + 1);

            // generate two faces (triangles) per iteration
            indices.push(a, b, d); // face one
            indices.push(b, c, d); // face two
        }
    }

    // compute nodeIndices, e.g. which circle represents which note
    defaultIndices.length = 0;
    defaultIndices.push(0);
    for (let i = 1; i < (notesPerRow) ** 2; i++) {
        defaultIndices.push(
            // when we are at a new row in the tonnetz
            // compute the new start of the row
            // else go to the fifth (7 halfsteps)
            (!(i % (notesPerRow))
                ? (i / (notesPerRow)) * 8
                : defaultIndices[i - 1] + 7)
            % names.length
        );
    }

    // draw the plane
    for (let i = 0; i < 2 * segments ** 2; i++) {
        const geometry = new THREE.BufferGeometry();
        geometry.setIndex([0, 1, 2]);

        // get position and normal information of both triangles (front back)
        const bufferVertices = indexedReadyForBuffer(i, indices, vertices);
        const bufferNormals = indexedReadyForBuffer(i, indices, normals);
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(bufferVertices.map((i) => i * 3), 3));
        geometry.setAttribute("normal", new THREE.Float32BufferAttribute(bufferNormals, 3));

        const color = new THREE.Color(i % 2 ? config.color.major : config.color.minor);
        const bufferColor = new Array(3).fill(color.toArray()).flat()
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(bufferColor, 3));

        const material = new THREE.MeshBasicMaterial({ vertexColors: true });

        tonnetz.add(new THREE.Mesh(geometry, material));
    }
}

function updateTonnetz() {
    clearTonnetz();
    drawTonnetz();
}

export { initTonnetz, updateTonnetz };