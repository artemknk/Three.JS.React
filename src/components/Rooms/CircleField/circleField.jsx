/**
 * CircleField - комната с анимированным полем точек
 * Точки формируют волнообразную поверхность, которая вращается и изменяется со временем
 */
import * as THREE from 'three'
import { useFrame, useLoader } from '@react-three/fiber'
import { Suspense, useCallback, useMemo, useRef } from 'react'
import CircleImg from '/textures/circle.png'

// Параметры генерации точек
const POINTS_CONFIG = {
  count: 100,        // Количество точек по каждой оси
  step: 0.2,        // Расстояние между точками
  frequency: 0.01,   // Частота волны
  amplitude: 0.5,      // Амплитуда волны
  timeMultiplier: 20 // Множитель времени для анимации
}

// Параметры вращения
const ROTATION_CONFIG = {
  speed: 0.01 // Скорость вращения поля точек
}

// Параметры материала точек
const POINTS_MATERIAL = {
  color: 0x00AAFF,
  size: 0.3,
  alphaTest: 0.1,
  opacity: 1.0
}

// Параметры освещения
const LIGHTING = {
  ambient: { intensity: 0.5 },
  point: { position: [10, 10, 10], intensity: 1 }
}

/**
 * Компонент Points - визуализация волнообразного поля точек
 */
function Points({ onBack }) {
  const imgTexture = useLoader(THREE.TextureLoader, CircleImg)
  const bufferRef = useRef()
  const pointsRef = useRef()
  const timeRef = useRef(0)

  const { count, step, frequency, amplitude, timeMultiplier } = POINTS_CONFIG
  const { speed: rotationSpeed } = ROTATION_CONFIG

  /**
   * Функция графика для вычисления высоты точки на основе координат x и z
   * @param {number} x - координата X
   * @param {number} z - координата Z
   * @returns {number} высота точки Y
   */
  const graph = useCallback((x, z) => {
    return Math.sin(frequency * (x ** 3 + z ** 2 + timeRef.current)) * amplitude
  }, [frequency, amplitude])

  // Инициализация позиций точек
  const positions = useMemo(() => {
    const positionsArray = []
    const halfCount = count / 2

    for (let xi = 0; xi < count; xi++) {
      for (let zi = 0; zi < count; zi++) {
        const x = step * (xi - halfCount)
        const z = step * (zi - halfCount)
        const y = graph(x, z)
        positionsArray.push(x, y, z)
      }
    }

    return new Float32Array(positionsArray)
  }, [count, step, graph])

  // Анимация точек каждый кадр
  useFrame(({ clock }) => {
    if (!bufferRef.current || !pointsRef.current) return

    timeRef.current = clock.getElapsedTime() * timeMultiplier

    const positions = bufferRef.current.array
    const quarterCount = count / 4
    let i = 0

    // Обновляем Y координаты для создания волнового эффекта
    for (let xi = 0; xi < count; xi++) {
      for (let zi = 0; zi < count; zi++) {
        const x = step * (xi - quarterCount)
        const z = step * (zi - quarterCount)
        positions[i + 1] = graph(x, z) // Обновляем Y (индекс 1)
        i += 3 // Переходим к следующей точке (x, y, z)
      }
    }

    bufferRef.current.needsUpdate = true
    pointsRef.current.rotation.y = clock.getElapsedTime() * rotationSpeed
  })

  // Обработчики взаимодействия
  const handlePointerOver = () => {
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto'
  }

  return (
    <group>
      {/* Поле точек с волновым эффектом */}
      <points ref={pointsRef}>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            ref={bufferRef}
            attach="attributes-position"
            array={positions}
            count={positions.length / 3} // Исправлено: каждая точка имеет 3 координаты (x, y, z)
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          attach="material"
          map={imgTexture}
          color={POINTS_MATERIAL.color}
          size={POINTS_MATERIAL.size}
          sizeAttenuation
          transparent
          alphaTest={POINTS_MATERIAL.alphaTest}
          opacity={POINTS_MATERIAL.opacity}
        />
      </points>

      {/* Невидимая плоскость для обработки кликов (возврат на главную сцену) */}
      <mesh
        position={[0, 0, 0]}
        onClick={onBack}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry args={[count * step, count * step]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Освещение сцены */}
      <ambientLight intensity={LIGHTING.ambient.intensity} />
      <pointLight position={LIGHTING.point.position} intensity={LIGHTING.point.intensity} />
    </group>
  )
}

/**
 * CircleField - главный компонент комнаты с полем точек
 */
export default function CircleField({ onBack }) {
  return (
    <Suspense fallback={null}>
      <Points onBack={onBack} />
    </Suspense>
  )
}