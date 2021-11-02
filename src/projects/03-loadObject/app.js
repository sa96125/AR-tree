import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js'

import { OBJLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/MTLLoader.js'

class App {
  constructor() {

    /**
     * Three.js 환경 생성 
     */

    const container = document.createElement('div')
    document.body.appendChild(container)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerHeight, window.innerWidth)
    this.renderer.domElement.style.position = 'absolute'
    this.renderer.domElement.style.top = '0px'
    this.renderer.domElement.style.left = '0px'
    container.appendChild(this.renderer.domElement)

    this.camera = new THREE.Camera()
    this.scene = new THREE.Scene()
    this.scene.add(this.camera)




    /**
     * arToolkit plugin for three.js (main part of ar.js) 
     */

    this.arToolkitSource = new THREEx.ArToolkitSource({
      sourceType: 'webcam',

    })

    this.arToolkitSource.init(() => this.resize.bind(this)())

    this.arToolkitContext = new THREEx.ArToolkitContext({
      cameraParametersUrl: THREEx.ArToolkitContext.baseURL + '../public/camera_para.dat',
      detectionMode: 'mono',
    })

    this.arToolkitContext.init(() => {
      this.camera.projectionMatrix.copy(this.arToolkitContext.getProjectionMatrix())
    })


    this.markerControls = new THREEx.ArMarkerControls(
      this.arToolkitContext,
      this.camera,
      {
        type: 'pattern',
        patternUrl: THREEx.ArToolkitContext.baseURL + '../public/marker/patt.hiro',
        changeMatrixMode: 'cameraTransformMatrix',
      },
    )
    this.scene.visible = false




    /**
     * add an object in the scene 
     */

    {

      const ambient = new THREE.HemisphereLight( 0xFFFFFF, 0xbbbbbf, 1)
      this.scene.add( ambient )

      const mtlLoader = new MTLLoader()

      mtlLoader.load(

        'https://threejsfundamentals.org/threejs/resources/models/windmill/windmill.mtl',

        (mtl) => {
          mtl.preload()
          const objLoader = new OBJLoader()
          objLoader.setMaterials(mtl)

          objLoader.load(

            'https://threejsfundamentals.org/threejs/resources/models/windmill/windmill.obj',

            (root) => {
              root.scale.set(0.1, 0.1, 0.1)
              this.scene.add(root)
            },

          )
        }

      )

    }




    /**
     * render the whole thing on the page 
     */

    this.renderer.setAnimationLoop(this.render.bind(this))
    window.addEventListener('resize', this.resize.bind(this))

  }



  resize() {

    this.arToolkitSource.onResizeElement()
    this.arToolkitSource.copyElementSizeTo(this.renderer.domElement)

    if (this.arToolkitContext.arController !== null) {
      this.arToolkitSource.copyElementSizeTo(
        this.arToolkitContext.arController.canvas,
      )
    }

  }



  render() {

    this.renderer.render(this.scene, this.camera)

    if (this.arToolkitSource.ready === false) return
    // 엔진이 계속 이미지영역을 계속 감지해야함.
    this.arToolkitContext.update(this.arToolkitSource.domElement)
    this.scene.visible = this.camera.visible

  }


}

export { App }
