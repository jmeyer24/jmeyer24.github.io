import * as THREE from "three";

import { vertShader } from "./LIC.vert";
import { vectorFieldFrag } from "./LIC.frag";

export default class LIC {
    constructor({
        vectorField,
        color,
        xSpace,
        ySpace,
        canvasId = 0,
        widthRatio = 2,
        pixels = 256,
        aspect = 1,
        steps = 50,
    }) {
        this.vectorField = vectorField;
        this.color = color;
        this.xSpace = xSpace ? [...xSpace] : [0.0, 1.0];
        this.ySpace = ySpace ? [...ySpace] : [0.0, 1.0];
        this.canvasId = canvasId;
        this.widthRatio = widthRatio;
        this.pixels = pixels;
        this.aspect = aspect;
        this.steps = steps;
    }

    init() {
        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer({ canvas: $("canvas")[this.canvasId], antialias: true, alpha: true, powerPreference:"high-performance" });

        this.camera = new THREE.PerspectiveCamera(75, this.aspect, 0.1, 1000);
        this.scene.add(this.camera);

        this.generateTextures();
        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            new THREE.ShaderMaterial({
                uniforms: {
                    u_vectorFieldTexture: { value: this.vectorFieldTexture },
                    u_noiseTexture: { value: this.noiseTexture },
                    u_steps: { value: this.steps },
                    u_color: { value: new THREE.Color(this.color) },
                },
                vertexShader: vertShader,
                fragmentShader: vectorFieldFrag,
                glslVersion: THREE.GLSL3,
            })
        );
        this.camera.add(this.mesh);

        this.updateVectorFieldTexture(1.0);
    }

    setAspect(aspect) {
        this.aspect = aspect;
    }

    generateTextures() {
        let xDim = this.pixels * this.aspect;
        let yDim = this.pixels;
        let size = xDim * yDim;

        this.vectorFieldTexture = new THREE.DataTexture(
            new Float32Array(2 * size),
            xDim,
            yDim,
            THREE.RGFormat,
            THREE.FloatType,
        );
        this.vectorFieldTexture.internalFormat = 'RG32F';
        this.vectorFieldTexture.minFilter = THREE.LinearFilter;
        this.vectorFieldTexture.magFilter = THREE.LinearFilter;
        this.vectorFieldTexture.needsUpdate = true;

        let noiseData = new Float32Array(size);
        let noiseIndex = 0;
        for (let yInd = 0; yInd < yDim; yInd++) {
            for (let xInd = 0; xInd < xDim; xInd++) {
                noiseData[noiseIndex++] = Math.random() < 0.5 ? 0.0 : 1.0;
            }
        }
        this.noiseTexture = new THREE.DataTexture(
            noiseData,
            xDim,
            yDim,
            THREE.RedFormat,
            THREE.FloatType,
        );
        this.noiseTexture.internalFormat = 'R32F';
        this.noiseTexture.minFilter = THREE.LinearFilter;
        this.noiseTexture.magFilter = THREE.LinearFilter;
        this.noiseTexture.needsUpdate = true;
    }

    updateVectorFieldTexture(t) {
        const texture = this.mesh.material.uniforms.u_vectorFieldTexture.value;

        let xDim = this.pixels * this.aspect;
        let yDim = this.pixels;
        let vectorFieldData = texture.image.data;

        let x = this.xSpace[0], y = this.ySpace[0];
        let stepX = (this.xSpace[1] - x) / xDim;
        let stepY = (this.ySpace[1] - y) / yDim;

        for (let yInd = 0; yInd < yDim; yInd++) {
            for (let xInd = 0; xInd < xDim; xInd++) {
                let index = (yInd * xDim + xInd) * 2;
                let vec = this.vectorField.sample(x, y, t);

                vectorFieldData[index] = vec[0];
                vectorFieldData[index + 1] = vec[1];
                x = x + stepX;
            }
            y = y + stepY;
            x = this.xSpace[0];
        }

        texture.needsUpdate = true;
    }

    resize() {
        this.camera.aspect = this.aspect;
        this.camera.updateProjectionMatrix();

        let width = window.innerWidth / this.widthRatio;
        this.renderer.setSize(width, width / this.aspect);
        this.renderer.render(this.scene, this.camera);
    }

    animate(t) {
        this.updateVectorFieldTexture(t);
        this.renderer.render(this.scene, this.camera);
    }
}