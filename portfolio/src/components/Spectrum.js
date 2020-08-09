import React, { Component } from 'react';
import * as THREE from "three";
import { Interaction } from 'three.interaction';
import CameraControls from 'camera-controls';
import TWEEN from '@tweenjs/tween.js';
import REZZ from '../assets/sounds/rezz-edge.mp3';
import SimplexNoise from 'simplex-noise';

CameraControls.install( { THREE: THREE } );

class Spectrum extends Component {

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

  handleResize = () => {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;

    this.setState({ width: this.mount.clientWidth, height: this.mount.clientHeight });

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
  }

  makeRoughBall = (mesh, bassFr, treFr) => {
    mesh.geometry.vertices.forEach((vertex, i) => {
        var offset = 0.5;
        var amp = 1;
        var time = window.performance.now();
        vertex.normalize();
        var rf = 0.00001;
        var distance = (offset + bassFr ) + this.noise.noise3D(vertex.x + time *rf*7, vertex.y +  time*rf*8, vertex.z + time*rf*9) * amp * treFr;
        vertex.multiplyScalar(distance/200);
    });
    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.normalsNeedUpdate = true;
    mesh.geometry.computeVertexNormals();
    mesh.geometry.computeFaceNormals();
  }

  handleMeshClick = ( event ) => {
    let tangle = THREE.Math.radToDeg(parseFloat(event.data.target.name) % 360);
    let cangle = THREE.Math.radToDeg(this.controls.azimuthAngle) % 360;
    console.log(90 - tangle);
    this.controls.damplingFactor = 0;
    let decay = Math.min(90 - tangle, 90 + tangle);
    this.controls.rotateTo(THREE.Math.degToRad(decay), 0, true);
    this.controls.damplingFactor = 0.05;
    if (this.sound.isPlaying) {
      this.sound.stop();
    } else {
      this.sound.play();
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
    this.noise = new SimplexNoise();
    this.objects = [];
    this.camtween = null;
    this.tweend = null;

    this.clock = new THREE.Clock();
    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 20 );
    this.camera.position.set( 0, 3, 7 );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xffffffff );
    this.camera.lookAt( this.scene.position );

    this.listener = new THREE.AudioListener();
    this.camera.add( this.listener );

    this.sound = new THREE.Audio( this.listener );

    this.audioLoader = new THREE.AudioLoader();
    this.audioLoader.load( REZZ, (buffer) => {
                this.sound.setBuffer(buffer);
                this.sound.setLoop(true);

                this.setState({duration: buffer.duration});
            }, (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            });

    this.analyser = new THREE.AudioAnalyser( this.sound, 32 );
    this.analyser.fftSize = 512;

    const geometry = new THREE.IcosahedronGeometry(0.5, 4);
    const material = new THREE.MeshLambertMaterial({
        color: 0xff00ee,
        wireframe: true
    });

    const count = 5;

    for ( let i = 0; i < count; i ++ ) {

      const mesh = new THREE.Mesh( geometry.clone(), material );

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
    if (this.sound.isPlaying) {
      let dataArray = this.analyser.getFrequencyData();

      var lowerHalfArray = dataArray.slice(0, (dataArray.length/2) - 1);
      var upperHalfArray = dataArray.slice((dataArray.length/2) - 1, dataArray.length - 1);

      var overallAvg = this.avg(dataArray);
      var lowerMax = this.max(lowerHalfArray);
      var lowerAvg = this.avg(lowerHalfArray);
      var upperMax = this.max(upperHalfArray);
      var upperAvg = this.avg(upperHalfArray);

      var lowerMaxFr = lowerMax / lowerHalfArray.length;
      var lowerAvgFr = lowerAvg / lowerHalfArray.length;
      var upperMaxFr = upperMax / upperHalfArray.length;
      var upperAvgFr = upperAvg / upperHalfArray.length;

      this.makeRoughBall(this.objects[0], this.modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), this.modulate(upperAvgFr, 0, 1, 0, 4));
    } else {
      this.objects[0].geometry = new THREE.IcosahedronGeometry(0.5, 4);
    }
    window.requestAnimationFrame( this.animate );

    const delta = this.clock.getDelta();
    const hasControlsUpdated = this.controls.update( delta );
    TWEEN.update();
    this.renderer.render( this.scene, this.camera );
   }

  render () {
    return(
        <div
          style={{width: 800, height: "600px"}}
          ref={(mount) => { this.mount = mount }}
          />
    );
  }
}

export default Spectrum;