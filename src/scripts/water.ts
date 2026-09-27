// A single low-resolution fullscreen triangle. No animation framework or textures.
const vertexSource = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragmentSource = `
precision highp float;
uniform vec2 resolution;
uniform float time;

vec2 hash(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)),
                        dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

float caustic(vec2 p, float t) {
  p += 0.36 * vec2(sin(p.y * 1.8 + t), cos(p.x * 1.6 - t * 0.7));
  vec2 cell = floor(p);
  vec2 local = fract(p);
  float nearest = 8.0;
  float second = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 seed = hash(cell + neighbor);
      vec2 point = 0.5 + 0.32 * sin(6.2831 * seed + t * 0.6);
      float d = length(neighbor + point - local);
      second = max(min(second, d), nearest);
      nearest = min(nearest, d);
    }
  }
  float edge = second - nearest;
  return 1.0 - smoothstep(0.012, 0.105, edge);
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float aspect = resolution.x / resolution.y;
  vec2 p = uv * vec2(aspect, 1.0) * 9.0;
  float light = caustic(p, time * 0.11);
  float upperRight = exp(-3.0 * length((uv - vec2(1.07, 0.96)) * vec2(1.5, 0.9)));
  float lowerLeft = exp(-3.5 * length((uv - vec2(-0.13, 0.0)) * vec2(1.5, 0.9)));
  float edges = clamp((upperRight + lowerLeft) * 1.85, 0.0, 1.0);
  // Keep the reading column quiet and let the light pool at opposite corners.
  edges *= smoothstep(0.1, 0.6, abs(uv.x - 0.5)) * 0.9 + 0.1;
  vec3 paper = vec3(0.9804, 0.9765, 0.9647);
  vec3 water = mix(vec3(0.75, 0.84, 0.86), vec3(1.0, 0.997, 0.973), light);
  gl_FragColor = vec4(mix(paper, water, edges * 0.70), 1.0);
}
`;

export function initWater() {
  const canvas = document.querySelector<HTMLCanvasElement>('#water');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
  if (!gl) return; // The static CSS background is already visible.

  function shader(type: number, source: string) {
    const result = gl!.createShader(type);
    if (!result) return null;
    gl!.shaderSource(result, source);
    gl!.compileShader(result);
    if (!gl!.getShaderParameter(result, gl!.COMPILE_STATUS)) {
      gl!.deleteShader(result);
      return null;
    }
    return result;
  }
  const vertex = shader(gl.VERTEX_SHADER, vertexSource);
  const fragment = shader(gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const resolution = gl.getUniformLocation(program, 'resolution');
  const time = gl.getUniformLocation(program, 'time');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  let frame = 0;
  let elapsed = 0;
  let previous = 0;
  let lastDraw = 0;

  function draw() {
    gl!.uniform2f(resolution, canvas!.width, canvas!.height);
    gl!.uniform1f(time, elapsed);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }
  function resize() {
    // Limit pixel count on high-density phones and large displays.
    const scale = Math.min(1, 1200 / window.innerWidth);
    canvas!.width = Math.round(window.innerWidth * scale);
    canvas!.height = Math.round(window.innerHeight * scale);
    gl!.viewport(0, 0, canvas!.width, canvas!.height);
    draw();
  }
  function tick(now: number) {
    if (paused || document.hidden) { frame = 0; return; }
    if (previous) elapsed += Math.min((now - previous) / 1000, 0.1);
    previous = now;
    if (now - lastDraw >= 1000 / 30) { draw(); lastDraw = now; }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    canvas!.dataset.motion = paused ? 'paused' : 'playing';
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    if (!paused && !document.hidden) frame = requestAnimationFrame(tick);
  }
  reducedMotion.addEventListener('change', () => {
    paused = reducedMotion.matches;
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('resize', resize, { passive: true });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    canvas.style.display = 'none';
  });
  window.addEventListener('pagehide', () => cancelAnimationFrame(frame));
  window.addEventListener('pageshow', sync);
  resize();
  sync();
}
