import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { loadModel } from './loadModel'

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
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(7, 2, 2)
scene.add(camera)
const controls = new OrbitControls(camera, renderer.domElement)
controls.minDistance = 5
controls.maxDistance = 15
controls.enablePan = false
controls.maxPolarAngle = Math.PI / 2 - 0.05

// light
const pointLight = new THREE.PointLight(0xffffff, 10)
pointLight.position.set(0, 0, 2)
scene.add(pointLight)
const ambientLight = new THREE.AmbientLight(0xffffff)
scene.add(ambientLight)
const lightHelper = new THREE.PointLightHelper(pointLight, 0.1)
scene.add(lightHelper)

// grid
const gridHelper = new THREE.GridHelper()
scene.add(gridHelper)

// mesh
const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshPhongMaterial({ color: 0x00cc00 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// model
// loadModel()

// render everything
function animate() {
    requestAnimationFrame(animate)

    mesh.rotation.x += 0.01
    mesh.rotation.y += 0.01

    controls.update()
    renderer.render(scene, camera)
}
animate()

// resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    keyDisplayQueue.updatePosition()
}
window.addEventListener('resize', onWindowResize);