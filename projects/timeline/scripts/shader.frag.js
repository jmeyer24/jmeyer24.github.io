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

        float fast_time = time * 100000.0;
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

const earthFragmentShader = `

    // https://sangillee.com/2024-06-07-create-realistic-earth-with-shaders/

    uniform sampler2D u_dayTexture;
    uniform sampler2D u_nightTexture;
    uniform sampler2D u_normalTexture;
    uniform sampler2D u_specTexture;
    uniform sampler2D u_cloudTexture;
    uniform vec3 u_sunRelPosition; // the relative position of light source
    uniform float u_normalPower;
    uniform vec3 u_position;
    uniform vec3 u_moonPosition;
    uniform float u_moonRadius;
    uniform float u_sunRadius;

    varying mat3 vTbn;
    varying vec2 vUv; // texture UV map
    varying vec3 vNormalWorld; // normal vector at surface
    varying vec3 vPositionWorld;

    #define PI (3.141592)

    float eclipse(float angleBtw, float angleLight, float angleObs) {
        float angleRatio2 = pow(angleObs / angleLight, 2.);
        float value;
        if (angleBtw > angleLight - angleObs && angleBtw < angleLight + angleObs) {
            if (angleBtw < angleObs - angleLight) {
                value = 0.;
            }else {
                float x = 0.5/angleBtw * (angleBtw*angleBtw + angleLight*angleLight - angleObs*angleObs);
                float ths = acos(x/angleLight);
                float thm = acos((angleBtw-x)/angleObs);
                value = 1./PI * (PI - ths + 0.5 * sin(2. * ths) - thm * angleRatio2 + 0.5 * angleRatio2 * sin(2. * thm));
            }
        } else if (angleBtw > angleLight + angleObs)
            value = 1.;
        else { // angleBtw < angleLight - angleObs
            value = 1. - angleRatio2;
        }

        return clamp(value, 0., 1.);
    }

    void main( void ) {
        vec3 sunDir = normalize(u_sunRelPosition);

        // Day and night texture with eclipse
        vec3 dayColor = texture2D( u_dayTexture, vUv ).rgb;
        vec3 nightColor = texture2D( u_nightTexture, vUv ).rgb;

        float cosAngleSunToNormal = dot(vNormalWorld, sunDir); // Compute cosine sun to normal
        float mixAmountTexture = 1. / (1. + exp(-20. * cosAngleSunToNormal));
        float mixAmountHemisphere = mixAmountTexture;
        
        // 2. Eclipse
        vec3 surfacePosition = u_position + vPositionWorld;
        float distSurfaceToSun = length(u_sunRelPosition);
        float cosAngleBtwSunMoon = dot(sunDir, normalize(u_moonPosition - surfacePosition));
        float angleBtwSunMoon = acos(cosAngleBtwSunMoon);
        float distSurfaceToMoon = length(u_moonPosition - surfacePosition);

        mixAmountHemisphere *= eclipse(angleBtwSunMoon, asin(u_sunRadius/distSurfaceToSun), asin(u_moonRadius/distSurfaceToMoon));

        // Normal map texture
        vec3 t_normal = texture2D( u_normalTexture, vUv ).xyz * 2.0 - 1.0;
        vec3 normal = normalize(vTbn * t_normal);
        float cosAngleSunToSurface = dot(normal, sunDir); // Compute cosine sun to normal
        mixAmountTexture *= 1.0 + u_normalPower * (cosAngleSunToSurface - cosAngleSunToNormal);
        mixAmountTexture *= mixAmountHemisphere;
        mixAmountTexture = clamp(mixAmountTexture, 0., 1.);

        // Cloud shadow
        vec3 translVec = 0.005 * inverse(vTbn) * (vNormalWorld - sunDir);
        vec4 cloudsShadow = texture2D(u_cloudTexture, vUv - translVec.xy);
        mixAmountTexture *= (1. - 0.5*cloudsShadow.r);

        // Combine night and day colors
        vec3 color = mix( nightColor, dayColor, mixAmountTexture ); // Select day or night texture

        // Specular map texture with reflection
        float reflectRatio = texture2D(u_specTexture, vUv).r;
        reflectRatio = 0.3 * reflectRatio + 0.1;
        vec3 reflectVec = reflect(-sunDir, normal); // reflected vector of sunlight
        float specPower = clamp(dot(reflectVec, normalize(cameraPosition - surfacePosition)), 0., 1.); // dot product between reflected light and camera vector
        color += mixAmountTexture * pow(specPower, 2.0) * reflectRatio;

        // cloud
        vec4 cloudsColor = texture2D(u_cloudTexture, vUv);
        cloudsColor.r *= clamp(mixAmountHemisphere, 0.6, 1.);
        cloudsColor.g *= clamp(pow(mixAmountHemisphere, 1.5), 0.6, 1.);
        cloudsColor.b *= clamp(pow(mixAmountHemisphere, 2.0), 0.6, 1.); // Blue light is less scattered than red light
        cloudsColor.a =  cloudsColor.r * clamp(mixAmountHemisphere, 0.3, 1.); // .r, as the texture doesnt have an alpha channel
        color = color * (1.0 - cloudsColor.a) + cloudsColor.rgb * cloudsColor.a;

        // render
        gl_FragColor = vec4(color, 1.);
    }

`

const earthAtmosphereShader = `

    uniform vec3 u_sunRelPosition;
    uniform vec3 u_color;

    varying vec3 vPositionView;

    varying vec3 vNormalWorld;
    varying vec3 vNormalView;

    void main() {
        float cosAngleSunToNormal = dot(vNormalWorld, normalize(u_sunRelPosition));
        float mixAmount = 1. / (1. + exp(-7. * (cosAngleSunToNormal + 0.1)));
        
        float cosAngle = dot(vNormalView, normalize(vPositionView));
        float intensity = pow(3. * cosAngle, 3.);
        
        gl_FragColor = vec4(u_color, intensity) * mixAmount;
    }

`

const earthFresnelShader = `

    uniform vec3 u_sunRelPosition;
    uniform vec3 u_color;

    varying vec3 vPositionView;
    
    varying vec3 vNormalWorld;
    varying vec3 vNormalView;

    void main() {
        float cosAngleSunToNormal = dot(vNormalWorld, normalize(u_sunRelPosition));
        float mixAmount = 1. / (1. + exp(-7. * (cosAngleSunToNormal + 0.1)));

        float cosAngle = dot(vNormalView, normalize(vPositionView));
        float fresnelTerm = pow(1.0 + cosAngle, 2.0);
        
        gl_FragColor = vec4(u_color, 1.) * fresnelTerm * mixAmount;
    }

`

export { helperFragmentShader, sunFragmentShader, earthFragmentShader, earthAtmosphereShader, earthFresnelShader };