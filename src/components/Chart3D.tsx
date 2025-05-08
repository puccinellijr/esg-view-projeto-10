
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

interface PieChartProps {
  value1: number;
  value2: number;
  category: 'environmental' | 'governance' | 'social';
}

interface BarChartProps {
  value1: number;
  value2: number;
  category: 'environmental' | 'governance' | 'social';
}

// Componente 3D para Gráfico de Pizza
const Pie3D: React.FC<PieChartProps> = ({ value1, value2, category }) => {
  const groupRef = useRef<THREE.Group>(null);
  const total = value1 + value2;
  const angle1 = (value1 / total) * Math.PI * 2;
  
  // Definir cores mais contrastantes baseadas na categoria
  const getCategoryColors = () => {
    switch (category) {
      case 'environmental':
        return { color1: '#34D399', color2: '#047857' }; // Verde claro e verde escuro
      case 'governance':
        return { color1: '#60A5FA', color2: '#1E40AF' }; // Azul claro e azul escuro
      case 'social':
        return { color1: '#F472B6', color2: '#BE185D' }; // Rosa claro e rosa escuro
      default:
        return { color1: '#34D399', color2: '#047857' };
    }
  };

  const { color1, color2 } = getCategoryColors();
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Primeiro segmento do gráfico */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[1, 1, 0.2, 32, 1, false, 0, angle1]} />
        <meshStandardMaterial color={color1} />
      </mesh>
      
      {/* Segundo segmento do gráfico */}
      <mesh position={[0, 0, 0]} rotation={[0, angle1, 0]}>
        <cylinderGeometry args={[1, 1, 0.2, 32, 1, false, 0, Math.PI * 2 - angle1]} />
        <meshStandardMaterial color={color2} />
      </mesh>
      
      {/* Legendas melhoradas */}
      <Text position={[0, 0.5, 0]} 
            rotation={[-Math.PI / 2, 0, 0]} 
            color="black" 
            fontSize={0.18}
            fontWeight="bold"
            anchorX="center" 
            anchorY="middle">
        {`Período 1: ${(value1 / total * 100).toFixed(1)}%`}
      </Text>
      
      <Text position={[0, 0.3, 0]} 
            rotation={[-Math.PI / 2, 0, 0]} 
            color="black" 
            fontSize={0.18}
            fontWeight="bold"
            anchorX="center" 
            anchorY="middle">
        {`Período 2: ${(value2 / total * 100).toFixed(1)}%`}
      </Text>
    </group>
  );
};

// Componente 3D para Gráfico de Barras
const Bars3D: React.FC<BarChartProps> = ({ value1, value2, category }) => {
  const groupRef = useRef<THREE.Group>(null);
  const maxValue = Math.max(value1, value2);
  const normalizedValue1 = value1 / maxValue;
  const normalizedValue2 = value2 / maxValue;
  
  // Definir cores mais contrastantes baseadas na categoria
  const getCategoryColors = () => {
    switch (category) {
      case 'environmental':
        return { color1: '#34D399', color2: '#047857' }; // Verde claro e verde escuro
      case 'governance':
        return { color1: '#60A5FA', color2: '#1E40AF' }; // Azul claro e azul escuro
      case 'social':
        return { color1: '#F472B6', color2: '#BE185D' }; // Rosa claro e rosa escuro
      default:
        return { color1: '#34D399', color2: '#047857' };
    }
  };

  const { color1, color2 } = getCategoryColors();
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Primeira barra */}
      <mesh position={[-0.6, normalizedValue1 / 2, 0]}>
        <boxGeometry args={[0.4, normalizedValue1, 0.4]} />
        <meshStandardMaterial color={color1} />
      </mesh>
      
      {/* Segunda barra */}
      <mesh position={[0.6, normalizedValue2 / 2, 0]}>
        <boxGeometry args={[0.4, normalizedValue2, 0.4]} />
        <meshStandardMaterial color={color2} />
      </mesh>
      
      {/* Legendas melhoradas */}
      <Text position={[-0.6, normalizedValue1 + 0.2, 0]} 
            color="black" 
            fontSize={0.18}
            fontWeight="bold"
            anchorX="center" 
            anchorY="middle">
        {`P1: ${value1.toFixed(2)}`}
      </Text>
      
      <Text position={[0.6, normalizedValue2 + 0.2, 0]} 
            color="black" 
            fontSize={0.18}
            fontWeight="bold"
            anchorX="center" 
            anchorY="middle">
        {`P2: ${value2.toFixed(2)}`}
      </Text>
    </group>
  );
};

export const PieChart3D: React.FC<PieChartProps> = (props) => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 2, 4], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <PresentationControls
          global
          config={{ mass: 2, tension: 500 }}
          snap={{ mass: 4, tension: 1500 }}
          rotation={[0, 0, 0]}
          polar={[-Math.PI / 3, Math.PI / 3]}
          azimuth={[-Math.PI / 1.4, Math.PI / 2]}>
          <Pie3D {...props} />
        </PresentationControls>
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
};

export const BarChart3D: React.FC<BarChartProps> = (props) => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 1, 4], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <PresentationControls
          global
          config={{ mass: 2, tension: 500 }}
          snap={{ mass: 4, tension: 1500 }}
          rotation={[0, 0, 0]}
          polar={[-Math.PI / 3, Math.PI / 3]}
          azimuth={[-Math.PI / 1.4, Math.PI / 2]}>
          <Bars3D {...props} />
        </PresentationControls>
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
};

interface Chart3DProps {
  type: 'pie' | 'bar';
  value1: number;
  value2: number;
  category: 'environmental' | 'governance' | 'social';
}

const Chart3D: React.FC<Chart3DProps> = ({ type, value1, value2, category }) => {
  return (
    <>
      {type === 'pie' ? (
        <PieChart3D value1={value1} value2={value2} category={category} />
      ) : (
        <BarChart3D value1={value1} value2={value2} category={category} />
      )}
    </>
  );
};

export default Chart3D;
