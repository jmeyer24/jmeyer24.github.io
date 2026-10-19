import projects from "@/projects.js";

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

    // update the navigation title
    $("nav #current-site").html(nav_current_page);

    // write the content in the main element
    $("main").load(`/pages/${current_page}.html`, function (_, status, xhr) {
        // add the footer to the welcome page
        $("body")[current_page == "welcome" ? "addClass" : "removeClass"]("show-footer");
        if (current_page == "projects") {
            // fill the projects page with imaged links
            Object.entries(projects).forEach(([key, value]) => {
                const imgUrl = new URL(`/public/images/${key}.jpg`, import.meta.url).href;
                $("#project-list").append(`
                    <div class="w-full max-w-xs mx-auto">
                        <a href="/#project#${key}" class="relative">
                            <img 
                                src="${imgUrl}" 
                                onerror="this.onerror=null; this.src='/images/ball_800x800.png';" 
                                class="rounded-image object-cover object-top-left" 
                            />
                            <div class="absolute size-full top-1/2 left-1/2 -translate-1/2 rounded-(--border-radius) flex items-center justify-center text-center text-shadow-[-1px_1px_2px_var(--color-high),1px_1px_1px_var(--color-bg)] bg-(--color-high) opacity-0 duration-(--transition-time) ease-in-out hover:opacity-90">
                                ${value}
                            </div>
                        </a>
                    </div>
                `);
            });
        }

        if (status == "error") {
            console.warn(`"${current_page}.html" could not be loaded properly. HTTP-status: ${xhr.status}`);
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