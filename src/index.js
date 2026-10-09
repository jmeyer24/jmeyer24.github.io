// load the navigation bar and the footer bar
$("footer").load("/structure/footer.html")
await fetch("/structure/nav.html")
    .then(response => response.text())
    .then((data) => {
        $("nav").html(data)
    });

// load the main content
function writeContent() {
    // write the content in the main element
    let current_site = window.location.hash.split("#").filter(Boolean)[0];
    current_site = current_site ? current_site : "welcome";

    $("main").load(`/pages/${current_site}.html`, function (response, status, xhr) {
        if (status == "error") {
            console.warn(`"${current_site}.html" could not be loaded properly. HTTP-status: ${xhr.status}`);
            $("main").load("/structure/404.html");
        }
    });
    $("nav #current-site").html(current_site);
}

$(document).ready(writeContent);

// when the hash changes (due to nav link clicks), reload the main content
$(window).on("hashchange", writeContent);

// TODO: on menu-button, toggle menu
$("#menu-button").on("click", function () {
    $(".menu").toggleClass("is-open");
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
