import { setup, resize, animate } from "./scripts/scene";

import { drawNotes } from "./scripts/notes";

import { initGui } from "./scripts/gui";
import { initMenu } from "./scripts/menu";
import { initEvents } from "./scripts/events";

// MOVEMENT FOR THE USER

// =============== movement ======================
// CLICK: choose this note as chord root
// ARROWS: move root in the arrow direction
// -----------------------------------------------
// +SHIFT: instead click/move destination note
// +CTRL: instead move tonnetz in respect to chord
// -----------------------------------------------

// =============== coloring ======================
// MOUSESCROLL: change chord color (maj7, -7, ...)
// SPACEBAR: toggle coloring

// =============== destination note ==============
// C/V: iterate through chords with destination note as interval note, upward/downward
// ENTER: center tonnetz on the root note
// +SHIFT: instead center on the destination note
// +CTRL: instead move destination note to root

function update() {
    resize();
    drawNotes();
}

setup();
update();

initGui();
initMenu();

initEvents();
$(window).on("resize", update);

animate();