import App from '../App';
import * as THREE from 'three';
import ModalManager from '../UI/ModalManager';


export default class Portal {
	constructor(portalMesh, modalInfo) {
		this.app = new App();
		this.portalMesh = portalMesh;
        this.modalInfo = modalInfo;
                this.modalManager = new ModalManager();
        this.prevIsNear = false
        this.portalOpenMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
        })
        this.portalClosedMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8,
        })
        this.portalMesh.material = this.portalClosedMaterial;
            }

	loop() {
		this.character = this.app.world.character.instance;
		if (this.character) {
			const characterPosition = new THREE.Vector3();
			this.character.getWorldPosition(characterPosition);
			this.portalMesh.updateMatrixWorld(true);
			const portalPosition = new THREE.Vector3();
			this.portalMesh.getWorldPosition(portalPosition);

			const distance = this.character.position.distanceTo(portalPosition);

            if (distance < 10 ) {
                if (!this.prevIsNear){
                this.modalManager.openModal(this.modalInfo.title, this.modalInfo.description);
                this.portalMesh.material = this.portalOpenMaterial;
                }
                this.prevIsNear = true;
            } else if (distance >= 10) {
                if(this.prevIsNear) {this.modalManager.closeModal();
                this.portalMesh.material = this.portalClosedMaterial;}
                this.prevIsNear = false;
            }
		}
	}
}
