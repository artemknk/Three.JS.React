/**
 * Room2 - вторая комната с элегантным морфингом фигур
 * Плавное превращение через fade in/out: сфера → куб → тетраэдр → сфера
 */
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Параметры анимации
const ANIMATION_CONFIG = {
  cycleDuration: 6,        // Время полного цикла (секунды)
  rotationSpeed: 0.15,     // Скорость вращения
  floatSpeed: 0.5,         // Скорость плавания
  floatAmplitude: 0.3      // Амплитуда плавания
}

// Параметры объекта
const OBJECT_CONFIG = {
  size: 1.8,
  position: [0, 0, 0]
}

// Яркие насыщенные цвета с градиентами
const COLORS = {
  sphere: '#ff0080',        // Яркий розовый
  cube: '#00aaff',          // Яркий голубой  
  tetrahedron: '#80ff00'    // Яркий зеленый
}

// Параметры материалов
const MATERIAL_CONFIG = {
  // transmission: 0.95,       // Почти полностью прозрачный
  roughness: 0.05,          // Очень гладкий
  clearcoat: 1.0,
  thickness: 0.8,
  ior: 1.5,
  emissiveIntensity: 0.6
}

// Параметры освещения
const LIGHTING = {
  ambient: { intensity: 0.6 },
  point1: { position: [5, 5, 5], intensity: 2, color: '#ffffff' },
  point2: { position: [-5, -5, -5], intensity: 1.5, color: '#ffaaff' }
}

// Функция для плавного перехода (ease in-out)
const smoothTransition = (t) => {
  return t * t * (3 - 2 * t) // Smoothstep
}

