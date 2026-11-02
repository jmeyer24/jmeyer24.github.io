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
    config.gui.gui = new GUI({ width: 500, title: "C\u0332ontrols" }).close();
    const {
        gui: { gui },
        timeline,
        timeline: { maxYears, daysPerYear },
        cameraFocus,
        animation,
        geometry,
    } = config;

    config.gui.guiTimeline = gui.addFolder("T\u0332imeline");
    config.gui.guiCamera = gui.addFolder("Camera F\u0332ocus");
    config.gui.guiAnimation = gui.addFolder("A\u0332nimation");
    const { guiTimeline, guiCamera, guiAnimation } = config.gui;

    const drawController = guiTimeline.add(timeline, "draw").name("D\u0332raw Timeline");
    const deathController = guiTimeline.add(timeline, "death", 1, maxYears, 1).name("Maximum Years");
    const stretchController = guiTimeline.add(geometry, "stretch", 1, 20, 0.1).name("Stretch Factor");
    const flyAlongController = guiCamera.add(cameraFocus, "flyAlong").name("Fly\u0332 Along");
    const focusSunController = guiCamera.add(cameraFocus, "focusSun").name("Focus S\u0332un").show(config.cameraFocus.flyAlong);
    const thetaController = guiCamera.add(cameraFocus, "earthFocusTheta", 0, Math.PI * 2, 0.1).name("View Angle").show(!config.cameraFocus.focusSun);
    const timeController = guiCamera.add(cameraFocus, "time", 0, 1 - 1e-5, 1e-3).name("On Time");
    const yearController = guiCamera.add(cameraFocus, "year", 1, config.timeline.death, 1).name("On Year");
    const dayController = guiCamera.add(cameraFocus, "day", 1, daysPerYear, 1).name("On Day");
    const runTimeController = guiAnimation.add(animation, "runTime").name("Run \u0332Time");
    const timeIncrementController = guiAnimation.add(animation, "timeIncrement", 1, daysPerYear / 12 * 24, 1).name("Time Speed (Hours/Second)");
    const timeResetController = guiAnimation.add(animation, "resetTime").name("R\u0332eset Time");

    // adapt camera focus gui when changing death
    drawController.onChange(() => {
        updateTimeline();
    });
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
        thetaController.show(value);
    });
    focusSunController.onChange((value) => {
        thetaController.show(!value);
        updateScene();
    });
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