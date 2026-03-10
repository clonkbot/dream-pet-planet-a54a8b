import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Stars, Float, Cloud, Html, ContactShadows } from '@react-three/drei'
import { Suspense, useState, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Types
interface DreamPet {
  id: number
  name: string
  color: string
  secondaryColor: string
  position: [number, number, number]
  happiness: number
  type: 'blob' | 'bunny' | 'spirit' | 'crystal'
  isEvolved: boolean
}

interface BiomeData {
  name: string
  color: string
  accentColor: string
  groundColor: string
}

// Pastel color palette
const PASTEL_COLORS = [
  '#FFB5E8', '#B5DEFF', '#DCD3FF', '#BFFCC6', '#FFC9DE',
  '#FFDAC1', '#E2F0CB', '#C7CEEA', '#FF9CEE', '#AFF8DB'
]

const BIOMES: BiomeData[] = [
  { name: 'Glowing Forest', color: '#BFFCC6', accentColor: '#85E89D', groundColor: '#2D4739' },
  { name: 'Crystal Lake', color: '#B5DEFF', accentColor: '#79C0FF', groundColor: '#1E3A5F' },
  { name: 'Cloud Mountain', color: '#DCD3FF', accentColor: '#A5A0FF', groundColor: '#3D3358' },
  { name: 'Flower Valley', color: '#FFB5E8', accentColor: '#FF79C6', groundColor: '#4A2940' }
]

// Generate random pets
function generatePets(count: number): DreamPet[] {
  const petNames = ['Puffles', 'Sparkle', 'Cloudy', 'Boba', 'Mochi', 'Luna', 'Starry', 'Bubbles', 'Dewdrop', 'Glimmer', 'Wispy', 'Coral', 'Peach', 'Berry', 'Misty']
  const types: DreamPet['type'][] = ['blob', 'bunny', 'spirit', 'crystal']

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: petNames[Math.floor(Math.random() * petNames.length)],
    color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
    secondaryColor: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
    position: [
      (Math.random() - 0.5) * 8,
      0.3 + Math.random() * 0.5,
      (Math.random() - 0.5) * 8
    ] as [number, number, number],
    happiness: 50 + Math.floor(Math.random() * 50),
    type: types[Math.floor(Math.random() * types.length)],
    isEvolved: Math.random() > 0.8
  }))
}

// Cute blob creature component
function BlobCreature({ pet, onClick }: { pet: DreamPet; onClick: () => void }) {
  const groupRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = pet.position[1] + Math.sin(state.clock.elapsedTime * 2 + pet.id) * 0.1
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + pet.id) * 0.2
    }
  })

  const scale = hovered ? 1.15 : 1

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group
        ref={groupRef}
        position={pet.position}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={scale}
      >
        {/* Body */}
        <mesh castShadow>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial
            color={pet.color}
            roughness={0.3}
            metalness={0.1}
            emissive={pet.color}
            emissiveIntensity={pet.isEvolved ? 0.3 : 0.1}
          />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.1, 0.1, 0.3]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh position={[0.1, 0.1, 0.3]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>

        {/* Eye highlights */}
        <mesh position={[-0.08, 0.13, 0.36]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.12, 0.13, 0.36]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>

        {/* Blush */}
        <mesh position={[-0.22, 0, 0.25]} rotation={[0, 0.3, 0]}>
          <circleGeometry args={[0.06, 16]} />
          <meshStandardMaterial color="#FF9CEE" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.22, 0, 0.25]} rotation={[0, -0.3, 0]}>
          <circleGeometry args={[0.06, 16]} />
          <meshStandardMaterial color="#FF9CEE" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>

        {/* Ears if evolved */}
        {pet.isEvolved && (
          <>
            <mesh position={[-0.2, 0.35, 0]} rotation={[0, 0, -0.3]}>
              <coneGeometry args={[0.1, 0.25, 8]} />
              <meshStandardMaterial color={pet.secondaryColor} />
            </mesh>
            <mesh position={[0.2, 0.35, 0]} rotation={[0, 0, 0.3]}>
              <coneGeometry args={[0.1, 0.25, 8]} />
              <meshStandardMaterial color={pet.secondaryColor} />
            </mesh>
          </>
        )}

        {/* Glow effect */}
        {hovered && (
          <pointLight color={pet.color} intensity={2} distance={2} />
        )}
      </group>
    </Float>
  )
}

