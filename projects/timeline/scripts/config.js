import * as THREE from "three";

import { mod, roundingTo } from "./utilities"

const config = {
    gui: {
        gui: null,
        guiTimeline: null,
        guiCamera: null,
    },

    timeline: {
        death: 50,
        maxYears: 120,
        daysPerYear: 365.25,
        stretch: 5,
        asSpiral: true,
        birthday: new Date("April 02, 1998 10:11:12"),
        daysTillDeath: null,
    },

    cameraFocus: {
        flyAlong: true,
        fromOutside: true,
        distance: null,
        time: null,
        year: null,
        day: null,
    },

    color: {
        background: getComputedStyle(document.documentElement).getPropertyValue("--color-background").trim(),
    },

    geometry: {
        points: [],
        turns: null,          // Wie oft sich die Spirale dreht
        pointsPerTurn: null,  // Auflösung der Kurve pro Drehung
        totalPoints: null,
        minRadius: null,      // Mindest-Radius der gesamten Spirale
        growRadius: null,     // Verdickung/Verdünnung der Spirale
        height: null,         // Gesamthöhe der Spirale
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

export function updateConfig() {
    const millisecondsInDay = (1000 * 60 * 60 * 24);
    const daysSinceBDay = (Date.now() - config.timeline.birthday.getTime()) / millisecondsInDay; // current days of life since the birthday
    config.timeline.daysTillDeath = config.timeline.death * config.timeline.daysPerYear;

    config.cameraFocus.distance = 100;
    config.cameraFocus.time = roundingTo(daysSinceBDay / config.timeline.daysTillDeath, 5);
    config.cameraFocus.year = Math.floor(daysSinceBDay / config.timeline.daysPerYear);
    config.cameraFocus.day = Math.floor(mod(daysSinceBDay, config.timeline.daysPerYear));

    config.uniforms.timelineDeath.value = config.timeline.death;
    config.uniforms.timelineStretch.value = config.timeline.stretch;
    config.uniforms.cameraFocusTime.value = config.cameraFocus.time;
    config.uniforms.cameraFocusYear.value = config.cameraFocus.year;
    config.uniforms.cameraFocusDay.value = config.cameraFocus.day;
}

export function updateGeometryConfig() {
    config.geometry.turns = config.timeline.death;
    config.geometry.pointsPerTurn = Math.floor(config.timeline.daysPerYear);
    config.geometry.totalPoints = Math.floor(0.25 * config.geometry.turns * config.geometry.pointsPerTurn);
    config.geometry.minRadius = 5;
    config.geometry.growRadius = 10;
    config.geometry.height = config.timeline.death * config.timeline.stretch;
}

updateConfig();
updateGeometryConfig();

export default config;