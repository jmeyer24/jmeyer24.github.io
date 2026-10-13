import * as THREE from "three";
import { config } from "./config";
import { updateNotes } from "./notes";

let scene, camera, renderer;
let tonnetz, mesh;

function initScene() {
    camera = new THREE.PerspectiveCamera(
        27,
        window.innerWidth / window.innerHeight,
        1,
        3500
    );
    camera.position.z = 64;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(config.color.background);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // renderer.setClearColor(0x000,0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // const light = new THREE.HemisphereLight();
    // scene.add(light);

    tonnetz = new THREE.Group()
    scene.add(tonnetz)
}

function clearTonnetz() {
    while (tonnetz.children.length > 0) {
        const obj = tonnetz.children[0];

        // Speicher freigeben
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
        }

        // Aus der Gruppe löschen
        tonnetz.remove(obj);
    }
}

function drawTonnetz() {
    const {
        display: { vertices, normals, indices, segments, notesPerRow, scaling },
        note: { defaultIndices, names }
    } = config;

    // generate vertices and normals for a simple grid geometry
    vertices.length = 0;
    normals.length = 0;
    indices.length = 0;

    // compute a patch of even-sided triangles
    for (let i = 0; i <= segments; i++) {
        const y = (i / segments - 0.5) * Math.sqrt(0.75);

        for (let j = 0; j <= segments; j++) {
            const x = ((j - i / 2) / segments - 0.25);

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

    function indexedReadyForBuffer(i, indices, list) {
        return indices
            .slice(i * 3, (i + 1) * 3)
            .map((i) => [i * 3, i * 3 + 1, i * 3 + 2]
                .map((j) => list[j]))
            .flat()
    }

    // draw the plane
    for (let i = 0; i < 2 * segments ** 2; i++) {
        const geometry = new THREE.BufferGeometry();
        geometry.setIndex([0, 1, 2]);

        // get position and normal information of both triangles (front back)
        const bufferVertices = indexedReadyForBuffer(i, indices, vertices);
        const bufferNormals = indexedReadyForBuffer(i, indices, normals);
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(bufferVertices.map((i) => i * scaling), 3));
        geometry.setAttribute("normal", new THREE.Float32BufferAttribute(bufferNormals, 3));

        const color = new THREE.Color(i % 2 ? config.color.major : config.color.minor);
        const bufferColor = new Array(3).fill(color.toArray()).flat()
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(bufferColor, 3));

        const material = new THREE.MeshBasicMaterial({ vertexColors: true });

        mesh = new THREE.Mesh(geometry, material);

        tonnetz.add(mesh);
    }
}

function updateTonnetz() {
    clearTonnetz();
    drawTonnetz();
}

function setup() {
    initScene();
    updateTonnetz();
    updateNotes();
}

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

export { setup, resize, animate, updateTonnetz };