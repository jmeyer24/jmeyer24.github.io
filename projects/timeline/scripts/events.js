import { config } from "./config";

function initEvents() {
    const { gui, guiTimeline, guiCamera, guiAnimation } = config.gui;

    $(window).keydown(function (event) {
        switch (event.key.toLowerCase()) {
            case "c":
                gui.open(gui._closed);
                break;

            case "t":
                if (gui._closed) {
                    gui.open();
                    guiTimeline.open();
                } else {
                    guiTimeline.open(guiTimeline._closed);
                }
                break;

            case "f":
                if (gui._closed) {
                    gui.open();
                    guiCamera.open();
                } else {
                    guiCamera.open(guiCamera._closed);
                }
                break;
            case "y":
                guiCamera.controllers[0].setValue(!config.cameraFocus.flyAlong);
                break;
            case "s":
                guiCamera.controllers[1].setValue(!config.cameraFocus.focusSun);
                break;

            case "a":
                if (gui._closed) {
                    gui.open();
                    guiAnimation.open();
                } else {
                    guiAnimation.open(guiAnimation._closed);
                }
                break;
            case " ":
                guiAnimation.controllers[0].setValue(!config.animation.runTime);
                break;
            case "r":
                const controller = guiAnimation.controllers[2];
                controller.object[controller.property]();
                break;

            default:
                break;
        }
    })
}

export { initEvents };