// Spirit creature (floating wispy form)
function SpiritCreature({ pet, onClick }: { pet: DreamPet; onClick: () => void }) {
  const groupRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = pet.position[1] + 0.5 + Math.sin(state.clock.elapsedTime * 1.5 + pet.id) * 0.2
      groupRef.current.rotation.y += 0.01
    }
  })

  return (
    <group
      ref={groupRef}
      position={pet.position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.2 : 1}
    >
      {/* Main body */}
      <mesh castShadow>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial
          color={pet.color}
          transparent
          opacity={0.8}
          emissive={pet.color}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Trailing wisps */}
      {[...Array(3)].map((_, i) => (
        <mesh key={i} position={[0, -0.2 - i * 0.15, 0]}>
          <sphereGeometry args={[0.15 - i * 0.04, 16, 16]} />
          <meshStandardMaterial
            color={pet.color}
            transparent
            opacity={0.6 - i * 0.15}
            emissive={pet.color}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}

      {/* Eyes */}
      <mesh position={[-0.08, 0.05, 0.22]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.08, 0.05, 0.22]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      <pointLight color={pet.color} intensity={1} distance={3} />
    </group>
  )
}

// Crystal creature
function CrystalCreature({ pet, onClick }: { pet: DreamPet; onClick: () => void }) {
  const groupRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5
      groupRef.current.position.y = pet.position[1] + Math.sin(state.clock.elapsedTime + pet.id) * 0.1
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group
        ref={groupRef}
        position={pet.position}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        {/* Main crystal body */}
        <mesh castShadow>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial
            color={pet.color}
            transparent
            opacity={0.85}
            metalness={0.8}
            roughness={0.1}
            emissive={pet.color}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Inner glow */}
        <mesh>
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={pet.secondaryColor}
            emissiveIntensity={1}
          />
        </mesh>

        {/* Small crystal eyes */}
        <mesh position={[-0.1, 0.05, 0.25]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#1a1a2e" metalness={1} roughness={0} />
        </mesh>
        <mesh position={[0.1, 0.05, 0.25]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#1a1a2e" metalness={1} roughness={0} />
        </mesh>

        <pointLight color={pet.color} intensity={2} distance={2.5} />
      </group>
    </Float>
  )
}

// Render the right creature type
function DreamPetMesh({ pet, onClick }: { pet: DreamPet; onClick: () => void }) {
  switch (pet.type) {
    case 'spirit':
      return <SpiritCreature pet={pet} onClick={onClick} />
    case 'crystal':
      return <CrystalCreature pet={pet} onClick={onClick} />
    default:
      return <BlobCreature pet={pet} onClick={onClick} />
  }
}

