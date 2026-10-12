import { config } from "./config"
import { markNotes } from "./notes"

$("body").append(`<div id="menu"></div>`);

function initMenu() {
    const center = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    };
    const scaling = config.display.scaling * config.display.unknownScaling;
    const offset = {
        x: scaling * config.display.vertices[config.note.root * 3],
        y: scaling * config.display.vertices[config.note.root * 3 + 1]
    };
    $("#menu")
        .empty()
        .css('left', `${center.x + offset.x}px`)
        .css('top', `${center.y - offset.y}px`)
        .append(`<div class="menuNote">${config.note.names[config.note.indices[config.note.root]]}</div>`)
        .click(() => {
            markNotes(config.note.root)
        });

    // Object.entries(config.chord.options).forEach(([key, value]) => {
    ["major third", "minor third"].forEach(key => {
        $("#menu").append($(`<div class="menuPart">${key}</div>`))
    });

    // TODO: markNotes(i) after menu selection
    // TODO: establish links and respective chords(use markNotes() again)
    // TODO: write the note name: update it every click
    // TODO: add respective function for updating noteFunctions on click
    // TODO: shrink the menu on mouse click and on mouse leave
}

export { initMenu };