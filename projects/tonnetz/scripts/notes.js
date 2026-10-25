import { config } from "./config";
import { mod, computeScalingFromHeight } from "./utilities";

function recenterTonnetzByNoteIndex(i) {
    const {
        note: { indices, center, offsetCenter },
    } = config;

    config.note.offset = indices[i] + offsetCenter;
    config.applyNoteOffset();
    config.note.root = center;
    config.note.destination = center;
}

function markNotes() {
    // mark the respective notes by adding a coloring ccs class
    const {
        display: { notesPerRow, togglePianoKeys, pianoKeys },
        note: { chromaticSteps, names, indices, root, destination, destinationIndices, intervals },
        chord: { toggle: toggleChord, halfstepMovement },
        scale: { toggle: toggleScale, possibilities, namesRoman, currentPossibility },
    } = config;

    // add names for chord function or scale mood under tone name
    let name = "";

    // mark the whole scale
    if (toggleScale && possibilities.length > 0) {
        // get the scale mood as halfsteps (hs) from the current root index
        const scale = config.scale.options[config.scale.names[config.scale.current]];
        scale.forEach((hs, i) => scale[i] = mod(hs + indices[root], chromaticSteps));
        $("#noteBin .note")
            .filter(i => scale.includes(indices[i]))
            .addClass("marked scaleNote extra")
    };

    // mark the destination note
    if (destination != root) {
        name = `${names[indices[destination]] + "\n" + intervals[destinationIndices[destination]]}`;
        $("#noteBin .note")
            .eq(destination)
            .removeClass("scaleNote")
            .addClass("marked destination")
            .html(name);
    }

    // mark the current chord
    if (toggleChord) {
        // get the chord as halfsteps (hs) from the current root index
        const chordName = config.chord.names[config.chord.current];
        const chord = config.chord.options[chordName];
        chord
            .forEach((hs, i) => {
                // get the position of the note on the tonnetz
                const k = mod(root + halfstepMovement[hs], notesPerRow ** 2);
                name = names[indices[k]];
                if (k == root) {
                    // write chord name at root
                    name += chordName;
                    // write scale function at root
                    if (toggleScale && possibilities.length > 0) {
                        name += "\n" + namesRoman[possibilities[currentPossibility]];
                    }
                } else {
                    // write chord function of non-root notes
                    name += "\n" + intervals[chord[i]];
                }
                $("#noteBin .note")
                    .eq(k)
                    .removeClass("scaleNote destination")
                    .addClass((k == root) ? "marked root" : "marked chordNote")
                    .html(name);
            })
    }

    // mark pianoKey notes (white keys <> black keys)
    if (togglePianoKeys) {
        $("#noteBin .note")
            .filter(i => pianoKeys.includes(indices[i]))
            .toggleClass("pianoKey");
    }
}

function updateNotes() {
    const {
        display: { doMarkNotes },
        note: { indices, names },
    } = config;

    // rename notes
    $("#noteBin .note")
        .removeClass("marked root chordNote destination scaleNote pianoKey")
        .html(i => `${names[indices[i]]}`);

    if (!doMarkNotes) {
        config.display.doMarkNotes = !doMarkNotes;
    } else {
        markNotes();
    }
}

function initNotes() {
    const {
        display: { notesPerRow, vertices },
        note: { indices, names }
    } = config;

    // position the note divs offset from the center
    const center = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    };
    // compute the scaling necessary to position the note divs on the tonnetz background
    const scaling = computeScalingFromHeight(window.innerHeight);

    // create a bin to store note divs
    $("#noteBin").length ? $("#noteBin").empty() : $("body").append(`<div id="noteBin"></div>`);

    // create the note divs
    for (let i = 0; i < notesPerRow ** 2; i++) {
        const offset = {
            x: vertices[i * 3] * scaling,
            y: vertices[i * 3 + 1] * scaling,
        };
        const noteDiv = `
            <div class="note w-0 h-0" style="left: ${center.x + offset.x}px; top: ${center.y - offset.y}px;" >
                ${names[indices[i]]}
            </div>
        `;
        // create the note divs with click events
        $("#noteBin")
            .append(
                $(noteDiv)
                    .click((event) => {
                        // mouseclick events: center menu on clicked note and mark chord
                        if (event.shiftKey) {
                            // center the destination note on the clicked note when shift+mouseclick
                            config.note.destination = i;
                        } else if (event.ctrlKey) {
                            // center the tonnetz on the clicked note when strg+mouseclick
                            recenterTonnetzByNoteIndex(i);
                        } else {
                            // center the chord on the clicked note
                            config.note.root = i;
                        }
                        updateNotes();
                    })
            );
    }
}

function positionNotes() {
    const { vertices } = config.display;

    const center = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    };
    const scaling = computeScalingFromHeight(window.innerHeight);

    $("#noteBin .note")
        .each(function (i) {
            const offset = {
                x: vertices[i * 3] * scaling,
                y: vertices[i * 3 + 1] * scaling,
            };
            $(this).css({
                "left": `${center.x + offset.x}px`,
                "top": `${center.y - offset.y}px`,
            })
        });
}

export { recenterTonnetzByNoteIndex, updateNotes, initNotes, positionNotes };