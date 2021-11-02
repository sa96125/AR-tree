import * as THREE from '../../vendor/threejs/build/three.module.js'
import { PickHelper } from './module/PickHelper.js';


class App{

	constructor(){
    this.camera = new THREE.PerspectiveCamera(70, window.width / window.height, 1, 1000 )

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    this.scene = new THREE.Scene()
    this.scene.add(this.camera)

    document.body.appendChild(this.renderer.domElement)
    this.canvas = document.querySelector('canvas')

    // event block.
    {

      window.addEventListener( 'resize', () => this.resize() );

    }

    
    this.arToolkitSource = new THREEx.ArToolkitSource({ 
      sourceType    : 'webcam',
      sourceWidth   : window.innerWidth,
      sourceHeight  : window.innerHeight,
      displayWidth  : window.innerWidth,
      displayHeight : window.innerHeight,
    })
    this.arToolkitSource.init()

  


    this.arToolkitContext = new THREEx.ArToolkitContext({ 
      debug: false,
      cameraParametersUrl: '../../../data/camera_para.dat', 
      detectionMode: 'mono_and_matrix',
      maxDetectionRate: 40,
      imageSmoothingEnabled : true,
    })
    this.arToolkitContext.init(() => {
      this.camera.projectionMatrix.copy(this.arToolkitContext.getProjectionMatrix())
    })



    this.markerControls = new THREEx.ArMarkerControls(
      this.arToolkitContext, 
      this.camera, 
      { 
        size : 3,
        type : 'pattern',
        patternUrl : '../../../data/marker/patt.hiro',
        barcodeValue : null,
        // change matrix mode - [modelViewMatrix, cameraTransformMatrix]
        changeMatrixMode : 'cameraTransformMatrix',
      }
    )


  }



  render() {
    
  }

  resize() {

    this.arToolkitSource.onResizeElement()
    this.arToolkitSource.copyElementSizeTo(this.renderer.domElement)
    if (this.arToolkitContext.arController) {
      this.arToolkitSource.copyElementSizeTo(this.arToolkitContext.arController.canvas,)
    }

  }

}



export { App };