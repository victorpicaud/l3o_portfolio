import * as React from 'react'
import { Vector3 } from 'three'
import { Canvas } from '@react-three/fiber';
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { useLoader } from "@react-three/fiber";
import Model from './Scene.js'
import {
  Environment,
  OrbitControls,
  Html,
  useProgress
} from "@react-three/drei";

function Loader() {
  const { progress } = useProgress()
  return <Html center>{progress} % loaded</Html>
}

function Fbx(props) {
  return(
    <Canvas style={{display: 'flex', height: '100vh'}} onCreated={() => { props.setLoading(false)}} >
        <React.Suspense fallback={<Loader/>}>
          <Model scale={0.001}/>
          <OrbitControls />
          <Environment preset="sunset" background />
        </React.Suspense>
    </Canvas>
    );
}

export default Fbx;
