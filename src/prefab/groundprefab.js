
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class groundprefab extends Phaser.Physics.Arcade.Image {

	constructor(scene, x, y, texture, frame) {
		super(scene, x ?? 623, y ?? 359, texture || "floor", frame);

		this.alpha = 0;
		this.alphaTopLeft = 0;
		this.alphaTopRight = 0;
		this.alphaBottomLeft = 0;
		this.alphaBottomRight = 0;
		scene.physics.add.existing(this, true);
		this.body.setSize(1280, 32, false);

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */

	// Write your code here.

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
