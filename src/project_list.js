var projects = {
    "Tonnetz": "Eulersches Tonnetz",
    "SuperAwesomeFractalExplorer": "Fractal Explorer",
    "MalazanKnowledgeGraph": "Malazan Graph"
};

function createImageLinks() {
    // fill the projects div with imaged links
    var el = $("#projects");
    Object.entries(projects).forEach(([key, value]) => {
        el
            .append($("<a/>")
                .addClass("projectLink")
                .attr("href", `https://jmeyer24.github.io/${key}`)
                .append($("<img/>")
                    .addClass("projectImage")
                    .attr("src", `/image_${key}.jpg`)
                    .attr("alt", value)
                )
                .append($("<div/>")
                    .addClass("title")
                    .append(value)
                )
            )
    })
}

$(function () { createImageLinks() });
$(function () { createImageLinks() });
$(function () { createImageLinks() });
$(function () { createImageLinks() });