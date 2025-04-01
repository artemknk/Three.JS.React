import { useFrame, extend } from '@react-three/fiber'
import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'
import { useRef, useMemo } from 'react'

const EmissiveSphereMaterial = shaderMaterial(
  {
    time: 10,
    color1: new THREE.Color('#22e6b9'),
    color2: new THREE.Color('#7525b9'),
    glowPower: 1.2, // увеличиваем силу свечения
    waveStrength: 1, // увеличиваем амплитуду волны
    waveFrequency: 10, // увеличиваем частоту волны
  },
  `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normal;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  `
  uniform vec3 color1;
  uniform vec3 color2;
  uniform float time;
  uniform float glowPower;
  uniform float waveStrength;
  uniform float waveFrequency;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    // Волна по поверхности сферы
    float wave = sin(vPosition.x * waveFrequency + time * 0.9) * waveStrength;
    vec3 displacedPosition = vPosition + normalize(vNormal) * wave;

    // Окрас
    float pulse = sin(time * 0.5) * 0.5 + 0.5;
    vec3 color = mix(color1, color2, pulse);
    
    // Эмиссия
    float emission = pow(abs(displacedPosition.z), glowPower);
    gl_FragColor = vec4(color * emission, 5.0);
  }
  `
)

extend({ EmissiveSphereMaterial })

export default function BackgroundSphere() {
  const meshRef = useRef()
  const materialRef = useRef()
  const lightRef = useRef()

  const color1 = useMemo(() => new THREE.Color('#22e6b9'), []);
  const color2 = useMemo(() => new THREE.Color('#7525b9'), []);
  
  const SPHERE_RADIUS = 1;
  const SPHERE_SEGMENTS = 64;
  const ROTATION_SPEED = 0.1; // Скорость вращения

  useFrame((state) => {
    const time = state.clock.elapsedTime
    materialRef.current.time = time
    
    // Вращение сферы
    meshRef.current.rotation.y = time * ROTATION_SPEED;
    meshRef.current.rotation.z = -time * ROTATION_SPEED;
    
    // Пульсация цвета (оставляем как было)
    const pulse = Math.sin(time * 0.1) * 0.5 + 0.5
    lightRef.current.color.lerpColors(color1, color2, pulse)
  })

  return (
    <>
      <mesh 
        ref={meshRef} 
        position={[0, 0, -2]} 
        scale={[5, 5, 5]}
        onUnmount={() => {
          meshRef.current.geometry.dispose();
          meshRef.current.material.dispose();
        }}
      >
        <sphereGeometry args={[SPHERE_RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS]} />
        <emissiveSphereMaterial 
          ref={materialRef}
          side={THREE.BackSide}
          waveStrength={1}
          waveFrequency={100}
          glowPower={1.2}
          roughness={0.2}
          metalness={1}
        />
      </mesh>
      
      {/* Источник света (оставляем без изменений) */}
      <pointLight
        ref={lightRef}
        position={[0, -1, -1]}
        intensity={200}
        distance={15}
        decay={1.6}
        color="#7525b9"
      />
    </>
  )
}