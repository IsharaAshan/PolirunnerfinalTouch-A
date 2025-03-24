// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class obstacleprefab extends Phaser.Physics.Arcade.Image {

	constructor(scene, x, y, texture, frame) {
		super(scene, x ?? 0, y ?? 0, texture || "broccoli", frame);

		this.scaleX = 2.5;
		this.scaleY = 2.5;
		scene.physics.add.existing(this, false);
		this.body.allowGravity = false;
		this.body.pushable = false;
		this.body.setSize(43, 64, false);

		/* START-USER-CTR-CODE */
		 // Movement speed (pixels per frame)
		this.moveSpeed = 200;

		// Add to scene's update list so our update method gets called
		scene.add.existing(this);
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */

	// Called by the scene's update loop
	update(gameSpeed, delta) {
		// Use the gameSpeed parameter passed from the Level scene
		// If delta is provided, use it for frame-rate independent movement
		// otherwise, use the gameSpeed directly
		if (delta) {
			this.x -= gameSpeed * (delta / 1000);
		} else {
			this.x -= gameSpeed;
		}

		// Destroy the obstacle when it goes off screen to the left
		if (this.x < -this.width) {
			this.destroy();
		}
	}

	// Sets the movement speed of the obstacle
	setMoveSpeed(speed) {
		this.moveSpeed = speed;
		return this;
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
