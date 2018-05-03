/**
 * Author: Alexander Zhu
 * Date Created: May 3, 2018
 * Description: Storage functions for Big Data Clicker.
 */

/** Save player state to local storage. */
function save() {
	localStorage.setItem(strings.savedPlayer, JSON.stringify(player));
}

/** Load player state from local storage. */
function load() {
	$.extend(true, player, JSON.parse(localStorage.getItem(strings.savedPlayer)));
}

/** Wipe player state from local storage. */
function wipe() {
    var confirmation = confirm("Are you sure you want to permanently erase your savefile?");
    if (confirmation === true) {
        init();
        localStorage.setItem(strings.savedPlayer, JSON.stringify(player));
        updateAll();
    }
}