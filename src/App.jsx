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
// Импорт комнат
import Room1 from './components/Rooms/CircleField/circleField'  // Волнообразное поле точек
import Room2 from './components/Rooms/Room2/Room2'              // Морфинг фигур
import Room3 from './components/Rooms/Room3/Room3'              // Партикловая система
import Room4 from './components/Rooms/Room4/Room4'              // Рекурсивные структуры

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
              {/* Room 0: CircleField - Волнообразное поле точек */}
              {currentRoom === 0 && <Room1 onBack={handleBack} />}
              
              {/* Room 1: Morphing Shapes - Плавное превращение фигур */}
              {currentRoom === 1 && <Room2 onBack={handleBack} />}
              
              {/* Room 2: Interactive Particles - Партикловая система с физикой */}
              {currentRoom === 2 && <Room3 onBack={handleBack} />}
              
              {/* Room 3: Recursive Structures - Рекурсивные геометрические инсталляции */}
              {currentRoom === 3 && <Room4 onBack={handleBack} />}
            </>
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}