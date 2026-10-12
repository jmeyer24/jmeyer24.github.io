import { config } from "./config";
import { mod } from "./utilities";
import { markChord, scrollThroughChords, updateNoteIndices, updateNotes, updateChordPossibilites, updateScalePossibilites, recenterTonnetzByPatternIndex } from "./notes";

function initEvents() {
    // on event callback functions
    $(window).on('wheel', scrollThroughChords);
    $(window).keydown(function (event) {
        console.log(event.which);
        switch (event.which) {
            case 13: // enter: focus on destination Note
                keydownEnter();
                break;
            case 32: // space bar: toggle everything off, chord on only
                markChord()
                // toggle scale off, but not on with space
                config.scale.toggle = config.scale.toggle ? !config.scale.toggle : config.scale.toggle;
                break;
            case 37: // on left: keydownArrow function
                keydownArrow(5)
                break;
            case 38: // on up
                keydownArrow(9)
                break;
            case 39: // on right
                keydownArrow(7);
                break;
            case 40: // on down
                keydownArrow(3);
                break;
            case 67: // on "c": iterate through possibilities upward
                config.scale.toggle = false;
                keydownChords(1);
                break;
            case 86: // on "v": iterate through possibilities downward
                config.scale.toggle = false;
                keydownChords(-1);
                break;
            case 68: // on "d": iterate through scales upward
                config.scale.toggle = true;
                keydownScales(1);
                break;
            case 70: // on "f": iterate through scales downward
                config.scale.toggle = true;
                keydownScales(-1);
                break;
            case 83: // on "s": toggle scale only
                keydownScales(0);
                config.scale.toggle = !config.scale.toggle;
                markChord(true)
                break;
            case 88: // on "x": toggle chord only
                config.chord.toggle = !config.chord.toggle;
                markChord(true)
                break;
            default:
                return;
        }

        function keydownEnter() {
            // see start of file
            if (event.ctrlKey) {

            } else if (event.shiftKey) {
                recenterTonnetzByPatternIndex(config.note.destination);
            } else {
                recenterTonnetzByPatternIndex(config.note.root);
            }
            config.note.destination = config.note.root;
            markChord(true);
        }

        function keydownArrow(halfsteps) {
            if (event.shiftKey) {
                // mark destination note, then ctrl key event
                $("#noteBin div").eq(config.note.destination).removeClass("marked destination");
                config.note.destination += config.display.halfstepMap[halfsteps];
                config.note.destination = mod(config.note.destination, config.note.indices.length);
                $("#noteBin div").eq(config.note.destination).addClass("marked destination");
            } else if (event.ctrlKey) {
                config.note.offset = config.note.indices[config.note.root] + halfsteps;
                updateNotes();
            } else {
                let save = config.note.destination == config.note.root
                config.note.root += config.display.halfstepMap[halfsteps];
                config.note.root = mod(config.note.root, config.display.notesPerRow ** 2);
                if (save) {
                    config.note.destination = config.note.root;
                }
                updateNoteIndices();
            }
            markChord(true);
        }

        function keydownChords(value) {
            updateChordPossibilites();
            config.chord.currentPossibility = mod((config.chord.currentPossibility + value), config.chord.possibilities.length);
            config.chord.current = config.chord.possibilities[config.chord.currentPossibility];
            markChord(true);
        }

        function keydownScales(value) {
            updateScalePossibilites();
            if (config.scale.possibilities.length > 0) {
                config.scale.currentPossibility = mod((config.scale.currentPossibility + value), config.scale.possibilities.length);
                config.scale.current = config.scale.possibilities[config.scale.currentPossibility];
            }
            markChord(true);
        }
    });
}

export { initEvents };