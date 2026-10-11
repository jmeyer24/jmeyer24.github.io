import * as THREE from "three";

// MOVEMENT FOR THE USER

// =============== movement ======================
// CLICK: choose this note as chord root
// ARROWS: move root in the arrow direction
// -----------------------------------------------
// +SHIFT: instead click/move destination note
// +CTRL: instead move tonnetz in respect to chord
// -----------------------------------------------

// =============== coloring ======================
// MOUSESCROLL: change chord color (maj7, -7, ...)
// SPACEBAR: toggle coloring

// =============== destination note ==============
// C/V: iterate through chords with destination note as interval note, upward/downward
// ENTER: center tonnetz on the root note
// +SHIFT: instead center on the destination note
// +CTRL: instead move destination note to root

let v = new function () {
    this.size = 27;
    this.segments = 8;
    this.noteSize = 1.5;
    this.vertices = [];
    this.normals = [];
    this.indices = [];
    this.majorColor = Array(3).fill([0.9, 0.3, 0]).flat();
    this.minorColor = Array(3).fill([0, 0.4, 0.8]).flat();
    this.standardColor = "#ddd";
    this.noteBin = document.createElement("div");
    this.defaultNoteIndices = [];
    this.noteIndices = [];
    this.destinationNoteIndices = [];
    this.offset = 0;
    this.notes = [
        "C",
        "Db/C#",
        "D",
        "Eb/D#",
        "E",
        "F",
        "Gb/F#",
        "G",
        "Ab/G#",
        "A",
        "Bb/A#",
        "B",
    ]
    // TODO: use symbols
    this.chordOptions = ["o", "-", "", "+", "o7", "o/7", "o/maj7", "-7", "&#8209;maj7", "7", "maj7", "+7", "+maj7", "o7(b9)", "o9", "o/7(b9)", "o/9", "&#8209;7(b9)", "-9", "7(b9)", "9", "maj7(b9)", "maj9", "+maj7(b9)", "+maj9", "sus4", "root", "5"];
    this.scaleOptions = [
        // chruch scales, bright to dark, lydian to locrian
        [0, 2, 4, 6, 7, 9, 11], // lydian
        [0, 2, 4, 5, 7, 9, 11], // ionian
        [0, 2, 4, 5, 7, 9, 10], // mixolydian
        [0, 2, 3, 5, 7, 9, 10], // dorian
        [0, 2, 3, 5, 7, 8, 10], // aeolien
        [0, 1, 3, 5, 7, 8, 10], // phrygian
        [0, 1, 3, 5, 6, 8, 10], // locrian

        // TODO: add more scales
    ];
    this.scaleToScaleFunctionMap = ["IV", "I", "V", "ii", "vi", "iii", "vii°"]
    this.scaleToScaleNamenMap = ["lydian", "ionian", "mixolydian", "dorian", "aeolian", "phrygian", "locrian"]
    this.chordPossibilities = [];
    this.scalePossibilities = [];
    this.intervals = ["1", "b2/b9", "2/9", "b3", "3", "4/11", "b5/#11", "5", "b6/b13", "6/13", "b7", "maj7"];
    this.chordFunctions = [0]; // root = 0, fifth = 7, ...
    this.diatonics = [0, 2, 4, 5, 7, 9, 11, 12];
    this.scaling = [0, 1, 1.25, 1.5, 2]
    // this.speed = ["0s", "0.7s"]
    this.rootNote = Math.floor((this.segments + 1) ** 2 / 2);
    this.destinationNote = this.rootNote;
    // this.currentChord = Math.floor(13 * Math.random());
    this.currentChord = 2;
    this.currentChordPossibility = 0;
    this.currentScale = 0;
    this.currentScalePossibility = 0;
    this.toggleChord = true;
    this.toggleScale = false;
}

