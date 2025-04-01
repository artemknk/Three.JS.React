import * as THREE from 'three'

const ROOM_CONFIG = {
  size: 15,
  wallThickness: 0.3,
  wallColor: '#C0C0C0'
}

export default function Scene() {
  return (
    <>
      {/* Пол */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -ROOM_CONFIG.size/2, 0]}
        receiveShadow
      >
        <boxGeometry args={[ROOM_CONFIG.size, ROOM_CONFIG.size, ROOM_CONFIG.wallThickness]} />
        <meshStandardMaterial 
          color={ROOM_CONFIG.wallColor}
          metalness={0.1}
          envMapIntensity={1}
          roughness={0.5}
        />
      </mesh>
      {/* Потолок */}
      <mesh 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[0, ROOM_CONFIG.size/2, 0]}
        receiveShadow
      >
        <boxGeometry args={[ROOM_CONFIG.size, ROOM_CONFIG.size, ROOM_CONFIG.wallThickness]} />
        <meshStandardMaterial 
          color={ROOM_CONFIG.wallColor}
          metalness={0.1}
          envMapIntensity={1}
          roughness={0.5}
        />
      </mesh>
      {/* Стены */}
      {[
        { position: [0, 0, -ROOM_CONFIG.size/2], rotation: [0, 0, 0] },
        { position: [ROOM_CONFIG.size/2, 0, 0], rotation: [0, Math.PI/2, 0] },
        { position: [-ROOM_CONFIG.size/2, 0, 0], rotation: [0, -Math.PI/2, 0] }
      ].map((wall, idx) => (
        <mesh
          key={idx}
          position={wall.position}
          rotation={wall.rotation}
          receiveShadow
        >
          <boxGeometry args={[ROOM_CONFIG.size, ROOM_CONFIG.size, ROOM_CONFIG.wallThickness]} />
          <meshStandardMaterial 
          color={ROOM_CONFIG.wallColor}
          metalness={0.1}
          envMapIntensity={1}
          roughness={0.5}
          />
        </mesh>
      ))}
    </>
  )
}