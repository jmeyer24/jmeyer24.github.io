import * as THREE from "three";

import { config } from "./config";
import { vectorFieldFrag } from "./LIC.frag";
import { vertShader } from "./LIC.vert";

let scene, cameras, renderers;
let box;
let width, height;

let vectorFieldTexture, noiseTexture;
let oscillatorRenderer, oscillatorCamera, oscillatorMesh, oscillatorTexture;
let gyreRenderer, gyreCamera, gyreMesh, gyreTexture;
let t;

let arrowMesh;

let aspect = window.innerWidth / window.innerHeight;
const pixels = 256;
let oscillator = {
    xSpace: [-2.0, 2.0],
    ySpace: [-2.0, 2.0],
    aspect: 1,
    steps: 50,
    color: new THREE.Color("#ffff00"),
    position: [100, 0, 0],
}
let gyre = {
    xSpace: [0.0, 2.0],
    ySpace: [0.0, 1.0],
    aspect: 2,
    steps: 50,
    color: new THREE.Color("#ff00ff"),
    position: [0, 100, 0],
}

function sampleOscillator(x, y, t) {
    //from https://cgl.ethz.ch/research/visualization/data.php
    // https://cgl.ethz.ch/research/visualization/code/forceddampedduffing2d.py
    const alpha = -0.25;
    const beta = 0.4;

    let u = y;
    let v = alpha * y - Math.pow(x, 3) + x + beta * Math.cos(t);

    return [u, v];
}

function sampleGyre(x, y, t) {
    const A = 0.1;
    const omega = Math.PI / 5.0;
    const epsilon = 0.25;

    let u = -A * Math.PI * Math.sin(Math.PI * (epsilon * Math.sin(omega * t) * x * x + (1 - 2 * epsilon * Math.sin(omega * t)) * x)) * Math.cos(Math.PI * y);
    let v = A * Math.PI * (2 * epsilon * Math.sin(omega * t) * x - 2 * epsilon * Math.sin(omega * t) + 1) * Math.cos(Math.PI * (epsilon * Math.sin(omega * t) * x * x + (1 - 2 * epsilon * Math.sin(omega * t)) * x)) * Math.sin(Math.PI * y);

    return [u, v];
}

function generateVectorFieldTexture(t, switchToGyre, doNoise) {
    let xSpace = switchToGyre ? gyre.xSpace : oscillator.xSpace;
    let ySpace = switchToGyre ? gyre.ySpace : oscillator.ySpace;
    let aspect = switchToGyre ? gyre.aspect : oscillator.aspect;

    let [xDim, yDim] = [pixels * aspect, pixels];
    let size = xDim * yDim;

    // @returns: vec2
    let vectorField = new Float32Array(2 * size); // * 2 the vector of dimension 2 at each point
    let noiseField = new Float32Array(size); // * 2 the vector of dimension 2 at each point
    let x = xSpace[0], y = ySpace[0];
    let stepX = (xSpace[1] - x) / xDim;
    let stepY = (ySpace[1] - y) / yDim;
    for (let yInd = 0; yInd < yDim; yInd++) {
        for (let xInd = 0; xInd < xDim; xInd++) {
            let index = (yInd * xDim + xInd) * 2;

            let vec = switchToGyre ? sampleGyre(x, y, t) : sampleOscillator(x, y, t);

            vectorField[index] = vec[0];
            vectorField[index + 1] = vec[1];
            x = x + stepX;

            noiseField[index] = Math.random() < 0.5 ? 0.0 : 1.0;
        }
        y = y + stepY;
        x = xSpace[0];
    }

    const texture = new THREE.DataTexture(
        vectorField,
        xDim,
        yDim,
        THREE.RGFormat,
        THREE.FloatType,
    );
    texture.internalFormat = 'RG32F';
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    if (doNoise) {
        const noiseTexture = new THREE.DataTexture(
            noiseField,
            xDim,
            yDim,
            THREE.RedFormat,
            THREE.FloatType,
        );
        noiseTexture.internalFormat = 'R32F';
        noiseTexture.minFilter = THREE.LinearFilter;
        noiseTexture.magFilter = THREE.LinearFilter;
        noiseTexture.needsUpdate = true;

        return [texture, noiseTexture];
    }

    return texture;
}

