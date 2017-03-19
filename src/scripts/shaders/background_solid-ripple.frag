precision mediump float;

uniform vec2 wResolution;
uniform float wRatio;
uniform float time;

varying vec2 vUv;

vec3 mod289( vec3 x ) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289( vec2 x ) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute( vec3 x ) { return mod289(((x*34.0)+1.0)*x); }

float snoise( vec2 v ) {

    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 100.0 * dot(m, g);
}

float deform( vec2 p, vec2 v ) {

    float DEPTH_LEVEL = 0.25;

    return snoise( p + v ) * DEPTH_LEVEL + DEPTH_LEVEL;
}

void main() {

    float PI = 3.14159265359;
    float DETAIL_LEVEL = 14.0;
    float DEFORMATION_LEVEL = 0.02;
    vec3  PURPLE = vec3( 37.0 / 255.0, 26.0 / 255.0, 48.0 / 255.0 );
    float TIME = time * 0.04;

    vec2  screenPos = gl_FragCoord.xy / wResolution.xy;
    vec2  pos = vec2( screenPos * DETAIL_LEVEL );

    vec2  velocity = vec2( 0.0 );
    float deformation = 0.0;
    float point = 0.0;

    // Add first deformation
    point = 0.0;
    velocity = vec2( TIME, TIME );
    deformation += deform( pos, velocity );

    // Add second deformation
    point = snoise( pos * vec2( cos( TIME * 0.3 ) * sin( TIME * 1.5 ), sin( TIME * 0.5 ) * cos( TIME * 1.5 ) ) * DEFORMATION_LEVEL ) * PI;
    velocity = vec2( cos( point ), sin( point ) + TIME * 3.0 );
    deformation += deform( pos, velocity );

    vec3 color = vec3( smoothstep( 0.495, 0.505, fract( deformation ) ) );

    // color.r = min( color.r + 0.1 + snoise( vec2( pos.x + TIME * 0.1, pos.y ) ), 1.0 );
    // color.g = min( color.g + 0.1 + snoise( vec2( pos.x + TIME * 0.1, pos.y ) ), 1.0 );
    // color.b = min( color.b + 0.1 + snoise( vec2( pos.x + TIME * 0.1, pos.y ) ), 1.0 );

    // Dilute colour strength
    color = min( color + 0.85, 1.0 );

    // Colourise to purple
    color *= PURPLE;

    gl_FragColor = vec4( color, 1.0 );
}