export default function Room2({ onBack }) {
  const groupRef = useRef()
  const sphereRef = useRef()
  const cubeRef = useRef()
  const tetrahedronRef = useRef()

  // Создаем геометрии
  const geometries = useMemo(() => ({
    sphere: new THREE.SphereGeometry(OBJECT_CONFIG.size, 32, 32),
    cube: new THREE.BoxGeometry(OBJECT_CONFIG.size * 1.5, OBJECT_CONFIG.size * 1.5, OBJECT_CONFIG.size * 1.5),
    tetrahedron: new THREE.TetrahedronGeometry(OBJECT_CONFIG.size * 2)
  }), [])

  // Создаем материалы для каждого объекта
  const materials = useMemo(() => ({
    sphere: new THREE.MeshPhysicalMaterial({
      color: COLORS.sphere,
      transmission: MATERIAL_CONFIG.transmission,
      roughness: MATERIAL_CONFIG.roughness,
      clearcoat: MATERIAL_CONFIG.clearcoat,
      thickness: MATERIAL_CONFIG.thickness,
      ior: MATERIAL_CONFIG.ior,
      emissive: new THREE.Color(COLORS.sphere),
      emissiveIntensity: MATERIAL_CONFIG.emissiveIntensity,
      side: THREE.DoubleSide
    }),
    cube: new THREE.MeshPhysicalMaterial({
      color: COLORS.cube,
      transmission: MATERIAL_CONFIG.transmission,
      roughness: MATERIAL_CONFIG.roughness,
      clearcoat: MATERIAL_CONFIG.clearcoat,
      thickness: MATERIAL_CONFIG.thickness,
      ior: MATERIAL_CONFIG.ior,
      emissive: new THREE.Color(COLORS.cube),
      emissiveIntensity: MATERIAL_CONFIG.emissiveIntensity,
      side: THREE.DoubleSide
    }),
    tetrahedron: new THREE.MeshPhysicalMaterial({
      color: COLORS.tetrahedron,
      transmission: MATERIAL_CONFIG.transmission,
      roughness: MATERIAL_CONFIG.roughness,
      clearcoat: MATERIAL_CONFIG.clearcoat,
      thickness: MATERIAL_CONFIG.thickness,
      ior: MATERIAL_CONFIG.ior,
      emissive: new THREE.Color(COLORS.tetrahedron),
      emissiveIntensity: MATERIAL_CONFIG.emissiveIntensity,
      side: THREE.DoubleSide
    })
  }), [])

  // Анимация
  useFrame((state) => {
    if (!groupRef.current) return

    const time = state.clock.elapsedTime
    const cycleTime = (time % ANIMATION_CONFIG.cycleDuration) / ANIMATION_CONFIG.cycleDuration

    // Вращение всей группы
    groupRef.current.rotation.y = time * ANIMATION_CONFIG.rotationSpeed
    groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.1

    // Плавание по вертикали
    const floatY = Math.sin(time * ANIMATION_CONFIG.floatSpeed) * ANIMATION_CONFIG.floatAmplitude
    groupRef.current.position.y = floatY

    // Определяем фазы перехода (каждая фаза занимает 1/3 цикла)
    const phase1End = 0.333
    const phase2End = 0.666

    let sphereOpacity = 0
    let cubeOpacity = 0
    let tetrahedronOpacity = 0

    if (cycleTime < phase1End) {
      // Фаза 1: Сфера → Куб
      const progress = cycleTime / phase1End
      const smooth = smoothTransition(progress)
      sphereOpacity = 1 - smooth
      cubeOpacity = smooth
      
      // Дополнительное вращение для плавности
      if (sphereRef.current) {
        sphereRef.current.rotation.x = time * 0.2
        sphereRef.current.rotation.z = time * 0.15
        sphereRef.current.scale.setScalar(1 - smooth * 0.3)
      }
      if (cubeRef.current) {
        cubeRef.current.rotation.x = time * 0.3
        cubeRef.current.rotation.y = time * 0.25
        cubeRef.current.scale.setScalar(0.7 + smooth * 0.3)
      }
    } else if (cycleTime < phase2End) {
      // Фаза 2: Куб → Тетраэдр
      const progress = (cycleTime - phase1End) / (phase2End - phase1End)
      const smooth = smoothTransition(progress)
      cubeOpacity = 1 - smooth
      tetrahedronOpacity = smooth
      
      if (cubeRef.current) {
        cubeRef.current.rotation.x = time * 0.3
        cubeRef.current.rotation.y = time * 0.25
        cubeRef.current.scale.setScalar(1 - smooth * 0.3)
      }
      if (tetrahedronRef.current) {
        tetrahedronRef.current.rotation.x = time * 0.4
        tetrahedronRef.current.rotation.z = time * 0.35
        tetrahedronRef.current.scale.setScalar(0.7 + smooth * 0.3)
      }
    } else {
      // Фаза 3: Тетраэдр → Сфера
      const progress = (cycleTime - phase2End) / (1 - phase2End)
      const smooth = smoothTransition(progress)
      tetrahedronOpacity = 1 - smooth
      sphereOpacity = smooth
      
      if (tetrahedronRef.current) {
        tetrahedronRef.current.rotation.x = time * 0.4
        tetrahedronRef.current.rotation.z = time * 0.35
        tetrahedronRef.current.scale.setScalar(1 - smooth * 0.3)
      }
      if (sphereRef.current) {
        sphereRef.current.rotation.x = time * 0.2
        sphereRef.current.rotation.z = time * 0.15
        sphereRef.current.scale.setScalar(0.7 + smooth * 0.3)
      }
    }

    // Применяем opacity к материалам
    if (sphereRef.current && materials.sphere) {
      materials.sphere.opacity = sphereOpacity
      materials.sphere.transparent = sphereOpacity < 1
    }
    if (cubeRef.current && materials.cube) {
      materials.cube.opacity = cubeOpacity
      materials.cube.transparent = cubeOpacity < 1
    }
    if (tetrahedronRef.current && materials.tetrahedron) {
      materials.tetrahedron.opacity = tetrahedronOpacity
      materials.tetrahedron.transparent = tetrahedronOpacity < 1
    }
  })

  // Обработчики взаимодействия
  const handlePointerOver = () => {
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto'
  }

  return (
    <group ref={groupRef}>
      {/* Освещение */}
      <ambientLight intensity={LIGHTING.ambient.intensity} />
      <pointLight
        position={LIGHTING.point1.position}
        intensity={LIGHTING.point1.intensity}
        color={LIGHTING.point1.color}
      />
      <pointLight
        position={LIGHTING.point2.position}
        intensity={LIGHTING.point2.intensity}
        color={LIGHTING.point2.color}
      />

      {/* Сфера */}
      <mesh
        ref={sphereRef}
        geometry={geometries.sphere}
        material={materials.sphere}
        onClick={onBack}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />

      {/* Куб */}
      <mesh
        ref={cubeRef}
        geometry={geometries.cube}
        material={materials.cube}
        onClick={onBack}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />

      {/* Тетраэдр */}
      <mesh
        ref={tetrahedronRef}
        geometry={geometries.tetrahedron}
        material={materials.tetrahedron}
        onClick={onBack}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
    </group>
  )
}
