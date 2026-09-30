import React, { useEffect, useRef } from 'react';
import { Renderer, Camera, Geometry, Program, Mesh, Color } from 'ogl';

const hexToRgb = (hex) => {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const int = parseInt(hex, 16);
  return [
    ((int >> 16) & 255) / 255,
    ((int >> 8) & 255) / 255,
    (int & 255) / 255
  ];
};

const vertexShader = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;

  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;

  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vRandom = random;
    vColor = color;
    
    vec3 pos = position * uSpread;
    pos.x += sin(uTime * random.z + 6.28 * random.w) * (0.2 + random.x * 0.3);
    pos.y += cos(uTime * random.w + 6.28 * random.x) * (0.2 + random.y * 0.3);
    pos.z += sin(uTime * random.x + 6.28 * random.y) * (0.2 + random.z * 0.3);

    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    vec4 mvPos = viewMatrix * mPos;
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / -mvPos.z;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord.xy - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;
    
    float alpha = 1.0;
    if (uAlphaParticles > 0.5) {
      alpha = smoothstep(0.5, 0.05, dist);
    } else {
      alpha = smoothstep(0.5, 0.42, dist);
    }
    
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export default function Particles({
  particleColors = ['#723708'],
  particleCount = 400,
  particleSpread = 10,
  speed = 0.1,
  particleBaseSize = 100,
  moveParticlesOnHover = true,
  alphaParticles = false,
  disableRotation = false,
  sizeRandomness = 1,
  cameraDistance = 20,
  className = '',
  style = {}
}) {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ depth: false, alpha: true, dpr: Math.min(window.devicePixelRatio, 2) });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const canvas = gl.canvas;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const camera = new Camera(gl, { fov: 45 });
    camera.position.set(0, 0, cameraDistance);

    const resize = () => {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
    };

    window.addEventListener('resize', resize);
    resize();

    // Generate particle attributes
    const count = particleCount;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);

    const colorPalette = particleColors.map(hexToRgb);

    for (let i = 0; i < count; i++) {
      // Gaussian distribution sphere
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random());
      const sinPhi = Math.sin(phi);

      positions[i * 3 + 0] = r * sinPhi * Math.cos(theta);
      positions[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      randoms[i * 4 + 0] = Math.random();
      randoms[i * 4 + 1] = Math.random();
      randoms[i * 4 + 2] = Math.random();
      randoms[i * 4 + 3] = Math.random();

      const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3 + 0] = chosenColor[0];
      colors[i * 3 + 1] = chosenColor[1];
      colors[i * 3 + 2] = chosenColor[2];
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors }
    });

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize },
        uSizeRandomness: { value: sizeRandomness },
        uAlphaParticles: { value: alphaParticles ? 1.0 : 0.0 }
      },
      transparent: true,
      depthTest: false
    });

    const particlesMesh = new Mesh(gl, { mode: gl.POINTS, geometry, program });

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };

    if (moveParticlesOnHover) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    let animationId;
    let lastTime = performance.now();
    let elapsed = 0;

    const update = (now) => {
      animationId = requestAnimationFrame(update);
      const delta = (now - lastTime) * 0.001;
      lastTime = now;
      elapsed += delta * speed;

      program.uniforms.uTime.value = elapsed;

      // Smooth mouse interpolation
      if (moveParticlesOnHover) {
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;
      }

      if (!disableRotation) {
        particlesMesh.rotation.y = elapsed * 0.35 + (moveParticlesOnHover ? mouseRef.current.x * 0.6 : 0);
        particlesMesh.rotation.x = elapsed * 0.2 + (moveParticlesOnHover ? mouseRef.current.y * 0.6 : 0);
      } else if (moveParticlesOnHover) {
        particlesMesh.rotation.y = mouseRef.current.x * 0.4;
        particlesMesh.rotation.x = mouseRef.current.y * 0.4;
      }

      renderer.render({ scene: particlesMesh, camera });
    };

    animationId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      if (moveParticlesOnHover) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [
    particleColors,
    particleCount,
    particleSpread,
    speed,
    particleBaseSize,
    moveParticlesOnHover,
    alphaParticles,
    disableRotation,
    sizeRandomness,
    cameraDistance
  ]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        pointerEvents: 'none',
        ...style
      }}
    />
  );
}
