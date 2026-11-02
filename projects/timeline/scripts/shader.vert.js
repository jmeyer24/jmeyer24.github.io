// language=GLSL

const vertexShader = `

    varying vec2 vUv;

    varying vec3 vPositionModel;
    varying vec3 vPositionWorld;
    varying vec3 vPositionView;

    varying vec3 vNormalModel;
    varying vec3 vNormalWorld;
    varying vec3 vNormalView;

    void main() {
        vUv = uv;

        vPositionModel = position;
        vPositionWorld = (modelMatrix * vec4(position, 1.0)).xyz;
        vPositionView = (modelViewMatrix * vec4(position, 1.0)).xyz;

        vNormalModel = normal;
        vNormalWorld = normalize(mat3(modelMatrix) * normal);
        vNormalView = normalize(normalMatrix * normal);     // normalMatrix ensures the normals are orthogonal after the (implicit) application of the modelViewMatrix

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }

`
export { vertexShader };