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
await fetch("src/pages/nav.html")
    .then(response => response.text())
    .then((data) => {
        $("nav").html(data)
    });

await fetch("src/pages/footer.html")
    .then(response => response.text())
    .then((data) => {
        $("footer").html(data)
    });

// write a text on the welcome page
let current_site = window.location.pathname.split('/').filter(Boolean)[0]
current_site = current_site ? current_site : "welcome";
fetch(`src/pages/${current_site}.html`)
    .then(response => response.text())
    .then((data) => {
        $("main").html(data)
    });
$("#current-site").html(current_site);

// create the sidebar image links
$(function () { createImageLinks() });
$(function () { createImageLinks() });
$(function () { createImageLinks() });
$(function () { createImageLinks() });
$(function () { createImageLinks() });
$(function () { createImageLinks() });