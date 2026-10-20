import { config } from "./config";
import { mod, drawPianoKeys } from "./utilities";

$("body").append(`<div id="noteBin"></div>`);

function drawNotes() {
    const {
        display: { notesPerRow, vertices },
        note: { indices, names }
    } = config;

    $("#noteBin").empty();
    const center = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    };

    // create the notes on the tonnetz
    for (let i = 0; i < (notesPerRow) ** 2; i++) {
        const offset = {
            x: vertices[i * 3],
            y: vertices[i * 3 + 1]
        };

        // add a note to the noteBin
        const noteDiv = `
            <div class="note w-0 h-0"
                style="
                    left: ${center.x + offset.x}px; 
                    top: ${center.y - offset.y}px; 
                    color: var(${drawPianoKeys(indices[i]) ? "--color-text" : "--color-button"}); 
                    background-color: var(${drawPianoKeys(indices[i]) ? "--color-button" : "--color-text"})
                "
            >
                ${names[indices[i]]}
            </div>
        `;
        $("#noteBin")
            .append(
                $(noteDiv)
                    .click((event) => {
                        // mouseclick events: center menu on clicked note and color chord
                        if (event.shiftKey) {
                            // center the destination note on the clicked note when shift+mouseclick
                            config.note.destination = i;
                            markNotes();
                        } else if (event.ctrlKey) {
                            // center the tonnetz on the clicked note when strg+mouseclick
                            recenterTonnetzByPatternIndex(i);
                            markNotes();
                        } else {
                            // center the chord on the clicked note
                            config.note.root = i;
                            markNotes();
                        }
                    })
            );
    }
}

function updateNoteIndices() {
    /*
    apply the current note offset to the noteIndices

    return: null (implicit change in config)
    */
    const { indices, defaultIndices, offset, names, root } = config.note;

    config.note.indices = defaultIndices.map(value => mod(value + offset, names.length));
    config.note.destinationIndices = defaultIndices.map(value => mod(value + offset - indices[root], names.length));
}

function updateNotes() {
    updateNoteIndices();
    // TODO: instead of redrawing, just change the htmls of the already drawn notes
    drawNotes();
}

function recenterTonnetzByPatternIndex(index) {
    const { note: { indices, center } } = config

    config.note.offset = indices[index];
    config.note.root = center;
    config.note.destination = center;
    updateNotes();
}

function markNotes(unmarkOnly = false) {
    const {
        display: { notesPerRow },
        note: { names: names_n, indices, differentNotes, root, destination, destinationIndices, intervals },
        chord: { options: options_c, names: names_c, current: current_c, toggle: toggle_c, halfstepMap },
        scale: { options: options_s, names: names_s, current: current_s, toggle: toggle_s, possibilities, namesRoman, currentPossibility },
    } = config;

    // TODO: restrictions to the tonnetz, as indices go out of bounds

    // get the array of halfsteps from the root
    let chord = options_c[names_c[current_c]];
    chord.forEach((element, i, array) => array[i] = mod(element, differentNotes));

    // remove all previous coloring
    $("#noteBin").children().each(function (index) {
        $(this)
            .removeClass("marked root chordNote destination scaleNote")
            .html(`${names_n[indices[index]]}`);
    });
    if (unmarkOnly) { return; }

    // color the current chord by adding a class to respective notes
    let name = "";

    // mark scale notes
    if (toggle_s && possibilities.length > 0) {
        const scale = options_s[names_s[current_s]];
        if (scale) {
            const newScale = scale.map(element => mod(element + indices[root], names_n.length));
            indices.forEach((element, index) => {
                if (newScale.includes(element)) {
                    $("#noteBin div")
                        .eq(index)
                        .addClass("marked scaleNote extra");
                }
            });
        }
    }

    // mark destination note
    if (destination != root) {
        name = `${names_n[indices[destination]] + "\n" + intervals[destinationIndices[destination]]}`;
        $("#noteBin div")
            .eq(destination)
            .removeClass("marked scaleNote")
            .addClass("marked destination")
            .html(name);
    }

    // mark chord notes
    if (toggle_c) {
        chord.map(i => halfstepMap[i]).forEach((halfsteps, index) => {
            const k = root + halfsteps;
            if (k < (notesPerRow) ** 2) {
                if (k == root) {
                    // write scale or chord name at root
                    if (toggle_s && possibilities.length > 0) {
                        name = `${names_n[indices[k]] + "\n" + namesRoman[possibilities[currentPossibility]]}`;
                    } else {
                        name = `${names_n[indices[k]] + "\n" + names_c[current_c]}`;
                    }
                } else {
                    // write chord function of non-root notes
                    name = `${names_n[indices[k]] + "\n" + intervals[chord[index]]}`;
                }
                $("#noteBin div").eq(k)
                    .removeClass("marked scaleNote destination")
                    .addClass((k == root) ? "marked root" : "marked chordNote")
                    .html(name);
            }
        });
    }
}
function scrollThroughChords(event) {
    const { current, options } = config.chord;

    // deltaY obviously records vertical scroll, deltaX and deltaZ exist too.
    // this condition makes sure it's vertical scrolling that changes chords
    const delta = event.originalEvent.deltaY;
    if (delta !== 0) {
        config.chord.current = mod(delta < 0 ? current + 1 : current - 1, Object.keys(options).length);
    }
    markNotes();
}

export { markNotes, drawNotes, scrollThroughChords, updateNoteIndices, updateNotes, recenterTonnetzByPatternIndex };