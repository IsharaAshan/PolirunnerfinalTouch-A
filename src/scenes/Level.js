// You can write more code here

/* START OF COMPILED CODE */

import obstacleprefab from "../prefab/obstacleprefab.js";
import playerprefab from "../prefab/playerprefab.js";
import groundprefab from "../prefab/groundprefab.js";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Level extends Phaser.Scene {

	constructor() {
		super("Level");

		/* START-USER-CTR-CODE */
			// Initialize mobile detection
		this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// background-container
		const background_container = this.add.container(0, 0);
		background_container.blendMode = Phaser.BlendModes.SKIP_CHECK;

		// background
		const background = this.add.image(0, 355, "background");
		background.scaleY = 1.2;
		background_container.add(background);

		// background_1
		const background_1 = this.add.image(2661, 355, "background");
		background_1.scaleY = 1.2;
		background_container.add(background_1);

		// obstacle
		const obstacle = new obstacleprefab(this, 2235, 495);
		this.add.existing(obstacle);

		// player
		const player = new playerprefab(this, 640, 460);
		this.add.existing(player);

		// ground
		const ground = new groundprefab(this, 640, 586);
		this.add.existing(ground);

		// pausedisplaytext
		const pausedisplaytext = this.add.text(543, 101, "", {});
		pausedisplaytext.visible = false;
		pausedisplaytext.text = "PAUSE";
		pausedisplaytext.setStyle({ "color": "#000000ff", "fontFamily": "ApexMk2-BoldExtended", "fontSize": "55px" });

		// UI
		const uI = this.add.container(0, 0);
		uI.blendMode = Phaser.BlendModes.SKIP_CHECK;

		// pause_button
		const pause_button = this.add.image(1220, 60, "pause");
		pause_button.setInteractive(new Phaser.Geom.Rectangle(0, 0, 69, 71), Phaser.Geom.Rectangle.Contains);
		pause_button.scaleX = 0.8;
		pause_button.scaleY = 0.8;
		uI.add(pause_button);

		// jump_button
		const jump_button = this.add.image(1092, 576, "jump");
		jump_button.setInteractive(new Phaser.Geom.Circle(44, 44, 44), Phaser.Geom.Circle.Contains);
		uI.add(jump_button);

		// score-container
		const score_container = this.add.container(18, 50);
		score_container.blendMode = Phaser.BlendModes.SKIP_CHECK;
		uI.add(score_container);

		// scorevalue
		const scorevalue = this.add.text(109, 0, "", {});
		scorevalue.text = "9999";
		scorevalue.setStyle({ "color": "#000000ff", "fontFamily": "ApexMk2-BoldExtended", "fontSize": "30px" });
		score_container.add(scorevalue);

		// scoretext
		const scoretext = this.add.text(0, 0, "", {});
		scoretext.text = "SCORE:\n";
		scoretext.setStyle({ "color": "#000000ff", "fontFamily": "ApexMk2-BoldExtended", "fontSize": "30px" });
		score_container.add(scoretext);

		// player_ground
		const player_ground = this.physics.add.collider(player, ground);

		// player_obstacle
		const player_obstacle = this.physics.add.overlap(player, obstacle);

		this.background_container = background_container;
		this.obstacle = obstacle;
		this.player = player;
		this.pausedisplaytext = pausedisplaytext;
		this.pause_button = pause_button;
		this.jump_button = jump_button;
		this.scorevalue = scorevalue;
		this.player_ground = player_ground;
		this.player_obstacle = player_obstacle;
		this.uI = uI; // Add reference to UI container

		this.events.emit("scene-awake");
	}

	/** @type {Phaser.GameObjects.Container} */
	background_container;
	/** @type {obstacleprefab} */
	obstacle;
	/** @type {playerprefab} */
	player;
	/** @type {Phaser.GameObjects.Text} */
	pausedisplaytext;
	/** @type {Phaser.GameObjects.Image} */
	pause_button;
	/** @type {Phaser.GameObjects.Image} */
	jump_button;
	/** @type {Phaser.GameObjects.Text} */
	scorevalue;
	/** @type {Phaser.Physics.Arcade.Collider} */
	player_ground;
	/** @type {Phaser.Physics.Arcade.Collider} */
	player_obstacle;
	/** @type {Phaser.GameObjects.Container} */
	uI;

	/* START-USER-CODE */

	// Write more your code here

	create() {
		this.editorCreate();
		
		// Handle responsive layout
		this.setupResponsiveUI();
		
		// Set up orientation handling
		this.setupOrientationHandling();

		this.clickSound = this.sound.add('click');
		this.jumpSound = this.sound.add('jump');	
		this.hitSound = this.sound.add('hit');
		this.hitGround = this.sound.add('groundhit');
		this.gameOverSound = this.sound.add('gameOver');

		// Set up jump controls
		this.cursors = this.input.keyboard.createCursorKeys();
		
		// Add touch controls for the whole screen
		if (this.isMobile) {
			this.setupMobileTouchControls();
		}

		// Only set walk animation initially, not during jumps
		if (!this.player.body.velocity.y < 0) {
			this.player.anims.play('player-walk', true);
		}

		// Add isGrounded flag to track player ground state
		this.isGrounded = false;

        // Track which obstacles have already been hit
        this.hitObstacles = new Set();

        // Add gameOver flag
        this.gameOver = false;

		// Initialize score
		this.score = 0;
		this.updateScoreDisplay();

		// Set up timer to increase score
		this.scoreTimer = this.time.addEvent({
			delay: 100,                // Increase score every 100ms
			callback: this.increaseScore,
			callbackScope: this,
			loop: true
			});

		// Initialize background scrolling
		// Get background references
		this.bg1 = this.background_container.getAt(this.background_container.length - 2); // background
		this.bg2 = this.background_container.getAt(this.background_container.length - 1); // background_1

		// Set initial positions
		this.bg1.x = 0;
		this.bg2.x = 2661; // Match the original position in editorCreate

		// Define game speed that will control both obstacle and background
		// Adjust base speed for mobile devices
		this.gameSpeed = this.isMobile ? 4 : 5;
		this.maxGameSpeed = this.isMobile ? 12 : 15; // Lower max speed on mobile

		// Timer to increase game speed over time
		this.speedTimer = this.time.addEvent({
			delay: 1000,              // Increase speed every second
			callback: this.increaseGameSpeed,
			callbackScope: this,
			loop: true
		});

		// Update isGrounded state when player touches ground
		this.player_ground.callbackContext = this;
		this.player_ground.collideCallback = function(player, ground) {
			if(this.isGrounded) return;
			this.hitGround.play();
			this.isGrounded = true;
            // Only play walk animation if the player was jumping
            if (player.anims.currentAnim && player.anims.currentAnim.key === 'player-jump') {
                player.anims.play('player-walk', true);
            }
		};

		// Set up obstacle collision detection
		this.player_obstacle.callbackContext = this;
		this.player_obstacle.collideCallback = function(player, obstacle) {
            // Check if we've already processed this obstacle's collision
            if (this.hitObstacles.has(obstacle)) return;

			// Handle collision (e.g., game over, lose life, etc.)
			console.log("Player hit obstacle!");
			this.hitSound.play();
			this.gameOverSound.play(); // Play game over sound
			// Stop increasing score when player hits obstacle
			this.scoreTimer.paused = true;
			// Stop speed timer
			this.speedTimer.paused = true;

            // Set gameOver flag to true
            this.gameOver = true;

            // Add this obstacle to the hit set to prevent multiple collision processing
            this.hitObstacles.add(obstacle);

            // Add a short delay before transitioning to the GameOver scene
			this.time.delayedCall(500, () => {
				// Transition to the GameOver scene and pass the final score

				this.cameras.main.fadeOut(1000, 0, 0, 0);

					// When fade out completes, start the Level scene
					this.cameras.main.once('camerafadeoutcomplete', () => {
						this.scene.start("GameOver", { score: this.score });
					});
			}, [], this);
		};

		// Set up pause button functionality
		this.isPaused = false;
		this.pause_button.on('pointerdown', () => {
			this.togglePause();
			});

		// Set up jump button functionality
		this.jump_button.on('pointerdown', () => {
			this.jumpPlayer();
		});

		// Store original button scales for animations
		this.pause_button.originalScale = 0.8;
		this.jump_button.originalScale = 1;
		
		// Add resize event listener for handling screen size changes
		this.scale.on('resize', this.resize, this);
		this.resize(); // Call initially
	}
	
	// Setup responsive UI positioning
	setupResponsiveUI() {
		// Get game dimensions
		const width = this.scale.width;
		const height = this.scale.height;
		
		// Center the pause display text
		this.pausedisplaytext.x = width / 2 - this.pausedisplaytext.width / 2;
		this.pausedisplaytext.y = height / 3;
		
		// Position pause button in the top right corner
		this.pause_button.x = width - 60;
		this.pause_button.y = 60;
		
		// Make jump button larger and position it for better mobile accessibility
		if (this.isMobile) {
			// Make jump button bigger on mobile
			this.jump_button.setScale(1.5);
			
			// Position jump button in the bottom right corner with padding
			this.jump_button.x = width - 100;
			this.jump_button.y = height - 100;
		}
	}
	
	// Handle orientation changes
	setupOrientationHandling() {
		// Check if we're on a mobile device
		if (this.isMobile) {
			// Add an orientation change warning if the game is designed for landscape
			window.addEventListener('orientationchange', () => {
				this.checkOrientation();
			});
			
			// Also listen for resize which happens on orientation change
			window.addEventListener('resize', () => {
				this.checkOrientation();
			});
			
			// Initial check
			this.checkOrientation();
		}
	}
	
	// Check device orientation and show warning if in portrait mode
	checkOrientation() {
		// Wait a moment for orientation change to complete
		setTimeout(() => {
			const isPortrait = window.innerHeight > window.innerWidth;
			
			if (isPortrait && !this.orientationWarning) {
				// Create orientation warning if in portrait mode
				this.isPaused = true;
				this.physics.pause();
				this.scoreTimer.paused = true;
				this.speedTimer.paused = true;
				
				// Create a semi-transparent background
				this.orientationBg = this.add.rectangle(
					this.scale.width / 2,
					this.scale.height / 2,
					this.scale.width,
					this.scale.height,
					0x000000,
					0.7
					);
				this.orientationBg.setDepth(1000); // Set high depth to appear above everything
				
				// Create the warning text
				this.orientationWarning = this.add.text(
					this.scale.width / 2,
					this.scale.height / 2,
					"Please rotate your device\nto landscape mode",
					{
						fontFamily: "ApexMk2-BoldExtended",
						fontSize: "32px",
						color: "#ffffff",
						align: "center"
					}
				);
				this.orientationWarning.setOrigin(0.5);
				this.orientationWarning.setDepth(1001); // Higher depth than background
				
				// Add rotation icon
				this.rotateIcon = this.add.image(
					this.scale.width / 2,
					this.scale.height / 2 + 100,
					"jump" // Using jump as a placeholder, ideally you'd have a rotate icon
				);
				this.rotateIcon.setScale(0.5);
				this.rotateIcon.setDepth(1001); // Higher depth than background
				
				// Animate the rotate icon
				this.tweens.add({
					targets: this.rotateIcon,
					angle: 90,
					duration: 1000,
					yoyo: true,
					repeat: -1
				});
			} else if (!isPortrait && this.orientationWarning) {
				// Remove warning if orientation is correct
				if (this.orientationWarning) {
					this.orientationWarning.destroy();
					this.orientationWarning = null;
				}
				if (this.orientationBg) {
					this.orientationBg.destroy();
					this.orientationBg = null;
				}
				if (this.rotateIcon) {
					this.rotateIcon.destroy();
					this.rotateIcon = null;
				}
				
				// Resume the game
				if (this.isPaused && !this.gameOver) {
					this.isPaused = false;
					this.physics.resume();
					this.scoreTimer.paused = false;
					this.speedTimer.paused = false;
				}
			}
		}, 200);
	}
	
	// Set up mobile touch controls for the entire screen
	setupMobileTouchControls() {
		// Get game dimensions
		const width = this.scale.width;
		const height = this.scale.height;
		
		// Create a large invisible touch zone for jumping (left side of screen)
		this.touchZone = this.add.rectangle(
			width / 4, // Left quarter of screen
			height / 2,
			width / 2, // Half the screen width
			height,
			0xffffff,
			0 // Invisible
		);
		this.touchZone.setInteractive();
		this.touchZone.on('pointerdown', () => {
			this.jumpPlayer();
		});
		
		// Add touch feedback effect
		this.touchZone.on('pointerdown', () => {
			// Create a brief visual feedback for touch
			const touchFeedback = this.add.circle(
				this.input.activePointer.x,
				this.input.activePointer.y,
				30,
				0xffffff,
				0.3
			);
			
			// Animate and remove the feedback
			this.tweens.add({
				targets: touchFeedback,
				scale: 2,
				alpha: 0,
				duration: 300,
				onComplete: () => {
					touchFeedback.destroy();
				}
			});
		});
		
		// Double-tap anywhere to pause
		this.lastTap = 0;
		this.input.on('pointerdown', (pointer) => {
			const currentTime = new Date().getTime();
			const tapLength = currentTime - this.lastTap;
			
			if (tapLength < 300 && tapLength > 0) {
				// Double tap detected
				this.togglePause();
			}
			
			this.lastTap = currentTime;
		});
	}
	
	// Handle window resize events
	resize() {
		// Get game dimensions
		const width = this.scale.width;
		const height = this.scale.height;
		
		// Reposition UI elements
		if (this.pausedisplaytext) {
			this.pausedisplaytext.x = width / 2 - this.pausedisplaytext.width / 2;
			this.pausedisplaytext.y = height / 3;
		}
		
		if (this.pause_button) {
			this.pause_button.x = width - 60;
			this.pause_button.y = 60;
		}
		
		if (this.jump_button) {
			// Position jump button in the bottom right for better mobile accessibility
			this.jump_button.x = width - 100;
			this.jump_button.y = height - 100;
		}
		
		// Update touch zone if it exists
		if (this.touchZone) {
			this.touchZone.x = width / 4;
			this.touchZone.y = height / 2;
			this.touchZone.displayWidth = width / 2;
			this.touchZone.displayHeight = height;
		}
		
		// Check orientation if on mobile
		if (this.isMobile) {
			this.checkOrientation();
		}
	}

	// Toggle pause state function
	togglePause() {
		this.isPaused = !this.isPaused;

		this.clickSound.play();

		if (this.isPaused) {
			// Pause the game
			this.physics.pause();
			this.scoreTimer.paused = true;
			this.speedTimer.paused = true; // Also pause speed timer
			this.pausedisplaytext.visible = true;
			// Change button texture to resume
			this.pause_button.setTexture('resume');
		} else {
			// Resume the game
			this.physics.resume();
			this.scoreTimer.paused = false;
			this.speedTimer.paused = false; // Also resume speed timer
			this.pausedisplaytext.visible = false;
			// Change button texture back to pause
			this.pause_button.setTexture('pause');
		}
	}

	// Increase score function
	increaseScore() {
		// Increase score by 1 point
		this.score += 1;
		// Update the score display
		this.updateScoreDisplay();
	}

	// Update the score display
	updateScoreDisplay() {
		this.scorevalue.setText(this.score.toString());
	}

	// Function to handle player jumping
	jumpPlayer() {
		if (this.isGrounded && !this.isPaused) {
			// Adjust jump velocity for mobile if needed
			const jumpVelocity = this.isMobile ? -1800 : -2000;
			this.player.setVelocityY(jumpVelocity);
			this.isGrounded = false; // Set to false to prevent infinite jumping
			this.jumpSound.play();
            // Play the jump animation
            this.player.anims.play('playerjumpplayerJump', true);
		}
	}

	// Function to increase game speed gradually
	increaseGameSpeed() {
		if (this.gameSpeed < this.maxGameSpeed) {
			// Adjust speed increase rate for mobile
			const speedIncrement = this.isMobile ? 0.3 : 0.5;
			this.gameSpeed += speedIncrement;
		}
	}

	update() {
		// Don't update game elements if the game is paused or game over
		if (this.isPaused || this.gameOver) {
			return;
		}

		// Jump when space is pressed and player is on ground
		if(this.cursors.space.isDown && this.isGrounded) {
			this.jumpPlayer();
		 }

		// Only play walk animation if the player is on the ground
		if (this.isGrounded && 
			(!this.player.anims.currentAnim || 
			 this.player.anims.currentAnim.key !== 'player-walk')) {
			this.player.anims.play('player-walk', true);
		}

		 // Only play jump animation if the player is in the air
		if (!this.isGrounded && 
			(!this.player.anims.currentAnim || 
			 this.player.anims.currentAnim.key !== 'playerjumpplayerJump')) {
			this.player.anims.play('playerjumpplayerJump', true);
		}

		// Update obstacle movement using the game speed
		if (this.obstacle && this.obstacle.active) {
			// Pass gameSpeed directly without delta - obstacle handles this internally now
			this.obstacle.update(this.gameSpeed);
		}        

		// Create new obstacle when the current one goes off screen
		if (!this.obstacle || !this.obstacle.active) {
			this.spawnNewObstacle();
		}

		// Reset collision processed flag each frame
		this.collisionProcessed = false;

		// Move backgrounds to create scrolling effect using the game speed
		this.bg1.x -= this.gameSpeed;
		this.bg2.x -= this.gameSpeed;

		// Reposition backgrounds when they move off-screen
		if (this.bg1.x <= -2661) {
			this.bg1.x = this.bg2.x + 2661;
		}

		if (this.bg2.x <= -2661) {
			this.bg2.x = this.bg1.x + 2661;
		}
	}

	spawnNewObstacle() {
		// Create a new obstacle at the right side of the screen with random vegetable texture
		const vegetables = ['carrot', 'onion', 'radish', 'turnip', 'turnipv2', 'broccoli'];
		const randomTexture = Phaser.Utils.Array.GetRandom(vegetables);

		this.obstacle = new obstacleprefab(this, this.game.config.width + 100, 495, randomTexture);
		this.add.existing(this.obstacle);

		// Re-establish the collision between player and the new obstacle
		this.player_obstacle = this.physics.add.overlap(this.player, this.obstacle);

		// Set up obstacle collision detection for the new obstacle
		this.player_obstacle.callbackContext = this;
		this.player_obstacle.collideCallback = function(player, obstacle) {
			// Check if we've already processed this obstacle's collision
			if (this.hitObstacles.has(obstacle)) return;

			console.log("Player hit obstacle!");
			this.hitSound.play();
			this.gameOverSound.play(); // Play game over sound
			// Stop increasing score when player hits obstacle
			this.scoreTimer.paused = true;

			// Set gameOver flag to true
			this.gameOver = true;

			// Add this obstacle to the hit set to prevent multiple collision processing
			this.hitObstacles.add(obstacle);

			// Improved scene transition with fade animation
			this.cameras.main.fadeOut(800, 255, 0, 0); // Red tint to indicate failure

			// When fade out is complete, start the GameOver scene with fade in effect
			this.cameras.main.once('camerafadeoutcomplete', () => {
					// Get the high score from sessionStorage
					const highScore = parseInt(sessionStorage.getItem('poliQuest_highScore') || 0);

					// Start GameOver scene and tell it to fade in
					this.scene.start("GameOver", { 
						score: this.score,
						highScore: highScore,
						fadeIn: true  // Pass fadeIn flag to GameOver scene
					});
			});
		};
	}

	// Clean up event listeners when scene shuts down
	shutdown() {
		// Remove resize listener
		this.scale.off('resize', this.resize, this);
		
		// Remove orientation change listener if on mobile
		if (this.isMobile) {
			window.removeEventListener('orientationchange', this.checkOrientation);
			window.removeEventListener('resize', this.checkOrientation);
		}
	}

	// Handle pause button click
	handlePauseButtonClick() {
			// The original pause_button handles this functionality
			this.togglePause();
	}

	// Handle jump button press
	handleJumpButtonPress() {
			// The original jump_button handles this functionality
			this.jumpPlayer();
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
