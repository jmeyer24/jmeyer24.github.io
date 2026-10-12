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
    // generate vertices and normals for a simple grid geometry
    config.display.vertices = [];
    config.display.normals = [];
    config.display.indices = [];

    // compute a patch of even-sided triangles
    for (let i = 0; i <= config.display.segments; i++) {
        const y = (i / config.display.segments - 0.5) * Math.sqrt(0.75);

        for (let j = 0; j <= config.display.segments; j++) {
            const x = ((j - i / 2) / config.display.segments - 0.25);

            config.display.vertices.push(x, -y, 0);
            config.display.normals.push(0, 0, 1);
        }
    }

    // generate indices (data for element array buffer)
    for (let i = 0; i < config.display.segments; i++) {
        for (let j = 0; j < config.display.segments; j++) {
            const a = i * (config.display.notesPerRow) + (j + 1);
            const b = i * (config.display.notesPerRow) + j;
            const c = (i + 1) * (config.display.notesPerRow) + j;
            const d = (i + 1) * (config.display.notesPerRow) + (j + 1);

            // generate two faces (triangles) per iteration
            config.display.indices.push(a, b, d); // face one
            config.display.indices.push(b, c, d); // face two
        }
    }

    // compute nodeIndices, e.g. which circle represents which note
    config.note.defaultIndices = [0];
    for (let i = 1; i < (config.display.notesPerRow) ** 2; i++) {
        config.note.defaultIndices.push(
            // when we are at a new row in the tonnetz
            // compute the new start of the row
            // else go to the fifth (7 halfsteps)
            (!(i % (config.display.notesPerRow))
                ? (i / (config.display.notesPerRow)) * 8
                : config.note.defaultIndices[i - 1] + 7)
            % config.note.names.length
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
    for (let i = 0; i < 2 * config.display.segments ** 2; i++) {
        const geometry = new THREE.BufferGeometry();
        geometry.setIndex([0, 1, 2]);

        // get position and normal information of both triangles (front back)
        const vertices = indexedReadyForBuffer(i, config.display.indices, config.display.vertices);
        const normals = indexedReadyForBuffer(i, config.display.indices, config.display.normals);
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices.map((i) => i * config.display.scaling), 3));
        geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));

        const color = new THREE.Color(i % 2 ? config.color.major : config.color.minor);
        const bufferedColor = new Array(3).fill(color.toArray()).flat()
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(bufferedColor, 3));

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