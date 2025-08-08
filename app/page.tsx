"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { OrbitControls, Environment, Text } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import * as THREE from "three"

const steps = [
  {
    id: 1,
    title: "Select Fresh Coconut",
    description: "Choose a fresh coconut by shaking it to hear the water inside",
    instruction: "Look for a coconut that feels heavy and sounds full of water when shaken"
  },
  {
    id: 2,
    title: "Locate the Eyes",
    description: "Find the three 'eyes' at the top of the coconut",
    instruction: "The eyes are the three dark spots that form a triangle pattern"
  },
  {
    id: 3,
    title: "Pierce the Softest Eye",
    description: "Use a sharp tool to pierce through the softest eye",
    instruction: "Test each eye with gentle pressure to find the softest one"
  },
  {
    id: 4,
    title: "Create Drainage Hole",
    description: "Make a hole large enough for water to flow out",
    instruction: "Twist and push the tool to create a clean hole"
  },
  {
    id: 5,
    title: "Extract Coconut Water",
    description: "Turn the coconut upside down and let the water drain",
    instruction: "Hold over a glass and let gravity do the work"
  },
  {
    id: 6,
    title: "Find the Seam",
    description: "Locate the natural seam that runs around the coconut's equator",
    instruction: "Look for the line that divides the coconut into two halves"
  },
  {
    id: 7,
    title: "Crack the Coconut",
    description: "Strike along the seam with a heavy knife or hammer",
    instruction: "Rotate and tap firmly along the seam until it cracks"
  },
  {
    id: 8,
    title: "Split Open",
    description: "Separate the two halves to reveal the coconut meat",
    instruction: "Twist and pull apart the cracked halves - water will spill out!"
  }
]

