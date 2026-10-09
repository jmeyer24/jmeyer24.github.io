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
await fetch("/pages/nav.html")
    .then(response => response.text())
    .then((data) => {
        $("nav").html(data)
    });

$("footer").load("/pages/footer.html")

// write the content in the main element
let current_site = window.location.pathname.split('/').filter(Boolean)[0]
current_site = current_site ? current_site : "welcome";
$("nav #current-site").html(current_site);

$("main").load(`/pages/${current_site}.html`, function (response, status, xhr) {
    if (status == "error") {
        console.warn(`"${current_site}.html" could not be loaded properly. HTTP-status: ${xhr.status}`);
        $("main").load("/structure/404.html");
    }
});

// // create the sidebar image links
// $(function () { createImageLinks() });
// $(function () { createImageLinks() });
// $(function () { createImageLinks() });
// $(function () { createImageLinks() });
// $(function () { createImageLinks() });
// $(function () { createImageLinks() });