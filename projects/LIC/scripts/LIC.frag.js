//language=GLSL
export const vectorFieldFrag = `

    precision highp float;
    precision highp sampler3D;
    precision highp sampler2D;

    uniform sampler2D u_vecFieldTex;
    uniform sampler2D u_noiseTexture;
    uniform int u_steps;
    uniform vec3 u_color;

    in vec2 vUv;

    out vec4 fragColor;

    float max2(vec2 v) {
        return max(v.x, v.y);
    }

    void main(){
        // streamline  
        float stepSize = 1.0 / max2(vec2(textureSize(u_vecFieldTex, 0)));
        float accumulated_brightness = texture(u_noiseTexture, vUv).r;
        vec2 ray = vec2(0.);
        
        // accumulate in forward direction
        vec2 uv = vUv;
        for(int i = 1; i <= u_steps; i++){
            // get the vector direction at the current position
            ray = normalize(texture(u_vecFieldTex, uv).rg);

            // move along streamline
            uv += ray * stepSize;
            
            // addition step of the accumulation of color values
            accumulated_brightness += texture(u_noiseTexture, uv).r;
        }

        // accumulate in backward direction
        uv = vUv;
        for(int i = 1; i <= u_steps; i++){
            ray = normalize(texture(u_vecFieldTex, uv).rg);
            uv -= ray * stepSize;
            accumulated_brightness += texture(u_noiseTexture, uv).r;
        }
        
        // average
        accumulated_brightness = accumulated_brightness / (float(u_steps) * 2.0 + 1.0);

        fragColor = vec4(accumulated_brightness * u_color,1.);
    }

`