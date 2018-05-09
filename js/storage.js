/**
 * Author: Alexander Zhu
 * Date Created: May 3, 2018
 * Description: Storage functions for Big Data Clicker.
 */

/** Save player state to local storage. */
function save() {
	// Save upgrade levels
	for (var i = 0; i < constants.upgrades.length; i++) {
		player.upgradeLevels[i] = constants.upgrades[i].current;
	}

	localStorage.setItem(constants.savedPlayer, JSON.stringify(player, setToJSON));
}

/**
 * Turn Objects back to their respective classes as converting to/from JSON
 * loses class identity.
 */
function fixLoadedObjects() {
	player.unlockedDonuts = new Set(player.unlockedDonuts);
	player.lockedDonuts = new Set(player.lockedDonuts);
}

/** Load player state from local storage. */
function load() {
	logger.info("load(): Loading player.");
	$.extend(true, player, JSON.parse(localStorage.getItem(constants.savedPlayer)));
	fixLoadedObjects();
	player.currentTab = null;  // Clear this so that first tab always loads
	logger.info("load(): Loaded player.");
	logger.info({player: player});
}

/** Wipe player state from local storage. */
function wipe() {
    var confirmation = confirm("Are you sure you want to permanently erase your savefile?");
    if (confirmation === true) {
    	logger.info("wipe(): Wiping player save.");
    	if (debug.autosave) {
    		// Make sure we don't save between clearing storage and initializing player
    		clearInterval(player.saveIntervalId);
    	}

    	localStorage.removeItem(constants.savedPlayer);
        initApplication();
        logger.info("wipe(): Done wiping. Started new game.");
    }
}

/**
 * Reset all upgrades. Used when wiping player data. Must do this because
 * upgrades are stored in constants...
 */
function resetUpgrades() {
	constants.upgrades.forEach(upgrade => {
		upgrade.current = 0;
	});
}
