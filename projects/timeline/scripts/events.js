import config from "./config";

export default function initEvents() {
    const { gui, guiTimeline, guiCamera } = config.gui;

    $(window).keydown(function (event) {
        switch (event.key.toLowerCase()) {
            case "o":
                gui.open(gui._closed);
                break;

            case "e":
                if (gui._closed) {
                    gui.open();
                    guiTimeline.open();
                } else {
                    guiTimeline.open(guiTimeline._closed);
                }
                break;
            case "m":
                gui.open()
                guiTimeline.open();
                guiTimeline.controllers[0].$input.focus();
                break;
            case "s":
                gui.open();
                guiTimeline.open();
                guiTimeline.controllers[1].$input.focus();
                break;

            case "a":
                if (gui._closed) {
                    gui.open();
                    guiCamera.open();
                } else {
                    guiCamera.open(guiCamera._closed);
                }
                break;
            case "f":
                gui.open();
                guiCamera.open();
                guiCamera.controllers[0].setValue(!config.cameraFocus.flyAlong);
                break;
            case "r":
                gui.open();
                guiCamera.open();
                guiCamera.controllers[1].setValue(!config.cameraFocus.fromOutside);
                break;
            case "i":
                gui.open();
                guiCamera.open();
                guiCamera.controllers[2].$input.focus();
                break;
            case "t":
                gui.open();
                guiCamera.open();
                guiCamera.controllers[3].$input.focus();
                break;
            case "y":
                gui.open();
                guiCamera.open();
                guiCamera.controllers[4].$input.focus();
                break;
            case "d":
                gui.open();
                guiCamera.open();
                guiCamera.controllers[5].$input.focus();
                break;

            default:
                break;
        }
    })
}