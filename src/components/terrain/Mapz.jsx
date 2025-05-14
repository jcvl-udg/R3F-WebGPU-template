import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react'
import { RigidBody } from '@react-three/rapier'
import { useThree, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { createNoise2D } from 'simplex-noise'
import Papa from 'papaparse'

// Modified Flower component with stable position
const Flower = React.memo(({  position ,size, height, color, userData }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} userData={userData}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
})

const PlantInfo = ({ plant }) => {
  if (!plant) return null
  
  return (
    <Html position={[0, 2, 0]}>
      <div style={{ 
        background: "white", 
        padding: "10px", 
        borderRadius: "5px",
        minWidth: "200px"
      }}>
        <h3>{plant.nombreCientifico_snib || "Unknown Plant"}</h3>
        <p>Family: {plant.familia_snib || "Unknown Family"}</p>
      </div>
    </Html>
  )
}

const Terrain = ({ model }) => {
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const { camera, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);
  const dokmnt = "csv/SNIB-P083_muestra.csv";

  // Memoized terrain generation
  const { terrain, terrainMesh, colliderHeights } = useMemo(() => {
    const width = 100, height = 100;
    const noise2D = createNoise2D();
    const terrainData = [];
    const heights = [];

    for (let x = 0; x < width; x++) {
      terrainData[x] = [];
      for (let y = 0; y < height; y++) {
        // Base terrain (large scale)
        const baseScale = 30;
        let elevation = noise2D(x / baseScale, y / baseScale) * 3;

        // Add medium details
        const mediumScale = 15;
        elevation += noise2D(x / mediumScale, y / mediumScale) * 1.5;

        // Add fine details
        const fineScale = 7;
        elevation += noise2D(x / fineScale, y / fineScale) * 0.5;

        // Mountain generation
        const mountainFactor = Math.max(0, noise2D(x / 50, y / 50) - 0.5) * 2;
        if (mountainFactor > 0) {
          elevation += mountainFactor * 8;
          const peakFactor = Math.max(0, noise2D(x / 8, y / 8) - 0.8) * 1;
          elevation += peakFactor * 3;
        }

        // Flatten walkable areas
        const flatness = Math.max(0, noise2D(x / 30, y / 30) - 0.3) * 3;
        if (flatness > 0) {
          elevation *= 0.2;
        }

        terrainData[x][y] = elevation;
        heights.push(elevation);
      }
    }

    // Create terrain mesh
    const geometry = new THREE.PlaneGeometry(width, height, width - 1, height - 1);
    const vertices = geometry.attributes.position.array;

    for (let i = 0; i < vertices.length; i += 3) {
      const j = i / 3;
      const x = Math.floor(j / width);
      const y = j % width;
      vertices[i + 1] = terrainData[x][y]; // Set Y position for height
    }

    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      wireframe: false,
      flatShading: true
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;

    return {
      terrain: terrainData,
      terrainMesh: mesh,
      colliderHeights: heights
    };
  }, []);

  // Stable flower positions
  const flowerModels = useMemo(() => {
    if (!plants?.length) return [];
    
    const uniquePlants = plants.reduce((acc, plant) => {
      if (plant.nombreCientifico_snib && !acc.some(p => p.nombreCientifico_snib === plant.nombreCientifico_snib)) {
        acc.push(plant);
      }
      return acc;
    }, []);

    return uniquePlants.map((plant, index) => {
      let x, y, z, attempts = 0;
      do {
        x = Math.floor(Math.random() * 100);
        y = Math.floor(Math.random() * 100);
        z = terrain[x][y];
        attempts++;
      } while ((Math.abs(z) > 3 || z < 0) && attempts < 50);

      if (attempts >= 50) return null;

      return (
        <group 
          key={`flower-${plant.id || index}`}
          position={[x - 50, z, y - 50]}
        >
          <Flower
            size={0.3}
            height={0.5 + Math.random() * 0.5}
            color={getColorFromPlantData(plant)}
            userData={{ index }}
          />
        </group>
      );
    }).filter(Boolean);
  }, [plants, terrain]);

  // Stable click handler
  const handleClick = useCallback((event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const plantMesh = intersects[0].object;
      setSelectedPlant(plants[plantMesh.userData.index]);
    } else {
      setSelectedPlant(null);
    }
  }, [camera, scene, plants]);

  useEffect(() => {
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [handleClick]);

  useEffect(() => {
    fetch(dokmnt)
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => setPlants(results.data)
        });
      });
  }, []);

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <primitive object={terrainMesh} />
      {flowerModels}
      {selectedPlant && <PlantInfo plant={selectedPlant} />}
    </RigidBody>
  );
};

const getColorFromPlantData = (plant) => {
  const colors = {
    'Rosaceae': '#FF5252',
    'Orchidaceae': '#9C27B0',
    'Asteraceae': '#FF9800',
    'default': '#4CAF50'
  };
  return colors[plant.familia_snib] || colors.default;
};

export default Terrain
export const TerrainComponent = Terrain;