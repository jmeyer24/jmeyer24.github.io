import { initScene, resizeScene, animate } from "./scripts/scene";

function init() {
  initScene();
}

function update() {
  resizeScene();
}

init();
update();
animate();
$(window).on("resize", update);