'use client';

import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

// Import gambar untuk texture
import lanyard from '../../assets/Lanyard/lanyard.png';

extend({ MeshLineGeometry, MeshLineMaterial });

// Error Boundary untuk Three.js components
class LanyardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lanyard error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative z-0 w-full h-screen flex justify-center items-center transform scale-100 origin-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-xl font-bold mb-2">Lanyard Card</h3>
            <p className="text-gray-400">3D Card Unavailable</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 px-4 py-2 bg-cyan-500 text-black rounded hover:bg-cyan-400"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Safe Lanyard Component
const SafeLanyard = ({ position = [0, 0, 30], gravity = [0, -40, 0], fov = 20, transparent = true }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    // Delay loading untuk menghindari race condition
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Fallback component jika 3D tidak berfungsi
  if (useFallback) {
    return (
      <div className="relative z-0 w-full h-screen flex justify-center items-center transform scale-100 origin-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4 animate-bounce">🎫</div>
          <h3 className="text-2xl font-bold mb-4">Lanyard Card</h3>
          <p className="text-gray-400 mb-6">Interactive 3D Business Card</p>
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-6 rounded-lg shadow-lg max-w-sm">
            <h4 className="text-lg font-bold mb-2">Muhammad Nadhil Arsy Al-Wafi</h4>
            <p className="text-sm text-gray-200 mb-2">Full Stack Developer</p>
            <p className="text-xs text-gray-300">React • Node.js • Three.js</p>
            <div className="mt-4 flex justify-center space-x-4">
              <a href="https://github.com/nadhil13" target="_blank" rel="noopener noreferrer" className="text-white hover:text-cyan-300 transition-colors">
                GitHub
              </a>
              <a href="https://linkedin.com/in/muhammad-nadhil-arsy-al-wafi" target="_blank" rel="noopener noreferrer" className="text-white hover:text-cyan-300 transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
          <button 
            onClick={() => setUseFallback(false)}
            className="mt-6 px-4 py-2 bg-cyan-500 text-black rounded hover:bg-cyan-400 transition-colors"
          >
            Try 3D Again
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="relative z-0 w-full h-screen flex justify-center items-center transform scale-100 origin-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4 animate-pulse">🎫</div>
          <p className="text-gray-400">Loading 3D Card...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="relative z-0 w-full h-screen flex justify-center items-center transform scale-100 origin-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🎫</div>
          <h3 className="text-xl font-bold mb-2">3D Card Error</h3>
          <p className="text-gray-400 mb-4">Something went wrong with the 3D rendering</p>
          <div className="space-x-4">
            <button 
              onClick={() => setHasError(false)}
              className="px-4 py-2 bg-cyan-500 text-black rounded hover:bg-cyan-400"
            >
              Try Again
            </button>
            <button 
              onClick={() => setUseFallback(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
            >
              Use Fallback
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LanyardErrorBoundary>
      <div className="relative z-0 w-full h-screen flex justify-center items-center transform scale-100 origin-center">
        <Canvas
          camera={{ position: [0, 0, 20], fov: 30 }}
          gl={{ alpha: transparent, antialias: true, preserveDrawingBuffer: true }}
          onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
          onError={(error) => {
            console.error('Canvas error:', error);
            setHasError(true);
          }}
        >
          <ambientLight intensity={2.0} />
          <directionalLight position={[10, 10, 5]} intensity={3} />
          <pointLight position={[-10, -10, -5]} intensity={2} />
          <pointLight position={[0, 10, 0]} intensity={1.5} />
          <Physics gravity={gravity} timeStep={1 / 60}>
            <Band />
          </Physics>
          <Environment blur={0.3}>
            <Lightformer intensity={5} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
            <Lightformer intensity={6} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
            <Lightformer intensity={6} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
            <Lightformer intensity={20} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
          </Environment>
        </Canvas>
      </div>
    </LanyardErrorBoundary>
  );
};

function Band({ maxSpeed = 50, minSpeed = 0 }) {
  const band = useRef(), fixed = useRef(), j1 = useRef(), j2 = useRef(), j3 = useRef(), card = useRef();
  const vec = new THREE.Vector3(), ang = new THREE.Vector3(), rot = new THREE.Vector3(), dir = new THREE.Vector3();
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };

  // Load textures dari file di public directory
  const lanyardTexture = useTexture(lanyard);
  const frontTexture = useTexture('/depan.png');
  const backTexture = useTexture('/belakang.png');
  
  const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]));
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);
  const [isSmall, setIsSmall] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
  
  // State untuk animasi smooth
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const animationStartTime = useRef(Date.now());

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.50, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmall(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animasi smooth untuk card muncul
  useEffect(() => {
    const animateCard = () => {
      const elapsed = Date.now() - animationStartTime.current;
      const duration = 2000; // 2 detik untuk animasi
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function untuk smooth animation
      const easeOutBounce = (t) => {
        if (t < 1 / 2.75) {
          return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
          return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
          return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
          return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
      };
      
      const easedProgress = easeOutBounce(progress);
      setAnimationProgress(easedProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animateCard);
      } else {
        setIsAnimating(false);
      }
    };
    
    animateCard();
  }, []);

  useFrame((state, delta) => {
    try {
      if (dragged) {
        vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
        dir.copy(vec).sub(state.camera.position).normalize();
        vec.add(dir.multiplyScalar(state.camera.position.length()));
        [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
        card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
      }
      
      // Animasi smooth untuk card saat muncul
      if (isAnimating && card.current) {
        const startY = 10; // Posisi awal di atas
        const targetY = 0; // Posisi target
        const currentY = startY + (targetY - startY) * animationProgress;
        
        card.current.setTranslation({ x: 2, y: currentY, z: 0 });
        
        // Tambahkan sedikit rotasi untuk efek smooth
        const rotationProgress = Math.sin(animationProgress * Math.PI) * 0.3;
        card.current.setRotation({ x: rotationProgress, y: 0, z: 0 });
      }
      
      if (fixed.current) {
        [j1, j2].forEach((ref) => {
          if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
          const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
          ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
        });
        curve.points[0].copy(j3.current.translation());
        curve.points[1].copy(j2.current.lerped);
        curve.points[2].copy(j1.current.lerped);
        curve.points[3].copy(fixed.current.translation());
        band.current.geometry.setPoints(curve.getPoints(32));
        ang.copy(card.current.angvel());
        rot.copy(card.current.rotation());
        card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
      }
    } catch (error) {
      console.error('Frame error:', error);
    }
  });

  curve.curveType = 'chordal';
  lanyardTexture.wrapS = lanyardTexture.wrapT = THREE.RepeatWrapping;
  frontTexture.wrapS = frontTexture.wrapT = THREE.ClampToEdgeWrapping;
  backTexture.wrapS = backTexture.wrapT = THREE.ClampToEdgeWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          {/* Ukuran ID Card portrait (vertikal) seperti ID card asli */}
          <CuboidCollider args={[1.2, 2.0, 0.01]} />
          <group
            scale={isAnimating ? 3.0 * animationProgress : 3.0}
            position={[0, -1.5, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={(e) => (e.target.setPointerCapture(e.pointerId), drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation()))))}>
            
            {/* Sisi Depan Kartu (depan.png) - Portrait/vertikal */}
            <mesh position={[0, 0, 0.005]}>
              <planeGeometry args={[1.5, 2.4, 1]} />
              <meshPhysicalMaterial
                map={frontTexture}
                color="white"
                roughness={0.2}
                metalness={0.1}
                transparent={true}
                alphaTest={0.1}
                envMapIntensity={1.0}
              />
            </mesh>
            
            {/* Sisi Belakang Kartu (belakang.png) - Portrait/vertikal */}
            <mesh position={[0, 0, -0.005]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[1.5, 2.4, 1]} />
              <meshPhysicalMaterial
                map={backTexture}
                color="white"
                roughness={0.2}
                metalness={0.1}
                transparent={true}
                alphaTest={0.1}
                envMapIntensity={1.0}
              />
            </mesh>
            
            {/* Lubang untuk tali lanyard - di bagian atas kartu */}
            <mesh position={[0, 1.0, 0]}>
              <ringGeometry args={[0.08, 0.12, 16]} />
              <meshBasicMaterial color="#FFD700" />
            </mesh>
            
            {/* Clip lanyard - lebih jelas dan terhubung */}
            <mesh position={[0, 1.1, 0]}>
              <boxGeometry args={[0.3, 0.1, 0.05]} />
              <meshBasicMaterial color="#333333" />
            </mesh>
            
            {/* Konektor Lanyard seperti Bangzen Creative */}
            <group position={[0, 1.3, 0]}>
              {/* Top Loop/Bar - tempat tali lanyard lewat */}
              <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.15, 8]} />
                <meshBasicMaterial color="#333333" />
              </mesh>
              
              {/* Middle Swivel Mechanism */}
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshBasicMaterial color="#333333" />
              </mesh>
              
              {/* Bottom Clip/Hook */}
              <mesh position={[0, -0.1, 0]}>
                <boxGeometry args={[0.12, 0.04, 0.04]} />
                <meshBasicMaterial color="#333333" />
              </mesh>
              
              {/* Hook opening */}
              <mesh position={[0, -0.12, 0]}>
                <ringGeometry args={[0.03, 0.05, 8]} />
                <meshBasicMaterial color="#333333" />
              </mesh>
            </group>
          </group>
        </RigidBody>
      </group>
      
      {/* Tali Lanyard yang diperbaiki dan diperbesar seperti Zain Ahmad */}
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isSmall ? [1000, 2000] : [1000, 1000]}
          useMap
          map={lanyardTexture}
          repeat={[-4, 1]}
          lineWidth={1}
          transparent={true}
          opacity={isAnimating ? animationProgress * 0.8 : 1.0}
        />
      </mesh>
      
      {/* Konektor visual yang minimal dan bersih */}
      <group>
        {/* Konektor dari j3 ke kartu - menggunakan posisi dinamis */}
        {j3.current && (
          <mesh 
            position={[j3.current.translation().x, j3.current.translation().y, j3.current.translation().z]}
            scale={isAnimating ? animationProgress : 1}
          >
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial 
              color="#333333" 
              transparent={true}
              opacity={isAnimating ? animationProgress : 1}
            />
          </mesh>
        )}
        
        {/* Konektor dari kartu ke tali - menggunakan posisi dinamis untuk portrait */}
        {card.current && (
          <mesh 
            position={[card.current.translation().x, card.current.translation().y + 1.4, card.current.translation().z]}
            scale={isAnimating ? animationProgress : 1}
          >
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial 
              color="#333333" 
              transparent={true}
              opacity={isAnimating ? animationProgress : 1}
            />
          </mesh>
        )}
        
        {/* Konektor tambahan untuk memastikan tali terhubung */}
        {card.current && j3.current && (
          <mesh scale={isAnimating ? animationProgress : 1}>
            <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
            <meshBasicMaterial 
              color="#333333" 
              transparent={true}
              opacity={isAnimating ? animationProgress : 1}
            />
            <group position={[
              (j3.current.translation().x + card.current.translation().x) / 2,
              (j3.current.translation().y + card.current.translation().y + 1.4) / 2,
              (j3.current.translation().z + card.current.translation().z) / 2
            ]}>
            </group>
          </mesh>
        )}
      </group>
    </>
  );
}

// Export SafeLanyard sebagai default
export default SafeLanyard;
