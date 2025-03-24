// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
// Removed SupabaseService import as it's no longer needed
/* END-USER-IMPORTS */

export default class Home extends Phaser.Scene {

	constructor() {
		super("Home");

		/* START-USER-CTR-CODE */
		// Removed all registration and input variables
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// background
		const background = this.add.image(640, 346, "background");
		background.scaleY = 1.25;

		// container_1
		const container_1 = this.add.container(0, 0);
		container_1.blendMode = Phaser.BlendModes.SKIP_CHECK;

		// playerholderSprite
		const playerholderSprite = this.add.sprite(405, 505, "playerstand", 0);
		playerholderSprite.scaleX = 1.444944303492753;
		playerholderSprite.scaleY = 1.444944303492753;
		playerholderSprite.play("playerstandplayerstand");
		container_1.add(playerholderSprite);

		// Title
		const title = this.add.image(640, 207, "Title");
		title.scaleX = 1.569421301620529;
		title.scaleY = 1.569421301620529;
		container_1.add(title);

		// playbutton
		const playbutton = this.add.image(640, 566, "Playbutton");
		playbutton.scaleX = 1.392321441500016;
		playbutton.scaleY = 1.392321441500016;
		container_1.add(playbutton);

			// Removed references to mainmsg and other UI elements we're not using

		this.title = title;
		this.playbutton = playbutton;
		// Removed property assignments for removed UI elements

		this.events.emit("scene-awake");
	}

	/** @type {Phaser.GameObjects.Image} */
	title;
	/** @type {Phaser.GameObjects.Image} */
	playbutton;
	// Removed property declarations for unused UI elements

	/* START-USER-CODE */

	preload() {
		// Load the click sound
	}

	create() {
		this.editorCreate();

		// Load the click sound
		this.clickSound = this.sound.add('click');

		// Removed references to log_container and mainmsg

		// Make the playbutton interactive
		this.playbutton.setInteractive();
		this.playbutton.on('pointerdown', () => {
			// Play click sound
			this.clickSound.play();

			// Disable the button to prevent multiple clicks during transition
			this.playbutton.disableInteractive();

			// Enhanced button press animation
			this.tweens.add({
				targets: this.playbutton,
				scaleX: this.playbutton.scaleX * 0.8,
				scaleY: this.playbutton.scaleY * 0.8,
				angle: 0, // Stop the rotation animation
				duration: 150,
				ease: 'Bounce.Out',
				onComplete: () => {
					// Apply a slight tint during press
					this.playbutton.setTint(0xdddddd);

					// Bounce back animation with slight overshoot
					this.tweens.add({
						targets: this.playbutton,
						scaleX: this.playbutton.scaleX * 1.1,
						scaleY: this.playbutton.scaleY * 1.1,
						duration: 300,
						ease: 'Back.Out',
						onComplete: () => {
							// Clear the tint
							this.playbutton.clearTint();

							// Create fade out effect
							this.cameras.main.fadeOut(1000, 0, 0, 0);

							// When fade effect is complete, start the Level scene
							this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
								this.scene.start('Level');
							});
						}
					});
				}
			});
		});

		// Add animation to the play button
		this.tweens.add({
			targets: this.playbutton,
			angle: { from: -25, to: 25 },
			duration: 2000,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.easeInOut'
		});

		// Store the original scale of the title
		const originalScaleX = this.title.scaleX;
		const originalScaleY = this.title.scaleY;

		// Add zoom in/out animation to the title
		this.tweens.add({
			targets: this.title,
			scaleX: originalScaleX * 1.1,
			scaleY: originalScaleY * 1.1,
			duration: 1500,
			yoyo: true,
			repeat: -1,
			ease: 'Quad.easeInOut'
		});

		// Add hover animation to the play button
		this.playbutton.on('pointerover', () => {
			// Scale up slightly when hovered
			this.tweens.add({
				targets: this.playbutton,
				scaleX: this.playbutton.scaleX * 1.05,
				scaleY: this.playbutton.scaleY * 1.05,
				duration: 100,
				ease: 'Power1'
			});
		});

		this.playbutton.on('pointerout', () => {
			// Return to normal scale when not hovered
			this.tweens.add({
				targets: this.playbutton,
				scaleX: 1.392321441500016, // Original scale
				scaleY: 1.392321441500016, // Original scale
				duration: 100,
				ease: 'Power1'
			});
		});
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
