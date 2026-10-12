function initMenu() {
    // const whatisthis = 31.8;

    // $("#menu").remove();

    // TODO: markChord(i) after menu selection
    // $("body").append(
    //   $("<div>")
    //     .attr("id", "menu")
    //     .addClass("menu")
    //     .css('--left', `${window.innerWidth / 2 + pos(v.note.root)[0] * whatisthis}px`)
    //     .css('--top', `${window.innerHeight / 2 - pos(v.note.root)[1] * whatisthis}px`)
    //     // .css('--menuWidth', `${v.noteSize+1}em`)
    //     // .css('--menuHeight', `${v.noteSize+1}em`)
    // );

    // TODO: establish links and respective chords (use markChord() again)
    // ["major third", "minor third"].forEach((element) => {
    // // v.chord.options.forEach((element) => {
    //   // TODO: add respective function for updating noteFunctions on click
    //   $("#menu").append($("<div>").addClass("menuPart").text(element))
    // });

    // $("#menu")
    //   // add the note.root note as extra note
    //   .append(
    //     $("<div>")
    //       .addClass("menuNote")
    //       .css('--width', `${v.noteSize+1}em`)
    //       .css('--height', `${v.noteSize+1}em`)
    //       // write the note name: update it every click
    //       .append(document.createTextNode(v.notes[v.noteIndices[v.note.root]]))
    //   )
    //   // shrink the menu on mouse click and on mouse leave
    //   .click(() => {
    //     markChord(v.note.root)
    //   })
}

export { initMenu };