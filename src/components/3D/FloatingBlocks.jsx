import { useFrame } from '@react-three/fiber'
import React from 'react'
import * as THREE from 'three'

const BLOCKS = [
  { 
    basePosition: [-3, 3, -5], size: [5, 5, 0.3], 
  },
  { 
    basePosition: [3, 3, -6], size: [6, 6, 0.3],
  },
  { 
    basePosition: [-3, -3, -4], size: [4.5, 4.5, 0.3], 
  },
  { 
    basePosition: [3, -3, -5], size: [5, 5, 0.3], 
  }
]

export default function FloatingBlocks() {
  const groupRef = React.useRef()

  const positions = React.useMemo(() => BLOCKS.map(block => new THREE.Vector3(...block.basePosition)), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const sinTime03 = Math.sin(time * 0.3) * 0.5;
    
    groupRef.current.children.forEach((block, idx) => {
      const sinTime05 = Math.sin(time * 0.5 + idx * 2) * 0.5;
      const cosTime015 = Math.cos(time * 0.3 + idx) * 0.1;

      block.position.x = BLOCKS[idx].basePosition[0] + sinTime03;
      block.position.y = BLOCKS[idx].basePosition[1] + sinTime05;
      block.rotation.x = Math.sin(time * 0.2 + idx) * 0.1;
      block.rotation.z = cosTime015;
    });
  })

  return (
    <group ref={groupRef} position={[0, 0, 6]}>
      {BLOCKS.map((block, idx) => (
        <mesh
          key={idx}
          position={positions[idx]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={block.size} />
          <meshPhysicalMaterial
            color={block.color}
            transmission={0.97}
            roughness={0.2}
            thickness={1.2}
            clearcoat={1}
            envMapIntensity={1.2}
            emissive={block.color}
            emissiveIntensity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}