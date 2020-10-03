import React, { Component } from 'react';
import * as THREE from "three";
import { Interaction } from 'three.interaction';
import CameraControls from 'camera-controls';
import TWEEN from '@tweenjs/tween.js';
import SOLVIC from 'three/examples/fonts/helvetiker_regular.typeface.json';

import BIO360 from '../assets/video/biomutant/biomutant360.mp4';
import BIO720 from '../assets/video/biomutant/biomutant720.mp4';
import BIO1080 from '../assets/video/biomutant/biomutant1080.mp4';
import HOZ360 from '../assets/video/horizon/horizon360.mp4';
import HOZ720 from '../assets/video/horizon/horizon720.mp4';
import HOZ1080 from '../assets/video/horizon/horizon1080.mp4';
import OUT360 from '../assets/video/outlast/outlast360.mp4';
import OUT720 from '../assets/video/outlast/outlast720.mp4';

CameraControls.install( { THREE: THREE } );

class Video extends Component {

  constructor(props) {
    super(props);

    this.state = {
      height: 400,
      width: 400,
      focusing: false,
      duration: 0,
      quality: 1080
    }
  }

  handleCloseClick = () => {
    if (!this.video.paused) {
      this.video.pause();
      this.isPlaying = false;
    }
    this.video.currentTime = 0;
    this.objects[this.videoid].geometry = this.geometry;
    this.controls.maxPolarAngle = Math.PI/2;
    this.pausebutton.visible = false;
    this.playbutton.visible = false;
    this.closebutton.visible = false;
    this.txtmesh.visible = false;
    this.descmesh.visible = false;
    this.resolution360.visible = false;
    this.resolution720.visible = false;
    this.resolution1080.visible = false;

    this.fullscreenbutton.visible = false;
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
      if (!this.video.paused) {
        this.video.pause();
        this.pausebutton.visible = false;
        this.playbutton.visible = true;
      } else {
        this.video.play();
        this.pausebutton.visible = true;
        this.playbutton.visible = false;
      }
      this.isPlaying = !this.video.paused;
  }

  handleResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  decaymod = (cangle, tangle) => {
    let i = 0;

    while (tangle - cangle + 360 * i < 0) {
      i++;
    }
    return(i * 360);
  }

  loadVideo = (id, play, quality) => {
    this.txtmesh.geometry = this.musicgeo[id];
    this.descmesh.geometry = this.genregeo[id];

    this.video.pause();
    if (quality === 360) {
        this.video.src = this.videorefs360[id];
    } else if (quality === 720) {
        this.video.src = this.videorefs720[id];
    } else if (quality === 1080) {
        this.video.src = this.videorefs1080[id];
    }
    this.video.load();
    if (play) {
      this.video.play();
    }
  }

  lockControls = () => {
    this.controls.enabled = false;
  }

  unlockControls = () => {
    this.controls.enabled = true;
  }

