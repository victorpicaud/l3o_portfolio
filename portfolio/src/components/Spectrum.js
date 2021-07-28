import React, { Component } from 'react';
import * as THREE from "three";
import { Interaction } from 'three.interaction';
import TWEEN from '@tweenjs/tween.js';
import S1 from '../assets/sounds/1.wav';
import S2 from '../assets/sounds/2.wav';
import S3 from '../assets/sounds/3.wav';
import S4 from '../assets/sounds/4.wav';
import S5 from '../assets/sounds/5.wav';
import S6 from '../assets/sounds/6.wav';
import S7 from '../assets/sounds/7.wav';
import S8 from '../assets/sounds/8.wav';
import S9 from '../assets/sounds/9.wav';
import S10 from '../assets/sounds/10.wav';
import PLAYEROBJ from '../assets/obj/player.obj'
import SOLVIC from 'three/examples/fonts/helvetiker_regular.typeface.json';
import SimplexNoise from 'simplex-noise';
import Dat from 'dat.gui';
import {TransformControls} from "./TransformControls";
import { OBJLoader }  from "three/examples/jsm/loaders/OBJLoader.js"
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass'


function Box(props) {
  // This reference will give us direct access to the THREE.Mesh object
  // Set up state for the hovered and active state
  const groupref = React.useRef()

  // // Subscribe this component to the render-loop, rotate the mesh every frame
  // useFrame((state, delta) => ())
  // Return the view, these are regular Threejs elements expressed in JSX
  const rscale = 1.4;
  const soundrefs = [S1,S2,S3,S4,S5,S6,S7,S8,S9,S10];
  const material = new THREE.MeshPhongMaterial( {
    color: 0x00f000,
    emissive: 0x00,
    wireframe: true,
  } );
  const geometry = new THREE.IcosahedronGeometry(1, 5);

    // mesh.on('click', this.handleMeshClick);
    // mesh.on('mouseover', this.handleFocus);
    // mesh.on('mouseout', this.scaleDownMeshEvent);



  return (
    <group dispose={null} ref={groupref}>
      {soundrefs.map(function(ref, count){
        const t = count / soundrefs.length * 2 * Math.PI;
        const position = [Math.cos( t ) * 4 * rscale,0,Math.sin( t ) * 4 * rscale]
        return(
          <mesh key={count} geometry={geometry} material={material} position={position}/>
        );
      })}
    </group>
  )
}

function Spectrum(props) {

  const cameraref = React.useRef()

  // This reference will give us direct access to the THREE.Mesh object
  return (
    <Canvas style={{display: 'flex', height: '100vh'}}
      onCreated={({ camera }) => camera.lookAt(0,0,0)}>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} maxPolarAngle={Math.PI/2} minPolarAngle={Math.PI/2 - Math.PI/16} />
      <PerspectiveCamera
        ref={cameraref}
        makeDefault // Registers it as the default camera system-wide (default=false)
        fov={90}
        near={0.01}
        far={1000}
        position={[0, 3, 10]}
         // All THREE.PerspectiveCamera props are valid
      />
      <ambientLight args={[0x404040, 1]} />
      <Box />
      <EffectComposer>
       <Bloom  intensity={1} luminanceThreshold={0} />
     </EffectComposer>
    </Canvas>
  )
}

export default Spectrum;
