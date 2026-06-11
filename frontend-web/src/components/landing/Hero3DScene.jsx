import { useEffect, useRef } from 'react';

import useReducedMotion from '../../hooks/useReducedMotion.js';

const vertexShader = `
  attribute vec2 aPosition;
  attribute vec4 aColor;
  attribute float aSize;
  varying vec4 vColor;
  void main() {
    vColor = aColor;
    gl_Position = vec4(aPosition, 0.0, 1.0);
    gl_PointSize = aSize;
  }
`;

const fragmentShader = `
  precision mediump float;
  varying vec4 vColor;
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;
    float glow = 1.0 - smoothstep(0.08, 0.5, d);
    gl_FragColor = vec4(vColor.rgb, vColor.a * glow);
  }
`;

const lineFragmentShader = `
  precision mediump float;
  varying vec4 vColor;
  void main() {
    gl_FragColor = vColor;
  }
`;

const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
};

const createProgram = (gl, fsSource) => {
  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexShader));
  gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fsSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }
  return program;
};

const palette = {
  primary: [0.06, 0.36, 0.84, 0.92],
  ai: [0.43, 0.21, 0.91, 0.88],
  cyan: [0.14, 0.73, 0.84, 0.82],
  soft: [0.82, 0.88, 1, 0.42],
};

function Hero3DScene({ mouse, onUnavailable }) {
  const canvasRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      onUnavailable?.();
      return undefined;
    }

    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', { antialias: true, alpha: true });
    if (!canvas || !gl) {
      onUnavailable?.();
      return undefined;
    }

    let frameId = 0;
    let width = 1;
    let height = 1;
    const pointProgram = createProgram(gl, fragmentShader);
    const lineProgram = createProgram(gl, lineFragmentShader);
    const pointBuffer = gl.createBuffer();
    const lineBuffer = gl.createBuffer();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width * dpr));
      height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    };

    const project = (point, time) => {
      const mx = mouse.current?.x || 0;
      const my = mouse.current?.y || 0;
      const angleY = time * 0.34 + mx * 0.34;
      const angleX = Math.sin(time * 0.28) * 0.08 + my * 0.24;
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      let x = point[0] * cosY - point[2] * sinY;
      let z = point[0] * sinY + point[2] * cosY;
      const y = point[1] * cosX - z * sinX;
      z = point[1] * sinX + z * cosX;
      const depth = 2.4 / (2.4 + z);
      return [x * depth, y * depth, depth, z];
    };

    const addPoint = (items, point, color, size, time) => {
      const [x, y, depth] = project(point, time);
      items.push(x, y, color[0], color[1], color[2], color[3], size * depth);
    };

    const addLine = (items, a, b, color, time) => {
      const pa = project(a, time);
      const pb = project(b, time);
      items.push(pa[0], pa[1], color[0], color[1], color[2], color[3]);
      items.push(pb[0], pb[1], color[0], color[1], color[2], color[3]);
    };

    const drawArray = (program, buffer, data, stride, mode) => {
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
      const position = gl.getAttribLocation(program, 'aPosition');
      const color = gl.getAttribLocation(program, 'aColor');
      const size = gl.getAttribLocation(program, 'aSize');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, stride * 4, 0);
      gl.enableVertexAttribArray(color);
      gl.vertexAttribPointer(color, 4, gl.FLOAT, false, stride * 4, 2 * 4);
      if (size >= 0 && stride > 6) {
        gl.enableVertexAttribArray(size);
        gl.vertexAttribPointer(size, 1, gl.FLOAT, false, stride * 4, 6 * 4);
      } else if (size >= 0) {
        gl.disableVertexAttribArray(size);
        gl.vertexAttrib1f(size, 1);
      }
      gl.drawArrays(mode, 0, data.length / stride);
    };

    const render = (now) => {
      const time = now * 0.001;
      const points = [];
      const lines = [];
      const nodes = [
        [-0.98, 0.38, 0.08],
        [-0.82, -0.36, -0.18],
        [0.86, 0.36, 0.06],
        [0.96, -0.28, -0.22],
        [0.18, 0.72, 0.2],
        [0.08, -0.78, 0.12],
      ];

      resize();
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

      addPoint(points, [0, 0, 0], palette.primary, 72, time);
      addPoint(points, [0, 0, 0.05], palette.ai, 38, time);
      addPoint(points, [0, 0, -0.08], palette.cyan, 22, time);
      nodes.forEach((node, index) => {
        addPoint(points, [node[0], node[1] + Math.sin(time * 1.6 + index) * 0.08, node[2]], index % 2 ? palette.ai : palette.cyan, 22, time);
        addLine(lines, node, [0, 0, 0], palette.soft, time);
      });

      for (let ring = 0; ring < 4; ring += 1) {
        const radius = 0.58 + ring * 0.16;
        const tilt = ring * 0.5;
        for (let i = 0; i < 96; i += 1) {
          const a = (i / 96) * Math.PI * 2;
          const b = ((i + 1) / 96) * Math.PI * 2;
          const p1 = [Math.cos(a) * radius, Math.sin(a) * radius * Math.sin(tilt + 0.6), Math.sin(a) * radius * Math.cos(tilt + 0.6)];
          const p2 = [Math.cos(b) * radius, Math.sin(b) * radius * Math.sin(tilt + 0.6), Math.sin(b) * radius * Math.cos(tilt + 0.6)];
          addLine(lines, p1, p2, ring === 0 ? palette.primary : ring === 1 ? palette.ai : palette.cyan, time + ring);
        }
      }

      for (let i = 0; i < 160; i += 1) {
        const a = i * 12.9898;
        const radius = 1.05 + ((i * 17) % 30) / 100;
        const point = [
          Math.cos(a + time * 0.18) * radius,
          Math.sin(a * 0.7 + time * 0.15) * 0.9,
          Math.sin(a) * 0.55,
        ];
        addPoint(points, point, palette.soft, 5 + (i % 3), time);
      }

      drawArray(lineProgram, lineBuffer, lines, 6, gl.LINES);
      drawArray(pointProgram, pointBuffer, points, 7, gl.POINTS);
      frameId = window.requestAnimationFrame(render);
    };

    frameId = window.requestAnimationFrame(render);
    window.addEventListener('resize', resize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      gl.deleteBuffer(pointBuffer);
      gl.deleteBuffer(lineBuffer);
      gl.deleteProgram(pointProgram);
      gl.deleteProgram(lineProgram);
    };
  }, [mouse, onUnavailable, reducedMotion]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

export default Hero3DScene;
