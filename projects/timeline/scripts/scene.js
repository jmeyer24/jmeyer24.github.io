import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { config, applyTime, updateUniformsConfig } from "./config";
import { updateGuiCamera } from "./gui";
import { vertexShader, earthVertexShader } from "./shader.vert.js";
import { helperFragmentShader, sunFragmentShader, earthFragmentShader, earthAtmosphereShader, earthFresnelShader } from "./shader.frag.js";

let scene, camera, renderer, controls;
let sun, earth, earthAtmosphere, earthFresnel;

const timer = new THREE.Timer();
const sunRelPosition = new THREE.Vector3();

const earth_orbit = new THREE.Object3D();
const earth_equator = new THREE.Object3D();
const moon_orbit = new THREE.Object3D();
// earth_equator.rotateZ(23.5*Math.PI/180);

function initScene() {
    const {
        cameraFocus: { theta, phi, sunDistance, earthDistance, focusSun },
        solarSystem: { sunPosition, earthPosition, scaling, sunToEarthSizeFactor },
        color: { background },
    } = config

    scene = new THREE.Scene();
    scene.background = new THREE.Color(background);

    camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position
        .set(
            Math.sin(phi) * Math.sin(theta),
            Math.cos(phi),
            Math.sin(phi) * Math.cos(theta),
        )
        .multiplyScalar(focusSun ? sunDistance : earthDistance)
        .add(focusSun ? sunPosition : earthPosition)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, precision: "highp" });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    const celestialGeometry = new THREE.SphereGeometry(1, 128, 128);
    celestialGeometry.computeTangents(); // for the tangents in the shader

    sun = new THREE.Mesh(
        celestialGeometry,
        new THREE.ShaderMaterial({
            uniforms: config.uniforms,
            vertexShader: vertexShader,
            fragmentShader: sunFragmentShader,
            // fragmentShader: helperFragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
        })
    );

    earth = new THREE.Mesh(
        celestialGeometry,
        new THREE.ShaderMaterial({
            uniforms: {
                u_dayTexture: { value: new THREE.TextureLoader().load('./data/earth_day.jpeg') },
                u_nightTexture: { value: new THREE.TextureLoader().load('./data/earth_night.jpeg') },
                u_normalTexture: { value: new THREE.TextureLoader().load('./data/earth_normal.jpeg') },
                u_specTexture: { value: new THREE.TextureLoader().load('./data/earth_specular.jpeg') },
                u_cloudTexture: { value: new THREE.TextureLoader().load('./data/earth_clouds.jpeg') },
                u_sunRelPosition: { value: new THREE.Vector3(0, 0, 0) },
                u_position: { value: new THREE.Vector3(0, 0, 0) },
                u_moonPosition: { value: new THREE.Vector3(0, 0, 0) },
                u_normalPower: { value: 5.0 },
                u_moonRadius: { value: 0.05 },
                u_sunRadius: { value: 0.2 },
            },
            vertexShader: earthVertexShader,
            fragmentShader: earthFragmentShader,
        })
    );

    earthAtmosphere = new THREE.Mesh(
        celestialGeometry,
        new THREE.ShaderMaterial({
            uniforms: {
                u_sunRelPosition: { value: new THREE.Vector3(0, 0, 0) },
                u_color: { value: new THREE.Vector3(.45, .55, 1) },
            },
            vertexShader: vertexShader,
            fragmentShader: earthAtmosphereShader,
            transparent: true,
            side: THREE.BackSide,
            depthTest: true,
            depthWrite: false,
        })
    );

    earthFresnel = new THREE.Mesh(
        celestialGeometry,
        new THREE.ShaderMaterial({
            uniforms: {
                u_sunRelPosition: { value: new THREE.Vector3(0, 0, 0) },
                u_color: { value: new THREE.Vector3(.45, .55, 1) },
            },
            vertexShader: vertexShader,
            fragmentShader: earthFresnelShader,
            transparent: true
        })
    );

    ///////////////////////////////////////

    document.body.appendChild(renderer.domElement);
    scene.add(camera);

    scene.add(sun);
    sun.scale.setScalar(scaling);
    sun.add(new THREE.PointLight(0xffffff, 50000));

    scene.add(earth_orbit);
    earth_orbit.add(earth_equator);
    earth_equator.add(earth);
    earth.scale.setScalar(scaling * sunToEarthSizeFactor);

    earth.add(earthAtmosphere);
    earth.add(earthFresnel);
    earthAtmosphere.scale.set(1.05, 1.05, 1.05);
    earthFresnel.scale.set(1.0001, 1.0001, 1.0001);;

    earth_equator.add(moon_orbit);
    // moon_orbit.add(moon);
}

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateSunEarth() {
    const {
        cameraFocus: { time, day },
        solarSystem: { sunPosition, earthPosition },
        geometry: { points, totalPoints },
    } = config

    // do interpolation of positions on timeline
    const a = Math.floor(time * totalPoints);
    const b = Math.ceil(time * totalPoints);
    const alpha = time * totalPoints - a;
    earthPosition.lerpVectors(points[a], points[b], alpha);
    sunPosition.set(0, earthPosition.getComponent(1), 0);

    // update objects position
    const t = day * Math.PI * 2;
    const t_moon = day * Math.PI * 2 / 27.3; // average 27.3 days / rotation
    sun.position.copy(sunPosition);
    sun.rotation.set(0, t / 27, 0); // average 27 days / rotation
    earth.position.copy(earthPosition);
    earth.rotation.set(0, t, 0);

    // update rest of the system
    sunRelPosition.subVectors(sunPosition, earthPosition);
    earth.material.uniforms.u_sunRelPosition.value = sunRelPosition;
    earthAtmosphere.material.uniforms.u_sunRelPosition.value = sunRelPosition;
    earthFresnel.material.uniforms.u_sunRelPosition.value = sunRelPosition;
    // const p = new THREE.Vector3(0.4 * Math.cos(t_moon), 0, -0.4 * Math.sin(t_moon));
    // moon.position.set(p);
    // earthMaterial.uniforms.u_moonPosition.value = p
}

