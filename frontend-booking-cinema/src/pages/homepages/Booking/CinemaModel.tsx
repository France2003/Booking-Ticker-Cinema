// import { useGLTF } from "@react-three/drei";
// import * as THREE from "three";
// import { useEffect } from "react";

// export default function CinemaModel() {
//   const { scene } = useGLTF("/models/cinema_room.glb");

//   useEffect(() => {
//     scene.traverse((child) => {
//       if ((child as THREE.Mesh).isMesh) {
//         const mesh = child as THREE.Mesh;
//         mesh.castShadow = true;
//         mesh.receiveShadow = true;
//         mesh.material.side = THREE.DoubleSide;
//       }
//     });
//   }, [scene]);

//   return (
//     <primitive
//       object={scene}
//       scale={0.95}
//       position={[0, -1, 0]}
//       rotation={[0, Math.PI, 0]}
//     />
//   );
// }

// useGLTF.preload("/models/cinema_room.glb");
