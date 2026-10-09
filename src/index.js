import { createImageLinks } from "./project_list";

// on sidebar-button, toggle sidebar-wrapper
$("#sidebar-button").on("click", function () {
    $(".sidebar").toggleClass("is-closed");
    $(".content").toggleClass("is-wide");
});

// on keydown, simulate a button click
// tab: sidebar-button
// "t": text-button
$(document.documentElement).on("keydown", function (event) {
    switch (event.which) {
        case 9: // tab key
            event.preventDefault();
            $("#sidebar-button").trigger("click");
            break;
        case 84: // "t" key
            $("#text-button").trigger("click");
            break;
        default:
            break;
    }
});

// create the navigation bar and the footer bar
await fetch("/structure/nav.html")
    .then(response => response.text())
    .then((data) => {
        $("nav").html(data)
    });

$("footer").load("/structure/footer.html")

$(document).ready(function () {
    // Check if the user was redirected here via our 404 page
    const urlParams = new URLSearchParams(window.location.search);
    const redirectPath = urlParams.get('p');

    let current_site = "welcome";

    if (redirectPath) {
        // Extract the page name (e.g., "/music" becomes "music")
        let cleanedPath = redirectPath.split('/').filter(Boolean)[0];
        if (cleanedPath) {
            current_site = cleanedPath;
        }

        // Dynamic UI cleanup: Changes "?p=/music" back to "/music" in the browser's address bar
        // This keeps the URL looking completely flat and professional!
        window.history.replaceState(null, null, redirectPath);
    } else {
        // Fallback for when someone just visits the root "github.io/" directly
        let pathName = window.location.pathname.split('/').filter(Boolean)[0];
        if (pathName) {
            current_site = pathName;
        }
    }

    // Update your nav display
    $("nav #current-site").html(current_site);

    // Load the matching file from your custom directory structure
    $("main").load(`./pages/${current_site}.html`, function (response, status, xhr) {
        if (status == "error") {
            console.warn(`"${current_site}.html" could not be loaded properly. HTTP-status: ${xhr.status}`);
            $("main").load("./structure/404.html");
        }
    });

    // // write the content in the main element
    // let current_site = window.location.pathname.split('/').filter(Boolean)[0]
    // current_site = current_site ? current_site : "welcome";
    // $("nav #current-site").html(current_site);

    // $("main").load(`/pages/${current_site}.html`, function (response, status, xhr) {
    //     if (status == "error") {
    //         console.warn(`"${current_site}.html" could not be loaded properly. HTTP-status: ${xhr.status}`);
    //         $("main").load("/structure/404.html");
    //     }
    // });
});


// // create the sidebar image links
// $(function () { createImageLinks() });
// $(function () { createImageLinks() });
// $(function () { createImageLinks() });
// $(function () { createImageLinks() });
// $(function () { createImageLinks() });
// $(function () { createImageLinks() });