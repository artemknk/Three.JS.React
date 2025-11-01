/**
 * BackgroundSphere - фоновый эффект с анимированной светящейся сферой
 * Использует кастомный шейдерный материал для создания пульсирующего свечения
 * с волновым эффектом на поверхности
 */
import { useFrame, extend } from '@react-three/fiber'
import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'
import { useRef, useMemo } from 'react'

// Параметры шейдерного материала
const SHADER_PARAMS = {
  initialTime: 10,
  color1: '#22e6b9',      // Циан (первый цвет градиента)
  color2: '#7525b9',      // Фиолетовый (второй цвет градиента)
  glowPower: 1.2,         // Сила свечения
  waveStrength: 1,        // Амплитуда волны на поверхности
  waveFrequency: 10,      // Частота волны
  waveTimeSpeed: 0.9,     // Скорость анимации волны
  pulseSpeed: 0.5,        // Скорость пульсации цвета
  pulseAmplitude: 0.5     // Амплитуда пульсации
}

/**
 * Кастомный шейдерный материал для свечения сферы
 */
const EmissiveSphereMaterial = shaderMaterial(
  {
    time: SHADER_PARAMS.initialTime,
    color1: new THREE.Color(SHADER_PARAMS.color1),
    color2: new THREE.Color(SHADER_PARAMS.color2),
    glowPower: SHADER_PARAMS.glowPower,
    waveStrength: SHADER_PARAMS.waveStrength,
    waveFrequency: SHADER_PARAMS.waveFrequency
  },
  // Vertex shader - вычисляет нормали и позиции
  `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normal;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // Fragment shader - создает эффект свечения и волн
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

    // Пульсирующий градиент между двумя цветами
    float pulse = sin(time * 0.5) * 0.5 + 0.5;
    vec3 color = mix(color1, color2, pulse);
    
    // Эмиссионное свечение основанное на глубине
    float emission = pow(abs(displacedPosition.z), glowPower);
    gl_FragColor = vec4(color * emission, 5.0);
  }
  `
)

extend({ EmissiveSphereMaterial })

// Параметры сферы
const SPHERE_CONFIG = {
  radius: 1,
  segments: 64,
  position: [0, 0, -2],
  scale: [5, 5, 5]
}

// Параметры вращения
const ROTATION_CONFIG = {
  ySpeed: 0.1,   // Скорость вращения по оси Y
  zSpeed: -0.1   // Скорость вращения по оси Z (противоположное направление)
}

// Параметры пульсации света
const LIGHT_PULSE_CONFIG = {
  speed: 0.1,
  amplitude: 0.5
}

// Параметры точечного источника света
const POINT_LIGHT_CONFIG = {
  position: [0, -1, -1],
  intensity: 200,
  distance: 15,
  decay: 1.6,
  defaultColor: '#7525b9'
}

// Параметры материала сферы
const MATERIAL_CONFIG = {
  waveStrength: 1,
  waveFrequency: 100,
  glowPower: 1.2,
  roughness: 0.2,
  metalness: 1
}

export default function BackgroundSphere() {
  const meshRef = useRef()
  const materialRef = useRef()
  const lightRef = useRef()

  // Мемоизация цветов для оптимизации
  const color1 = useMemo(() => new THREE.Color(SHADER_PARAMS.color1), [])
  const color2 = useMemo(() => new THREE.Color(SHADER_PARAMS.color2), [])

  // Анимация сферы и света
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current || !lightRef.current) return

    const time = state.clock.elapsedTime
    
    // Обновление времени в шейдере
    materialRef.current.time = time

    // Вращение сферы по двум осям
    meshRef.current.rotation.y = time * ROTATION_CONFIG.ySpeed
    meshRef.current.rotation.z = time * ROTATION_CONFIG.zSpeed

    // Пульсация цвета источника света
    const pulse = Math.sin(time * LIGHT_PULSE_CONFIG.speed) * LIGHT_PULSE_CONFIG.amplitude + LIGHT_PULSE_CONFIG.amplitude
    lightRef.current.color.lerpColors(color1, color2, pulse)
  })

  // Очистка ресурсов при размонтировании
  const handleUnmount = () => {
    if (meshRef.current) {
      if (meshRef.current.geometry) meshRef.current.geometry.dispose()
      if (meshRef.current.material) meshRef.current.material.dispose()
    }
  }

  return (
    <>
      {/* Основная сфера с кастомным шейдерным материалом */}
      <mesh
        ref={meshRef}
        position={SPHERE_CONFIG.position}
        scale={SPHERE_CONFIG.scale}
        onUnmount={handleUnmount}
      >
        <sphereGeometry args={[SPHERE_CONFIG.radius, SPHERE_CONFIG.segments, SPHERE_CONFIG.segments]} />
        <emissiveSphereMaterial
          ref={materialRef}
          side={THREE.BackSide}
          waveStrength={MATERIAL_CONFIG.waveStrength}
          waveFrequency={MATERIAL_CONFIG.waveFrequency}
          glowPower={MATERIAL_CONFIG.glowPower}
          roughness={MATERIAL_CONFIG.roughness}
          metalness={MATERIAL_CONFIG.metalness}
        />
      </mesh>

      {/* Динамический источник света с пульсирующим цветом */}
      <pointLight
        ref={lightRef}
        position={POINT_LIGHT_CONFIG.position}
        intensity={POINT_LIGHT_CONFIG.intensity}
        distance={POINT_LIGHT_CONFIG.distance}
        decay={POINT_LIGHT_CONFIG.decay}
        color={POINT_LIGHT_CONFIG.defaultColor}
      />
    </>
  )
}