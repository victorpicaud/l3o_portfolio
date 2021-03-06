import React, { Component } from 'react';
import * as THREE from "three";
import { Interaction } from 'three.interaction';
import CameraControls from 'camera-controls';
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
import SOLVIC from 'three/examples/fonts/helvetiker_regular.typeface.json';
import SimplexNoise from 'simplex-noise';
import Dat from 'dat.gui';

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

  decaymod = (cangle, tangle) => {
    let i = 0;

    while (tangle - cangle + 360 * i < 0) {
      i++;
    }
    return(i * 360);
  }

  handleResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  lockControls = () => {
    this.controls.enabled = false;
  }

  unlockControls = () => {
    this.controls.enabled = true;
  }

  makeRoughBall = (mesh, bassFr, treFr, reset) => {
    mesh.geometry.vertices.forEach((vertex, i) => {
        var offset = 0.5;
        var amp = this.amp;
        var time = window.performance.now();
        vertex.normalize();
        var rf = this.rf;
        var distance = (offset + bassFr ) + this.noise.noise3D(vertex.x + time *rf*7, vertex.y +  time*rf*8, vertex.z + time*rf*9) * amp * treFr;
        if (reset) {
          vertex.multiplyScalar(1);
        } else {
          vertex.multiplyScalar(distance/100);
        }
    });
    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.normalsNeedUpdate = true;
    mesh.geometry.computeVertexNormals();
    mesh.geometry.computeFaceNormals();
  }

  handleCloseClick = () => {
    if (!this.htmlaudio.paused) {
      this.htmlaudio.pause();
      this.isPlaying = false;
    }
    this.htmlaudio.currentTime = 0;
    this.controls.maxPolarAngle = Math.PI/2;
    this.pausebutton.visible = false;
    this.playbutton.visible = false;
    this.closebutton.visible = false;
    this.txtmesh.visible = false;
    this.descmesh.visible = false;
    this.controls.zoomTo( 1, true );
    this.controls.rotate(0, -Math.PI/2, true);
    this.objects.forEach( (object) => {
      object.on('click', this.handleMeshClick);
      object.on('mouseover', this.handleFocus);
      object.on('mouseout', this.scaleDownMeshEvent);
    });
    this.unlockControls();
    this.isLocked = false;
  }

  handlePlayClick = () => {
      if (!this.htmlaudio.paused) {
        this.htmlaudio.pause();
        this.pausebutton.visible = false;
        this.playbutton.visible = true;
      } else {
        this.htmlaudio.play();
        this.pausebutton.visible = true;
        this.playbutton.visible = false;
      }
      this.isPlaying = !this.htmlaudio.paused;
  }

  textFocusCam = ( event  ) => {
  }

  loadSound = (id, play) => {
    this.txtmesh.geometry = this.musicgeo[id];
    this.descmesh.geometry = this.genregeo[id];

    this.htmlaudio.pause();
    this.source.src = this.soundrefs[id];
    this.htmlaudio.load();
    if (play) {
      this.htmlaudio.play(); this.isPlaying = true;
    }
  }

  showButtonForTarget = (target) => {
    this.group.setRotationFromAxisAngle(this.axis, -1 * parseFloat(target.name));

    this.pausebutton.visible = true;
    this.playbutton.visible = false;
    this.closebutton.visible = true;
    this.txtmesh.visible = true;
    this.descmesh.visible = true;
  }

  handleMeshClick = ( event ) => {
    this.txtmesh.rotation.set(0,Math.PI/2,0);
    this.descmesh.rotation.set(0,Math.PI/2,0);
    this.descmesh.position.y *= -1.2;
    this.group.position.set(0,this.offsety,0);
    this.group.position.y = 0;
    this.isLocked = true;
    let tangle = 90 - THREE.Math.radToDeg(parseFloat(event.data.target.name) % 360);
    let cangle = THREE.Math.radToDeg(this.controls.azimuthAngle);
    let id = 0;

    for (let i = 0; i < this.objects.length; i++) {
      if( this.objects[i].id === event.data.target.id) {
        id = i;
      }
    }
    this.soundid = id;
    this.controls.damplingFactor = 0;
    let modular = this.decaymod(cangle, tangle);
    if ((event.data.originalEvent.clientX/ window.innerWidth) * 2 - 1 < -0.21) {
      modular = modular - 360;
    }
    let decay = (tangle);
    this.controls.maxPolarAngle = Math.PI/2 + Math.PI/4;
    this.controls.rotateTo(THREE.Math.degToRad(decay + modular), Math.PI/2 + Math.PI/64, true);
    this.controls.damplingFactor = 0.05;
    this.loadSound(id, true);
    this.showButtonForTarget(event.data.target);
    this.objects.forEach( (object) => {
      this.scaleDownMesh(object,true);
      object.off('click', this.handleMeshClick);
      object.off('mouseover', this.handleFocus);
      object.off('mouseout', this.scaleDownMeshEvent);
      object.scale.set(1,1,1);
    });
    this.controls.zoomTo( 1.2, true );
    this.lockControls();
  }

  handleFocus = ( event ) => {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId)
    }


    let id = 0;

    for (let i = 0; i < this.objects.length; i++) {
      if( this.objects[i].id === event.data.target.id) {
        id = i;
      }
    }

    for (let i = 0; i < this.tweend.length; i++) {
      if (this.objects[i].scale !== new THREE.Vector3(1, 1, 1) && i !== id) {
        this.scaleDownMesh(this.objects[i], false);
      }
    }
    var target = new THREE.Vector3(1.5, 1.5, 1.5);
    var current = event.data.target.scale;
    this.tweend[id] = new TWEEN.Tween(current).to(target, 1000);
    this.tweend[id].onUpdate(function() {
      event.data.target.scale.set(current.x, current.y, current.z);
    });


    this.tweend[id].easing(TWEEN.Easing.Bounce.In);
    this.tweend[id].start();
    this.txtmesh.geometry = this.musicgeo[id];
    this.txtmesh.visible = true;
    this.txtmesh.position.x = Math.cos( 0 ) * 4 * this.rscale;
    this.txtmesh.position.y = 2;
    this.txtmesh.position.z = Math.sin( 0 ) * 4 * this.rscale;
    this.group.setRotationFromAxisAngle(this.axis, 0);
    this.txtmesh.lookAt(this.camera.position);

    this.descmesh.geometry = this.genregeo[id];
    this.descmesh.visible = true;
    this.descmesh.position.x = Math.cos( 0 ) * 4 * this.rscale;
    this.descmesh.position.y = 1.5;
    this.descmesh.position.z = Math.sin( 0 ) * 4 * this.rscale;
    this.descmesh.lookAt(this.camera.position);

    this.group.position.set(-Math.cos( 0 ) * 4 * this.rscale,2,-Math.sin( 0 ) * 4 * this.rscale);

  }

  hideText = () => {
    if (this.isLocked === false) {
      this.txtmesh.visible = false;
      this.descmesh.visible = false;
    }
  }

  scaleDownMesh = (mesh,hidetxt) => {

    let id = 0;

    for (let i = 0; i < this.objects.length; i++) {
      if( this.objects[i].id === mesh.id) {
        id = i;
      }
    }

    var target = new THREE.Vector3(1, 1, 1);
    var current = mesh.scale;
    this.tweend[id] = new TWEEN.Tween(current).to(target, 1000);
    this.tweend[id].onUpdate(function() {
      mesh.scale.set(current.x, current.y, current.z);
    });
    this.tweend[id].easing(TWEEN.Easing.Bounce.Out);
    this.tweend[id].start();
    if (hidetxt) {
      this.timeoutId = window.setTimeout(this.hideText, 1000);
    }
  }

  scaleDownMeshEvent = ( event ) => {
    this.scaleDownMesh(event.data.target,true);
  }

  componentDidMount(){
    this.txtrotsv = null;
    this.timeoutId = null;
    this.isPlaying = false;
    this.soundid = 0;
    this.angle = 0;
    this.soundrefs = [S1,S2,S3,S4,S5,S6,S7,S8,S9,S10];
    let musictitles = ["MAGICAL NOTE WEAPON","BATTERY LOW","Endless Curiosity","DIVE IN HACK","DARKSTEEL COLOSSUS","DESERT B","DEEP BOOM BAP","PARIS BY NIGHT","PROD TWA24","POSEIDON"];
    let musicgenre = ['Experimental Dubstep','Jungle','Dubstep','Experimental Dubstep','Dubstep','(Jungle, Feat. x Stuckinwaveforms)','(Rap instrumental)', '(Rap instrumental)', '(Trap)','(Acousmatique)']
    this.rscale = 3/2;
    this.fft = 512;
    this.amp = 1;
    this.rf = 0.00001;
    var gui = new Dat.GUI();
    gui.add(this, 'amp', 0, 10, 0.1);
    gui.add(this, 'fft', 0, 1000, 1);
    gui.add(this, 'rf', 0, 0.0001, 0.000001);
    gui.add(this, 'angle',0, 360, 1);
    this.noise = new SimplexNoise();
    this.previd = null;
    this.objects = [];
    this.sounds = [];
    this.camtween = null;
    this.tweend = [null,null,null,null,null,null,null,null,null,null];
    this.isLocked = false;

    this.clock = new THREE.Clock();
    this.camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.01, 20 );
    this.camera.position.set( 0, 3, 10);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xffffffff );
    this.camera.lookAt( this.scene.position );

    this.listener = new THREE.AudioListener();
    this.camera.add( this.listener );

    this.sound = new THREE.Audio( this.listener );

    // this.htmlaudio = new Audio(S1);
    this.sound.setMediaElementSource( this.htmlaudio );

    this.audioLoader = new THREE.AudioLoader();

    this.analyser = new THREE.AudioAnalyser( this.sound, 32 );

    this.group = new THREE.Group();

    let pbgeometry = new THREE.CylinderGeometry( 0.5, 0.5, 0.1, 3 );
    let bargeometry = new THREE.BoxGeometry(1,0.1,0.3);
    let castergrometry = new THREE.BoxGeometry(1,0.1, 0.9);

    let buttonmaterial = new THREE.MeshBasicMaterial( {color: 0x0000000} );
    let castermaterial = new THREE.MeshLambertMaterial({
        transparent: true,
        opacity: 0
    });

    this.playbutton = new THREE.Mesh(pbgeometry, buttonmaterial);
    this.playbutton.position.x = Math.cos( 0 ) * 4 * this.rscale + 0.5;
    this.playbutton.position.y = 1;
    this.playbutton.position.z = Math.sin( 0 ) * 4 * this.rscale + 2;
    this.playbutton.rotation.set(Math.PI,0,Math.PI/2);
    this.playbutton.scale.set(0.5,0.5,0.5);
    this.group.add(this.playbutton);
    this.playbutton.visible = false;

    this.bar1 = new THREE.Mesh(bargeometry, buttonmaterial);
    this.bar2 = new THREE.Mesh(bargeometry, buttonmaterial);
    this.cbar1 = new THREE.Mesh(bargeometry, buttonmaterial);
    this.cbar2 = new THREE.Mesh(bargeometry, buttonmaterial);

    this.pausebuttoncaster = new THREE.Mesh(castergrometry, castermaterial);

    this.pausebuttoncaster.position.x = Math.cos( 0 ) * 4 * this.rscale + 0.5;
    this.pausebuttoncaster.position.y = 1;
    this.pausebuttoncaster.position.z = Math.sin( 0 ) * 4 * this.rscale + 2.15;
    this.pausebuttoncaster.rotation.set(Math.PI,0,Math.PI/2);
    this.pausebuttoncaster.scale.set(1,1,1);
    this.group.add(this.pausebuttoncaster);


    this.pausebutton = new THREE.Object3D();
    this.bar1.position.x = Math.cos( 0 ) * 4 * this.rscale + 0.5;
    this.bar1.position.y = 1;
    this.bar1.position.z = Math.sin( 0 ) * 4 * this.rscale + 2;
    this.bar1.rotation.set(Math.PI,0,Math.PI/2);
    this.bar1.scale.set(0.5,0.5,0.5);
    this.bar2.position.x = Math.cos( 0 ) * 4 * this.rscale + 0.5;
    this.bar2.position.y = 1;
    this.bar2.position.z = Math.sin( 0 ) * 4 * this.rscale + 2.3;
    this.bar2.rotation.set(Math.PI,0,Math.PI/2);
    this.bar2.scale.set(0.5,0.5,0.5);
    this.pausebutton.add(this.bar1);
    this.pausebutton.add(this.bar2);
    this.group.add(this.pausebutton);
    this.pausebutton.visible = false;

    this.closebutton = new THREE.Object3D();
    this.cbar1.position.x = Math.cos( 0 ) * 4 * this.rscale + 0.5;
    this.cbar1.position.y = 1;
    this.cbar1.position.z = Math.sin( 0 ) * 4 * this.rscale - 1.8;
    this.cbar1.rotation.set(0,Math.PI/2,-Math.PI/4);
    this.cbar1.scale.set(0.5,0.5,0.5);
    this.cbar2.position.x = Math.cos( 0 ) * 4 * this.rscale + 0.5;
    this.cbar2.position.y = 1;
    this.cbar2.position.z = Math.sin( 0 ) * 4 * this.rscale - 1.8;
    this.cbar2.rotation.set(0,Math.PI/2,Math.PI/4);
    this.cbar2.scale.set(0.5,0.5,0.5);
    this.closebutton.add(this.cbar1);
    this.closebutton.add(this.cbar2);
    this.closebutton.visible = false;
    this.group.add(this.closebutton);

    this.closebutton.on('click', this.handleCloseClick);
    this.pausebuttoncaster.on('click', this.handlePlayClick);
    this.playbutton.on('click', this.handlePlayClick);

    this.fontloader = new THREE.FontLoader();
    let txtmaterials = [
        new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } ), // front
        new THREE.MeshPhongMaterial( { color: 0xffffff } ) // side
      ];

    this.font = this.fontloader.parse(SOLVIC);
    this.musicgeo = [];
    this.genregeo = [];
    for ( let i = 0; i < musictitles.length; i ++ ) {
      let txtgeometry = new THREE.TextGeometry( musictitles[i], {
          font: this.font,
          size: 0.4,
          height: 0,
          curveSegments: 12,
      } );
      txtgeometry.center();
      let descgeo = new THREE.TextGeometry( musicgenre[i], {
          font: this.font,
          size: 0.2,
          height: 0,
          curveSegments: 12,
      } );
      descgeo.center();
      this.genregeo.push(descgeo);
      this.musicgeo.push(txtgeometry);
    }

    this.txtmesh = new THREE.Mesh(this.musicgeo[0],txtmaterials);
    this.txtmesh.position.x = Math.cos( 0 ) * 4 * this.rscale;
    this.txtmesh.position.y = 2;
    this.txtmesh.position.z = Math.sin( 0 ) * 4 * this.rscale;
    this.txtmesh.rotation.set(0,Math.PI/2,0);

    this.descmesh = new THREE.Mesh(this.musicgeo[0],txtmaterials);
    this.descmesh.position.x = Math.cos( 0 ) * 4 * this.rscale;
    this.descmesh.position.y = -2;
    this.descmesh.position.z = Math.sin( 0 ) * 4 * this.rscale;
    this.descmesh.rotation.set(0,Math.PI/2,0);
    this.txtmesh.visible = false;
    this.descmesh.visible = false;

    this.group.add(this.txtmesh);
    this.group.add(this.descmesh);

    this.scene.add(this.group);

    this.geometry = new THREE.IcosahedronGeometry(1, 4);
    const material = new THREE.MeshLambertMaterial({
        color: 0x0433FF,
        wireframe: true,
    });

    const count = 10;

    for ( let i = 0; i < count; i ++ ) {

      const mesh = new THREE.Mesh( this.geometry.clone(), material );

      const t = i / count * 2 * Math.PI;

      mesh.name = t;
      mesh.position.x = Math.cos( t ) * 4 * this.rscale;
      mesh.position.y = 0;
      mesh.position.z = Math.sin( t ) * 4 * this.rscale;
      mesh.on('click', this.handleMeshClick);
      mesh.on('mouseover', this.handleFocus);
      mesh.on('mouseout', this.scaleDownMeshEvent);
      this.scene.add( mesh );
      this.objects.push( mesh );

    }
    this.axis = new THREE.Vector3(0,1,0)


    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize( this.mount.clientWidth, this.mount.clientHeight );
    this.mount.appendChild(this.renderer.domElement)

    const interaction = new Interaction(this.renderer, this.scene, this.camera);

    console.log(interaction);

    this.controls = new CameraControls( this.camera, this.renderer.domElement );
    this.controls.enableDamping = true;
    this.controls.dollySpeed = 0;
    this.controls.maxPolarAngle = Math.PI/2;
    this.controls.minPolarAngle = Math.PI/2 - Math.PI/16;
    this.controls.rotateSpeed = 0.1;
    this.controls.autoRotate = false;
    this.controls.mouseButtons.wheel = CameraControls.ACTION.NONE;
    this.controls.mouseButtons.right = CameraControls.ACTION.NONE;
    this.controls.addEventListener( 'sleep', this.textFocusCam );



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
    this.analyser.fftSize = this.fft;

    if (this.isPlaying) {
      let dataArray = this.analyser.getFrequencyData();

      var lowerHalfArray = dataArray.slice(0, (dataArray.length/2) - 1);
      var upperHalfArray = dataArray.slice((dataArray.length/2) - 1, dataArray.length - 1);

      var lowerMax = this.max(lowerHalfArray);
      var upperAvg = this.avg(upperHalfArray);

      var lowerMaxFr = lowerMax / lowerHalfArray.length;
      var upperAvgFr = upperAvg / upperHalfArray.length;

      this.makeRoughBall(this.objects[this.soundid], this.modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), this.modulate(upperAvgFr, 0, 1, 0, 4), false);
    } else {
      this.makeRoughBall(this.objects[this.soundid], 0, 0, true);
    }
    this.group.rotateOnWorldAxis(this.axis, THREE.Math.degToRad(this.angle));
    window.requestAnimationFrame( this.animate );

    const delta = this.clock.getDelta();
    this.controls.update( delta );
    TWEEN.update();
    this.renderer.render( this.scene, this.camera );
   }

  render () {
    return(
      <>
        <audio ref={(audio) => { this.htmlaudio = audio }} style={{display: "none" }}  >
        <source src={S1} ref={(source) => { this.source = source }} type="audio/wav"/>
        </audio>
        <div
          style={{width: "100%", height: "100%"}}
          ref={(mount) => { this.mount = mount }}
          />
      </>
    );
  }
}

export default Spectrum;