const notesPerRow = v.segments + 1;
// map the half steps to the tonnetz
// const hsTonnetzMap = [0, -2 * notesPerRow - 1, 2, notesPerRow + 1, -notesPerRow, -1, -notesPerRow + 2, 1, notesPerRow, -notesPerRow - 1, notesPerRow + 2, -notesPerRow + 1];
const hsTonnetzMap = [0, 2 * (notesPerRow + 1.5), 2, notesPerRow + 1, -notesPerRow, -1, 2 * (notesPerRow + 1), 1, -2 * notesPerRow, 3 * (notesPerRow + 1), notesPerRow + 2, -notesPerRow + 1];
const arrowMovementMap = [0, 2 * (notesPerRow + 1.5), 2, notesPerRow + 1, -notesPerRow, -1, 2 * (notesPerRow + 1), 1, -2 * notesPerRow, -(notesPerRow + 1), notesPerRow + 2, -notesPerRow + 1];
const scaleMap = [0, notesPerRow - 1, 2, notesPerRow + 1, -notesPerRow, -1, -2 * (notesPerRow + 1), 1, notesPerRow, -(notesPerRow + 1), notesPerRow + 2, -notesPerRow + 1];

// fill the v.chordFunctions array with the half steps from root for the respective chord
const fillChordFunctions = chord => {
    v.chordFunctions = [0];

    switch (chord) {
        // triads
        case v.chordOptions[0]:
            minor3();
            tritonus();
            break;
        case v.chordOptions[1]:
            minor3();
            perfect5();
            break;
        case v.chordOptions[2]:
            major3();
            perfect5();
            break;
        case v.chordOptions[3]:
            major3();
            minor6();
            break;

        // seventh chords
        case v.chordOptions[4]:
            minor3();
            tritonus();
            major6();
            break;
        case v.chordOptions[5]:
            minor3();
            tritonus();
            minor7();
            break;
        case v.chordOptions[6]:
            minor3();
            tritonus();
            major7();
            break;
        case v.chordOptions[7]:
            minor3();
            perfect5();
            minor7();
            break;
        case v.chordOptions[8]:
            minor3();
            perfect5();
            major7();
            break;
        case v.chordOptions[9]:
            major3();
            perfect5();
            minor7();
            break;
        case v.chordOptions[10]:
            major3();
            perfect5();
            major7();
            break;
        case v.chordOptions[11]:
            major3();
            minor6();
            minor7();
            break;
        case v.chordOptions[12]:
            major3();
            minor6();
            major7();
            break;

        // seventh chords with coloring
        // fully-diminished
        case v.chordOptions[13]:
            minor3();
            tritonus();
            major6();
            minor2();
            break;
        case v.chordOptions[14]:
            minor3();
            tritonus();
            major6();
            major2();
            break;
        case v.chordOptions[15]:
            minor3();
            tritonus();
            minor7();
            minor2();
            break;
        case v.chordOptions[16]:
            minor3();
            tritonus();
            minor7();
            major2();
            break;
        case v.chordOptions[17]:
            minor3();
            perfect5();
            minor7();
            minor2();
            break;
        case v.chordOptions[18]:
            minor3();
            perfect5();
            minor7();
            major2();
            break;
        case v.chordOptions[19]:
            major3();
            perfect5();
            minor7();
            minor2();
            break;
        case v.chordOptions[20]:
            major3();
            perfect5();
            minor7();
            major2();
            break;
        case v.chordOptions[21]:
            major3();
            perfect5();
            major7();
            minor2();
            break;
        case v.chordOptions[22]:
            major3();
            perfect5();
            major7();
            major2();
            break;
        case v.chordOptions[23]:
            major3();
            minor6();
            major7();
            minor2();
            break;
        case v.chordOptions[24]:
            major3();
            minor6();
            major7();
            major2();
            break;

        // chords with 4
        case v.chordOptions[25]:
            perfect4();
            perfect5();
            break;

        // only root or with fifth
        case v.chordOptions[26]:
            break;
        case v.chordOptions[27]:
            perfect5();
            break;

        // just the root otherwise
        default:
            break;
    }
}

