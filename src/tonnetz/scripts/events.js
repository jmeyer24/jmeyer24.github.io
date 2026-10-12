import { config } from "./config";
import { mod } from "./utilities";
import { markNotes, scrollThroughChords, updateNoteIndices, updateNotes, updateChordPossibilites, updateScalePossibilites, recenterTonnetzByPatternIndex, drawNotes } from "./notes";

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
            case 37: // on left
                keydownArrow(event, 5)
                break;
            case 38: // on up
                keydownArrow(event, 9)
                break;
            case 39: // on right
                keydownArrow(event, 7);
                break;
            case 40: // on down
                keydownArrow(event, 3);
                break;
            case 67: // on "c": iterate through possibilities
                // config.scale.toggle = false;
                keydownPossibilities(-1);
                break;
            case 86: // on "v": iterate through possibilities reverse
                // config.scale.toggle = false;
                keydownPossibilities(1);
                break;
            case 68: // on "d": iterate through scales (lydian -> locrian, bright -> dark)
                config.scale.toggle = true;
                keydownPossibilities(-1, "scale");
                break;
            case 70: // on "f": iterate through scales reverse
                config.scale.toggle = true;
                keydownPossibilities(1, "scale");
                break;
            case 83: // on "s": toggle everything on/scale off
                keydownPossibilities(0, "scale");
                config.scale.toggle = !config.scale.toggle;
                markNotes(true)
                break;
            case 88: // on "x": toggle everything off/isChord on
                config.chord.toggle = !config.chord.toggle;
                config.scale.toggle = false;
                markNotes()
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
    markNotes(true);
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
    markNotes(true);
}

function keydownPossibilities(value, which = "chord") {
    const isChord = which == "chord"
    isChord ? updateChordPossibilites() : updateScalePossibilites();
    const o = isChord ? config.chord : config.scale;
    if (o.possibilities.length > 0) {
        o.currentPossibility = mod((o.currentPossibility + value), o.possibilities.length);
        o.current = o.possibilities[o.currentPossibility];
    }
    markNotes(true);
}

export { initEvents };