import { OrbitControls } from '../../../libs/three/jsm/OrbitControls.js';
import { GLTFLoader } from '../../../libs/three/jsm/GLTFLoader.js';
// import { FBXLoader } from '../../../libs/three/jsm/FBXLoader.js';
import { RGBELoader } from '../../../libs/three/jsm/RGBELoader.js';
import { OrbitControls } from '../../../libs/three/jsm/OrbitControls.js';
import { LoadingBar } from '../../../libs/LoadingBar.js';


class App{
	constructor(){
    /**
     * Three.js 환경 생성 */ 
    // renderer : 나의 데이터를 실제로 그려주는 역할( 3d printer )
    const container = document.createElement( 'div' );
    document.body.appendChild( container );
    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerHeight, window.innerWidth)
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;

    container.appendChild(this.renderer.domElement)

    // camera : 시야각, 캔버스(랜더러)배율, 랜더링 공간설정 (원근 카메라 셋팅.)
    this.camera = new THREE.Camera()

    // scene : 최상위 노드(객체)로서 배경색 안개등을 트리안의 모든 방향성은 scene으로 부터 결정된다.
    this.scene = new THREE.Scene() 


    

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


    /**
     * add an object in the scene */
    this.setEnvironment();
    this.loadingBar = new LoadingBar();    
    this.loadGLTF();

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.update()

    /**
     * render the whole thing on the page */
    this.renderer.setAnimationLoop(this.render.bind(this))

	}	



  resize() {
    this.arToolkitSource.onResizeElement()
    this.arToolkitSource.copyElementSizeTo(this.renderer.domElement)
    if (this.arToolkitContext.arController !== null) {
      this.arToolkitSource.copyElementSizeTo(this.arToolkitContext.arController.canvas,)
    }
  }



	render() { 
    this.mesh.rotateX( 0.01 )
    this.mesh.rotateY( 0.005 );
    this.mesh.rotateZ( 0.0005 );
    this.renderer.render(this.scene, this.camera)
    
    if (this.arToolkitSource.ready === false) return
    this.arToolkitContext.update(this.arToolkitSource.domElement)
    this.controls.update()
  }


  setEnvironment(){
    const loader = new RGBELoader().setDataType( THREE.UnsignedByteType );
    const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
    pmremGenerator.compileEquirectangularShader();
    
    loader.load('../../assets/hdr/venice_sunset_1k.hdr', ( texture ) => {
      const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
      pmremGenerator.dispose();
      this.scene.environment = envMap;
    },
    undefined,
    (err)=>{console.error( 'An error occurred setting the environment');});
  }


  loadGLTF(){
    const loader = new GLTFLoader( ).setPath('../../assets/');

    // Load a glTF resource
    loader.load('office-chair.glb', ( gltf ) => {
        const bbox = new THREE.Box3().setFromObject( gltf.scene );
        console.log(`min:${bbox.min.x.toFixed(2)},${bbox.min.y.toFixed(2)},${bbox.min.z.toFixed(2)} -  max:${bbox.max.x.toFixed(2)},${bbox.max.y.toFixed(2)},${bbox.max.z.toFixed(2)}`);
        
        gltf.scene.traverse( ( child ) => {if (child.isMesh){child.material.metalness = 0.2;}})
        this.chair = gltf.scene;  
        this.scene.add( gltf.scene );     
        this.loadingBar.visible = false;
        this.renderer.setAnimationLoop( this.render.bind(this));
      },

      // called while loading is progressing
      function ( xhr ) { self.loadingBar.progress = (xhr.loaded / xhr.total); },
      function ( error ) { console.log( 'An error happened' ); }  
    );
  }
}

export { App };