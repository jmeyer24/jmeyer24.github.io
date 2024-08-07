import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

export function loadModel() {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('three/examples/jsm/libs/draco/');
    loader.setDRACOLoader(dracoLoader);
    loader.load(
        // resource URL
        'src/kira.glb',
        // called when the resource is loaded
        function (gltf) {
            scene.add(gltf.scene);
            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object
        },
        // called while loading is progressing
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // called when loading has errors
        function (error) {
            console.log('An error happened');
        }
    );

    // const result = await loader.loadAsync('src/kira.glb');
    // scene.add(result.scene)

    // const loader = new GLTFLoader()
    // loader.load('src/kira.glb', async function (gltf) {
    //     const model = gltf.scene;

    //     // wait until the model can be added to the scene without blocking due to shader compilation
    //     await renderer.compileAsync(model, camera, scene);
    //     scene.add(model);
    // });
}