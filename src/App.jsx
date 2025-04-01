import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import Scene from './components/3D/Scene'
import FloatingBlocks from './components/3D/FloatingBlocks'
import BackgroundSphere from './components/3D/BackgroundSphere'

export default function App() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      background: '#222' // Фон за пределами canvas
    }}>
      <Canvas
        shadows
        camera={{
          position: [0, 0, 15],
          fov: 49,
          near: 0.9,
          far: 50
        }}
      >
        <Suspense fallback={null}>
          <Scene />
          <FloatingBlocks />
          <BackgroundSphere />
        </Suspense>
      </Canvas>
    </div>
  )
}