/**
 * FloatingBlocks - компонент плавающих интерактивных блоков навигации
 * Блоки анимируются и используются для перехода между комнатами
 */
import { useFrame } from '@react-three/fiber'
import { useRef, useMemo, useCallback } from 'react'
import * as THREE from 'three'

// Конфигурация блоков навигации
const BLOCKS = [
  { basePosition: [-3, 3, -5], size: [5, 5, 0.3] },
  { basePosition: [3, 3, -6], size: [6, 6, 0.3] },
  { basePosition: [-3, -3, -4], size: [4.5, 4.5, 0.3] },
  { basePosition: [3, -3, -5], size: [5, 5, 0.3] }
]

// Параметры анимации
const ANIMATION_CONFIG = {
  horizontalSpeed: 0.3,      // Скорость горизонтального движения
  verticalSpeed: 0.5,        // Скорость вертикального движения
  rotationSpeed: 0.2,        // Скорость вращения
  horizontalAmplitude: 0.5,  // Амплитуда горизонтального движения
  verticalAmplitude: 0.5,    // Амплитуда вертикального движения
  rotationAmplitude: 0.1,    // Амплитуда вращения
  verticalOffset: 2,         // Смещение по вертикали между блоками
  phaseOffset: 1             // Фазовое смещение
}

// Параметры материала стеклянного эффекта
const GLASS_MATERIAL = {
  transmission: 0.97,
  roughness: 0.2,
  thickness: 1.2,
  clearcoat: 1,
  envMapIntensity: 1.2,
  emissiveIntensity: 0.4
}

// Позиция группы блоков
const GROUP_POSITION = [0, 0, 6]

export default function FloatingBlocks({ onBlockClick }) {
  const groupRef = useRef()

  // Инициализация позиций блоков
  const positions = useMemo(
    () => BLOCKS.map(block => new THREE.Vector3(...block.basePosition)),
    []
  )

  // Обработчик изменения курсора при наведении
  const handlePointerOver = useCallback(() => {
    document.body.style.cursor = 'pointer'
  }, [])

  const handlePointerOut = useCallback(() => {
    document.body.style.cursor = 'auto'
  }, [])

  // Анимация блоков каждый кадр
  useFrame((state) => {
    if (!groupRef.current) return

    const time = state.clock.elapsedTime
    const { 
      horizontalSpeed, 
      verticalSpeed, 
      rotationSpeed,
      horizontalAmplitude,
      verticalAmplitude,
      rotationAmplitude,
      verticalOffset,
      phaseOffset
    } = ANIMATION_CONFIG

    // Общее горизонтальное движение для всех блоков
    const horizontalOffset = Math.sin(time * horizontalSpeed) * horizontalAmplitude

    groupRef.current.children.forEach((block, idx) => {
      const blockConfig = BLOCKS[idx]
      
      // Вертикальное движение с индивидуальным смещением
      const verticalOffsetY = Math.sin(time * verticalSpeed + idx * verticalOffset) * verticalAmplitude
      
      // Вращение по оси Z
      const rotationOffsetZ = Math.cos(time * horizontalSpeed + idx * phaseOffset) * rotationAmplitude

      // Применяем анимацию
      block.position.x = blockConfig.basePosition[0] + horizontalOffset
      block.position.y = blockConfig.basePosition[1] + verticalOffsetY
      block.rotation.x = Math.sin(time * rotationSpeed + idx * phaseOffset) * rotationAmplitude
      block.rotation.z = rotationOffsetZ
    })
  })

  return (
    <group ref={groupRef} position={GROUP_POSITION}>
      {BLOCKS.map((block, idx) => (
        <mesh
          key={idx}
          position={positions[idx]}
          castShadow
          receiveShadow
          onClick={() => onBlockClick(idx)}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <boxGeometry args={block.size} />
          <meshPhysicalMaterial
            transmission={GLASS_MATERIAL.transmission}
            roughness={GLASS_MATERIAL.roughness}
            thickness={GLASS_MATERIAL.thickness}
            clearcoat={GLASS_MATERIAL.clearcoat}
            envMapIntensity={GLASS_MATERIAL.envMapIntensity}
            emissiveIntensity={GLASS_MATERIAL.emissiveIntensity}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}