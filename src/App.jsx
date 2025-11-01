/**
 * App - главный компонент приложения
 * Управляет навигацией между 3D сценами и комнатами
 */
import { Canvas } from '@react-three/fiber'
import { Suspense, useState } from 'react'
import Scene from './components/3D/Scene'
import FloatingBlocks from './components/3D/FloatingBlocks'
import BackgroundSphere from './components/3D/BackgroundSphere'
import CameraController from './components/3D/CameraController'
import Room1 from './components/Rooms/CircleField/circleField'
import Room2 from './components/Rooms/Room2/Room2'

// Константы камеры по умолчанию
const DEFAULT_CAMERA = {
  position: [0, 0, 15],
  fov: 49,
  near: 0.9,
  far: 50
}

// Стили для основного контейнера
const containerStyle = {
  width: '100vw',
  height: '100vh',
  background: '#222'
}

export default function App() {
  const [currentRoom, setCurrentRoom] = useState(null)

  /**
   * Обработчик переключения комнаты
   * @param {number} roomIndex - индекс комнаты для отображения
   */
  const handleRoomChange = (roomIndex) => {
    setCurrentRoom(roomIndex)
  }

  /**
   * Обработчик возврата на главную сцену
   */
  const handleBack = () => {
    setCurrentRoom(null)
  }

  return (
    <div style={containerStyle}>
      <Canvas
        shadows
        camera={DEFAULT_CAMERA}
      >
        <Suspense fallback={null}>
          <CameraController currentRoom={currentRoom} />
          
          {currentRoom === null ? (
            // Главная сцена с блоками навигации
            <>
              <Scene />
              <FloatingBlocks onBlockClick={handleRoomChange} />
              <BackgroundSphere />
            </>
          ) : (
            // Отображение выбранной комнаты
            <>
              {currentRoom === 0 && <Room1 onBack={handleBack} />}
              {currentRoom === 1 && <Room2 onBack={handleBack} />}
              {/* Готово для расширения дополнительными комнатами:
                  {currentRoom === 2 && <Room3 onBack={handleBack} />}
                  {currentRoom === 3 && <Room4 onBack={handleBack} />}
              */}
            </>
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}