// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class GameOver extends Phaser.Scene {

	constructor() {
		super("GameOver");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// background
		const background = this.add.image(601, 363, "background");
		background.scaleY = 1.2;

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// Write your code here

	createPopupBackground(x, y, width, height, radius = 20) {
		const graphics = this.add.graphics();
		graphics.fillStyle(0x000000, 0.8); // Black color with 80% opacity

		// Draw rounded rectangle
		graphics.beginPath();
		graphics.moveTo(x + radius, y);
		graphics.lineTo(x + width - radius, y);
		graphics.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0);
		graphics.lineTo(x + width, y + height - radius);
		graphics.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2);
		graphics.lineTo(x + radius, y + height);
		graphics.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI);
		graphics.lineTo(x, y + radius);
		graphics.arc(x + radius, y + radius, radius, Math.PI, -Math.PI / 2);
		graphics.closePath();
		graphics.fill();

		return graphics;
	}

	createCenterPopupBackground(width, height, radius = 20) {
		const { width: gameWidth, height: gameHeight } = this.scale;
		const x = (gameWidth - width) / 2;
		const y = (gameHeight - height) / 2;

		return this.createPopupBackground(x, y, width, height, radius);
	}

	preload() {
		this.load.audio('popup', 'assets/sounds/popup.wav');
		this.load.audio('logsfx', 'assets/sounds/logsfx.wav');
		this.load.audio('submitsfx', 'assets/sounds/submitsfx.wav'); // Changed from 'click' to 'submitsfx'
	}

	create() {
		this.editorCreate();

		// Get the game's canvas dimensions
		const { width, height } = this.scale;


        
		// Create a curved corner panel on the right side - position more to the left
		const panelWidth = 250;
		const panelHeight = height * 0.8; // Increased from 0.7 to 0.8 to have more vertical space
		 // Directly position the panel in its final position (no animation)
		const finalPanelX = width - panelWidth - 40;
		const rightPanelY = (height - panelHeight) / 2;
		
		// Create the curved panel using the existing method
		this.rightPanel = this.createPopupBackground(
			finalPanelX,
			rightPanelY,
			panelWidth,
			panelHeight,
			25 // larger radius for more curved corners
			);

		// Add the panel to the scene
		const centerPopup = this.createCenterPopupBackground(580, 650, 20);

		// Add sound effects
		this.popupSound = this.sound.add('popup');
		this.logsfxSound = this.sound.add('logsfx');
		this.submitsfxSound = this.sound.add('submitsfx'); // Changed from 'clickSound' to 'submitsfxSound'

		// Play popup sound when the scene starts
		this.popupSound.play();

		// Add "Leaderboard" title
		const leaderboardTitle = this.add.text(
			finalPanelX + panelWidth / 2,
			rightPanelY + 30,
			"LEADERBOARD",
			{
				fontFamily: 'ApexMk2-BoldExtended, Arial',
				fontSize: '24px',
				color: '#ffffff',
				align: 'center'
			}
		);
		leaderboardTitle.setOrigin(0.5, 0);

		// Add column headers (Nickname and Score)
		const nicknameTitle = this.add.text(
			finalPanelX + 30,
			rightPanelY + 80,
			"NICKNAME",
			{
				fontFamily: 'ApexMk2-BoldExtended, Arial',
				fontSize: '16px',
				color: '#ffffff'
			}
		);

		const scoreTitle = this.add.text(
			finalPanelX + panelWidth - 40,
			rightPanelY + 80,
			"SCORE",
			{
				fontFamily: 'ApexMk2-BoldExtended, Arial',
				fontSize: '16px',
				color: '#ffffff'
			}
		);
		scoreTitle.setOrigin(1, 0); // Right align the score texts

		// Add a horizontal line below headers
		const lineY = rightPanelY + 110;
		const graphics = this.add.graphics();
		graphics.lineStyle(2, 0xffffff, 0.5);
		graphics.beginPath();
		graphics.moveTo(finalPanelX + 20, lineY);
		graphics.lineTo(finalPanelX + panelWidth - 20, lineY);
		graphics.closePath();
		graphics.stroke();

		// Group all leaderboard elements for reference
		this.leaderboardGroup = this.add.group();
		this.leaderboardGroup.add(this.rightPanel);
		this.leaderboardGroup.add(leaderboardTitle);
		this.leaderboardGroup.add(nicknameTitle);
		this.leaderboardGroup.add(scoreTitle);
		this.leaderboardGroup.add(graphics);

		// Load leaderboard data from Supabase
		this.loadLeaderboardData(finalPanelX, rightPanelY + 120, panelWidth); // Moved up by 10px

		// Create form container element without animation CSS
		const formContainer = document.createElement('div');
		formContainer.id = 'game-over-form';
		formContainer.style = `
			position: absolute;
			width: 80%;
			max-width: 750px;
			top: 20px;
			left: 50%;
			transform: translateX(-50%);
			padding: 30px;
			border-radius: 15px;
			color: white;
			font-family: 'ApexMk2-BoldExtended', Arial, sans-serif;
			box-sizing: border-box;
			z-index: 1000;
			font-size: calc(12px + 0.6vw);
		`;

		// Get game container and properly append form as a child element
		const canvas = this.sys.game.canvas;
		const gameContainer = canvas.parentElement || document.getElementById('game-container');

		// Make sure we have a valid container
		if (!gameContainer) {
			console.error("Could not find game container to append form to");
			return;
		}

		// Ensure the game container has position relative for proper child positioning
		gameContainer.style.position = 'relative';
		
		// Remove any existing form before adding a new one
		const existingForm = document.getElementById('game-over-form');
		if (existingForm && existingForm.parentNode) {
			existingForm.parentNode.removeChild(existingForm);
		}

		// Add form to game container
		gameContainer.appendChild(formContainer);

		// Position the form correctly within the canvas bounds
		this.positionFormWithinCanvas(formContainer, canvas);

		// Create the form HTML with added restart and home buttons
		formContainer.innerHTML = `
			<h2 style="text-align: center; margin-bottom: 25px; font-size: 64px; font-family: 'ApexMk2-BoldExtended', Arial, sans-serif; text-transform: uppercase; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); color: #ffffff;">GAME OVER</h2>
			<div style="text-align: center; margin-bottom: 25px;">
				<h3 style="margin-bottom: 12px; font-size: 32px; font-family: 'ApexMk2-BoldExtended', Arial, sans-serif; color: #ffffff;">SCORE</h3>
				<p style="font-size: 48px; font-weight: bold; font-family: 'ApexMk2-BoldExtended', Arial, sans-serif; color: #ffffff;">${this.scene.settings.data.score || 0}</p>
			</div>
			<form id="player-details-form">
				<div style="margin-bottom: 20px; text-align: center;">
					<label for="player-nickname" style="display: block; margin-bottom: 8px; font-family: 'ApexMk2-BoldExtended', Arial, sans-serif; font-size: 18px; text-align: center; color: #ffffff;">Nickname:</label>
					<input type="text" id="player-nickname" maxlength="20" style="width: 85%; padding: 12px; border-radius: 6px; border: 2px solid #333; box-sizing: border-box; font-family: 'ApexMk2-BoldExtended', Arial, sans-serif; font-size: 16px; margin: 0 auto; display: block; background-color: #000000; color: #ffffff; height: 50px;" required>
					<div id="nickname-validation-message" style="color: #ff4444; font-size: 14px; margin-top: 8px; display: none; font-family: 'ApexMk2-BoldExtended', Arial, sans-serif; text-align: center;">
						Please enter a nickname
					</div>
				</div>

				<div style="margin-bottom: 20px; text-align: center;">
					<label for="bsc-address" style="display: block; margin-bottom: 8px; font-family: 'ApexMk2-BoldExtended', Arial, sans-serif; font-size: 18px; text-align: center; color: #ffffff;">BSC Address:</label>
					<input type="text" id="bsc-address" style="width: 85%; padding: 12px; border-radius: 6px; border: 2px solid #333; box-sizing: border-box; font-family: 'ApexMk2-BoldExtended', Arial, sans-serif; font-size: 16px; margin: 0 auto; display: block; background-color: #000000; color: #ffffff; height: 50px;" 
						pattern="^0x[a-fA-F0-9]{40}$" 
						title="Please enter a valid BSC address starting with 0x followed by 40 hexadecimal characters"
						placeholder="0x..." required>
					<div id="bsc-validation-message" style="color: #ff4444; font-size: 14px; margin-top: 8px; display: none; font-family: 'ApexMk2-BoldExtended', Arial, sans-serif; text-align: center;">
						Please enter a valid BSC address
					</div>
				</div>

				<div id="general-error-message" style="color: #ff4444; font-size: 16px; margin: 20px 0 15px 0; display: none; font-family: 'ApexMk2-BoldExtended', Arial, sans-serif; text-align: center; font-weight: bold;">
					Please fix the errors above
				</div>
				
				<!-- Add submission status message container -->
				<div id="submission-status" style="text-align: center; margin: 15px 0; display: none;">
					<div id="loading-indicator" style="display: none; margin-bottom: 10px;">
						<div style="width: 40px; height: 40px; border: 4px solid #ffffff; border-top: 4px solid #4CAF50; border-radius: 50%; margin: 0 auto; animation: spin 1s linear infinite;"></div>
						<style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
						<p style="margin-top: 10px; color: #ffffff;">Submitting score...</p>
					</div>
					<div id="success-message" style="display: none; padding: 15px; margin-bottom: 15px;">
						<p style="color: #ffffff; font-size: 20px; font-weight: bold; text-shadow: 0 0 8px rgba(76, 175, 80, 0.8);">Score submitted successfully!</p>
					</div>
					<div id="error-message" style="display: none; padding: 15px; background-color: rgba(244, 67, 54, 0.3); border: 2px solid #F44336; border-radius: 8px; margin-bottom: 15px;">
						<p style="color: #ffffff; font-size: 18px; font-weight: bold;">Failed to submit score. Please try again.</p>
					</div>
				</div>

				<div style="text-align: center; margin-top: 25px;">
					<button type="submit" id="submit-button" style="padding: 15px 28px; background-color: #000000; color: white; border: 3px solid #ffffff; border-radius: 6px; cursor: pointer; font-family: 'ApexMk2-BoldExtended', Arial, sans-serif; font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; min-height: 60px; min-width: 180px; width: 90%; max-width: 300px; margin: 0 auto; display: block; touch-action: manipulation;">Submit Score</button>
				</div>

				<div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 30px; flex-wrap: wrap; width: 100%;">
					<button type="button" id="restart-button" style="padding: 12px 20px; background-color: #000000; color: white; border: 3px solid #ffffff; border-radius: 6px; cursor: pointer; font-family: 'ApexMk2-BoldExtended', Arial, sans-serif; font-size: 18px; font-weight: bold; text-transform: uppercase; min-height: 55px; min-width: 130px; flex: 1 1 40%; max-width: 180px; touch-action: manipulation;">Restart</button>
					<button type="button" id="home-button" style="padding: 12px 20px; background-color: #000000; color: white; border: 3px solid #ffffff; border-radius: 6px; cursor: pointer; font-family: 'ApexMk2-BoldExtended', Arial, sans-serif; font-size: 18px; font-weight: bold; text-transform: uppercase; min-height: 55px; min-width: 130px; flex: 1 1 40%; max-width: 180px; touch-action: manipulation;">Home</button>
				</div>
			</form>
		`;

		 // Add form submission handling with validation errors
		const form = document.getElementById('player-details-form');
		const nicknameInput = document.getElementById('player-nickname');
		const bscInput = document.getElementById('bsc-address');
		const nicknameValidationMessage = document.getElementById('nickname-validation-message');
		const bscValidationMessage = document.getElementById('bsc-validation-message');
		const generalErrorMessage = document.getElementById('general-error-message');
		const submissionStatus = document.getElementById('submission-status');
		const loadingIndicator = document.getElementById('loading-indicator');
		const successMessage = document.getElementById('success-message');
		const errorMessage = document.getElementById('error-message');
		const submitButton = document.getElementById('submit-button');

		// BSC address validation
		const validateBscAddress = (address) => {
			const bscRegex = /^0x[a-fA-F0-9]{40}$/;
			return bscRegex.test(address);
		};

		// Function to show error for a short time
		const showErrorMessage = (element, duration = 3000) => {
			element.style.display = 'block';
			setTimeout(() => {
				element.style.display = 'none';
			}, duration);
		};

		// Nickname validation
		nicknameInput.addEventListener('input', (e) => {
			nicknameValidationMessage.style.display = e.target.value.trim() ? 'none' : 'block';
		});

		// BSC address validation
		bscInput.addEventListener('input', (e) => {
			const isValid = validateBscAddress(e.target.value);
			bscValidationMessage.style.display = isValid ? 'none' : 'block';
		});

		form.addEventListener('submit', (e) => {
			e.preventDefault();
			this.submitsfxSound.play(); // Changed from 'clickSound' to 'submitsfxSound'

			const playerNickname = nicknameInput.value.trim();
			const bscAddress = bscInput.value.trim();

			// Validate nickname
			const isNicknameValid = playerNickname.length > 0;
			nicknameValidationMessage.style.display = isNicknameValid ? 'none' : 'block';

			// Validate BSC address
			const isBscValid = validateBscAddress(bscAddress);
			bscValidationMessage.style.display = isBscValid ? 'none' : 'block';

			if (isNicknameValid && isBscValid) {
				 // Show loading indicator and hide any previous messages
				submissionStatus.style.display = 'block';
				loadingIndicator.style.display = 'block';
				successMessage.style.display = 'none';
				errorMessage.style.display = 'none';
				
				// Disable the submit button during submission
				submitButton.disabled = true;
				submitButton.style.opacity = '0.6';
				submitButton.textContent = 'Submitting...';

				// Store the player data with the correct field names for Supabase
				this.playerData = {
					nick_name: playerNickname,
					bsc_adress: bscAddress,
					score: this.scene.settings.data.score || 0
				};

				// Submit score to Supabase if it's available
				if (window.supabaseService) {
					window.supabaseService.savePlayerData(this.playerData)
						.then(response => {
							this.logsfxSound.play(); // Play success sound
							console.log('Score submitted successfully:', response);
							
							 // Hide loading and show success message
							loadingIndicator.style.display = 'none';
							successMessage.style.display = 'block';
							
							 // Hide the submit button completely instead of changing to "Continue"
							submitButton.style.display = 'none';
							
							// Reload the leaderboard to show updated data
							const { width, height } = this.scale;
							const panelWidth = 250;
							const finalPanelX = width - panelWidth - 40;
							this.loadLeaderboardData(finalPanelX, (height - height * 0.7) / 2 + 130, panelWidth);
						})
						.catch(error => {
							console.error('Error submitting score:', error);
							this.logsfxSound.play(); // Add error sound for failed submissions
							
							// Hide loading and show error message
							loadingIndicator.style.display = 'none';
							errorMessage.style.display = 'block';
							
							// Re-enable submit button
							submitButton.disabled = false;
							submitButton.style.opacity = '1';
							submitButton.textContent = 'Try Again';
						});
				} else {
					console.warn("Supabase service not available");
					
					// Hide loading and show error message after a brief delay
					setTimeout(() => {
						this.logsfxSound.play(); // Add error sound for service unavailable
						loadingIndicator.style.display = 'none';
						errorMessage.style.display = 'block';
						errorMessage.querySelector('p').textContent = "Submission service unavailable";
						
						// Re-enable submit button
						submitButton.disabled = false;
						submitButton.style.opacity = '1';
						submitButton.textContent = 'Try Again';
					}, 1000);
				}
				
				// Log data (we no longer immediately remove the form)
				console.log('Score submission initiated:', this.playerData);
			} else {
				// Show general error message
				showErrorMessage(generalErrorMessage, 5000);
			}
		});

		// Add restart and home button functionality
		const restartButton = document.getElementById('restart-button');
		const homeButton = document.getElementById('home-button');

		restartButton.addEventListener('click', () => {
			this.submitsfxSound.play(); // Changed from 'clickSound' to 'submitsfxSound'
			// Clean up DOM elements and event listeners
			formContainer.remove();
			window.removeEventListener('resize', this.adjustFormToCanvas);

			// Restart the game (assuming 'Level' is your gameplay scene)
			this.scene.start('Level');
		});

		homeButton.addEventListener('click', () => {
			this.submitsfxSound.play(); // Changed from 'clickSound' to 'submitsfxSound'
			// Clean up DOM elements and event listeners
			formContainer.remove();
			window.removeEventListener('resize', this.adjustFormToCanvas);

			// Go to home/title screen
			this.scene.start('Home');
		});

		// Store references for cleanup
		this.formContainer = formContainer;

		// Set up resize handler
		this.adjustFormToCanvas = () => this.positionFormWithinCanvas(formContainer, canvas);
		window.addEventListener('resize', this.adjustFormToCanvas);
	}

	// Improved helper method to position form correctly within canvas
	positionFormWithinCanvas(formElement, canvas) {
		if (!formElement || !canvas) return;

		// Get the parent game container
		const gameContainer = canvas.parentElement || document.getElementById('game-container');
		if (!gameContainer) return;

		// Get container and canvas dimensions
		const containerRect = gameContainer.getBoundingClientRect();
		const canvasRect = canvas.getBoundingClientRect();

		// Get viewport dimensions
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const isSmallScreen = viewportWidth < 480 || viewportHeight < 400;
		const isVerySmallScreen = viewportWidth < 360 || viewportHeight < 350;
		const isPortrait = viewportHeight > viewportWidth;

		// Calculate scale based on game container's dimensions
		const gameBaseWidth = 1280;
		const gameBaseHeight = 720;
		const containerScaleX = containerRect.width / gameBaseWidth;
		const containerScaleY = containerRect.height / gameBaseHeight;
		const containerScale = Math.min(containerScaleX, containerScaleY);

		// Set form size
		let formWidthPercent = isSmallScreen ? 0.95 : 0.85;
		const formWidth = Math.min(750, containerRect.width * formWidthPercent);
		formElement.style.width = `${formWidth}px`;

		// Position form at the top center
		formElement.style.position = 'absolute';
		formElement.style.left = '50%';
		formElement.style.top = '20px';
		formElement.style.transform = 'translateX(-50%)';

		// Rest of the styling adjustments
		let formScale;
		let formPadding = '30px';
		if (isVerySmallScreen) {
			formScale = Math.min(0.7, containerScale * 0.7);
			formPadding = '15px';
		} else if (isSmallScreen) {
			formScale = Math.min(0.85, containerScale * 0.85);
			formPadding = '20px';
		} else {
			formScale = Math.min(1, containerScale * 0.9);
		}

		formElement.style.padding = formPadding;
		formElement.style.transform += ` scale(${formScale})`;
		formElement.style.transformOrigin = 'top center';

		// Set boundaries
		formElement.style.maxWidth = `${containerRect.width * 0.98}px`;
		formElement.style.maxHeight = `${containerRect.height * 0.98}px`;

		// Adjust headings
		const headings = formElement.querySelectorAll('h2, h3');
		headings.forEach(heading => {
			if (isVerySmallScreen) {
				if (heading.tagName === 'H2') {
					heading.style.fontSize = '32px';
					heading.style.marginBottom = '15px';
				} else if (heading.tagName === 'H3') {
					heading.style.fontSize = '18px';
				}
			} else if (isSmallScreen) {
				if (heading.tagName === 'H2') {
					heading.style.fontSize = '40px';
				}
			}
		});

		// Adjust score display
		const scoreDisplay = formElement.querySelector('h3 + p');
		if (scoreDisplay && isVerySmallScreen) {
			scoreDisplay.style.fontSize = '28px';
			scoreDisplay.style.marginBottom = '10px';
		}

		// Adjust buttons for better mobile experience
		const buttons = formElement.querySelectorAll('button');
		buttons.forEach(button => {
			const isActionButton = button.id === 'submit-button';
			if (isVerySmallScreen) {
				button.style.fontSize = isActionButton ? '16px' : '14px';
				button.style.padding = isActionButton ? '10px 18px' : '8px 15px';
				button.style.minHeight = isActionButton ? '45px' : '40px';
				button.style.margin = '5px';
			} else if (isSmallScreen) {
				button.style.fontSize = isActionButton ? '17px' : '15px';
				button.style.padding = isActionButton ? '11px 20px' : '10px 16px';
				button.style.minHeight = isActionButton ? '50px' : '42px';
			}
			// Ensure touch-friendly tap targets
			button.style.minWidth = isVerySmallScreen ? '100px' : '120px';
		});
		
		// Handle button container layout for different orientations
		const buttonContainer = formElement.querySelector('div[style*="display: flex"]');
		if (buttonContainer) {
			if (isVerySmallScreen && isPortrait) {
				// Stack buttons vertically on very small portrait screens
				buttonContainer.style.flexDirection = 'column';
				buttonContainer.style.gap = '15px';
				buttonContainer.style.alignItems = 'center';
				// Make buttons wider when stacked
				const navButtons = buttonContainer.querySelectorAll('button');
				navButtons.forEach(btn => {
					btn.style.width = '80%';
					btn.style.maxWidth = '200px';
				});
			} else {
				// Side by side for landscape or larger screens
				buttonContainer.style.flexDirection = 'row';
				buttonContainer.style.gap = isSmallScreen ? '15px' : '20px';
			}
		}
	}

	// Cleanup when scene is shut down
	shutdown() {
		if (this.formContainer && this.formContainer.parentNode) {
			this.formContainer.parentNode.removeChild(this.formContainer);
		}
		if (this.adjustFormToCanvas) {
			window.removeEventListener('resize', this.adjustFormToCanvas);
		}
	}

	// Add method to load and display leaderboard data
	async loadLeaderboardData(x, startY, panelWidth) {
		try {
			let leaderboardData = [];
			
			// Check if supabaseService is available
			if (window.supabaseService) {
				// Get top 10 players sorted by score in descending order
				const { data, error } = await window.supabaseService.supabase
					.from('poli_quest_tabel')
					.select('nick_name, score')
					.order('score', { ascending: false })
					.limit(10);
				if (error) {
					console.error("Error fetching leaderboard data:", error);
				} else {
					leaderboardData = data;
					console.log("Leaderboard data loaded:", leaderboardData);
				}
			} else {
				console.warn("Supabase service not available");
			}
			// Display the data in the leaderboard
			this.displayLeaderboardData(leaderboardData, x, startY, panelWidth);
		} catch (error) {
			console.error("Error in loadLeaderboardData:", error);
		}
	}

	// Add method to display leaderboard entries
	displayLeaderboardData(leaderboardData, x, startY, panelWidth) {
		const spacing = 35; // Reduced from 40 to 35 to fit more entries
		
		// Clear any existing leaderboard entries
		if (this.leaderboardEntries) {
			this.leaderboardEntries.forEach(entry => entry.destroy());
		}
		this.leaderboardEntries = [];

		// If no data or empty array, show a message
		if (!leaderboardData || leaderboardData.length === 0) {
			const noDataText = this.add.text(
				x + panelWidth / 2,
				startY + 30,
				"No data available",
				{
					fontFamily: 'ApexMk2-BoldExtended, Arial',
					fontSize: '16px',
					color: '#ffffff',
					align: 'center'
				}
			);
			noDataText.setOrigin(0.5, 0);
			this.leaderboardEntries.push(noDataText);
			// Add the text to the leaderboard group
			if (this.leaderboardGroup) {
				this.leaderboardGroup.add(noDataText);
			}
			return;
		}

		// Display each entry without animations
		leaderboardData.forEach((entry, index) => {
			// Add rank number (1-10)
			const rankText = this.add.text(
				x + 15,
				startY + index * spacing,
				`${index + 1}`,
				{
					fontFamily: 'ApexMk2-BoldExtended, Arial',
					fontSize: '14px',
					color: '#ffffff'
				}
			);
			
			// Nickname text (left-aligned)
			const nickname = entry.nick_name || "Anonymous";
			const displayName = nickname.length > 10 ? nickname.substring(0, 9) + "..." : nickname;
			const nameText = this.add.text(
				x + 35, // Moved right to make room for rank number
				startY + index * spacing,
				displayName,
				{
					fontFamily: 'ApexMk2-BoldExtended, Arial',
					fontSize: '16px',
					color: '#ffffff'
				}
			);

			// Score text (right-aligned)
			const scoreText = this.add.text(
				x + panelWidth - 40,
				startY + index * spacing,
				entry.score.toString(),
				{
					fontFamily: 'ApexMk2-BoldExtended, Arial',
					fontSize: '16px',
					color: '#ffffff'
				}
			);
			scoreText.setOrigin(1, 0); // Right align the score

			this.leaderboardEntries.push(rankText, nameText, scoreText);

			// Add entries to group without animations
			if (this.leaderboardGroup) {
				this.leaderboardGroup.add(rankText);
				this.leaderboardGroup.add(nameText);
				this.leaderboardGroup.add(scoreText);
			}
		});
		
		// Add a note at the bottom if we have 10 entries
		if (leaderboardData.length === 10) {
			const bottomNote = this.add.text(
				x + panelWidth / 2,
				startY + 10 * spacing + 5,
				"Top 10 Players",
				{
					fontFamily: 'ApexMk2-BoldExtended, Arial',
					fontSize: '12px',
					color: '#aaaaaa',
					align: 'center'
				}
			);
			bottomNote.setOrigin(0.5, 0);
			this.leaderboardEntries.push(bottomNote);
			if (this.leaderboardGroup) {
				this.leaderboardGroup.add(bottomNote);
			}
		}
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
