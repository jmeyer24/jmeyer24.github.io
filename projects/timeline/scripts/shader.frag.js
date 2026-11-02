// language=GLSL

const helperFragmentShader = `

    varying vec2 vUv;

    varying vec3 vPositionModel;
    varying vec3 vPositionWorld;
    varying vec3 vPositionView;

    varying vec3 vNormalModel;
    varying vec3 vNormalWorld;
    varying vec3 vNormalView;

    void main() {
        vec3 helper = vec3(0.0);

        // helper = vec3(vUv, 0.0);    // 2D uv coordinates
        // helper = vPositionModel;    // position in model coordinates
        // helper = vPositionWorld;    // position in world coordinates (doesn't rotate or translate with object)
        // helper = vPositionView;     // position in view coordinates (goes with camera)
        // helper = vNormalModel;      // normals in model coordinates
        // helper = vNormalWorld;      // normals in world coordinates (doesn't rotate with object, but translates, as normals are directions)
        helper = vNormalView;       // normals in view coordinates (goes with camera, blue in center, as direction towards the camera vec3(0.,0.,1.))

        gl_FragColor = vec4(helper, 1.0);
    }

`;

const sunFragmentShader = `

    // https://sangillee.com/2024-06-29-create-realistic-sun-with-shaders/

    varying vec2 vUv;

    varying vec3 vPositionModel;
    varying vec3 vPositionWorld;
    varying vec3 vPositionView;

    varying vec3 vNormalModel;
    varying vec3 vNormalWorld;
    varying vec3 vNormalView;

    // uniforms

    uniform float time;
    // uniform vec2 resolution;
    // uniform vec3 color;
    // uniform vec3 haloColor;


    // 2D Random
    float random (in vec3 st) {
        return fract(sin(dot(st,vec3(12.9898,78.233,23.112)))*12943.145);
    }

    // 3D noise pattern (time dependend)
    #define X vec3(1., 0., 0.)
    #define Y vec3(0., 1., 0.)
    #define Z vec3(0., 0., 1.)
    float noise (in vec3 _pos) {

        vec3 i_pos = floor(_pos);
        vec3 f_pos = fract(_pos);

        float fast_time = time * 300.0;
        float i_time = floor(fast_time*0.2);
        float i_time_plus = i_time + 1.0;
        float f_time = fract(fast_time*0.2);

        // Four corners in 2D of a tile
        float aa = random(i_pos + i_time);
        float ab = random(i_pos + i_time + X);
        float ac = random(i_pos + i_time + Y);
        float ad = random(i_pos + i_time + X+Y);
        float ae = random(i_pos + i_time + Z);
        float af = random(i_pos + i_time + X+Z);
        float ag = random(i_pos + i_time + Y+Z);
        float ah = random(i_pos + i_time + X+Y+Z);

        float ba = random(i_pos + i_time_plus);
        float bb = random(i_pos + i_time_plus + X);
        float bc = random(i_pos + i_time_plus + Y);
        float bd = random(i_pos + i_time_plus + X+Y);
        float be = random(i_pos + i_time_plus + Z);
        float bf = random(i_pos + i_time_plus + X+Z);
        float bg = random(i_pos + i_time_plus + Y+Z);
        float bh = random(i_pos + i_time_plus + X+Y+Z);

        // Smooth step
        vec3 t = smoothstep(0., 1., f_pos);
        float t_time = smoothstep(0., 1., f_time);

        // Mix 4 corners percentages
        return 
        mix(
            mix(
                mix(mix(aa,ab,t.x), mix(ac,ad,t.x), t.y),
                mix(mix(ae,af,t.x), mix(ag,ah,t.x), t.y), 
                t.z
            ),
            mix(
                mix(mix(ba,bb,t.x), mix(bc,bd,t.x), t.y),
                mix(mix(be,bf,t.x), mix(bg,bh,t.x), t.y), 
                t.z
            ), 
            t_time
        );
    }

    // fractal Brownian motion
    #define NUM_OCTAVES 6
    float fBm ( in vec3 _pos, in float sz) {
        float v = 0.0;
        float a = 0.2;
        _pos *= sz;

        vec3 angle = vec3(-0.001*time,0.0001*time,0.0004*time);
        mat3 rotx = mat3(1, 0, 0,
                        0, cos(angle.x), -sin(angle.x),
                        0, sin(angle.x), cos(angle.x));
        mat3 roty = mat3(cos(angle.y), 0, sin(angle.y),
                        0, 1, 0,
                        -sin(angle.y), 0, cos(angle.y));
        mat3 rotz = mat3(cos(angle.z), -sin(angle.z), 0,
                        sin(angle.z), cos(angle.z), 0,
                        0, 0, 1);

        for (int i = 0; i < NUM_OCTAVES; ++i) {
            v += a * noise(_pos);
            _pos = rotx * roty * rotz * _pos * 2.0;
            a *= 0.8;
        }
        return v;
    }

    void main() {
        // Surface term
        vec3 st = vPositionModel;
        vec3 q = vec3(
            fBm(st                          , 5.),
            fBm(st + vec3(1.2,3.2,1.52)     , 5.),
            fBm(st + vec3(0.02,0.12,0.152)  , 5.)
        );
        float n = fBm(st + q + vec3(1.82,1.32,1.09), 5.);

        vec3 fragColor = vec3(0.);
        fragColor = mix(
            vec3(1.,0.4,0.),
            vec3(1.,1.,1.),
            n*n
        );
        fragColor = mix(
            fragColor,
            vec3(1.,0.,0.),
            q*0.7
        );
        fragColor *= 1.6;

        // Glow term
        float cosAngle = dot(vNormalView, Z); // these go in the same direction, so range [0, 1]
        float intensity = pow(max(cosAngle, 0.0), 4.);

        // Fresnel term
        cosAngle = dot(vNormalView, normalize(vPositionView)); // these go in opposite directions (vPositionView is from the camera), so range [-1, 0]
        float fresnelTerm_inner = pow(cosAngle * (-0.8)   + 0.2, 3.0);
        float fresnelTerm_outer = pow(cosAngle            + 1.0, 2.0);
        float fresnelTerm = fresnelTerm_inner + fresnelTerm_outer;

        // Final
        // apply fresnel
        fragColor = (fragColor + fragColor*fresnelTerm*2.0) / 2.0;
        gl_FragColor = vec4(fragColor, 1.0);

        // apply intensity
        // makes the sphere disappear towards the outside, making it look like gas -> make dedicated atmosphere mesh
        // gl_FragColor = vec4(fragColor, intensity);
    }

`

export { helperFragmentShader, sunFragmentShader };