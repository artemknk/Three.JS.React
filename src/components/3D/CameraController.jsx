/**
 * CameraController - управляет анимацией камеры при переключении между комнатами
 * Использует GSAP для плавных переходов между позициями камеры
 */
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'

// Конфигурация позиций камеры для разных сцен
const CAMERA_TARGETS = {
  main: { position: [0, 0, 15], fov: 49 },
  room0: { position: [0, 0, 6], fov: 60 },  // CircleField - ближе для лучшего обзора точек
  room1: { position: [0, 0, 5], fov: 65 },  // Room2 - еще ближе для морфинг объекта
  room2: { position: [0, 0, 8], fov: 75 },  // Room3 - партиклы, широкий обзор
  room3: { position: [0, 2, 7], fov: 70 }   // Room4 - рекурсивные структуры, немного выше
}

// Параметры анимации
const ANIMATION_DURATION = 1.5
const ANIMATION_EASE = 'power3.inOut'

export default function CameraController({ currentRoom }) {
  const { camera } = useThree()
  
  useEffect(() => {
    // Выбираем целевую позицию в зависимости от текущей комнаты
    let target
    if (currentRoom === null) {
      target = CAMERA_TARGETS.main
    } else if (currentRoom === 0) {
      target = CAMERA_TARGETS.room0 // CircleField
    } else if (currentRoom === 1) {
      target = CAMERA_TARGETS.room1 // Room2
    } else if (currentRoom === 2) {
      target = CAMERA_TARGETS.room2 // Room3
    } else if (currentRoom === 3) {
      target = CAMERA_TARGETS.room3 // Room4
    } else {
      target = CAMERA_TARGETS.room0 // По умолчанию для других комнат
    }
    
    // Анимация позиции камеры
    gsap.to(camera.position, {
      x: target.position[0],
      y: target.position[1],
      z: target.position[2],
      duration: ANIMATION_DURATION,
      ease: ANIMATION_EASE
    })
    
    // Анимация поля зрения (FOV)
    gsap.to(camera, {
      fov: target.fov,
      duration: ANIMATION_DURATION,
      onUpdate: () => camera.updateProjectionMatrix()
    })
  }, [currentRoom, camera])
  
  return null
}

