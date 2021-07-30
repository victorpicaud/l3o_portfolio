import React, { Component  } from 'react';
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
import { Canvas, useFrame, extend, useThree, Dom } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Html, useProgress } from '@react-three/drei'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass'
import { WaveSpinner } from "react-spinners-kit";



function Box(props) {
  //----------------STATES-----------------:

  // This reference will give us direct access to the THREE.Mesh object
  // Set up state for the hovered and active state
  const groupref = React.useRef()
  const textgroupref = React.useRef()

  React.useEffect(() => {
    if(textgroupref.current) {
      textgroupref.current.children.forEach((text) => text.visible = false)
    }
  },[]);
  // // Subscribe this component to the render-loop, rotate the mesh every frame
  // useFrame((state, delta) => ())
  // Return the view, these are regular Threejs elements expressed in JSX
  const rscale = 1.4;
  const soundrefs = [S1,S2,S3,S4,S5,S6,S7,S8,S9,S10];
  let musictitles = ["MAGICAL NOTE WEAPON","BATTERY LOW","Endless Curiosity","DIVE IN HACK","DARKSTEEL COLOSSUS","DESERT B","DEEP BOOM BAP","PARIS BY NIGHT","PROD TWA24","POSEIDON"];
  let musicgenre = ['Experimental Dubstep','Jungle','Dubstep','Experimental Dubstep','Dubstep','(Jungle, Feat. x Stuckinwaveforms)','(Rap instrumental)', '(Rap instrumental)', '(Trap)','(Acousmatique)']


  const material = new THREE.MeshPhongMaterial( {
    color: 0x00f000,
    emissive: 0x00,
    wireframe: true,
  } );
  const geometry = new THREE.IcosahedronGeometry(1, 5);

  const fontloader = new THREE.FontLoader();
  let txtmaterials = [
      new THREE.MeshPhongMaterial( { color: 0xffffff } ), // front
      new THREE.MeshPhongMaterial( { color: 0xffffff } ) // side
    ];

  const font = fontloader.parse(SOLVIC);
  const musicgeo = [];
  const genregeo = [];
  for ( let i = 0; i < musictitles.length; i ++ ) {
    const txtgeometry = new THREE.TextGeometry( musictitles[i], {
        font: font,
        size: 0.4,
        height: 0,
        curveSegments: 12,
    } );
    txtgeometry.center();
    const descgeo = new THREE.TextGeometry( musicgenre[i], {
        font: font,
        size: 0.2,
        height: 0,
        curveSegments: 12,
    } );
    descgeo.center();
    genregeo.push(descgeo);
    musicgeo.push(txtgeometry);
  }
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
      <group dispose={null} ref={textgroupref}>
      {musicgeo.map(function(title, idx){
        const txtposition = [Math.cos( 0 ) * 4 * rscale,2,Math.sin( 0 ) * 4 * rscale]
        const descposition = [Math.cos( 0 ) * 4 * rscale,-2,Math.sin( 0 ) * 4 * rscale]
        return(
          <>
            <mesh key={idx} geometry={title} material={txtmaterials} position={txtposition}/>
            <mesh key={idx + 1000} geometry={genregeo[idx]} material={txtmaterials} position={descposition}/>
          </>
        );
      })}
      </group>
    </group>
  )
}


function Spectrum(props) {

  const cameraref = React.useRef()

  React.useEffect(() => {
    // returned function will be called on component unmount
    return () => {
      props.setLoading(true);
    }
  }, [])
  // This reference will give us direct access to the THREE.Mesh object
  return (
      <Canvas style={{display: 'flex', height: '100vh'}} onCreated={({ camera }) => {camera.lookAt(0,0,0); props.setLoading(false)}}>
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
