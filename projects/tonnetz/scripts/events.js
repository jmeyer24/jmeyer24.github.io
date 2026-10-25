import { config } from "./config";
import { redrawTonnetz } from "./tonnetz";
import { mod } from "./utilities";
import { initNotes, updateNotes, recenterTonnetzByNoteIndex } from "./notes";

function keydownEnter(event) {
    const { destination, root } = config.note;

    if (event.shiftKey) {
        recenterTonnetzByNoteIndex(destination);
    } else if (event.ctrlKey) {
        config.note.destination = root;
    } else {
        recenterTonnetzByNoteIndex(root);
    }
}

function keydownArrow(event, halfsteps) {
    const {
        display: { halfstepMovement, notesPerRow },
        note: { chromaticSteps, destination, root, indices },
    } = config;

    if (event.shiftKey) {
        // mark destination note, then ctrl key event
        $("#noteBin div").eq(destination).removeClass("marked destination");
        config.note.destination = mod(destination + halfstepMovement[halfsteps], indices.length);
        $("#noteBin div").eq(config.note.destination).addClass("marked destination");
    } else if (event.ctrlKey) {
        config.note.offset = mod(config.note.offset + halfsteps, chromaticSteps);
        config.applyNoteOffset();
    } else {
        config.note.root = mod(root + halfstepMovement[halfsteps], notesPerRow ** 2);
        if (destination == root) { // root is the old value!
            config.note.destination = config.note.root;
        }
    }

    // on movement show the chord
    config.chord.toggle = true;
}

function keydownChordPossibilities(shiftPossibility = 0, reset = false) {
    const {
        possibilities, currentPossibility, updateFunction
    } = config.chord;

    updateFunction();
    if (possibilities.length > 0) {
        config.chord.currentPossibility = reset ? 0 : mod((currentPossibility + shiftPossibility), possibilities.length);
        config.chord.current = possibilities[config.chord.currentPossibility];
    }
}

function keydownScalePossibilities(shiftPossibility = 0, reset = false) {
    const {
        possibilities, currentPossibility, updateFunction
    } = config.scale;

    updateFunction();
    if (possibilities.length > 0) {
        config.scale.currentPossibility = reset ? 0 : mod((currentPossibility + shiftPossibility), possibilities.length);
        config.scale.current = possibilities[config.scale.currentPossibility];
    }
}

function scrollEvent(event) {
    const {
        display: { notesPerRow, minNotesPerRow, maxNotesPerRow },
        note: { chromaticSteps },
    } = config;

    if (config.display.isScrolling) return;

    function updateTesselation(changeNotesPerRow, changeOffset) {
        config.display.notesPerRow = config.display.notesPerRow + changeNotesPerRow;
        config.applyNotesPerRow();
        redrawTonnetz();
        config.note.offset = mod(config.note.offset + changeOffset, chromaticSteps);
        config.applyNoteOffset();
        initNotes();
    }

    // deltaY secords vertical scroll, deltaX and deltaZ exist too.
    // this condition makes sure it's vertical scrolling that changes chords
    const delta = event.originalEvent.deltaY;
    if (event.ctrlKey && delta) {
        // change the tesselation of the tonnetz
        if (delta > 0 && notesPerRow > minNotesPerRow) {
            updateTesselation(-2, 3);
        } else if (delta < 0 && notesPerRow < maxNotesPerRow) {
            updateTesselation(2, -3);
        }

        config.display.isScrolling = true;
        setTimeout(() => {
            config.display.isScrolling = false;
        }, config.display.scrollingPause);
    }

    updateNotes();
}

function initEvents() {
    // on event callback functions
    $(window).on('wheel', { passive: false }, scrollEvent);
    $(window).keydown(function (event) {
        // console.log(event.which);
        switch (event.key) {
            case "Enter": // recenter on root note
                keydownEnter(event);
                break;
            case " ": // toggle pianoKeys
                config.display.togglePianoKeys = !config.display.togglePianoKeys;
                break;

            // movement
            case "ArrowLeft":
                keydownArrow(event, 5)
                break;
            case "ArrowRight":
                keydownArrow(event, 7);
                break;
            case "ArrowUp":
                keydownArrow(event, 9)
                break;
            case "ArrowDown":
                keydownArrow(event, 3);
                break;

            case "r": // unmark everything
                config.chord.toggle = false;
                config.scale.toggle = false;
                config.display.doMarkNotes = false;
                break;

            // chord events
            case "c": // iterate through possibilities
                config.chord.toggle = true;
                keydownChordPossibilities(-1);
                if (config.scale.toggle) {
                    keydownScalePossibilities();
                }
                break;
            case "v": // iterate through possibilities reverse
                config.chord.toggle = true;
                keydownChordPossibilities(1);
                if (config.scale.toggle) {
                    keydownScalePossibilities();
                }
                break;
            case "x": // toggle chord on/off
                config.chord.toggle = !config.chord.toggle;
                break;
            case "y": // reset to root note only
                config.chord.toggle = true;
                config.chord.current = 0;
                break;

            // scale events
            case "d": // iterate through scales (lydian -> locrian, bright -> dark)
                config.scale.toggle = true;
                keydownScalePossibilities(-1);
                break;
            case "f": // iterate through scales reverse
                config.scale.toggle = true;
                keydownScalePossibilities(1);
                break;
            case "s": // toggle scale on/off
                config.scale.toggle = !config.scale.toggle;
                break;

            default:
                break;
        }

        updateNotes();
    });
}


export { initEvents };