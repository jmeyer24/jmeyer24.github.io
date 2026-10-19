import projects from "/pages/projects.html?url";

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
    let current_page = window.location.hash.split("#").filter(Boolean);
    let nav_current_page = "";
    if (current_page.includes("project")) {
        const project = window.location.hash.split("#").slice(-1)[0];
        nav_current_page = projects[project];
        current_page = "project";
    } else {
        nav_current_page = current_page.slice(-1)[0];
        current_page = current_page.join("/");
    }
    // write the content in the main element
    $("main").load(`/pages/${current_page}.html`, function (_, status, xhr) {
        $("body")[current_page == "welcome" ? "addClass" : "removeClass"]("show-footer");
        if (status == "error") {
            console.warn(`"${current_page}.html" could not be loaded properly. HTTP-status: ${xhr.status}`);
            $("main").load("/structure/404.html");
        }
    });
    // update the navigation title
    $("nav #current-site").html(nav_current_page);
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

export default projects;