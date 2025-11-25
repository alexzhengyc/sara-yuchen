'use client';

import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { useFrame, useLoader, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { useConfigStore } from '@/store/configStore';

// Define Shader Material
const ImageParticleMaterial = shaderMaterial(
  {
    uTime: 0,
    uTexture: new THREE.Texture(),
    uPixelRatio: 1,
    uSize: 2.0,
    uDisplacementStrength: 0.2,
    uFlowSpeed: 0.5,
    uFlowAmplitude: 0.5,
    uDispersion: 1.5,
    uContrast: 1.1,
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform sampler2D uTexture;
    uniform float uPixelRatio;
    uniform float uSize;
    uniform float uDisplacementStrength;
    uniform float uFlowSpeed;
    uniform float uFlowAmplitude;
    uniform float uDispersion;

    varying vec3 vColor;
    varying vec2 vUv;

    // Function to calculate brightness
    float getBrightness(vec3 color) {
      return dot(color, vec3(0.299, 0.587, 0.114));
    }
    
    // Random function
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      vUv = uv;
      
      // Sample texture at the current UV coordinate
      vec4 texColor = texture2D(uTexture, uv);
      vColor = texColor.rgb;

      // Calculate displacement based on brightness
      float brightness = getBrightness(vColor);
      
      // Calculate distance from center (0.5, 0.5) - radial effect
      float distFromCenter = distance(uv, vec2(0.5));
      // Normalize to 0-1 range (max distance from center is ~0.707)
      distFromCenter = distFromCenter / 0.707;
      // Apply smoothstep starting from 0.5 (50% radius) - center 50% has almost no effect
      float radialFactor = smoothstep(0.5, 1.0, distFromCenter);
      // Apply power for even stronger edge effect
      radialFactor = pow(radialFactor, 2.0);
      
      // New position
      vec3 pos = position;
      
      // Dispersion - stronger at edges, weaker at center
      float noise = random(uv + uTime * 0.0001);
      pos.x += (noise - 0.5) * uDispersion * 0.01 * (1.0 - brightness) * radialFactor;
      pos.y += (noise - 0.5) * uDispersion * 0.01 * radialFactor;
      
      // Move particles forward based on brightness (brighter = closer)
      // Apply radial factor to displacement and flow effects
      pos.z += brightness * uDisplacementStrength * radialFactor + sin(uv.x * 20.0 + uTime * uFlowSpeed) * 0.02 * uFlowAmplitude * radialFactor;
      
      vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * viewPosition;

      // Size attenuation
      gl_PointSize = uSize * uPixelRatio * (10.0 / -viewPosition.z);
      
      // Hide particles that are too dark (optional, creates gaps)
      if (brightness < 0.05) gl_PointSize = 0.0;
    }
  `,
  // Fragment Shader
  `
    uniform float uContrast;
    varying vec3 vColor;

    void main() {
      // Circular particle
      float r = distance(gl_PointCoord, vec2(0.5));
      if (r > 0.5) discard;

      // Apply contrast
      vec3 finalColor = (vColor - 0.5) * uContrast + 0.5;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ ImageParticleMaterial });

// Add type for the new material
declare module '@react-three/fiber' {
  interface ThreeElements {
    imageParticleMaterial: object;
  }
}

interface ParticleImageProps {
  imageUrl: string;
}

export default function ParticleImage({ imageUrl }: ParticleImageProps) {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<any>(null); 
  const config = useConfigStore();
  
  // Load texture
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  
  // Create geometry points
  const pointsGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(4, 4, 256, 256); // 256x256 = ~65k particles
    return geometry;
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.getElapsedTime();
      materialRef.current.uPixelRatio = Math.min(window.devicePixelRatio, 2);
    }
  });

  return (
    <points ref={meshRef} geometry={pointsGeometry}>
      <imageParticleMaterial
        ref={materialRef}
        uTexture={texture}
        transparent={true}
        depthWrite={false}
        uSize={config.particleSize}
        uDisplacementStrength={config.depthStrength}
        uFlowSpeed={config.flowSpeed}
        uFlowAmplitude={config.flowAmplitude}
        uDispersion={config.dispersion}
        uContrast={config.contrast}
      />
    </points>
  );
}
