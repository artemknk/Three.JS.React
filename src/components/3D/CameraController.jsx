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
  room: { position: [0, 10, 10], fov: 20 }
}

// Параметры анимации
const ANIMATION_DURATION = 1.5
const ANIMATION_EASE = 'power3.inOut'

export default function CameraController({ currentRoom }) {
  const { camera } = useThree()
  
  useEffect(() => {
    // Выбираем целевую позицию в зависимости от текущей комнаты
    const target = currentRoom === null 
      ? CAMERA_TARGETS.main 
      : CAMERA_TARGETS.room
    
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

