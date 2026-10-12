import { config } from "./config";
import { mod, isDiatonic } from "./utilities";

$("body").append(`<div id="noteBin"></div>`);
const scaling = config.display.scaling * config.display.unknownScaling;

function drawNotes() {
    $("#noteBin").empty();
    const center = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    };

    // create the notes on the tonnetz
    for (let i = 0; i < (config.display.notesPerRow) ** 2; i++) {
        const offset = {
            x: scaling * config.display.vertices[i * 3],
            y: scaling * config.display.vertices[i * 3 + 1]
        };

        // add a note to the noteBin
        $("#noteBin")
            .append($(
                `<div class="note w-0 h-0"
                    style="left: ${center.x + offset.x}px; top: ${center.y - offset.y}px; color: ${isDiatonic(config.note.indices[i]) ? "--color-background" : "--color-background"}; background-color: ${isDiatonic(config.note.indices[i]) ? "--color-background" : "--color-background"}">
                    ${config.note.names[config.note.indices[i]]}
                </div>`)
                .click((event) => {
                    // mouseclick events: center menu on clicked note and color chord
                    if (event.shiftKey) {
                        // center the destination note on the clicked note when shift+mouseclick
                        config.note.destination = i;
                        markChord(true);
                    } else if (event.ctrlKey) {
                        // center the tonnetz on the clicked note when strg+mouseclick
                        recenterTonnetzByPatternIndex(i);
                        markChord(true);
                    } else {
                        // center the chord on the clicked note
                        config.note.root = i;
                        markChord();
                    }
                })
            )
    }
}

function updateNoteIndices() {
    /*
    apply the current note offset to the noteIndices

    return: null (implicit change in config)
    */
    config.note.indices = config.note.defaultIndices.map(value => mod(value + config.note.offset, config.note.names.length));
    config.note.destinationIndices = config.note.defaultIndices.map(value => mod(value + config.note.offset - config.note.indices[config.note.root], config.note.names.length));
}

function updateNotes() {
    updateNoteIndices();
    drawNotes();

    // instead of redrawing, just change the htmls of the already drawn notes
}

function updateChordPossibilites() {
    config.chord.possibilities = [];
    Object.entries(config.chord.options).forEach(([_, option], index) => {
        let hsFromRoot = config.note.destinationIndices[config.note.destination];
        if (option.includes(hsFromRoot)) {
            config.chord.possibilities.push(index);
        }
    })
}

function updateScalePossibilites() {
    /*
    check which scale is a possibility for the current chord
    */
    const chord = config.chord.options[config.chord.optionMap[config.chord.current]];

    config.scale.possibilities = [];
    Object.entries(config.scale.options).forEach(([_, option], index) => {
        if (chord.every(element => option.includes(element))) {
            config.scale.possibilities.push(index);
        }
    })
}

function recenterTonnetzByPatternIndex(index) {
    config.note.offset = config.note.indices[index];
    config.note.root = config.note.center;
    config.note.destination = config.note.center;
    updateNotes();
}

function markChord(disableToggle = false) {
    // TODO: restrictions to the tonnetz, as indices go out of bounds

    // make sure chord.current is valid
    config.chord.current = mod(config.chord.current, Object.keys(config.chord.options).length);

    // get the array of halfsteps from the root
    const chord = config.chord.options[config.chord.optionMap[config.chord.current]];

    // remove all previous coloring
    let isRoot = $("#noteBin div").eq(config.note.root).hasClass("root");
    $("#noteBin").children().each(function (index) {
        $(this)
            .removeClass("marked root chordNote destination scaleNote")
            .html(`${config.note.names[config.note.indices[index]]}`)
    })

    if (disableToggle) {
        isRoot = false;
    }

    // color the current chord by adding a class to respective notes
    // only if not already colored, then don't color (toggle)
    if (!isRoot) {
        let name = "";

        // mark scale notes
        if (config.scale.toggle && config.scale.possibilities.length > 0) {
            const scale = config.scale.options[config.scale.optionMap[config.scale.current]];
            if (scale) {
                const newScale = scale.map(element => mod(element + config.note.indices[config.note.root], config.note.names.length))
                config.note.indices.forEach((element, index) => {
                    if (newScale.includes(element)) {
                        $("#noteBin div")
                            .eq(index)
                            .addClass("marked scaleNote extra")
                    }
                })
                scale.forEach(halfsteps => {
                    $("#noteBin div")
                        .eq(config.note.root + config.scale.halfstepMap[halfsteps])
                        .removeClass("marked scaleNote extra")
                })
            }
        }

        // mark destination note
        if (config.note.destination != config.note.root) {
            name = `${config.note.names[config.note.indices[config.note.destination]] + "\n" + config.note.intervals[config.note.destinationIndices[config.note.destination]]}`;
            $("#noteBin div")
                .eq(config.note.destination)
                .removeClass("marked scaleNote")
                .addClass("marked destination")
                .html(name)
        }

        // mark chord notes
        chord.map(i => config.chord.halfstepMap[i]).forEach((halfsteps, index) => {
            const k = config.note.root + halfsteps;
            if (k < (config.display.notesPerRow) ** 2) {
                if (k == config.note.root) {
                    // write scale or chord name at root
                    if (config.scale.toggle && config.scale.possibilities.length > 0) {
                        name = `${config.note.names[config.note.indices[k]] + "\n" + config.scale.functionMap[config.scale.possibilities[config.scale.currentPossibility]]}`;
                    } else {
                        name = `${config.note.names[config.note.indices[k]] + "\n" + config.chord.optionMap[config.chord.current]}`;
                    }
                } else {
                    // write chord function of non-root notes
                    name = `${config.note.names[config.note.indices[k]] + "\n" + config.note.intervals[chord[index]]}`;
                }
                $("#noteBin div").eq(k)
                    .removeClass("marked scaleNote destination")
                    .addClass((k == config.note.root) ? "marked root" : "marked chordNote")
                    .html(name)
            }
        });
    }
}
function scrollThroughChords(event) {
    // deltaY obviously records vertical scroll, deltaX and deltaZ exist too.
    // this condition makes sure it's vertical scrolling that happened
    if (event.originalEvent.deltaY !== 0) {
        if (event.originalEvent.deltaY < 0) {
            config.chord.current += 1;
        }
        else {
            config.chord.current -= 1;
        }
    }
    markChord(true);
}

export { markChord, drawNotes, scrollThroughChords, updateNoteIndices, updateNotes, updateChordPossibilites, updateScalePossibilites, recenterTonnetzByPatternIndex };