// Magical floating island
function FloatingIsland({ position, biome }: { position: [number, number, number]; biome: BiomeData }) {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Main island */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[2, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={biome.groundColor} roughness={0.8} />
      </mesh>

      {/* Top grass layer */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1.95, 1.95, 0.1, 32]} />
        <meshStandardMaterial color={biome.color} roughness={0.6} />
      </mesh>

      {/* Glowing mushrooms */}
      {[...Array(5)].map((_, i) => {
        const angle = (i / 5) * Math.PI * 2
        const radius = 0.8 + Math.random() * 0.8
        return (
          <group key={i} position={[Math.cos(angle) * radius, 0.1, Math.sin(angle) * radius]}>
            <mesh>
              <cylinderGeometry args={[0.03, 0.04, 0.15, 8]} />
              <meshStandardMaterial color="#F8E8FF" />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.08, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial
                color={biome.accentColor}
                emissive={biome.accentColor}
                emissiveIntensity={0.4}
              />
            </mesh>
            <pointLight position={[0, 0.15, 0]} color={biome.accentColor} intensity={0.3} distance={1} />
          </group>
        )
      })}

      {/* Decorative crystals */}
      {[...Array(3)].map((_, i) => {
        const angle = (i / 3) * Math.PI * 2 + 0.5
        const radius = 0.5
        return (
          <mesh key={`crystal-${i}`} position={[Math.cos(angle) * radius, 0.2, Math.sin(angle) * radius]} rotation={[0, angle, 0.2]}>
            <octahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial
              color={biome.accentColor}
              transparent
              opacity={0.7}
              metalness={0.5}
              roughness={0.2}
              emissive={biome.accentColor}
              emissiveIntensity={0.3}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// Central planet
function DreamPlanet({ currentBiome }: { currentBiome: BiomeData }) {
  const planetRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (planetRef.current) {
      planetRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <group>
      {/* Main planet */}
      <mesh ref={planetRef} receiveShadow castShadow>
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial
          color={currentBiome.groundColor}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Grass patches */}
      {[...Array(20)].map((_, i) => {
        const phi = Math.acos(2 * Math.random() - 1)
        const theta = Math.random() * Math.PI * 2
        const x = 3.05 * Math.sin(phi) * Math.cos(theta)
        const y = 3.05 * Math.sin(phi) * Math.sin(theta)
        const z = 3.05 * Math.cos(phi)
        return (
          <mesh key={i} position={[x, y, z]}>
            <circleGeometry args={[0.3 + Math.random() * 0.3, 16]} />
            <meshStandardMaterial
              color={currentBiome.color}
              side={THREE.DoubleSide}
              emissive={currentBiome.color}
              emissiveIntensity={0.1}
            />
          </mesh>
        )
      })}

      {/* Ambient planet glow */}
      <pointLight position={[0, 0, 0]} color={currentBiome.accentColor} intensity={0.5} distance={10} />
    </group>
  )
}

// Magical particles
function MagicParticles({ color }: { color: string }) {
  const particlesRef = useRef<THREE.Points>(null!)
  const particleCount = 100

  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20
    positions[i * 3 + 1] = Math.random() * 10
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.002
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

// Floating clouds
function DreamClouds() {
  return (
    <>
      <Cloud position={[-6, 4, -4]} speed={0.2} opacity={0.5} color="#FFE8F5" />
      <Cloud position={[5, 5, -6]} speed={0.15} opacity={0.4} color="#E8F5FF" />
      <Cloud position={[0, 6, 4]} speed={0.25} opacity={0.45} color="#F5E8FF" />
    </>
  )
}

// HUD UI Components
function GameHUD({
  selectedPet,
  happiness,
  currentBiome,
  petCount,
  onFeed,
  onPlay,
  onClose
}: {
  selectedPet: DreamPet | null
  happiness: number
  currentBiome: BiomeData
  petCount: number
  onFeed: () => void
  onPlay: () => void
  onClose: () => void
}) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-3 md:p-4 pointer-events-auto">
        <div className="flex items-center justify-between max-w-screen-lg mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300 flex items-center justify-center shadow-lg shadow-pink-200/50">
              <span className="text-xl md:text-2xl">✨</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm md:text-base font-bold text-white drop-shadow-lg" style={{ fontFamily: 'Comfortaa, cursive' }}>
                Dream Pet Planet
              </h1>
              <p className="text-[10px] md:text-xs text-white/80 drop-shadow" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                {currentBiome.name}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
              <span className="text-xs md:text-sm text-white drop-shadow" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                🐾 {petCount} pets
              </span>
            </div>
            <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
              <span className="text-xs md:text-sm text-white drop-shadow" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                💖 {happiness}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 shadow-2xl">
          {[
            { icon: '🌍', label: 'Explore' },
            { icon: '🏠', label: 'Camp' },
            { icon: '🎮', label: 'Play' },
            { icon: '📖', label: 'Album' },
          ].map((item, i) => (
            <button
              key={i}
              className="flex flex-col items-center gap-0.5 md:gap-1 p-2 md:p-3 rounded-2xl hover:bg-white/30 active:scale-95 transition-all min-w-[48px] md:min-w-[56px]"
            >
              <span className="text-lg md:text-2xl">{item.icon}</span>
              <span className="text-[10px] md:text-xs text-white drop-shadow hidden sm:block" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Pet interaction panel */}
      {selectedPet && (
        <div className="absolute bottom-32 md:bottom-40 left-1/2 -translate-x-1/2 pointer-events-auto animate-bounce-in w-[90vw] max-w-xs md:max-w-sm">
          <div className="bg-white/30 backdrop-blur-xl rounded-3xl p-4 md:p-6 border border-white/50 shadow-2xl">
            <button
              onClick={onClose}
              className="absolute top-2 right-2 md:top-3 md:right-3 w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-colors"
            >
              <span className="text-white text-lg">×</span>
            </button>

            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
              <div
                className="w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: selectedPet.color }}
              >
                <span className="text-2xl md:text-3xl">
                  {selectedPet.type === 'spirit' ? '👻' : selectedPet.type === 'crystal' ? '💎' : '🥰'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-bold text-white drop-shadow truncate" style={{ fontFamily: 'Comfortaa, cursive' }}>
                  {selectedPet.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${selectedPet.happiness}%`,
                        background: 'linear-gradient(90deg, #FFB5E8, #FF79C6)'
                      }}
                    />
                  </div>
                  <span className="text-xs text-white/90 drop-shadow whitespace-nowrap" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                    {selectedPet.happiness}%
                  </span>
                </div>
                {selectedPet.isEvolved && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 text-[10px] font-bold text-amber-900">
                    ✨ EVOLVED
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onFeed}
                className="flex-1 py-2.5 md:py-3 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold text-xs md:text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                🍓 Feed
              </button>
              <button
                onClick={onPlay}
                className="flex-1 py-2.5 md:py-3 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-bold text-xs md:text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                🎾 Play
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Biome indicator */}
      <div className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 pointer-events-none">
        <div
          className="px-4 md:px-6 py-1.5 md:py-2 rounded-full backdrop-blur-md border shadow-lg animate-pulse-slow"
          style={{
            backgroundColor: `${currentBiome.color}40`,
            borderColor: `${currentBiome.color}80`
          }}
        >
          <span className="text-xs md:text-sm text-white drop-shadow font-medium" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            ✦ {currentBiome.name} ✦
          </span>
        </div>
      </div>
    </div>
  )
}

// Event notification
function EventNotification({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="absolute top-32 md:top-36 left-1/2 -translate-x-1/2 pointer-events-auto animate-slide-down w-[90vw] max-w-xs md:max-w-md">
      <div className="px-4 md:px-6 py-3 md:py-4 rounded-2xl bg-gradient-to-r from-amber-300/90 via-yellow-300/90 to-amber-300/90 backdrop-blur-md shadow-xl border border-yellow-200">
        <p className="text-amber-900 font-bold text-center text-xs md:text-sm" style={{ fontFamily: 'Quicksand, sans-serif' }}>
          ✨ {message} ✨
        </p>
      </div>
    </div>
  )
}

// Main 3D Scene
function Scene({ pets, onPetClick, currentBiome }: { pets: DreamPet[]; onPetClick: (pet: DreamPet) => void; currentBiome: BiomeData }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} color="#FFE8F5" />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.2}
        color="#FFF5E8"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-5, 8, -5]} intensity={0.5} color={currentBiome.accentColor} />
      <pointLight position={[5, 3, 5]} intensity={0.3} color="#FFB5E8" />

      {/* Environment */}
      <Environment preset="sunset" />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0.5} fade speed={1} />

      {/* Planet */}
      <DreamPlanet currentBiome={currentBiome} />

      {/* Floating islands */}
      <FloatingIsland position={[-6, 2, -4]} biome={BIOMES[0]} />
      <FloatingIsland position={[5, 1.5, -5]} biome={BIOMES[1]} />
      <FloatingIsland position={[4, 3, 5]} biome={BIOMES[2]} />
      <FloatingIsland position={[-5, 2.5, 4]} biome={BIOMES[3]} />

      {/* Dream Pets */}
      {pets.map((pet) => (
        <DreamPetMesh key={pet.id} pet={pet} onClick={() => onPetClick(pet)} />
      ))}

      {/* Clouds */}
      <DreamClouds />

      {/* Magic particles */}
      <MagicParticles color={currentBiome.accentColor} />

      {/* Contact shadows */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.4}
        scale={20}
        blur={2}
        far={4}
        color="#2D1F3D"
      />

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.3}
        enablePan={false}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN
        }}
      />
    </>
  )
}

// Main App
export default function App() {
  const [pets, setPets] = useState<DreamPet[]>(() => generatePets(12))
  const [selectedPet, setSelectedPet] = useState<DreamPet | null>(null)
  const [biomeIndex, setBiomeIndex] = useState(0)
  const [notification, setNotification] = useState<string | null>(null)
  const currentBiome = BIOMES[biomeIndex]

  const happiness = Math.round(pets.reduce((sum, p) => sum + p.happiness, 0) / pets.length)

  // Cycle biomes periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setBiomeIndex((i) => (i + 1) % BIOMES.length)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Random events
  useEffect(() => {
    const interval = setInterval(() => {
      const events = [
        'A shooting star passed by! ⭐',
        'New creature spotted in the forest! 🌿',
        'Crystal flowers are blooming! 💎',
        'The moon is extra bright tonight! 🌙',
        'Magic dust is falling! ✨'
      ]
      setNotification(events[Math.floor(Math.random() * events.length)])
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleFeed = () => {
    if (selectedPet) {
      setPets(pets.map(p =>
        p.id === selectedPet.id
          ? { ...p, happiness: Math.min(100, p.happiness + 10) }
          : p
      ))
      setNotification(`${selectedPet.name} loved the treat! 🍓`)
    }
  }

  const handlePlay = () => {
    if (selectedPet) {
      setPets(pets.map(p =>
        p.id === selectedPet.id
          ? { ...p, happiness: Math.min(100, p.happiness + 15) }
          : p
      ))
      setNotification(`${selectedPet.name} had so much fun! 🎾`)
    }
  }

  return (
    <div className="w-screen h-[100dvh] relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes bounce-in {
          0% { transform: translateX(-50%) scale(0.8); opacity: 0; }
          50% { transform: translateX(-50%) scale(1.05); }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
        @keyframes slide-down {
          0% { transform: translateX(-50%) translateY(-20px); opacity: 0; }
          100% { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.4s ease-out; }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
      `}</style>

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 5, 12], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <Scene
            pets={pets}
            onPetClick={setSelectedPet}
            currentBiome={currentBiome}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <GameHUD
        selectedPet={selectedPet}
        happiness={happiness}
        currentBiome={currentBiome}
        petCount={pets.length}
        onFeed={handleFeed}
        onPlay={handlePlay}
        onClose={() => setSelectedPet(null)}
      />

      {/* Event notifications */}
      {notification && (
        <EventNotification
          message={notification}
          onDismiss={() => setNotification(null)}
        />
      )}

      {/* Footer */}
      <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="text-[10px] md:text-xs text-white/40 text-center" style={{ fontFamily: 'Quicksand, sans-serif' }}>
          Requested by @flambons · Built by @clonkbot
        </p>
      </div>
    </div>
  )
}
