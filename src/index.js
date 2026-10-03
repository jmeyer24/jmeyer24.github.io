// on sidebar-button, toggle sidebar-wrapper
$("#sidebar-button").on("click",
    function () {
        $(".sidebar")[0].classList.toggle("is-closed");
        $(".content")[0].classList.toggle("is-wide");
    });

// on text-button, toggle text-wrapper
$("#text-button").on("click",
    function () {
        $("#text-wrapper")[0].classList.toggle("is-closed");
    });

// on keydown, simulate a button click
// tab: sidebar-button
// "t": text-button
$(document.documentElement).on("keydown",
    function (event) {
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

// write a text on the main page
$("#text").html("A test text! <s>And some more...</s>");