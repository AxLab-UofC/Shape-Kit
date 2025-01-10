import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  shaderMaterial,
  Text,
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

const Pin = ({ position, height, id }) => {
  const groupRef = useRef();
  const geometry = useMemo(() => createBeveledBoxGeometry(1, 1, 1, 0.05), []);
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
      groupRef.current.position.y = height - 0.5;
    }
  });

  return (
    <group position={position}>
      <group ref={groupRef} position={[0, 0, 0]}>
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
        {/* <Text
          position={[0, 1, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.3}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {id}
        </Text> */}
      </group>
    </group>
  );
};

const ContainerHousing = () => {
  // Calculate dimensions based on pin layout
  const totalPinWidth = PIN_COUNT * SPACING;
  const wallThickness = 0.15;
  const baseHeight = 0.2;
  const wallHeight = 1.2;

  // Calculate total dimensions and offset

  const outerWidth = totalPinWidth  + wallThickness * 2;
  const outerDepth = totalPinWidth  + wallThickness * 2;

  const containerMaterial = new THREE.MeshStandardMaterial({
    color: '#E8E8E8', // Slightly lighter grey
    roughness: 0.7, // Good balance for shadow visibility
    metalness: 0.1, // Low metalness for better shadow contrast
    envMapIntensity: 0.2,
    receiveShadow: true,
  });

  return (
    <group position={[0.51, -1, 0.51]}>
      <group position={[0, 0, 0]}>
        {/* Base */}
        <mesh position={[0, 0, 0]} material={containerMaterial}>
          <boxGeometry args={[outerWidth, baseHeight, outerDepth]} />
        </mesh>

        {/* Front wall */}
        <mesh
          position={[0, wallHeight / 2, outerDepth / 2 - wallThickness / 2]}
          material={containerMaterial}
        >
          <boxGeometry args={[outerWidth, wallHeight, wallThickness]} />
        </mesh>

        {/* Back wall */}
        <mesh
          position={[0, wallHeight / 2, -outerDepth / 2 + wallThickness / 2]}
          material={containerMaterial}
        >
          <boxGeometry args={[outerWidth, wallHeight, wallThickness]} />
        </mesh>

        {/* Left wall */}
        <mesh
          position={[-outerWidth / 2 + wallThickness / 2, wallHeight / 2, 0]}
          material={containerMaterial}
        >
          <boxGeometry args={[wallThickness, wallHeight, outerDepth]} />
        </mesh>

        {/* Right wall */}
        <mesh
          position={[outerWidth / 2 - wallThickness / 2, wallHeight / 2, 0]}
          material={containerMaterial}
        >
          <boxGeometry args={[wallThickness, wallHeight, outerDepth]} />
        </mesh>
      </group>
    </group>
  );
};


//  // Input order from video stream
//     const inputOrder = [
//       0,9,10,19,20, // First row
//       1,8,11,18,21, // Second row
//       2,7,12,17,22, // Third row
//       3,6,13,16,23, // Fourth row
//       4,5,14,15,24, // Fifth row
//     ];

//     // Display order we want
//     const displayOrder = [
//       0,1,2,3,4, // First row
//       9,8,7,6,5, // Second row
//       10,11,12,13,14, // Third row
//       19,18,17,16,15, // Fourth row
//       20,21,22,23,24, // Fifth row
//     ];

const ShapeDisplay = ({ pinHeights }) => {
  const pins = useMemo(() => {
    const pins = [];
    const offset = ((PIN_COUNT - 1) * SPACING) / 2;

    const displayOrder = [
      0,
      1,
      2,
      3,
      4, // First row
      9,
      8,
      7,
      6,
      5, // Second row
      10,
      11,
      12,
      13,
      14, // Third row
      19,
      18,
      17,
      16,
      15, // Fourth row
      20,
      21,
      22,
      23,
      24, // Fifth row
    ];

    for (let i = 0; i < PIN_COUNT * PIN_COUNT; i++) {
      const x = i % PIN_COUNT;
      const y = Math.floor(i / PIN_COUNT);

      const posX = x * SPACING - offset;
      const posZ = y * SPACING - offset;

      // Create mapping lookup table for each display position to camera data position
      const mappingTable = {
        0: [0, 0],
        1: [0, 1],
        2: [0, 2],
        3: [0, 3],
        4: [0, 4],
        9: [1, 0],
        8: [1, 1],
        7: [1, 2],
        6: [1, 3],
        5: [1, 4],
        10: [2, 0],
        11: [2, 1],
        12: [2, 2],
        13: [2, 3],
        14: [2, 4],
        19: [3, 0],
        18: [3, 1],
        17: [3, 2],
        16: [3, 3],
        15: [3, 4],
        20: [4, 0],
        21: [4, 1],
        22: [4, 2],
        23: [4, 3],
        24: [4, 4],
      };

      const displayValue = displayOrder[i];
      const [dataX, dataY] = mappingTable[displayValue];
      const height = pinHeights[dataX][dataY] || 1;

      pins.push(
        <Pin
          key={`${x}-${y}`}
          position={[posX, 0, posZ]}
          height={height}
          id={displayValue}
        />
      );
    }

    return pins;
  }, [pinHeights]);

  return (
    <Canvas style={{ width: '100%', height: '100%' }}>
      <PerspectiveCamera makeDefault position={[7, 7, 7]} fov={50} />
      <color attach="background" args={['#f0f0f0']} />
      <ambientLight intensity={1.7} />
      <directionalLight position={[3, 8, 4]} intensity={1.8} />
      <directionalLight position={[-5, 3, -5]} intensity={0.2} />
      <group position={[0, 0, 0]}>
        <ContainerHousing />
        {pins}
      </group>
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
