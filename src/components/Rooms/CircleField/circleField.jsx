import * as THREE from 'three';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Suspense, useCallback, useMemo, useRef } from 'react';
import CircleImg from '../assets/circle.png';

function Points() {
  const imgTexture = useLoader(THREE.TextureLoader, CircleImg);
  const bufferRef = useRef();

  let t = useRef(0);
  let f = 0.001;
  let a = 4;

  const graph = useCallback((x, z) => {
    return Math.sin(f * (x ** 2 + z ** 2 + t.current)) * a;
  }, [f, a]);

  const count = 500;
  const step = 0.5;

  let positions = useMemo(() => {
    let positions = [];
    for (let xi = 0; xi < count; xi++) {
      for (let zi = 0; zi < count; zi++) {
        let x = step * (xi - count / 2);
        let z = step * (zi - count / 2);
        let y = graph(x, z);
        positions.push(x, y, z);
      }
    }
    return new Float32Array(positions);
  }, [count, step, graph]);

  useFrame(() => {
    t.current += 20;
    const positions = bufferRef.current.array;
    let i = 0;
    for (let xi = 0; xi < count; xi++) {
      for (let zi = 0; zi < count; zi++) {
        let x = step * (xi - count / 2);
        let z = step * (zi - count / 2);
        positions[i + 1] = graph(x, z);
        i += 3;
      }
    }

    bufferRef.current.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          ref={bufferRef}
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        attach="material"
        map={imgTexture}
        color={0x00AAFF}
        size={1}
        sizeAttenuation
        transparent={false}
        alphaTest={0.5}
        opacity={1.0}
      />
    </points>
  );
}

export default function AnimationCanvas() {
  return (
    <Canvas
      style={{ width: "100vw", height: "100vh" }}
      camera={{ position: [0, 110, 60], fov: 50 }}
    >
      <Suspense fallback={null}>
        <Points />
      </Suspense>
    </Canvas>
  );
}