import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js'

class App{
	constructor(){

    this.init()
    this.createContent()

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
    this.arToolkitSource.init(() => { setTimeout(() => { this.resize() }, 500) })

    this.arToolkitContext = new THREEx.ArToolkitContext({
      cameraParametersUrl: THREEx.ArToolkitContext.baseURL + '../public/camera_para.dat',
      detectionMode: 'mono',
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




  createContent() {

    let video = document.getElementById( 'video' );
    video.src="../../public/video/sintel.mp4"
    video.load();
    video.play();

    let texture = new THREE.VideoTexture( video );
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;

    let material = new THREE.MeshBasicMaterial( { map: texture } );

    let geometry = new THREE.PlaneGeometry(6, 4, 4, 4);
    let mesh = new THREE.Mesh( geometry, material );
    mesh.rotation.x = -Math.PI/2;

    this.markerRoot.add(mesh);

    let light = new THREE.PointLight( 0xffffff, 1, 100 );
    light.position.set(10,0,2);
    // create a mesh to help visualize the position of the light
    light.add( 
      new THREE.Mesh( 
        new THREE.SphereBufferGeometry( 0.05, 16,8 ), 
        new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5 }) 
      ) 
    );

    this.markerRoot.add(light)

  }




	render() {   
    if (this.arToolkitSource.ready === false) return
    // 엔진이 계속 이미지영역을 계속 감지해야함.
    this.arToolkitContext.update(this.arToolkitSource.domElement)
    // update scene.visible if the marker is seen
    this.scene.visible = this.camera.visible
    this.renderer.render(this.scene, this.camera)
    // 
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