import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// renderer
const canvas = document.querySelector("canvas.webgl")
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.setPixelRatio(window.devicePixelRatio)

// scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x333333)

// camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 9000)
camera.position.set(7, 2, 2)
scene.add(camera)
const controls = new OrbitControls(camera, renderer.domElement)
controls.minDistance = 5
controls.maxDistance = 15
controls.enablePan = false
// controls.maxPolarAngle = Math.PI / 2 - 0.05

// light
const pointLight = new THREE.PointLight(0xffffff, 10)
pointLight.position.set(0, 0, 2)
scene.add(pointLight)
const ambientLight = new THREE.AmbientLight(0xffffff)
ambientLight.intensity = 2
scene.add(ambientLight)
// const lightHelper = new THREE.PointLightHelper(pointLight, 0.1)
// scene.add(lightHelper)

// grid
const gridHelper = new THREE.GridHelper()
scene.add(gridHelper)

// mesh
const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshPhongMaterial({ color: 0x00cc00 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// cursor check
const cursor = { x: 0, y: 0 }
window.addEventListener("mousemove", (event) => {
    cursor.x = event.clientX / window.innerWidth - 0.5
    cursor.y = event.clientY / window.innerHeight - 0.5
})

// model
const loader = new GLTFLoader();
loader.load(
    // resource URL
    "public/Electric_Towers.gltf",
    // called when the resource is loaded
    function (gltf) {
        // add the whole scene (10 objects here)
        // scene.add(gltf.scene);
        // select one object instead of the whole scene
        let model = gltf.scene.getObjectByName("Tower_8").clone();
        model.position.set(0, 0, 0);

        const y = () => {
            window.requestAnimationFrame(y)
            model.rotation.x = cursor.y / 4
            model.rotation.y = cursor.x / 4
        }
        y()

        scene.add(model);
    },
    // called while loading is progressing
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    // called when loading has errors
    function (error) {
        console.error(error);
    }
)

// render everything
function animate() {
    requestAnimationFrame(animate)
    // rotate objects
    mesh.rotation.x += 0.01
    mesh.rotation.y += 0.01
    // update and render
    controls.update()
    renderer.render(scene, camera)
}
animate()

// resize handler
function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
window.addEventListener('resize', onWindowResize);