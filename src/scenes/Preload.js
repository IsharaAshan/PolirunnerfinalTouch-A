export default class Preload extends Phaser.Scene {

	constructor() {
		super("Preload");
		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorPreload() {
		this.load.pack("asset-pack", "assets/asset-pack.json");
	}

	/** @returns {void} */
	editorCreate() {
		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// Write your code here

	preload() {
		// Add loading text
		this.loadingText = this.add.text(
			this.cameras.main.width / 2, 
			this.cameras.main.height / 2, 
			'Loading game assets...', 
			{ 
				font: '24px Arial', 
				fill: '#ffffff' 
			}
		).setOrigin(0.5);

		this.editorCreate();
		this.editorPreload();
	}

	create() {
		// Simply start the Home scene after assets are loaded
		this.loadingText.setText('Starting game...');
		this.scene.start("Home");
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
