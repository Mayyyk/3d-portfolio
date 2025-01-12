import * as THREE from 'three';
import assetStore from '../Utils/AssetStore.js';
import App from '../App.js';
import Portal from './Portal.js';
import ModalContentProvider from '../UI/ModalContentProvider.js';

export default class Environment {
	constructor() {
		this.app = new App();
		this.scene = this.app.scene;
		this.physics = this.app.world.physics;
		this.pane = this.app.gui.pane;

		this.assetStore = assetStore.getState();
		this.environment = this.assetStore.loadedAssets.environment;
		console.log(this.environment);

		this.loadEnvironment();
		this.addLights();
		this.addPortals()
		// this.addGround();
	}

	loadEnvironment() {
		const environmentScene = this.environment.scene;
		this.scene.add(environmentScene);

		environmentScene.position.set(0, -1.7, -24);
		environmentScene.rotation.set(0, -Math.PI / 4, 0);
		environmentScene.scale.setScalar(1.3);

		environmentScene.traverse((child) => {
			if (child.isMesh) {
				child.castShadow = true;
				this.physics.add(child, 'fixed', 'cuboid');
			}
		});

		console.log(environmentScene);

		const physicalObjects = [
			'trees',
			'rocks',
			// 'steps', exclude steps from physics - I don't want the character to collide with them
			'bushes',
			'gates',
			'floor',
			'terrain',
		];

		const shadowCasters = ['trees', 'rocks', 'bushes', 'gates', 'terrain'];

		const shadowReceivers = ['floor', 'terrain'];

		for (let child of environmentScene.children) {
			const isPhysicalObject = physicalObjects.some((keyword) =>
				child.name.includes(keyword)
			);

			const isShadowCaster = shadowCasters.some((keyword) =>
				child.name.includes(keyword)
			);

			const isShadowReceiver = shadowReceivers.some((keyword) =>
				child.name.includes(keyword)
			);

			if (isPhysicalObject) {
				child.traverse((child) => {
					if (child.isMesh) {
						// child.castShadow = true;
						this.physics.add(child, 'fixed', 'cuboid');
					}
				});
			}

			if (isShadowCaster) {
				child.traverse((child) => {
					if (child.isMesh) {
						child.castShadow = true;
					}
				});
			}

			if (isShadowReceiver) {
				child.traverse((child) => {
					if (child.isMesh) {
						child.receiveShadow = true;
					}
				});
			}
		}
	}

	addPortals() {
		const portalMesh1 = this.environment.scene.getObjectByName('portals001');
		const portalMesh2 = this.environment.scene.getObjectByName('portals002');
		const portalMesh3 = this.environment.scene.getObjectByName('portals003');
		const modalContentProvider = new ModalContentProvider();
		this.portal1 = new Portal(portalMesh1, modalContentProvider.getModalInfo('aboutMe'));
		this.portal2 = new Portal(portalMesh2, modalContentProvider.getModalInfo('projects'));
		this.portal3 = new Portal(portalMesh3, modalContentProvider.getModalInfo('contactMe'));

	}	

	addLights() {
		const ambientLight = new THREE.AmbientLight(0xffffff, 1);
		this.scene.add(ambientLight);

		this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		this.directionalLight.position.set(0.5, 1, 0.9);
		this.directionalLight.castShadow = true;
		this.directionalLight.shadow.camera.top = 30;
		this.directionalLight.shadow.camera.right = 30;
		this.directionalLight.shadow.camera.left = -30;
		this.directionalLight.shadow.camera.bottom = -30;
    this.directionalLight.shadow.bias = -0.002;
    this.directionalLight.shadow.normalBias = -0.01;

		this.pane.addBinding(this.directionalLight, 'intensity', {
			min: -10,
			max: 10,
			step: 0.1,
		});
		this.pane.addBinding(this.directionalLight, 'position', {
			x: { min: -10, max: 10, step: 0.1 },
			y: { min: -10, max: 10, step: 0.1 },
			z: { min: -10, max: 10, step: 0.1 },
		});
		this.pane.addBinding(this.directionalLight.shadow, 'bias', {
			min: -0.1,
			max: 0.1,
			step: 0.01,
		});

		const lightHelper = new THREE.CameraHelper(
			this.directionalLight.shadow.camera
		);
		// this.scene.add(lightHelper);w
		this.scene.add(this.directionalLight);
	}

	addGround() {
		const groundGeometry = new THREE.BoxGeometry(100, 1, 100);
		const groundMaterial = new THREE.MeshStandardMaterial({
			color: 'turquoise',
		});
		this.groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
		this.scene.add(this.groundMesh);
		this.physics.add(this.groundMesh, 'fixed', 'cuboid');
	}

	loop() {
		this.portal1.loop();
		this.portal2.loop();
		this.portal3.loop();
	}
}