// chord functions
const minor2 = () => v.chordFunctions.push(1);
const major2 = () => v.chordFunctions.push(2);
const minor3 = () => v.chordFunctions.push(3);
const major3 = () => v.chordFunctions.push(4);
const perfect4 = () => v.chordFunctions.push(5);
const tritonus = () => v.chordFunctions.push(6);
const perfect5 = () => v.chordFunctions.push(7);
const minor6 = () => v.chordFunctions.push(8);
const major6 = () => v.chordFunctions.push(9);
const minor7 = () => v.chordFunctions.push(10);
const major7 = () => v.chordFunctions.push(11);

// utility functions
const mod = (value, n) => ((((value) % n) + n) % n);
const pos = (i) => [i * 3, i * 3 + 1].map((i) => v.vertices[i]);
const col = (i) => isDiatonic(i) ? "#000" : "#fff";
const isDiatonic = (i) => v.diatonics.includes(i);
const backgroundCol = (i) => isDiatonic(i) ? "#fff" : "#000";
const clickCol = (i) => isDiatonic(i) ? "#5a4" : "#5a4";

function updateChordPossibilites() {
    v.chordPossibilities = [];
    v.chordOptions.forEach(function (option, index) {
        fillChordFunctions(option);
        let hsFromRoot = v.destinationNoteIndices[v.destinationNote];
        if (v.chordFunctions.includes(hsFromRoot)) {
            v.chordPossibilities.push(index);
        }
    })
}

function updateScalePossibilites() {
    /*
    check which scale is a possibility for the current chord
    */
    v.scalePossibilities = [];
    v.scaleOptions.forEach(function (option, index) {
        if (v.chordFunctions.every(element => option.includes(element))) {
            v.scalePossibilities.push(index);
        }
    })
}

// main variables
let camera, scene, renderer;
let mesh;

initScene();
initTonnetz();
drawTonnetz();
drawNotes();
initMenu();
initGui();
animate();

function initScene() {
    //

    camera = new THREE.PerspectiveCamera(
        27,
        window.innerWidth / window.innerHeight,
        1,
        3500
    );
    camera.position.z = 64;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(v.standardColor);

    //

    const light = new THREE.HemisphereLight();
    scene.add(light);

    //

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    $(window).on("resize", onWindowResize);
    $(window).on('wheel', function (event) {
        // deltaY obviously records vertical scroll, deltaX and deltaZ exist too.
        // this condition makes sure it's vertical scrolling that happened
        if (event.originalEvent.deltaY !== 0) {
            if (event.originalEvent.deltaY < 0) {
                v.currentChord += 1;
            }
            else {
                v.currentChord -= 1;
            }
        }
        markChord(true);
    });
    $(window).keydown(function (event) {
        // console.log(event.which);
        switch (event.which) {
            case 13: // enter: focus on destination Note
                keydownEnter();
                break;
            case 32: // space bar: toggle everything off, chord on only
                markChord()
                // toggle scale off, but not on with space
                v.toggleScale = v.toggleScale ? !v.toggleScale : v.toggleScale;
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
                v.toggleScale = false;
                keydownPossibilities(1);
                break;
            case 86: // on "v": iterate through possibilities downward
                v.toggleScale = false;
                keydownPossibilities(-1);
                break;
            case 68: // on "d": iterate through scales upward
                v.toggleScale = true;
                keydownScales(1);
                break;
            case 70: // on "f": iterate through scales downward
                v.toggleScale = true;
                keydownScales(-1);
                break;
            case 83: // on "s": toggle scale only
                keydownScales(0);
                v.toggleScale = !v.toggleScale;
                markChord(true)
                break;
            case 88: // on "x": toggle chord only
                v.toggleChord = !v.toggleChord;
                markChord(true)
                break;
            default:
                return;
        }

        function keydownEnter() {
            // see start of file
            if (event.ctrlKey) {

            } else if (event.shiftKey) {
                recenterTonnetzByPatternIndex(v.destinationNote);
            } else {
                recenterTonnetzByPatternIndex(v.rootNote);
            }
            v.destinationNote = v.rootNote;
            markChord(true);
        }

        function keydownArrow(halfsteps) {
            // see start of file

            if (event.shiftKey) {
                // mark destination note, then ctrl key event
                $(`#noteBin div:nth-child(${v.destinationNote + 1})`).removeClass("destination");
                v.destinationNote += arrowMovementMap[halfsteps];
                v.destinationNote = mod(v.destinationNote, v.noteIndices.length);
                $(`#noteBin div:nth-child(${v.destinationNote + 1})`).addClass("destination");
            } else if (event.ctrlKey) {
                v.offset = v.noteIndices[v.rootNote] + halfsteps;
                updateNotePattern();
            } else {
                let save = v.destinationNote == v.rootNote
                v.rootNote += arrowMovementMap[halfsteps];
                v.rootNote = mod(v.rootNote, (v.segments + 1) ** 2);
                if (save) {
                    v.destinationNote = v.rootNote;
                }
                updateNoteIndices();
            }
            markChord(true);
        }

        function keydownPossibilities(value) {
            updateChordPossibilites();
            v.currentChordPossibility = mod((v.currentChordPossibility + value), v.chordPossibilities.length);
            v.currentChord = v.chordPossibilities[v.currentChordPossibility];
            markChord(true);
        }

        function keydownScales(value) {
            updateScalePossibilites();
            if (v.scalePossibilities.length > 0) {
                v.currentScalePossibility = mod((v.currentScalePossibility + value), v.scalePossibilities.length);
                v.currentScale = v.scalePossibilities[v.currentScalePossibility];
            }
            markChord(true);
        }
    })
}