  showButtonForTarget = (target) => {
    this.group.setRotationFromAxisAngle(this.axis, -1 * parseFloat(target.name));

    this.pausebutton.visible = true;
    this.playbutton.visible = false;
    this.closebutton.visible = true;
    this.txtmesh.visible = true;
    this.descmesh.visible = true;
    this.fullscreenbutton.visible = true;
    this.resolution360.visible = true;
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
    this.objects[id].geometry = this.geometrybig;
    this.videoid = id;
    this.controls.damplingFactor = 0;
    let modular = this.decaymod(cangle, tangle);
    if ((event.data.originalEvent.clientX/ window.innerWidth) * 2 - 1 < -0.21) {
      modular = modular - 360;
    }
    let decay = (tangle);
    this.controls.maxPolarAngle = Math.PI/2 + Math.PI/4;
    this.controls.rotateTo(THREE.Math.degToRad(decay + modular), Math.PI/2 + Math.PI/64, true);
    this.controls.damplingFactor = 0.05;
    this.loadVideo(id, true, 360);
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

  handleQualityMenu = (event) => {
    this.resolution360.visible = true;
    this.resolution720.visible = true;
    this.resolution720.position.y = -0.8;
    this.resolution1080.visible = true;
    this.resolution1080.position.y = -0.6;
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
    this.txtmesh.position.y = 1.7;
    this.txtmesh.position.z = Math.sin( 0 ) * 4 * this.rscale;
    this.group.setRotationFromAxisAngle(this.axis, 0);
    this.txtmesh.lookAt(this.camera.position);

    this.descmesh.geometry = this.genregeo[id];
    this.descmesh.visible = true;
    this.descmesh.position.x = Math.cos( 0 ) * 4 * this.rscale;
    this.descmesh.position.y = 1.2;
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

  openFullscreen = () => {
  if (this.video.requestFullscreen) {
    this.video.requestFullscreen();
  } else if (this.video.mozRequestFullScreen) {
    this.video.mozRequestFullScreen();
  } else if (this.video.webkitRequestFullscreen) {
    this.video.webkitRequestFullscreen();
  } else if (this.video.msRequestFullscreen) {
    this.video.msRequestFullscreen();
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
    this.axis = new THREE.Vector3(0,1,0);
    let videotitles = ["Biomutant","Horizon","Outlast"];
    let videogenre = ['ca marche super!','ca marche super!','ca marche super!']
    this.txtrotsv = null;
    this.timeoutId = null;
    this.isPlaying = false;
    this.videoid = 0;
    this.angle = 0;
    this.videorefs360 = [BIO360,HOZ360,OUT360];
    this.videorefs720 = [BIO720,HOZ720,OUT720];
    this.videorefs1080 = [BIO1080,HOZ1080];
    this.previd = null;
    this.objects = [];
    this.sounds = [];
    this.camtween = null;
    this.tweend = [null,null,null];
    this.isLocked = false;
    this.rscale = 1;

    this.clock = new THREE.Clock();
    this.camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.01, 20 );
    this.camera.position.set( 0, 3, 6);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xffffffff );
    this.camera.lookAt( this.scene.position );


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
    for ( let i = 0; i < videotitles.length; i ++ ) {
      let txtgeometry = new THREE.TextGeometry( videotitles[i], {
          font: this.font,
          size: 0.4,
          height: 0,
          curveSegments: 12,
      } );
      txtgeometry.center();
      let descgeo = new THREE.TextGeometry( videogenre[i], {
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
    this.txtmesh.position.y = 1.7;
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

    let resgeometry360 = new THREE.TextGeometry( "360p", {
        font: this.font,
        size: 0.2,
        height: 0,
        curveSegments: 12,
    } );
    resgeometry360.center();
    let resgeometry720 = new THREE.TextGeometry( "720p", {
        font: this.font,
        size: 0.2,
        height: 0,
        curveSegments: 12,
    } );
    resgeometry720.center();
    let resgeometry1080 = new THREE.TextGeometry( "1080p", {
        font: this.font,
        size: 0.2,
        height: 0,
        curveSegments: 12,
    } );
    resgeometry1080.center();
    this.resolution360 = new THREE.Mesh(resgeometry360, txtmaterials);
    this.resolution360.position.x = Math.cos( 0 ) * 4 * this.rscale + 0.5;
    this.resolution360.position.y = -1;
    this.resolution360.position.z = Math.sin( 0 ) * 4 * this.rscale + 2;
    this.resolution360.rotation.set(0,3*Math.PI/4,0);
    this.resolution360.visible = false;
    this.resolution360.scale.set(0.7,0.7,0.7);

    this.resolution720 = new THREE.Mesh(resgeometry720, txtmaterials);
    this.resolution720.position.x = Math.cos( 0 ) * 4 * this.rscale + 0.5;
    this.resolution720.position.y = -1;
    this.resolution720.position.z = Math.sin( 0 ) * 4 * this.rscale + 2;
    this.resolution720.rotation.set(0,3*Math.PI/4,0);
    this.resolution720.visible = false;
    this.resolution720.scale.set(0.7,0.7,0.7);

    this.resolution1080 = new THREE.Mesh(resgeometry1080, txtmaterials);
    this.resolution1080.position.x = Math.cos( 0 ) * 4 * this.rscale + 0.5;
    this.resolution1080.position.y = -1;
    this.resolution1080.position.z = Math.sin( 0 ) * 4 * this.rscale + 2;
    this.resolution1080.rotation.set(0,3*Math.PI/4,0);
    this.resolution1080.visible = false;
    this.resolution1080.scale.set(0.7,0.7,0.7);

    this.resolution360.on('click', this.handleQualityMenu);
    this.resolution720.on('click', this.handleQualityMenu);
    this.resolution1080.on('click', this.handleQualityMenu);

    this.group.add(this.resolution360);
    this.group.add(this.resolution720);
    this.group.add(this.resolution1080);

    let arrowlength = 1.2;
    let arrowbase = 0.2;
    let noselength = 0.5;
    let nosewidth = 1;
    let nosethick = 0.3;
    let arrowshape = new THREE.Shape();
    arrowshape.moveTo(0,0);
    arrowshape.lineTo(0,arrowbase/2);
    arrowshape.lineTo(arrowlength - noselength, arrowbase/2);
    arrowshape.lineTo(arrowlength - nosethick, arrowbase/2);
    arrowshape.lineTo(arrowlength - noselength, nosewidth/2 - nosethick);
    arrowshape.lineTo(arrowlength - noselength,nosewidth/2);
    arrowshape.lineTo(arrowlength, 0);
    arrowshape.lineTo(arrowlength - noselength, -nosewidth/2);
    arrowshape.lineTo(arrowlength - noselength, -nosewidth/2 + nosethick);
    arrowshape.lineTo(arrowlength - nosethick, -arrowbase/2);
    arrowshape.lineTo(arrowlength - noselength, -arrowbase/2);
    arrowshape.lineTo(0, -arrowbase/2);
    arrowshape.lineTo(0, 0);
    let extrudeSettings = {
      steps: 2,
      depth: 0.1,
      bevelEnabled: false,
    };

    this.arrowgeometry = new THREE.ExtrudeGeometry( arrowshape, extrudeSettings );
    this.arrow = new THREE.Mesh(this.arrowgeometry, buttonmaterial);
    this.arrow.scale.set(0.25,0.25,0.25);
    this.arrow.rotation.set(0,Math.PI/2- Math.PI/4,-3 *Math.PI/4);
    this.downarrow = new THREE.Mesh(this.arrowgeometry, buttonmaterial);
    this.downarrow.scale.set(0.25,0.25,0.25);
    this.downarrow.rotation.set(0,Math.PI/2 - Math.PI/4,Math.PI/4);

    this.fullscreenbutton = new THREE.Group();
    this.fullscreenbutton.add(this.arrow);
    this.fullscreenbutton.add(this.downarrow);

    this.fullscreenbutton.position.x = Math.cos( 0 ) * 4 * this.rscale + 0.5;
    this.fullscreenbutton.position.y = -1;
    this.fullscreenbutton.position.z = Math.sin( 0 ) * 4 * this.rscale - 1.8;
    this.fullscreenbutton.on('click', this.openFullscreen);
    this.fullscreenbutton.visible = false;
    this.group.add(this.fullscreenbutton);

    this.scene.add(this.group);

    let scalen = 1.2;
    let scaleg = 1.4;
    this.geometry = new THREE.BoxGeometry( 1280/720 * scalen, 1 * scalen, 1 * scalen );
    this.geometrybig = new THREE.BoxGeometry( 1280/720 * scaleg, 1 * scaleg, 1 * scaleg );


    this.videotexture = new THREE.VideoTexture(this.video);
    this.videotexture.minFilter = THREE.LinearFilter;
    this.videotexture.magFilter = THREE.LinearFilter;
    this.videotexture.format = THREE.RGBFormat;
    const material = new THREE.MeshBasicMaterial({
        map: this.videotexture,
    });

    const count = 3;

    for ( let i = 0; i < count; i ++ ) {

      const mesh = new THREE.Mesh( this.geometry.clone(), material );

      const t = i / count * 2 * Math.PI;

      mesh.name = t;
      mesh.position.x = Math.cos( t ) * 4;
      mesh.position.z = Math.sin( t ) * 4;
      mesh.on('click', this.handleMeshClick);
      mesh.on('mouseover', this.handleFocus);
      mesh.on('mouseout', this.scaleDownMeshEvent);
      this.scene.add( mesh );
      this.objects.push( mesh );

    }
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize( this.mount.clientWidth, this.mount.clientHeight );
    this.mount.appendChild(this.renderer.domElement)

    const interaction = new Interaction(this.renderer, this.scene, this.camera);
    console.log(interaction);

    this.controls = new CameraControls( this.camera, this.renderer.domElement );
    this.controls.enableDamping = true;
    this.controls.dollyToCursor = true;
    this.controls.dollySpeed = 0;
    this.controls.maxPolarAngle = Math.PI/2;
    this.controls.minPolarAngle = Math.PI/4 + Math.PI/9;
    this.controls.rotateSpeed = 0.1;
    this.controls.autoRotate = false;
    this.controls.enableKeys = false;
    this.controls.mouseButtons.wheel = CameraControls.ACTION.NONE;
    this.controls.mouseButtons.right = CameraControls.ACTION.NONE;




    this.start();
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    console.log(this.group);
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

    if ( this.videotexture ) {
      this.videotexture.needsUpdate = true;
    }

    this.objects.forEach((object) => {
      object.lookAt(this.camera.position);
    });
    this.group.rotateOnWorldAxis(this.axis, THREE.Math.degToRad(this.angle));
    const delta = this.clock.getDelta();
    this.controls.update( delta );
    TWEEN.update();
    this.renderer.render( this.scene, this.camera );
   }

  render () {
    return(
      <div>
        <video ref={(video) => { this.video = video }} crossOrigin="anonymous" style={{display: "none" }}  >
        <source src={BIO720} type="video/mp4"/>
        </video>
        <div
          style={{width: "100%", height: "100%"}}
          ref={(mount) => { this.mount = mount }}
          />
      </div>
    );
  }
}

export default Video;