function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(config.color.text);
    scene.add(new THREE.AmbientLight("#ffffff", 1))

    renderers = [];
    renderers.push(new THREE.WebGLRenderer({ canvas: $("canvas")[2], antialias: true, alpha: true }));
    renderers.push(new THREE.WebGLRenderer({ canvas: $("canvas")[3], antialias: true, alpha: true }));
    renderers.push(new THREE.WebGLRenderer({ canvas: $("canvas")[4], antialias: true, alpha: true }));

    cameras = [];
    cameras.push(new THREE.PerspectiveCamera(75, aspect, 0.1, 100));
    cameras.push(new THREE.PerspectiveCamera(75, aspect, 0.1, 100));
    cameras.push(new THREE.PerspectiveCamera(75, aspect, 0.1, 100));
    cameras.push(new THREE.PerspectiveCamera(75, aspect, 0.1, 100));
    let z = 0;
    let y = 0;
    cameras.forEach(camera => {
        z += 3;
        camera.position.set(0, y, z);
        scene.add(camera);
        y += 2;
    });

    box = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshLambertMaterial(),
    );
    scene.add(box);

    // Forced-Damped Duffing Oscillator Visualization
    oscillatorRenderer = new THREE.WebGLRenderer({ canvas: $("canvas")[0], antialias: true, alpha: true });
    oscillatorCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    scene.add(oscillatorCamera);

    [vectorFieldTexture, noiseTexture] = generateVectorFieldTexture(0.0, false, true)
    oscillatorMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.ShaderMaterial({
            uniforms: {
                u_vecFieldTex: { value: vectorFieldTexture },
                u_noiseTexture: { value: noiseTexture },
                u_steps: { value: oscillator.steps },
                u_color: { value: oscillator.color },
            },
            vertexShader: vertShader,
            fragmentShader: vectorFieldFrag,
            glslVersion: THREE.GLSL3,
        })
    );
    oscillatorCamera.add(oscillatorMesh);
    oscillatorCamera.position.set(...oscillator.position);

    // Double Gyre Visualization
    gyreRenderer = new THREE.WebGLRenderer({ canvas: $("canvas")[1], antialias: true, alpha: true });
    gyreCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    scene.add(gyreCamera);

    [vectorFieldTexture, noiseTexture] = generateVectorFieldTexture(0.0, true, true)
    gyreMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.ShaderMaterial({
            uniforms: {
                u_vecFieldTex: { value: vectorFieldTexture },
                u_noiseTexture: { value: noiseTexture },
                u_steps: { value: gyre.steps },
                u_color: { value: gyre.color },
            },
            vertexShader: vertShader,
            fragmentShader: vectorFieldFrag,
            glslVersion: THREE.GLSL3,
        })
    );
    gyreCamera.add(gyreMesh);
    gyreCamera.position.set(...gyre.position);
}

function resizeScene() {
    oscillatorCamera.aspect = oscillator.aspect;
    width = window.innerWidth / 4;
    oscillatorRenderer.setSize(width, width / oscillator.aspect);
    oscillatorCamera.updateProjectionMatrix();

    gyreCamera.aspect = gyre.aspect;
    width = window.innerWidth / 2;
    gyreRenderer.setSize(width, width / gyre.aspect);
    gyreCamera.updateProjectionMatrix();

    width = Math.floor(window.innerWidth / 4);
    height = Math.floor(window.innerHeight / 4);
    aspect = width / height;
    renderers.forEach(renderer => {
        renderer.setSize(cameras.length / 2 * width, cameras.length / 2 * height);

        cameras.forEach(camera => {
            camera.aspect = aspect;
            camera.updateProjectionMatrix();
        })
    });
}

function animate(msec) {
    requestAnimationFrame(animate);

    box.rotateX(0.01);
    box.rotateY(0.005);
    box.rotateZ(0.003);

    // render 3 canvases
    let left = 0;
    let bottom = 0;
    width = Math.floor(window.innerWidth / 4);
    height = Math.floor(window.innerHeight / 4);
    renderers.forEach((renderer, r) => {
        // render 4 cameras as a 2x2 grid
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

    // animate LIC by updating the vectorFieldTextures
    t = msec * 0.001
    // oscillator
    oscillatorTexture = generateVectorFieldTexture(t, false, false);
    oscillatorMesh.material.uniforms.u_vecFieldTex.value.dispose();
    oscillatorMesh.material.uniforms.u_vecFieldTex.value = oscillatorTexture
    oscillatorRenderer.render(scene, oscillatorCamera);
    // gyre
    gyreTexture = generateVectorFieldTexture(t, true, false);
    gyreMesh.material.uniforms.u_vecFieldTex.value.dispose();
    gyreMesh.material.uniforms.u_vecFieldTex.value = gyreTexture
    gyreRenderer.render(scene, gyreCamera);
}

export { initScene, resizeScene, animate };