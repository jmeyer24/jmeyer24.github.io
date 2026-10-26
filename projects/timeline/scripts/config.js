import * as THREE from "three";

import { mod, roundingTo, clamp } from "./utilities"

const millisecondsInDay = (1000 * 60 * 60 * 24);
let config = {};

function applyDeath() {
    config.timeline.daysTillDeath = config.timeline.death * config.timeline.daysPerYear;
}

function applyTime() {
    const {
        timeline: { death, daysPerYear, daysTillDeath },
        cameraFocus: { time },
    } = config;

    if (time == 1) {
        config.cameraFocus.year = death;
        config.cameraFocus.day = daysPerYear;
    } else {
        const days = time * daysTillDeath;
        config.cameraFocus.year = clamp(days / daysPerYear + 1, 1, death);
        config.cameraFocus.day = clamp(mod(days, daysPerYear) + 1, 1, daysPerYear);
    }
}

function applyYearOrDay() {
    const {
        timeline: { daysPerYear, daysTillDeath },
        cameraFocus: { year, day },
    } = config;

    const time = ((year - 1) * daysPerYear + (day - 1)) / daysTillDeath;
    config.cameraFocus.time = roundingTo(time, 5);
}


function updateUniformsConfig() {
    config.uniforms.timelineDeath.value = config.timeline.death;
    config.uniforms.timelineStretch.value = config.geometry.stretch;
    config.uniforms.cameraFocusTime.value = config.cameraFocus.time;
    config.uniforms.cameraFocusYear.value = config.cameraFocus.year;
    config.uniforms.cameraFocusDay.value = config.cameraFocus.day;
}

function updateGeometryConfig() {
    config.geometry.turns = config.timeline.death;
    config.geometry.pointsPerTurn = Math.floor(config.timeline.daysPerYear);
    config.geometry.totalPoints = Math.floor(0.25 * config.geometry.turns * config.geometry.pointsPerTurn);
    config.geometry.height = config.timeline.death * config.geometry.stretch;

    config.geometry.tubularSegments = config.geometry.totalPoints; // Auflösung entlang der Spirale
}

function initConfig() {
    config = {
        gui: {
            gui: null,
            guiTimeline: null,
            guiCamera: null,
            guiAnimation: null,
        },

        timeline: {
            death: 30,
            maxYears: 100,
            daysPerYear: 365.25,

            birthday: new Date("April 02, 1998 10:11:12"),
            daysSinceBDay: null,
            daysTillDeath: null,
        },

        cameraFocus: {
            flyAlong: true,
            focusSun: true,
            distance: 100,
            theta: 0,
            phi: -50,
            time: null,
            year: null,
            day: null,
        },

        animation: {
            runTime: false,
            timeIncrement: 100, // animation in days per second
            resetTime: null, // reset button function
        },

        color: {
            background: getComputedStyle(document.documentElement).getPropertyValue("--color-background").trim(),
        },

        geometry: {
            asSpiral: true,
            stretch: 10,

            points: [],
            turns: null,          // Wie oft sich die Spirale dreht
            pointsPerTurn: null,  // Auflösung der Kurve pro Drehung
            totalPoints: null,
            minRadius: 30,      // Mindest-Radius der gesamten Spirale
            growRadius: 0,     // Verdickung/Verdünnung der Spirale
            height: null,         // Gesamthöhe der Spirale

            tubeRadius: 0.1,       // Die Dicke deines "Zylinders"
            tubularSegments: null, // Auflösung entlang der Spirale
            radialSegments: 8,     // Auflösung des Zylinder-Querschnitts (Rundung)
        },

        world: {
            sunPosition: new THREE.Vector3(),
            earthPosition: new THREE.Vector3(),
            sunToEarthSizeFactor: 1 / 10, // in reality: 1 / 109,
            scaling: 5,
        },

        uniforms: {
            res: {
                type: "vec2",
                value: new THREE.Vector2(window.innerWidth, window.innerHeight),
            },

            // cameraPosition: { type: "vec3", value: new THREE.Vector3(0, 0, 0), },
            cameraRotation: { type: "vec3", value: new THREE.Vector3(0, 0, 1), },

            // type "c" for color
            // https://stackoverflow.com/questions/32660646/three-js-define-uniforms-for-fragment-shader
            color: { type: "c", value: "#CC3333" },
            haloColor: { type: "c", value: "#CC3333" },

            timelineDeath: { type: "float", value: null },
            timelineStretch: { type: "float", value: null },
            cameraFocusTime: { type: "float", value: null },
            cameraFocusYear: { type: "float", value: null },
            cameraFocusDay: { type: "float", value: null },
        }
    }

    config.timeline.daysSinceBDay = (Date.now() - config.timeline.birthday.getTime()) / millisecondsInDay; // current days of life since the birthday
    config.timeline.daysTillDeath = config.timeline.death * config.timeline.daysPerYear;

    config.cameraFocus.time = roundingTo(config.timeline.daysSinceBDay / config.timeline.daysTillDeath, 5);
    config.cameraFocus.year = Math.floor(config.timeline.daysSinceBDay / config.timeline.daysPerYear);
    config.cameraFocus.day = Math.floor(mod(config.timeline.daysSinceBDay, config.timeline.daysPerYear));

    config.animation.resetTime = () => { };

    updateUniformsConfig();
    updateGeometryConfig();
}

export { config, initConfig, updateUniformsConfig, updateGeometryConfig, applyDeath, applyTime, applyYearOrDay };