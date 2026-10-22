import { isNull } from "mathjs"

const config = {
    display: {
        segments: 8,
        indices: [],
        vertices: [],

        // consider a parallelogram of equilateral triangles
        width: 1.5,
        height: Math.sqrt(0.75),
        aspect: null,

        // in percentage of the window.innerWidth/Height
        padding: 0.11,

        togglePianoKeys: false,
        pianoKeys: [1, 3, 6, 8, 10], // the black keys on the piano

        notesPerRow: null,
        halfstepMap: null,
    },

    note: {
        names: ["C", "Db/C#", "D", "Eb/D#", "E", "F", "Gb/F#", "G", "Ab/G#", "A", "Bb/A#", "B"],
        intervals: ["1", "b2/b9", "2/9", "b3", "3", "4/11", "b5/#11", "5", "b6/b13", "6/13", "b7", "maj7"],
        indices: [],
        defaultIndices: [],
        destinationIndices: [],
        offset: 0,
        differentNotes: 12,

        center: null,
        root: null,
        destination: null,
    },

    chord: {
        options: {}, // TODO: use symbols
        names: [],
        possibilities: [],
        current: 0,
        currentPossibility: 0,
        toggle: true,

        halfstepMap: null,

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

            // TODO: add more scales
        },
        names: ["lydian", "ionian", "mixolydian", "dorian", "aeolian", "phrygian", "locrian"],
        namesRoman: ["IV", "I", "V", "ii", "vi", "iii", "vii°"],
        possibilities: [],
        current: 1,
        currentPossibility: 1,
        toggle: false,

        halfstepMap: null,

        updateFunction: null,
    },

    color: {
        background: getComputedStyle(document.documentElement).getPropertyValue("--color-background").trim(),
        major: getComputedStyle(document.documentElement).getPropertyValue("--color-major").trim(),
        minor: getComputedStyle(document.documentElement).getPropertyValue("--color-minor").trim(),
    },
}

function buildChordOptions() {
    config.chord.names = ["root", "b3", "3", "o", "-", "-#5", "maj(b5)", "maj", "+", "o/", "o7", "omaj7", "-add6", "-7", "&#8209 maj7", "-(#5,6)", "o#5", "-#5maj7", "o/maj3", "add6", "7", "maj7", "+,add6", "+7", "+maj7", "o/(b9)", "o/9", "o(b9)", "o9", "omaj7,b9", "omaj7,9", "-(6,b9)", "-(6,9)", "&#8209 7(b9)", "-9", "-maj7,b9", "-maj7,9", "6,b9", "6,9", "7(b9)", "9", "maj7(b9)", "maj9", "+maj7(b9)", "+maj9"];
    // missing: 5,sus2,sus4

    let options = []
    for (const j of [null, 3, 4]) {
        if (isNull(j)) {
            options.push([0])
            continue;
        }
        for (const k of [null, 6, 7, 8]) {
            if (isNull(k)) {
                options.push([0, j])
                continue;
            }
            for (const l of [null, 9, 10, 11]) {
                if (isNull(l)) {
                    options.push([0, j, k])
                    continue;
                }
                for (const m of [null, 13, 14]) {
                    if (isNull(m)) {
                        options.push([0, j, k, l])
                        continue;
                    }
                    options.push([0, j, k, l, m])
                }
            }
        }
    }
    options.sort((a, b) => a.length - b.length)

    config.chord.options = {}
    for (let i = 0; i < config.chord.names.length; i++) {
        config.chord.options[config.chord.names[i]] = options[i];
    }
}

function updateConfig() {
    const n = config.display.segments + 1;

    config.display.notesPerRow = n;
    config.display.aspect = config.display.width / config.display.height;

    config.note.center = Math.floor(n ** 2 / 2);
    config.note.root = config.note.center;
    config.note.destination = config.note.center;

    // map the half steps to the tonnetz
    config.chord.halfstepMap = [0, 2 * n + 3, 2, n + 1, -n, -1, 2 * n + 2, 1, -2 * n, 3 * n + 3, n + 2, -n + 1];

    config.display.halfstepMap = structuredClone(config.chord.halfstepMap);
    config.display.halfstepMap[9] = -n - 1;

    config.scale.halfstepMap = structuredClone(config.display.halfstepMap);
    config.scale.halfstepMap[1] = n - 1;
    config.scale.halfstepMap[6] = -2 * n - 2;
    config.scale.halfstepMap[8] = n;
    config.scale.halfstepMap[9] = -n - 1;

    // config.chord.options = buildChordOptions(config.chord.names)
    buildChordOptions()
}

function updateChordPossibilites() {
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

function updateScalePossibilites() {
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

updateConfig();
updateChordPossibilites();
updateScalePossibilites();
config.chord.updateFunction = updateChordPossibilites;
config.scale.updateFunction = updateScalePossibilites;

export { config, updateConfig };