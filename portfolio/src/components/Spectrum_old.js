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
import PLAYEROBJ from '../assets/obj/player.obj'
import SOLVIC from 'three/examples/fonts/helvetiker_regular.typeface.json';
import SimplexNoise from 'simplex-noise';
import Dat from 'dat.gui';
import {TransformControls} from "./TransformControls";
import { OBJLoader }  from "three/examples/jsm/loaders/OBJLoader.js"
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';


CameraControls.install( { THREE: THREE } );

class Spectrum extends Component {

  constructor(props) {
    super(props);

    this.state = {
      height: 400,
      width: 400,
      focusing: false,
      duration: 0,
      isLocked: false,
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

  handleResize = ( event ) => {
    this.camera.aspect = this.mount.clientWidth / this.mount.clientHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(  this.mount.clientWidth,this.mount.clientHeight );
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
        var amp = this.amp * 5.6;
        var time = window.performance.now();
        vertex.normalize();
        var rf = this.rf;
        var distance = (offset + bassFr * amp ) + this.noise.noise3D(vertex.x + time *rf*7, vertex.y +  time*rf*8, vertex.z + time*rf*9) * 10 * treFr;
        if (reset) {
          vertex.multiplyScalar(1);
        } else {
          vertex.multiplyScalar(distance/1700);
        }
    });
    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.normalsNeedUpdate = true;
    mesh.geometry.computeVertexNormals();
    mesh.geometry.computeFaceNormals();
  }

  handleCloseClick = ( event ) => {
    // this.caster.off('click', this.handlePlayClick);
    // this.caster2.off('click', this.handleCloseClick);
    if(event) {
      event.stopPropagation();
    }
    this.objects.forEach( (object) => {
      object.on('click', this.handleMeshClick);
      object.on('mouseover', this.handleFocus);
      object.on('mouseout', this.scaleDownMeshEvent);
      object.visible = true;
    });
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
    this.unlockControls();
    this.isLocked = false;
    this.setState({isLocked: false});
    this.spherecontrols.detach();
  }

