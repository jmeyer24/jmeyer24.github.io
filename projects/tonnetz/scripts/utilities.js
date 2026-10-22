import { config } from "./config";
import { camera } from "./scene";

export const mod = (value, n) => ((((value) % n) + n) % n);
export const pos = (i) => [i * 3, i * 3 + 1].map((j) => config.display.vertices[j]);
export const drawPianoKeys = (i) => !(config.display.togglePianoKeys && config.display.pianoKeys.includes(i));
export const getVisibleHeight = (fov, distance = 1) => {
    // height that is visible with a given field of view (fov)
    // Wandle das vertikale FOV von Grad in Bogenmaß (Radians) um
    const verticalFOVRadians = fov * (Math.PI / 180);
    // Berechne die sichtbare Höhe
    const visibleHeight = 2 * Math.tan(verticalFOVRadians / 2) * distance;

    return visibleHeight;
}
export const computeScalingFromHeight = (targetHeight) => {
    const { width, height, padding } = config.display;

    targetHeight = (1 - padding) * targetHeight;
    const targetWidth = targetHeight * camera.aspect;
    return Math.min(targetWidth / width, targetHeight / height);
}