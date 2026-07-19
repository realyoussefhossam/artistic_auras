"use client";

import { useEffect, useRef } from "react";

interface AuroraBackgroundProps {
  className?: string;
}

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
    vec2 uv = v_texCoord;
    float noise1 = sin(uv.x * 3.0 + u_time * 0.5) * cos(uv.y * 2.0 + u_time * 0.3);
    float noise2 = sin(uv.y * 4.0 - u_time * 0.4) * cos(uv.x * 2.5 + u_time * 0.6);
    vec3 color1 = vec3(0.04, 0.04, 0.06);
    vec3 color2 = vec3(0.48, 0.22, 0.93);
    vec3 color3 = vec3(0.92, 0.28, 0.60);
    float mixFactor = (noise1 + noise2 + 1.0) * 0.5;
    mixFactor = smoothstep(0.3, 0.8, mixFactor);
    vec3 finalColor = mix(color1, color2, mixFactor * 0.4);
    finalColor = mix(finalColor, color3, mixFactor * 0.15 * sin(u_time * 0.2));
    float vignette = 1.0 - length(uv - 0.5) * 1.2;
    finalColor *= vignette;
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Failed to create shader");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${info ?? "unknown"}`);
  }
  return shader;
}

export function AuroraBackground({ className }: AuroraBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl") ??
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return;

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      throw new Error(`Program link error: ${info ?? "unknown"}`);
    }
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uMouse = gl.getUniformLocation(program, "u_mouse");

    let mouse: [number, number] = [0.5, 0.5];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth * dpr;
      const height = canvas.clientHeight * dpr;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      mouse = [e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight];
    };
    window.addEventListener("mousemove", handleMouseMove);

    const startTime = performance.now();
    let frameId = 0;

    const render = () => {
      const time = (performance.now() - startTime) / 1000;
      gl.uniform1f(uTime, time);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouse[0], mouse[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      frameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-0 pointer-events-none ${className ?? ""}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/80 via-transparent to-[#0a0a0f]/90" />
    </div>
  );
}
