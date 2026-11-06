import { initConfig } from "./scripts/config";
import { initScene, updateScene, resize, animate } from "./scripts/scene";
import { initGui } from "./scripts/gui";
import { initEvents } from "./scripts/events";

function update() {
  updateScene();
  resize();
}
$(window).on("resize", update);

function init() {
  initConfig();
  initScene();
  initGui();
  initEvents();
}

init();
update();
animate();