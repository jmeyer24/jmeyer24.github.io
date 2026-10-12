import { isNull } from "mathjs"

const config = {
    display: {
        segments: 8,
        indices: [],
        vertices: [],
        normals: [],

        scaling: 30,
        unknownScaling: 28.75, // TODO: why is that?

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
        options: { // TODO: use symbols
            "root": [0],
            "5": [0, 7],
            "o": [0, 3, 6],
            "-": [0, 3, 7],
            "": [0, 4, 7],
            "+": [0, 4, 8],
            "sus4": [0, 5, 7],
            "sus2": [0, 2, 7],
            "o7": [0, 3, 6, 10],
            "o/": [0, 3, 6, 9],
            "o/maj7": [0, 3, 6, 11],
            "-, add6": [0, 3, 7, 9],
            "-7": [0, 3, 7, 10],
            "&#8209, maj7": [0, 3, 7, 11],
            "add6": [0, 4, 7, 9],
            "7": [0, 4, 7, 10],
            "maj7": [0, 4, 7, 11],
            "+, add6": [0, 4, 8, 9],
            "+7": [0, 4, 8, 10],
            "+maj7": [0, 4, 8, 11],
            "o(b9)": [0, 3, 6, 10, 13],
            "o9": [0, 3, 6, 10, 14],
            "omaj7,b9": [0, 3, 6, 11, 13],
            "omaj7,9": [0, 3, 6, 11, 14],
            "-(6,b9)": [0, 3, 7, 9, 13],
            "-(6,9)": [0, 3, 7, 9, 14],
            "o/(b9)": [0, 3, 6, 9, 13],
            "o/9": [0, 3, 6, 9, 14],
            "&#8209, 7(b9)": [0, 3, 7, 10, 13],
            "-9": [0, 3, 7, 10, 14],
            "-maj7,b9": [0, 3, 7, 11, 13],
            "-maj7,9": [0, 3, 7, 11, 14],
            "6,b9": [0, 4, 7, 9, 13],
            "6,9": [0, 4, 7, 9, 14],
            "7(b9)": [0, 4, 7, 10, 13],
            "9": [0, 4, 7, 10, 14],
            "maj7(b9)": [0, 4, 7, 11, 13],
            "maj9": [0, 4, 7, 11, 14],
            "+maj7(b9)": [0, 4, 8, 11, 13],
            "+maj9": [0, 4, 8, 11, 14],
        },
        names: ["root", "5", "o", "-", "maj", "+", "sus4", "sus2", "o/", "o7", "o/maj7", "-, add6", "-7", "&#8209, maj7", "add6", "7", "maj7", "+, add6", "+7", "+maj7", "o/(b9)", "o/9", "o(b9)", "o9", "omaj7,b9", "omaj7,9", "-(6,b9)", "-(6,9)", "&#8209, 7(b9)", "-9", "-maj7,b9", "-maj7,9", "6,b9", "6,9", "7(b9)", "9", "maj7(b9)", "maj9", "+maj7(b9)", "+maj9"],
        possibilities: [],
        current: 0,
        currentPossibility: 0,
        toggle: true,

        halfstepMap: null,
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
    },

    color: {
        background: getComputedStyle(document.documentElement).getPropertyValue("--color-background").trim(),
        major: getComputedStyle(document.documentElement).getPropertyValue("--color-major").trim(),
        minor: getComputedStyle(document.documentElement).getPropertyValue("--color-minor").trim(),
    },
}

function buildChordOptions() {
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
updateConfig();

export { config, updateConfig };