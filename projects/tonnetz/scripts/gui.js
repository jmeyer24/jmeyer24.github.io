import dat from "dat.gui";

import { config, updateConfig } from "./config";
import { updateNotes } from "./notes";
import { redrawTonnetz } from "./tonnetz";

function initGui() {
    const gui = new dat.gui.GUI();
    gui.close();

    gui.add(config.note, "offset", 0, 11, 1).name("Tonnetz Center").onFinishChange(updateNotes);
    gui.add(config.display, "segments", 4, 14, 1).name("Tesselation").onChange(() => { updateConfig(); redrawTonnetz(); updateNotes() });
}

export { initGui };