import Level from "./scenes/Level.js";
import Preload from "./scenes/Preload.js";
import Home from "./scenes/Home.js";
import GameOver from "./scenes/GameOver.js";
import SupabaseService from "./services/SupabaseService.js";

window.addEventListener('load', function () {
	// Make Supabase service globally accessible
	window.supabaseService = SupabaseService;
	
	var game = new Phaser.Game({
		width: 1280,
		height: 720,
		type: Phaser.AUTO,
        backgroundColor: "#242424",
		scale: {
			mode: Phaser.Scale.FIT,
			autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
		},
		physics: {
			default: "arcade",
			arcade: {
				gravity: { y: 5000 },
				//debug: true
				debug: false
			}
		}
	});

	game.scene.add("Preload", Preload, true);
	game.scene.add("Level", Level);
	game.scene.add("Home", Home);
	game.scene.add("GameOver", GameOver);
});


