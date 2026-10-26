import { GUI } from "three/addons/libs/lil-gui.module.min.js";

import { config, applyDeath, applyTime, applyYearOrDay } from "./config";
import { updateScene } from "./scene";
import { updateTimeline } from "./timeline";

function updateGuiCamera() {
    config.gui.gui.children[1].controllers.forEach(controller => {
        controller.updateDisplay();
    });
}

function initGui() {
    config.gui.gui = new GUI({ width: 500, title: "C\u0332ontrols" });
    const {
        gui: { gui },
        timeline,
        timeline: { maxYears, daysPerYear },
        cameraFocus,
        animation,
        geometry,
    } = config;

    config.gui.guiTimeline = gui.addFolder("T\u0332imeline").close();
    config.gui.guiCamera = gui.addFolder("Camera F\u0332ocus").close();
    config.gui.guiAnimation = gui.addFolder("A\u0332nimation");
    const { guiTimeline, guiCamera, guiAnimation } = config.gui;

    const deathController = guiTimeline.add(timeline, "death", 1, maxYears, 1).name("Maximum Years");
    const stretchController = guiTimeline.add(geometry, "stretch", 1, 20, 0.1).name("Stretch Factor");
    const flyAlongController = guiCamera.add(cameraFocus, "flyAlong").name("Fly\u0332 Along");
    const focusSunController = guiCamera.add(cameraFocus, "focusSun").name("Focus S\u0332un").show(config.cameraFocus.flyAlong);
    const timeController = guiCamera.add(cameraFocus, "time", 0, 1 - 1e-5, 1e-3).name("On Time");
    const yearController = guiCamera.add(cameraFocus, "year", 1, config.timeline.death, 1).name("On Year");
    const dayController = guiCamera.add(cameraFocus, "day", 1, daysPerYear, 1).name("On Day");
    const runTimeController = guiAnimation.add(animation, "runTime").name("Run \u0332Time");
    const timeIncrementController = guiAnimation.add(animation, "timeIncrement", 1, daysPerYear * 4, 1).name("Time Speed (Days/Second)");
    const timeResetController = guiAnimation.add(animation, "resetTime").name("R\u0332eset Time");

    // adapt camera focus gui when changing death
    deathController
        .onChange((value) => {
            config.animation.runTime = false;
            runTimeController.updateDisplay();
            applyDeath()
            applyTime()
            yearController.max(value);
            yearController.updateDisplay();
            dayController.updateDisplay();
            updateTimeline();
            updateScene();
        });
    stretchController.onChange(() => {
        updateTimeline();
        updateScene();
    });

    flyAlongController.onChange((value) => {
        focusSunController.show(value);
    });
    focusSunController.onChange(() => updateScene());
    timeController.onChange(() => {
        config.animation.runTime = false;
        runTimeController.updateDisplay();
        applyTime();
        yearController.updateDisplay();
        dayController.updateDisplay();
        updateScene();
    });
    yearController.onChange(() => {
        config.animation.runTime = false;
        runTimeController.updateDisplay();
        applyYearOrDay();
        timeController.updateDisplay();
        updateScene();
    });
    dayController.onChange(() => {
        config.animation.runTime = false;
        runTimeController.updateDisplay();
        applyYearOrDay();
        timeController.updateDisplay();
        updateScene();
    });

    config.animation.resetTime = () => {
        config.cameraFocus.time = 0;
        applyTime();
        updateScene();
        updateGuiCamera();
    };
}

export { initGui, updateGuiCamera }