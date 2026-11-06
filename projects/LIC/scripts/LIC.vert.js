//language=GLSL
export const vertShader = `

    out vec2 vUv;

    void main(){
        vUv = uv;

        gl_Position = vec4(position, 1.);
    }

`