//

function initTonnetz() {
    // generate vertices and normals for a simple grid geometry
    v.vertices = [];
    v.normals = [];
    v.indices = [];

    for (let i = 0; i <= v.segments; i++) {
        // const y = v.size * (i / v.segments - 1 / 2);
        const y = v.size * (i / v.segments - 1 / 2) * Math.sqrt(0.75);

        for (let j = 0; j <= v.segments; j++) {
            const x = v.size * ((j - i / 2) / v.segments - 1 / 4);

            v.vertices.push(x, -y, 0);
            v.normals.push(0, 0, 1);
        }
    }

    // generate indices (data for element array buffer)
    for (let i = 0; i < v.segments; i++) {
        for (let j = 0; j < v.segments; j++) {
            const a = i * (notesPerRow) + (j + 1);
            const b = i * (notesPerRow) + j;
            const c = (i + 1) * (notesPerRow) + j;
            const d = (i + 1) * (notesPerRow) + (j + 1);

            // generate two faces (triangles) per iteration
            v.indices.push(a, b, d); // face one
            v.indices.push(b, c, d); // face two
        }
    }

    calculateNoteIndices();
    updateNoteIndices();
}

function calculateNoteIndices() {
    // compute nodeIndices, e.g. which circle represents which note
    const n = v.notes.length;
    v.defaultNoteIndices = [0];
    for (let i = 1; i < (notesPerRow) ** 2; i++) {
        v.defaultNoteIndices.push(
            // when we are at a new row in the tonnetz
            // compute the new start of the row
            // else go to the fifth (7 halfsteps)
            (!(i % (notesPerRow))
                ? (i / (notesPerRow)) * 8
                : v.defaultNoteIndices[i - 1] + 7) % n
        );
    }
}

//

function recenterTonnetzByPatternIndex(index) {
    v.offset = v.noteIndices[index];
    v.rootNote = 40;
    // v.destinationNote = 40;
    updateNotePattern();
}

function updateNotePattern() {
    updateNoteIndices();
    drawNotes();
    initMenu();
}

function updateNoteIndices() {
    // reorder by offset!
    const n = v.notes.length;
    v.noteIndices = v.defaultNoteIndices.map(value => mod(value + v.offset, v.notes.length));
    v.destinationNoteIndices = v.defaultNoteIndices.map(value => mod(value + v.offset - v.noteIndices[v.rootNote], v.notes.length));
}

