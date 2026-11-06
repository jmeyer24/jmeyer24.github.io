import projects from "@/projects.json";

// load the navigation bar and the footer bar
$("footer").load("/structure/footer.html")
await fetch("/structure/nav.html")
    .then(response => response.text())
    .then((data) => {
        $("nav").html(data)
    });

// load and write the main content
function writeContent() {
    // redirect to welcome page if on root
    if (window.location.hash == "") {
        window.location.hash = "welcome";
    }
    // get the page name/path
    let currentPage = window.location.hash.split("#").filter(Boolean);
    let navCurrentPage = "";
    if (currentPage.includes("project")) {
        const project = window.location.hash.split("#").slice(-1)[0];
        navCurrentPage = projects[project];
        currentPage = "project";
    } else {
        navCurrentPage = currentPage.slice(-1)[0];
        currentPage = currentPage.join("/");
    }

    // update the navigation title
    $("nav #current-site").html(navCurrentPage);

    // write the content in the main element
    const baseUrl = import.meta.env.BASE_URL;
    const url = `${baseUrl}pages/${currentPage}.html`;
    $("body").removeClass("show-footer");
    $("main").load(url, function (response, status, xhr) {
        // add the footer to the welcome page
        switch (currentPage) {
            case "welcome":
                $("body").addClass("show-footer");
                break;
            case "projects":
                // fill the projects page with imaged links
                const imgDefault = `${baseUrl}images/ball_800x800.png`;
                projects.forEach(project => {
                    const imgUrl = `${baseUrl}images/${project.folder}.${project.img_ext}`;
                    $("#project-list").append(`
                        <div class="w-full max-w-xs mx-auto">
                            <a href="${baseUrl}#project#${project.folder}" class="relative">
                                <img 
                                    src="${imgUrl}" 
                                    onerror="this.onerror=null; this.src='${imgDefault}';" 
                                    class="rounded-image object-cover object-top-left" 
                                />
                                <div class="absolute size-full top-1/2 left-1/2 -translate-1/2 rounded-(--border-radius) flex items-center justify-center text-center text-shadow-[-1px_1px_2px_var(--color-high),1px_1px_1px_var(--color-bg)] bg-(--color-high) opacity-0 duration-(--transition-time) ease-in-out hover:opacity-90">
                                    ${project.name}
                                </div>
                            </a>
                        </div>
                    `);
                });
                break;
            case "project":
                const project = window.location.hash.split("#").slice(-1)[0];
                const project_url = `${baseUrl}projects/${project}/index.html`;

                // 1. Vorab prüfen, ob die Datei wirklich existiert
                fetch(project_url)
                    .then(response => {
                        if (!response.ok) {
                            // Wenn der Server einen Fehler (z.B. 404) zurückgibt, werfen wir ihn in den catch-Block
                            throw new Error(`HTTP status: ${response.status}`);
                        }

                        // 2. Datei existiert! Jetzt dem iFrame die Quelle zuweisen
                        $("#my-iframe")
                            .attr("src", project_url)
                            .off("load") // Alte Event-Listener entfernen
                            .on("load", function () {
                                $(this).focus();
                            });
                    })
                    .catch(error => {
                        console.warn(`"${currentPage}.html" could not be loaded properly. ${error.message}`);
                        $("main").load(`${baseUrl}structure/404.html`);
                    });
                break;
            default:
                break;
        }

        if (status == "error") {
            console.warn(`"${currentPage}.html" could not be loaded properly. HTTP-status: ${xhr.status}`);
            $("main").load("/structure/404.html");
        }
    });
}

// update content when hash changes
// e.g. due to document load or nav link clicks
$(document).ready(writeContent);
$(window).on("hashchange", writeContent);

// TODO: on menu-button, toggle menu
$("#menu-button").on("click", function () {
    // $(".menu").toggleClass("is-open");
    $("main").load("/structure/404.html");
});

// on keydown, simulate a button click
// tab: menu-button
$(document).on("keydown", function (event) {
    switch (event.which) {
        case 9: // tab key
            event.preventDefault();
            $("#menu-button").trigger("click");
            break;
        default:
            break;
    }
});