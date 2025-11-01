/**
 * Room3 - интерактивная партикловая система с гравитацией
 * Частицы реагируют на курсор и формируют красивые вихревые паттерны
 */
import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Параметры партиклов
const PARTICLE_CONFIG = {
  count: 2000,
  radius: 10,
  size: 0.1,
  speed: 0.02,
  gravity: 0.005,
  attraction: 0.15,
  damping: 0.98
}

// Цвета
const COLORS = {
  primary: '#00ffff',
  secondary: '#ff00ff',
  tertiary: '#ffff00'
}

// Параметры освещения
const LIGHTING = {
  ambient: { intensity: 0.4 },
  point: { position: [0, 0, 5], intensity: 2, color: '#ffffff' },
  point2: { position: [-5, 5, -5], intensity: 1.5, color: COLORS.secondary }
}

export default function Room3({ onBack }) {
  const particlesRef = useRef()
  const mouseRef = useRef(new THREE.Vector3(0, 0, 0))
  const { camera, raycaster, pointer } = useThree()

  // Хранилище для скоростей партиклов
  const velocitiesRef = useRef(new Float32Array(PARTICLE_CONFIG.count * 3))

  // Создаем геометрию и атрибуты для партиклов
  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_CONFIG.count * 3)
    const colors = new Float32Array(PARTICLE_CONFIG.count * 3)
    const sizes = new Float32Array(PARTICLE_CONFIG.count)

    for (let i = 0; i < PARTICLE_CONFIG.count; i++) {
      const i3 = i * 3
      
      // Случайная позиция в сфере
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      const r = Math.random() * PARTICLE_CONFIG.radius
      
      positions[i3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = r * Math.cos(phi)

      // Случайная начальная скорость
      velocitiesRef.current[i3] = (Math.random() - 0.5) * PARTICLE_CONFIG.speed
      velocitiesRef.current[i3 + 1] = (Math.random() - 0.5) * PARTICLE_CONFIG.speed
      velocitiesRef.current[i3 + 2] = (Math.random() - 0.5) * PARTICLE_CONFIG.speed

      // Градиентный цвет в зависимости от позиции
      const t = i / PARTICLE_CONFIG.count
      const color = new THREE.Color()
      if (t < 0.33) {
        color.setHex(0x00ffff).lerp(new THREE.Color(COLORS.primary), t * 3)
      } else if (t < 0.66) {
        color.setHex(0xff00ff).lerp(new THREE.Color(COLORS.secondary), (t - 0.33) * 3)
      } else {
        color.setHex(0xffff00).lerp(new THREE.Color(COLORS.tertiary), (t - 0.66) * 3)
      }
      
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      sizes[i] = Math.random() * 0.05 + 0.05
    }

    return { positions, colors, sizes }
  }, [])

  // Обновление позиции мыши в 3D пространстве
  useFrame(() => {
    raycaster.setFromCamera(pointer, camera)
    const distance = 10
    mouseRef.current.copy(raycaster.ray.direction).multiplyScalar(distance).add(raycaster.ray.origin)
  })

  // Анимация партиклов
  useFrame(() => {
    if (!particlesRef.current) return

    const positions = particlesRef.current.geometry.attributes.position.array
    const velocities = velocitiesRef.current

    for (let i = 0; i < PARTICLE_CONFIG.count; i++) {
      const i3 = i * 3
      
      const px = positions[i3]
      const py = positions[i3 + 1]
      const pz = positions[i3 + 2]

      // Гравитация к центру
      const dx = -px
      const dy = -py
      const dz = -pz
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001
      
      const force = PARTICLE_CONFIG.gravity / (dist * dist + 1)
      velocities[i3] += dx * force
      velocities[i3 + 1] += dy * force
      velocities[i3 + 2] += dz * force

      // Притяжение к курсору мыши
      const mouseDx = mouseRef.current.x - px
      const mouseDy = mouseRef.current.y - py
      const mouseDz = mouseRef.current.z - pz
      const mouseDist = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy + mouseDz * mouseDz) || 0.001
      
      const mouseForce = PARTICLE_CONFIG.attraction / (mouseDist * mouseDist + 2)
      velocities[i3] += mouseDx * mouseForce
      velocities[i3 + 1] += mouseDy * mouseForce
      velocities[i3 + 2] += mouseDz * mouseForce

      // Применяем затухание
      velocities[i3] *= PARTICLE_CONFIG.damping
      velocities[i3 + 1] *= PARTICLE_CONFIG.damping
      velocities[i3 + 2] *= PARTICLE_CONFIG.damping

      // Обновляем позицию
      positions[i3] += velocities[i3]
      positions[i3 + 1] += velocities[i3 + 1]
      positions[i3 + 2] += velocities[i3 + 2]
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true
  })

  // Обработчики взаимодействия
  const handlePointerOver = () => {
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto'
  }

  return (
    <group onClick={onBack} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      {/* Освещение */}
      <ambientLight intensity={LIGHTING.ambient.intensity} />
      <pointLight
        position={LIGHTING.point.position}
        intensity={LIGHTING.point.intensity}
        color={LIGHTING.point.color}
      />
      <pointLight
        position={LIGHTING.point2.position}
        intensity={LIGHTING.point2.intensity}
        color={LIGHTING.point2.color}
      />

      {/* Партиклы */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={PARTICLE_CONFIG.count}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={PARTICLE_CONFIG.count}
            array={colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={PARTICLE_CONFIG.count}
            array={sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={PARTICLE_CONFIG.size}
          vertexColors
          sizeAttenuation
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

