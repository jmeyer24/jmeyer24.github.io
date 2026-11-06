import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { config, applyTime, updateGeometryConfig } from "./config";
import { updateGui } from "./gui";
import { vertexShader, earthVertexShader } from "./shader.vert.js";
import { helperFragmentShader, timelineFragmentShader, sunFragmentShader, earthFragmentShader, earthAtmosphereShader, earthFresnelShader } from "./shader.frag.js";

let scene, camera, renderer, controls;
let sun, earth, earthAtmosphere, earthFresnel, moon;

const timeline = new THREE.Mesh();

const timer = new THREE.Timer();
const sunRelPosition = new THREE.Vector3();

const earthOrbit = new THREE.Object3D();
const earthEquator = new THREE.Object3D();
const moonOrbit = new THREE.Object3D();
const moonEquator = new THREE.Object3D();

function updateTimelineGeometry() {
    // update before we read the constants in 
    updateGeometryConfig();
    const { totalPoints, turns, height, tubularSegments, tubeRadius, radialSegments, minRadius, growRadius } = config.timeline.geometry;

    config.timeline.geometry.points = [];
    for (let i = 0; i <= totalPoints; i++) {
        const lifePercentage = i / totalPoints
        const theta = lifePercentage * turns * Math.PI * 2;
        const x = (lifePercentage * growRadius + minRadius) * Math.cos(theta);
        const z = (lifePercentage * growRadius + minRadius) * Math.sin(theta);
        const y = (i / totalPoints) * height; // Zentriert auf der Y-Achse

        config.timeline.geometry.points.push(new THREE.Vector3(x, y, z));
    }

    timeline.geometry =
        new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(config.timeline.geometry.points),
            tubularSegments,
            tubeRadius,
            radialSegments,
            false
        );
}

