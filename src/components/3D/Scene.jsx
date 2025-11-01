/**
 * Scene - компонент основной 3D сцены
 * Создает закрытое пространство комнаты с полом, потолком и стенами
 */
import * as THREE from 'three'

// Конфигурация параметров комнаты
const ROOM_CONFIG = {
  size: 15,              // Размер комнаты (длина/ширина)
  wallThickness: 0.3,     // Толщина стен, пола и потолка
  wallColor: '#C0C0C0'   // Цвет поверхностей
}

// Параметры материала поверхностей
const WALL_MATERIAL = {
  metalness: 0.1,        // Металличность (0-1)
  envMapIntensity: 1,    // Интенсивность отражения окружения
  roughness: 0.5         // Шероховатость поверхности (0-1)
}

// Конфигурация стен комнаты (без задней стены для открытого вида)
const WALLS_CONFIG = [
  { position: [0, 0, -ROOM_CONFIG.size / 2], rotation: [0, 0, 0] },        // Задняя стена
  { position: [ROOM_CONFIG.size / 2, 0, 0], rotation: [0, Math.PI / 2, 0] }, // Правая стена
  { position: [-ROOM_CONFIG.size / 2, 0, 0], rotation: [0, -Math.PI / 2, 0] } // Левая стена
]

export default function Scene() {
  return (
    <>
      {/* Пол */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -ROOM_CONFIG.size / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[ROOM_CONFIG.size, ROOM_CONFIG.size, ROOM_CONFIG.wallThickness]} />
        <meshStandardMaterial
          color={ROOM_CONFIG.wallColor}
          metalness={WALL_MATERIAL.metalness}
          envMapIntensity={WALL_MATERIAL.envMapIntensity}
          roughness={WALL_MATERIAL.roughness}
        />
      </mesh>

      {/* Потолок */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, ROOM_CONFIG.size / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[ROOM_CONFIG.size, ROOM_CONFIG.size, ROOM_CONFIG.wallThickness]} />
        <meshStandardMaterial
          color={ROOM_CONFIG.wallColor}
          metalness={WALL_MATERIAL.metalness}
          envMapIntensity={WALL_MATERIAL.envMapIntensity}
          roughness={WALL_MATERIAL.roughness}
        />
      </mesh>

      {/* Боковые и задняя стены */}
      {WALLS_CONFIG.map((wall, idx) => (
        <mesh
          key={idx}
          position={wall.position}
          rotation={wall.rotation}
          receiveShadow
        >
          <boxGeometry args={[ROOM_CONFIG.size, ROOM_CONFIG.size, ROOM_CONFIG.wallThickness]} />
          <meshStandardMaterial
            color={ROOM_CONFIG.wallColor}
            metalness={WALL_MATERIAL.metalness}
            envMapIntensity={WALL_MATERIAL.envMapIntensity}
            roughness={WALL_MATERIAL.roughness}
          />
        </mesh>
      ))}
    </>
  )
}