import React, { Component } from 'react';
import * as THREE from "three";
import { Interaction } from 'three.interaction';
import CameraControls from 'camera-controls';
import TWEEN from '@tweenjs/tween.js';
import SimplexNoise from 'simplex-noise';
import Dat from 'dat.gui';

CameraControls.install( { THREE: THREE } );

class Video extends Component {

  constructor(props) {
    super(props);

    this.state = {
      height: 400,
      width: 400,
      focusing: false,
      duration: 0
    }
  }

  fractionate = (val, minVal, maxVal) => {
    return (val - minVal)/(maxVal - minVal);
  }

  modulate = (val, minVal, maxVal, outMin, outMax) => {
    var fr = this.fractionate(val, minVal, maxVal);
    var delta = outMax - outMin;
    return outMin + (fr * delta);
  }

  avg = (arr) => {
    var total = arr.reduce(function(sum, b) { return sum + b; });
    return (total / arr.length);
  }

  max = (arr) => {
    return arr.reduce(function(a, b){ return Math.max(a, b); })
  }

  decaymod = (cangle, tangle) => {
    let i = 0;

    while (tangle - cangle + 360 * i < 0) {
      i++;
    }
    return(i * 360);
  }

  handleResize = () => {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;

    this.setState({ width: this.mount.clientWidth, height: this.mount.clientHeight });

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
  }


  handleMeshClick = ( event ) => {
    let tangle = 90 - THREE.Math.radToDeg(parseFloat(event.data.target.name) % 360);
    let cangle = THREE.Math.radToDeg(this.controls.azimuthAngle);

    this.controls.damplingFactor = 0;
    let modular = this.decaymod(cangle, tangle);
    if ((event.data.originalEvent.clientX/ window.innerWidth) * 2 - 1 < -0.21) {
      modular = modular - 360;
    }
    this.previd = event.target.id
    let decay = (tangle);
    this.controls.rotateTo(THREE.Math.degToRad(decay + modular), 0, true);
    this.controls.damplingFactor = 0.05;
    if (this.objects[0].id === event.target.id) {
      if (this.sound.isPlaying) {
        this.sound.stop();
      } else {
        this.sound.play();
      }
    }
  }

  handleFocus = ( event ) => {
    var target = new THREE.Vector3(1.5, 1.5, 1.5);
    var current = event.data.target.scale;
    this.tweend = new TWEEN.Tween(current).to(target, 1000);
    this.tweend.onUpdate(function() {
      event.data.target.scale.set(current.x, current.y, current.z);
    });
    this.tweend.easing(TWEEN.Easing.Bounce.In);
    this.tweend.start();
  }

  scaleDownMesh = ( event ) => {
    var target = new THREE.Vector3(1, 1, 1);
    var current = event.data.target.scale;
    this.tweend = new TWEEN.Tween(current).to(target, 1000);
    this.tweend.onUpdate(function() {
      event.data.target.scale.set(current.x, current.y, current.z);
    });
    this.tweend.easing(TWEEN.Easing.Bounce.Out);
    this.tweend.start();
  }

  componentDidMount(){
    this.fft = 512;
    this.amp = 1;
    this.rf = 0.00001;
    var gui = new Dat.GUI();
    gui.add(this, 'amp', 0, 10, 0.1);
    gui.add(this, 'fft', 0, 1000, 1);
    gui.add(this, 'rf', 0, 0.0001, 0.000001);
    this.noise = new SimplexNoise();
    this.previd = null;
    this.objects = [];
    this.camtween = null;
    this.tweend = null;

    this.clock = new THREE.Clock();
    this.camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.01, 20 );
    this.camera.position.set( 0, 3, 7 );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xffffffff );
    this.camera.lookAt( this.scene.position );

    this.geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshLambertMaterial({
        color: 0x0433FF,
        wireframe: true
    });

    const count = 5;

    for ( let i = 0; i < count; i ++ ) {

      const mesh = new THREE.Mesh( this.geometry.clone(), material );

      const t = i / count * 2 * Math.PI;

      mesh.name = t;
      mesh.position.x = Math.cos( t ) * 4;
      mesh.position.z = Math.sin( t ) * 4;
      mesh.on('click', this.handleMeshClick);
      mesh.on('mouseover', this.handleFocus);
      mesh.on('mouseout', this.scaleDownMesh);
      this.scene.add( mesh );
      this.objects.push( mesh );

    }

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize( this.mount.clientWidth, this.mount.clientHeight );
    this.mount.appendChild(this.renderer.domElement)

    const interaction = new Interaction(this.renderer, this.scene, this.camera);

    this.controls = new CameraControls( this.camera, this.renderer.domElement );
    this.controls.enableDamping = true;
    this.controls.dollyToCursor = true;
    this.controls.dollySpeed = 0;
    this.controls.maxPolarAngle = Math.PI/2;
    this.controls.minPolarAngle = Math.PI/4 + Math.PI/8;
    this.controls.rotateSpeed = 0.1;
    this.controls.autoRotate = false;
    this.controls.enableKeys = false;




    this.start();
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  }
  componentWillUnmount(){
      this.stop();
      window.removeEventListener("resize", this.handleResize);
      this.mount.removeChild(this.renderer.domElement);
    }
  start = () => {
      if (!this.frameId) {
        this.frameId = requestAnimationFrame(this.animate)
      }
    }
  stop = () => {
      cancelAnimationFrame(this.frameId)
    }
  animate = () => {

    window.requestAnimationFrame( this.animate );

    const delta = this.clock.getDelta();
    const hasControlsUpdated = this.controls.update( delta );
    TWEEN.update();
    this.renderer.render( this.scene, this.camera );
   }

  render () {
    return(
        <div
          style={{width: "100%", height: "500px"}}
          ref={(mount) => { this.mount = mount }}
          />
    );
  }
}

export default Video;