function updateCamera() {
    const {
        timeline: { daysPerYear },
        cameraFocus: { flyAlong, focusSun, lastFocusSun, day, earthFocusTheta },
        solarSystem: { sunPosition, earthPosition },
    } = config;

    // update camera distance from focus object
    if (focusSun == lastFocusSun) {
        const distance = controls.getDistance();
        if (focusSun) {
            config.cameraFocus.sunDistance = distance;
        } else {
            config.cameraFocus.earthDistance = distance;
        }
    } else {
        config.cameraFocus.lastFocusSun = focusSun;
    }

    if (flyAlong) {
        // update camera position
        const theta = focusSun ? controls.getAzimuthalAngle() : Math.PI * 2 * (1.0 - ((day - 1) / daysPerYear)) + earthFocusTheta;
        const phi = controls.getPolarAngle();

        config.cameraFocus.theta = theta;
        config.cameraFocus.phi = phi;
        camera.position
            .set(
                Math.sin(phi) * Math.sin(theta),
                Math.cos(phi),
                Math.sin(phi) * Math.cos(theta),
            )
            .multiplyScalar(focusSun ? config.cameraFocus.sunDistance : config.cameraFocus.earthDistance)
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

function animate() {
    requestAnimationFrame(animate);
    timer.update();

    if (config.animation.runTime) {
        // increment is in days per second
        const time = config.cameraFocus.time + timer.getDelta() * config.animation.timeIncrement / (24 * config.timeline.daysTillDeath);
        if (time < 1) {
            config.cameraFocus.time = time;
            applyTime();
            updateScene();
            updateGuiCamera();
        }
    }

    renderer.render(scene, camera);
}

export { scene, initScene, updateScene, resize, animate };