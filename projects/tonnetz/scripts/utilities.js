import { config } from "./config";

const mod = (value, n) => ((((value) % n) + n) % n);
const pos = (i) => [i * 3, i * 3 + 1].map((j) => config.display.vertices[j]);
const drawPianoKeys = (i) => !(config.display.togglePianoKeys && config.display.pianoKeys.includes(i));

export { mod, pos, drawPianoKeys };