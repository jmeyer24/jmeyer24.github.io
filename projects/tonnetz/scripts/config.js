import { isNull } from "mathjs"

import { mod } from "./utilities"

let config = {}

function applyNotesPerRow() {
    const n = config.display.notesPerRow;
    const m = Math.floor(n / 2);

    config.note.center = Math.floor(n ** 2 / 2);
    config.note.root = config.note.center;
    config.note.destination = config.note.center;

    // map the half steps to the tonnetz
    // this is the movement building the right side diamond shape
    config.chord.halfstepMovement = [0, 2 * n + 3, 2, n + 1, -n, -1, 2 * n + 2, 1, -2 * n, 3 * n + 3, n + 2, -n + 1];
    // this is the movement building the brick wall shape
    config.chord.halfstepMovement = [0, n - 1, -n - 2, n + 1, -n, -1, 2 * n + 2, 1, n, -n - 1, n + 2, -n + 1];

    config.display.halfstepMovement = structuredClone(config.chord.halfstepMovement);
    config.display.halfstepMovement[9] = -n - 1;

    config.scale.halfstepMovement = structuredClone(config.display.halfstepMovement);
    config.scale.halfstepMovement[1] = n - 1;
    config.scale.halfstepMovement[6] = -2 * n - 2;
    config.scale.halfstepMovement[8] = n;
    config.scale.halfstepMovement[9] = -n - 1;

    // compute defaultIndices, e.g. which circle represents which note
    // starting from top left with 0, going rowwise
    config.note.defaultIndices =
        Array.from({ length: n }, (_, i) =>
            Array.from({ length: n }, (_, j) =>
                mod(i * (-4) + j * 7, config.note.chromaticSteps)
            )
        ).flat();

    config.note.offsetCenter = mod(m * (-3), config.note.chromaticSteps);
}

function applyNoteOffset() {
    const { chromaticSteps, defaultIndices, offset, root } = config.note;

    // apply the current note offset to the noteIndices
    config.note.indices = defaultIndices.map(
        i => mod(i + offset, chromaticSteps)
    );
    config.note.destinationIndices = defaultIndices.map(
        i => mod(i + offset - config.note.indices[root], chromaticSteps)
    );
}

function buildChordOptions() {
    // config.chord.names = ["root", "b3", "3", "o", "-", "-#5", "maj(b5)", "maj", "+", "o/", "o7", "omaj7", "-add6", "-7", "&#8209 maj7", "-(#5,6)", "o#5", "-#5maj7", "o/maj3", "add6", "7", "maj7", "+,add6", "+7", "+maj7", "o/(b9)", "o/9", "o(b9)", "o9", "omaj7,b9", "omaj7,9", "-(6,b9)", "-(6,9)", "&#8209 7(b9)", "-9", "-maj7,b9", "-maj7,9", "6,b9", "6,9", "7(b9)", "9", "maj7(b9)", "maj9", "+maj7(b9)", "+maj9"];
    // here missing: 5, sus2, sus4

    let options = []
    for (const j of [null, 3, 4]) {
        if (isNull(j)) {
            options.push([0])
            continue;
        }
        for (const k of [6, 7]) {
            if (isNull(k)) {
                options.push([0, j])
                continue;
            }
            for (const m of [null, 10, 11]) {
                if (isNull(m) && [3, 4].includes(k - j)) {
                    options.push([0, j, k])
                    continue;
                }
                if ([3, 4].includes(m - k) && [3, 4].includes(k - j)) {
                    options.push([0, j, k, m])
                }
            }
        }
    }
    options.sort((a, b) => a.length - b.length)

    config.chord.options = {}
    config.chord.names = ["", "-b5", "-", "maj", "\u00F8", "-7", "-\u03947", "7", "\u03947"];
    // config.chord.names = new Array(options.length).fill(0).map((_, i) => `hello${i}`)
    for (let i = 0; i < config.chord.names.length; i++) {
        config.chord.options[config.chord.names[i]] = options[i];
    }
}

