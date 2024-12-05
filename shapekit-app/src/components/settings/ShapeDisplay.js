import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  shaderMaterial,
} from '@react-three/drei';
import * as THREE from 'three';
import {
  EffectComposer,
  Bloom,
  DepthOfField,
} from '@react-three/postprocessing';

const PIN_COUNT = 5;
const SPACING = 1.05;

const GradientLineMaterial = shaderMaterial(
  {
    topColor: new THREE.Color(0xffff50),
    bottomColor: new THREE.Color(0x000000),
  },
  // Vertex Shader
  `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    varying vec3 vPosition;
    void main() {
      float y = (vPosition.y + 0.5) / 1.0; // Normalize y position
      gl_FragColor = vec4(mix(bottomColor, topColor, y), 1.0);
    }
  `
);

extend({ GradientLineMaterial });

const createBeveledBoxGeometry = (width, height, depth, bevelSize) => {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0, width);
  shape.lineTo(width, width);
  shape.lineTo(width, 0);
  shape.lineTo(0, 0);

  const extrudeSettings = {
    steps: 1,
    depth: height,
    bevelEnabled: true,
    bevelThickness: bevelSize,
    bevelSize: bevelSize,
    bevelOffset: -bevelSize,
    bevelSegments: 4,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.rotateX(Math.PI / 2);
  return geometry;
};


const Pin = ({ position, height }) => {
  const groupRef = useRef();
  // Create a fixed-height geometry (say 1 unit tall)
  const geometry = useMemo(
    () => createBeveledBoxGeometry(1, 1, 1, 0.05),
    [] // Remove height dependency
  );
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#FFE500',
        roughness: 1,
        metalness: 0.0,
        clearcoat: 0,
        clearcoatRoughness: 0,
        reflectivity: 0.1,
      }),
    []
  );

  useFrame(() => {
    if (groupRef.current) {
      // Just update the Y position based on height
      groupRef.current.position.y = height - 0.5; // Subtract 0.5 to center the pin
    }
  });

  return (
    <group position={position}>
      <group ref={groupRef} position={[0, 0, 0]}>
        {' '}
        {/* Remove initial Y offset */}
        <mesh
          geometry={geometry}
          material={material}
          castShadow
          receiveShadow
        />
        <lineSegments>
          <edgesGeometry args={[geometry]} />
          <gradientLineMaterial
            topColor={new THREE.Color(0xffe500)}
            bottomColor={new THREE.Color(0xa78c00)}
            transparent
            opacity={0.8}
          />
        </lineSegments>
      </group>
    </group>
  );
};

const ShapeDisplay = ({ pinHeights }) => {
  const pins = useMemo(() => {
    const pins = [];
    const offset = ((PIN_COUNT - 1) * SPACING) / 2;
    const outputCubes = [
      0, 5, 10, 15, 20, 21, 16, 11, 6, 1, 2, 7, 12, 17, 22, 23, 18, 13, 8, 3, 4,
      9, 14, 19, 24,
    ];

    for (let i = 0; i < PIN_COUNT * PIN_COUNT; i++) {
      const x = Math.floor(outputCubes[i] / PIN_COUNT);
      const y = outputCubes[i] % PIN_COUNT;
      const height = pinHeights[x][y] || 1; // Use default height if not set

      pins.push(
        <Pin
          key={`${x}-${y}`}
          position={[y * SPACING - offset, 0, x * SPACING - offset]}
          height={height}
        />
      );
    }

    return pins;
  }, [pinHeights]);

  return (
    <Canvas style={{ width: '100%', height: '100%' }}>
      <PerspectiveCamera makeDefault position={[7, 7, 7]} fov={50} />
      <color attach="background" args={['#f0f0f0']} />
      <ambientLight intensity={1.9} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <group position={[0, 0, 0]}>{pins}</group>
      <OrbitControls
        enableRotate={true}
        enablePan={false}
        maxDistance={20}
        minDistance={5}
      />
      <EffectComposer>
        <DepthOfField
          focusDistance={0.01}
          focalLength={0.2}
          bokehScale={2}
          height={500}
        />
        <Bloom
          intensity={0.15}
          luminanceThreshold={0.7}
          luminanceSmoothing={0.1}
        />
      </EffectComposer>
    </Canvas>
  );
};

export default ShapeDisplay;
