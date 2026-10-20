import { config } from "./config";

export const mod = (value, n) => ((((value) % n) + n) % n);
export const pos = (i) => [i * 3, i * 3 + 1].map((j) => config.display.vertices[j]);
export const drawPianoKeys = (i) => !(config.display.togglePianoKeys && config.display.pianoKeys.includes(i));
export const indexedReadyForBuffer = (i, indices, list) => {
    return indices
        .slice(i * 3, (i + 1) * 3)
        .map((i) => [i * 3, i * 3 + 1, i * 3 + 2]
            .map((j) => list[j]))
        .flat()
}
export const getVisibleHeight = (fov, distance = 1) => {
    // Wandle das vertikale FOV von Grad in Bogenmaß (Radians) um
    const verticalFOVRadians = fov * (Math.PI / 180);
    // Berechne die sichtbare Höhe
    const visibleHeight = 2 * Math.tan(verticalFOVRadians / 2) * distance;

    return visibleHeight;
}