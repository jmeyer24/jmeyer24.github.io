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

const earthVertexShader = `

    // https://sangillee.com/2024-06-07-create-realistic-earth-with-shaders/

    varying vec2 vUv;

    varying vec3 vPositionModel;
    varying vec3 vPositionWorld;
    varying vec3 vPositionView;

    varying vec3 vNormalModel;
    varying vec3 vNormalWorld;
    varying vec3 vNormalView;

    varying mat3 vTbn;

    attribute vec4 tangent; // "geometry.computeTangents()" is needed.

    void main() {
        vUv = uv;

        vPositionModel = position;
        vPositionWorld = (modelMatrix * vec4(position, 1.0)).xyz;
        vPositionView = (modelViewMatrix * vec4(position, 1.0)).xyz;

        vNormalModel = normal;
        vNormalWorld = normalize(mat3(modelMatrix) * normal);
        vNormalView = normalize(normalMatrix * normal);     // normalMatrix ensures the normals are orthogonal after the (implicit) application of the modelViewMatrix

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

        // for cloud shadow and moon eclipse computation
        vec3 t = normalize(tangent.xyz);
        vec3 n = normalize(normal.xyz);
        vec3 b = normalize(cross(t, n));

        t = mat3(modelMatrix) * t;
        b = mat3(modelMatrix) * b;
        n = mat3(modelMatrix) * n;
        vTbn = mat3(t, b, n);
    }

`
export { vertexShader, earthVertexShader };