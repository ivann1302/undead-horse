import { useEffect, useRef } from 'react';

const vertexShaderSource = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_motion;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;

  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.04;
    amplitude *= 0.52;
  }

  return value;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  float radius = length(uv);
  float angle = atan(uv.y, uv.x);
  float time = u_time * u_motion;

  float recordEdge = 0.27;
  float vertical = uv.y / max(radius, 0.001);
  float side = abs(cos(angle));
  float top = smoothstep(0.04, 0.9, vertical);
  float bottom = 1.0 - smoothstep(-0.94, -0.08, vertical);
  float sideBoost = smoothstep(0.54, 1.0, side);

  vec2 cloudFlow = vec2(angle * 2.15 + time * 0.035, radius * 5.8 - time * 0.18);
  vec2 veilFlow = vec2(angle * 5.6 - time * 0.03, radius * 9.5 - time * 0.34);
  vec2 notchFlow = vec2(angle * 10.8 + time * 0.045, radius * 12.5 + time * 0.22);
  vec2 sparkFlow = vec2(angle * 25.0 - time * 0.055, radius * 27.0 - time * 0.86);
  float broad = fbm(cloudFlow);
  float veil = fbm(veilFlow);
  float notches = fbm(notchFlow);
  float sparks = fbm(sparkFlow);
  float angularBands = fbm(vec2(angle * 3.6 - time * 0.02, 1.2 + radius * 3.2));
  float brokenPockets = 1.0 - smoothstep(0.2, 0.58, fbm(vec2(angle * 7.8 + time * 0.018, radius * 4.4)));

  float clusters = smoothstep(0.36, 0.76, broad * 0.72 + angularBands * 0.34);
  float fray = pow(smoothstep(0.42, 0.9, notches * 0.62 + sparks * 0.34), 1.45);
  float fineBreakup = smoothstep(0.24, 0.82, sparks + fray * 0.22);
  float directionalLift = top * 0.032 + sideBoost * 0.02 + bottom * 0.018;

  float coronaHeight = 0.022 + clusters * 0.064 + fray * 0.096 + directionalLift * 1.04;
  coronaHeight *= 0.58 + clusters * 0.66 + fineBreakup * 0.38;
  coronaHeight *= 1.0 - brokenPockets * 0.28;
  float outerEdge = recordEdge + coronaHeight;

  float fixedInnerEdge = smoothstep(recordEdge - 0.004, recordEdge + 0.0015, radius);
  float outerFalloff = 1.0 - smoothstep(outerEdge - 0.018, outerEdge + 0.082, radius);
  float corona = fixedInnerEdge * outerFalloff;
  corona *= 0.2 + clusters * 0.62 + fineBreakup * 0.34;
  corona *= 1.0 - brokenPockets * smoothstep(recordEdge + 0.024, outerEdge + 0.01, radius) * 0.58;

  float brightBreakup = smoothstep(0.46, 0.92, notches * 0.52 + sparks * 0.36 + clusters * 0.3);
  float emberGaps = 1.0 - smoothstep(0.34, 0.64, fbm(vec2(angle * 13.4 - time * 0.06, radius * 8.8 + time * 0.28)));
  float thinRim = smoothstep(recordEdge - 0.005, recordEdge + 0.001, radius)
    * (1.0 - smoothstep(recordEdge + 0.006, recordEdge + 0.014, radius))
    * brightBreakup
    * (1.0 - emberGaps * 0.72);
  float warmCore = fixedInnerEdge
    * (1.0 - smoothstep(recordEdge + 0.022, recordEdge + 0.058, radius))
    * (0.22 + brightBreakup * 0.78)
    * (1.0 - emberGaps * 0.64);
  float flameTips = smoothstep(recordEdge + 0.026, recordEdge + 0.054, radius)
    * (1.0 - smoothstep(outerEdge - 0.018, outerEdge + 0.116, radius))
    * fray
    * brightBreakup
    * (1.0 - emberGaps * 0.52)
    * (0.28 + clusters * 1.02);
  float smokyHalo = smoothstep(recordEdge + 0.036, recordEdge + 0.074, radius)
    * (1.0 - smoothstep(recordEdge + 0.094, recordEdge + 0.21, radius));
  smokyHalo *= (0.16 + 0.44 * broad) * (0.28 + clusters) * (0.7 - brokenPockets * 0.26);

  float heat = clamp((outerEdge - radius) / max(coronaHeight, 0.001), 0.0, 1.0);
  vec3 cream = vec3(1.0, 0.76, 0.34);
  vec3 honey = vec3(1.0, 0.5, 0.08);
  vec3 amber = vec3(0.86, 0.28, 0.035);
  vec3 ember = vec3(0.35, 0.07, 0.025);
  vec3 smoke = vec3(0.055, 0.035, 0.025);
  vec3 color = mix(smoke, ember, smokyHalo * 0.82);
  color = mix(color, amber, flameTips * 0.6);
  color = mix(color, honey, smoothstep(0.18, 0.72, heat) * corona);
  color = mix(color, cream, warmCore * (0.5 + veil * 0.18));
  color += vec3(1.0, 0.42, 0.045) * thinRim * 0.12;
  color += vec3(0.58, 0.14, 0.045) * smokyHalo * 0.22;

  float flicker = 0.9 + 0.05 * sin(time * 3.4 + angle * 5.0) + 0.06 * veil;
  float alpha = clamp(
    corona * flicker * 0.62
      + warmCore * 0.7
      + thinRim * 0.22
      + flameTips * 0.36
      + smokyHalo * 0.22,
    0.0,
    1.0
  );

  gl_FragColor = vec4(color, alpha);
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function createProgram(gl) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return program;
}

export default function FlameRing() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', {
      alpha: true,
      antialias: true,
      depth: false,
      premultipliedAlpha: false,
      stencil: false,
    });

    if (!gl) {
      return undefined;
    }

    let program;

    try {
      program = createProgram(gl);
    } catch (error) {
      console.error('Flame shader failed to initialize', error);
      return undefined;
    }

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const motionLocation = gl.getUniformLocation(program, 'u_motion');
    const positionBuffer = gl.createBuffer();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrame = 0;
    let lastWidth = 0;
    let lastHeight = 0;

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    const render = (now) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextWidth = Math.max(1, Math.round(rect.width * dpr));
      const nextHeight = Math.max(1, Math.round(rect.height * dpr));

      if (nextWidth !== lastWidth || nextHeight !== lastHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
        gl.viewport(0, 0, nextWidth, nextHeight);
        lastWidth = nextWidth;
        lastHeight = nextHeight;
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(resolutionLocation, nextWidth, nextHeight);
      gl.uniform1f(timeLocation, now * 0.001);
      gl.uniform1f(motionLocation, reducedMotion.matches ? 0 : 1);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    };
  }, []);

  return <canvas className="flame-ring" ref={canvasRef} aria-hidden="true" />;
}