  handlePlayClick = ( event ) => {
    console.log("playclick")
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

  textFocusCam = ( event ) => {
    this.timeoutId = window.setTimeout(this.hideText, 1000);
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

    // this.caster.on('click', this.handlePlayClick);
    // this.caster2.on('click', this.handleCloseClick);
    const targ = event.data.target
    if (event.stopPropagation) {
    }
    let id = -1;

    for (let i = 0; i < this.objects.length; i++) {
      if( this.objects[i].uuid === targ.uuid) {
        id = i;
      }
    }
    if (true || id !== -1) {
      this.objects.forEach( (object) => {
        this.scaleDownMesh(object,true);
        object.off('click', this.handleMeshClick);
        object.off('mouseover', this.handleFocus);
        object.off('mouseout', this.scaleDownMeshEvent);
        object.scale.set(0.5,0.5,0.5);
        if(object.id !== targ.id) {
          object.visible = false;
        } else {
          this.spherecontrols.attach( object );
        }
      });
      this.audiocontext.resume()
      this.txtmesh.rotation.set(0,Math.PI/2,0);
      this.txtmesh.position.y = 2.7
      this.descmesh.rotation.set(0,Math.PI/2,0);
      this.descmesh.position.y = -1.4;
      this.group.position.set(0,0,0);
      let tangle = 90 - THREE.Math.radToDeg(parseFloat(targ.name) % 360);
      let cangle = THREE.Math.radToDeg(this.controls.azimuthAngle);

      this.soundid = id;
      this.controls.damplingFactor = 0;
      let modular = this.decaymod(cangle, tangle);
      if ((event.data.originalEvent.clientX/ window.innerWidth) * 2 - 1 < -0.21) {
        modular = modular - 360;
      }
      let decay = (tangle);
      this.controls.maxPolarAngle = Math.PI/2 + Math.PI/4;
      this.controls.rotateTo(THREE.Math.degToRad((decay + modular)%360), Math.PI/2 + Math.PI/64, true);
      this.controls.damplingFactor = 0.05;
      this.loadSound(id, true);
      this.showButtonForTarget(targ);
      this.controls.zoomTo( 1.2, true );
      this.lockControls();
      this.spherecontrols.enabled = true;
      this.isLocked = true;
      this.setState({isLocked: true});
    }
  }

  handleFocus = ( event ) => {
    this.stoptime = true;
    const targ = event.data.target;
    let id = -1;

    for (let i = 0; i < this.objects.length; i++) {
      if( this.objects[i].uuid === targ.uuid) {
        id = i;
      }
    }
    if (true || id !== -1) {
      if (this.timeoutId) {
        window.clearTimeout(this.timeoutId)
      }

      for (let i = 0; i < this.tweend.length; i++) {
        if (this.objects[i].scale !== new THREE.Vector3(1, 1, 1) && i !== id) {
          this.scaleDownMesh(this.objects[i], false);
        }
      }
      var target = new THREE.Vector3(1.5, 1.5, 1.5);
      var current = targ.scale;
      this.tweend[id] = new TWEEN.Tween(current).to(target, 1000);
      this.tweend[id].onUpdate(function() {
        targ.scale.set(current.x, current.y, current.z);
      });


      this.tweend[id].easing(TWEEN.Easing.Bounce.In);
      this.tweend[id].start();
      this.txtmesh.geometry = this.musicgeo[id];
      this.txtmesh.visible = true;
      this.txtmesh.position.x = Math.cos( 0 ) * 4 * this.rscale;
      this.txtmesh.position.y = 2;
      this.txtmesh.position.z = Math.sin( 0 ) * 4 * this.rscale;
      this.group.setRotationFromAxisAngle(this.axis, 0);

      this.descmesh.geometry = this.genregeo[id];
      this.descmesh.visible = true;
      this.descmesh.position.x = Math.cos( 0 ) * 4 * this.rscale;
      this.descmesh.position.y = 1.5;
      this.descmesh.position.z = Math.sin( 0 ) * 4 * this.rscale;

      this.group.position.set(-Math.cos( 0 ) * 4 * this.rscale,2,-Math.sin( 0 ) * 4 * this.rscale);
      }
    }

    hideText = () => {
      if (this.isLocked === false) {
        this.txtmesh.visible = false;
        this.descmesh.visible = false;
      }
    }

    scaleDownMesh = (mesh,hidetxt) => {
      this.stoptime = false;
      let id = 0;

      for (let i = 0; i < this.objects.length; i++) {
        if( this.objects[i].uuid === mesh.uuid) {
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
    const targ = event.data.target
    this.scaleDownMesh(targ,true);
  }

  rotateEvent = ( event ) => {
    if (this.controls.enabled) {
      if (event.code === "ArrowRight") {
        this.rotateRight();
      } else if (event.code === "ArrowLeft") {
        this.rotateLeft();
      }
    } else if (event.code === "Space") {
      event.preventDefault();
      this.handlePlayClick();
    } else if (event.code === "Escape") {
      event.preventDefault();
      this.handleCloseClick();
    }
  }

  getNearest = (isRight) => {
    let tmp = []
    for (let obj in this.objects) {
      tmp.push({id: obj, value: this.objects[obj].position.distanceTo(this.camera.position)})
    }
    tmp.sort((obj1, obj2) => {return(obj1.value - obj2.value)})
    if (this.objects[tmp[0].id].position.x > 0) {
      return(isRight ? this.objects[tmp[0].id] : this.objects[tmp[1].id])
    } else {
      return(isRight ? this.objects[tmp[1].id] : this.objects[tmp[0].id])
    }
  }

  rotateRight = () => {
    console.log(this.getNearest())
    let angleTo = 360/this.objects.length
  	// save the start angle
  	let startAzimuthAngle = this.controls.azimuthAngle;
  	new TWEEN.Tween( this.controls )
  		.to( { azimuthAngle: angleTo * THREE.MathUtils.DEG2RAD + startAzimuthAngle }, 1000 )
  		.easing( TWEEN.Easing.Quadratic.In )
  		.onStart( () => {
        this.txtmesh.visible =  true;

  			// disable user control while the animation
  			this.lockControls();
  		} )
  		.onComplete( () => {

  			this.unlockControls();

  		} )
  		.start();
  }

  rotateLeft = () => {
    let angleTo = -360/this.objects.length
  	// save the start angle
  	let startAzimuthAngle = this.controls.azimuthAngle;
  	new TWEEN.Tween( this.controls )
  		.to( { azimuthAngle: angleTo * THREE.MathUtils.DEG2RAD + startAzimuthAngle }, 1000 )
  		.easing( TWEEN.Easing.Quadratic.In )
  		.onStart( () => {
        this.txtmesh.visible = true;

  			// disable user control while the animation
  			this.lockControls();
  		} )
  		.onComplete( () => {

  			this.unlockControls();

  		} )
  		.start();
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
    this.rscale = 1.4;
    this.fft = 512;
    this.amp = 1;
    this.rf = 0.00001;
    // var gui = new Dat.GUI();
    // gui.add(this, 'amp', 0, 10, 0.1);
    // gui.add(this, 'fft', 0, 1000, 1);
    // gui.add(this, 'rf', 0, 0.0001, 0.000001);
    // gui.add(this, 'angle',0, 360, 1);
    this.noise = new SimplexNoise();
    this.previd = null;
    this.objects = [];
    this.sounds = [];
    this.camtween = null;
    this.tweend = [null,null,null,null,null,null,null,null,null,null];
    this.isLocked = false;

    this.clock = new THREE.Clock();
    this.camera = new THREE.PerspectiveCamera( 90, window.innerWidth / (window.innerHeight), 0.01, 20 );
    this.camera.position.set( 0, 3, 10);

    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer( {canvas: this.mount.domElement,  alpha: true } );
    this.renderer.setSize( window.innerWidth, window.innerHeight  );
    this.renderer.autoClear = false;
    this.renderer.setClearColor(0x000000, 0.0);
    this.mount.appendChild(this.renderer.domElement)
    const interaction = new Interaction(this.renderer, this.scene, this.camera, true);

    this.camera.lookAt( this.scene.position );

    this.listener = new THREE.AudioListener();
    this.camera.add( this.listener );


    this.sound = new THREE.Audio( this.listener );

    // this.htmlaudio = new Audio(S1);
    this.sound.setMediaElementSource( this.htmlaudio );

    this.audioLoader = new THREE.AudioLoader();

    this.audiocontext = THREE.AudioContext.getContext();

    this.analyser = new THREE.AudioAnalyser( this.sound, 32 );

    this.group = new THREE.Group();

    const objloader = new OBJLoader();

    objloader.load(
    	PLAYEROBJ,
    	( object ) => {
         console.log("tEST:",object)
         object.scale.set(0.05,0.05,0.05)
         for (let i in object.children) {
              object.children[i].visible = false
          }
        this.scene.add(object)
        this.playbutton = object.children[1]
        this.playbutton.geometry.center()
        this.playbutton.rotation.set(Math.PI/2,0,-Math.PI/2)
        this.playbutton.position.x = Math.cos( 0 ) * 4 * this.rscale + 0.5;
        this.playbutton.position.y = 1;
        this.playbutton.position.z = Math.sin( 0 ) * 4 * this.rscale + 2;
        this.playbutton.scale.set(0.02,0.02,0.02);

        this.pausebutton = object.children[12]
        this.pausebutton.geometry.center()
        this.pausebutton.rotation.set(Math.PI/2,0,-Math.PI/2)
        this.pausebutton.position.x = Math.cos( 0 ) * 4 * this.rscale + 0.5;
        this.pausebutton.position.y = 1;
        this.pausebutton.position.z = Math.sin( 0 ) * 4 * this.rscale + 2;
        this.pausebutton.scale.set(0.02,0.02,0.02);

        this.closebutton = object.children[15]
        this.closebutton.geometry.center()
        this.closebutton.rotation.set(Math.PI/2,0,-Math.PI/2)
        this.closebutton.position.x = Math.cos( 0 ) * 4 * this.rscale + 0.5;
        this.closebutton.position.y = 1;
        this.closebutton.position.z = Math.sin( 0 ) * 4 * this.rscale - 1.8;
        this.closebutton.scale.set(0.02,0.02,0.02);

        this.group.add(this.playbutton)
        this.group.add(this.pausebutton)
        this.group.add(this.closebutton)
      },
    	// called when loading is in progresses
    	function ( xhr ) {

    		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

    	},
    	// called when loading has errors
    	function ( error ) {

    		console.log( 'An error happened:', error );

    	}
    );

    const light = new THREE.AmbientLight( 0x404040 ); // soft white light
    this.scene.add( light );

    this.fontloader = new THREE.FontLoader();
    let txtmaterials = [
        new THREE.MeshPhongMaterial( { color: 0xffffff } ), // front
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

    this.geometry = new THREE.IcosahedronGeometry(1, 5);
    // const material = new THREE.MeshLambertMaterial({
    //     color: 0x00f000,
    // });
    const path = "textures/cube/Park2/";
		const format = '.jpg';
		const urls = [
				path + 'posx' + format, path + 'negx' + format,
				path + 'posy' + format, path + 'negy' + format,
				path + 'posz' + format, path + 'negz' + format
		];

		const textureCube = new THREE.CubeTextureLoader().load( urls );


    const material = new THREE.MeshPhongMaterial( {
    	color: 0x00f000,
      emissive: 0x00,
      wireframe: true,
    } );

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

    const params = {
				exposure: 1.5,
				bloomStrength: 2.5,
				bloomThreshold: 0,
				bloomRadius: 0.1
		};

    this.renderScene = new RenderPass( this.scene, this.camera );
    this.renderScene.clearColor = new THREE.Color( 0, 0, 0 );
	  this.renderScene.clearAlpha = 0;

		this.bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
		this.bloomPass.threshold = params.bloomThreshold;
		this.bloomPass.strength = params.bloomStrength;
		this.bloomPass.radius = params.bloomRadius;
    this.bloomPass.clearColor = new THREE.Color( 250,0,0 );
	  this.bloomPass.clearAlpha = 0;

    this.fxaaPass = new ShaderPass( FXAAShader );
    this.fxaaPass.uniforms.resolution.value.set( 1 / window.innerWidth, 1 / window.innerHeight );
    this.fxaaPass.renderToScreen = true;
    this.fxaaPass.material.transparent = true;

    var width = window.innerWidth;
    var height = window.innerHeight;
	  var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: true };

	  var renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );

		this.composer = new EffectComposer( this.renderer, renderTarget );
		this.composer.addPass( this.renderScene );
		this.composer.addPass( this.bloomPass );
    this.composer.addPass( this.fxaaPass );

    this.stoptime = false;

    this.controls = new CameraControls( this.camera, this.renderer.domElement );
    this.controls.enableDamping = true;
    this.controls.dollySpeed = 0;
    this.controls.maxPolarAngle = Math.PI/2;
    this.controls.minPolarAngle = Math.PI/2 - Math.PI/16;
    this.controls.autoRotate = false;
    this.controls.mouseButtons.wheel = CameraControls.ACTION.NONE;
    this.controls.mouseButtons.right = CameraControls.ACTION.NONE;

    this.spherecontrols = new TransformControls( this.camera, this.renderer.domElement );
    this.spherecontrols.setMode( "rotate" );
    this.spherecontrols.enabled = false;
    this.spherecontrols.space = "local";
    this.scene.add( this.spherecontrols );
    this.time = 0;

    this.start();
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.rotateEvent);
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
    if (this.state.height === 400) {
      this.setState({height:0})
    }
    this.analyser.fftSize = this.fft;

    if (this.isPlaying) {
      let dataArray = this.analyser.getFrequencyData();

      var lowerHalfArray = dataArray.slice(0, (dataArray.length/5) - 1);
      var upperHalfArray = dataArray.slice((dataArray.length/5) - 1, dataArray.length - 1);

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

    this.descmesh.lookAt(this.camera.position)
    this.txtmesh.lookAt(this.camera.position)

    const delta = this.clock.getDelta();
    this.controls.update( delta );

    if (!this.isLocked) {
      TWEEN.update();
    }
    this.renderer.render( this.scene, this.camera );
    this.renderer.clearDepth(); 
    this.composer.render()
    //this.renderer.render( this.scene, this.camera );
   }

  render () {
    return(
      <>
        <audio ref={(audio) => { this.htmlaudio = audio }} style={{display: "none", }} >
        <source src={S1} ref={(source) => { this.source = source }} type="audio/wav"/>
        </audio>
        <div
          style={{backgroundColor: 'rgba(52, 52, 52, 0)', width: "100vw", height: "100vh"}}
          ref={(mount) => { this.mount = mount }}>
          <button disabled={!this.isLocked} style={{ position: "absolute", width: "10vh", height: "10vh", top: '27.5vh', left:'calc(50vw - 32.5vh)', opacity: 0 }} onClick={() => {this.handlePlayClick()}}/>
          <button disabled={!this.isLocked} style={{ position: "absolute", width: "10vh", height: "10vh",top: "27.5vh", left:"calc(50vw + 20vh)", opacity: 0 }} onClick={() => {this.handleCloseClick()}}/>
        </div>
      </>
    );
  }
}

export default Spectrum;