function WaterDroplets({ step, crackTime }: { step: number; crackTime: number }) {
  const dropletsRef = useRef<THREE.Group>(null!)
  const dropletData = useRef<Array<{
    initialPos: THREE.Vector3;
    velocity: THREE.Vector3;
    life: number;
    size: number;
    rotation: number;
  }>>([])
  
  // Initialize droplet data
  if (dropletData.current.length === 0) {
    for (let i = 0; i < 20; i++) {
      dropletData.current.push({
        initialPos: new THREE.Vector3(
          (Math.random() - 0.5) * 1.5,
          0.2 + Math.random() * 0.3,
          (Math.random() - 0.5) * 1.5
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          -1.5 - Math.random() * 2,
          (Math.random() - 0.5) * 2
        ),
        life: Math.random() * 2,
        size: 0.02 + Math.random() * 0.03,
        rotation: Math.random() * Math.PI * 2
      })
    }
  }
  
  useFrame((state) => {
    if (dropletsRef.current && (step === 7 || step === 8)) {
      const time = state.clock.elapsedTime - crackTime
      
      dropletsRef.current.children.forEach((droplet, i) => {
        if (droplet instanceof THREE.Mesh) {
          const data = dropletData.current[i]
          const dropletTime = (time + data.life) % 3
          
          // Physics-based movement
          const gravity = -4.8
          const airResistance = 0.98
          
          // Calculate position with physics
          const x = data.initialPos.x + data.velocity.x * dropletTime * airResistance
          const y = data.initialPos.y + data.velocity.y * dropletTime + 0.5 * gravity * dropletTime * dropletTime
          const z = data.initialPos.z + data.velocity.z * dropletTime * airResistance
          
          droplet.position.set(x, y, z)
          
          // Rotation for more dynamic look
          droplet.rotation.x = data.rotation + time * 2
          droplet.rotation.z = data.rotation + time * 1.5
          
          // Scale animation (droplets get smaller as they fall)
          const scale = Math.max(0.3, 1 - dropletTime * 0.3)
          droplet.scale.setScalar(scale)
          
          // Opacity fade
          const material = droplet.material as THREE.MeshStandardMaterial
          material.opacity = Math.max(0.2, 1 - dropletTime * 0.4)
          
          // Reset droplet when it hits ground or fades
          if (y < -2.5 || dropletTime > 2.8) {
            // Reset with slight variation
            data.initialPos.set(
              (Math.random() - 0.5) * 1.5,
              0.2 + Math.random() * 0.3,
              (Math.random() - 0.5) * 1.5
            )
            data.velocity.set(
              (Math.random() - 0.5) * 2,
              -1.5 - Math.random() * 2,
              (Math.random() - 0.5) * 2
            )
          }
        }
      })
    }
  })

  if (step < 7) return null

  return (
    <group ref={dropletsRef}>
      {/* Enhanced water droplets with varying sizes */}
      {Array.from({ length: 20 }, (_, i) => {
        const size = 0.02 + (i % 3) * 0.01
        return (
          <mesh key={i} position={[0, 0, 0]}>
            <sphereGeometry args={[size, 8, 8]} />
            <meshStandardMaterial 
              color="#4FC3F7" 
              transparent 
              opacity={0.9}
              metalness={0.1}
              roughness={0.1}
              emissive="#87CEEB"
              emissiveIntensity={0.1}
            />
          </mesh>
        )
      })}
      
      {/* Water stream/splash effect */}
      {step === 8 && (
        <>
          {/* Main water stream */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.02, 1.5, 8]} />
            <meshStandardMaterial 
              color="#4FC3F7" 
              transparent 
              opacity={0.6}
              metalness={0.1}
              roughness={0.1}
            />
          </mesh>
          
          {/* Splash particles */}
          {Array.from({ length: 15 }, (_, i) => (
            <mesh 
              key={`splash-${i}`}
              position={[
                Math.sin(i * 0.4) * 0.8,
                -1.5 + Math.cos(i * 0.3) * 0.3,
                Math.cos(i * 0.4) * 0.8
              ]}
            >
              <sphereGeometry args={[0.015, 6, 6]} />
              <meshStandardMaterial 
                color="#87CEEB" 
                transparent 
                opacity={0.7}
                metalness={0.2}
                roughness={0.1}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  )
}

function Coconut({ step }: { step: number }) {
  const coconutRef = useRef<THREE.Group>(null!)
  const waterRef = useRef<THREE.Mesh>(null!)
  const topHalfRef = useRef<THREE.Group>(null!)
  const bottomHalfRef = useRef<THREE.Group>(null!)
  const [crackStartTime, setCrackStartTime] = useState(0)

  useFrame((state) => {
    const time = state.clock.elapsedTime

    if (coconutRef.current && step === 1) {
      coconutRef.current.rotation.y = Math.sin(time * 0.5) * 0.1
    }
    
    if (waterRef.current && step === 5) {
      waterRef.current.scale.y = Math.max(0.1, Math.sin(time * 2) * 0.5 + 0.5)
      waterRef.current.position.y = -1.5 + Math.sin(time * 2) * 0.2
    }

    // Cracking animation with water spillage
    if (step === 7 && topHalfRef.current && bottomHalfRef.current) {
      if (crackStartTime === 0) {
        setCrackStartTime(time)
      }
      const shakeIntensity = Math.sin(time * 15) * 0.03
      topHalfRef.current.position.x = shakeIntensity
      bottomHalfRef.current.position.x = -shakeIntensity
      topHalfRef.current.rotation.z = shakeIntensity * 0.5
      bottomHalfRef.current.rotation.z = -shakeIntensity * 0.5
    }

    // Split animation with dramatic water flow
    if (step === 8 && topHalfRef.current && bottomHalfRef.current) {
      const splitTime = time - crackStartTime
      const splitAmount = Math.min(splitTime * 0.8, 2)
      
      topHalfRef.current.position.set(splitAmount * 0.8, splitAmount * 0.6, splitAmount * 0.3)
      topHalfRef.current.rotation.set(splitAmount * 0.4, splitAmount * 0.2, splitAmount * 0.3)
      
      bottomHalfRef.current.position.set(-splitAmount * 0.6, -splitAmount * 0.4, -splitAmount * 0.2)
      bottomHalfRef.current.rotation.set(-splitAmount * 0.3, -splitAmount * 0.1, -splitAmount * 0.2)
    }
  })

  // Create realistic coconut texture
  const createCoconutTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    
    // Base brown color
    ctx.fillStyle = '#8B4513'
    ctx.fillRect(0, 0, 512, 512)
    
    // Add fiber texture
    ctx.strokeStyle = '#A0522D'
    ctx.lineWidth = 2
    for (let i = 0; i < 100; i++) {
      ctx.beginPath()
      ctx.moveTo(Math.random() * 512, Math.random() * 512)
      ctx.lineTo(Math.random() * 512, Math.random() * 512)
      ctx.stroke()
    }
    
    // Add darker streaks
    ctx.strokeStyle = '#654321'
    ctx.lineWidth = 1
    for (let i = 0; i < 50; i++) {
      ctx.beginPath()
      ctx.moveTo(Math.random() * 512, Math.random() * 512)
      ctx.lineTo(Math.random() * 512, Math.random() * 512)
      ctx.stroke()
    }
    
    return new THREE.CanvasTexture(canvas)
  }

  const coconutTexture = createCoconutTexture()

  const renderCoconutHalf = (isTop: boolean, ref: React.RefObject<THREE.Group>) => (
    <group ref={ref}>
      {/* Realistic coconut shell with proper shape */}
      <mesh>
        <sphereGeometry 
          args={[1.3, 64, 64, 0, Math.PI * 2, isTop ? 0 : Math.PI / 2, Math.PI / 2]} 
        />
        <meshStandardMaterial 
          map={coconutTexture}
          roughness={0.9}
          normalScale={[2, 2]}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Coconut husk (outer fiber layer) */}
      <mesh scale={1.05}>
        <sphereGeometry 
          args={[1.25, 32, 32, 0, Math.PI * 2, isTop ? 0 : Math.PI / 2, Math.PI / 2]} 
        />
        <meshStandardMaterial 
          color="#CD853F"
          roughness={1.0}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* White coconut meat (thicker and more realistic) */}
      <mesh>
        <sphereGeometry 
          args={[1.15, 32, 32, 0, Math.PI * 2, isTop ? 0 : Math.PI / 2, Math.PI / 2]} 
        />
        <meshStandardMaterial 
          color="#FFFEF0" 
          roughness={0.4}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Inner coconut cavity (where water was) */}
      <mesh>
        <sphereGeometry 
          args={[0.9, 32, 32, 0, Math.PI * 2, isTop ? 0 : Math.PI / 2, Math.PI / 2]} 
        />
        <meshStandardMaterial 
          color="#F5F5DC" 
          roughness={0.6}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Eyes (only on top half) */}
      {isTop && [0, 1, 2].map((i) => {
        const angle = (i * Math.PI * 2) / 3
        const eyeColor = step >= 2 ? (i === 0 ? "#FF4444" : "#2C1810") : "#2C1810"
        const eyeScale = step >= 2 && i === 0 ? 1.4 : 1
        
        return (
          <mesh 
            key={i}
            position={[
              Math.cos(angle) * 0.9, 
              0.9, 
              Math.sin(angle) * 0.9
            ]}
            scale={eyeScale}
          >
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color={eyeColor} />
          </mesh>
        )
      })}

      {/* Hole (only on top half) */}
      {isTop && step >= 3 && (
        <mesh position={[0.9, 0.9, 0]}>
          <cylinderGeometry args={[step >= 4 ? 0.05 : 0.02, step >= 4 ? 0.05 : 0.02, 0.3, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      )}
    </group>
  )

  return (
    <group ref={coconutRef} position={step === 5 ? [0, 0.5, 0] : [0, 0, 0]} rotation={step === 5 ? [Math.PI, 0, 0] : [0, 0, 0]}>
      {/* Show whole coconut for steps 1-5 */}
      {step <= 5 && (
        <>
          {/* Main realistic coconut body */}
          <mesh>
            <sphereGeometry args={[1.3, 64, 64]} />
            <meshStandardMaterial 
              map={coconutTexture}
              roughness={0.9}
              normalScale={[2, 2]}
            />
          </mesh>
          
          {/* Coconut husk (outer fiber layer) */}
          <mesh scale={1.05}>
            <sphereGeometry args={[1.25, 32, 32]} />
            <meshStandardMaterial 
              color="#CD853F"
              roughness={1.0}
              transparent
              opacity={0.7}
            />
          </mesh>

          {/* Eyes */}
          {[0, 1, 2].map((i) => {
            const angle = (i * Math.PI * 2) / 3
            const eyeColor = step >= 2 ? (i === 0 ? "#FF4444" : "#2C1810") : "#2C1810"
            const eyeScale = step >= 2 && i === 0 ? 1.4 : 1
            
            return (
              <mesh 
                key={i}
                position={[
                  Math.cos(angle) * 0.9, 
                  0.9, 
                  Math.sin(angle) * 0.9
                ]}
                scale={eyeScale}
              >
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshStandardMaterial color={eyeColor} />
              </mesh>
            )
          })}

          {/* Hole */}
          {step >= 3 && (
            <mesh position={[0.9, 0.9, 0]}>
              <cylinderGeometry args={[step >= 4 ? 0.05 : 0.02, step >= 4 ? 0.05 : 0.02, 0.3, 16]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
          )}
        </>
      )}

      {/* Show seam for step 6 */}
      {step === 6 && (
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[1.32, 0.02, 8, 64]} />
          <meshStandardMaterial color="#FF6B6B" emissive="#FF6B6B" emissiveIntensity={0.4} />
        </mesh>
      )}

      {/* Show cracked/split coconut for steps 7-8 */}
      {step >= 7 && (
        <>
          {renderCoconutHalf(true, topHalfRef)}
          {renderCoconutHalf(false, bottomHalfRef)}
          
          {/* Crack lines for step 7 */}
          {step === 7 && (
            <>
              <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
                <torusGeometry args={[1.32, 0.008, 8, 64]} />
                <meshStandardMaterial color="#000000" />
              </mesh>
              {/* Jagged crack lines */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <mesh 
                  key={i}
                  position={[
                    Math.cos(i * Math.PI * 0.33) * 1.3,
                    Math.sin(i * 0.8) * 0.1,
                    Math.sin(i * Math.PI * 0.33) * 1.3
                  ]}
                  rotation={[0, i * Math.PI * 0.33, 0]}
                >
                  <boxGeometry args={[0.015, 0.4, 0.008]} />
                  <meshStandardMaterial color="#000000" />
                </mesh>
              ))}
            </>
          )}
          
          {/* Water spillage when cracking */}
          <WaterDroplets step={step} crackTime={crackStartTime} />
        </>
      )}

      {/* Tool */}
      {(step === 3 || step === 4) && (
        <mesh position={[1.2, 1.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.012, 0.012, 0.8, 8]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
        </mesh>
      )}

      {/* Hammer/Knife for cracking */}
      {step === 7 && (
        <mesh position={[0, 2.2, 0]} rotation={[0, 0, Math.PI / 6]}>
          {/* Handle */}
          <boxGeometry args={[1.0, 0.08, 0.04]} />
          <meshStandardMaterial color="#8B4513" />
          {/* Hammer head */}
          <mesh position={[0.4, 0, 0]}>
            <boxGeometry args={[0.25, 0.4, 0.2]} />
            <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.2} />
          </mesh>
        </mesh>
      )}

      {/* Enhanced water stream for step 5 with droplets */}
      {step === 5 && (
        <>
          <mesh ref={waterRef} position={[0.9, -1.5, 0]}>
            <cylinderGeometry args={[0.025, 0.008, 1.0, 8]} />
            <meshStandardMaterial 
              color="#4FC3F7" 
              transparent 
              opacity={0.8}
              metalness={0.1}
              roughness={0.1}
              emissive="#87CEEB"
              emissiveIntensity={0.1}
            />
          </mesh>
          
          {/* Small droplets around the main stream */}
          {Array.from({ length: 8 }, (_, i) => (
            <mesh 
              key={`stream-droplet-${i}`}
              position={[
                0.9 + Math.sin(i * 0.8) * 0.1,
                -1.5 - i * 0.2,
                Math.cos(i * 0.8) * 0.1
              ]}
            >
              <sphereGeometry args={[0.01, 6, 6]} />
              <meshStandardMaterial 
                color="#4FC3F7" 
                transparent 
                opacity={0.7}
                metalness={0.1}
                roughness={0.1}
              />
            </mesh>
          ))}
        </>
      )}

      {/* Glass and collected water */}
      {step === 5 && (
        <>
          <mesh position={[0.9, -3.0, 0]}>
            <cylinderGeometry args={[0.4, 0.3, 0.7, 32]} />
            <meshStandardMaterial 
              color="#FFFFFF" 
              transparent 
              opacity={0.15}
              metalness={0.1}
              roughness={0.05}
            />
          </mesh>
          {/* Water in glass */}
          <mesh position={[0.9, -3.1, 0]}>
            <cylinderGeometry args={[0.35, 0.25, 0.4, 32]} />
            <meshStandardMaterial 
              color="#E6F7FF" 
              transparent 
              opacity={0.9}
              metalness={0.1}
              roughness={0.1}
            />
          </mesh>
        </>
      )}

      {/* Enhanced water puddle with ripple effect */}
      {(step === 7 || step === 8) && (
        <>
          {/* Main puddle */}
          <mesh position={[0, -2.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.8, 32]} />
            <meshStandardMaterial 
              color="#B0E0E6" 
              transparent 
              opacity={0.7}
              metalness={0.2}
              roughness={0.1}
              emissive="#87CEEB"
              emissiveIntensity={0.05}
            />
          </mesh>
          
          {/* Ripple effects */}
          {Array.from({ length: 3 }, (_, i) => (
            <mesh 
              key={`ripple-${i}`}
              position={[0, -2.47, 0]} 
              rotation={[-Math.PI / 2, 0, 0]}
              scale={1 + i * 0.3}
            >
              <ringGeometry args={[0.5 + i * 0.2, 0.6 + i * 0.2, 32]} />
              <meshStandardMaterial 
                color="#87CEEB" 
                transparent 
                opacity={0.3 - i * 0.1}
                metalness={0.1}
                roughness={0.1}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  )
}

function Scene({ currentStep }: { currentStep: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[8, 8, 5]} intensity={1.2} castShadow />
      <pointLight position={[-5, 3, -5]} intensity={0.6} color="#FFF8DC" />
      <spotLight position={[0, 10, 0]} intensity={0.8} angle={0.3} penumbra={0.5} />
      
      <Coconut step={currentStep} />
      
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.28}
        color="#1E40AF"
        anchorX="center"
        anchorY="middle"
      >
        {`Step ${currentStep}: ${steps[currentStep - 1]?.title}`}
      </Text>
      
      {/* Ground plane */}
      <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>
      
      <Environment preset="sunset" />
      <OrbitControls 
        enablePan={false} 
        maxDistance={10} 
        minDistance={3}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  )
}

export default function CoconutExtractor() {
  const [currentStep, setCurrentStep] = useState(1)

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const resetSimulation = () => {
    setCurrentStep(1)
  }

  const currentStepData = steps[currentStep - 1]

  return (
    <div className="w-full h-screen bg-gradient-to-br from-amber-50 to-green-50 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🥥 Realistic Coconut Processor</h1>
            <p className="text-gray-600">Complete Water Extraction + Meat Access with Realistic Physics</p>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            Step {currentStep} / {steps.length}
          </Badge>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* 3D Scene */}
        <div className="flex-1 relative">
          <Canvas shadows camera={{ position: [5, 4, 5], fov: 50 }}>
            <Scene currentStep={currentStep} />
          </Canvas>
        </div>

        {/* Side panel */}
        <div className="w-80 p-4 bg-white/90 backdrop-blur-sm border-l overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-700">
                {currentStepData?.title}
              </CardTitle>
              <CardDescription>
                {currentStepData?.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> {currentStepData?.instruction}
                </p>
              </div>

              {/* Special alerts for water spillage */}
              {(currentStep === 7 || currentStep === 8) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    💧 <strong>Notice:</strong> Water is spilling out as the coconut cracks! This is normal and expected.
                  </p>
                </div>
              )}

              {/* Process phases */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Process Phase:</div>
                <div className="flex gap-2">
                  <Badge variant={currentStep <= 5 ? "default" : "secondary"}>
                    Water Extraction
                  </Badge>
                  <Badge variant={currentStep > 5 ? "default" : "secondary"}>
                    Shell Cracking
                  </Badge>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{Math.round((currentStep / steps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                <Button 
                  onClick={prevStep} 
                  disabled={currentStep === 1}
                  variant="outline"
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button 
                  onClick={nextStep} 
                  disabled={currentStep === steps.length}
                  className="flex-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              <Button 
                onClick={resetSimulation}
                variant="ghost"
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Simulation
              </Button>

              {/* Step indicators */}
              <div className="grid grid-cols-4 gap-2 pt-4">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index + 1)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                      index + 1 === currentStep 
                        ? 'bg-blue-500 text-white' 
                        : index + 1 < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {/* Completion message */}
              {currentStep === steps.length && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-green-800 font-medium">🎉 Process Complete!</div>
                  <div className="text-green-700 text-sm mt-1">
                    You've successfully extracted all coconut water and cracked open the shell to access the fresh meat!
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
