import * as THREE from '../../vendor/threejs/build/three.module.js'
import { GLTFLoader } from '../../vendor/threejs/jsm/GLTFLoader.js'

class App{
	constructor(){
    /**
     * Three.js 환경 생성 */ 
    // renderer : 나의 데이터를 실제로 그려주는 역할
    const container = document.createElement( 'div' );
    document.body.appendChild( container );
    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerHeight, window.innerWidth)
    this.renderer.domElement.style.position = 'absolute'
    this.renderer.domElement.style.top = '0px'
    this.renderer.domElement.style.left = '0px'
    container.appendChild(this.renderer.domElement)

    // camera : 시야각, 캔버스배율, 랜더링 공간설정
		this.camera = new THREE.Camera();
    

    // scene : 최상위 노드(객체)로서 배경색 안개등을 트리안의 모든 방향성은 scene으로 부터 결정된다.
    this.scene = new THREE.Scene() 
    this.scene.add(this.camera)



    

    /**
     * arToolkit plugin for three.js (main part of ar.js) */ 
    // arToolkitSource :위치를 추적하고 분석된 이미지. 현재는 카메라에 비춰진 모습 
    this.arToolkitSource = new THREEx.ArToolkitSource({ sourceType: 'webcam'})
    this.arToolkitSource.init(() => { setTimeout(() => { this.resize() }, 500) })


    // arToolkitContext : 이미지(arToolkitSource)안에 있는 마커를 찾는 메인엔진 */ 
    this.arToolkitContext = new THREEx.ArToolkitContext({
      cameraParametersUrl: THREEx.ArToolkitContext.baseURL + '../../../data/camera_para.dat',
      detectionMode: 'mono',
    })
    this.arToolkitContext.init(() => {
      // copy projection matrix to camera
      this.camera.projectionMatrix.copy(this.arToolkitContext.getProjectionMatrix())
    })


    // arToolkitControl :카메라와 마커의 포지션을 조정하거나 마커위에 컨텐츠를 고정
    this.markerControls = new THREEx.ArMarkerControls(
      this.arToolkitContext,
      this.camera,
      {
        type: 'pattern',
        patternUrl: THREEx.ArToolkitContext.baseURL + '../../../data/marker/patt.hiro',
        // as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
        changeMatrixMode: 'cameraTransformMatrix',
      },
    )
    // as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
    this.scene.visible = false


    /**
     * add an object in the scene */

    const ambient = new THREE.HemisphereLight( 0xFFFFFF, 0xbbbbbf, 0.3)
    this.scene.add( ambient )

    const color = 0xFFFFFF;
    const intensity = .8;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 5, 5);
    this.scene.add( light )

    const loader = new GLTFLoader()
    loader.load('./580.glb', glb => {
      this.root = glb.scene
      this.root.scale.set(.3,.3,.3)
      this.root.rotation.x =  -Math.PI/2.5;
      this.root.position.z = .5; 
      // this.root.position.y = -1; 
      this.scene.add(this.root)
    }, xhr => {
      console.log(xhr.loaded/xhr.total * 100 + '% loaded')
    }, err => {
      console.log('An error occurred')
    })


    /**
     * render the whole thing on the page */
    this.renderer.setAnimationLoop(this.render.bind(this))

    window.addEventListener('resize', this.resize.bind(this) );
	}	



  resize() {
    this.arToolkitSource.onResizeElement()
    this.arToolkitSource.copyElementSizeTo(this.renderer.domElement)
    if (this.arToolkitContext.arController !== null) {
      this.arToolkitSource.copyElementSizeTo(this.arToolkitContext.arController.canvas,)
    }
  }



	render() {   
    this.renderer.render(this.scene, this.camera)

    if (this.arToolkitSource.ready === false) return
    // 엔진이 계속 이미지영역을 계속 감지해야함.
    this.arToolkitContext.update(this.arToolkitSource.domElement)
    // update scene.visible if the marker is seen
    this.scene.visible = this.camera.visible
  }
}

export { App };