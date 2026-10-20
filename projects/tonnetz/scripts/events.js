import { config } from "./config";
import { mod } from "./utilities";
import { markNotes, scrollThroughChords, updateNoteIndices, updateNotes, recenterTonnetzByPatternIndex, drawNotes } from "./notes";

function initEvents() {
    // on event callback functions
    $(window).on('wheel', scrollThroughChords);
    $(window).keydown(function (event) {
        // console.log(event.which);
        switch (event.which) {
            case 13: // enter: recenter on root note
                keydownEnter(event);
                break;
            case 32: // spacebar: toggle pianoKeys
                config.display.togglePianoKeys = !config.display.togglePianoKeys;
                drawNotes();
                markNotes();
                break;

            // movement
            case 37: // on left
                keydownArrow(event, 5)
                markNotes();
                break;
            case 38: // on up
                keydownArrow(event, 9)
                markNotes();
                break;
            case 39: // on right
                keydownArrow(event, 7);
                markNotes();
                break;
            case 40: // on down
                keydownArrow(event, 3);
                markNotes();
                break;

            case 82: // on "r": unmark everything
                config.chord.toggle = false;
                config.scale.toggle = false;
                markNotes(true)
                break;

            // chord events
            case 67: // on "c": iterate through possibilities
                config.chord.toggle = true;
                keydownChordPossibilities(-1);
                if (config.scale.toggle) {
                    keydownScalePossibilities();
                }
                markNotes();
                break;
            case 86: // on "v": iterate through possibilities reverse
                config.chord.toggle = true;
                keydownChordPossibilities(1);
                if (config.scale.toggle) {
                    keydownScalePossibilities();
                }
                markNotes();
                break;
            case 89: // on "y": reset to root note only
                config.chord.toggle = true;
                config.chord.current = 0;
                keydownChordPossibilities();
                keydownScalePossibilities();
                markNotes()
                break;
            case 88: // on "x": toggle chord on/off
                config.chord.toggle = !config.chord.toggle;
                markNotes()
                break;

            // scale events
            case 68: // on "d": iterate through scales (lydian -> locrian, bright -> dark)
                config.scale.toggle = true;
                keydownScalePossibilities(-1);
                markNotes();
                break;
            case 70: // on "f": iterate through scales reverse
                config.scale.toggle = true;
                keydownScalePossibilities(1);
                markNotes();
                break;
            case 83: // on "s": toggle scale on/off
                config.scale.toggle = !config.scale.toggle;
                markNotes();
                break;

            default:
                return;
        }
    });
}

function keydownEnter(event) {
    const { destination, root } = config.note;

    if (event.shiftKey) {
        recenterTonnetzByPatternIndex(destination);
    } else if (event.ctrlKey) {
        config.note.destination = root;
    } else {
        recenterTonnetzByPatternIndex(root);
    }
}

function keydownArrow(event, halfsteps) {
    const {
        display: { halfstepMap, notesPerRow },
        note: { destination, root, indices, center }
    } = config;

    if (event.shiftKey) {
        // mark destination note, then ctrl key event
        $("#noteBin div").eq(destination).removeClass("marked destination");
        config.note.destination = mod(destination + halfstepMap[halfsteps], indices.length);
        $("#noteBin div").eq(config.note.destination).addClass("marked destination");
        updateNoteIndices();
    } else if (event.ctrlKey) {
        config.note.offset = indices[center] + halfsteps;
        updateNotes();
    } else {
        const save = destination == root
        config.note.root = mod(root + halfstepMap[halfsteps], notesPerRow ** 2);
        if (save) {
            config.note.destination = config.note.root;
        }
        updateNoteIndices();
    }
}

function keydownChordPossibilities(value = 0, reset = false) {
    const {
        possibilities, currentPossibility, updateFunction
    } = config.chord;

    updateFunction();
    if (possibilities.length > 0) {
        config.chord.currentPossibility = reset ? 0 : mod((currentPossibility + value), possibilities.length);
        config.chord.current = possibilities[config.chord.currentPossibility];
    }
}

function keydownScalePossibilities(value = 0, reset = false) {
    const {
        possibilities, currentPossibility, updateFunction
    } = config.scale;

    updateFunction();
    if (possibilities.length > 0) {
        config.scale.currentPossibility = reset ? 0 : mod((currentPossibility + value), possibilities.length);
        config.scale.current = possibilities[config.scale.currentPossibility];
    }
}

export { initEvents };