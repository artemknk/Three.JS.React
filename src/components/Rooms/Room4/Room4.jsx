/**
 * Room4 - геометрическая инсталляция с рекурсивными структурами
 * Фрактальные формы, зеркальные поверхности и динамическое освещение
 */
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Параметры рекурсивных структур
const RECURSION_CONFIG = {
  levels: 3,
  scaleFactor: 0.5,
  rotationSpeed: 0.3,
  baseSize: 1.2
}

// Параметры материалов
const MATERIAL_CONFIG = {
  mirror: {
    roughness: 0.0,
    metalness: 1.0,
    color: '#ffffff'
  },
  emissive: {
    emissive: '#00ffff',
    emissiveIntensity: 0.8
  }
}

// Параметры освещения
const LIGHTING = {
  ambient: { intensity: 0.3 },
  directional: [
    { position: [5, 5, 5], color: '#ff00ff', intensity: 2 },
    { position: [-5, -5, 5], color: '#00ffff', intensity: 2 },
    { position: [0, 10, 0], color: '#ffffff', intensity: 1 }
  ]
}

// Функция создания рекурсивной структуры
function RecursiveStructure({ level, maxLevel, position, rotation, scale }) {
  const groupRef = useRef()
  const meshRef = useRef()

  useFrame((state) => {
    if (!groupRef.current || !meshRef.current) return

    const time = state.clock.elapsedTime
    const speed = RECURSION_CONFIG.rotationSpeed * (maxLevel - level + 1)
    groupRef.current.rotation.x = time * speed * 0.5
    groupRef.current.rotation.y = time * speed
    groupRef.current.rotation.z = time * speed * 0.3

    meshRef.current.rotation.x = -time * speed * 0.7
    meshRef.current.rotation.y = time * speed * 0.5
  })

  // Создаем материал в зависимости от уровня
  const material = useMemo(() => {
    if (level === 0) {
      // Внешний уровень - зеркальный
      return new THREE.MeshStandardMaterial({
        ...MATERIAL_CONFIG.mirror,
        envMapIntensity: 2
      })
    } else {
      // Внутренние уровни - эмиссивные с градиентом
      const t = level / maxLevel
      const hue = (t * 0.7 + 0.5) % 1
      const color = new THREE.Color().setHSL(hue, 1, 0.5)
      return new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.8,
        metalness: 0.8,
        roughness: 0.2
      })
    }
  }, [level, maxLevel])

  // Геометрия - икосаэдр для более интересной формы
  const geometry = useMemo(() => {
    return new THREE.IcosahedronGeometry(scale, 0)
  }, [scale])

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <mesh ref={meshRef} geometry={geometry} material={material} castShadow receiveShadow>
        {/* Рекурсивно создаем дочерние структуры */}
        {level < maxLevel && (
          <>
            {[...Array(12)].map((_, i) => {
              const angle = (i / 12) * Math.PI * 2
              const radius = scale * 1.5
              const childPosition = [
                Math.cos(angle) * radius,
                Math.sin(angle * 2) * radius * 0.5,
                Math.sin(angle) * radius
              ]
              const childRotation = [
                angle,
                angle * 0.5,
                angle * 0.3
              ]
              const childScale = scale * RECURSION_CONFIG.scaleFactor

              return (
                <RecursiveStructure
                  key={i}
                  level={level + 1}
                  maxLevel={maxLevel}
                  position={childPosition}
                  rotation={childRotation}
                  scale={childScale}
                />
              )
            })}
          </>
        )}
      </mesh>
    </group>
  )
}

export default function Room4({ onBack }) {
  const mainGroupRef = useRef()

  // Создаем отражающую плоскость
  const planeGeometry = useMemo(() => new THREE.PlaneGeometry(20, 20), [])
  const planeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    roughness: 0.0,
    metalness: 1.0,
    color: '#888888',
    envMapIntensity: 1
  }), [])

  useFrame((state) => {
    if (!mainGroupRef.current) return

    const time = state.clock.elapsedTime

    // Плавное вращение всей сцены
    mainGroupRef.current.rotation.y = time * 0.1
    mainGroupRef.current.rotation.x = Math.sin(time * 0.3) * 0.1
  })

  // Обработчики взаимодействия
  const handlePointerOver = () => {
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto'
  }

  return (
    <group ref={mainGroupRef}>
      {/* Освещение */}
      <ambientLight intensity={LIGHTING.ambient.intensity} />
      {LIGHTING.directional.map((light, i) => (
        <directionalLight
          key={i}
          position={light.position}
          color={light.color}
          intensity={light.intensity}
          castShadow
        />
      ))}

      {/* Зеркальный пол */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -3, 0]}
        geometry={planeGeometry}
        material={planeMaterial}
        receiveShadow
        onClick={onBack}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />

      {/* Главная рекурсивная структура */}
      <RecursiveStructure
        level={0}
        maxLevel={RECURSION_CONFIG.levels}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={RECURSION_CONFIG.baseSize}
      />

      {/* Дополнительные декоративные элементы */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2
        const radius = 3
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle * 2) * 0.5,
              Math.sin(angle) * radius
            ]}
            rotation={[angle, angle * 0.5, 0]}
          >
            <octahedronGeometry args={[0.3]} />
            <meshStandardMaterial
              color={new THREE.Color().setHSL((i / 6), 1, 0.6)}
              emissive={new THREE.Color().setHSL((i / 6), 1, 0.3)}
              emissiveIntensity={0.5}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        )
      })}
    </group>
  )
}

