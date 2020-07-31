import React, { Component } from 'react';
import * as THREE from "three";
import { Interaction } from 'three.interaction';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class Spectrum extends Component {

  constructor(props) {
    super(props);

    this.state = {
      height: 400,
      width: 400,
      focusing: false
    }
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
    console.log(event.target.position);
    console.log(this.camera);
    this.controls.autoRotateSpeed = -(this.controls.autoRotateSpeed + 2);
  }

  componentDidMount(){
    this.objects = [];

    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 20 );
    this.camera.position.set( 0, 3, 7 );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xffffffff );
    this.camera.lookAt( this.scene.position );

    const geometry = new THREE.BoxBufferGeometry();
    const material = new THREE.MeshNormalMaterial();

    const count = 5;

    for ( let i = 0; i < count; i ++ ) {

      const mesh = new THREE.Mesh( geometry, material );

      const t = i / count * 2 * Math.PI;

      mesh.position.x = Math.cos( t ) * 4;
      mesh.position.z = Math.sin( t ) * 4;
      mesh.on('click', this.handleMeshClick);
      this.scene.add( mesh );
      this.objects.push( mesh );

    }

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize( this.mount.clientWidth, this.mount.clientHeight );
    this.mount.appendChild(this.renderer.domElement)

    const interaction = new Interaction(this.renderer, this.scene, this.camera);

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.enableDamping = true;
    this.controls.enableZoom = false;
    this.controls.maxPolarAngle = Math.PI/2;
    this.controls.minPolarAngle = Math.PI/4 + Math.PI/8;
    this.controls.rotateSpeed = 0.5;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = -2.0;
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
    for ( let object of this.objects ) {

      object.rotation.z += 0.005;
      object.rotation.x += 0.002;
    }
    this.controls.update();

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