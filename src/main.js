import * as THREE from 'three'

// scene
const scene = new THREE.Scene()
// camera
const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight)
camera.position.z = 3
// renderer
const canvas = document.querySelector("canvas.webgl")
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(window.innerWidth, window.innerHeight)

// setup the scene
scene.add(camera)

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshBasicMaterial({color: 0x00cc00})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// render everything
function animate() {
    requestAnimationFrame(animate)

    mesh.rotation.x += 0.01
    mesh.rotation.y += 0.01

    renderer.render(scene, camera)
}
animate()