let config = {}

function initConfig() {
    config = {
        color: {
            text: getComputedStyle(document.documentElement).getPropertyValue("--color-text").trim(),
            bg: getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim(),
            high: getComputedStyle(document.documentElement).getPropertyValue("--color-high").trim(),
        },
    }
}

initConfig();

export { config };