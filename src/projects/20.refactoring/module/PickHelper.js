export class PickHelper {

  constructor() {

    this.raycaster = new THREE.Raycaster();
    this.raycaster.params.Line.threshold = 3;

  }

  pick(pointer, scene, camera, cb) {
    this.raycaster.setFromCamera(pointer, camera);

    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      this.pickedObject = intersectedObjects[0].object;
      cb()
    }

  }
}