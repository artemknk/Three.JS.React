/**
 * Room2 - вторая комната с вращающейся стеклянной сферой
 * Демонстрация интерактивного 3D объекта с физически корректным материалом
 */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// Параметры вращения
const ROTATION_CONFIG = {
  speed: 0.1 // Скорость вращения группы объектов
}

// Параметры сферы
const SPHERE_CONFIG = {
  radius: 1,
  widthSegments: 32,
  heightSegments: 32,
  position: [0, 0, 0]
}

// Параметры материала сферы
const SPHERE_MATERIAL = {
  color: '#ff6b6b',
  transmission: 0.9,
  roughness: 0.1,
  clearcoat: 1
}

// Параметры освещения
const LIGHTING = {
  position: [0, 5, 0],
  intensity: 1,
  color: 'white'
}

export default function Room2({ onBack }) {
  const groupRef = useRef()

  // Анимация вращения комнаты
  useFrame((state) => {
    if (!groupRef.current) return
    
    const time = state.clock.elapsedTime
    groupRef.current.rotation.y = time * ROTATION_CONFIG.speed
  })

  return (
    <group ref={groupRef}>
      {/* Основное освещение сцены */}
      <pointLight
        position={LIGHTING.position}
        intensity={LIGHTING.intensity}
        color={LIGHTING.color}
      />

      {/* Интерактивная стеклянная сфера */}
      <mesh
        position={SPHERE_CONFIG.position}
        onClick={onBack}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'auto' }}
      >
        <sphereGeometry
          args={[
            SPHERE_CONFIG.radius,
            SPHERE_CONFIG.widthSegments,
            SPHERE_CONFIG.heightSegments
          ]}
        />
        <meshPhysicalMaterial
          color={SPHERE_MATERIAL.color}
          transmission={SPHERE_MATERIAL.transmission}
          roughness={SPHERE_MATERIAL.roughness}
          clearcoat={SPHERE_MATERIAL.clearcoat}
        />
      </mesh>
    </group>
  )
}