function initScene() {
    const {
        cameraFocus: { theta, phi, sunDistance, earthDistance, focusSun },
        solarSystem: { sunPosition, earthPosition, scaling, sunToEarthSizeFactor, earthToMoonSizeFactor, earthTiltToEarthOrbit, moonTiltToEarthEquator },
        timeline: { draw },
    } = config

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position
        .set(
            Math.sin(phi) * Math.sin(theta),
            Math.cos(phi),
            Math.sin(phi) * Math.cos(theta),
        )
        .multiplyScalar(focusSun ? sunDistance : earthDistance)
        .add(focusSun ? sunPosition : earthPosition)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, precision: "lowp" });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    const celestialGeometry = new THREE.SphereGeometry(1, 128, 128);
    celestialGeometry.computeTangents(); // for the tangents in the shader

    // timeline
    updateTimelineGeometry();
    timeline.material =
        new THREE.ShaderMaterial({
            uniforms: config.uniforms,
            vertexShader: vertexShader,
            fragmentShader: helperFragmentShader,
            side: THREE.DoubleSide,
        });

    // celestial bodies
    sun = new THREE.Mesh(
        celestialGeometry,
        new THREE.ShaderMaterial({
            uniforms: config.uniforms,
            vertexShader: vertexShader,
            fragmentShader: sunFragmentShader,
            // fragmentShader: helperFragmentShader,
            side: THREE.FrontSide,
            transparent: true,
        })
    );

    earth = new THREE.Mesh(
        celestialGeometry,
        new THREE.ShaderMaterial({
            uniforms: {
                u_dayTexture: { value: new THREE.TextureLoader().load('./data/2k_earth_daymap.jpg') },
                u_nightTexture: { value: new THREE.TextureLoader().load('./data/2k_earth_nightmap.jpg') },
                u_normalTexture: { value: new THREE.TextureLoader().load('./data/2k_earth_normal_map.jpg') },
                u_specTexture: { value: new THREE.TextureLoader().load('./data/2k_earth_specular_map.jpg') },
                u_cloudTexture: { value: new THREE.TextureLoader().load('./data/2k_earth_clouds.jpg') },
                u_sunRelPosition: { value: new THREE.Vector3(0, 0, 0) },
                u_position: { value: new THREE.Vector3(0, 0, 0) },
                u_moonPosition: { value: new THREE.Vector3(0, 0, 0) },
                u_moonRadius: { value: 0.05 },
                u_sunRadius: { value: 0.2 },
                u_normalPower: { value: 10.0 },
            },
            vertexShader: earthVertexShader,
            fragmentShader: earthFragmentShader,
            side: THREE.FrontSide,
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
            side: THREE.BackSide,
            transparent: true,
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
            side: THREE.FrontSide,
            transparent: true,
        })
    );

    moon = new THREE.Mesh(
        celestialGeometry,
        new THREE.MeshLambertMaterial()
    );
    new THREE.TextureLoader().load('./data/2k_moon.jpg', (texture) => {
        moon.material.map = texture;
        moon.material.needsUpdate = true;
    });

    ///////////////////////////////////////

    new THREE.TextureLoader().load('./data/8k_stars_milky_way.jpg', (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;

        scene.background = texture;
    });

    document.body.appendChild(renderer.domElement);
    scene.add(camera);

    scene.add(timeline);
    timeline.visible = draw;

    scene.add(sun);
    sun.scale.setScalar(scaling);
    sun.add(new THREE.PointLight(0xffffff, 25000));

    scene.add(earthOrbit);
    earthOrbit.add(earthEquator);
    earthEquator.rotateZ((earthTiltToEarthOrbit / 360) * Math.PI * 2);

    earthEquator.add(earth);
    earth.scale.setScalar(scaling * sunToEarthSizeFactor);

    earth.add(earthAtmosphere);
    earth.add(earthFresnel);
    earthAtmosphere.scale.set(1.05, 1.05, 1.05);
    earthFresnel.scale.set(1.0001, 1.0001, 1.0001);;

    earthEquator.add(moonOrbit);
    moonOrbit.add(moonEquator);
    moonEquator.rotateZ((moonTiltToEarthEquator / 360) * Math.PI * 2);
    moonEquator.add(moon);
    moon.scale.setScalar(scaling * sunToEarthSizeFactor * earthToMoonSizeFactor);
}

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateSolarSystem() {
    const {
        timeline: { daysPerYear, death, draw,
            geometry: { points, totalPoints },
        },
        cameraFocus: { time },
        solarSystem: { sunPosition, earthPosition, moonPosition },
    } = config

    // do interpolation of positions on timeline
    const a = Math.floor(time * totalPoints);
    const b = Math.ceil(time * totalPoints);
    const alpha = time * totalPoints - a;
    earthPosition.lerpVectors(points[a], points[b], alpha);
    sunPosition.set(0, earthPosition.getComponent(1), 0);

    // update celestial bodies
    const t_earth = time * death * daysPerYear * Math.PI * 2;
    const t_moon = t_earth / 27.3; // average 27.3 days / rotation
    const t_sun = t_earth / 27; // average 27 days / rotation

    sun.position.copy(sunPosition);
    sun.rotation.set(0, t_sun, 0);

    earthOrbit.position.copy(earthPosition);
    earth.rotation.set(0, t_earth, 0);

    moonPosition.set(-1.0 * Math.cos(t_moon), 0, Math.sin(t_moon));
    moonOrbit.position.copy(moonPosition);
    // moonOrbit.rotation.set(0, t_moon, 0);
    // moonEquator.rotation.set(0, -t_moon, 0);
    moon.rotation.set(0, t_moon, 0);
    // moonEquator.position.set(0, 0, 1);

    // update shader uniforms
    sunRelPosition.subVectors(sunPosition, earthPosition);
    earth.material.uniforms.u_sunRelPosition.value = sunRelPosition;
    earth.material.uniforms.u_moonPosition.value = moonPosition;
    earthAtmosphere.material.uniforms.u_sunRelPosition.value = sunRelPosition;
    earthFresnel.material.uniforms.u_sunRelPosition.value = sunRelPosition;
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
    updateSolarSystem();
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
            updateGui();
        }
    }

    renderer.render(scene, camera);
}

export { scene, timeline, updateTimelineGeometry, initScene, updateScene, updateCamera, resize, animate };