//

function drawTonnetz() {
    // draw the plane
    for (let i = 0; i < 2 * v.segments ** 2; i++) {
        let ind = v.indices.slice(i * 3, (i + 1) * 3);

        const geometry = new THREE.BufferGeometry();
        geometry.setIndex([0, 1, 2]);
        geometry.setAttribute("position",
            new THREE.Float32BufferAttribute(ind.map((i) => [i * 3, i * 3 + 1, i * 3 + 2].map((j) => v.vertices[j])).flat(), 3)
        );
        geometry.setAttribute("normal",
            new THREE.Float32BufferAttribute(ind.map((i) => [i * 3, i * 3 + 1, i * 3 + 2].map((j) => v.normals[j])).flat(), 3)
        );
        geometry.setAttribute("color",
            new THREE.Float32BufferAttribute(i % 2 ? v.majorColor : v.minorColor, 3)
        );

        const material = new THREE.MeshBasicMaterial({
            vertexColors: true,
        });

        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    }

}

function drawNotes() {
    // create div for the noteBin
    $("#noteBin").remove()
    $("body").append($("<div>").attr("id", "noteBin").addClass("noteBin"))

    // create the notes on the tonnetz
    for (let i = 0; i < (notesPerRow) ** 2; i++) {
        const noteInd = v.noteIndices[i]

        // TODO: resolve this issue
        const whatisthis = 31.8;

        // add a note to the noteBin
        $("#noteBin").append(
            $("<div>")
                // make it of class note
                .addClass("note")
                // style the note according to diatonic or not
                .css('--color', col(noteInd))
                .css('--background-color', backgroundCol(noteInd))
                .css('--left', `${window.innerWidth / 2 + pos(i)[0] * whatisthis}px`)
                .css('--top', `${window.innerHeight / 2 - pos(i)[1] * whatisthis}px`)
                .css('--width', `${v.noteSize}em`)
                .css('--height', `${v.noteSize}em`)
                // mouseclick events: center menu on clicked note and color chord
                .click((event) => {
                    if (event.shiftKey) {
                        // center the destination note on the clicked note when shift+mouseclick
                        v.destinationNote = i;
                        markChord(true);
                    } else if (event.ctrlKey) {
                        // center the tonnetz on the clicked note when strg+mouseclick
                        recenterTonnetzByPatternIndex(i);
                        markChord(true);
                    } else {
                        // center the chord on the clicked note
                        v.rootNote = i;
                        markChord();
                    }
                }
                )
                // add the note name
                .append(document.createTextNode(v.notes[noteInd]))
        );
    }
}

