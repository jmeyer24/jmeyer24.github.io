import { initScene, updateTimeline, updateCamera, resize, animate } from "./scripts/scene";
import initGui from "./scripts/gui";
import initEvents from "./scripts/events";

function update() {
  updateTimeline();
  updateCamera();
  resize();
}
$(window).on("resize", update);

initScene();
initGui();
initEvents();

update();
animate();