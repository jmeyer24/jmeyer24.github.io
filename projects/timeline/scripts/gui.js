import { GUI } from "three/addons/libs/lil-gui.module.min.js";

import config from "./config";
import { updateConfig } from "./config";
import { updateTimeline, updateCamera } from "./scene";
import { mod, roundingTo, clamp } from "./utilities";
import { bool } from "three/tsl";

export default function initGui() {
    config.gui.gui = new GUI({ width: 500, title: "Co\u0332ntro\u0332ls" });
    const {
        gui: { gui },
        timeline,
        timeline: { maxYears, daysPerYear },
        cameraFocus,
    } = config;

    config.gui.guiTimeline = gui.addFolder("Time\u0332line\u0332").close();
    config.gui.guiCamera = gui.addFolder("Ca\u0332mera\u0332 Focus");
    const { guiTimeline, guiCamera } = config.gui;

    const deathController = guiTimeline.add(timeline, "death", 1, maxYears, 1).name("M\u0332aximum Years");
    const stretchController = guiTimeline.add(timeline, "stretch", 1, 20, 0.1).name("S\u0332tretch Factor");
    const flyAlongController = guiCamera.add(cameraFocus, "flyAlong").name("F\u0332ly Along");
    const fromOutsideController = guiCamera.add(cameraFocus, "fromOutside").name("F\u0332rom Outside").show(config.cameraFocus.flyAlong);
    const distanceController = guiCamera.add(cameraFocus, "distance", 20, 150, 1).name("Di\u0332stance").show(config.cameraFocus.flyAlong);
    const timeController = guiCamera.add(cameraFocus, "time", 0, 1 - 1e-5, 1e-3).name("On T\u0332ime");
    const yearController = guiCamera.add(cameraFocus, "year", 1, config.timeline.death, 1).name("On Y\u0332ear");
    const dayController = guiCamera.add(cameraFocus, "day", 1, daysPerYear, 1).name("On D\u0332ay");

    // adapt camera focus gui when changing death
    deathController
        .onFinishChange((value) => {
            if (yearController.getValue() > value) {
                config.cameraFocus.time = 1 - 1e-5;
                config.cameraFocus.year = value;
            }
            yearController.max(value);
            yearController.updateDisplay();

            timeController.setValue(1 - 1e-5);
            timeController.updateDisplay();
            // updateConfig();

            updateTimeline();
            updateCamera();
        });
    stretchController.onChange(() => { updateTimeline(); updateCamera(); });

    flyAlongController.onChange((value) => {
        fromOutsideController.show(value);
        distanceController.show(value);
    });
    fromOutsideController.onChange(() => updateCamera());
    distanceController.onChange(() => updateCamera());
    timeController
        .onChange((value) => {
            if (value == 1) {
                config.cameraFocus.year = config.timeline.death;
                config.cameraFocus.day = daysPerYear;
            } else {
                let days = value * config.timeline.daysTillDeath;
                config.cameraFocus.year = clamp(days / daysPerYear + 1, 1, config.timeline.death);
                config.cameraFocus.day = clamp(mod(days, daysPerYear) + 1, 1, daysPerYear);
            }
            yearController.updateDisplay();
            dayController.updateDisplay();
            updateCamera();
        });

    function updateTime() {
        const time = ((config.cameraFocus.year - 1) * daysPerYear + (config.cameraFocus.day - 1)) / config.timeline.daysTillDeath;
        config.cameraFocus.time = roundingTo(time, 5);
        timeController.updateDisplay();
    }
    yearController.onChange(() => { updateTime(); updateCamera(); });
    dayController.onChange(() => { updateTime(); updateCamera(); });
}