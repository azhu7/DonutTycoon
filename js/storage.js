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

	// Synchronize constants.upgrades levels with loaded levels
	for (var i = 0; i < constants.upgrades.length; i++) {
		constants.upgrades[i].current = player.upgradeLevels[i];
	}
}

/** Load player state from local storage. */
function load() {
	$.extend(true, player, JSON.parse(localStorage.getItem(constants.savedPlayer)));
	fixLoadedObjects();
}

/** Wipe player state from local storage. */
function wipe() {
    var confirmation = confirm("Are you sure you want to permanently erase your savefile?");
    if (confirmation === true) {
        createNewPlayer();
        localStorage.setItem(constants.savedPlayer, JSON.stringify(player));
        startNight();
        $("#defaultOpen").click();
    }
}