import { initConfig } from "./scripts/config";
import { initScene, updateScene, resize, animate } from "./scripts/scene";
import { initTimeline, updateTimeline } from "./scripts/timeline";
import { initGui } from "./scripts/gui";
import { initEvents } from "./scripts/events";

function update() {
  updateTimeline();
  updateScene();
  resize();
}
$(window).on("resize", update);

function init() {
  initConfig();
  initScene();
  initTimeline();
  initGui();
  initEvents();
}

init();
update();
animate();