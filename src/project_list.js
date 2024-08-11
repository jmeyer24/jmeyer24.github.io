var projects = {
    "Tonnetz": "Eulersches Tonnetz",
    "SuperAwesomeFractalExplorer": "Fractal Explorer",
    "MalazanKnowledgeGraph": "Malazan Graph"
};

function createImageLinks() {
    // fill the projects div with imaged links
    var el = $("#project-list");
    Object.entries(projects).forEach(([key, value]) => {
        el
            .append($("<li/>")
                .append($("<a/>")
                    .addClass("project-link")
                    .attr("href", `https://jmeyer24.github.io/${key}`)
                    .append($("<img/>")
                        .addClass("project-image")
                        .attr("src", `/image_${key}.jpg`)
                        .attr("alt", value)
                    )
                    // .append($("<div/>")
                    //     .addClass("project-image-title")
                    //     .append(value)
                    // )
                )
            )
    })
}

$(function () { createImageLinks() });
$(function () { createImageLinks() });
$(function () { createImageLinks() });
$(function () { createImageLinks() });