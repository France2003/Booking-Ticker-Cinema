import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";

interface CameraPos {
  name: string;
  position: number[];
  target: number[];
}

/* 🎬 Mô hình rạp chiếu (GLB) */
function CinemaModel() {
  const { scene } = useGLTF("/models/rapchieuphim_160ghe_full_camera.glb");

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    scene.scale.set(1.15, 1, 1.15);
    scene.position.set(0, 0, 0.3);
  }, [scene]);

  return <primitive object={scene} />;
}

/* 💡 Hiệu ứng sáng nhẹ từ màn hình chiếu */
function ScreenLight() {
  return (
    <mesh position={[0, 3.5, -12]}>
      <planeGeometry args={[16, 4]} />
      <meshStandardMaterial emissive="#ffffff" emissiveIntensity={2.2} color="#eeeeee" />
    </mesh>
  );
}

/* 💡💡 ĐÈN SPOTLIGHT RẠP CHIẾU */
function CinemaSpotlights() {
  const left = useRef<THREE.SpotLight>(null);
  const right = useRef<THREE.SpotLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.7;

    if (left.current) {
      left.current.target.position.set(Math.sin(t) * 3.5, 2.5, -7 + Math.cos(t) * 2);
      left.current.target.updateMatrixWorld();
    }

    if (right.current) {
      right.current.target.position.set(Math.sin(t + Math.PI) * 3.5, 2.5, -7 + Math.cos(t + Math.PI) * 2);
      right.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      {/* Left spotlight */}
      <spotLight
        ref={left}
        position={[-4, 4, -5]}
        angle={0.5}
        penumbra={0.6}
        intensity={2.8}
        distance={30}
        color="#ffffff"
        castShadow
      />
      <object3D ref={(ref) => left.current && (left.current.target = ref!)} />

      {/* Right spotlight */}
      <spotLight
        ref={right}
        position={[4, 4, -5]}
        angle={0.5}
        penumbra={0.6}
        intensity={2.8}
        distance={30}
        color="#ffffff"
        castShadow
      />
      <object3D ref={(ref) => right.current && (right.current.target = ref!)} />
    </>
  );
}

/* 🎯 Dấu chấm xanh hiển thị ghế đang ngồi */
function SeatMarker({ position }: { position: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null);
  const offsetPos = position.clone();
  offsetPos.z += 0.35;

  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.12;
      ref.current.scale.setScalar(s);
    }
  });

  return (
    <mesh ref={ref} position={offsetPos}>
      <sphereGeometry args={[0.25, 16, 16]} />
      <meshStandardMaterial
        color="#22c55e"
        emissive="#22c55e"
        emissiveIntensity={1.3}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

/* 🎥 Điều khiển camera chuyển đến ghế đang chọn */
function CameraController({
  targetCam,
  orbitTarget,
}: {
  targetCam: CameraPos | null;
  orbitTarget: THREE.Vector3;
}) {
  const { camera } = useThree();

  useFrame(() => {
    if (!targetCam) return;

    const seatPos = new THREE.Vector3(...targetCam.position);
    const viewDir = new THREE.Vector3(...targetCam.target).sub(seatPos).normalize();

    const desiredPos = seatPos.clone().add(viewDir.multiplyScalar(-2.2));
    desiredPos.y += 0.2;

    camera.position.lerp(desiredPos, 0.08);
    camera.lookAt(orbitTarget);
  });

  return null;
}

/* 🎬 Component chính */
export default function CinemaScene({ selectedSeat }: { selectedSeat: string | null }) {
  const [cameraData, setCameraData] = useState<Record<string, CameraPos>>({});
  const [currentSeat, setCurrentSeat] = useState<string | null>(selectedSeat);
  const [orbitTarget, setOrbitTarget] = useState(new THREE.Vector3(0, 2, 0));
  const [seatPos, setSeatPos] = useState<THREE.Vector3 | null>(null);
  const orbitRef = useRef<any>(null);

  /* 🧭 Load camera positions */
  useEffect(() => {
    fetch("/models/camera_positions.json")
      .then((res) => res.json())
      .then((data) => {
        const map: Record<string, CameraPos> = {};
        data.forEach((cam: CameraPos) => {
          map[cam.name.replace("Camera_", "")] = cam;
        });
        setCameraData(map);
      });
  }, []);

  const updateSeatView = useCallback(
    (seat: string) => {
      if (cameraData[seat]) {
        const cam = cameraData[seat];
        const seatVec = new THREE.Vector3(...cam.position);
        setSeatPos(seatVec);

        const target = seatVec.clone();
        target.y += 0.7;

        setOrbitTarget(target);
        setCurrentSeat(seat);
      }
    },
    [cameraData]
  );

  useEffect(() => {
    if (selectedSeat) updateSeatView(selectedSeat);
  }, [selectedSeat, updateSeatView]);

  const moveSeat = (direction: "left" | "right") => {
    if (!currentSeat) return;
    const row = currentSeat[0];
    const num = parseInt(currentSeat.slice(1));
    const nextNum = direction === "left" ? num - 1 : num + 1;
    const nextSeat = `${row}${nextNum}`;
    if (cameraData[nextSeat]) updateSeatView(nextSeat);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") moveSeat("left");
      if (e.key === "ArrowRight") moveSeat("right");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [moveSeat]);

  const currentCam = useMemo(
    () => (currentSeat ? cameraData[currentSeat] : null),
    [currentSeat, cameraData]
  );

  return (
    <div className="relative w-full h-full">
      <Canvas shadows camera={{ position: [0, 10, 25], fov: 55 }}>
        {/* Ánh sáng tổng */}
        <ambientLight intensity={0.55} />
        <directionalLight position={[10, 15, 10]} intensity={2.2} castShadow />

        {/* Mô hình */}
        <CinemaModel />
        <ScreenLight />
        <CinemaSpotlights />

        {seatPos && <SeatMarker position={seatPos} />}
        {currentCam && <CameraController targetCam={currentCam} orbitTarget={orbitTarget} />}

        <OrbitControls
          ref={orbitRef}
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          target={orbitTarget}
          autoRotate={true}
          autoRotateSpeed={0.7}
          minDistance={3.0}
          maxDistance={8.0}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.1}
          rotateSpeed={1.0}
          zoomSpeed={1.1}
          dampingFactor={0.12}
          enableDamping={true}
        />
      </Canvas>

      {/* Nút chuyển ghế */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-4">
        <button
          onClick={() => moveSeat("left")}
          className="px-4 py-2 rounded-lg bg-gray-800/70 text-white hover:bg-gray-600 transition"
        >
          ← Ghế trái
        </button>
        <button
          onClick={() => moveSeat("right")}
          className="px-4 py-2 rounded-lg bg-gray-800/70 text-white hover:bg-gray-600 transition"
        >
          Ghế phải →
        </button>
      </div>
    </div>
  );
}