function markChord(disableToggle = false) {
    // TODO: restrictions to the tonnetz, as indices go out of bounds

    // make sure currentChord is valid
    v.currentChord = mod(v.currentChord, v.chordOptions.length);

    // get the array of halfsteps from the root
    fillChordFunctions(v.chordOptions[v.currentChord]);

    // remove all previous coloring
    let isRoot = $(`#noteBin div:nth-child(${v.rootNote + 1})`).hasClass("root");
    $("#noteBin").children().each(function (index) {
        $(this)
            .removeClass("root")
            .removeClass("chordNote")
            .removeClass("destination")
            .removeClass("scaleNote")
            .html(`${v.notes[v.noteIndices[index]]}`)
    })

    if (disableToggle) {
        isRoot = false;
    }

    // color the current chord by adding a class to respective notes
    // only if not already colored, then don't color (toggle)
    if (!isRoot) {
        let name = "";

        // mark scale notes
        if (v.toggleScale) {
            if (v.scalePossibilities.length > 0) {
                let scale = v.scaleOptions[v.currentScale];
                if (scale) {
                    let newScale = scale.map(element => { return mod(element + v.noteIndices[v.rootNote], v.notes.length) })
                    v.noteIndices.forEach((element, index) => {
                        if (newScale.includes(element)) {
                            $(`#noteBin div:nth-child(${index + 1})`)
                                .addClass("scaleNote")
                                .addClass("extra")
                        }
                    })
                    scale.forEach(halfsteps => {
                        $(`#noteBin div:nth-child(${v.rootNote + scaleMap[halfsteps] + 1})`)
                            .removeClass("extra")
                    })
                }
            }
        }

        // mark destination note
        if (v.destinationNote != v.rootNote) {
            name = `${v.notes[v.noteIndices[v.destinationNote]] + "\n" + v.intervals[v.destinationNoteIndices[v.destinationNote]]}`;
            $(`#noteBin div:nth-child(${v.destinationNote + 1})`)
                .removeClass("scaleNote")
                .addClass("destination")
                .html(name)
        }

        // mark chord notes
        v.chordFunctions.map(i => hsTonnetzMap[i]).forEach((halfsteps, index) => {
            k = v.rootNote + halfsteps;
            if (k < (notesPerRow) ** 2) {
                if (k == v.rootNote) {
                    // write scale or chord name at root
                    if (v.toggleScale && v.scalePossibilities.length > 0) {
                        name = `${v.notes[v.noteIndices[k]] + "\n" + v.scaleToScaleFunctionMap[v.scalePossibilities[v.currentScalePossibility]]}`;
                    } else {
                        name = `${v.notes[v.noteIndices[k]] + "\n" + v.chordOptions[v.currentChord]}`;
                    }
                } else {
                    // write chord function of non-root notes
                    name = `${v.notes[v.noteIndices[k]] + "\n" + v.intervals[v.chordFunctions[index]]}`;
                }
                $(`#noteBin div:nth-child(${k + 1})`)
                    .removeClass("scaleNote")
                    .removeClass("destination")
                    .addClass((k == v.rootNote) ? "root" : "chordNote")
                    .html(name)
            }
        });
    }
}

//

function initMenu() {
    // const whatisthis = 31.8;

    // $("#menu").remove();

    // TODO: markChord(i) after menu selection
    // $("body").append(
    //   $("<div>")
    //     .attr("id", "menu")
    //     .addClass("menu")
    //     .css('--left', `${window.innerWidth / 2 + pos(v.rootNote)[0] * whatisthis}px`)
    //     .css('--top', `${window.innerHeight / 2 - pos(v.rootNote)[1] * whatisthis}px`)
    //     // .css('--menuWidth', `${v.noteSize+1}em`)
    //     // .css('--menuHeight', `${v.noteSize+1}em`)
    // );

    // TODO: establish links and respective chords (use markChord() again)
    // ["major third", "minor third"].forEach((element) => {
    // // v.chordOptions.forEach((element) => {
    //   // TODO: add respective function for updating noteFunctions on click
    //   $("#menu").append($("<div>").addClass("menuPart").text(element))
    // });

    // $("#menu")
    //   // add the rootNote note as extra note
    //   .append(
    //     $("<div>")
    //       .addClass("menuNote")
    //       .css('--width', `${v.noteSize+1}em`)
    //       .css('--height', `${v.noteSize+1}em`)
    //       // write the note name: update it every click
    //       .append(document.createTextNode(v.notes[v.noteIndices[v.rootNote]]))
    //   )
    //   // shrink the menu on mouse click and on mouse leave
    //   .click(() => {
    //     markChord(v.rootNote)
    //   })
}

//

function initGui() {
    const gui = new dat.gui.GUI();

    gui.add(v, "offset", 0, 11, 1).name("Tonnetz Center").onFinishChange(updateNotePattern);
    // gui.add(v, "size", 10, 28, 1).name("Scale Plane").onFinishChange(drawTonnetz);
    // gui.add(v, "segments", 4, 15, 1).name("Tesselation").onChange(drawTonnetz);
}

//

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    drawNotes();
    initMenu();
}

//

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    const time = Date.now() * 0.001;
    renderer.render(scene, camera);
}