function updateChordPossibilities() {
    const {
        note: { destination, destinationIndices },
        chord: { options, possibilities },
    } = config;

    possibilities.length = 0; // leert das config array
    Object.entries(options).forEach(([_, option], index) => {
        let hsFromRoot = destinationIndices[destination];
        if (option.includes(hsFromRoot)) {
            possibilities.push(index);
        }
    });
}

function updateScalePossibilities() {
    /*
    check which scale is a possibility for the current chord
    */
    const {
        chord: { options: options_c, names, current },
        scale: { options: options_s, possibilities },
    } = config;

    const chord = options_c[names[current]];

    possibilities.length = 0; // leert das config array
    Object.entries(options_s).forEach(([_, option], index) => {
        if (chord.every(element => option.includes(element))) {
            possibilities.push(index);
        }
    });
}

function initConfig() {
    config = {
        display: {
            notesPerRow: 9,
            minNotesPerRow: 5,
            maxNotesPerRow: 13,
            indices: [],
            vertices: [],

            // consider a parallelogram of equilateral triangles
            width: 1.5,
            height: Math.sqrt(0.75),

            // in percentage of the window.innerWidth/Height
            padding: 0.11,

            doMarkNotes: true,
            togglePianoKeys: false,
            pianoKeys: [1, 3, 6, 8, 10], // the black keys on the piano

            halfstepMovement: null,

            isScrolling: false,
            scrollingPause: 200,
        },

        note: {
            chromaticSteps: 12, // 12 tone music, western
            names: ["C", "Db/C#", "D", "Eb/D#", "E", "F", "Gb/F#", "G", "Ab/G#", "A", "Bb/A#", "B"],
            intervals: ["1", "b2/b9", "2/9", "b3", "3", "4/11", "b5", "5", "b6/b13", "6/13", "b7", "7"],
            defaultIndices: [],
            indices: [],
            destinationIndices: [],

            center: null,
            root: null,
            destination: null,

            offset: 0,
            offsetCenter: 0,
        },

        chord: {
            options: {},
            names: [],
            possibilities: [],
            current: 0,
            currentPossibility: 0,
            toggle: true,

            halfstepMovement: null,

            updateFunction: null,
        },

        scale: {
            // TODO: make diatonic coloring depending on the current scale option
            options: {
                // church scales, bright to dark, lydian to locrian
                "lydian": [0, 2, 4, 6, 7, 9, 11],
                "ionian": [0, 2, 4, 5, 7, 9, 11],
                "mixolydian": [0, 2, 4, 5, 7, 9, 10],
                "dorian": [0, 2, 3, 5, 7, 9, 10],
                "aeolian": [0, 2, 3, 5, 7, 8, 10],
                "phrygian": [0, 1, 3, 5, 7, 8, 10],
                "locrian": [0, 1, 3, 5, 6, 8, 10],
            },
            names: ["lydian", "ionian", "mixolydian", "dorian", "aeolian", "phrygian", "locrian"],
            namesRoman: ["IV", "I", "V", "ii", "vi", "iii", "vii°"],
            possibilities: [],
            current: 1,
            currentPossibility: 1,
            toggle: false,

            halfstepMovement: null,

            updateFunction: null,
        },

        color: {
            background: getComputedStyle(document.documentElement).getPropertyValue("--color-background").trim(),
            major: getComputedStyle(document.documentElement).getPropertyValue("--color-major").trim(),
            minor: getComputedStyle(document.documentElement).getPropertyValue("--color-minor").trim(),
        },
    }

    buildChordOptions();
    config.applyNotesPerRow = applyNotesPerRow;
    config.applyNoteOffset = applyNoteOffset;
    config.chord.updateFunction = updateChordPossibilities;
    config.scale.updateFunction = updateScalePossibilities;
}

initConfig();
config.applyNotesPerRow();
config.applyNoteOffset();
config.chord.updateFunction();
config.scale.updateFunction();

export { config };