```glsl
import * as THREE from "three";

import { config } from "./config";

let scene, cameras, renderers;
let light, box;
let width, height;

const aspect = window.innerWidth / window.innerHeight;

function initScene() {
    renderers = [];
    renderers.push(new THREE.WebGLRenderer({ canvas: $("canvas")[0], antialias: true, alpha: true }));
    renderers.push(new THREE.WebGLRenderer({ canvas: $("canvas")[1], antialias: true, alpha: true }));
    renderers.push(new THREE.WebGLRenderer({ canvas: $("canvas")[2], antialias: true, alpha: true }));

    scene = new THREE.Scene();
    scene.background = new THREE.Color(config.color.text);

    cameras = [];
    cameras.push(new THREE.PerspectiveCamera(75, aspect, 0.1, 1000));
    cameras.push(new THREE.PerspectiveCamera(75, aspect, 0.1, 1000));
    cameras.push(new THREE.PerspectiveCamera(75, aspect, 0.1, 1000));
    cameras.push(new THREE.PerspectiveCamera(75, aspect, 0.1, 1000));
    let z = 0;
    let y = 0;
    cameras.forEach(camera => {
        z += 3;
        camera.position.set(0, y, z);
        scene.add(camera);
        y += 2;
    });

    light = new THREE.PointLight("#ff0000", 20);
    light.position.set(3, -2, -1);
    scene.add(light);
    scene.add(new THREE.AmbientLight("#ffffff", 1))

    box = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshLambertMaterial(),
    );
    scene.add(box);
}

function resizeScene() {
    width = Math.floor(window.innerWidth / 4);
    height = Math.floor(window.innerHeight / 4);
    renderers.forEach(renderer => {
        renderer.setSize(cameras.length / 2 * width, cameras.length / 2 * height);

        cameras.forEach((camera, i) => {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        })
    });
}

function animate() {
    requestAnimationFrame(animate);

    box.rotateX(0.01);
    box.rotateY(0.005);
    box.rotateZ(0.003);

    let left = 0;
    let bottom = 0;
    renderers.forEach((renderer, r) => {
        renderer.setScissorTest(true);
        cameras.forEach((camera, c) => {
            camera.lookAt(box.position);

            left = c % 2 ? width : 0;
            bottom = Math.floor(c / 2) < 1 ? height : 0;

            renderer.setViewport(left, bottom, width, height);
            renderer.setScissor(left, bottom, width, height);
            renderer.render(scene, camera);
        })
    });
}

export { initScene, resizeScene, animate };
```