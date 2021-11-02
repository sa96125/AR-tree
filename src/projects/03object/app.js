import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js'

import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/OrbitControls.js'
import { OBJLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/MTLLoader.js'

class App {
  constructor() {
    /**
     * Three.js 환경 생성 */

    // renderer : 나의 데이터를 실제로 그려주는 역할
    const container = document.createElement('div')
    document.body.appendChild(container)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerHeight, window.innerWidth)
    this.renderer.domElement.style.position = 'absolute'
    this.renderer.domElement.style.top = '0px'
    this.renderer.domElement.style.left = '0px'
    container.appendChild(this.renderer.domElement)

    // camera : 시야각, 캔버스배율, 랜더링 공간설정
    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 100;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);;

    // scene : 최상위 노드(객체)로서 배경색 안개등을 트리안의 모든 방향성은 scene으로 부터 결정된다.
    this.scene = new THREE.Scene()
    this.scene.add(this.camera)



    /**
     * arToolkit plugin for three.js (main part of ar.js) */

    // arToolkitSource :위치를 추적하고 분석된 이미지. 현재는 카메라에 비춰진 모습
    this.arToolkitSource = new THREEx.ArToolkitSource({
      sourceType: 'webcam',
    })
    this.arToolkitSource.init(() => {
      setTimeout(() => {
        this.resize()
      }, 500)
    })

    // arToolkitContext : 이미지(arToolkitSource)안에 있는 마커를 찾는 메인엔진 */
    this.arToolkitContext = new THREEx.ArToolkitContext({
      cameraParametersUrl:
        THREEx.ArToolkitContext.baseURL + '../../../data/camera_para.dat',
      detectionMode: 'mono',
    })
    this.arToolkitContext.init(() => {
      // copy projection matrix to camera
      this.camera.projectionMatrix.copy(
        this.arToolkitContext.getProjectionMatrix(),
      )
    })

    // arToolkitControl :카메라와 마커의 포지션을 조정하거나 마커위에 컨텐츠를 고정
    this.markerControls = new THREEx.ArMarkerControls(
      this.arToolkitContext,
      this.camera,
      {
        type: 'pattern',
        patternUrl:
          THREEx.ArToolkitContext.baseURL + '../../../data/marker/patt.hiro',
        // as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
        changeMatrixMode: 'cameraTransformMatrix',
      },
    )

    /**
     * add an object in the scene */
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.update()
    {
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
              root.rotateX(30)
              this.scene.add(root)
            },
          )
        },
      )
    }



    /**
     * render the whole thing on the page */
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
    // update scene.visible if the marker is seen
    this.controls.update()
  }


}

export { App }
