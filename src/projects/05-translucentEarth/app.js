import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js'

class App{
	constructor(){

    this.init()
    this.addScene()

	}	



  init(){

    this.setThreeElements()
    this.setArElements()

    {
      this.renderer.setAnimationLoop(this.render.bind(this))
      window.addEventListener('resize', this.resize.bind(this) );
    }

  }



  setThreeElements() {

    const container = document.createElement( 'div' );
    document.body.appendChild( container );
    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerHeight, window.innerWidth)
    this.renderer.domElement.style.position = 'absolute'
    this.renderer.domElement.style.top = '0px'
    this.renderer.domElement.style.left = '0px'
    container.appendChild(this.renderer.domElement)

		this.camera = new THREE.Camera();
    this.scene = new THREE.Scene() 
    this.scene.add(this.camera)

  }




  setArElements() {

    this.arToolkitSource = new THREEx.ArToolkitSource({ sourceType: 'webcam'})
    this.arToolkitSource.init(() => this.resize.bind(this)())

    this.arToolkitContext = new THREEx.ArToolkitContext({

      debug: false,
      // the mode of detection - ['color', 'color_and_matrix', 'mono', 'mono_and_matrix']
      detectionMode: 'mono',
      // type of matrix code - valid iif detectionMode end with 'matrix' - [3x3, 3x3_HAMMING63, 3x3_PARITY65, 4x4, 4x4_BCH_13_9_3, 4x4_BCH_13_5_5]
      matrixCodeType: '3x3',
      // Pattern ratio for custom markers
      patternRatio: 0.5, 
      // Labeling mode for markers - ['black_region', 'white_region']
      // black_region: Black bordered markers on a white background, white_region: White bordered markers on a black background
      labelingMode: 'black_region',
      
      // url of the camera parameters
      cameraParametersUrl: THREEx.ArToolkitContext.baseURL + '../public/camera_para.dat',

      // tune the maximum rate of pose detection in the source image
      maxDetectionRate: 60,
      // resolution of at which we detect pose in the source image
      canvasWidth: 640,
      canvasHeight: 480,
      
      // enable image smoothing or not for canvas copy - default to true
      // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled
      imageSmoothingEnabled : true,

    })

    this.arToolkitContext.init(() => {
      this.camera.projectionMatrix.copy(this.arToolkitContext.getProjectionMatrix())
    })

    this.markerRoot = new THREE.Group();
    this.scene.add(this.markerRoot);

    this.markerControls = new THREEx.ArMarkerControls(
      this.arToolkitContext,
      this.markerRoot,
      {
        type: 'pattern',
        patternUrl: THREEx.ArToolkitContext.baseURL + '../public/marker/patt.hiro',
      },
    )
  }




  addScene() {

    const geometry = new THREE.SphereGeometry(1, 32,32);
    let loader     = new THREE.TextureLoader();
    let texture    = loader.load( '../../public/images/earth-sphere.jpg', this.render.bind(this) );
    let material   = new THREE.MeshLambertMaterial( { map: texture, opacity: 0.5 } );

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.position.y = 0.5
    this.markerRoot.add(this.mesh)

    let pointLight = new THREE.PointLight( 0xffffff, 1, 100 );
    pointLight.position.set(10,10,2);
    // create a mesh to help visualize the position of the light
    pointLight.add( 
      new THREE.Mesh( 
        new THREE.SphereBufferGeometry( 0.05, 16,8 ), 
        new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5 }) 
      ) 
    );

    this.markerRoot.add(pointLight)

  }




	render() {   

    if (this.arToolkitSource.ready === false) return
    // 엔진이 계속 이미지영역을 계속 감지해야함.
    this.arToolkitContext.update(this.arToolkitSource.domElement)
    // update scene.visible if the marker is seen
    this.scene.visible = this.camera.visible
    this.renderer.render(this.scene, this.camera)

  }




  resize() {

    this.arToolkitSource.onResizeElement()
    this.arToolkitSource.copyElementSizeTo(this.renderer.domElement)
    if (this.arToolkitContext.arController !== null) {
      this.arToolkitSource.copyElementSizeTo(this.arToolkitContext.arController.canvas,)
    }

  }
  
}

export { App };