import LIC from "./scripts/LIC";
import { DuffingOscillator, DoubleGyre } from "./scripts/VectorField";

const colors = {
    text: getComputedStyle(document.documentElement).getPropertyValue("--color-text").trim(),
    bg: getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim(),
    high: getComputedStyle(document.documentElement).getPropertyValue("--color-high").trim(),
}
const licList = [
    new LIC({
        vectorField: new DuffingOscillator(),
        color: colors.text,
        xSpace: [-2.0, 2.0],
        ySpace: [-2.0, 2.0],
        canvasId: 0,
        widthRatio: 4,
        pixels: 256,
        aspect: 1,
        steps: 50,
    }),
    new LIC({
        vectorField: new DoubleGyre(),
        color: colors.text,
        xSpace: [0.0, 2.0],
        ySpace: [0.0, 1.0],
        canvasId: 1,
        widthRatio: 2,
        pixels: 256,
        aspect: 2,
        steps: 50,
    }),
];

function initScene() {
    licList.forEach(lic => lic.init());
}

function resizeScene() {
    licList.forEach(lic => lic.resize());
}

function animate(msec = 0) {
    requestAnimationFrame(animate);

    let t = msec * 0.001
    licList.forEach(lic => lic.animate(t));
}

function main() {
    initScene();
    resizeScene();
    animate();
    $(window).on("resize", resizeScene);
}

main();